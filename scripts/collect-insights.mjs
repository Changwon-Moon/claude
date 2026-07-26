/**
 * 인스타 성과 회수 — 발행한 카드가 실제로 어떻게 됐는지 되가져온다.
 *
 * 발행 → 성과 → 다시 소재 발굴로 이어지는 고리의 마지막 조각이다.
 * 이게 없으면 회사는 "무엇이 터지는지" 영원히 모른 채 감으로만 만든다.
 *
 * 필요한 시크릿:
 *   IG_ACCESS_TOKEN   인스타 그래프 API 장기 토큰
 *   IG_USER_ID        인스타 비즈니스 계정 ID
 * 둘 다 M0 2단계에서 발급한다. 없으면 조용히 건너뛴다(exit 0).
 *
 * 회수 지표: 도달(reach) · **저장(saved)** · 좋아요 · 댓글
 *   저장 수가 우리 계정의 핵심 지표다 — "저장해두고 다시 볼 카드"를 만드는 계정이라서.
 *
 * 결과는 data/performance.md 표에 추가된다(이미 있는 발행일+카드는 갱신).
 *
 * 실행: node scripts/collect-insights.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PERF = join(ROOT, "data/performance.md");
const TOKEN = process.env.IG_ACCESS_TOKEN || "";
const USER = process.env.IG_USER_ID || "";

if (!TOKEN || !USER) {
  console.log("⏭ IG_ACCESS_TOKEN / IG_USER_ID 가 없어 성과 회수를 건너뜁니다.");
  console.log("  발급 전에는 data/performance.md 표에 오너가 직접 적으면 됩니다.");
  process.exit(0);
}

const API = "https://graph.facebook.com/v21.0";

async function get(path, params) {
  const u = new URL(API + path);
  for (const [k, v] of Object.entries(params || {})) u.searchParams.set(k, v);
  u.searchParams.set("access_token", TOKEN);
  const r = await fetch(u);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${r.status} · ${JSON.stringify(j.error || j).slice(0, 200)}`);
  return j;
}

/** 최근 게시물 25건 + 각 게시물의 인사이트 */
async function recentPosts() {
  const media = await get(`/${USER}/media`, {
    fields: "id,caption,timestamp,permalink,media_type",
    limit: "25",
  });
  const out = [];
  for (const m of media.data || []) {
    let reach = "", saved = "", likes = "", comments = "";
    try {
      const ins = await get(`/${m.id}/insights`, { metric: "reach,saved,likes,comments" });
      for (const row of ins.data || []) {
        const v = row.values?.[0]?.value ?? "";
        if (row.name === "reach") reach = v;
        if (row.name === "saved") saved = v;
        if (row.name === "likes") likes = v;
        if (row.name === "comments") comments = v;
      }
    } catch (e) {
      // 게시 직후엔 인사이트가 아직 없을 수 있다 — 빈칸으로 두고 다음 실행에 다시 받는다
      console.log(`  (인사이트 미제공: ${m.id} — ${e.message.slice(0, 60)})`);
    }
    out.push({
      date: (m.timestamp || "").slice(0, 10),
      // 캡션 첫 줄을 카드 이름 대신 쓴다(세트 label 매칭은 발행 스크립트가 붙일 예정)
      card: (m.caption || "").split("\n")[0].slice(0, 40) || m.id,
      reach, saved, likes, comments,
      link: m.permalink || "",
    });
  }
  return out;
}

const rows = await recentPosts();
if (!rows.length) {
  console.log("발행된 게시물이 없습니다.");
  process.exit(0);
}

// 표를 다시 쓴다 — 같은 (발행일, 카드)는 최신 수치로 갱신
const md = existsSync(PERF) ? readFileSync(PERF, "utf8") : "";
const head = "| 발행일 | 카드 | 도달 | 저장 | 좋아요 | 댓글 | 메모 |";
const sep = "|---|---|---|---|---|---|---|";

// 기존 메모는 살린다(오너가 손으로 적은 판단이 제일 값지다)
const memo = new Map();
for (const line of md.split("\n")) {
  const c = line.split("|").map((s) => s.trim());
  if (c.length >= 8 && c[1] && c[1] !== "발행일" && !c[1].startsWith("-")) memo.set(`${c[1]}|${c[2]}`, c[7] || "");
}

const body = rows
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .map((r) => `| ${r.date} | ${r.card} | ${r.reach} | ${r.saved} | ${r.likes} | ${r.comments} | ${memo.get(`${r.date}|${r.card}`) || ""} |`)
  .join("\n");

const next = md.includes(head)
  ? md.replace(new RegExp(`${head.replace(/\|/g, "\\|")}[\\s\\S]*?(?=\\n## |$)`), `${head}\n${sep}\n${body}\n`)
  : `${md}\n\n${head}\n${sep}\n${body}\n`;

writeFileSync(PERF, next, "utf8");
console.log(`📊 성과 ${rows.length}건 기록 → data/performance.md`);
const top = rows.filter((r) => r.saved !== "").sort((a, b) => Number(b.saved) - Number(a.saved))[0];
if (top) console.log(`   저장 1위: ${top.card} (${top.saved}회)`);
