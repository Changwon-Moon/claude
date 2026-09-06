/**
 * 성수전략정비구역 1~4지구 지도 — **결정적 SVG**.
 *
 * ── 무엇이 실측이고 무엇이 개념도인가 (카드 각주에 그대로 적는다)
 *  · 4개 지구·다리·역·공원의 **위치는 전부 카카오 로컬 주소검색 좌표**다
 *    (`data/datasets/seongsu-jeongbi-2026.json`, `scripts/geocode-extra.mjs`).
 *    손으로 찍은 좌표는 0개다.
 *  · **한강의 강안선만 개념도**다. 저장소의 경계 지오데이터(seoul-districts·korea-sgg)는
 *    성수 구간에 정점이 3~4개뿐이라 동네 축척에서 쓰면 강이 꺾인 막대가 된다.
 *    그래서 강은 **모든 실측 점보다 남쪽에** 띠로 깔아 어떤 점의 위치와도 충돌하지 않게 했다.
 *    없는 정밀도를 있는 척하지 않는다.
 *
 * ── 투영
 * 등거리 근사(equirectangular). 위도 1도 = 111,320m, 경도 1도 = 111,320·cos(lat0).
 * **가로세로 축척을 같게** 둔다 — 한쪽만 늘리면 지도가 거리를 속인다.
 * 화면(bbox)은 실측 점들로 잡고, 부족한 쪽을 늘려 상자 비율에 맞춘다(찌그러뜨리지 않는다).
 *
 * ── 이름표 자리는 코드가 고른다 (CARD_CHECKLIST §2 "손으로 정하지 않는다")
 * 핀 둘레 후보 자리를 돌며 **아무것과도 안 겹치는 첫 자리**를 고르고, 못 찾으면 던진다.
 * 붐비는 핀부터 놓는다. 겹침은 빌더(여기)와 designQa 두 번, 서로 다른 방법으로 잰다.
 */

const M_LAT = 111320;
const RAD = Math.PI / 180;

/** 상자 겹침 — 여유(pad)를 두고 잰다. */
const hits = (a, b, pad = 6) =>
  a.x - pad < b.x + b.w + pad && a.x + a.w + pad > b.x - pad &&
  a.y - pad < b.y + b.h + pad && a.y + a.h + pad > b.y - pad;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * @param {object} o
 * @param {Array} o.zones      지오코딩된 지구 (lon/lat/short/builder/statusKind/color 필요)
 * @param {Array} o.landmarks  지오코딩된 랜드마크 (lon/lat/name/kind)
 * @param {number} [o.w]       SVG 가로
 * @param {number} [o.h]       SVG 세로
 */
export function seongsuMapSvg({ zones, landmarks, headline = null, w = 992, h = 660 }) {
  const pts = [...zones, ...landmarks];
  for (const p of pts) {
    if (!Number.isFinite(p.lon) || !Number.isFinite(p.lat))
      throw new Error(`좌표 없는 점: ${p.name} — 지오코딩부터 돌린다(data/geocode-queue.txt)`);
  }

  const lat0 = pts.reduce((a, p) => a + p.lat, 0) / pts.length;
  const M_LON = M_LAT * Math.cos(lat0 * RAD);

  /* ── 화면 잡기 ──
   * 실측 점 bbox 에 여유를 준 뒤, 상자 비율(w/h)에 맞게 **넓은 쪽 기준으로 늘린다.**
   * 강 띠가 들어갈 아래쪽만 조금 더 준다(RIVER_M). 위아래 비대칭은 축척이 아니라 여백이다. */
  const PAD_M = 150;        // 점 둘레 여유
  const RIVER_M = 400;      // 남쪽 강 띠 자리
  const lons = pts.map((p) => p.lon), lats = pts.map((p) => p.lat);
  let west = Math.min(...lons) - PAD_M / M_LON, east = Math.max(...lons) + PAD_M / M_LON;
  let south = Math.min(...lats) - (PAD_M + RIVER_M) / M_LAT, north = Math.max(...lats) + PAD_M / M_LAT;

  const wM = (east - west) * M_LON, hM = (north - south) * M_LAT;
  const boxAspect = w / h;
  if (wM / hM > boxAspect) {                 // 가로가 남는다 → 세로를 늘린다
    const need = wM / boxAspect - hM, d = need / 2 / M_LAT;
    south -= d; north += d;
  } else {                                    // 세로가 남는다 → 가로를 늘린다
    const need = hM * boxAspect - wM, d = need / 2 / M_LON;
    west -= d; east += d;
  }

  const X = (lon) => ((lon - west) / (east - west)) * w;
  const Y = (lat) => h - ((lat - south) / (north - south)) * h;
  const mPerPx = ((east - west) * M_LON) / w;

  /* ── 한강 — 개념도. 모든 실측 점보다 아래에 깐다. ── */
  const lowestPt = Math.max(...pts.map((p) => Y(p.lat)));
  const riverTop = Math.max(lowestPt + 70, h - 168);
  if (riverTop >= h - 24) throw new Error("강 띠 자리가 없다 — RIVER_M 을 키운다");
  const rt = (x) => riverTop + 16 * Math.sin((x / w) * Math.PI * 1.1); // 결정적인 완만한 굽이
  const riverPath = [
    `M 0 ${rt(0).toFixed(1)}`,
    ...Array.from({ length: 24 }, (_, i) => {
      const x = ((i + 1) / 24) * w;
      return `L ${x.toFixed(1)} ${rt(x).toFixed(1)}`;
    }),
    `L ${w} ${h} L 0 ${h} Z`,
  ].join(" ");

  /* ── 이름표 자리 고르기 ──
   * 이미 놓인 것(핀·이름표·강 띠)과 안 겹치는 첫 후보를 쓴다. */
  const placed = [{ x: 0, y: riverTop - 4, w, h: h - riverTop + 4, tag: "river" }];
  const CH = 15.5; // 한 글자 대략 폭(px) — 넉넉히 잡는다. 정밀 검사는 designQa 가 한다

  const pinBoxes = pts.map((p) => ({ x: X(p.lon) - 13, y: Y(p.lat) - 13, w: 26, h: 26, tag: `pin:${p.name}` }));
  placed.push(...pinBoxes);
  /* 공원은 지름 108px 짜리 면이다 — 26px 핀 상자로 재면 이름표가 그 위로 올라온다. */
  for (const lm of landmarks.filter((l) => l.kind === "park")) {
    placed.push({ x: X(lm.lon) - 56, y: Y(lm.lat) - 56, w: 112, h: 112, tag: `park:${lm.name}` });
  }

  /* 왼쪽 위가 크게 빈다 — 네 지구가 지도의 오른쪽 아래에 몰려 있기 때문이다.
   * 빈 사분면은 **데이터로** 채운다(CARD_CHECKLIST §2 여백). 자리는 장식이라 고정이지만,
   * 이름표 배치에 미리 등록해 두어 글자가 이 위로 올라오지 못하게 한다. */
  const HL = headline ? { x: 24, y: 20, w: 480, h: 98, tag: "headline" } : null;
  if (HL) placed.push(HL);

  /* 핀 둘레 12방향 × 4반경. 위쪽부터 시계 반대로 도는 순서라 같은 입력이면 같은 자리가 나온다.
   * 자리를 못 찾으면 **던진다** — 사람이 못 본 겹침이 그대로 나가는 것보다 낫다. */
  const DIRS = Array.from({ length: 12 }, (_, i) => {
    const th = -Math.PI / 2 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * (Math.PI / 6);
    return [Math.cos(th), Math.sin(th)];
  });
  const RADII = [1.0, 1.45, 1.95, 2.5];
  function place(text, cx, cy, fs, pinR) {
    const tw = text.length * (CH * (fs / 22)) + 14, th = fs * 1.35;
    for (const k of RADII) {
      for (const [ux, uy] of DIRS) {
        const d = (pinR + th / 2 + 12) * k;
        const x = cx + ux * (d + tw / 2 - th / 2) - tw / 2;
        const y = cy + uy * d - th / 2;
        const box = { x, y, w: tw, h: th, tag: `label:${text}` };
        if (x < 4 || x + tw > w - 4 || y < 4 || y + th > h - 4) continue;
        if (placed.some((q) => hits(box, q, 5))) continue;
        placed.push(box);
        return { x: x + tw / 2, y: y + th * 0.74 };
      }
    }
    throw new Error(`이름표 자리를 못 찾았다: ${text} — 지도가 붐빈다(핀을 줄이거나 상자를 키운다)`);
  }

  /* ── 그리기 ── */
  const out = [];
  out.push(`<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`);
  out.push(`<rect x="0" y="0" width="${w}" height="${h}" fill="#F4F2ED"/>`);
  out.push(`<path d="${riverPath}" fill="#CBDDE9"/>`);
  out.push(`<text x="30" y="${(riverTop + 52).toFixed(1)}" font-size="27" font-weight="800" fill="#5C7F97" letter-spacing="-0.03em">한강</text>`);

  /* 다리 — **강을 건너는 구간만** 그린다.
   * 지오코딩이 잡아 준 점은 '북단 교차로'라 강에서 한참 북쪽(성수대교는 약 700m)이다.
   * 그 점부터 아래까지 선을 그으면 다리가 아니라 큰 도로처럼 보였다(2026-09-06 첫 렌더).
   * 다리에서 확실한 사실은 **어느 경도에서 강을 건너는가**이므로 그것만 그린다. */
  for (const lm of landmarks.filter((l) => l.kind === "bridge")) {
    const x = X(lm.lon);
    out.push(`<line x1="${x.toFixed(1)}" y1="${(riverTop - 18).toFixed(1)}" x2="${x.toFixed(1)}" y2="${h}" stroke="#9AA6B2" stroke-width="10" stroke-linecap="round"/>`);
  }
  // 공원
  for (const lm of landmarks.filter((l) => l.kind === "park")) {
    out.push(`<circle cx="${X(lm.lon).toFixed(1)}" cy="${Y(lm.lat).toFixed(1)}" r="54" fill="#CFE0C4"/>`);
  }
  // 역
  for (const lm of landmarks.filter((l) => l.kind === "station")) {
    const x = X(lm.lon), y = Y(lm.lat);
    out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="#fff" stroke="#6B7684" stroke-width="4"/>`);
  }

  // 지구 핀 — 번호 원. 이름은 카드가 말한다(map-board 와 같은 원칙).
  for (const z of zones) {
    const x = X(z.lon), y = Y(z.lat);
    out.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="25" fill="${z.color}" stroke="#fff" stroke-width="5"/>` +
      `<text x="${x.toFixed(1)}" y="${(y + 10).toFixed(1)}" text-anchor="middle" font-size="29" font-weight="900" fill="#fff" letter-spacing="-0.04em">${z.id}</text>`,
    );
  }

  /* 이름표 — 붐비는 곳부터 놓는다(뒤에 놓을수록 자리가 없다). */
  const labelJobs = [
    ...zones.map((z) => ({ text: z.short, lon: z.lon, lat: z.lat, fs: 25, weight: 800, fill: z.color, r: 25 })),
    /* 다리 이름표는 **다리 그림 옆**에 붙인다. 지오코딩 점(북단 교차로)에 붙이면
     * 강에 그려진 다리와 700m 떨어져 서로 다른 것처럼 읽힌다(2026-09-06 첫 렌더). */
    ...landmarks.map((l) => ({
      text: l.name, lon: l.lon, lat: l.lat, fs: 22, weight: 700,
      fill: "#6B7684", r: l.kind === "park" ? 54 : 12,
      pinY: l.kind === "bridge" ? riverTop + 30 : null,
    })),
  ];
  const near = (j) => labelJobs.filter((k) => Math.hypot((k.lon - j.lon) * M_LON, (k.lat - j.lat) * M_LAT) < 420).length;
  labelJobs.sort((a, b) => near(b) - near(a) || a.text.localeCompare(b.text, "ko"));

  const labelSvg = [];
  for (const j of labelJobs) {
    const cx = X(j.lon), cy = j.pinY ?? Y(j.lat);
    const at = place(j.text, cx, cy, j.fs, j.r);
    labelSvg.push(
      `<text x="${at.x.toFixed(1)}" y="${at.y.toFixed(1)}" text-anchor="middle" font-size="${j.fs}" font-weight="${j.weight}" ` +
      `fill="${j.fill}" letter-spacing="-0.04em" stroke="#F4F2ED" stroke-width="5" paint-order="stroke">${esc(j.text)}</text>`,
    );
  }
  out.push(...labelSvg);

  if (HL) {
    out.push(
      `<text x="${HL.x + 8}" y="${HL.y + 32}" font-size="26" font-weight="700" fill="#6B7684" letter-spacing="-0.04em" stroke="#F4F2ED" stroke-width="6" paint-order="stroke">${esc(headline.top)}</text>` +
      `<text x="${HL.x + 8}" y="${HL.y + 86}" font-size="45" font-weight="900" fill="#1A1A1A" letter-spacing="-0.045em" stroke="#F4F2ED" stroke-width="7" paint-order="stroke">${esc(headline.big)}</text>`,
    );
  }

  // 워터마크 — 그래픽만 잘라 써도 출처가 따라간다(토허제 지도 표준과 같은 규칙).
  out.push(`<text x="${w - 26}" y="34" text-anchor="end" font-size="21" font-weight="700" fill="#111" fill-opacity="0.16" letter-spacing="-0.02em">@wirit_note</text>`);
  out.push(`</svg>`);

  const svg = out.join("");
  if (!/viewBox="0 0 \d+ \d+"/.test(svg)) throw new Error("viewBox 가 깨졌다 — 브라우저가 300×150 으로 그린다");
  return { svg, scale: `${mPerPx.toFixed(1)} m/px`, riverTop };
}
