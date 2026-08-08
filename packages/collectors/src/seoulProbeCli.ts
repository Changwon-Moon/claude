/**
 * 서울 열린데이터광장 서비스 검증(probe) — **이 서비스가 진짜 우리가 생각한 그것인지** 찍어 본다.
 *
 * ── 왜 필요한가
 * KOSIS 에서 배운 것을 그대로 적용한다. 표 ID 를 검색결과 제목까지만 확인하고 수집을 돌렸다가
 * 축 순서·코드 체계·기간 형식에서 연달아 걸렸다. 서울시 API 도 같다:
 *   · 컬럼명을 모른다 — 중국/중국외 구분이 무슨 이름인지
 *   · '총생활인구수' 가 전체 인구인지 외국인 합계인지 모른다 ← **분모가 바뀌면 비율이 통째로 달라진다**
 *   · 행정동코드가 우리 지도와 같은 체계인지 모른다
 *
 * 그래서 **5행만** 받아 컬럼 이름과 값 몇 개를 `data/seoul-probe.md` 에 적어 커밋한다.
 * 세션은 Actions 로그를 못 보므로 **이 파일이 유일한 눈이다.**
 *
 * 실행: SEOUL_OPENAPI_KEY=xxx tsx src/seoulProbeCli.ts [--date 20260801]
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { SERVICES, fetchRows, redactSeoulUrl, type ServiceKey } from "./sources/seoulOpenApi.js";

const CWD = process.env.INIT_CWD || process.cwd();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** Open API 는 최근 2개월만 준다. 기본값은 넉넉히 4일 전으로 — 공개가 4일 늦기 때문이다. */
function defaultDate(): string {
  const d = new Date(Date.now() - 6 * 86400000);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}

async function main() {
  const apiKey = process.env.SEOUL_OPENAPI_KEY;
  if (!apiKey) {
    console.error("❌ SEOUL_OPENAPI_KEY 가 없습니다.");
    console.error("   data.seoul.go.kr → 마이페이지 → 인증키 신청(즉시 발급) 후");
    console.error("   Secrets 에 SEOUL_OPENAPI_KEY 로 등록하세요.");
    process.exit(1);
  }
  const date = arg("date") || defaultDate();
  const out = resolve(CWD, arg("out") ?? "data/seoul-probe.md");

  const L: string[] = [];
  L.push("# 서울 열린데이터광장 서비스 검증 결과");
  L.push("");
  L.push(`> 기준일 \`${date}\` · 서비스마다 5행만 받아 **컬럼 이름과 값**을 확인한 것이다.`);
  L.push("> 세션은 Actions 로그를 못 보므로 이 파일이 유일한 눈이다.");
  L.push("> **맞다고 확인되면 `sources/seoulOpenApi.ts` 의 `enabled` 를 켠다.**");
  L.push("");

  let okN = 0;
  const keys = Object.keys(SERVICES) as ServiceKey[];

  for (const k of keys) {
    const s = SERVICES[k];
    L.push(`## ${k} — ${s.label}`);
    L.push("");
    L.push(`- 서비스명: \`${s.service || "(미확인)"}\` · 확신도 ${s.confidence}${s.enabled ? " · 수집중" : " · 대기"}`);
    L.push(`- 메모: ${s.note.split("\n")[0]}`);

    if (!s.service) {
      L.push("- ⏸ **서비스명을 모른다** — 데이터셋 페이지의 'Open API' 탭에서 확인해 채울 것");
      L.push("");
      console.log(`· ${k} … 건너뜀(서비스명 미확인)`);
      continue;
    }

    process.stdout.write(`· ${k} (${s.service}) … `);
    try {
      const { rows, total } = await fetchRows(k, apiKey, { start: 1, end: 5, date });
      okN++;
      console.log(`OK ${rows.length}행 (전체 ${total.toLocaleString()}행)`);

      const cols = Object.keys(rows[0] ?? {});
      L.push(`- ✅ 응답 확인 — **전체 ${total.toLocaleString()}행** · 컬럼 ${cols.length}개`);
      L.push("");
      L.push(`**컬럼 목록** — 중국/중국외 구분이 어느 이름인지, 분모로 쓸 총계가 무엇인지 여기서 고른다`);
      L.push("");
      L.push("```");
      L.push(cols.join(", "));
      L.push("```");
      L.push("");
      L.push("**첫 행 원본** — 행정동코드가 우리 지도와 같은 체계인지 눈으로 본다");
      L.push("");
      L.push("```json");
      L.push(JSON.stringify(rows[0], null, 2));
      L.push("```");
      L.push("");
      /* 1,000행 제한 때문에 몇 번 나눠 불러야 하는지 미리 적어 둔다. */
      L.push(`- 하루치를 받으려면 **${Math.ceil(total / 1000)}번** 나눠 불러야 한다(1,000행 제한)`);
    } catch (e) {
      const msg = redactSeoulUrl(e instanceof Error ? e.message : String(e));
      console.log(`실패 — ${msg.slice(0, 120)}`);
      L.push(`- ❌ **실패**: ${msg}`);
    }
    L.push("");
  }

  L.push("---");
  L.push("");
  L.push("⚠️ **이 파일을 보고 판단할 것**");
  L.push("");
  L.push("1. 중국인 구분 컬럼이 무엇인가 (중국 / 중국 외 두 갈래일 것)");
  L.push("2. **'총생활인구수' 가 전체 인구인가, 외국인 합계인가** ← 분모가 바뀌면 비율이 통째로 달라진다");
  L.push("3. 행정동코드가 우리 지도(`data/geo/`)와 같은 체계인가 — 다르면 대조표가 필요하다");
  L.push("4. 시간대 컬럼이 있는가 — 생활인구는 시간별이라 **어느 시간을 쓸지 정해야 한다**");

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, L.join("\n") + "\n", "utf8");
  console.log(`\n✅ ${okN}/${keys.length} 서비스 응답 확인 → ${out}`);
  if (okN < keys.filter((k) => SERVICES[k].service).length) process.exit(1);
}

main().catch((e) => {
  console.error(`❌ 검증 실패: ${redactSeoulUrl(e instanceof Error ? e.message : String(e))}`);
  process.exit(1);
});
