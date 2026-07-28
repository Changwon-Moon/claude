/**
 * 인스타그램 실제 발행 — 승인된 카드를 계정에 올린다.
 *
 * ⚠️ **지금은 쓰지 않는다 (2026-07-27 오너 결정: "발행 자동화는 안 할거야. 수동으로 올릴거야")**
 *    배포 워크플로에서 이 단계를 뺐고, 워커의 공개 경로(/cards/)도 닫았다.
 *    지금 흐름: 오너가 결재 화면에서 [JPG 내려받기]+[캡션 복사] → 인스타 앱에서 직접 업로드
 *              → 관제탑 [✅ 인스타에 올렸습니다] → published/ 에 완성본 보관.
 *    자동 발행을 다시 켜려면 세 가지를 함께 되살려야 한다:
 *      ① tower-deploy.yml 에 이 스크립트 단계  ② stage-public-cards.mjs 의 /cards/ 스테이징
 *      ③ worker.js 의 /cards/ 공개 예외 (인스타는 공개 URL로만 이미지를 가져간다)
 *    코드는 동작 검증된 상태로 남겨 둔다 — 지우면 다시 만들어야 한다.
 *
 * ── 이게 없어서 생긴 일 (2026-07-26 오너 지적)
 * 관제탑에서 [발행 승인]을 눌러도 **업로드하는 코드 자체가 없었다.**
 * 대기열(data/publish-queue.md)에 줄만 쌓이고 아무것도 올라가지 않았다.
 * 성과를 되가져오는 collect-insights.mjs 는 있는데, 정작 올리는 쪽이 비어 있었다.
 *
 * ── 흐름 (Instagram Graph API, 캐러셀 기준)
 *   ① 장마다 컨테이너 생성   POST /{ig-user}/media?image_url=…&is_carousel_item=true
 *   ② 캐러셀 묶기            POST /{ig-user}/media?media_type=CAROUSEL&children=…&caption=…
 *   ③ 발행                   POST /{ig-user}/media_publish?creation_id=…
 *   한 장짜리는 ①에서 is_carousel_item 없이 만들고 ②를 건너뛴다.
 *
 * ── 안전장치
 * - 대기열에서 **[ ] 인 줄만** 올린다. 오너 승인 없이는 아무것도 올라가지 않는다(발행 게이트).
 * - 토큰이 없으면 **아무것도 안 하고 정상 종료**한다(워크플로를 깨지 않는다).
 * - --dry-run 이면 호출 없이 무엇을 올릴지만 보여준다.
 * - 올린 줄은 [x]로 바꾸고 게시물 id를 적는다 — 두 번 올라가지 않는다.
 *
 * 실행: node scripts/publish-instagram.mjs [--dry-run] [--limit 1]
 * 필요: IG_ACCESS_TOKEN, IG_USER_ID, TOWER_URL
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE = join(ROOT, "data/publish-queue.md");
const MANIFEST = join(ROOT, "packages/tower-worker/_site/cards/index.json");
const API = "https://graph.facebook.com/v21.0";

const argv = process.argv.slice(2);
const DRY = argv.includes("--dry-run");
const LIMIT = Number((argv[argv.indexOf("--limit") + 1] || "1").replace(/\D/g, "")) || 1;

const TOKEN = process.env.IG_ACCESS_TOKEN || "";
const USER = process.env.IG_USER_ID || "";
const BASE = (process.env.TOWER_URL || "https://wirit-tower.engineerest0.workers.dev").replace(/\/+$/, "");

const norm = (s) => String(s || "").replace(/\s+/g, "").replace(/[·—\-*'"'()[\]🔥💸🏢⚠️]/g, "").toLowerCase();

if (!existsSync(QUEUE)) {
  console.log("발행 대기열이 없습니다 — 건너뜁니다.");
  process.exit(0);
}
if (!existsSync(MANIFEST)) {
  console.log("발행용 이미지가 준비되지 않았습니다 — scripts/stage-public-cards.mjs 를 먼저 실행하세요.");
  process.exit(0);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8")).sets || [];
const lines = readFileSync(QUEUE, "utf8").split(/\r?\n/);

/** 아직 안 올린 줄 + 짝지어진 이미지 세트 */
const jobs = [];
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^\s*-\s*\[( |x|X)\]\s*(.+)$/);
  if (!m || m[1] !== " ") continue;
  const title = ((m[2].match(/\*\*(.+?)\*\*/) || [])[1] || m[2]).trim();
  const set = manifest.find((s) => norm(s.title).includes(norm(title)) || norm(title).includes(norm(s.title)));
  if (!set) {
    console.log(`::warning::이미지 세트를 못 찾음 — "${title}"`);
    continue;
  }
  if (!set.files.length) {
    console.log(`::warning::올릴 이미지가 없음 — ${set.label}`);
    continue;
  }
  if (!set.caption) {
    console.log(`::warning::캡션이 없어 건너뜀 — ${set.label} (data/review/captions/${set.label}.txt)`);
    continue;
  }
  jobs.push({ lineNo: i, title, set });
  if (jobs.length >= LIMIT) break;
}

if (!jobs.length) {
  console.log("올릴 것이 없습니다(승인 대기 0건 또는 캡션 미작성).");
  process.exit(0);
}

console.log(`📮 발행 대상 ${jobs.length}건${DRY ? " (모의 실행)" : ""}`);
for (const j of jobs) {
  console.log(`   · ${j.set.label} — ${j.set.files.length}장 · 캡션 ${j.set.caption.length}자`);
  for (const f of j.set.files) console.log(`     ${BASE}/${f}`);
}

if (DRY) {
  console.log("\n모의 실행이라 실제 업로드는 하지 않았습니다.");
  process.exit(0);
}
if (!TOKEN || !USER) {
  console.log("\n⏭  IG_ACCESS_TOKEN·IG_USER_ID 가 없어 업로드를 건너뜁니다.");
  console.log("   발급 안내: docs/guides/ (M0 2단계). 토큰이 등록되면 위 목록이 그대로 올라갑니다.");
  process.exit(0);
}

async function post(path, params) {
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  const res = await fetch(`${API}${path}`, { method: "POST", body });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = {};
  }
  if (!res.ok || json.error) {
    throw new Error(`${res.status} ${json.error?.message || text.slice(0, 200)}`);
  }
  return json;
}

/** 컨테이너가 준비될 때까지 기다린다 — 인스타가 이미지를 가져오는 데 몇 초 걸린다 */
async function waitReady(id) {
  for (let i = 0; i < 12; i++) {
    const res = await fetch(`${API}/${id}?fields=status_code&access_token=${encodeURIComponent(TOKEN)}`);
    const j = await res.json().catch(() => ({}));
    if (j.status_code === "FINISHED") return;
    if (j.status_code === "ERROR") throw new Error(`컨테이너 처리 실패 (${id})`);
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error(`컨테이너가 준비되지 않음 (${id}) — 이미지 URL이 공개인지 확인하세요`);
}

let published = 0;
for (const j of jobs) {
  const { set } = j;
  try {
    const single = set.files.length === 1;
    const children = [];
    for (const f of set.files) {
      const params = { image_url: `${BASE}/${f}` };
      if (!single) params.is_carousel_item = "true";
      else params.caption = set.caption;
      const c = await post(`/${USER}/media`, params);
      await waitReady(c.id);
      children.push(c.id);
    }

    let creationId = children[0];
    if (!single) {
      const carousel = await post(`/${USER}/media`, {
        media_type: "CAROUSEL",
        children: children.join(","),
        caption: set.caption,
      });
      await waitReady(carousel.id);
      creationId = carousel.id;
    }

    const out = await post(`/${USER}/media_publish`, { creation_id: creationId });
    console.log(`✅ 발행 완료 — ${set.label} · 게시물 id ${out.id}`);

    // 두 번 올리지 않도록 대기열에 표시한다
    lines[j.lineNo] = lines[j.lineNo].replace(/^(\s*-\s*)\[ \]/, "$1[x]") + `  ← 발행됨 ${out.id}`;
    published++;
  } catch (e) {
    console.log(`::error::발행 실패 — ${set.label}: ${e.message}`);
  }
}

if (published) {
  writeFileSync(QUEUE, lines.join("\n"), "utf8");
  console.log(`\n📗 대기열 갱신 — ${published}건 발행 완료로 표시`);
}
process.exit(0);
