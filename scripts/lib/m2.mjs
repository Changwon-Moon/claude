/**
 * M2(광의통화) 계열 로더 — **개편 전 기준(구 M2)** 하나로 통일해서 내준다.
 *
 * ── 왜 이 파일이 있나 (2026-09-01)
 * M2 카드가 넷으로 늘었다(정부별·개편격차·증가율·장기추세). 접합 규칙과 대조 게이트를
 * 빌더마다 복사하면 **네 곳이 갈라진다** — 이 공장이 이미 다섯 번 겪은 실패다(CLAUDE.md §13).
 * 그래서 "어느 M2 를 쓰는가"와 "어떻게 이었는가"는 **여기 한 곳**에서만 정한다.
 *
 * ── 왜 개편 전 기준인가  ★이 소재군의 핵심 판단
 * 한국은행이 2025-12-30 통화·유동성 통계를 개편해 **수익증권(펀드·ETF)을 M2 에서 뺐다**
 * (2026-06 기준 -621조). 신 기준으로 과거를 재면 최근 구간만 유독 작아진다 —
 * 자를 바꿔 놓고 키를 비교하는 꼴이다. ECOS 는 같은 통계표에 `[참고] 구 M2` 를 함께 싣고
 * 신·구를 **2026년 12월까지 1년간 병행 공표**한다.
 * **오너 지시(2026-08-12): 카드는 개편 전 기준으로 전 구간 통일.**
 *
 * ── 계열 접합
 * 개편 전 계열(`BBHA16`)은 2003-10 부터다. 그 앞은 구지표 표(`101Y004`, 1986-01~2004-09)에 있고
 * **겹치는 12개월의 값이 소수점까지 같다**(실측 최대차 0.00조). 값이 같으니 잇는 것은 해석이
 * 아니라 확인이다 — 매 빌드마다 다시 대조하고, 어긋나면 던진다.
 *
 * 단위: **조원**(원자료는 십억원 → ÷1000)
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** 겹치는 달의 허용 오차(조원). 접합 근거는 "값이 같다"이므로 사실상 0 이어야 한다. */
const OVERLAP_TOL = 0.05;

export function loadM2() {
  const raw = JSON.parse(readFileSync(join(ROOT, "data/datasets/m2-monthly.json"), "utf8"));
  if (!raw.legacyM2) throw new Error("m2-monthly.json 에 legacyM2([참고] 구 M2)가 없다 — ECOS 수집을 먼저 돌린다");
  if (!raw.others?.["101Y004"]) throw new Error("m2-monthly.json 에 구지표 표(101Y004)가 없다");

  const tri = (rows) => Object.fromEntries(rows.map((r) => [r.ym, r.value / 1000]));
  const OLD = tri(raw.legacyM2.series);          // 개편 전 기준 구 M2 (2003-10~)
  const PRE = tri(raw.others["101Y004"].series); // 구지표 표 (1986-01~2004-09)
  /* 개편 후 신 M2. `series`(BBHA00)와 `others.161Y010` 은 같은 계열이다 —
     둘 중 있는 것을 쓰되, 둘 다 있으면 값이 같은지 확인한다. */
  const NEWa = raw.series ? tri(raw.series) : null;
  const NEWb = raw.others["161Y010"] ? tri(raw.others["161Y010"].series) : null;
  if (NEWa && NEWb) {
    const both = Object.keys(NEWa).filter((k) => k in NEWb);
    const w = Math.max(...both.map((k) => Math.abs(NEWa[k] - NEWb[k])));
    if (w > OVERLAP_TOL) throw new Error(`신 M2 두 계열(series·161Y010)이 다르다(최대 ${w.toFixed(2)}조) — 어느 쪽이 신 기준인지 먼저 가린다`);
  }
  const NEW = NEWa ?? NEWb;
  if (!NEW) throw new Error("m2-monthly.json 에 개편 후 신 M2 계열이 없다");

  /* 겹치는 달을 매번 대조한다 — 같아야만 잇는다 */
  const overlap = Object.keys(PRE).filter((k) => k in OLD);
  if (overlap.length < 3) throw new Error(`두 계열이 겹치는 달이 ${overlap.length}개뿐 — 이어 붙일 근거가 없다`);
  const worst = Math.max(...overlap.map((k) => Math.abs(PRE[k] - OLD[k])));
  if (worst > OVERLAP_TOL) throw new Error(`겹치는 달의 값이 다르다(최대 ${worst.toFixed(2)}조) — 접합 불가`);

  const M2 = { ...PRE, ...OLD };
  const months = Object.keys(M2).sort();
  const lastYm = months[months.length - 1];

  return { raw, M2, OLD, PRE, NEW, months, lastYm, worst, overlapMonths: overlap.length };
}

/** "202606" → "2026.06" */
export const ymLabel = (ym) => `${ym.slice(0, 4)}.${ym.slice(4)}`;
/** 전년동월. 없으면 undefined 를 부르는 쪽이 판단한다. */
export const prevYear = (ym) => String(+ym.slice(0, 4) - 1) + ym.slice(4);
/** 전년동월비(%) */
export const yoy = (M2, ym) => {
  const p = prevYear(ym);
  return p in M2 ? (M2[ym] / M2[p] - 1) * 100 : null;
};
export const r1 = (v) => Math.round(v * 10) / 10;
/** 조원 표시 — 카드 안에서 자릿수를 통일한다(정수·천단위 쉼표) */
export const jo = (v) => Math.round(v).toLocaleString("ko-KR");
/**
 * 표시용 정수(조원). **meta 에 담아 캡션이 이걸 그대로 쓰게 한다.**
 *
 * ⚠️ 2026-09-01 실제 사고: 카드는 원값 4831.48 을 반올림해 **4,831조**를 찍었는데,
 * 캡션 생성기는 meta 의 `r1` 값(4831.5)을 다시 반올림해 **4,832조**를 찍었다.
 * 한 번 반올림한 값에 또 반올림을 걸면 .5 경계에서 1이 어긋난다 — 이중 반올림이다.
 * 그래서 **원값에서 한 번만** 정수로 만들고, 그 정수를 카드와 캡션이 **같이** 쓴다.
 */
export const shownJo = (v) => Math.round(v);

/** 브랜드 색 — 네 카드가 같은 언어를 쓴다(레드 = 개편 전/오름, 슬레이트 = 개편 후/과거) */
export const INK = "#141821";
export const RED = "#e5484d";
export const SLATE = "#5b6b7f";
export const MUTE = "#9aa3af";

/**
 * X축 연도 눈금 자리잡기 — **겹치면 빌더가 뺀다.**
 *
 * SVG 안 글자는 `designQa` 의 넘침·겹침 검사 대상이 아니다. 검사는 "문제 없음"을 내주는데
 * 그림에서는 라벨이 서로 얹힌다 — 2026-09-01 첫 빌드에서 실제로 두 번 겪었다
 * (`2016` 위에 `2026.6`, 그 다음엔 `2016` 위에 `2018`). 그래서 폭을 재서 자리를 고르는 일을
 * **한 곳**에 둔다. 세 M2 카드가 같은 자를 쓴다.
 *
 * @param {object} o
 * @param {string[]} o.months  창 안의 연월(오름차순)
 * @param {(i:number)=>number} o.x  인덱스 → x 좌표
 * @param {number} o.right  플롯 오른쪽 끝(마지막 라벨은 여기에 anchor="end")
 * @param {string} o.lastText 마지막 라벨 문구(예 "2026.6")
 * @param {number} o.every  후보 연도 간격(년)
 * @param {number} [o.fs=40] 글자 크기  @param {number} [o.gap=24] 라벨 사이 최소 숨
 * @returns {{i:number,text:string,anchor:"start"|"middle"}[]} 살아남은 연도 눈금
 */
export function yearTicks({ months, x, right, lastText, every, fs = 40, gap = 24 }) {
  const CW = 0.66;                                   // 글자당 대략 폭(실측 근사)
  const w = (t) => t.length * fs * CW;
  const lastLeft = right - w(lastText);              // 마지막 라벨이 왼쪽으로 자라는 한계선
  const first = +months[0].slice(0, 4);
  const out = [];
  let cursor = -Infinity;                            // 직전에 놓인 라벨의 오른쪽 끝
  /* 후보는 **그 해의 첫 가용월**이다. 예전엔 1월만 봤는데, 구 M2 계열은 2003-10 부터라
     첫 해(2003)가 통째로 후보에서 빠졌다 — 축이 2008 부터 시작하는 것처럼 보였다(2026-09-01 실측). */
  const seen = new Set();
  months.forEach((m, i) => {
    const y = +m.slice(0, 4);
    if (seen.has(y)) return;
    seen.add(y);
    if ((y - first) % every !== 0) return;
    const text = String(y);
    const anchor = out.length === 0 ? "start" : "middle";
    const half = anchor === "start" ? 0 : w(text) / 2;
    const left = x(i) - half, rightEdge = x(i) - half + w(text);
    if (left < cursor + gap) return;                 // 앞 라벨과 부딪힌다
    if (rightEdge + gap > lastLeft) return;          // 마지막 라벨과 부딪힌다
    out.push({ i, text, anchor });
    cursor = rightEdge;
  });
  return out;
}
