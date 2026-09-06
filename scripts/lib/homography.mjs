/**
 * 사영변환(호모그래피) — **비스듬히 내려다본 항공 지도 위에 위경도를 얹기 위한 것.**
 *
 * ── 왜 필요한가 (2026-09-06)
 * 오너가 "지도 판형을 이 3D 지도로 하자"며 네이버 3D 항공뷰를 줬다. 그런데 3D 뷰는
 * **위에서 곧게 내려다본 그림이 아니다** — 앞쪽은 크고 뒤쪽은 작다. 위경도를 그대로 비례
 * 배치하면 핀이 최대 수백 미터 어긋난다. 그리고 **어긋난 핀은 지도에서 조용히 안 보인다.**
 *
 * 평평한 땅을 비스듬히 찍은 사진과 지도 사이는 **사영변환 한 장**으로 이어진다.
 * 그래서 지도 안에서 위치가 분명한 지점(역·교차로) 몇 곳의 픽셀 자리를 재고,
 * 그 지점들의 실제 좌표를 지오코딩으로 받아 **변환식을 코드가 푼다.**
 * 손으로 핀을 찍는 것과의 차이: 손으로 찍으면 검증할 방법이 없지만,
 * 변환식은 **기준점에 안 쓴 지점을 되쏘아** 맞는지 잴 수 있다.
 *
 * ── 한계 (정직하게 적어 둔다)
 * 사영변환은 **땅이 평평하다**고 가정한다. 성수~압구정 한강변은 거의 평지라 잘 맞지만,
 * 고층 건물 꼭대기나 산비탈은 어긋난다. 그래서 기준점은 전부 **지면의 것**(역 출입구·교차로)
 * 으로 골랐다. 잔차가 커지면 쓰는 쪽이 던지게 되어 있다.
 */

/** 8미지수 최소제곱 — 정규방정식 + 가우스 소거. (h33 = 1 로 고정) */
function solve8(A, b) {
  const n = 8;
  const N = Array.from({ length: n }, () => new Array(n + 1).fill(0));
  for (let r = 0; r < A.length; r++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) N[i][j] += A[r][i] * A[r][j];
      N[i][n] += A[r][i] * b[r];
    }
  }
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(N[r][c]) > Math.abs(N[p][c])) p = r;
    if (Math.abs(N[p][c]) < 1e-12) throw new Error("호모그래피를 못 푼다 — 기준점이 한 줄에 몰려 있다");
    [N[c], N[p]] = [N[p], N[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = N[r][c] / N[c][c];
      for (let k = c; k <= n; k++) N[r][k] -= f * N[c][k];
    }
  }
  return N.map((row, i) => row[n] / N[i][i]);
}

/**
 * 기준점 쌍으로 변환식을 만든다.
 * @param {Array<{lon:number,lat:number,px:number,py:number}>} pairs 4쌍 이상
 * @returns {{project:(lon:number,lat:number)=>{x:number,y:number}, residuals:Array, maxResidual:number}}
 */
export function fitLonLatToPixel(pairs) {
  if (pairs.length < 4) throw new Error(`기준점이 ${pairs.length}쌍뿐이다 — 사영변환은 4쌍 이상이 필요하다`);

  /* 좌표를 그대로 넣으면(경도 127·픽셀 1000) 자릿수가 달라 방정식이 불안정해진다.
   * 원점을 평균으로 옮기고 미터·픽셀 단위로 스케일을 맞춘다(Hartley 정규화의 간단판). */
  const lon0 = pairs.reduce((a, p) => a + p.lon, 0) / pairs.length;
  const lat0 = pairs.reduce((a, p) => a + p.lat, 0) / pairs.length;
  const M_LAT = 111320, M_LON = M_LAT * Math.cos((lat0 * Math.PI) / 180);
  const S = 1000; // 미터·픽셀 모두 이 값으로 나눠 1 안팎으로 만든다
  const px0 = pairs.reduce((a, p) => a + p.px, 0) / pairs.length;
  const py0 = pairs.reduce((a, p) => a + p.py, 0) / pairs.length;

  const src = (lon, lat) => [((lon - lon0) * M_LON) / S, ((lat - lat0) * M_LAT) / S];
  const dstF = (px, py) => [(px - px0) / S, (py - py0) / S];

  const A = [], b = [];
  for (const p of pairs) {
    const [X, Y] = src(p.lon, p.lat);
    const [x, y] = dstF(p.px, p.py);
    A.push([X, Y, 1, 0, 0, 0, -X * x, -Y * x]); b.push(x);
    A.push([0, 0, 0, X, Y, 1, -X * y, -Y * y]); b.push(y);
  }
  const h = solve8(A, b);

  const project = (lon, lat) => {
    const [X, Y] = src(lon, lat);
    const w = h[6] * X + h[7] * Y + 1;
    if (!Number.isFinite(w) || Math.abs(w) < 1e-9) throw new Error("변환식이 발산했다 — 기준점을 다시 본다");
    return { x: (h[0] * X + h[1] * Y + h[2]) / w * S + px0, y: (h[3] * X + h[4] * Y + h[5]) / w * S + py0 };
  };

  const residuals = pairs.map((p) => {
    const q = project(p.lon, p.lat);
    return { name: p.name, dx: q.x - p.px, dy: q.y - p.py, d: Math.hypot(q.x - p.px, q.y - p.py) };
  });
  return { project, residuals, maxResidual: Math.max(...residuals.map((r) => r.d)) };
}
