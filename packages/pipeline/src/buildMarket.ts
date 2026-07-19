import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderContentFile } from "@wirit/renderer";
import { generateMarketUs } from "./generate/marketUs.js";
import type { RawCollection } from "./types.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * "간밤의 미국 증시" 카드를 raw 수집물에서 자동 생성 → 렌더까지.
 *  raw us-market.json → 콘텐츠 JSON(data/content/{date}) → PNG(data/out/{date})
 */
export async function buildMarketUs(rawPath: string): Promise<{ contentPath: string; outputs: string[] }> {
  const raw = JSON.parse(fs.readFileSync(rawPath, "utf8")) as RawCollection;
  const content = generateMarketUs(raw);

  const contentDir = path.join(REPO_ROOT, "data", "content", raw.asOf);
  fs.mkdirSync(contentDir, { recursive: true });
  const contentPath = path.join(contentDir, "market-us.json");
  fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), "utf8");

  const outDir = path.join(REPO_ROOT, "data", "out", raw.asOf);
  const result = await renderContentFile(contentPath, outDir);

  return { contentPath, outputs: result.outputs };
}
