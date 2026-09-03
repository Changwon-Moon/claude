/**
 * 송파 시그니처 롯데캐슬 무순위(재공급 1세대) 카드 — **수동 예외 빌더**.
 *
 * ── 왜 이 파일이 따로 있는가
 * `scripts/build-danji.mjs` 의 `remndr()` 은 청약홈 공고번호(applyhomeNo)가 없으면
 * 무조건 던진다(오보 0 가드 — 무순위 카드는 세대수·일정을 청약홈 API 에서 코드가
 * 직접 읽는 게 원칙이라서다). 이 단지는 청약홈 무순위 목록에 **아직 공고번호가
 * 올라오지 않은 재공급 1세대**라 표준 파이프라인을 못 탄다
 * (data/datasets/bunyang-danji-2026.json 의 `songpa-signature-remndr` 항목 `_manual` 필드 참고).
 *
 * 그렇다고 `data/content/{날짜}/danji-songpa.json` 을 손으로 편집한 채 방치하면
 * — data/content 는 .gitignore 대상이라 커밋되지 않는다 — 새 clone·CI 에서는
 * 이 카드가 영영 안 나온다("월급 34평" 사고가 다시 난다, rebuild-cards.mjs 머리말 참고).
 *
 * 그래서 최종 승인된 카드 JSON 을 **이 스크립트(커밋 대상)에 고정**해 두고,
 * 실행할 때마다 data/content 로 그대로 써낸다 — 데이터 원천은 여전히
 * data/datasets/bunyang-danji-2026.json(세대수·분양가·출처)과 오너 레이아웃 지시(2026-08-11)고,
 * 이 스크립트는 그 승인 결과를 재현 가능하게 박제한 것뿐이다.
 *
 * ⚠️ 청약홈에 정식 공고(applyhomeNo)가 올라오면 이 파일은 폐기하고
 *    build-danji.mjs --only songpa-signature-remndr --publish 로 정식 전환한다.
 *    (data/review/builders.json 의 "danji-songpa" 라벨도 그때 이 스크립트에서
 *     build-danji.mjs 호출로 되돌린다.)
 *
 * 실행: node scripts/build-danji-songpa-manual.mjs [날짜=오늘]
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const dateArg = process.argv.slice(2).find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
const date = dateArg || new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

/* 오너 확정 카드(2026-08-11, 레이아웃 2차 지시 반영 최종본). 손대려면
 * data/datasets/bunyang-danji-2026.json 의 songpa-signature-remndr 항목과
 * data/review/sets.json 의 danji-songpa 세트 note 를 함께 갱신할 것. */
const card = {
  template: "danji-cover@1",
  date,
  kind: "remndr",
  topcap: `오늘의 주요 청약 이슈 (${date.replaceAll("-", ".")})`,
  titleLines: ['<span class="hi">송파</span> 안전마진 <span class="up">10.9억</span> 줍줍!'],
  hero: {
    photo: "songpa-lottecastle.jpg",
    credit: "오너 제공",
    shift: 114,
    boxH: 555,
    coverH: 799, fixed: true /* 손으로 맞춘 표지 — 판형이 늘리지 않는다(2026-09-03) */,
    fadeTop: 375,
  },
  danji: { name: "송파 시그니처 롯데캐슬", logo: "lottecastle.png", company: "롯데건설" },
  address: "서울 송파구 거여동",
  spec: [
    { label: "세대수", pre: "총", value: "1,945", unit: "세대" },
    { label: "동수", pre: "총", value: "17", unit: "개동" },
    { label: "최고 층수", pre: "최고", value: "33", unit: "층" },
  ],
  priceTable: {
    head: [],
    cols: 3,
    rows: [
      { area: "분양가(옵션포함)", price: "10.1억", main: true },
      { area: "최근 실거래가", price: "21.0억" },
      { area: "안전마진", price: "10.9억", warn: true, glow: true },
    ],
  },
  schedule: [
    { label: "무순위 접수", date: "8/18(화)", hi: true },
    { label: "당첨자 발표", date: "8/21(금)" },
    { label: "입주 5년차", date: "즉시 입주" },
  ],
  notice: '<i class="em">⚠️</i>계약취소세대, 통장 불필요',
  source: { name: "청약홈 무순위 목록(직접 열람) · 한국경제·헤럴드경제·리치고" },
};

const outDir = join(ROOT, "data/content", date);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "danji-songpa.json"), JSON.stringify(card, null, 2) + "\n", "utf8");

console.log(`danji-songpa — ${card.danji.name} (수동 예외 빌더)`);
console.log(`   ${card.topcap} · ${card.titleLines.join(" ").replace(/<[^>]+>/g, "")}`);
console.log(`✅ 1장 생성 → data/content/${date}/`);
console.log("⚠ applyhomeNo 미확보 상태의 수동 카드다 — 발행 전 청약홈 공고·모집공고문 대조 필수.");
