/**
 * DART 평균연봉 수집 (네트워크·키 필요 → GitHub Actions).
 * 1) corpCode.xml(전체 상장사 고유번호) → 회사명→corp_code
 * 2) 회사별 empSttus(직원 현황) → 1인 평균급여액
 * DART_API_KEY 필요(공공, 무료). 이 세션은 네트워크 차단이라 Actions에서 실행.
 */
import { fetchText } from "../http.js";
import { parseEmpSttus, findCorpCode, type CompanySalary } from "../parse/dart.js";

const BASE = "https://opendart.fss.or.kr/api";

/** 사업보고서 기준(reprt_code=11011: 사업보고서, 연간) */
export async function fetchCompanySalary(
  corpCode: string,
  year: string,
  key: string,
): Promise<CompanySalary | null> {
  const url = `${BASE}/empSttus.json?crtfc_key=${key}&corp_code=${corpCode}&bsns_year=${year}&reprt_code=11011`;
  const json = await fetchText(url, { retries: 2 });
  return parseEmpSttus(json, year);
}

/** 회사명 목록 → 평균연봉 배열 (corpMap은 parseCorpCodeXml 결과) */
export async function collectSalaries(
  names: string[],
  corpMap: Map<string, string>,
  year: string,
  key: string,
): Promise<{ got: CompanySalary[]; missed: string[] }> {
  const got: CompanySalary[] = [];
  const missed: string[] = [];
  for (const name of names) {
    const code = findCorpCode(corpMap, name);
    if (!code) {
      missed.push(`${name} (corp_code 없음)`);
      continue;
    }
    try {
      const row = await fetchCompanySalary(code, year, key);
      if (row) got.push({ ...row, corpName: name });
      else missed.push(`${name} (무자료)`);
    } catch (e) {
      missed.push(`${name} (오류: ${e instanceof Error ? e.message : e})`);
    }
  }
  return { got, missed };
}
