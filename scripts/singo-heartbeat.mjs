/**
 * 조용한 아침에도 한 줄은 보낸다 — 신고가 편.
 *
 * ── 왜 (2026-08-04 사고에서 배운 것, applyhome 과 같은 이유)
 * 매일 도는 수집기의 **침묵은 정상과 구분되지 않는다.** 아침에 아무것도 안 오면
 * 신고가가 없었던 건지, 수집기가 죽은 건지, 예약이 안 깨어난 건지 알 수가 없다.
 * 그래서 0건인 날에도 "봤고, 없었다"를 보낸다.
 *
 * ── 빈 "0건"만 보내지 않는 이유
 * 며칠이면 안 읽게 된다. 그래서 **오늘 무엇을 봤는지**(지역 수·거래 기준월)와,
 * 아직 기준선을 채우는 중이면 **얼마나 남았는지**를 얹는다.
 *
 * 실행: node scripts/singo-heartbeat.mjs --today 2026-08-13
 * 출력: 알림 문구 한 덩어리(stdout). 보낼 게 없으면 아무것도 안 찍는다.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const today = arg("today") || new Date().toISOString().slice(0, 10);

const read = (p) => (existsSync(join(ROOT, p)) ? JSON.parse(readFileSync(join(ROOT, p), "utf8")) : null);

const latest = read("data/datasets/singo-latest.json");
const progress = read("data/datasets/molit-peak/_progress.json");
const universe = read("data/datasets/apt-universe.json");

const lines = [];

const judged = latest?.meta?.judgedRegions ?? 0;

// ── 준비가 두 갈래다: ① 1000세대 명부 ② 역대 최고가 기준선. 둘 다 차야 판정이 시작된다.
//    "0건"이 셋 중 무엇인지(없었다 / 명부 준비중 / 기준선 준비중) 갈라 말하지 않으면
//    오너가 데이터를 오해한다.
const uniReady = !!universe?.meta?.complete;

if (universe && !uniReady) {
  const m = universe.meta;
  const pct = m.aptTotal ? Math.round((m.aptChecked / m.aptTotal) * 100) : 0;
  lines.push(`📒 1,000세대 이상 단지 명부 만드는 중 (${today})`);
  lines.push(`· 단지 ${m.aptChecked.toLocaleString("ko-KR")}/${m.aptTotal.toLocaleString("ko-KR")}곳 확인 · ${pct}%`);
  lines.push(`· 지금까지 ${m.count.toLocaleString("ko-KR")}개 단지가 명부에 올랐습니다`);
} else if (progress && !progress.complete) {
  // ── 기준선을 채우는 중 — 이때의 "0건"은 "없었다"가 아니라 "아직 못 잰다"다.
  //    둘을 같은 문구로 보내면 오너가 데이터를 오해한다.
  const pct = Math.round((1 - progress.monthsRemaining / (progress.regions * progress.monthsPerRegion)) * 100);
  lines.push(`🧱 최고가 기준선(${progress.baselineLabel || "2020년 이후"}) 채우는 중 (${today})`);
  lines.push(`· 완료 ${progress.regionsComplete}/${progress.regions}개 지역 · ${pct}%`);
  lines.push(`· 다 차면 알려드리고, 그때부터 신고가 판정이 시작됩니다`);
} else if (!universe) {
  lines.push(`📒 1,000세대 이상 단지 명부 준비 전 (${today})`);
  lines.push(`· 명부가 아직 없어 판정을 시작하지 않았습니다 — data/apt-universe-last.md 확인`);
} else if (latest && judged === 0) {
  // 판정한 지역이 하나도 없는 날의 "0건"은 "없었다"가 아니라 "아직 못 잰다"다.
  // 진행 파일이 아직 없을 수도 있으므로(첫날) 여기서도 같은 뜻으로 갈라 준다.
  lines.push(`🧱 최고가 기준선 준비 중 (${today})`);
  lines.push(`· 아직 판정할 수 있는 지역이 없습니다 — 초기 수집이 끝나면 알려드립니다`);
} else if (latest) {
  const m = latest.meta || {};
  lines.push(`🏙 오늘의 신고가 없음 (${today})`);
  lines.push(`· ${m.judgedRegions ?? "?"}개 지역 · 최근 ${(m.months || []).length}개월 신고분 확인`);
  lines.push(`· 기준: 명부 ${(m.universe?.count ?? 0).toLocaleString("ko-KR")}개 단지 · 전용 59(25평)·84(34평) · ${m.baselineLabel || "2020년 이후"} 최고가`);
} else {
  lines.push(`⚠️ 신고가 확인 결과 파일이 없습니다 (${today}) — data/singo-last.md 를 확인하세요`);
}

console.log(lines.join("\n"));
