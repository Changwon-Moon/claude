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
  thumb: string | null; // data-uri
  source: string;
  contentPath: string;
  itemCount: number;
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

export function collectProduced(contentDir: string, outDir: string): ProducedCard[] {
  if (!existsSync(contentDir)) return [];
  const out: ProducedCard[] = [];

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
      const pngPath = join(outDir, date, `${slug}-p1.png`);
      out.push({
        slug,
        date,
        title: (json.title || slug).replace(/\n/g, " "),
        fmt: fmtOf(json.template),
        thumb: pngDataUri(pngPath),
        source: json.source?.name || "",
        contentPath: `data/content/${date}/${f}`,
        itemCount: Array.isArray(json.items) ? json.items.length : 0,
      });
    }
  }

  return out;
}
