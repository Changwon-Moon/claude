/**
 * 나이스(NEIS) 학원·교습소 수집 CLI (Actions에서 실행 — 네트워크·키 필요).
 *   NEIS_API_KEY=xxx tsx src/neisAcademyCli.ts --sido B10,J10 [--out dir] [--force]
 *
 * 산출: <out>/{시도교육청코드}.json — **법정동 단위 집계**.
 *   { meta, rows: [{ sido, sgg, dong, aca, gyoseup, total, ipsi, ipsiJeongwon, jeongwon }] }
 *
 * ── 왜 집계만 저장하나
 * 원장은 10만 건이 넘고, 카드에 쓰는 건 "학군지별 보습·입시 학원 수"다. 원본을 통째로
 * 커밋하면 저장소가 무거워지고 전화번호까지 따라온다. 세는 일은 **여기 코드가** 한다(오보 0).
 *
 * ── 지역을 어떻게 가르나
 * ADMST_ZONE_NM 은 경기에서 '가평군'처럼 **시군** 단위라 '성남시 분당구'를 가리지 못한다.
 * 그래서 시군구는 도로명주소(FA_RDNMA)의 앞 토큰에서 뽑고, **법정동은 도로명 상세(FA_RDNDA)의
 * 괄호 안 참고항목**에서 뽑는다 — 도로명주소 표기법이 괄호에 법정동을 적게 되어 있다.
 *   "서울특별시 강남구 삼성로 150" + ", 158호(대치동,한보종합상가)" → 강남구 · 대치동
 * 못 뽑은 행은 버리지 않고 **몇 건인지 세어 meta 에 남긴다** — 커버리지를 모르면 숫자를 못 믿는다.
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fetchText } from "./http.js";
import { inspectKey, describeKey } from "./keyHygiene.js";
import { sggOf, dongOf } from "./parse/neisAcademy.js";

const CWD = process.env.INIT_CWD || process.cwd();
const BASE = "https://open.neis.go.kr/hub/acaInsTiInfo";
const PAGE = 1000;

/** 코드→교육청명. 이름은 **응답과 대조**해 코드가 밀리면 즉시 멈춘다(오보 0). */
const SIDO: Record<string, string> = {
  B10: "서울특별시교육청",
  C10: "부산광역시교육청",
  D10: "대구광역시교육청",
  E10: "인천광역시교육청",
  F10: "광주광역시교육청",
  G10: "대전광역시교육청",
  H10: "울산광역시교육청",
  I10: "세종특별자치시교육청",
  J10: "경기도교육청",
  N10: "충청남도교육청",
  T10: "제주특별자치도교육청",
};

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

type Agg = { sido: string; sgg: string; dong: string; aca: number; gyoseup: number; total: number; ipsi: number; ipsiJeongwon: number; jeongwon: number };

async function fetchPage(code: string, key: string, pIndex: number): Promise<any[]> {
  const url = `${BASE}?KEY=${encodeURIComponent(key)}&Type=json&pIndex=${pIndex}&pSize=${PAGE}&ATPT_OFCDC_SC_CODE=${code}`;
  const raw = await fetchText(url, { timeoutMs: 30000 });
  let doc: any;
  try { doc = JSON.parse(raw); } catch { throw new Error(`JSON 이 아닌 응답(앞 120자): ${raw.slice(0, 120)}`); }
  if (doc.RESULT) throw new Error(`API 오류 ${doc.RESULT.CODE}: ${doc.RESULT.MESSAGE}`);
  const body = doc.acaInsTiInfo;
  if (!Array.isArray(body)) throw new Error(`예상과 다른 응답 구조: ${Object.keys(doc).join(",")}`);
  const head = body[0]?.head?.[1]?.RESULT;
  if (head && head.CODE !== "INFO-000") throw new Error(`API 오류 ${head.CODE}: ${head.MESSAGE}`);
  return body[1]?.row ?? [];
}

async function main() {
  const rep = inspectKey(process.env.NEIS_API_KEY);
  if (!rep.key) { console.error("NEIS_API_KEY 환경변수가 없습니다 (GitHub Secrets 에 등록)."); process.exit(1); }
  console.log(describeKey("NEIS_API_KEY", rep));

  const sidoArg = arg("sido") ?? Object.keys(SIDO).join(",");
  const codes = sidoArg.split(",").map((s) => s.trim()).filter(Boolean);
  const outDir = resolve(CWD, arg("out") ?? "data/datasets/neis-academy");
  const force = process.argv.includes("--force");
  mkdirSync(outDir, { recursive: true });

  let okSido = 0, failed = 0;
  for (const code of codes) {
    const want = SIDO[code];
    if (!want) { console.error(`❌ 모르는 시도교육청 코드: ${code}`); failed++; continue; }
    const outPath = join(outDir, `${code}.json`);
    if (existsSync(outPath) && !force) { console.log(`· 캐시 스킵 ${code} ${want}`); continue; }

    try {
      const map = new Map<string, Agg>();
      let raw = 0, noDong = 0, noSgg = 0, page = 1;
      let seenName = "";
      for (;;) {
        const rows = await fetchPage(code, rep.key, page);
        if (!rows.length) break;
        for (const r of rows) {
          raw++;
          if (!seenName) seenName = String(r.ATPT_OFCDC_SC_NM || "");
          const sgg = sggOf(r.FA_RDNMA);
          const dong = dongOf(r.FA_RDNDA);
          if (!sgg) noSgg++;
          if (!dong) { noDong++; continue; }
          const k = `${sgg}|${dong}`;
          let a = map.get(k);
          if (!a) { a = { sido: want, sgg, dong, aca: 0, gyoseup: 0, total: 0, ipsi: 0, ipsiJeongwon: 0, jeongwon: 0 }; map.set(k, a); }
          const isAca = String(r.ACA_INSTI_SC_NM || "").includes("학원");
          const jw = Number(r.TOFOR_SMTOT) || 0;
          // 분야명은 응답에 '입시.검정 및 보습' 으로 온다. 점·공백이 흔들려도 걸리게 느슨히 본다.
          const isIpsi = /입시.*보습|보습/.test(String(r.REALM_SC_NM || ""));
          a.total++; a.jeongwon += jw;
          if (isAca) a.aca++; else a.gyoseup++;
          if (isIpsi) { a.ipsi++; a.ipsiJeongwon += jw; }
        }
        if (rows.length < PAGE) break;
        page++;
      }
      if (seenName && seenName !== want)
        throw new Error(`코드-이름이 어긋납니다: ${code} 를 ${want} 로 알고 있었는데 응답은 "${seenName}" 입니다.`);

      const rows = [...map.values()].sort((a, b) => b.ipsi - a.ipsi || a.sgg.localeCompare(b.sgg));
      writeFileSync(
        outPath,
        JSON.stringify(
          {
            meta: {
              sidoCode: code,
              sido: want,
              source: "나이스 교육정보 개방 포털 — 학원교습소정보(acaInsTiInfo)",
              sourceUrl: "https://open.neis.go.kr/portal/data/service/selectServicePage.do?infId=OPEN19220231012134453534385",
              collectedAt: new Date().toISOString().slice(0, 10),
              verified: true,
              rawCount: raw,
              dongMatched: raw - noDong,
              dongMissing: noDong,
              sggMissing: noSgg,
              coverage: raw ? Math.round(((raw - noDong) / raw) * 1000) / 10 : 0,
              note:
                "행별 집계다(원장 미보존). aca=학원 · gyoseup=교습소 · ipsi=분야가 '입시.검정 및 보습' 인 곳 · " +
                "jeongwon=정원합계(TOFOR_SMTOT) 합. 시군구는 도로명주소에서, 법정동은 도로명 상세의 괄호 참고항목에서 뽑았다. " +
                "괄호에 법정동이 없는 행(dongMissing)은 집계에서 빠졌다 — coverage 를 보고 숫자를 읽어야 한다. " +
                "등록상태(개원/휴원/폐원)는 가리지 않았다 — 원장에 남은 곳을 모두 센다.",
            },
            rows,
          },
          null,
          2,
        ) + "\n",
      );
      console.log(`✅ ${code} ${want} — 원장 ${raw.toLocaleString()}건 · 법정동 확인 ${(raw - noDong).toLocaleString()}건(${Math.round(((raw - noDong) / raw) * 1000) / 10}%) · 동 ${rows.length}곳 → ${code}.json`);
      okSido++;
    } catch (e) {
      console.error(`❌ ${code} ${want}: ${e instanceof Error ? e.message : e}`);
      failed++;
    }
  }
  console.log(`\n요약: 시도 ${okSido}곳 수집 · 실패 ${failed}`);
  if (okSido === 0 && failed > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
