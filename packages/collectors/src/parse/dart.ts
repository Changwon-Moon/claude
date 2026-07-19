/**
 * DART OpenAPI 파서 — 직원 현황(empSttus)에서 회사별 1인 평균급여액 산출.
 * 1차 출처(금융감독원 전자공시)라 검증 가능한 정밀값. 오보 0건 원칙에 부합.
 *
 * 주의: empSttus는 사업부문·성별로 여러 행이 온다. 회사 전체 평균은
 *   Σ(연간급여총액) / Σ(인원) 으로 가중평균한다. '합계/계' 행은 이중계상 방지로 제외.
 * 첫 실전 수집분은 반드시 사람이 DART 원문과 1~2개사 대조 후 사용(품질검수).
 */

/** 콤마·공백 섞인 숫자 문자열 → number (실패 시 NaN) */
export function num(s: unknown): number {
  if (s == null) return NaN;
  const n = Number(String(s).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

export interface CompanySalary {
  corpName: string;
  avgSalaryWon: number; // 1인 평균급여액 (원)
  headcount: number; // 합계 인원
  year: string;
}

/** empSttus JSON → 회사 1건 요약 (행 가중평균). 데이터 없으면 null */
export function parseEmpSttus(json: string, year: string): CompanySalary | null {
  const data = JSON.parse(json);
  if (data.status && data.status !== "000") return null; // 정상 아님(013=무자료 등)
  const list: any[] = data.list ?? [];
  if (!list.length) return null;

  const corpName = list[0].corp_name ?? "";
  let totalPay = 0;
  let totalHead = 0;
  for (const row of list) {
    // '합계/계' 성격의 행은 제외(세그먼트 합산과 이중계상 방지)
    const seg = `${row.fo_bbm ?? ""} ${row.sexdstn ?? ""}`;
    if (/합\s*계|^계$|소계/.test(seg)) continue;
    const pay = num(row.fyer_salary_totamt); // 연간급여총액
    const head = num(row.sm); // 합계 인원
    if (Number.isFinite(pay) && Number.isFinite(head) && head > 0) {
      totalPay += pay;
      totalHead += head;
    }
  }
  if (totalHead <= 0 || totalPay <= 0) {
    // 총액이 없으면 행별 1인평균급여액(jan_salary_am)의 인원가중 평균으로 대체
    let wsum = 0;
    let hsum = 0;
    for (const row of list) {
      const avg = num(row.jan_salary_am);
      const head = num(row.sm);
      if (Number.isFinite(avg) && Number.isFinite(head) && head > 0) {
        wsum += avg * head;
        hsum += head;
      }
    }
    if (hsum <= 0) return null;
    return { corpName, avgSalaryWon: Math.round(wsum / hsum), headcount: hsum, year };
  }
  return { corpName, avgSalaryWon: Math.round(totalPay / totalHead), headcount: totalHead, year };
}

/** DART corpCode.xml → { 회사명(정규화): corp_code } (name→8자리 고유번호) */
export function parseCorpCodeXml(xml: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /<list>[\s\S]*?<corp_code>(\d+)<\/corp_code>[\s\S]*?<corp_name>([^<]*)<\/corp_name>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const code = m[1].trim();
    const name = m[2].trim();
    if (name) map.set(name, code);
  }
  return map;
}

/** 상장사 corp_code 조회: 정확 일치 우선, 없으면 공백 제거 비교 */
export function findCorpCode(map: Map<string, string>, name: string): string | null {
  if (map.has(name)) return map.get(name)!;
  const norm = name.replace(/\s+/g, "");
  for (const [k, v] of map) if (k.replace(/\s+/g, "") === norm) return v;
  return null;
}
