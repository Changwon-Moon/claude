/**
 * news-figure@1 시안 빌더 — 인물(CEO·정치인)/뉴스 이슈 카드 템플릿.
 * 두 가지 쓰임을 한 판형으로 보여준다:
 *   A) 뉴스 이슈(보도해명형) — 형광펜 강조 본문
 *   B) 발표/채용 공고형 — 하단 정보 바(접수기간·근무지)
 *
 * ⚠️ 아래 문구·수치는 **판형을 보여주기 위한 예시(시안)** 다 — verified=false.
 *    실제 발행 카드는 1차 출처에서 코드로 값을 뽑아 채운다(오보 0).
 *
 * 실행: node scripts/build-news-figure.mjs [date]
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-08-05";
const outDir = join(ROOT, `data/out/_spike/news-figure`);
mkdirSync(outDir, { recursive: true });

const cards = [
  {
    slug: "news-figure-demo-issue",
    doc: {
      template: "news-figure@1",
      date,
      category: "부동산 이슈",
      categoryStyle: "", // "" | "accent"(코발트) | "red"
      source: { name: "예시 보도자료", asOf: `${date} · 시안` },
      headline: "수도권\n주택공급\n<span class=\"em\">보도해명</span>",
      figure: {
        // photo: "person.jpg",   // _shared/photos 에 파일이 있으면 지정, 없으면 자리표시
        name: "○○○ 장관",
        role: "국토교통부",
        stamp: "🖐 확정된 바 없음",
      },
      lead: [
        {
          heading: "보도내용 요약",
          text: "이르면 다음주 <mark>수도권 5만호 이상</mark> 신규 공급을 담은 대책을 발표할 것으로 확인됐다는 보도.",
        },
        {
          heading: "부처 입장",
          style: "accent",
          text: "발표 시점과 대책에 포함되는 내용은 <mark class=\"g\">전혀 확정된 바 없음.</mark> 보도에 신중을 기해달라는 입장.",
        },
      ],
      footer: "예시 카드 · 실제 발행 시 1차 출처로 대조",
    },
  },
  {
    slug: "news-figure-demo-notice",
    doc: {
      template: "news-figure@1",
      date,
      category: "한국 이슈",
      categoryStyle: "accent",
      source: { name: "예시 발표자료", asOf: `${date} · 시안` },
      headline: "○○기업\n<span class=\"em\">반나절</span>\n심층면접 도입",
      figure: {
        name: "○○○ 회장",
        role: "○○그룹",
      },
      lead: [
        {
          text: "기존 20~30분 면접에서 벗어나 <mark>반나절 동안 심도 있는 과제 수행과 인터뷰</mark>를 진행한다.",
        },
        {
          text: "직무 전문성은 물론 <mark class=\"g\">AI 응용력·논리적 사고력</mark>을 종합 검증할 계획.",
        },
      ],
      bars: [
        { k: "접수기간", v: "8.20 ~ 26" },
        { k: "근무지", v: "서울·분당 등" },
      ],
      footer: "예시 카드 · 실제 발행 시 1차 출처로 대조",
    },
  },
];

for (const c of cards) {
  writeFileSync(join(outDir, `${c.slug}.json`), JSON.stringify(c.doc, null, 2) + "\n");
}
console.log(`✅ news-figure 시안 ${cards.length}종 → data/out/_spike/news-figure/`);
console.log(`   ${cards.map((c) => c.slug).join(" · ")}`);
