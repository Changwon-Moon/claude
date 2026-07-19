/**
 * 자산 허브 카탈로그(JSON) → 관제탑 자산 탭.
 * data/datasets/catalog.json · templates/_shared/{logos,photos}/catalog.json
 */
import { readFileSync, existsSync } from "node:fs";
import type { AssetGroup } from "../types.js";

function readJson(path: string): any | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

export function buildAssetGroups(paths: {
  datasetCatalog: string;
  logoCatalog: string;
  photoCatalog: string;
}): AssetGroup[] {
  const groups: AssetGroup[] = [];

  const ds = readJson(paths.datasetCatalog);
  if (ds?.items) {
    groups.push({
      kind: "datasets",
      label: "데이터셋",
      count: ds.items.length,
      items: ds.items.map((it: any) => ({
        title: it.title || it.file,
        meta: [it.verified ? "검증됨" : "미검증", it.perishable ? "휘발성" : "안정", it.added]
          .filter(Boolean)
          .join(" · "),
      })),
    });
  }

  const logos = readJson(paths.logoCatalog);
  if (logos?.items) {
    groups.push({
      kind: "logos",
      label: "로고",
      count: logos.items.length,
      items: logos.items.map((it: any) => ({
        title: it.title || it.name || it.file || it.slug,
        meta: it.license || it.usage || "",
      })),
    });
  } else if (logos) {
    // 카탈로그가 배열/다른 형태여도 최소 개수는 표기
    const n = Array.isArray(logos) ? logos.length : 0;
    if (n) groups.push({ kind: "logos", label: "로고", count: n, items: [] });
  }

  const photos = readJson(paths.photoCatalog);
  if (photos?.items) {
    groups.push({
      kind: "photos",
      label: "사진",
      count: photos.items.length,
      items: photos.items.map((it: any) => ({
        title: it.title || it.file,
        meta: it.license || it.note || "",
      })),
    });
  }

  return groups;
}
