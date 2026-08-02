/**
 * 위릿 지하철 노선 카드 공용 렌더러 — 신분당·2~9호선이 공유한다.
 * 각 빌더는 얇은 설정(색·XFER·DISP·form)만 넘기고 실제 SVG/카드 생성은 여기서 한다.
 * 수치는 데이터셋에서 코드가 읽는다(오보 0).
 *
 * 기능(2026-08-01 오너 지시 반영):
 *  - 중앙 채널에 @wirit_note 세로 워터마크
 *  - '최고가' 뱃지 제거(가격 색 강조만 유지)
 *  - GTX-A~D / 월판 / 인동 / 대홍 / SRT / KTX 등 예정·고속철도 환승 뱃지(EXP)
 *  - 행정구역(구) 칩: 색 유지·투명도↑(연하게)·글자 잉크(검정)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// 예정·고속철도 환승 뱃지 [라벨, 색, 숫자여부(0=텍스트), 어두운글씨(0=흰글씨)]
export const EXP = {
  gtxa: ["GTX-A", "#DA2C7C", 0, 0], gtxb: ["GTX-B", "#00954F", 0, 0],
  gtxc: ["GTX-C", "#EF7C00", 0, 0],
  wolpan: ["월판", "#8A5A00", 0, 0], indong: ["인동", "#7E6A34", 0, 0],
  daehong: ["대홍", "#7A4FA3", 0, 0], srt: ["SRT", "#4B2E83", 0, 0], ktx: ["KTX", "#003D7A", 0, 0],
  sinansan: ["신안산", "#F06E00", 0, 0], dongbuk: ["동북", "#C2185B", 0, 0],
  seobu: ["서부", "#00796B", 0, 0], wiryesinsa: ["위신", "#5D4037", 0, 0],
  sbYongsan: ["용산연장", "#D4003B", 0, 0], sbHomaesil: ["호매실연장", "#D4003B", 0, 0],
};

const hexRgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const hexA = (h, a) => { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${a})`; };

function badgeNum(cx, cy, code, col, dark) {
  const tc = dark ? "#141821" : "#fff";
  return `<circle cx="${cx}" cy="${cy}" r="16" fill="${col}"/>`
    + `<text x="${cx}" y="${cy+6}" text-anchor="middle" fill="${tc}" font-family="Pretendard" font-weight="800" font-size="21">${code}</text>`;
}
function badgeText(cx, cy, code, col, dark) {
  const tc = dark ? "#141821" : "#fff";
  // GTX 뱃지는 라벨이 길어(‘GTX-A’) 레일에 겹쳐 → 더 작게(폰트·폭·높이 축소).
  const isGtx = /^GTX/.test(code);
  const fs = isGtx ? 11 : 14, per = isGtx ? 8 : 12, pad = isGtx ? 12 : 16, h = isGtx ? 21 : 26;
  const w = code.length * per + pad;
  return `<rect x="${cx-w/2}" y="${cy-h/2}" width="${w}" height="${h}" rx="6" fill="${col}"/>`
    + `<text x="${cx}" y="${cy+fs*0.35}" text-anchor="middle" fill="${tc}" font-family="Pretendard" font-weight="800" font-size="${fs}">${code}</text>`;
}

/**
 * cfg = { root, date, dsFile, template, color, ink, form:"caps"|"loop", capName,
 *         XFER, DISP, GUC, subtitle, title, sourceName }
 */
export function renderLineCard(cfg) {
  const ds = JSON.parse(readFileSync(join(cfg.root, cfg.dsFile), "utf8"));
  const price = {}; for (const p of ds.picks) price[p.station] = { price: p.price };
  const ORDER = ds.order, LINE = cfg.color;
  const [CR, CG, CB] = hexRgb(LINE);
  const GU = {}; for (const p of ds.picks) GU[p.station] = p.gu;
  const XFER = cfg.XFER || {}, DISP = cfg.DISP, GUC = cfg.GUC;

  const _pv = Object.values(price).map(p => p.price); const PMIN = Math.min(..._pv), PMAX = Math.max(..._pv);
  const heat = (pr) => (0.02 + (pr - PMIN) / (PMAX - PMIN || 1) * 0.13).toFixed(3);

  const W = 936, H = 962, RAILL = 368, RAILR = 568, R_TOP = 110, R_BOT = 898, RAD = 48;
  const MIDX = (RAILL + RAILR) / 2, MIDY = (R_TOP + R_BOT) / 2;
  const ys = Array.from({ length: 8 }, (_, i) => R_TOP + i * ((R_BOT - R_TOP) / 7));

  function dot(cx, cy, rep) {
    return rep ? `<circle cx="${cx}" cy="${cy}" r="18" fill="#fff" stroke="${LINE}" stroke-width="7"/>`
               : `<circle cx="${cx}" cy="${cy}" r="11" fill="${LINE}"/>`;
  }

  let svg = `<svg class="slp-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  // 중앙 채널 가로 워터마크 2곳(위·아래) — 작게, 살짝 진하게
  const wm = (yy) => `<text x="${MIDX}" y="${yy}" text-anchor="middle" fill="#141821" fill-opacity="0.09" font-family="Pretendard" font-weight="900" font-size="30" letter-spacing="1">@wirit_note</text>`;
  svg += wm(R_TOP + 118) + wm(R_TOP + 505);
  // 레일
  svg += `<line x1="${RAILL}" y1="${R_TOP}" x2="${RAILL}" y2="${R_BOT}" stroke="${LINE}" stroke-width="15" stroke-linecap="round"/>`;
  svg += `<line x1="${RAILR}" y1="${R_TOP}" x2="${RAILR}" y2="${R_BOT}" stroke="${LINE}" stroke-width="15" stroke-linecap="round"/>`;
  // 하단 U턴
  svg += `<path d="M${RAILL},${R_BOT} Q${RAILL},${R_BOT+RAD} ${RAILL+RAD},${R_BOT+RAD} L${RAILR-RAD},${R_BOT+RAD} Q${RAILR},${R_BOT+RAD} ${RAILR},${R_BOT}" stroke="${LINE}" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (cfg.form === "loop") {
    // 상단 U턴(닫힘) + 노선명 필
    svg += `<path d="M${RAILL},${R_TOP} Q${RAILL},${R_TOP-RAD} ${RAILL+RAD},${R_TOP-RAD} L${RAILR-RAD},${R_TOP-RAD} Q${RAILR},${R_TOP-RAD} ${RAILR},${R_TOP}" stroke="${LINE}" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const lw = cfg.capName.length * 24 + 44;
    svg += `<rect x="${MIDX-lw/2}" y="${R_TOP-RAD-46}" width="${lw}" height="42" rx="21" fill="${LINE}"/>`;
    svg += `<text x="${MIDX}" y="${R_TOP-RAD-18}" text-anchor="middle" fill="#fff" font-family="Pretendard" font-weight="800" font-size="23">${cfg.capName}</text>`;
  } else {
    // 종점 캡(양쪽 상단)
    const cw = Math.max(110, cfg.capName.length * 24 + 40);
    for (const cx of [RAILL, RAILR]) {
      svg += `<rect x="${cx-cw/2}" y="${R_TOP-102}" width="${cw}" height="42" rx="21" fill="${LINE}"/>`;
      svg += `<text x="${cx}" y="${R_TOP-74}" text-anchor="middle" fill="#fff" font-family="Pretendard" font-weight="800" font-size="24">${cfg.capName}</text>`;
      svg += `<line x1="${cx}" y1="${R_TOP-60}" x2="${cx}" y2="${R_TOP}" stroke="${LINE}" stroke-width="15"/>`;
    }
  }

  const cards = [];
  for (let i = 0; i < 8; i++) {
    const y = ys[i];
    for (const [name, cx, side] of [[ORDER[i], RAILL, "L"], [ORDER[15 - i], RAILR, "R"]]) {
      const rep = !!price[name];
      svg += dot(cx, y, rep);
      const xf = XFER[name];
      if (xf) {
        const n = xf.length, bx = side === "L" ? cx + 56 : cx - 56, gap = n >= 4 ? 27 : 31;
        xf.forEach((b, k) => {
          const [code, col, isNum, dark] = b; const by = y + (k - (n - 1) / 2) * gap;
          svg += isNum ? badgeNum(bx, by, code, col, dark) : badgeText(bx, by, code, col, dark);
        });
      }
      const boxW = 352;
      const styleL = side === "L" ? `left:6px;width:${boxW}px;` : `left:${W-6-boxW}px;width:${boxW}px;`;
      const align = side === "L" ? "r" : "l";
      if (rep) {
        const pr = price[name].price, gu = GU[name], guc = hexA(GUC[gu], 0.16), top = (pr >= PMAX - 0.001);
        const bg = `background:rgba(${CR},${CG},${CB},${heat(pr)});`;
        const prDisp = (Math.round((pr + 1e-9) * 10) / 10).toFixed(1);
        const sub = cfg.SUB && cfg.SUB[name];   // 전용면적 예외 표기(예: 전용 101㎡ 기준) — 약하게
        cards.push({ style: `${styleL}top:${Math.round(y-44)}px;${bg}`, align, rep: true, name, danji: DISP[name], sub, pr: prDisp, gu, guc, top });
      } else {
        const gu = GU[name] || (cfg.nameOnly && cfg.nameOnly[name]) || "";
        const guc = GUC[gu] ? hexA(GUC[gu], 0.16) : "transparent";
        cards.push({ style: `${styleL}top:${Math.round(y-34)}px;`, align, rep: false, name, gu, guc });
      }
    }
  }
  svg += `</svg>`;

  const card = { template: cfg.template, date: cfg.date, subtitle: cfg.subtitle, title: cfg.title, svg, cards, source: { name: cfg.sourceName || "국토부 실거래가" } };
  const outDir = join(cfg.root, `data/content/${cfg.date}`); mkdirSync(outDir, { recursive: true });
  const outName = cfg.template.split("@")[0] + ".json";
  writeFileSync(join(outDir, outName), JSON.stringify(card, null, 2) + "\n");
  console.log(`✅ ${cfg.capName} → data/content/${cfg.date}/${outName} (카드 ${cards.length})`);
}
