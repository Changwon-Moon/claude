import Ajv, { type ErrorObject } from "ajv";
import type { LoadedTemplate } from "./types.js";

const ajv = new Ajv({ allErrors: true, strict: false });

/**
 * 콘텐츠 데이터를 템플릿 schema.json 으로 검증한다.
 * 실패 시, 편집 에이전트(M6)가 읽고 고칠 수 있는 명확한 에러 메시지를 던진다.
 * schema.json 이 없는 템플릿은 검증을 건너뛴다(경고).
 */
export function validateAgainstTemplate(
  data: unknown,
  template: LoadedTemplate,
): void {
  if (!template.schema) {
    console.warn(
      `⚠️  schema.json 없음: "${template.name}" — 데이터 검증을 건너뜁니다. (권장하지 않음)`,
    );
    return;
  }

  const validate = ajv.compile(template.schema);
  if (!validate(data)) {
    const msg = formatErrors(validate.errors ?? []);
    throw new Error(
      `콘텐츠 데이터가 템플릿 "${template.id}" 스키마를 만족하지 않습니다:\n${msg}`,
    );
  }
}

function formatErrors(errors: ErrorObject[]): string {
  return errors
    .map((e) => {
      const where = e.instancePath || "(최상위)";
      return `  • ${where} ${e.message ?? ""}`.trimEnd();
    })
    .join("\n");
}
