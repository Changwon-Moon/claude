import fs from "node:fs";
import path from "node:path";
import { TEMPLATES_DIR } from "./paths.js";
import type { LoadedTemplate, TemplateConfig } from "./types.js";

const DEFAULT_CONFIG: Required<TemplateConfig> = {
  width: 1080,
  height: 1350,
  scale: 2,
};

/** "dummy-card@1" → { name: "dummy-card", version: "1" } */
export function parseTemplateId(id: string): { name: string; version: string } {
  const at = id.lastIndexOf("@");
  if (at === -1) {
    return { name: id, version: "1" };
  }
  return { name: id.slice(0, at), version: id.slice(at + 1) };
}

function readJsonIfExists(p: string): object | null {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8")) as object;
}

/**
 * 템플릿 ID로 템플릿 번들을 로드한다.
 * 폴더 매핑: 이름 부분이 templates/{name} 폴더에 대응한다.
 * (버전은 config.json 의 version과 대조해 경고만 — 스키마 파괴 변경은 폴더를 분리하는 것이 원칙,
 *  TEMPLATES.md §1 참조. M1에서는 단일 버전만 존재.)
 */
export function loadTemplate(id: string): LoadedTemplate {
  const { name, version } = parseTemplateId(id);
  const dir = path.join(TEMPLATES_DIR, name);

  if (!fs.existsSync(dir)) {
    throw new Error(
      `템플릿을 찾을 수 없습니다: "${id}" → 폴더 없음: ${dir}\n` +
        `templates/ 아래에 "${name}" 폴더가 있는지 확인하세요.`,
    );
  }

  const htmlPath = path.join(dir, "template.html");
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`template.html 이 없습니다: ${htmlPath}`);
  }
  const html = fs.readFileSync(htmlPath, "utf8");

  const schema = readJsonIfExists(path.join(dir, "schema.json"));
  const userConfig = (readJsonIfExists(path.join(dir, "config.json")) ??
    {}) as TemplateConfig;
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  return { id, name, version, dir, html, schema, config };
}
