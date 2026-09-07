/**
 * 성수전략정비구역 지도 판형 — **1~4구역이 이미 표기된 전체 조감도 위에 시공사를 얹는다.**
 *
 * ── 왜 계산이 없나 (2026-09-06)
 * 이 파일에는 좌표 계산이 한 줄도 없다. 그게 핵심이다.
 * 원본 조감도가 **'1구역~4구역'을 제 자리에 이미 적어 놓았기 때문**에, 우리가 위경도를
 * 그림에 얹을 일이 없다. 하는 일은 그 글자줄을 잘라내고 **같은 가로 자리에** 우리 표기
 * (번호·시공사·확정 여부)를 올리는 것뿐이다.
 *
 * 그 전에는 네이버 3D 항공 화면에 사영변환으로 핀을 얹으려 했다. 기준점을 화면에서 눈으로
 * 재야 해서 잔차가 30~100px(75~250m) 났고, 지구 좌표도 기사에 적힌 대표지번 하나뿐이라
 * 구역 중심이 아니었다. 둘이 겹쳐 **한강변 재개발인데 핀이 내륙에 찍혔다.**
 * 계산을 잘 하는 것보다 **계산이 필요 없는 자료를 구하는 것**이 나았다.
 *
 * ── 확정과 미확정
 * 채운 알약 = 시공사 확정 / 점선 테두리 알약 = 미확정('유력').
 * 카드 아래 네 칸의 배지와 같은 문법이다 — 한 카드 안에서 같은 뜻은 같은 모양이어야 한다.
 */

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** 글자 폭 어림 — 한글은 거의 정사각, 라틴·숫자는 좁다. 넉넉히 잡는다(겹치면 던진다). */
function textWidth(s, fs) {
  let w = 0;
  for (const ch of s) w += /[ㄱ-힝]/.test(ch) ? fs * 1.0 : fs * 0.58;
  return w;
}

/**
 * @param {object} o
 * @param {Array} o.zones   {id, short, builder, statusKind, color}
 * @param {object} o.aerial 데이터셋의 aerial 블록 (file/width/height/crop/labelX)
 * @param {string} o.href   템플릿에서 그림을 부를 상대 경로
 */
export function seongsuAerialSvg({ zones, aerial, href, photoHref = null }) {
  const [cx0, cy0, cx1, cy1] = aerial.crop;
  const W = cx1 - cx0, H = cy1 - cy0;
  if (W <= 0 || H <= 0) throw new Error("aerial.crop 이 뒤집혀 있다");

  /* ── 투시도 인셋 ──
   * 오너 요청(2026-09-06): *"투시도를 이용해서 지도 위에 올려줄 수 있어?"*
   * 각 구역의 투시도를 지도 위쪽에 액자로 걸고, 지시선으로 그 구역까지 내린다.
   * 액자 아래 띠에 시공사 이름 — 액자와 이름이 붙어 있어야 어느 구역 것인지 안 헷갈린다.
   *
   * 크기는 **네 장이 나란히 들어가는 폭**이 정한다. 손으로 정하지 않고 계산한다 —
   * 자료가 늘거나 그림 폭이 바뀌면 그때마다 다시 재야 하기 때문이다.
   * 자리를 못 잡으면(겹치면) 던진다. */
  const zoneY = (aerial.zoneY ?? 0) - cy0;
  const MARGIN = 26, GAP = 44, CAP = 54, TOP = 20;
  const TW = Math.floor((W - MARGIN * 2 - GAP * (zones.length - 1)) / zones.length);
  const TH = Math.round(TW / 2.26);            // 조감도 크롭 비율과 같다
  const FS = Math.round(TW * 0.115);           // 시공사 이름 — 액자 폭에 연동
  if (TW < 180) throw new Error(`투시도 액자가 너무 좁다(${TW}px) — 그림을 넓히거나 구역을 줄인다`);

  const shots = zones.map((z, i) => {
    const lx = aerial.labelX[String(z.id)];
    if (!Number.isFinite(lx)) throw new Error(`${z.short} 의 labelX 가 없다 — 원본 그림에서 자리를 재서 데이터셋에 적는다`);
    /* 액자는 제 구역 위에 놓되, 네 장이 겹치지 않도록 **순서대로 최소 자리**를 잡는다. */
    const want = lx - cx0 - TW / 2;
    const minX = MARGIN + i * (TW + GAP);
    const maxX = W - MARGIN - (zones.length - i) * TW - (zones.length - 1 - i) * GAP;
    if (minX > maxX) throw new Error("투시도 액자가 폭에 안 들어간다");
    return { z, x: Math.round(Math.min(Math.max(want, minX), maxX)), anchorX: lx - cx0 };
  });
  for (let i = 1; i < shots.length; i++) {
    if (shots[i - 1].x + TW + 6 > shots[i].x)
      throw new Error(`투시도 액자가 겹친다: ${shots[i - 1].z.short} ↔ ${shots[i].z.short}`);
  }

  const out = [`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`];
  out.push(`<image href="${href}" x="${-cx0}" y="${-cy0}" width="${aerial.width}" height="${aerial.height}" preserveAspectRatio="none"/>`);

  for (const sh of shots) {
    const { z } = sh;
    const fixed = z.statusKind === "fixed";
    const cx = sh.x + TW / 2;
    const capBottom = TOP + TH + CAP;
    /* 액자 → 구역 지시선. 확정은 실선, 미확정은 점선 — 카드 전체에서 같은 문법이다. */
    if (zoneY > capBottom + 10) {
      out.push(
        `<line x1="${cx.toFixed(1)}" y1="${capBottom}" x2="${sh.anchorX.toFixed(1)}" y2="${(zoneY - 10).toFixed(1)}" stroke="${z.color}" stroke-width="5" stroke-linecap="round"${fixed ? "" : ' stroke-dasharray="9 7"'}/>` +
        `<line x1="${(sh.anchorX - 82).toFixed(1)}" y1="${zoneY.toFixed(1)}" x2="${(sh.anchorX + 82).toFixed(1)}" y2="${zoneY.toFixed(1)}" stroke="${z.color}" stroke-width="10" stroke-linecap="round"/>`,
      );
    }
    /* 액자 — 시공사 색 테두리. 사진은 clipPath 로 액자 안에 가둔다. */
    const cid = `shot${z.id}`;
    out.push(
      `<clipPath id="${cid}"><rect x="${sh.x}" y="${TOP}" width="${TW}" height="${TH}" rx="3"/></clipPath>` +
      `<rect x="${sh.x - 7}" y="${TOP - 7}" width="${TW + 14}" height="${TH + CAP + 11}" rx="6" fill="#F7F5F0"/>` +
      `<rect x="${sh.x - 3}" y="${TOP - 3}" width="${TW + 6}" height="${TH + CAP + 3}" rx="4" fill="${z.color}"/>` +
      `<image href="${photoHref(z)}" x="${sh.x}" y="${TOP}" width="${TW}" height="${TH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${cid})"/>`,
    );
    /* 아래 띠 — 번호 + 시공사. 미확정이면 이름 옆에 점선 테두리 '유력'을 붙인다. */
    const capY = TOP + TH;
    out.push(
      `<circle cx="${(sh.x + 26).toFixed(1)}" cy="${(capY + CAP / 2).toFixed(1)}" r="17" fill="#fff"/>` +
      `<text x="${(sh.x + 26).toFixed(1)}" y="${(capY + CAP / 2 + 8).toFixed(1)}" text-anchor="middle" font-size="23" font-weight="900" fill="${z.color}">${z.id}</text>` +
      `<text x="${(sh.x + 50).toFixed(1)}" y="${(capY + CAP / 2 + 11).toFixed(1)}" font-size="${FS}" font-weight="800" fill="#fff" letter-spacing="-0.045em">${esc(z.builder)}</text>`,
    );
    if (!fixed) {
      const bw = 68, bx = sh.x + TW - bw - 10;
      out.push(
        `<rect x="${bx}" y="${(capY + CAP / 2 - 15).toFixed(1)}" width="${bw}" height="30" rx="3" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 4"/>` +
        `<text x="${(bx + bw / 2).toFixed(1)}" y="${(capY + CAP / 2 + 7).toFixed(1)}" text-anchor="middle" font-size="20" font-weight="800" fill="#fff" letter-spacing="-0.04em">유력</text>`,
      );
    }
  }

  /* 워터마크 — 그래픽만 잘라 써도 출처가 따라간다(토허제 지도 표준과 같은 규칙). */
  out.push(`<text x="${W - 16}" y="${H - 14}" text-anchor="end" font-size="26" font-weight="800" fill="#fff" fill-opacity="0.55" letter-spacing="-0.02em">@wirit_note</text>`);
  out.push(`</svg>`);

  const svg = out.join("");
  if (!/viewBox="0 0 \d+ \d+"/.test(svg)) throw new Error("viewBox 가 깨졌다 — 브라우저가 300×150 으로 그린다");
  return { svg, w: W, h: H };
}
