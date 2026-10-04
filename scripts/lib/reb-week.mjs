/**
 * 부동산원 주간 시점코드(YYYYWW) → 실제 조사기준일(월요일) 환산. 단일 정본.
 *
 * ── 왜 공식 하나로 안 되는가 (2026-10-04 발견) ────────────────────────────────
 * 부동산원 주차는 ISO 연차주가 **아니다**. 기본은 "그 해 1월 1일이 포함된 주 = 1주"인데,
 * 그 월요일이 이미 전년도 마지막 주차로 발표돼 버린 해는 다음 월요일부터 1주가 시작된다.
 *   · 2016: 1/1(금) 포함 주(2015-12-28)가 1주 → 2016년은 53주까지 간다(201653 = 2016-12-26)
 *   · 2017: 1/1(일) 포함 주가 이미 201653 으로 쓰였다 → 201701 = 2017-01-02
 *   · 2022: 1/1(토) 포함 주(2021-12-27)는 안 쓰였다 → 202201 = 2021-12-27
 * 종전 코드는 "ISO 월요일" 한 줄로 계산해서 **2017년·2023년 103주가 일주일씩 밀려 있었다**.
 * 발행된 최장기 카드(2020·2022·2025·2026 구간)는 다행히 영향이 없었지만,
 * TOP5 표를 만들려는 순간 2017년 구간 날짜가 틀리게 나왔다.
 *
 * ── 그래서 데이터로 복원한다 ──────────────────────────────────────────────────
 * 실제로 존재하는 시점코드 목록을 받아 연도별 1주 월요일을 순서대로 확정한다.
 * 같은 월요일이 두 번 나오면(= 규칙 위반) 즉시 던진다. 아래 체크포인트도 매 호출 검사한다.
 *   202640=2026-09-28(발행 카드 기준주) · 202506=2025-02-03(현 상승기 시작)
 *   202205=2022-01-24(20개월 만의 하락 전환) · 202204=2022-01-17(종전 최장 마지막 상승)
 *   201732=2017-08-07(8.2 대책 직후 하락 전환) · 201701=2017-01-02 · 201653=2016-12-26
 */

const DAY = 86400000;
const ORD = ["", "첫", "둘", "셋", "넷", "다섯"];

/** 그 해 1월 1일이 포함된 주의 월요일(UTC 자정) */
function jan1Monday(y) {
  const t = new Date(Date.UTC(y, 0, 1));
  const dow = t.getUTCDay() || 7;
  const m = new Date(t);
  m.setUTCDate(t.getUTCDate() - dow + 1);
  return m;
}

/** 발행 카드와 보도로 교차검증된 고정점 — 하나라도 어긋나면 던진다(오보 0) */
const CHECKPOINTS = {
  "202640": "2026-09-28",
  "202506": "2025-02-03",
  "202205": "2022-01-24",
  "202204": "2022-01-17",
  "201732": "2017-08-07",
  "201701": "2017-01-02",
  "201653": "2016-12-26",
};

/**
 * @param {string[]} keys 데이터에 실제로 있는 시점코드(YYYYWW) 전체. 정렬 여부 무관.
 * @returns {{monday(key):Date, iso(key):string, label(key):string, has(key):boolean}}
 */
export function makeRebCalendar(keys) {
  const ks = [...keys].sort();
  const byYear = new Map();
  for (const k of ks) {
    const y = +k.slice(0, 4), w = +k.slice(4);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(w);
  }
  const map = new Map();
  let prevLast = null;
  for (const y of [...byYear.keys()].sort((a, b) => a - b)) {
    let w1 = jan1Monday(y);
    if (prevLast && w1.getTime() <= prevLast.getTime()) w1 = new Date(prevLast.getTime() + 7 * DAY);
    const ws = byYear.get(y);
    for (const w of ws) map.set(`${y}${String(w).padStart(2, "0")}`, new Date(w1.getTime() + (w - 1) * 7 * DAY));
    prevLast = new Date(w1.getTime() + (Math.max(...ws) - 1) * 7 * DAY);
  }

  // 같은 월요일이 두 주차에 배정되면 환산 규칙이 깨진 것이다
  const seen = new Map();
  for (const [k, m] of map) {
    const iso = m.toISOString().slice(0, 10);
    if (seen.has(iso)) throw new Error(`주차 환산 충돌 — ${seen.get(iso)} 와 ${k} 가 같은 월요일(${iso})`);
    seen.set(iso, k);
  }
  for (const [k, want] of Object.entries(CHECKPOINTS)) {
    const got = map.get(k);
    if (got && got.toISOString().slice(0, 10) !== want)
      throw new Error(`주차 환산 체크포인트 실패 — ${k} 는 ${want} 여야 하는데 ${got.toISOString().slice(0, 10)} 로 나왔다`);
  }

  const monday = (key) => {
    const m = map.get(String(key));
    if (!m) throw new Error(`주차 ${key} 가 데이터에 없다 — 환산 불가`);
    return m;
  };
  const iso = (key) => monday(key).toISOString().slice(0, 10);
  const label = (key) => {
    const m = monday(key);
    const wom = Math.floor((m.getUTCDate() - 1) / 7) + 1;
    return `${m.getUTCFullYear()}.${m.getUTCMonth() + 1} ${ORD[wom]}째주`;
  };
  return { monday, iso, label, has: (key) => map.has(String(key)) };
}
