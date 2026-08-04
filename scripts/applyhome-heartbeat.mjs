/**
 * 청약홈 아침 한 줄 — **새 공고가 0건인 날에도 보낸다.**
 *
 * ── 왜 만들었나 (2026-08-04)
 * 새 공고가 있을 때만 알리게 해 뒀다. 조용한 날은 정상이니 안 보내도 된다고 봤다.
 * 그런데 **매일 도는 수집기의 침묵은 정상과 구분이 안 된다.** 아침에 아무것도 안 오면
 *   · 오늘 공고가 없었던 것인지
 *   · 수집기가 죽은 것인지
 *   · 예약이 안 깨어난 것인지
 * 알 수가 없다. 실제로 예약 7개가 기본 브랜치 문제로 몇 주째 안 돌고 있었는데
 * 아무도 몰랐다 — 안 오는 것이 원래 모습이었기 때문이다.
 *
 * 그래서 침묵을 없앤다. 대신 빈 "0건" 을 보내지 않는다 —
 * 매일 오는 "0건" 은 며칠이면 안 읽게 되고, 안 읽는 알림은 없는 알림이다.
 * **그날 실제로 쓸모 있는 한 줄**을 만든다: 지금 접수중인 것과 가장 가까운 마감.
 *
 * 쓰는 법: node scripts/applyhome-heartbeat.mjs [--today 2026-08-04]
 * 출력   : 텔레그램에 보낼 한 덩어리(없으면 빈 문자열)
 */
import { readFileSync, existsSync } from "node:fs";

const arg = (n) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const TODAY = arg("today") || new Date().toISOString().slice(0, 10);
const SRC = "data/datasets/applyhome-latest.json";

if (!existsSync(SRC)) {
  console.log(`🏠 청약홈 확인 — 데이터 파일이 없습니다(${SRC}). 수집이 돌지 않았을 수 있습니다.`);
  process.exit(0);
}

let doc;
try {
  doc = JSON.parse(readFileSync(SRC, "utf8"));
} catch (e) {
  console.log(`🏠 청약홈 확인 — 데이터를 읽지 못했습니다: ${String(e).slice(0, 80)}`);
  process.exit(0);
}

const notices = Array.isArray(doc.notices) ? doc.notices : [];
const days = (from, to) => Math.round((new Date(to) - new Date(from)) / 86400000);

/** 오늘 기준 접수중(시작 ≤ 오늘 ≤ 마감) */
const open = notices.filter((n) => n.receiptFrom && n.receiptTo
  && n.receiptFrom <= TODAY && TODAY <= n.receiptTo);

/** 아직 시작 안 한 것 중 가장 빠른 것 */
const upcoming = notices
  .filter((n) => n.receiptFrom && n.receiptFrom > TODAY)
  .sort((a, b) => a.receiptFrom.localeCompare(b.receiptFrom));

/** 접수중인 것 가운데 가장 빨리 닫히는 것 */
const closing = [...open].sort((a, b) => (a.receiptTo || "").localeCompare(b.receiptTo || ""));

const lines = [];
lines.push(`🏠 청약홈 확인 완료 (${TODAY}) — 새 공고 0건`);

if (open.length) {
  const c = closing[0];
  const d = days(TODAY, c.receiptTo);
  const when = d === 0 ? "오늘 마감" : `D-${d}`;
  lines.push(`접수중 ${open.length}건 · 가장 급한 건 ${c.name}(${c.areaName}) ${when}`);
} else {
  lines.push("지금 접수중인 단지는 없습니다.");
}

if (upcoming.length) {
  const u = upcoming[0];
  const d = days(TODAY, u.receiptFrom);
  lines.push(`다음 접수: ${u.name}(${u.areaName}) ${d === 1 ? "내일" : `${d}일 뒤`} 시작`);
}

/* 수집이 실제로 돌았다는 증거를 한 줄 남긴다 — 이게 이 알림의 본래 목적이다. */
const t = doc.meta?.totals;
if (t) {
  const sum = Object.values(t).reduce((a, b) => a + (Number(b) || 0), 0);
  lines.push(`(청약홈 전체 ${sum.toLocaleString()}건 훑음 · 최근 ${doc.meta?.withinDays ?? "?"}일 신규만 봄)`);
}

console.log(lines.join("\n"));
