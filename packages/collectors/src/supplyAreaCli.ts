/**
 * 🏗️ 공급면적 수집기 — 건축물대장 전유공용면적 → `data/datasets/apt-supply/{kaptCode}-{타입}.json`
 *
 * 오너 2026-08-16d: **"전용 59, 84로만 단지서칭은 하되, 카드를 만들때에는 실제 공급평수를 적어줘야지."**
 * 서칭·판정은 전용면적 그대로 두고, **카드 제목의 평만** 이 값으로 바꾼다.
 *
 * 셈법과 근거는 `sources/supplyArea.ts` 머리말에 있다(네이버부동산 표기와 대조 완료).
 *
 * 실행:
 *   tsx src/supplyAreaCli.ts --kapt A44340013 --area 84.92 [--out data/datasets/apt-supply]
 *   키: DATA_GO_KR_API_KEY (MOLIT_API_KEY 아님 — 건축물대장은 이쪽으로 열린다)
 *
 * 법정동코드·지번은 **저장소에 이미 있다** — 새로 붙일 것이 없다:
 *   · bjdCode : `data/datasets/apt-list/{시군구}.json` 의 `bjdCode`(10자리)
 *   · 지번    : `data/datasets/singo-log/{YYYY-MM}.json` 의 `jibun`
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { supplyAreaOf } from "./sources/supplyArea.js";
/* 게이트웨이 오류 분류의 **정본은 parse/molit.ts** 하나다 — 수집기마다 따로 적으면 갈라진다.
   실제로 실거래엔 재시도가 있고 여기엔 없어서 09-02 에 한쪽만 죽었다. */
import { RETRIABLE_BODY, TERMINAL_BODY } from "./parse/molit.js";

const arg = (n: string) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : "";
};

const KEY = process.env.DATA_GO_KR_API_KEY || process.env.MOLIT_API_KEY || "";
const KAPT = arg("kapt");
const AREA = Number(arg("area"));
const OUT = arg("out") || "data/datasets/apt-supply";

/* ⚠️ `process.cwd()` 를 쓰지 않는다 — 이 저장소의 알려진 함정이다.
   `pnpm --filter @wirit/collectors …` 로 부르면 **작업 폴더가 packages/collectors 로 바뀐다.**
   그러면 data/datasets 를 못 찾고 "apt-universe 를 먼저 받으세요"라는 엉뚱한 말을 하게 된다
   (2026-08-16d 에 실제로 6건 전부 이 이유로 실패했다).
   모듈 위치에서 저장소 뿌리를 거슬러 올라간다 — 어디서 불러도 같다. */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

if (!KEY) { console.error("::error::DATA_GO_KR_API_KEY 가 없습니다 (건축물대장은 이 키로 열립니다)"); process.exit(1); }
if (!/^A\d+$/.test(KAPT) || !Number.isFinite(AREA)) {
  console.error("::error::사용법: --kapt A44340013 --area 84.92");
  process.exit(1);
}

/* ── 단지코드 → bjdCode(법정동 10자리). 저장소의 단지 목록에서 찾는다 ── */
function bjdOf(kapt: string): { bjd: string; name: string } | null {
  const dir = join(ROOT, "data/datasets/apt-list");
  if (!existsSync(dir)) return null;
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    let items: any[];
    try {
      const j = JSON.parse(readFileSync(join(dir, f), "utf8"));
      items = Array.isArray(j) ? j : j.items ?? [];
    } catch { continue; }
    const hit = items.find((it) => it.kaptCode === kapt);
    if (hit?.bjdCode) return { bjd: String(hit.bjdCode), name: String(hit.kaptName ?? "") };
  }
  return null;
}

/* ── 단지코드 → 지번 **후보들**
 *
 * ⚠️ 지번이 한 곳에서만 오지 않는다 (2026-08-16d 실측)
 * 대장 주소와 실거래 신고 지번이 **다른 단지가 있다**:
 *   · 서초포레스타2단지 — 대장 `내곡동 143` · 실거래 `내곡동 384`
 *   · 다산롯데캐슬     — 대장 `다산동 5869-2` · 실거래 `다산동 6029`
 * 대장 주소로만 물으면 이 둘은 **줄 0개**로 돌아온다(실제로 그랬다).
 *
 * 어느 쪽이 대지 지번인지는 단지마다 다르므로 **둘 다 후보로 두고 실제로 물어본다.**
 * 줄이 오는 쪽이 맞는 지번이다 — 추측하지 않고 재는 쪽을 고른다. */
function jibunCandidates(kapt: string, aptName: string): string[] {
  const out: string[] = [];
  const push = (v: string) => { const s = String(v ?? "").trim(); if (s && !out.includes(s)) out.push(s); };

  // ① 사람이 준 것이 있으면 그것부터
  push(arg("jibun"));

  // ② 실거래 신고 지번 — 신고가 로그에서 단지명으로 찾는다
  const logDir = join(ROOT, "data/datasets/singo-log");
  if (aptName && existsSync(logDir)) {
    const norm = (s: string) => String(s ?? "").replace(/[\s()·.\-_]/g, "");
    for (const f of readdirSync(logDir).filter((x) => x.endsWith(".json"))) {
      try {
        const j = JSON.parse(readFileSync(join(logDir, f), "utf8"));
        const hits = Array.isArray(j) ? j : j.hits ?? j.items ?? [];
        for (const h of hits) {
          if (!h?.jibun) continue;
          const a = norm(h.aptNm), b = norm(aptName);
          if (a && b && (a.includes(b) || b.includes(a))) push(String(h.jibun));
        }
      } catch { /* 다음 파일 */ }
    }
  }

  // ③ 대장 주소의 지번
  const hh = join(ROOT, "data/datasets/apt-hhld.json");
  if (existsSync(hh)) {
    try {
      const byKapt = JSON.parse(readFileSync(hh, "utf8")).byKapt ?? {};
      const m = String(byKapt[kapt]?.addr ?? "").match(/\s(\d+(?:-\d+)?)\s/);
      if (m) push(m[1]);
    } catch { /* 무시 */ }
  }
  return out;
}

const pad4 = (s: string) => String(s ?? "").replace(/\D/g, "").padStart(4, "0").slice(-4);
const encKey = (k: string) => (/%[0-9A-Fa-f]{2}/.test(k) ? k : encodeURIComponent(k));

/**
 * 실거래 쪽(`sources/molit.ts`)과 **같은 사다리**를 쓴다 — 3번 · 지수 백오프 · 본문 오류도 재시도.
 *
 * ── 왜 맞췄나 (2026-09-02)
 * 08-26 에 「연결 실패도 3번 재시도」를 실거래에 넣으면서 **건축물대장 쪽은 2번 · 평 백오프 ·
 * 본문 오류 무재시도**로 남았다. 그래서 게이트웨이가 아픈 날 같은 시각에
 * **실거래는 살고 공급면적은 절반이 죽었다**(09-02: 25건 중 14건 실패).
 * `SERVICETIMEOUT_ERROR` 는 HTTP **200 몸통**으로 오기 때문에 예전 코드는 그것을 한 번도
 * 다시 묻지 않았다 — 그런데 그건 「다시 밀면 오는 것」의 대표 문구다.
 *
 * ⚠️ **재시도를 세게 했으면 반대쪽이 받아 줘야 한다**(CLAUDE.md §6). 여기선
 * **한도·키 오류를 즉시 포기하는 것**이 그 반대쪽이다 — 안 그러면 한도만 더 태우고 답은 같다.
 * (`SERVICE_KEY_IS_NOT_REGISTERED_ERROR` 는 문구와 달리 **일일 호출 한도**다 — 2026-08-16d)
 */
async function get(url: string): Promise<{ status: number; body: string }> {
  let last = { status: 0, body: "" };
  for (let i = 0; i < 3; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "wirit-collector/0.1" } });
      clearTimeout(t);
      const body = await res.text();
      last = { status: res.status, body };
      if (TERMINAL_BODY.test(body) || res.status === 401 || res.status === 403) return last;
      if (res.status === 200 && !RETRIABLE_BODY.test(body)) return last;
    } catch (e) {
      last = { status: 0, body: `fetch failed: ${String((e as Error)?.message ?? e)}` };
    }
    if (i < 2) await new Promise((r) => setTimeout(r, 2 ** i * 1000));
  }
  return last;
}

function rowsOf(raw: string): any[] {
  try {
    const j = JSON.parse(raw);
    const it = j?.response?.body?.items?.item ?? j?.response?.body?.item;
    if (it) return Array.isArray(it) ? it : [it];
  } catch { /* XML 로 넘어간다 */ }
  const out: any[] = [];
  for (const m of raw.matchAll(/<item>[\s\S]*?<\/item>/g)) {
    const o: any = {};
    for (const f of m[0].matchAll(/<([A-Za-z0-9_]+)>([\s\S]*?)<\/\1>/g)) o[f[1]] = f[2].trim();
    out.push(o);
  }
  return out;
}
const totalOf = (raw: string) => {
  try { return Number(JSON.parse(raw)?.response?.body?.totalCount) || 0; } catch { /* XML */ }
  return Number(raw.match(/<totalCount>(\d+)<\/totalCount>/)?.[1] || 0);
};

async function main() {
  const info = bjdOf(KAPT);
  if (!info) { console.error(`::error::${KAPT} 를 data/datasets/apt-list 에서 못 찾았습니다 — apt-universe 를 먼저 받으세요`); process.exit(1); }
  const cands = jibunCandidates(KAPT, info.name);
  if (!cands.length) { console.error(`::error::${KAPT} 의 지번 후보를 못 찾았습니다 — --jibun 으로 직접 주세요`); process.exit(1); }

  const sigunguCd = info.bjd.slice(0, 5), bjdongCd = info.bjd.slice(5, 10);
  console.log(`▶ ${info.name} (${KAPT}) · 전용 ${AREA}㎡ · ${sigunguCd}-${bjdongCd} · 지번 후보 ${cands.join(", ")}`);

  /* 후보를 차례로 물어보고 **줄이 오는 지번**을 쓴다. 추측하지 않고 잰다. */
  let all: any[] = [];
  let usedJibun = "";
  /* ⚠️ **대지구분(`platGbCd`)도 후보로 돈다** (2026-08-28)
   *
   * 예전엔 `platGbCd=0`(일반 대지)만 물어봤다. 산번지·블록으로 등재된 단지는 지번이 맞아도
   * 「줄 0개」로 떨어질 수 있어 후보를 늘렸다.
   *
   * ⚠️ **솔직히 적어 둔다: 이 폴백은 08-28 의 그 세 건을 고친 것이 아니다.**
   *    힐스테이트상도·하계극동건영벽산은 재시도에서 **`platGbCd=0` 그대로** 성공했다 —
   *    앞선 실패는 지번 문제가 아니라 **건축물대장 API 가 아팠던 것**이었다.
   *    「줄 0개」라는 문구가 그 둘을 같은 얼굴로 보이게 만들었다(§아래).
   *    폴백 자체는 해가 없고 언젠가 값을 하겠지만, **그날의 원인은 아니었다.**
   *
   * 0 = 대지 · 1 = 산 · 2 = 블록. 줄이 오는 첫 조합에서 멈춘다.
   *
   * ⚠️ 「더 많이 찾으니 무조건 좋다」가 아니다 — 같은 번지의 **다른 필지**를 집을 수 있다.
   *    그래서 아래 `supplyAreaOf` 가 **전용면적이 정확히 맞는 호**를 못 찾으면 여전히
   *    파일을 안 만든다. 그리고 어떤 조합으로 받았는지 로그와 meta 에 남긴다 —
   *    나중에 값이 이상하면 무엇을 물어본 결과인지 되짚을 수 있어야 한다. */
  const PLAT_GB = [
    { cd: "0", nm: "대지" },
    { cd: "1", nm: "산" },
    { cd: "2", nm: "블록" },
  ];
  let usedPlat = "0";
  for (const cand of cands.flatMap((j) => PLAT_GB.map((p) => ({ jibun: j, plat: p })))) {
    const jibun = cand.jibun;
    const [bunRaw, jiRaw] = String(jibun).split("-");
    const bun = pad4(bunRaw), ji = pad4(jiRaw ?? "0");
    const rows: any[] = [];
    let total = Infinity;
    for (let page = 1; page <= 30 && rows.length < total; page++) {
      /* ⚠️ 한 쪽에 **1000줄**을 받는다 (2026-08-16d 실측으로 고침)
         100줄로 받았더니 큰 단지 하나에 100번 가까이 호출했고, 6단지를 두 번 돌리자
         공공데이터포털이 `SERVICE_KEY_IS_NOT_REGISTERED_ERROR` 로 막았다 —
         키가 잘못된 게 아니라 **일일 호출 한도**다. 문구가 원인을 가린다.
         1000줄이면 같은 단지를 10번이면 다 받는다. */
      const url = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrExposPubuseAreaInfo`
        + `?serviceKey=${encKey(KEY)}&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}`
        + `&platGbCd=${cand.plat.cd}&bun=${bun}&ji=${ji}&numOfRows=1000&pageNo=${page}&_type=json`;
      const { status, body } = await get(url);
      if (status !== 200 || /SERVICE_KEY_IS_NOT_REGISTERED|LIMITED_NUMBER_OF_SERVICE_REQUESTS/.test(body)) {
        const quota = /SERVICE_KEY_IS_NOT_REGISTERED|LIMITED_NUMBER_OF_SERVICE_REQUESTS/.test(body);
        console.error(quota
          ? `::error::공공데이터포털 **일일 호출 한도**에 걸렸습니다(문구는 SERVICE_KEY_IS_NOT_REGISTERED 로 나오지만 키 문제가 아닙니다). 내일 cron 이 다시 받습니다.`
          : `::error::${jibun} ${page}쪽 실패 — ${body.slice(0, 120)}`);
        process.exit(1);
      }
      if (page === 1) total = totalOf(body) || 0;
      const rs = rowsOf(body);
      if (!rs.length) break;
      rows.push(...rs);
    }
    if (rows.length || cand.plat.cd === "0") {
      console.log(`   지번 ${jibun} (${bun}-${ji}) · ${cand.plat.nm} → 줄 ${rows.length}개`);
    }
    if (rows.length) { all = rows; usedJibun = jibun; usedPlat = cand.plat.cd; break; }
  }
  if (!all.length) {
    /* ⚠️ **「줄 0개」에는 두 얼굴이 있다** (2026-08-28).
     *   ⑴ 그 필지에 정말 대장이 없다 → 지번을 다시 찾아야 한다(사람 일)
     *   ⑵ API 가 아파서 빈 응답을 줬다 → 기다리면 된다(시간 일)
     * 08-28 에 이 둘을 같은 문구로 말하는 바람에 세 단지를 「지번 문제」로 오진했다.
     * 실제로는 두 단지가 **같은 지번 · 같은 대지구분으로** 나중에 그냥 성공했다.
     * 문구가 원인을 가리면 다음 사람이 엉뚱한 곳을 판다 — 그래서 둘을 갈라 말한다. */
    console.error(
      `::error::지번 후보 ${cands.join(", ")} × 대지구분(대지·산·블록) 전부 줄 0개입니다.\n` +
        `   ⚠️ 두 가지가 같은 얼굴로 보입니다 — **지번이 틀렸거나, 대장 API 가 아프거나.**\n` +
        `   먼저 시간을 두고 다시 미세요(2시간마다 cron 이 옵니다). 그래도 0개면 그때\n` +
        `   --jibun 으로 대지 지번을 직접 주세요.`,
    );
    process.exit(1);
  }

  const sa = supplyAreaOf(all, AREA);
  if (!sa) {
    // 지어내지 않는다. 못 찾았으면 파일을 만들지 않는다.
    console.error(`::error::전용 ${AREA}㎡ 에 해당하는 아파트 호를 못 찾았습니다(지번 ${usedJibun}) — 파일을 만들지 않습니다`);
    process.exit(1);
  }

  const type = AREA >= 82 ? "84" : AREA >= 56 ? "59" : String(Math.round(AREA));
  const outDir = join(ROOT, OUT);
  mkdirSync(outDir, { recursive: true });
  const path = join(outDir, `${KAPT}-${type}.json`);
  writeFileSync(path, JSON.stringify({
    kaptCode: KAPT,
    kaptName: info.name,
    type,
    jibun: usedJibun,
    ...sa,
    source: "국토교통부 건축물대장 전유공용면적(getBrExposPubuseAreaInfo)",
    platGbCd: usedPlat, // 0=대지 1=산 2=블록 — 어떤 필지를 물어본 결과인지 남긴다
    note: "공급면적 = 전유 + 「주건축물」 공용. 부속건축물 공용(지하주차장·관리·경비·기계전기)은 기타공용이라 뺀다. "
        + "용도 이름으로 거르지 않는 이유는 「승강기계단」이 '기계'에 걸리는 오탐 때문이다 — mainAtchGbCd 는 대장이 나눠 둔 칸이라 흔들리지 않는다.",
  }, null, 2) + "\n", "utf8");

  console.log(`✅ ${path}`);
  console.log(`   전유 ${sa.exclusive} + 주거공용 ${sa.commonResidential} = 공급 ${sa.supply}㎡ = ${sa.pyeong}평 → **${sa.pyeongLabel}**`);
  console.log(`   표본: ${sa.sampleDong} ${sa.sampleHo} (같은 전용 호 ${sa.sampleCount}개) · 전용률 ${(sa.ratio * 100).toFixed(1)}%`);
  for (const p of sa.parts) console.log(`     · ${p.purpose} [${p.floor}] ${p.area}`);
  if (sa.warn) console.log(`   ⚠️ ${sa.warn}`);
}

main().catch((e) => { console.error(`::error::${String(e?.message ?? e)}`); process.exit(1); });
