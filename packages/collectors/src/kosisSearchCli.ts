/**
 * KOSIS 통계표 **찾기** — "무슨 표를 써야 하나"를 추측으로 메우지 않기 위한 배관.
 *   KOSIS_API_KEY=xxx tsx src/kosisSearchCli.ts --q "소비자물가" [--out data/kosis-search.md]
 *
 * ── 왜 이게 필요한가 (2026-08-12)
 * 지금까지 표 ID 는 **웹 검색결과에 뜬 제목까지만** 확인하고 `confidence: "추정"` 으로 박아 왔다.
 * kosis.kr 본문이 robots 로 막혀 세션에서 목록을 못 열기 때문이다. 그 결과가 사망표 사인축 사고였고,
 * 새 소재가 들어올 때마다 세션이 "표 ID 를 모르겠다 / 키를 달라"고 오너에게 되묻는 일이 반복됐다.
 *
 * **KOSIS 는 통계표 목록·검색도 같은 인증키로 API 를 연다.** 키는 이미 Secrets 에 있다.
 * 그러니 찾는 일도 사람이 아니라 코드가 한다 — 이 CLI 가 키워드로 표를 훑어
 * `orgId · tblId · 통계표명 · 수록기간` 을 마크다운으로 적어 커밋한다.
 * 그 다음은 기존 절차 그대로다: `sources/kosis.ts` 의 TABLES 에 `enabled:false` 로 넣고 → probe → 켠다.
 *
 * ── 규격이 확실하지 않은 것은 '시도하고 기록한다'
 * KOSIS 문서의 목록/검색 엔드포인트는 파라미터 이름이 판본마다 다르게 소개된다.
 * 그래서 **후보 조합을 순서대로 찔러 보고, 무엇이 통했고 무엇이 어떻게 실패했는지 전부 적는다.**
 * 추측을 코드에 박아 두지 않는 것이 이 저장소의 방식이다(probe 와 같은 태도).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fetchText } from "./http.js";
import { encKey } from "./sources/kosis.js";

const CWD = process.env.INIT_CWD || process.cwd();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

type Attempt = {
  label: string;
  url: string;      // 키를 지운 URL
  ok: boolean;
  note: string;
  rows?: Record<string, unknown>[];
};

/** 로그·파일에 URL 을 남길 때 인증키를 지운다. 키가 쿼리에 들어가는 API 다. */
function redact(url: string): string {
  return url.replace(/(apiKey=)[^&]*/i, "$1<hidden>");
}

/** KOSIS 는 오류도 200 으로 준다. `{err, errMsg}` 꼴이면 실패다. */
function errOf(json: unknown): string | null {
  if (json && typeof json === "object" && !Array.isArray(json)) {
    const o = json as Record<string, unknown>;
    if (o.err || o.errMsg || o.ERR || o.errCd) {
      return String(o.errMsg ?? o.err ?? o.errCd ?? "알 수 없는 오류");
    }
  }
  return null;
}

async function tryUrl(label: string, url: string): Promise<Attempt> {
  const shown = redact(url);
  try {
    const text = await fetchText(url, { timeoutMs: 30000 });
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return { label, url: shown, ok: false, note: `JSON 이 아니다 — ${text.slice(0, 200)}` };
    }
    const e = errOf(json);
    if (e) return { label, url: shown, ok: false, note: `KOSIS 오류 응답 — ${e}` };
    if (!Array.isArray(json)) {
      return { label, url: shown, ok: false, note: `배열이 아니다 — ${JSON.stringify(json).slice(0, 200)}` };
    }
    const rows = json as Record<string, unknown>[];
    if (rows.length === 0) return { label, url: shown, ok: false, note: "0건 — 통했지만 결과가 없다" };
    return { label, url: shown, ok: true, note: `${rows.length}건`, rows };
  } catch (x) {
    return { label, url: shown, ok: false, note: `요청 실패 — ${String((x as Error)?.message ?? x)}` };
  }
}

/**
 * 후보 엔드포인트. 통하는 것이 나오면 거기서 멈춘다.
 * 통계표 검색(statisticsSearch.do)이 첫째, 목록 조회(statisticsList.do)가 둘째다.
 */
function candidates(key: string, q: string): { label: string; url: string }[] {
  const k = encKey(key);
  const nm = encodeURIComponent(q);
  return [
    {
      label: "통계표 검색 statisticsSearch.do (searchNm)",
      url: `https://kosis.kr/openapi/statisticsSearch.do?method=getList&apiKey=${k}&searchNm=${nm}&format=json&jsonVD=Y`,
    },
    {
      label: "통계표 검색 statisticsSearch.do (searchNm + 통계표만)",
      url: `https://kosis.kr/openapi/statisticsSearch.do?method=getList&apiKey=${k}&searchNm=${nm}&startCount=1&resultCount=100&sort=RANK&format=json&jsonVD=Y`,
    },
    {
      label: "통계목록 statisticsList.do (vwCd=MT_ZTITLE 최상위)",
      url: `https://kosis.kr/openapi/statisticsList.do?method=getList&apiKey=${k}&vwCd=MT_ZTITLE&parentListId=&format=json&jsonVD=Y`,
    },
  ];
}

/** 응답 행에서 사람이 볼 다섯 칸만 고른다. 필드명이 판본마다 달라 여러 이름을 훑는다. */
function pick(r: Record<string, unknown>): {
  orgId: string; tblId: string; tblNm: string; prd: string; listId: string;
} {
  const s = (...names: string[]): string => {
    for (const n of names) {
      const v = r[n];
      if (v !== undefined && v !== null && String(v) !== "") return String(v);
    }
    return "";
  };
  return {
    orgId: s("ORG_ID", "orgId"),
    tblId: s("TBL_ID", "tblId"),
    tblNm: s("TBL_NM", "tblNm", "STAT_NM", "statNm"),
    prd: [s("PRD_SE", "prdSe"), s("PRD_DE", "prdDe"), s("REC_TBL_SE")].filter(Boolean).join(" "),
    listId: s("LIST_ID", "listId", "VW_CD", "vwCd"),
  };
}

async function main() {
  const apiKey = process.env.KOSIS_API_KEY;
  if (!apiKey) {
    console.error("❌ KOSIS_API_KEY 가 없습니다 — 이 CLI 는 Actions 안에서 돕니다.");
    process.exit(1);
  }

  /* 키워드는 여러 개를 쉼표로 받는다 — 한 번 돌 때 여러 소재를 같이 훑는 편이 왕복이 적다. */
  const qs = (arg("q") ?? "소비자물가").split(",").map((s) => s.trim()).filter(Boolean);
  const out = resolve(CWD, arg("out") ?? "data/kosis-search.md");

  const L: string[] = [];
  L.push("# KOSIS 통계표 찾기 결과");
  L.push("");
  L.push("> 표 ID 를 **추측하지 않기 위한** 파일이다. 키워드로 KOSIS 통계표를 훑어 적었다.");
  L.push("> 쓸 표를 고르면 `packages/collectors/src/sources/kosis.ts` 의 `TABLES` 에");
  L.push("> **`enabled: false` · `confidence: \"표명확실\"`** 로 넣고 → `data/kosis-probe-queue.txt` 푸시(probe) → 켠다.");
  L.push("");
  L.push(`- 실행 시각(KST): ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`);
  L.push(`- 키워드: ${qs.join(" · ")}`);
  L.push("");

  let anyOk = false;

  for (const q of qs) {
    L.push(`## 「${q}」`);
    L.push("");
    const attempts: Attempt[] = [];
    let hit: Attempt | null = null;

    for (const c of candidates(apiKey, q)) {
      process.stdout.write(`· ${q} — ${c.label} … `);
      const a = await tryUrl(c.label, c.url);
      attempts.push(a);
      console.log(a.ok ? `OK ${a.note}` : `실패 — ${a.note.slice(0, 120)}`);
      if (a.ok) { hit = a; break; }
    }

    L.push("### 시도한 조합");
    L.push("");
    L.push("| 조합 | 결과 |");
    L.push("|---|---|");
    for (const a of attempts) L.push(`| ${a.label} | ${a.ok ? "✅ " : "❌ "}${a.note.replace(/\|/g, "\\|").slice(0, 200)} |`);
    L.push("");

    if (!hit) {
      L.push("**통한 조합이 없다.** 위 실패 문구를 그대로 읽고 파라미터를 고친다 — 추측해서 표를 박지 않는다.");
      L.push("");
      continue;
    }
    anyOk = true;

    /* 키워드가 이름에 실제로 들어간 것을 위로 올린다. 목록 조회로 통한 경우 전체가 오기 때문이다. */
    const rows = (hit.rows ?? []).map(pick).filter((r) => r.tblId || r.tblNm);
    const matched = rows.filter((r) => r.tblNm.includes(q));
    const shown = (matched.length ? matched : rows).slice(0, 120);

    L.push(`### 찾은 통계표 (${matched.length ? `이름에 「${q}」 포함 ${matched.length}건` : `${rows.length}건 전체`} 중 ${shown.length}건)`);
    L.push("");
    L.push("| orgId | tblId | 통계표명 | 주기·시점 | 목록 |");
    L.push("|---|---|---|---|---|");
    for (const r of shown) {
      L.push(`| ${r.orgId} | \`${r.tblId}\` | ${r.tblNm.replace(/\|/g, "\\|")} | ${r.prd} | ${r.listId} |`);
    }
    L.push("");
  }

  L.push("---");
  L.push("");
  L.push("### 다음 단계");
  L.push("");
  L.push("1. 위 표에서 쓸 `tblId` 를 고른다 (**이름이 정확히 맞는 것만** — 비슷한 이름의 표가 여럿이다)");
  L.push("2. `sources/kosis.ts` 의 `TABLES` 에 `enabled: false` 로 추가");
  L.push("3. `data/kosis-probe-queue.txt` 에 한 줄 덧붙여 푸시 → `data/kosis-probe.md` 에서 항목코드·분류축 확인");
  L.push("4. 스펙 확정 후 `enabled: true` + 셀프테스트 통과");

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, L.join("\n") + "\n", "utf8");
  console.log(`\n📝 ${out}`);

  if (!anyOk) {
    console.error("❌ 어떤 키워드도 통하지 않았다 — 결과 파일의 '시도한 조합' 을 읽는다.");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
