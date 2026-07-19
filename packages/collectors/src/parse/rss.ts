/**
 * 초경량 RSS 파서 (의존성 없음, 순수 함수 — 네트워크 없이 테스트 가능).
 * <item> 블록에서 title / link / pubDate / source 를 뽑는다.
 * 구글 뉴스 RSS·구글 트렌드 RSS·일반 언론사 RSS의 공통 부분만 다룬다.
 */
export interface RssItem {
  title: string;
  link: string;
  pubDate?: string;
  /** 구글뉴스 RSS의 <source> (언론사명) */
  source?: string;
}

function pick(block: string, tag: string): string | undefined {
  // <tag ...>내용</tag> — CDATA 허용
  const m = block.match(
    new RegExp(`<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</${tag}>`, "i"),
  );
  return m ? m[1].trim() : undefined;
}

/** HTML 엔티티 최소 복원 */
function unescapeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&apos;/g, "'");
}

export function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  for (const block of blocks) {
    const rawTitle = pick(block, "title");
    const link = pick(block, "link");
    if (!rawTitle || !link) continue;
    items.push({
      title: unescapeEntities(rawTitle),
      link: unescapeEntities(link),
      pubDate: pick(block, "pubDate"),
      source: pick(block, "source") ? unescapeEntities(pick(block, "source")!) : undefined,
    });
  }
  return items;
}

/** 제목 기준 중복 제거 (구글뉴스는 " - 언론사" 꼬리가 붙어 유사중복 많음) */
export function dedupeByTitle(items: RssItem[]): RssItem[] {
  const seen = new Set<string>();
  const out: RssItem[] = [];
  for (const it of items) {
    const key = it.title.replace(/\s*-\s*[^-]+$/, "").replace(/\s+/g, " ").trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}
