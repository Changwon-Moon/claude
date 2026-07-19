/**
 * 상태 빌더: 저장소 산출물 → 하나의 TowerState.
 * 결정적: 동일 저장소 상태 = 동일 JSON (Date.now 미사용, 날짜는 콘텐츠에서 파생).
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { P } from "./paths.js";
import { STAGES, RUBRIC_LABELS } from "./types.js";
import type { TowerState, Ticket, TimelineEntry } from "./types.js";
import { parseBrief } from "./parse/brief.js";
import { parseDecisionLog } from "./parse/decisionLog.js";
import { parseCeoPrinciples, parseTeamCard } from "./parse/company.js";
import { buildAssetGroups } from "./parse/assets.js";
import { collectProduced } from "./parse/produced.js";

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

function normTitle(s: string): string {
  return s.replace(/\s+/g, "").replace(/[·—\-]/g, "").toLowerCase();
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

export function buildState(): TowerState {
  // 이미지 인터너: 동일 data-uri는 한 번만 저장하고 키로 참조
  const images: Record<string, string> = {};
  const byUri = new Map<string, string>();
  function intern(uri: string | null | undefined): string | null {
    if (!uri) return null;
    let k = byUri.get(uri);
    if (!k) {
      k = `img${byUri.size + 1}`;
      byUri.set(uri, k);
      images[k] = uri;
    }
    return k;
  }

  const brief = latestBrief();
  const candidates = brief ? parseBrief(brief.md, brief.id) : [];

  const decided = existsSync(P.decisionLog)
    ? parseDecisionLog(readFileSync(P.decisionLog, "utf8"))
    : [];

  // 렌더 완료 산출물로 결정 티켓 승격 + 디자인 타임라인
  const produced = collectProduced(P.content, P.out);
  const usedProduced = new Set<string>();

  for (const t of decided) {
    const match = produced.find((p) => normTitle(p.title).includes(normTitle(t.title)) || normTitle(t.title).includes(normTitle(p.title)));
    if (match) {
      usedProduced.add(match.slug + "@" + match.date);
      const key = intern(match.thumb);
      t.stage = 4; // 승인대기 (렌더 완료·발행 전)
      t.thumb = key;
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
      flags: [],
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

  const tickets: Ticket[] = [...freshCandidates, ...decided, ...extraProduced];

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
    if (card) teams.push(card);
  }

  const assets = buildAssetGroups({
    datasetCatalog: P.datasetCatalog,
    logoCatalog: P.logoCatalog,
    photoCatalog: P.photoCatalog,
  });

  const { from, label } = deriveDateLabel(brief);

  const counts = {
    candidates: tickets.filter((t) => t.stage === 0 && !t.flags.includes("버림")).length,
    inProgress: tickets.filter((t) => t.stage >= 1 && t.stage <= 3).length,
    awaiting: tickets.filter((t) => t.stage === 4).length,
    published: tickets.filter((t) => t.stage === 5).length,
  };

  // KPI — 발행 전이라 정직하게 0/placeholder. 자산 재사용률만 실측.
  const totalAssets = assets.reduce((a, g) => a + g.count, 0);
  const kpi = [
    { label: "주간 발행", value: String(counts.published), note: "M0 키 발급 후 가동" },
    { label: "승인 대기", value: String(counts.awaiting), note: "렌더 완료·오너 확인 대기" },
    { label: "소재 후보", value: String(counts.candidates), note: "보드+아이디어" },
    { label: "자산 재사용", value: String(totalAssets), note: "허브 등록 자산 수" },
  ];

  return {
    generatedFrom: from,
    dateLabel: label,
    kpi,
    stages: STAGES,
    rubricLabels: RUBRIC_LABELS,
    tickets,
    company: { principlesCount, principles: byCategory, teams },
    assets: { groups: assets, reuseNote: "재사용률은 발행 누적 후 산출" },
    counts,
    images,
  };
}
