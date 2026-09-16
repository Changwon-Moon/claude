/**
 * 토허제 40곳 「YYYY년 초 → 끝점」 매매가 상승률 계산 — 정본 한 곳.
 * build-tohuh-rise-map(지도 4장)과 build-tohuh-rise-story(표지·읽는 법·순위 이동·표·주의 5장)가
 * **같은 함수**를 부른다. 두 빌더가 각자 계산하면 순위·반올림이 언젠가 갈라진다.
 *
 * 자료: data/datasets/reb-weekly-index.json (부동산원 주간 매매가격지수)
 * 기준점 키 YYYY01 = 1월 1일이 든 주(전년 마지막 조사) — 2025 연간 누적이 발표와 일치(2026-09-16 대조)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const SERIES_BASES = ["2023", "2024", "2025", "2026"];

export const r1 = (v) => Math.round(v * 10) / 10;
export const pctTxt = (v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(r1(v)).toFixed(1)}`;

/** 부동산원 주 키 → 그 주 조사일(월요일). reb-weekly-brief 와 같은 규칙. */
export const mondayOf = (key) => {
  const y = +key.slice(0, 4), w = +key.slice(4);
  const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
  const dow = simple.getUTCDay() || 7;
  const mon = new Date(simple);
  mon.setUTCDate(simple.getUTCDate() - dow + 1);
  return mon;
};
export const dateKo = (d) => `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`;
export const dateDot = (d) =>
  `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`;

/**
 * @returns {{ doc, mae, END, SEOUL, AREAS, endDate, byBase: Map<string, {stat, ranked, rankOf, seoulV, coTop}> }}
 */
export function loadTohuhRise(ROOT, END) {
  const doc = JSON.parse(readFileSync(join(ROOT, "data/datasets/reb-weekly-index.json"), "utf8"));
  const tohuh = JSON.parse(readFileSync(join(ROOT, "data/datasets/tohuh-2026.json"), "utf8"));
  if (doc.meta?.verified !== true) {
    throw new Error("reb-weekly-index.json meta.verified 가 true 가 아니다 — 보도자료와 대조한 뒤 올린다");
  }
  const mae = doc.mae;
  const SEOUL = doc.meta.seoulCode || "50008";
  if (!mae[SEOUL]?.[END]) throw new Error(`끝점 ${END} 가 자료에 없다 (asOf=${doc.meta.asOf})`);

  const AREAS = [
    ...tohuh.seoul.areas.map((a) => ({ ...a, region: "서울" })),
    ...tohuh.newly.areas.map((a) => ({ ...a, isNew: true, region: "경기" })),
    ...tohuh.existing.areas.map((a) => ({ ...a, region: "경기" })),
  ];
  if (AREAS.length !== 40) throw new Error(`토허제 지역이 40곳이 아니다: ${AREAS.length}곳`);

  /* 네 기준점이 **모두** 있는 계열만 쓴다(장끼리 같은 계열이어야 비교가 된다). */
  const need = [...SERIES_BASES.map((y) => `${y}01`), END];
  const ok = (c) => c && mae[c] && need.every((k) => Number.isFinite(mae[c][k]));
  for (const a of AREAS) {
    if (ok(a.rebWeeklyCode)) Object.assign(a, { code: a.rebWeeklyCode, fallback: false });
    else if (ok(a.rebWeeklyFallback)) Object.assign(a, { code: a.rebWeeklyFallback, fallback: true });
    else
      throw new Error(
        `${a.label}: 주간 계열(${a.rebWeeklyCode}${a.rebWeeklyFallback ? "/" + a.rebWeeklyFallback : ""})에 기준점이 비었다`,
      );
  }
  const rise = (code, base) => (mae[code][END] / mae[code][base] - 1) * 100;

  /** 순위 매기기 — 같은 값이면 원값, 그래도 같으면 이름순으로 줄 세우고, 번호는 **보이는 값**(소수 첫째 자리)으로.
   * 2024장 성동 40.65 / 분당 40.60 이 둘 다 「+40.6%」로 찍혔다(2026-09-16) → 같은 값이면 공동 순위(1·1·3 …). */
  const rankIt = (stat) => {
    const ranked = [...stat].sort((a, b) => b.v - a.v || a.label.localeCompare(b.label, "ko"));
    const rankOf = new Map();
    ranked.forEach((a, i) => {
      const prev = ranked[i - 1];
      rankOf.set(a.geoName, prev && r1(prev.v) === r1(a.v) ? rankOf.get(prev.geoName) : i + 1);
    });
    return { ranked, rankOf, coTop: ranked.filter((a) => rankOf.get(a.geoName) === 1) };
  };

  /* 그해 한 해 상승률(오너 2026-09-16: 순위 이동 카드는 누적이 아니라 연도별로)
   * y 년 = y년 첫 주 → (y+1)년 첫 주. 마지막 해는 끝점까지(연중). 기준점 규칙은 누적과 같다. */
  const byYear = new Map();
  SERIES_BASES.forEach((y, i) => {
    const from = `${y}01`, to = i < SERIES_BASES.length - 1 ? `${SERIES_BASES[i + 1]}01` : END;
    const yr = (code) => (mae[code][to] / mae[code][from] - 1) * 100;
    const stat = AREAS.map((a) => ({ ...a, v: yr(a.code) }));
    byYear.set(y, { from, to, stat, ...rankIt(stat), seoulV: yr(SEOUL), partial: to === END });
  });

  const byBase = new Map();
  for (const y of SERIES_BASES) {
    const BASE = `${y}01`;
    const stat = AREAS.map((a) => ({ ...a, v: rise(a.code, BASE) }));
    const { ranked, rankOf, coTop } = rankIt(stat);
    byBase.set(y, { BASE, stat, ranked, rankOf, coTop, seoulV: rise(SEOUL, BASE) });
  }
  return { doc, mae, END, SEOUL, AREAS, endDate: mondayOf(END), byBase, byYear };
}

/** 표 이름: 서울 구·경기 시는 label(「송파구」「광명시」), 경기 시 안의 구는 mapLabel(「성남 분당」).
 * 「성남시 분당구」는 표 칸에서 「성남시 분 / 당구」로 글자 중간이 꺾였다(2026-09-16 첫 렌더). */
export const tableName = (a) => (a.region === "경기" && /시 .+구$/.test(a.label) ? a.mapLabel : a.label);
/** 제목용 가장 짧은 이름(「송파」「분당」「광명」) */
export const shortName = (a) => a.mapLabel.split(" ").pop();
