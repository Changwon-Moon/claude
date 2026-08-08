/**
 * 세션 보드 조립 — 흩어진 세션 일지를 **한 화면**으로 모은다.
 *
 * 만드는 것 둘:
 *   data/sessions/BOARD.md            깃허브에서 바로 읽는 판
 *   packages/tower-worker/_site/sessions.html   관제탑에 붙는 판
 *
 * ── 왜 관제탑 본체를 안 건드리나
 * 관제탑(dashboard-static)은 큰 앱이고 스모크 검사 130항이 걸려 있다.
 * 탭 하나 넣자고 그걸 흔들면, 오늘 겪은 "공용 자산 건드려 카드 깨진" 사고를 내가 반복한다.
 * **별도 페이지로 붙이고 링크만 건다.** 나중에 자리 잡으면 그때 흡수해도 늦지 않다.
 *
 * ── 끊긴 세션 처리
 * 세션이 죽으면 '진행중' 인 채로 영원히 남는다. 그러면 보드가 거짓말을 한다.
 * 마지막 기록이 **6시간** 넘게 멈춘 '진행중' 은 **'끊김?'** 으로 표시한다 —
 * 지우지 않는다. 지우면 왜 멈췄는지도 같이 사라진다.
 *
 * 실행: node scripts/build-session-board.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "data/sessions");
const SITE = join(ROOT, "packages/tower-worker/_site");

/** 이 시간 넘게 '진행중' 이면 끊긴 것으로 본다 */
const STALE_HOURS = 6;

const entries = existsSync(DIR)
  ? readdirSync(DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        try {
          return JSON.parse(readFileSync(join(DIR, f), "utf8"));
        } catch {
          return null;
        }
      })
      .filter(Boolean)
  : [];

const now = Date.now();
const hoursAgo = (iso) => (now - new Date(iso).getTime()) / 3600000;

/** 사람이 읽는 시각 — "방금", "2시간 전", "어제" */
function ago(iso) {
  const h = hoursAgo(iso);
  if (h < 0.05) return "방금";
  if (h < 1) return `${Math.round(h * 60)}분 전`;
  if (h < 24) return `${Math.round(h)}시간 전`;
  const d = Math.round(h / 24);
  return d === 1 ? "어제" : `${d}일 전`;
}

for (const e of entries) {
  e._stale = e.status === "진행중" && hoursAgo(e.updatedAt) > STALE_HOURS;
  e._label = e._stale ? "끊김?" : e.status;
}

/* 진행중 → 막힘 → 끊김 → 끝 순으로, 같은 등급 안에서는 최신순.
   지금 봐야 할 것이 위로 온다. */
const rank = (e) => (e.status === "진행중" && !e._stale ? 0 : e.status === "막힘" ? 1 : e._stale ? 2 : 3);
entries.sort((a, b) => rank(a) - rank(b) || b.updatedAt.localeCompare(a.updatedAt));

const live = entries.filter((e) => rank(e) === 0).length;
const blocked = entries.filter((e) => e.status === "막힘").length;
const stale = entries.filter((e) => e._stale).length;

/* ══════════ 1) 깃허브에서 읽는 판 ══════════ */
const md = [];
md.push("# 세션 보드");
md.push("");
md.push(`> 지금 **진행중 ${live}** · 막힘 ${blocked} · 끊김 ${stale} · 전체 ${entries.length}`);
md.push("> ");
md.push("> 여러 코워크 세션이 같은 저장소를 민다. 서로 뭘 하는지 몰라서 겹치거나 덮어쓰는 일이 있었다.");
md.push("> 이 보드는 **겹치는 것**을 막는다. 망가지는 것은 문지기(guard)가 막는다 — 다른 문제다.");
md.push("> ");
md.push("> 만든 법: `node scripts/session-log.mjs start \"무엇을 하는지\"` · 자동 조립 `build-session-board.mjs`");
md.push("");

if (!entries.length) {
  md.push("_아직 기록된 세션이 없습니다._");
  md.push("");
  md.push("세션을 시작할 때 이렇게 남깁니다:");
  md.push("```");
  md.push('node scripts/session-log.mjs start "무슨 작업을 하는지 한 줄"');
  md.push("```");
} else {
  md.push("| 상태 | 세션 | 하는 일 | 마지막 소식 | 언제 |");
  md.push("|---|---|---|---|---|");
  for (const e of entries) {
    const badge = { "진행중": "🟢 진행중", "막힘": "🔴 막힘", "끊김?": "⚪ 끊김?", "끝": "✅ 끝" }[e._label];
    md.push(`| ${badge} | \`${e.session}\` | ${e.task} | ${e.last ?? ""} | ${ago(e.updatedAt)} |`);
  }
  md.push("");
  md.push("---");
  md.push("");
  md.push(`⚪ **끊김?** 은 ${STALE_HOURS}시간 넘게 '진행중' 인 채 멈춘 세션이다.`);
  md.push("세션이 죽으면 그렇게 남는다. **지우지 않는다** — 지우면 왜 멈췄는지도 같이 사라진다.");
}

writeFileSync(join(DIR, "BOARD.md"), md.join("\n") + "\n", "utf8");

/* ══════════ 2) 관제탑에 붙는 판 ══════════ */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const color = { "진행중": "#16a34a", "막힘": "#dc2626", "끊김?": "#9ca3af", "끝": "#2563eb" };

const rows = entries.length
  ? entries.map((e) => `
    <div class="row">
      <span class="dot" style="background:${color[e._label]}"></span>
      <div class="body">
        <div class="task">${esc(e.task)}</div>
        <div class="last">${esc(e.last ?? "")}</div>
        <div class="meta"><b style="color:${color[e._label]}">${esc(e._label)}</b> · ${esc(e.session)} · ${esc(ago(e.updatedAt))}</div>
      </div>
    </div>`).join("")
  : `<p class="empty">아직 기록된 세션이 없습니다.<br><code>node scripts/session-log.mjs start "무엇을 하는지"</code></p>`;

const html = `<!doctype html><html lang="ko"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>세션 보드 · 위릿 관제탑</title>
<style>
  :root{--ink:#111827;--paper:#fafaf9;--line:#e5e7eb;--dim:#6b7280}
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);
       font-family:Pretendard,system-ui,-apple-system,"Apple SD Gothic Neo",sans-serif;line-height:1.5}
  header{background:var(--ink);color:#fff;padding:18px 20px}
  header h1{margin:0;font-size:19px;letter-spacing:-.02em}
  header p{margin:6px 0 0;font-size:13px;color:#d1d5db}
  main{max-width:760px;margin:0 auto;padding:16px 20px 48px}
  .sum{display:flex;gap:14px;flex-wrap:wrap;margin:4px 0 18px;font-size:14px;color:var(--dim)}
  .sum b{color:var(--ink)}
  .row{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid var(--line)}
  .dot{width:10px;height:10px;border-radius:50%;margin-top:7px;flex:0 0 10px}
  .task{font-weight:700;font-size:16px;letter-spacing:-.01em}
  .last{font-size:14px;color:#374151;margin-top:2px}
  .meta{font-size:12px;color:var(--dim);margin-top:5px}
  .note{margin-top:22px;font-size:13px;color:var(--dim);border-top:1px solid var(--line);padding-top:14px}
  .empty{color:var(--dim);font-size:14px}
  code{background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:13px}
  a{color:#2563eb}
</style>
<header>
  <h1>세션 보드</h1>
  <p>여러 코워크 세션이 지금 무엇을 하고 있나</p>
</header>
<main>
  <div class="sum">
    <span>🟢 진행중 <b>${live}</b></span>
    <span>🔴 막힘 <b>${blocked}</b></span>
    <span>⚪ 끊김 <b>${stale}</b></span>
    <span>전체 <b>${entries.length}</b></span>
  </div>
  ${rows}
  <p class="note">
    ⚪ <b>끊김</b> 은 ${STALE_HOURS}시간 넘게 '진행중' 인 채 멈춘 세션입니다.
    세션이 죽으면 그렇게 남습니다 — 지우지 않습니다. 지우면 왜 멈췄는지도 같이 사라집니다.<br><br>
    이 보드는 세션끼리 <b>겹치는 것</b>을 막습니다.
    망가지는 것은 문지기(guard)가 막습니다 — 다른 문제입니다.<br><br>
    <a href="/">← 관제탑으로</a>
  </p>
</main>
</html>`;

if (existsSync(SITE)) {
  writeFileSync(join(SITE, "sessions.html"), html, "utf8");
  console.log(`✅ 세션 보드 → _site/sessions.html · data/sessions/BOARD.md`);
} else {
  mkdirSync(join(ROOT, "data/sessions"), { recursive: true });
  console.log(`✅ 세션 보드 → data/sessions/BOARD.md (_site 가 없어 HTML 은 건너뜀)`);
}
console.log(`   진행중 ${live} · 막힘 ${blocked} · 끊김 ${stale} · 전체 ${entries.length}`);
