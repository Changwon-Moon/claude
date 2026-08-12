/**
 * 상태 빌더: 저장소 산출물 → 하나의 TowerState.
 * 결정적: 동일 저장소 상태 = 동일 JSON (Date.now 미사용, 날짜는 콘텐츠에서 파생).
 */
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, basename } from "node:path";
import { P, REPO_ROOT } from "./paths.js";
import { STAGES, RUBRIC_LABELS } from "./types.js";
import type { TowerState, Ticket, TimelineEntry, Idea, IdeaCat, Evidence, ArchiveFolder, PublishedPost, PerfRow, RequestRow } from "./types.js";
import { parseBrief } from "./parse/brief.js";
import { parseDecisionLog } from "./parse/decisionLog.js";
import { parseCeoPrinciples, parseTeamCard } from "./parse/company.js";
import { buildAssetGroups } from "./parse/assets.js";
import { collectProduced } from "./parse/produced.js";
import { shrinkAll, shrinkKey, THUMB_W } from "./parse/thumbs.js";

const TEAM_ORDER = [
  "trend-analysis",
  "research",
  "planning",
  "asset-hub",
  "editing",
  "qa",
  "design",
  "marketing",
  "orchestrator",
];

/** data-uri 의 확장자를 고른다. 축소가 되면 JPEG, 브라우저가 없어 원본이면 PNG 그대로다. */
function extOf(uri: string): string {
  const m = /^data:image\/([a-z0-9.+-]+);base64,/i.exec(uri);
  const t = (m?.[1] || "jpeg").toLowerCase();
  return t === "jpeg" || t === "jpg" ? "jpg" : t === "svg+xml" ? "svg" : t;
}

/**
 * `images` 맵의 base64 를 파일로 뽑고, 맵의 값을 **상대 경로**로 바꿔치기한다(제자리 수정).
 *
 * base64 가 아닌 값(이미 `download/…jpg` 같은 경로)은 건드리지 않는다.
 * 파일이 못 써지면 base64 를 그대로 둔다 — 무거운 게 안 뜨는 것보다 낫다.
 * 매번 디렉터리를 비우고 다시 쓰므로 지운 카드의 썸네일이 남지 않는다(결정적).
 */
function writeThumbFiles(images: Record<string, string>): void {
  const keys = Object.keys(images).filter((k) => images[k].startsWith("data:image/"));
  if (!keys.length) return;
  try {
    rmSync(P.thumbsOut, { recursive: true, force: true });
    mkdirSync(P.thumbsOut, { recursive: true });
  } catch {
    return; // 디렉터리를 못 만들면 base64 유지
  }
  let bytes = 0;
  let wrote = 0;
  for (const k of keys) {
    const uri = images[k];
    const comma = uri.indexOf(",");
    try {
      const buf = Buffer.from(uri.slice(comma + 1), "base64");
      const name = `${k}.${extOf(uri)}`;
      writeFileSync(join(P.thumbsOut, name), buf);
      images[k] = `thumbs/${name}`;
      bytes += buf.length;
      wrote++;
    } catch {
      /* 이 장만 base64 로 남는다 */
    }
  }
  if (wrote) console.log(`   썸네일 ${wrote}장을 파일로 분리: ${Math.round(bytes / 1024)}KB (HTML 밖으로)`);
}

function normTitle(s: string): string {
  return s.replace(/\s+/g, "").replace(/[·—\-]/g, "").toLowerCase();
}

/** .git에서 owner/repo/branch를 읽어 GitHub 편집 링크 재료를 만든다. 실패해도 안전한 기본값. */
function detectRepo(): { owner: string; name: string; branch: string } {
  let owner = "";
  let name = "";
  let branch = "main";
  try {
    const cfg = readFileSync(join(REPO_ROOT, ".git/config"), "utf8");
    const m = cfg.match(/url\s*=\s*.*?[/:]([^/]+)\/([^/\s.]+)(?:\.git)?\s*$/m);
    if (m) {
      owner = m[1];
      name = m[2];
    }
  } catch {
    /* noop */
  }
  try {
    const head = readFileSync(join(REPO_ROOT, ".git/HEAD"), "utf8").trim();
    const m = head.match(/ref:\s*refs\/heads\/(.+)$/);
    if (m) branch = m[1];
  } catch {
    /* noop */
  }
  return { owner, name, branch };
}

function latestBrief(): { id: string; md: string } | null {
  if (!existsSync(P.briefs)) return null;
  const files = readdirSync(P.briefs)
    .filter((f) => f.endsWith(".md"))
    .sort();
  if (!files.length) return null;
  const f = files[files.length - 1];
  return { id: f.replace(/\.md$/, ""), md: readFileSync(join(P.briefs, f), "utf8") };
}

/** 콘텐츠·브리핑에서 가장 최근 날짜(YYYY-MM-DD)를 결정적으로 뽑아 라벨 생성 */
function deriveDateLabel(brief: { id: string } | null): { from: string; label: string } {
  const dates: string[] = [];
  if (existsSync(P.content)) {
    for (const d of readdirSync(P.content)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) dates.push(d);
    }
  }
  if (brief) {
    const m = brief.id.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) dates.push(`${m[1]}-${m[2]}-${m[3]}`);
  }
  dates.sort();
  const iso = dates.length ? dates[dates.length - 1] : "2026-01-01";
  const [y, mo, da] = iso.split("-");
  const dow = ["일", "월", "화", "수", "목", "금", "토"];
  // 요일 계산(결정적, Date 파싱은 순수 함수)
  const idx = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return { from: iso, label: `${y.slice(2)}.${mo}.${da}(${dow[idx]})` };
}

export async function buildState(): Promise<TowerState> {
  // ── 이미지 인터너
  // 같은 그림은 한 번만 싣고 키로 참조한다. 여기에 더해 **쓰일 크기**를 함께 기억해서,
  // 나중에 그 크기로 축소한 판본만 최종 HTML에 넣는다.
  //   목록 썸네일(THUMB_W) : 어느 카드인지 알아보는 용도
  //   상세 캐러셀(PAGE_W)  : 실제로 읽고 승인하는 용도 — 발행 후보에만 붙인다
  // (원본 2160×2700 PNG를 그대로 넣으면 장당 870KB, 9장에 7.85MB가 된다)
  const images: Record<string, string> = {};
  const byKey = new Map<string, string>();
  const jobs: { uri: string; width: number }[] = [];
  function intern(uri: string | null | undefined, width: number = THUMB_W): string | null {
    if (!uri) return null;
    const ck = shrinkKey(uri, width);
    let k = byKey.get(ck);
    if (!k) {
      k = `img${byKey.size + 1}`;
      byKey.set(ck, k);
      images[k] = uri; // 축소 전 원본. 아래에서 축소본으로 바꿔 넣는다
      jobs.push({ uri, width });
    }
    return k;
  }

  const brief = latestBrief();
  const candidates = brief ? parseBrief(brief.md, brief.id) : [];

  const decided = existsSync(P.decisionLog)
    ? parseDecisionLog(readFileSync(P.decisionLog, "utf8"))
    : [];

  // 렌더 완료 산출물로 결정 티켓 승격 + 디자인 타임라인
  const produced = collectProduced(P.content, P.out, P.review);
  const usedProduced = new Set<string>();

  for (const t of decided) {
    const match = produced.find((p) => normTitle(p.title).includes(normTitle(t.title)) || normTitle(t.title).includes(normTitle(p.title)));
    if (match) {
      usedProduced.add(match.slug + "@" + match.date);
      const key = intern(match.thumb);
      t.stage = 4; // 승인대기 (렌더 완료·발행 전)
      t.thumb = key;
      // 캡션이 있는 세트 = 실제 발행 후보 → 상세에서 읽을 수 있게 큰 판본을 싣는다.
      // 나머지는 목록에서 알아보기만 하면 되므로 큰 판본을 만들지 않는다.
      // 결재 화면의 카드 큰 판본은 HTML에 박지 않는다(base64 임베드 → 4MB 사고).
      // 같은 사이트의 /download/{label}-{n}.jpg (stage-public-cards 가 만든 원본)를 참조한다.
      t.pages = match.caption && match.setLabel
        ? match.pages.map((_, i) => `download/${match.setLabel}-${i + 1}.jpg`)
        : [];
      t.caption = match.caption;
      t.review = match.review;
      t.setLabel = match.setLabel || undefined;
      t.setState = match.setState || undefined;
      t.fmt = match.fmt || t.fmt;
      const tl: TimelineEntry = {
        team: "🎨 디자인팀",
        tag: "렌더 완료",
        say: `${match.fmt} · 1080×1350 · ${match.itemCount}개 항목`,
        why: `콘텐츠 JSON: ${match.contentPath} — 오너 승인 대기(발행 전).`,
        thumb: key || undefined,
      };
      t.timeline.push(tl);
      if (match.source) {
        t.timeline.push({ team: "✏️ 편집팀", tag: "출처", say: match.source, why: "수치는 코드로 추출(LLM 창작 없음)." });
      }
    }
  }

  // 결정로그에 없지만 렌더된 카드 → 독립 승인대기 티켓
  const extraProduced: Ticket[] = [];
  for (const p of produced) {
    if (usedProduced.has(p.slug + "@" + p.date)) continue;
    // 세트의 2·3장은 대표 장에 캐러셀로 합쳐졌으므로 따로 티켓을 만들지 않는다
    if (!p.setLead) continue;
    const key = intern(p.thumb);
    extraProduced.push({
      id: `p-${p.date}-${p.slug}`,
      title: p.title,
      topic: "렌더 산출물",
      tier: "T1",
      fire: false,
      fmt: p.fmt,
      stage: 4,
      rubric: null,
      evidence: p.source ? [["출처", p.source]] : [],
      timeline: [
        {
          team: "🎨 디자인팀",
          tag: "렌더 완료",
          say: `${p.fmt} · ${p.itemCount}개 항목`,
          why: `${p.contentPath} — 오너 승인 대기(발행 전).`,
          thumb: key || undefined,
        },
      ],
      thumb: key,
      pages: p.caption && p.setLabel
        ? p.pages.map((_, i) => `download/${p.setLabel}-${i + 1}.jpg`)
        : [],
      caption: p.caption,
      review: p.review,
      // 발행 세트에 등록되지 않은 렌더는 실험·중간 산출물이다.
      // 파이프라인 목록에는 남기되 결정함(오늘 결정할 일)에는 올리지 않는다.
      flags: p.setLabel ? [] : ["실험"],
      setLabel: p.setLabel || undefined,
      setState: p.setState || undefined,
      origin: "produced",
      provenance: p.contentPath,
    });
  }

  // 후보(브리핑) 중 이미 결정된 소재와 겹치면 제외
  const decidedTitles = new Set(decided.map((d) => normTitle(d.title)));
  const freshCandidates = candidates.filter((c) => {
    for (const dt of decidedTitles) {
      if (normTitle(c.title).includes(dt) || dt.includes(normTitle(c.title))) return false;
    }
    return true;
  });

  // ── 소재 보드 — research/ideas.json 이 단일 원천(관제탑이 직접 되쓰는 파일).
  let ideaCats: IdeaCat[] = [];
  let ideaItems: Idea[] = [];
  if (existsSync(P.ideasJson)) {
    try {
      const j = JSON.parse(readFileSync(P.ideasJson, "utf8"));
      ideaCats = Array.isArray(j.cats) ? j.cats : [];
      ideaItems = Array.isArray(j.ideas) ? j.ideas : [];
    } catch {
      // 깨진 JSON이면 보드만 비우고 나머지 관제탑은 정상 렌더(전체 실패 방지)
    }
  }

  // ── 소재 → 파이프라인 배관 (2026-07-26)
  // 오너가 소재 탭에서 "진행"을 누르면 그 소재에 stage가 붙는다.
  // 아직 카드가 안 나온 소재는 여기서 티켓으로 승격돼 칸반에 뜬다.
  // 이미 렌더된 카드가 있으면 그 티켓이 진짜이므로 중복 생성하지 않는다.
  const catLabel = new Map(ideaCats.map((c) => [c.key, c.label]));
  const existingTitles = [...decided, ...extraProduced].map((t) => normTitle(t.title));
  const promoted: Ticket[] = [];
  for (const it of ideaItems) {
    const st = Number(it.stage || 0);
    if (st < 1) continue;
    // 카드가 나온 소재는 **렌더 산출물 쪽 티켓이 진짜다.** 소재까지 티켓으로 올리면
    // 같은 건이 파이프라인에 두 번 뜬다(2026-07-26: '월급으로 사는 데 몇 년'이 그랬다).
    // 제목이 달라져(기획 제목 → 최종 제목) 아래 중복 검사에 안 걸리므로 여기서 막는다.
    if (it.status === "done") continue;
    const n = normTitle(it.title);
    if (existingTitles.some((e) => e.includes(n) || n.includes(e))) continue;
    promoted.push({
      id: `idea-${it.id}`,
      title: it.title,
      // 주제가 먼저다. cat은 2026-07-27부터 '발행 주기'라서 칸반 라벨로는 뜻이 흐리다.
      topic: it.topic || catLabel.get(it.cat) || it.cat || "소재",
      tier: "T1",
      fire: false,
      fmt: "미정",
      stage: Math.min(st, STAGES.length - 1),
      rubric: null,
      evidence: [
        ...(it.why ? ([["선정 사유", it.why]] as Evidence[]) : []),
        ...(it.source ? ([["출처", it.source]] as Evidence[]) : []),
      ],
      timeline: [
        {
          team: "🧑‍💼 오너",
          tag: "소재 승인",
          say: `이 소재로 진행 — ${it.why || "관제탑 소재 보드에서 승인"}`,
          why: `research/ideas.json · ${it.id}${it.at ? ` · ${it.at}` : ""}`,
        },
      ],
      thumb: null,
      flags: [],
      origin: "ideas",
      provenance: `research/ideas.json#${it.id}`,
      ideaId: it.id,
    });
  }

  const tickets: Ticket[] = [...freshCandidates, ...decided, ...extraProduced, ...promoted];

  // 회사 탭
  const ceoMd = existsSync(P.ceo) ? readFileSync(P.ceo, "utf8") : "";
  const { count: principlesCount, byCategory } = parseCeoPrinciples(ceoMd);

  const teams = [];
  const teamFiles = existsSync(P.teams) ? readdirSync(P.teams).filter((f) => f.endsWith(".md")) : [];
  const bySlug = new Map<string, string>();
  for (const f of teamFiles) bySlug.set(f.replace(/\.md$/, ""), f);
  const ordered = [
    ...TEAM_ORDER.filter((s) => bySlug.has(s)),
    ...[...bySlug.keys()].filter((s) => !TEAM_ORDER.includes(s)),
  ];
  for (const slug of ordered) {
    const card = parseTeamCard(readFileSync(join(P.teams, bySlug.get(slug)!), "utf8"), slug);
    if (card) {
      card.hasPrompt = existsSync(join(P.prompts, `${slug}.md`));
      teams.push(card);
    }
  }

  const assets = buildAssetGroups({
    datasetCatalog: P.datasetCatalog,
    logoCatalog: P.logoCatalog,
    photoCatalog: P.photoCatalog,
  });

  // 최근 삭제 사유 — 다음 소재 발굴에 "이런 건 피해라"로 실어 보낼 학습 신호.
  // 오너가 소재를 지울 때 남긴 한 줄이 결정 인박스에 쌓인다.
  const recentDrops: string[] = [];
  const inboxPath = join(REPO_ROOT, "research/decisions-inbox.md");
  for (const f of [inboxPath, P.decisionLog]) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, "utf8").split(/\r?\n/)) {
      const m = line.match(/(?:소재 삭제|반려)[^—]*—\s*이유:\s*(.+?)\s*$/);
      if (m && m[1]) recentDrops.push(m[1].slice(0, 60));
    }
  }

  // 보관함 색인 — scripts/build-archive.mjs 가 만든다. 없으면 빈 보관함으로 둔다.
  let archive: ArchiveFolder[] = [];
  const archPath = join(REPO_ROOT, "data/archive/index.json");
  if (existsSync(archPath)) {
    try {
      const j = JSON.parse(readFileSync(archPath, "utf8"));
      archive = Array.isArray(j.folders) ? j.folders : [];
      // 색인에는 파일 경로만 있다 → 실제 그림을 찾아 붙인다(목록에서 알아보게)
      for (const f of archive) {
        for (const w of f.items) {
          const lead = produced.find((p) => p.setLabel === w.label && p.setLead);
          w.thumb = lead ? intern(lead.thumb) : null;
          // PNG·카드 JSON은 저장소에 없어 링크를 걸 수 없다(gitignore).
          // 실물은 같은 사이트의 /download/ 원본을 참조한다 — HTML에 base64로 박으면
          // 화면이 수 MB로 부푼다(2026-07-26 4.3MB 사고).
          w.shots = lead ? lead.pages.map((_, i) => `download/${w.label}-${i + 1}.jpg`) : [];
        }
      }
    } catch {
      /* 색인이 깨져도 나머지 관제탑은 정상 */
    }
  }

  /* 완성본 저장소 — **실제로 인스타에 올라간 물건**의 목록(published/index.json).
   *
   * ⚠️ 이게 없어서 시스템이 오너에게 거짓말을 했다(2026-07-27): 오너는 직접 올리고 계셨는데
   *    저장소에는 그 사실을 적을 자리가 없어 "발행 0건"이라고 보고했다.
   *    이제 [✅ 인스타에 올렸습니다]가 이 목록을 만든다 — 발행 이력의 유일한 사실. */
  let published: PublishedPost[] = [];
  const pubPath = join(REPO_ROOT, "published/index.json");
  if (existsSync(pubPath)) {
    try {
      const j = JSON.parse(readFileSync(pubPath, "utf8"));
      published = Array.isArray(j.posts) ? j.posts : [];
    } catch {
      /* 색인이 깨져도 나머지 관제탑은 정상 */
    }
  }

  // 성과 — data/performance.md 의 표를 읽는다. 인스타 토큰이 붙기 전엔 오너가 손으로 채운다.
  const perfRows: PerfRow[] = [];
  const perfPath = join(REPO_ROOT, "data/performance.md");
  if (existsSync(perfPath)) {
    for (const line of readFileSync(perfPath, "utf8").split(/\r?\n/)) {
      if (!/^\s*\|/.test(line)) continue;
      const c = line.split("|").map((x) => x.trim());
      const cells = c.slice(1, -1);
      if (cells.length < 7) continue;
      const [date, card, reach, saved, likes, comments, memo] = cells;
      if (!date || date === "발행일" || /^-+$/.test(date.replace(/[:\s]/g, ""))) continue;
      if (/^_?\(?아직/.test(date)) continue; // "(아직 발행 없음)" 안내행
      perfRows.push({ date, card, reach, saved, likes, comments, memo });
    }
  }

  const { from, label } = deriveDateLabel(brief);

  // 실제로 화면에 쓰이는 크기로 줄인다(브라우저 없으면 원본 유지 — 무겁지만 동작은 한다)
  const shrunk = await shrinkAll(jobs);
  for (const [ck, key] of byKey) {
    const small = shrunk.get(ck);
    if (small) images[key] = small;
  }

  // ── 썸네일은 HTML 에 박지 않고 **파일로 뺀다** (2026-08-12)
  //
  // 200px 로 줄여도 62장이면 base64 가 1.3MB 다. 그게 그대로 index.html 안에 직렬화돼
  // 화면 무게가 2MB 를 넘었고, `verify-live` 의 「화면 무게 적정」 검사가 2026-07-31 부터
  // **2주간 빨간불**이었다. 카드가 늘수록 더 나빠지는 구조라 한도만 올리는 건 답이 아니다.
  //
  // 큰 판본(결재 캐러셀)은 이미 같은 이유로 `download/{label}-{n}.jpg` 파일 참조다
  // (위 132·317줄 주석 — 2026-07-26 4MB 사고). 썸네일에도 같은 방식을 넓힌다.
  //
  // `images` 맵은 그대로 둔다 — 값만 base64 에서 **상대 경로**로 바뀐다. 화면 쪽
  // `img()` 헬퍼(renderHtml.ts)가 이미 "맵에 있으면 그 값을 src 로 쓴다"라서 그대로 동작한다.
  // 경로가 상대(`thumbs/…`)라 packages/dashboard/index.html 을 로컬에서 직접 열어도 맞는다.
  writeThumbFiles(images);

  // 소재 풀 = 아직 안 고른 소재. 고르면(▶ 진행) stage가 붙어 파이프라인으로 빠지고,
  // 아니면 삭제된다 — 그래서 '남아 있다 = 아직 안 골랐다'가 성립한다.
  const openIdeas = ideaItems.filter((i) => i.status !== "done" && !Number(i.stage || 0));
  const undecided = openIdeas.length;

  // ── 발행 대기열 반영 (2026-07-26)
  // 오너가 [🚀 발행 승인]을 누르면 data/publish-queue.md 에 줄이 붙는다.
  // 그 사실을 파이프라인에 되먹이지 않으면, 승인한 카드가 영원히 '승인대기'에 남는다.
  //   - [ ] = 승인됨·업로드 전   - [x] = 업로드 완료
  const queued = new Map<string, boolean>(); // 정규화 제목 → 업로드 완료 여부
  const qPath = join(REPO_ROOT, "data/publish-queue.md");
  if (existsSync(qPath)) {
    for (const line of readFileSync(qPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*-\s*\[([ xX])\]\s*(.+)$/);
      if (!m) continue;
      const title = (m[2].match(/\*\*(.+?)\*\*/) || [, m[2]])[1];
      queued.set(normTitle(title), m[1].toLowerCase() === "x");
    }
  }
  for (const t of tickets) {
    if (t.stage !== 4) continue;
    const n = normTitle(t.title);
    let hit: boolean | undefined;
    for (const [k, done] of queued) {
      if (k.includes(n) || n.includes(k)) { hit = done; break; }
    }
    if (hit === undefined) continue;
    t.stage = 5; // 승인 완료 — 남은 일은 오너가 직접 올리는 것뿐
    // `- [ ]` = 승인은 났지만 아직 오너가 안 올림. 올리면 [✅ 인스타에 올렸습니다]로 `- [x]` 가 된다.
    if (!hit) t.flags.push("업로드 대기");
  }

  // ── 오너가 중단한 건 반영 (2026-07-26)
  // 관제탑 [중단·삭제]는 data/pipeline-state.json 에 남는다.
  // 여기서 읽어 '버림' 플래그를 붙여야 재빌드 후에도 되살아나지 않는다.
  const statePath = join(REPO_ROOT, "data/pipeline-state.json");
  if (existsSync(statePath)) {
    try {
      const j = JSON.parse(readFileSync(statePath, "utf8"));
      const apply = (list: { title?: string; note?: string }[], flag: string, onHit?: (t: Ticket, r: { note?: string }) => void) => {
        for (const d of Array.isArray(list) ? list : []) {
          const n = normTitle(d.title || "");
          if (!n) continue;
          for (const t of tickets) {
            const m = normTitle(t.title);
            if (!(m.includes(n) || n.includes(m))) continue;
            if (!t.flags.includes(flag)) t.flags.push(flag);
            onHit?.(t, d);
          }
        }
      };
      apply(j.dropped, "버림");
      // 수정지시도 저장소에 남는다 — 안 그러면 재빌드 때 '무엇이 재작업 대기인지'를 잃는다
      apply(j.revise, "수정요청", (t, r) => {
        if (!r.note) return;
        t.timeline.push({ team: "🧑‍💼 오너", tag: "수정지시", say: r.note, why: "재작업 후 다시 검수·승인 단계로 올라옵니다." });
      });
    } catch {
      /* 깨져도 나머지는 정상 — 중단 반영만 건너뛴다 */
    }
  }

  /* ── 요청 대장 ─────────────────────────────────────────────────────────
   * 오너가 시킨 일이 "지금 어디까지 왔는지"를 화면이 말할 수 있게 모은다.
   *
   * 두 곳에서 온다:
   *   ① data/requests.json — 관제탑이 요청할 때마다 직접 적는 대장
   *   ② data/pipeline-state.json 의 revise[] — 대장이 생기기 전에 남은 수정지시
   * ②를 함께 읽는 이유: 대장 도입 전 지시가 화면에서 사라지면 그것도 똑같이
   * "시켰는데 아무 일도 안 일어난" 상태가 된다. 있던 것을 잃지 않는다.
   */
  const requests: RequestRow[] = [];
  const reqPath = join(REPO_ROOT, "data/requests.json");
  if (existsSync(reqPath)) {
    try {
      const j = JSON.parse(readFileSync(reqPath, "utf8"));
      for (const r of Array.isArray(j.items) ? j.items : []) {
        requests.push({
          id: String(r.id || ""),
          at: String(r.at || ""),
          ts: String(r.ts || ""),
          kind: String(r.kind || "작업 지시"),
          what: String(r.what || ""),
          about: r.about ? String(r.about) : undefined,
          auto: String(r.auto || "none"),
          run: r.run ? String(r.run) : undefined,
          done: !!r.done,
          doneAt: r.doneAt ? String(r.doneAt) : undefined,
          result: r.result ? String(r.result) : undefined,
          order: r.order ? String(r.order) : undefined,
        });
      }
    } catch {
      /* 깨져도 나머지 화면은 정상 */
    }
  }
  if (existsSync(statePath)) {
    try {
      const j = JSON.parse(readFileSync(statePath, "utf8"));
      for (const r of Array.isArray(j.revise) ? j.revise : []) {
        const title = String(r.title || "");
        if (!title) continue;
        if (requests.some((q) => q.kind === "수정 지시" && normTitle(q.about || "") === normTitle(title))) continue;
        // 지시서가 실제로 만들어졌는지 눈으로 확인 — 없으면 "아직 안 잡힘"이라고 말해야 한다
        const file = `${title.replace(/[^0-9A-Za-z가-힣]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32) || "req"}-revise.md`;
        const orderPath = join(REPO_ROOT, "research/work-orders", file);
        const hasOrder = existsSync(orderPath);
        requests.push({
          id: `rev-${normTitle(title).slice(0, 24)}`,
          at: String(r.at || ""),
          ts: "",
          kind: "수정 지시",
          what: String(r.note || ""),
          about: title,
          auto: "order",
          done: false,
          result: hasOrder ? "작업지시서 생성됨 — 제작 대기" : "",
          order: hasOrder ? `research/work-orders/${file}` : undefined,
        });
      }
    } catch {
      /* 무시 */
    }
  }

  // 기계 재생산 가능 목록 — builders.json 라벨. 관제탑이 [제작 실행] 버튼을 이 근거로만 단다.
  // (버튼만 있고 뒤에 아무것도 없는 사고를 막는다 — 빌더 없는 세트엔 버튼이 안 뜬다)
  let builderLabels: string[] = [];
  const bPath = join(REPO_ROOT, "data/review/builders.json");
  if (existsSync(bPath)) {
    try {
      const bj = JSON.parse(readFileSync(bPath, "utf8"));
      builderLabels = (Array.isArray(bj.builders) ? bj.builders : []).map((b: { label?: string }) => String(b.label || "")).filter(Boolean);
    } catch {
      /* 명세가 깨져도 화면은 정상 — 버튼만 안 뜬다 */
    }
  }

  // 발행 승인 후보 = 카드 + 캡션이 다 준비된 것. 캡션이 없으면 올릴 글이 없어 결정 대상이 아니다.
  // (관제탑 결정함과 반드시 같은 기준을 써야 KPI 숫자와 목록이 어긋나지 않는다)
  const readyToPublish = tickets.filter(
    (t) => t.stage === 4 && !t.flags.includes("실험") && !t.flags.includes("버림") && !!t.caption
  ).length;

  const counts = {
    candidates: undecided,
    inProgress: tickets.filter((t) => t.stage >= 1 && t.stage <= 3).length,
    awaiting: readyToPublish,
    published: tickets.filter((t) => t.stage === 5).length,
  };

  // KPI — 오너가 "지금 뭘 해야 하나"를 읽는 줄. 결재 대기가 맨 앞.
  // '작업중'은 뺐다(2026-07-30 축소) — 제작은 채팅에서 일어나므로 여기 숫자는 허구가 된다.
  // 대신 '올릴 차례'(승인됐고 오너가 인스타에 올릴 것)를 넣는다. 발행 탭과 같은 기준.
  const totalAssets = assets.reduce((a, g) => a + g.count, 0);
  const publishedLabels = new Set(published.filter((p) => p.label).map((p) => p.label));
  const upSeen = new Set<string>();
  const uploadWait = tickets.filter((t) => {
    if (t.stage !== 5 || !t.flags.includes("업로드 대기")) return false;
    if (t.setLabel && publishedLabels.has(t.setLabel)) return false;
    const k = String(t.setLabel || t.title).replace(/\s+/g, "").replace(/[·—-]/g, "").toLowerCase();
    if (upSeen.has(k)) return false;
    upSeen.add(k);
    return true;
  }).length;
  const kpi = [
    { label: "결재 대기", value: String(readyToPublish), note: "발행 승인 대기" },
    { label: "올릴 차례", value: String(uploadWait), note: "인스타에 올릴 것" },
    { label: "소재 풀", value: String(openIdeas.length), note: `아직 안 고른 것 ${undecided}건` },
    { label: "데이터 자산", value: String(totalAssets), note: "재사용 가능" },
  ];

  return {
    generatedFrom: from,
    dateLabel: label,
    repo: detectRepo(),
    kpi,
    stages: STAGES,
    rubricLabels: RUBRIC_LABELS,
    tickets,
    company: { principlesCount, principles: byCategory, ceoPath: "company/CEO.md", teams },
    assets: { groups: assets, reuseNote: "재사용률은 발행 누적 후 산출" },
    counts,
    images,
    ideas: { path: "research/ideas.json", cats: ideaCats, items: ideaItems },
    recentDrops: recentDrops.slice(-8),
    archive,
    published,
    perf: { rows: perfRows, path: "data/performance.md" },
    requests,
    builders: builderLabels,
    mining: {
      weights: [
        { label: "부동산", pct: 30 },
        { label: "경제일반", pct: 20 },
        { label: "주식", pct: 15 },
        { label: "기타", pct: 35 },
      ],
    },
  };
}
