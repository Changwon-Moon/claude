/**
 * 한강 — **손으로 그리지 않는다.** 이북 구와 이남 구가 공유하는 경계 정점을 경도순으로 이으면
 * 선이 정확히 구 경계 위에 놓인다. 양 끝단(서쪽 강서·동쪽 하남)은 서울/경기 '시계'라
 * 공유 정점이 없어 해당 구의 북쪽 링 정점을 이어붙인다.
 *
 * ── 왜 이 파일인가 (2026-09-01)
 * 이 로직은 `tohuh-map.mjs` 안에 있었고, 그 파일은 스스로 이렇게 적어 두었다 —
 *   *"복사하면 한강 로직을 한 번 고칠 때 두 곳을 고쳐야 하고, 한 곳을 빠뜨리면
 *     같은 수도권인데 강 모양이 다른 지도가 계정에 섞인다."*
 * 학군지 지도에도 한강을 넣으라는 오너 지시가 와서, 복사하는 대신 여기로 뽑았다.
 * **경계 데이터가 달라도(2013 시군구 / 2026 시군구) 같은 규칙으로 뽑히도록** 지오 소스를
 * 인자로 받는다 — 이 파일은 '어느 구가 강 북쪽/남쪽인가'만 안다.
 */

/** 강 북쪽 시군구. 구리=이북. */
export const RIVER_NORTH = new Set([
  "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구",
  "성북구", "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구", "구리시",
]);
/** 강 남쪽 시군구. 하남·강동=이남. */
export const RIVER_SOUTH = new Set([
  "양천구", "강서구", "구로구", "금천구", "영등포구", "동작구", "관악구",
  "서초구", "강남구", "송파구", "강동구", "하남시",
]);
/** 서쪽 꼬리 — 강서구 북쪽 링(건너편 고양시). 공유 정점이 없는 구간이다. */
export const RIVER_WEST_TAIL = [[126.807, 37.6012], [126.8225, 37.588]];
/** 동쪽 꼬리 — 하남시 북쪽 링(건너편 남양주). */
export const RIVER_EAST_TAIL = [[127.2014, 37.5883], [127.2364, 37.5549]];

/**
 * 공유 정점을 뽑아 한강 좌표열(경도순)을 돌려준다.
 * @param {Array<{name:string, rings:Array<Array<[number,number]>>}>} named
 *        시군구 이름과 그 폴리곤 링들. 호출자가 자기 지오 소스에서 만들어 넘긴다.
 * @param {object} [o]
 * @param {number} [o.minCore=8] 공유 정점이 이보다 적으면 던진다 — 조용히 짧은 강이 되면
 *        지도만 보고는 알 수 없다.
 * @param {boolean} [o.tails=true] 양 끝 꼬리를 붙일지.
 * @returns {Array<[number,number]>} [lon, lat] 배열
 */
export function hanRiverPoints(named, { minCore = 8, tails = true } = {}) {
  const vkey = (p) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`;
  const nPts = new Map(), sPts = new Map();
  for (const { name, rings } of named) {
    const bag = RIVER_NORTH.has(name) ? nPts : RIVER_SOUTH.has(name) ? sPts : null;
    if (!bag) continue;
    for (const r of rings) for (const p of r) bag.set(vkey(p), p);
  }
  const core = [...nPts.keys()]
    .filter((k) => sPts.has(k))
    .map((k) => nPts.get(k))
    .sort((a, b) => a[0] - b[0]);
  if (core.length < minCore)
    throw new Error(`한강 경계 정점 부족(${core.length} < ${minCore}) — 경계 데이터를 확인하세요.`);
  return tails ? [...RIVER_WEST_TAIL, ...core, ...RIVER_EAST_TAIL] : core;
}
