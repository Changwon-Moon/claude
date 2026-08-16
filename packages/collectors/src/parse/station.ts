/**
 * 지하철역 표기 정리 — 카카오 로컬 응답을 카드가 쓸 수 있는 모양으로.
 *
 * ⚠️ **CLI 가 아니라 여기에 둔다.** 셀프테스트가 CLI 파일을 import 하면 그 파일의 main()
 * 이 그대로 돌아 버린다(2026-08-16 에 실제로 키 없다며 테스트가 죽었다).
 * 순수 함수는 parse/ 에, 네트워크·파일 쓰기는 CLI 에.
 */

/**
 * 역 이름 정리 — 카카오는 노선을 이름에 붙여 주기도 한다("철산역 7호선").
 * 카드에는 **역 이름만** 적고 노선은 뱃지가 말한다.
 */
export function cleanStationName(raw: string): string {
  /* ⚠️ 순서가 중요하다. 호선 꼬리를 먼저 떼면 "사당역(4호선)" 이 "사당역(" 이 되어
     닫는 괄호가 사라지고 괄호 규칙이 못 잡는다(2026-08-16 셀프테스트가 잡았다).
     **괄호를 먼저 걷고, 그 다음 호선 꼬리를 뗀다.** */
  return String(raw ?? "")
    .replace(/\s*[(（][^)）]*[)）]/g, "")
    .replace(/\s*\d*호선.*$/, "")
    .trim();
}

/**
 * 카카오 category_name → 우리 노선 키(`templates/_shared/metro-lines.json` 의 키).
 * 예: "교통,수송 > 지하철,전철 > 수도권7호선" → ["7"]
 *
 * 아는 형태만 집어 낸다 — 모르면 빈 배열이고, 그때 뱃지는 색 없이 회색으로 그린다.
 * 억지로 짐작해 엉뚱한 노선색을 칠하느니 색이 없는 편이 낫다.
 */
export function linesFromCategory(categoryName: string, placeName: string): string[] {
  const src = `${categoryName ?? ""} ${placeName ?? ""}`;
  const out = new Set<string>();
  for (const m of src.matchAll(/([1-9])호선/g)) out.add(m[1]);
  /* ⚠️ "신분당선"·"수인분당선" 은 그 자체가 다른 노선이다. 이 둘을 먼저 집고,
     **둘 다 아닐 때만** 옛 분당선으로 본다 — 안 그러면 신분당선이 분당선으로도 잡힌다
     (2026-08-16 셀프테스트가 잡았다: "신분당,분당"). */
  const isSin = /신분당/.test(src);
  const isSuin = /수인.?분당/.test(src);
  const named: [RegExp, string][] = [
    [/신분당/, "신분당"],
    [/수인.?분당/, "수인분당"],
    [isSin || isSuin ? /(?!)/ : /분당선/, "분당"],
    [/경의.?중앙/, "경의중앙"],
    [/공항철도/, "공항철도"],
    [/경춘/, "경춘"],
    [/서해/, "서해"],
    [/신안산/, "신안산"],
    [/GTX.?A/i, "GTX-A"],
    [/GTX.?B/i, "GTX-B"],
  ];
  for (const [re, key] of named) if (re.test(src)) out.add(key);
  return [...out];
}
