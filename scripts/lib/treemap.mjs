/**
 * 트리맵 배치 — squarify (Bruls·Huizing·van Wijk, 2000).
 *
 * ── 왜 라이브러리를 안 쓰나
 * 이 공장은 「같은 입력 = 같은 픽셀」이 약속이다. 외부 트리맵 구현은 부동소수 누적 순서나
 * 정렬 안정성이 판올림마다 달라질 수 있어, 픽셀 기준값이 조용히 흔들린다.
 * 알고리즘 자체가 40줄이라 직접 둔다 — 대신 **입력 순서를 바꾸지 않는다**(정렬은 부르는 쪽 몫).
 *
 * ── 왜 정렬을 여기서 안 하나
 * 교과서 squarify 는 내림차순 정렬을 전제하지만, 이 카드가 말하려는 것은 **구간 순서**다
 * (2채 → 3채 → … → 101채 이상). 값 순으로 섞으면 「위로 갈수록」이라는 이야기가 깨진다.
 * 다행히 소유 구간은 거의 단조 감소라(11~20채 묶음 하나만 예외) 종횡비 손해가 크지 않다.
 * 순서를 어떻게 줄지는 **부르는 쪽이 정하고, 이 함수는 받은 순서를 지킨다.**
 *
 * ── 반환 좌표
 * 입력한 (x, y, w, h) 단위 그대로 돌려준다. 백분율을 넣으면 백분율이 나온다.
 * 템플릿이 % 로 배치하므로 빌더는 100 × 100 좌표계를 쓴다.
 */

/** 한 줄(row)에 담았을 때의 최악 종횡비 — 작을수록 정사각형에 가깝다. */
function worst(row, len, scale) {
  if (!row.length || len <= 0) return Infinity;
  let sum = 0,
    min = Infinity,
    max = 0;
  for (const v of row) {
    const a = v * scale;
    sum += a;
    if (a < min) min = a;
    if (a > max) max = a;
  }
  if (sum <= 0) return Infinity;
  const s2 = sum * sum,
    l2 = len * len;
  return Math.max((l2 * max) / s2, s2 / (l2 * min));
}

/**
 * @param {{value:number}[]} items  값이 든 항목들 — **받은 순서를 지킨다**
 * @param {number} x0 @param {number} y0 @param {number} w @param {number} h
 * @returns {{item:object, x:number, y:number, w:number, h:number}[]}
 */
export function squarify(items, x0, y0, w, h) {
  const total = items.reduce((a, it) => a + it.value, 0);
  if (!(total > 0)) throw new Error("트리맵: 값의 합이 0 이하다");
  if (!(w > 0 && h > 0)) throw new Error("트리맵: 폭·높이가 0 이하다");

  const out = [];
  let X = x0,
    Y = y0,
    W = w,
    H = h;
  /* 남은 값의 합 대비 남은 넓이 — 매 줄마다 다시 계산한다(누적 오차가 마지막 칸에 몰리지 않게). */
  let rest = items.slice();

  while (rest.length) {
    const remainSum = rest.reduce((a, it) => a + it.value, 0);
    const area = W * H;
    const scale = area / remainSum;
    const short = Math.min(W, H);

    /* 줄에 하나씩 더해 보다가 최악 종횡비가 나빠지기 직전에 끊는다. */
    let row = [];
    let i = 0;
    for (; i < rest.length; i++) {
      const cur = worst(row.map((r) => r.value), short, scale);
      const next = worst([...row.map((r) => r.value), rest[i].value], short, scale);
      if (row.length && next > cur) break;
      row.push(rest[i]);
    }

    const rowSum = row.reduce((a, it) => a + it.value, 0);
    const thick = (rowSum * scale) / short; /* 줄의 두께 */

    let off = 0;
    for (const it of row) {
      const len = (it.value * scale) / thick;
      if (W >= H) out.push({ item: it, x: X, y: Y + off, w: thick, h: len });
      else out.push({ item: it, x: X + off, y: Y, w: len, h: thick });
      off += len;
    }

    /* 남은 자리를 줄인다 — 긴 쪽을 따라 잘라낸다. */
    if (W >= H) {
      X += thick;
      W -= thick;
    } else {
      Y += thick;
      H -= thick;
    }
    rest = rest.slice(row.length);
    /* 부동소수 잔여로 폭이 0 이하가 되면 남은 것을 마지막 줄에 밀어 넣고 끝낸다. */
    if (rest.length && (W <= 1e-9 || H <= 1e-9)) {
      throw new Error("트리맵: 남은 자리가 0 이 됐는데 배치 못 한 칸이 있다");
    }
  }

  if (out.length !== items.length) throw new Error(`트리맵: 칸 수가 안 맞는다 ${out.length}/${items.length}`);
  return out;
}
