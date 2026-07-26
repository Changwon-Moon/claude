/**
 * 리서치 신호 수집기 — 주제별 뉴스·트렌드 헤드라인을 모아 "소재 보드"를 만든다.
 * (RESEARCH_WORKFLOW.md R1: AI/자동 다이제스트 → 운영자가 선택)
 *
 * 소스: 구글 뉴스 RSS(주제어 검색) + 구글 트렌드 RSS. 언론사 개별 RSS보다 안정적.
 * 피드 하나가 죽어도 나머지는 진행(부분 실패 허용).
 */
import { fetchText } from "../http.js";
import { parseRss, dedupeByTitle, type RssItem } from "../parse/rss.js";

export interface TopicFeed {
  /** 보드에 표시될 주제명 */
  topic: string;
  /** 주 콘텐츠(main) / 부 콘텐츠(sub) */
  tier: "main" | "sub";
  /** RSS URL */
  url: string;
  /** 최대 표시 개수 */
  max: number;
}

const gn = (q: string) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ko&gl=KR&ceid=KR:ko`;

/** 주제 구성 (운영자 확정 카테고리: 주=경제기반 / 부=기업·스포츠·트렌드·정책·인사) */
export const TOPIC_FEEDS: TopicFeed[] = [
  // ─ 주 콘텐츠 (경제 기반)
  { topic: "부동산", tier: "main", url: gn("아파트 OR 부동산 OR 청약 OR 실거래가 when:1d"), max: 8 },
  { topic: "주식·증시", tier: "main", url: gn("코스피 OR 증시 OR 주가 OR 반도체주 when:1d"), max: 8 },
  { topic: "경제·금리", tier: "main", url: gn("금리 OR 환율 OR 물가 OR 경기 when:1d"), max: 8 },
  { topic: "통계·조사", tier: "main", url: gn("통계청 OR \"조사 결과\" OR 순위 발표 when:2d"), max: 6 },
  { topic: "돈·연봉·소득", tier: "main", url: gn("연봉 OR 소득 OR 월급 OR 최저임금 when:2d"), max: 6 },
  { topic: "부자·자산", tier: "main", url: gn("자산 OR 부자 OR 재산 OR 상속 when:2d"), max: 6 },
  // ─ 부 콘텐츠
  { topic: "기업", tier: "sub", url: gn("실적 발표 OR 시가총액 OR 신사업 when:1d"), max: 6 },
  { topic: "정책·정부", tier: "sub", url: gn("정부 대책 OR 정책 발표 OR 국회 통과 when:1d"), max: 6 },
  { topic: "인사(정부·기업)", tier: "sub", url: gn("임명 OR 선임 OR 신임 대표 when:1d"), max: 5 },
  { topic: "스포츠", tier: "sub", url: gn("우승 OR 순위 OR 이적 스포츠 when:1d"), max: 5 },
  {
    topic: "검색 트렌드",
    tier: "sub",
    url: "https://trends.google.co.kr/trending/rss?geo=KR",
    max: 10,
  },
];

/** 카드화 가능성이 높은 제목에 🔥 표시할 레버 키워드 (숫자·순위·비교 신호) */
const LEVER_WORDS = [
  "순위", "TOP", "톱", "1위", "최고", "최저", "최초", "역대", "돌파",
  "급등", "급락", "사상", "평균", "만원", "억", "조", "%", "배",
];

export function hasLever(title: string): boolean {
  return LEVER_WORDS.some((w) => title.includes(w));
}

/* ── 트렌드분석팀 v1: 검색 트렌드 → 수요 신호 ──
 * 구글 트렌드 급상승 검색어를 키워드로 추출하고, 뉴스 소재 제목과 대조해
 * 겹치는 소재에 📈(수요 신호)를 표시한다. 결정적 코드(LLM 미사용). */

/** 트렌드 RSS 항목(검색어)에서 대조용 키워드 추출. 짧은 조사·기호 제거. */
export function extractTrendKeywords(items: RssItem[]): string[] {
  const kws = new Set<string>();
  for (const it of items) {
    const t = it.title.trim();
    if (t.length >= 2) kws.add(t);
    // 복합어는 공백 단위 토큰도 등록 (2글자 이상)
    for (const tok of t.split(/\s+/)) {
      if (tok.length >= 2) kws.add(tok);
    }
  }
  return [...kws];
}

/** 소재 제목이 트렌드 키워드와 겹치는가 (수요 신호) */
export function matchDemand(title: string, keywords: string[]): boolean {
  return keywords.some((k) => title.includes(k));
}

export interface TopicSignals {
  topic: string;
  tier: "main" | "sub";
  items: (RssItem & { lever: boolean; demand?: boolean })[];
  error?: string;
}

export interface SignalsResult {
  signals: TopicSignals[];
  /** 오늘의 급상승 검색 키워드 (수요 신호 원천) */
  trendKeywords: string[];
}

/**
 * 오너가 지시한 키워드로 만드는 임시 피드.
 *
 * 왜 필요한가(2026-07-26 오너 질문 "전세 데이터 찾아달라 했는데 진행되는 거야?"):
 * 기존 수집은 **고정 주제 11개**만 돌았다. 그래서 "전세 자료 찾아줘" 같은 지시는
 * 접수만 되고 아무 일도 안 일어났다. 여기서 지시한 말 그대로 뉴스를 검색한다.
 *
 * 두 갈래로 나눠 검색한다 — 최신 흐름(7일)과 숫자·순위가 붙은 자료(30일).
 * 카드는 수치가 있어야 만들어지므로 후자가 실제로 쓸모 있는 쪽이다.
 */
export function queryFeeds(query: string): TopicFeed[] {
  const q = query.trim().replace(/\s+/g, " ").slice(0, 80);
  if (!q) return [];
  return [
    { topic: `요청: ${q}`, tier: "main", url: gn(`${q} when:7d`), max: 10 },
    {
      topic: `요청: ${q} (숫자·순위 자료)`,
      tier: "main",
      url: gn(`${q} (순위 OR 통계 OR 조사 OR 평균 OR 발표) when:30d`),
      max: 10,
    },
  ];
}

export async function collectResearchSignals(
  feeds: TopicFeed[] = TOPIC_FEEDS,
): Promise<SignalsResult> {
  const results: TopicSignals[] = [];

  // 1) 트렌드 피드를 먼저 수집해 수요 키워드를 확보
  let trendKeywords: string[] = [];
  const trendsFeed = feeds.find((f) => f.topic === "검색 트렌드");
  const newsFeeds = feeds.filter((f) => f.topic !== "검색 트렌드");

  let trendsResult: TopicSignals | null = null;
  if (trendsFeed) {
    try {
      const xml = await fetchText(trendsFeed.url, { retries: 2, timeoutMs: 15000 });
      const items = dedupeByTitle(parseRss(xml)).slice(0, trendsFeed.max);
      trendKeywords = extractTrendKeywords(items);
      trendsResult = {
        topic: trendsFeed.topic,
        tier: trendsFeed.tier,
        items: items.map((it) => ({ ...it, lever: hasLever(it.title) })),
      };
    } catch (err) {
      trendsResult = {
        topic: trendsFeed.topic,
        tier: trendsFeed.tier,
        items: [],
        error: err instanceof Error ? err.message.split("\n")[0] : String(err),
      };
    }
  }

  // 2) 뉴스 피드 수집 + 수요 신호(📈) 대조
  for (const feed of newsFeeds) {
    try {
      const xml = await fetchText(feed.url, { retries: 2, timeoutMs: 15000 });
      const items = dedupeByTitle(parseRss(xml))
        .slice(0, feed.max)
        .map((it) => ({
          ...it,
          lever: hasLever(it.title),
          demand: matchDemand(it.title, trendKeywords),
        }));
      results.push({ topic: feed.topic, tier: feed.tier, items });
    } catch (err) {
      results.push({
        topic: feed.topic,
        tier: feed.tier,
        items: [],
        error: err instanceof Error ? err.message.split("\n")[0] : String(err),
      });
    }
  }
  if (trendsResult) results.push(trendsResult);

  return { signals: results, trendKeywords };
}

/** 소재 보드 마크다운 생성 (결정적 — 입력이 같으면 출력 동일) */
export function renderBoard(
  date: string,
  signals: TopicSignals[],
  trendKeywords: string[] = [],
  /** 오너가 지시한 키워드로 돌린 수집이면 그 말을 그대로 넣는다(무엇에 대한 답인지 남긴다) */
  askedFor = "",
): string {
  const main = signals.filter((s) => s.tier === "main");
  const sub = signals.filter((s) => s.tier === "sub");

  const section = (list: TopicSignals[]): string =>
    list
      .map((s) => {
        const head = `### ${s.topic}`;
        if (s.error) return `${head}\n> ⚠️ 수집 실패: ${s.error}`;
        if (s.items.length === 0) return `${head}\n> (수집된 항목 없음)`;
        const lines = s.items.map((it) => {
          const fire = it.lever ? " 🔥" : "";
          const demand = it.demand ? " 📈" : "";
          const src = it.source ? ` — ${it.source}` : "";
          return `- [ ] ${it.title}${src}${fire}${demand}\n  <${it.link}>`;
        });
        return `${head}\n${lines.join("\n")}`;
      })
      .join("\n\n");

  const trendLine =
    trendKeywords.length > 0
      ? `\n> 🔍 **오늘의 급상승 검색어**: ${trendKeywords.slice(0, 12).join(" · ")}\n`
      : "";

  // 지시 수집(키워드 검색)은 부 콘텐츠가 없다 — 빈 칸을 만들지 않는다
  if (askedFor) {
    return `# 소재 보드 (지시 수집) — ${date}

> 오너 지시: **"${askedFor}"**
> 이 말 그대로 뉴스를 검색한 결과입니다. 🔥 = 숫자·순위 레버(카드화 유리)
> 🔥 항목은 관제탑 소재 보드에 자동으로 올라갑니다(\`scripts/ingest-signals.mjs\`).

${section(main)}

---
_자동 생성: 구글뉴스 RSS 키워드 검색. \`collect-signals --query "${askedFor}"\`_
`;
  }

  return `# 소재 보드 (자동 수집) — ${date}

> **사용법**: 카드로 만들고 싶은 항목에 \`[x]\` 체크(GitHub 앱/웹에서 편집)하거나, Claude 세션에 "OO 만들어줘"라고 말하면 됩니다.
> 🔥 = 숫자·순위 레버(카드화 유리) · 📈 = 급상승 검색어와 겹침(**수요 신호**, 트렌드분석팀 v1)
> 선택한 소재는 [DECISION_LOG](../DECISION_LOG.md)에 기록. 없는 아이디어는 [IDEAS.md](../IDEAS.md)에. 터진 콘텐츠를 보면 [PATTERN_LIBRARY](../PATTERN_LIBRARY.md)로 스크랩하세요.
${trendLine}
## 🎯 주 콘텐츠 (부동산·주식·경제·통계·돈·부자)

${section(main)}

## 📎 부 콘텐츠 (기업·정책·인사·스포츠·트렌드)

${section(sub)}

---
_자동 생성: 구글뉴스·트렌드 RSS 기반. 피드 조정: \`packages/collectors/src/sources/researchSignals.ts\`_
`;
}
