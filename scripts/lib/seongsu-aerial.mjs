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
export function seongsuAerialSvg({ zones, aerial, href }) {
  const [cx0, cy0, cx1, cy1] = aerial.crop;
  const W = cx1 - cx0, H = cy1 - cy0;
  if (W <= 0 || H <= 0) throw new Error("aerial.crop 이 뒤집혀 있다");

  const FS = 40, NUM = 46, PADX = 20, GAP = 12, PH = 66;
  const labelY = (aerial.labelY ?? 40) - cy0;
  const zoneY = (aerial.zoneY ?? aerial.labelY ?? 40) - cy0;
  const pills = zones.map((z) => {
    const lx = aerial.labelX[String(z.id)];
    if (!Number.isFinite(lx)) throw new Error(`${z.short} 의 labelX 가 없다 — 원본 그림에서 자리를 재서 데이터셋에 적는다`);
    const tw = textWidth(z.builder, FS);
    const w = PADX * 2 + NUM + GAP + tw;
    /* x 는 구역 중심 그대로. 가장자리에서 잘리지 않게만 밀어 넣는다. */
    let x = lx - cx0 - w / 2;
    x = Math.max(8, Math.min(W - w - 8, x));
    return { z, x, y: labelY - PH / 2, w, h: PH, tw, anchorX: lx - cx0 };
  });

  /* 겹침은 **던져서** 잡는다 — 알약이 서로 먹으면 어느 구역이 어느 시공사인지 못 읽는다. */
  for (let i = 1; i < pills.length; i++) {
    const a = pills[i - 1], b = pills[i];
    if (a.x + a.w + 8 > b.x)
      throw new Error(`구역 표기가 겹친다: ${a.z.short}(${a.z.builder}) ↔ ${b.z.short}(${b.z.builder}) — 글자를 줄이거나 그림을 넓힌다`);
  }

  const out = [`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`];
  out.push(`<image href="${href}" x="${-cx0}" y="${-cy0}" width="${aerial.width}" height="${aerial.height}" preserveAspectRatio="none"/>`);

  for (const p of pills) {
    const { z } = p;
    const fixed = z.statusKind === "fixed";
    const cx = p.anchorX;
    /* 알약에서 구역으로 내리는 지시선 + 구역 자리의 점.
     * **점이 아니라 구간**이라는 뜻이 되게, 끝에 가로 막대를 둔다. */
    out.push(
      `<line x1="${cx.toFixed(1)}" y1="${(p.y + p.h).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${zoneY.toFixed(1)}" stroke="${z.color}" stroke-width="5" stroke-linecap="round"${fixed ? "" : ' stroke-dasharray="9 7"'}/>` +
      `<line x1="${(cx - 74).toFixed(1)}" y1="${zoneY.toFixed(1)}" x2="${(cx + 74).toFixed(1)}" y2="${zoneY.toFixed(1)}" stroke="${z.color}" stroke-width="9" stroke-linecap="round"/>`,
    );
    out.push(
      `<rect x="${p.x.toFixed(1)}" y="${p.y}" width="${p.w.toFixed(1)}" height="${p.h}" rx="6" ` +
      (fixed
        ? `fill="${z.color}"/>`
        : `fill="#FFFFFF" fill-opacity="0.94" stroke="${z.color}" stroke-width="3" stroke-dasharray="8 5"/>`),
    );
    const numFill = fixed ? "#FFFFFF" : z.color;
    const numText = fixed ? z.color : "#FFFFFF";
    out.push(
      `<circle cx="${(p.x + PADX + NUM / 2).toFixed(1)}" cy="${(p.y + p.h / 2).toFixed(1)}" r="${NUM / 2}" fill="${numFill}"/>` +
      `<text x="${(p.x + PADX + NUM / 2).toFixed(1)}" y="${(p.y + p.h / 2 + 11).toFixed(1)}" text-anchor="middle" font-size="30" font-weight="900" fill="${numText}" letter-spacing="-0.04em">${z.id}</text>`,
    );
    out.push(
      `<text x="${(p.x + PADX + NUM + GAP).toFixed(1)}" y="${(p.y + p.h / 2 + 14).toFixed(1)}" font-size="${FS}" font-weight="800" ` +
      `fill="${fixed ? "#FFFFFF" : z.color}" letter-spacing="-0.045em">${esc(z.builder)}</text>`,
    );
  }

  /* 워터마크 — 그래픽만 잘라 써도 출처가 따라간다(토허제 지도 표준과 같은 규칙). */
  out.push(`<text x="${W - 16}" y="${H - 14}" text-anchor="end" font-size="26" font-weight="800" fill="#fff" fill-opacity="0.55" letter-spacing="-0.02em">@wirit_note</text>`);
  out.push(`</svg>`);

  const svg = out.join("");
  if (!/viewBox="0 0 \d+ \d+"/.test(svg)) throw new Error("viewBox 가 깨졌다 — 브라우저가 300×150 으로 그린다");
  return { svg, w: W, h: H };
}
