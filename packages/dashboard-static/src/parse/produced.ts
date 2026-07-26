/**
 * data/content/{date}/*.json + data/out/{date}/{slug}-p1.png → 렌더 완료 산출물.
 * 렌더 카드가 있으면 "승인대기(stage 4)"로 승격하고 썸네일(data-uri)을 붙인다.
 * ⚠️ 발행 전이므로 어떤 티켓도 자동으로 '발행됨'이 되지 않는다(오너 승인 게이트 존중).
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

export interface ProducedCard {
  slug: string;
  date: string;
  title: string;
  fmt: string;
  thumb: string | null; // data-uri (p1)
  pages: string[]; // 캐러셀 전 장 data-uri (p1, p2, …)
  caption: string; // 업로드 캡션 전문
  review: { verdict: string; summary: string; errors: number; warns: number } | null;
  source: string;
  contentPath: string;
  itemCount: number;
  /** 발행 세트 라벨 (data/review/sets.json). 없으면 "" = 실험·중간 산출물 */
  setLabel: string;
  /** 세트 안에서의 순서 (캐러셀 장 번호) */
  setOrder: number;
  /** 이 카드가 세트의 대표(첫 장)인가 — 대표만 발행 후보 티켓이 된다 */
  setLead: boolean;
  /** 세트 제목 (오너가 읽을 이름) */
  setTitle: string;
}

/** data/review/sets.json — 오너가 한 번에 승인하는 단위. 없으면 세트 없음. */
interface SetDef { label: string; title: string; cards: string[]; caption?: string; review?: string }
function readSets(reviewDir: string): SetDef[] {
  const p = join(reviewDir, "sets.json");
  if (!existsSync(p)) return [];
  try {
    const j = JSON.parse(readFileSync(p, "utf8"));
    return Array.isArray(j.sets) ? j.sets.filter((s: SetDef) => s && s.label && Array.isArray(s.cards)) : [];
  } catch {
    return [];
  }
}

function pngDataUri(path: string): string | null {
  if (!existsSync(path)) return null;
  const buf = readFileSync(path);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

/** "ranking-table@1" → "ranking-table" */
function fmtOf(template: string): string {
  return (template || "미정").replace(/@\d+$/, "");
}

/** 캐러셀 전 장을 순서대로 모은다: {slug}-p1.png, -p2.png, … (최대 10장) */
function collectPages(dir: string, slug: string): string[] {
  const pages: string[] = [];
  for (let i = 1; i <= 10; i++) {
    const uri = pngDataUri(join(dir, `${slug}-p${i}.png`));
    if (!uri) break;
    pages.push(uri);
  }
  return pages;
}

/** 발행 캡션 전문 — 승인 화면에서 "실제로 나갈 글"을 그대로 보여준다. */
function readCaption(reviewDir: string, name: string): string {
  if (!name) return "";
  const p = join(reviewDir, "captions", `${name}.txt`);
  return existsSync(p) ? readFileSync(p, "utf8").trim() : "";
}

/** 자동 검수 리포트 요약 (없으면 null — 아직 검수 안 돈 세트) */
function readReview(reviewDir: string, label: string): ProducedCard["review"] {
  if (label) {
    const p = join(reviewDir, `${label}.json`);
    if (existsSync(p)) {
    try {
      const j = JSON.parse(readFileSync(p, "utf8"));
      const f: { level?: string }[] = Array.isArray(j.findings) ? j.findings : [];
      return {
        verdict: String(j.verdict || "unknown"),
        summary: String(j.summary || ""),
        errors: f.filter((x) => x.level === "error").length,
        warns: f.filter((x) => x.level === "warn").length,
      };
    } catch {
      return null;
    }
    }
  }
  return null;
}

export function collectProduced(contentDir: string, outDir: string, reviewDir = ""): ProducedCard[] {
  if (!existsSync(contentDir)) return [];
  const out: ProducedCard[] = [];

  // 세트 정의를 slug → {세트, 순서} 로 뒤집어 둔다
  const sets = reviewDir ? readSets(reviewDir) : [];
  const bySlug = new Map<string, { def: SetDef; order: number }>();
  for (const def of sets) def.cards.forEach((c, i) => bySlug.set(c, { def, order: i }));

  const dates = readdirSync(contentDir).filter((d) => {
    try {
      return statSync(join(contentDir, d)).isDirectory();
    } catch {
      return false;
    }
  });

  for (const date of dates) {
    const dir = join(contentDir, date);
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    for (const f of files) {
      const slug = f.replace(/\.json$/, "");
      let json: any;
      try {
        json = JSON.parse(readFileSync(join(dir, f), "utf8"));
      } catch {
        continue;
      }
      const hit = bySlug.get(slug);
      const def = hit?.def;
      out.push({
        slug,
        date,
        title: (json.title || slug).replace(/\n/g, " "),
        fmt: fmtOf(json.template),
        thumb: null, // 세트로 묶은 뒤 아래에서 채운다
        pages: collectPages(join(outDir, date), slug),
        // 캡션·검수는 세트 단위다 — 대표 장에만 붙인다
        caption: def && hit!.order === 0 && reviewDir ? readCaption(reviewDir, def.caption || def.label) : "",
        review: def && hit!.order === 0 && reviewDir ? readReview(reviewDir, def.review || def.label) : null,
        source: json.source?.name || "",
        contentPath: `data/content/${date}/${f}`,
        itemCount: Array.isArray(json.items) ? json.items.length : 0,
        setLabel: def?.label || "",
        setOrder: hit?.order ?? 0,
        setLead: !def || hit!.order === 0,
        setTitle: def?.title || "",
      });
    }
  }

  // 세트 묶기 — 대표 장이 세트의 모든 장을 순서대로 갖는다(캐러셀 넘겨보기용)
  for (const c of out) {
    if (c.setLabel && c.setLead) {
      const members = out
        .filter((x) => x.setLabel === c.setLabel)
        .sort((a, b) => a.setOrder - b.setOrder);
      c.pages = members.flatMap((m) => m.pages);
      if (c.setTitle) c.title = c.setTitle;
    }
    c.thumb = c.pages[0] || null;
  }

  return out;
}
