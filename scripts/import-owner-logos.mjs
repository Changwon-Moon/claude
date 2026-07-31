/**
 * 오너가 직접 준 로고를 자산 허브에 들인다 — 여백을 잘라내고, 출처를 남긴다.
 *
 * ── 왜 필요한가 (2026-07-31)
 * 브랜드 로고 12종 중 자동 취득이 성공한 것은 3종뿐이었다. 나머지 9종은
 * Brandfetch 가 브랜드 도메인을 못 찾아 **모회사 로고로 떨어졌고**, 로그에는
 * '✅ 취득'으로 찍혀 로그만 봐서는 안 걸렸다(로고 대조표가 잡아냈다).
 * 국내 아파트 하이엔드 브랜드는 대개 모회사 사이트의 하위 페이지라 자동 취득의
 * 사정권 밖이다. 그래서 오너가 직접 줬다. 이 경로는 앞으로도 정상 경로다.
 *
 * ── 왜 여백을 잘라내는가
 * 받은 파일은 여백이 제각각이다('THE H'는 600×850 캔버스에 로고가 가운데 조그맣게
 * 들어 있다). 그대로 쓰면 라벨에서 로고만 유난히 작아 보인다. 크기를 CSS 로
 * 억지로 맞추면 파일마다 다른 값을 손으로 찍게 되고, 그건 다음 사람이 못 고친다.
 * **잉크가 있는 범위로 잘라 두면 모든 파일이 같은 규칙으로 정렬된다.**
 * 자르는 자리는 손으로 찍지 않는다 — 픽셀을 읽어 결정한다(crop-logo-symbol.mjs 와 같은 원칙).
 *
 * 실행: node scripts/import-owner-logos.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(ROOT, "packages/renderer/package.json"));
const LOGOS = join(ROOT, "templates/_shared/logos");
const UP = "/root/.claude/uploads/c2574856-dc47-5825-96a7-544a93f35f4e";

/* 오너가 올린 순서 = 오너가 적은 이름 순서. 그 대응을 여기 한 곳에만 적는다. */
const JOBS = [
  { file: "4f886256-1785480931039_image.png", slug: "thesharp", name: "더샵", owner: "포스코이앤씨" },
  { file: "9b5cbab4-1785481899985_image.png", slug: "summit", name: "써밋", owner: "대우건설" },
  { file: "96003d29-1785481935172_image.png", slug: "epyeonhansesang", name: "e편한세상", owner: "DL이앤씨" },
  { file: "5145e839-Prugio_character.png", slug: "prugio", name: "푸르지오", owner: "대우건설" },
  { file: "8de2299f-1785482054285_image.png", slug: "lottecastle", name: "롯데캐슬", owner: "롯데건설" },
  { file: "e537cc5f-1785482066420_image.png", slug: "leel", name: "르엘", owner: "롯데건설" },
  { file: "49c6397d-1785482105139_image.png", slug: "hillstate", name: "힐스테이트", owner: "현대건설" },
  { file: "0e001e18-1785482292457_image.png", slug: "theh", name: "디에이치", owner: "현대건설" },
  { file: "8599be08-HAUTERRE_logo.jpg", slug: "hauterre", name: "오티에르", owner: "포스코이앤씨" },
  { file: "3f838dc5-1785483323831_image.png", slug: "skview", name: "SK뷰", owner: "SK에코플랜트" },
  { file: "f30ec6da-1785483492387_image.png", slug: "define", name: "드파인", owner: "SK에코플랜트" },
];

const { chromium } = require("playwright-core");
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" });
const page = await browser.newPage();

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

for (const j of JOBS) {
  const src = join(UP, j.file);
  if (!existsSync(src)) { console.log(`::warning::원본 없음 — ${j.file}`); continue; }
  const mime = MIME[extname(j.file).toLowerCase()] || "image/png";
  const dataUrl = `data:${mime};base64,${readFileSync(src).toString("base64")}`;

  const r = await page.evaluate(async (u) => {
    const img = new Image();
    img.src = u;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const { data } = g.getImageData(0, 0, c.width, c.height);
    /* '잉크'는 투명하지 않으면서 흰색도 아닌 픽셀. JPG 는 흰 배경이 완전한 255 가
     * 아니라 254 언저리로 흔들리므로 문턱을 246 으로 둔다(너무 높이면 여백이 잉크가 된다). */
    let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const a = data[i + 3];
      if (a <= 24) continue;
      if (data[i] > 246 && data[i + 1] > 246 && data[i + 2] > 246) continue;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    if (x1 < 0) return null;
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const o = document.createElement("canvas");
    o.width = w; o.height = h;
    o.getContext("2d").drawImage(img, x0, y0, w, h, 0, 0, w, h);
    return { w, h, ow: c.width, oh: c.height, png: o.toDataURL("image/png").split(",")[1] };
  }, dataUrl);

  if (!r) { console.log(`::warning::잉크를 못 찾음(전부 흰색?) — ${j.name}`); continue; }
  writeFileSync(join(LOGOS, `${j.slug}.png`), Buffer.from(r.png, "base64"));
  const cut = Math.round((1 - (r.w * r.h) / (r.ow * r.oh)) * 100);
  console.log(`✅ ${j.name.padEnd(8)} → ${j.slug}.png  ${r.ow}×${r.oh} → ${r.w}×${r.h} (여백 ${cut}% 제거)`);
}
await browser.close();

/* ── 카탈로그 등록 ──
 * 출처를 '오너 직접 제공'으로 적는다. 자동 취득과 섞이면 다음 사람이
 * "이건 어디서 왔나"를 되짚을 수 없고, 그 순간 로고는 검증 불가능한 자산이 된다. */
const CAT = join(LOGOS, "catalog.json");
const cat = JSON.parse(readFileSync(CAT, "utf8"));
const byName = new Map(cat.items.map((i) => [i.name, i]));
for (const j of JOBS) {
  const entry = {
    slug: j.slug, name: j.name, kind: "logo",
    source: "오너 직접 제공 (2026-07-31)",
    license: "trademark-nominative",
    note: `${j.owner} 아파트 브랜드 · 자동 취득 실패분 · 여백 자동 절삭`,
    added: "2026-07-31",
  };
  const old = byName.get(j.name);
  if (old) Object.assign(old, entry);
  else cat.items.push(entry);
}
/* 자동 취득이 브랜드 대신 집어 온 회사 로고들은 **버리지 않는다** —
 * 카드 하단 시공사 7장에는 회사 로고가 필요하다. 이름표만 사실대로 고친다. */
const RELABEL = [
  { slug: "daewooenc", name: "대우건설" },
  { slug: "poscoenc", name: "포스코이앤씨" },
  { slug: "e", name: "DL이앤씨" },
];
for (const r of RELABEL) {
  const it = cat.items.find((i) => i.slug === r.slug);
  if (it) { it.name = r.name; it.note = "회사 로고 · 브랜드 로고를 찾다 취득됨(하단 시공사 카드용)"; }
}
writeFileSync(CAT, JSON.stringify(cat, null, 2) + "\n", "utf8");
console.log(`\n📚 카탈로그 갱신 — 항목 ${cat.items.length}개`);
