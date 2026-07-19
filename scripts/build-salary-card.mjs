/**
 * data/datasets/salary-freshman-2026-07.json → data/content/2026-07-19/salary-freshman.json
 * 수치(초봉)는 데이터셋에서 코드로 추출·포맷(천단위 콤마)한다. LLM이 값을 창작하지 않는다.
 * 로고: 허브에 있으면 실제 로고(samsung/hyundai), 없으면 브랜드 컬러칩(회색 모노그램 금지).
 * 실행: node scripts/build-salary-card.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ds = JSON.parse(readFileSync(join(ROOT, "data/datasets/salary-freshman-2026-07.json"), "utf8"));

// 브랜드 표기: 허브 로고 있으면 logo, 없으면 브랜드색 컬러칩(logoColor+logoText)
const BRAND = {
  "SK하이닉스": { logoColor: "#EA002C", logoText: "SK" },
  "현대자동차": { logo: "hyundai" },
  "기아": { logoColor: "#05141F", logoText: "KIA" },
  "한화에어로스페이스": { logoColor: "#F37021", logoText: "한화" },
  HMM: { logoColor: "#00A0DE", logoText: "HMM" },
  "삼성전자": { logo: "samsung" },
  "삼성바이오로직스": { logoColor: "#1428A0", logoText: "삼바" },
  "포스코인터내셔널": { logoColor: "#00A0E9", logoText: "포스코" },
  "HD현대일렉트릭": { logoColor: "#0B4EA2", logoText: "HDE" },
  "HD한국조선해양": { logoColor: "#17497B", logoText: "조선" },
};

const fmt = (n) => n.toLocaleString("en-US"); // 천단위 콤마

const items = ds.rows.map((r) => ({
  name: r.name,
  ...(BRAND[r.name] || {}),
  value: fmt(r.value),
  sub: r.industry,
}));

const content = {
  template: "ranking-table@1",
  date: "2026-07-19",
  subtitle: "잡코리아·링커리어·블라인드 집계 · 계약연봉 기준(성과급 별도)",
  title: "2026 대기업\n신입 초봉 순위",
  nameLabel: "기업",
  valueLabel: "초봉(만원)",
  subLabel: "업종",
  items,
  source: { name: "잡코리아·링커리어 집계(계약연봉)", asOf: "2026-07" },
};
// 추적: 이 콘텐츠의 provenance는 data/datasets/salary-freshman-2026-07.json(usedIn)에 기록됨

const outDir = join(ROOT, "data/content/2026-07-19");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "salary-freshman.json"), JSON.stringify(content, null, 2) + "\n", "utf8");
console.log(`✅ salary-freshman.json — ${items.length}개 항목, 수치는 데이터셋에서 추출`);
