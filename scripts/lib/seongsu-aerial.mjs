/**
 * 성수전략정비구역 지도 판형 — **합성 항공사진 위에 구역별 시공사를 얹는다.**
 *
 * 지도 그림 자체(항공사진 + 전체 조감도 합성)는 `scripts/make-seongsu-composite.py` 가 굽는다.
 * 이 파일은 그 위에 **글자와 표시만** 올린다.
 *
 * ── 이 파일에 좌표 계산이 없는 이유 (2026-09-06)
 * 원본 조감도가 '1구역~4구역'을 제 자리에 이미 적어 놓았고, 3D 지도에는 이름이 찍힌 단지가
 * 있다. 그 둘로 구역 자리를 정했다(데이터셋 `aerial._`). 그래서 여기서 계산할 것이 없다.
 *
 * 그 전에는 네이버 3D 화면에 사영변환으로 위경도를 얹으려 했다. 기준점을 눈으로 재야 해서
 * 잔차가 30~100px(75~250m) 났고, 지구 좌표도 기사에 적힌 대표지번 하나뿐이라 구역 중심이
 * 아니었다. 둘이 겹쳐 **한강변 재개발인데 핀이 강변북로 안쪽에 찍혔다.**
 * 계산을 잘 하는 것보다 **계산이 필요 없는 자료를 구하는 것**이 나았다.
 *
 * ── 구간 표시
 * 우리가 아는 것은 "이 구역이 이 언저리"지 "여기 정확히"가 아니다. 알약이 건물 위에 앉고
 * 꼬리(▼)가 자리를 가리킨다 — 각주에 '구간 표시'라고 적는다(오너 시안 2026-09-06).
 *
 * ── 확정과 미확정
 * 채운 알약·실선 지시선 = 시공사 확정 / 점선 알약·점선 지시선 = 미확정('유력').
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
 * @param {object} o.aerial 데이터셋의 aerial 블록 (file/width/height/crop/labelX/labelY/zoneY)
 * @param {string} o.href   템플릿에서 그림을 부를 상대 경로
 */
export function seongsuAerialSvg({ zones, aerial, href }) {
  const [cx0, cy0, cx1, cy1] = aerial.crop;
  const W = cx1 - cx0, H = cy1 - cy0;
  if (W <= 0 || H <= 0) throw new Error("aerial.crop 이 뒤집혀 있다");

  /* 알약은 **건물 위에 바로** 앉는다(오너 시안 2026-09-06). 지시선·구간 막대는 뺐다 —
   * 시안이 그렇고, 알약 아래 꼬리(▼)가 자리를 가리키면 충분하다. */
  const FS = 42, NUM = 48, PADX = 22, GAP = 12, PH = 70, TAIL = 16;
  const labelY = (aerial.labelY ?? 60) - cy0;

  const pills = zones.map((z) => {
    const lx = aerial.labelX[String(z.id)];
    if (!Number.isFinite(lx)) throw new Error(`${z.short} 의 labelX 가 없다 — 원본 그림에서 자리를 재서 데이터셋에 적는다`);
    const w = PADX * 2 + NUM + GAP + textWidth(z.builder, FS);
    const anchorX = lx - cx0;
    let x = anchorX - w / 2;
    x = Math.max(10, Math.min(W - w - 10, x));
    return { z, x, y: labelY - PH / 2, w, h: PH, anchorX };
  });

  /* 겹침은 **던져서** 잡는다 — 알약이 서로 먹으면 어느 구역이 어느 시공사인지 못 읽는다. */
  for (let i = 1; i < pills.length; i++) {
    const a = pills[i - 1], b = pills[i];
    if (a.x + a.w + 10 > b.x)
      throw new Error(`구역 표기가 겹친다: ${a.z.short}(${a.z.builder}) ↔ ${b.z.short}(${b.z.builder}) — 글자를 줄이거나 그림을 넓힌다`);
  }

  const out = [`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`];
  out.push(`<image href="${href}" x="${-cx0}" y="${-cy0}" width="${aerial.width}" height="${aerial.height}" preserveAspectRatio="none"/>`);

  for (const p of pills) {
    const { z } = p;
    const fixed = z.statusKind === "fixed";
    /* 꼬리(▼) — 알약이 가리키는 자리는 앵커 x. 알약이 가장자리에서 밀렸어도 꼬리는 제자리에. */
    const tx = Math.max(p.x + 18, Math.min(p.x + p.w - 18, p.anchorX));
    const by = p.y + p.h;
    out.push(
      `<path d="M ${(tx - TAIL).toFixed(1)} ${(by + 3).toFixed(1)} L ${tx.toFixed(1)} ${(by + TAIL + 4).toFixed(1)} L ${(tx + TAIL).toFixed(1)} ${(by + 3).toFixed(1)} Z" fill="${fixed ? z.color : "#FFFFFF"}"${fixed ? "" : ` stroke="${z.color}" stroke-width="3"`}/>`,
    );
    out.push(
      `<rect x="${(p.x - 4).toFixed(1)}" y="${p.y - 4}" width="${(p.w + 8).toFixed(1)}" height="${p.h + 8}" rx="9" fill="#F7F5F0" fill-opacity="0.8"/>` +
      `<rect x="${p.x.toFixed(1)}" y="${p.y}" width="${p.w.toFixed(1)}" height="${p.h}" rx="7" ` +
      (fixed ? `fill="${z.color}"/>` : `fill="#FFFFFF" stroke="${z.color}" stroke-width="3" stroke-dasharray="8 5"/>`),
    );
    const numFill = fixed ? "#FFFFFF" : z.color;
    const numText = fixed ? z.color : "#FFFFFF";
    out.push(
      `<circle cx="${(p.x + PADX + NUM / 2).toFixed(1)}" cy="${(p.y + p.h / 2).toFixed(1)}" r="${NUM / 2}" fill="${numFill}"/>` +
      `<text x="${(p.x + PADX + NUM / 2).toFixed(1)}" y="${(p.y + p.h / 2 + 11).toFixed(1)}" text-anchor="middle" font-size="31" font-weight="900" fill="${numText}" letter-spacing="-0.04em">${z.id}</text>` +
      `<text x="${(p.x + PADX + NUM + GAP).toFixed(1)}" y="${(p.y + p.h / 2 + 15).toFixed(1)}" font-size="${FS}" font-weight="800" fill="${fixed ? "#FFFFFF" : z.color}" letter-spacing="-0.045em">${esc(z.builder)}</text>`,
    );
  }

  /* 워터마크 — 그래픽만 잘라 써도 출처가 따라간다(토허제 지도 표준과 같은 규칙). */
  out.push(`<text x="${W - 18}" y="${H - 16}" text-anchor="end" font-size="26" font-weight="800" fill="#fff" fill-opacity="0.55" letter-spacing="-0.02em">@wirit_note</text>`);
  out.push(`</svg>`);

  const svg = out.join("");
  if (!/viewBox="0 0 \d+ \d+"/.test(svg)) throw new Error("viewBox 가 깨졌다 — 브라우저가 300×150 으로 그린다");
  return { svg, w: W, h: H };
}
