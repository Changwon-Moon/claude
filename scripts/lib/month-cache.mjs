/**
 * 📅 「구 × 월」 캐시가 **모든 구에서 다 찬 마지막 달** — 한 곳에서만 잰다.
 *
 * ── 왜 공용으로 뺐나 (2026-10-21)
 * 2026-09-10 에 `find-gap-pairs` 의 최근창을 자동으로 바꿨다(GAP_CARDS §21).
 * 그런데 **곡선을 그리는 `build-gap-duel` 의 `--to` 는 `202607` 로 박힌 채 남았다.**
 * 한 달이 더 차는 순간 둘이 어긋난다:
 *
 *   최근창 202603~202608   ↔   곡선 202001~202607
 *   → 202608 에 최고가가 난 단지는 **끝점 마커가 곡선 밖**을 가리켜
 *     마지막 달로 물러나고, 「제목의 격차 ≠ 라벨의 뺄셈」이 된다.
 *
 * 9월에 11~15호 다섯 장이 전부 그렇게 나왔고, 10월에 **또 같은 자리가 벌어졌다**.
 * 같은 값을 두 파일이 따로 들고 있으면 반드시 갈라진다 — 그래서 여기 하나만 둔다.
 *
 * ⚠️ 「다 찼다」의 뜻: 명부(`apt-universe.json`)의 **모든 구**에 그 달 파일이 있다는 것.
 *    캐시는 구마다 다른 속도로 차므로, 일부만 찬 달을 쓰면 **먼저 찬 구만 한 달을 더 보고**
 *    값이 매겨진다 — 같은 자로 재지 않은 값끼리 순위를 다투게 된다.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** 연월 문자열을 n달 옮긴다. `shiftYm("202601", -5) → "202508"` */
export function shiftYm(ym, n) {
  let y = +String(ym).slice(0, 4);
  let m = +String(ym).slice(4) + n;
  while (m < 1) { m += 12; y--; }
  while (m > 12) { m -= 12; y++; }
  return `${y}${String(m).padStart(2, "0")}`;
}

/**
 * 명부의 모든 구가 다 찬 가장 최근 달. 최근 24개월 안에 없으면 `null`.
 * (호출하는 쪽이 멈출지 기본값을 쓸지 정한다 — 여기서 종료하지 않는다.)
 */
export function lastCompleteMonth() {
  let lawds;
  try {
    const uni = JSON.parse(readFileSync(join(ROOT, "data/datasets/apt-universe.json"), "utf8"));
    lawds = [...new Set((uni.items ?? []).map((i) => i.lawdCd))];
  } catch { return null; }
  if (!lawds.length) return null;
  const dir = join(ROOT, "data/datasets/molit-monthly");
  const now = new Date(Date.now() + 9 * 3600 * 1000);   // KST
  for (let back = 1; back <= 24; back++) {
    const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (lawds.every((l) => existsSync(join(dir, l, `${ym}.json`)))) return ym;
  }
  return null;
}
