/**
 * 청약홈 「APT 주택형별 분양정보」(15101047) 파서.
 *
 * 이 데이터가 필요한 이유는 하나다 — **프리미엄을 코드가 빼기 위해서**다.
 *   프리미엄 = 분양권 실거래가 − 같은 타입 분양가
 * 뒤의 값을 사람이 옮겨 적으면 그 순간 오보 0 이 깨진다.
 *
 * ── 원천은 **CSV 파일**이다 (2026-08-28 오너 지적으로 바로잡음)
 * 이 데이터셋은 오픈API 로 등록된 것이 아니라 **파일데이터(CSV)** 다. 포털이 파일데이터를
 * 오픈API 로 자동변환해 주기는 하지만 그건 곁가지고, 활용신청도 따로 받아야 하며 실제로
 * 401 이 났다. **연 1회 갱신되는 정지된 파일에 API 를 붙이는 것은 과하다** —
 * 키도 승인도 필요 없는 CSV 를 그냥 읽는 편이 배관이 하나 줄고 고장날 자리도 하나 준다.
 *
 * 그래서 파서는 **행(row) 객체를 받는다** — CSV 에서 왔든 API 에서 왔든 같은 함수로 읽는다.
 * 컬럼 이름 후보를 나열하는 것도 같은 이유다: 포털 항목표에는 한글 이름만 있고
 * 영문명 칸이 비어 있어(2026-08-28 확인) 어느 쪽으로 올지 확정할 수 없다.
 */

/** 후보 중 값이 있는 첫 키. 없으면 "" */
function pick(row: Record<string, unknown>, ...names: string[]): string {
  for (const n of names) {
    const v = row[n];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

/** 콤마·공백 제거 숫자화 (실패 시 NaN) */
function num(s: unknown): number {
  if (s == null) return NaN;
  const n = Number(String(s).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

export interface TypePrice {
  houseManageNo: string; // 주택관리번호 — 공고를 잇는 열쇠
  pblancNo: string; // 공고번호
  modelNo: string; // 모델번호
  houseType: string; // 주택형 (예: "084.9721A")
  supplyArea: number; // 주택공급면적(㎡)
  exclusiveArea: number; // 주택형에서 뽑은 전용면적(㎡) — 실거래와 잇는 열쇠
  generalUnits: number; // 일반공급 세대수
  specialUnits: number; // 특별공급 세대수
  topPriceManwon: number; // 공급금액(분양최고금액, 만원)
}

/**
 * 주택형 문자열에서 전용면적을 뽑는다. 청약홈 표기는 `084.9721A` 꼴이다 —
 * 앞의 숫자가 전용면적, 뒤 글자가 타입(A/B/C…).
 * 실거래(`excluUseAr`)와 잇는 유일한 공통 열쇠라 여기서 확실히 뽑는다.
 */
export function areaFromHouseType(houseType: string): number {
  const m = houseType.match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : NaN;
}

/** 주택형에서 타입 글자(A/B/C…). 없으면 "" */
export function letterFromHouseType(houseType: string): string {
  const m = houseType.match(/\d+(?:\.\d+)?\s*([A-Za-z가-힣]+)/);
  return m ? m[1] : "";
}

export function parseTypePrices(rows: Record<string, unknown>[]): TypePrice[] {
  const out: TypePrice[] = [];
  for (const r of rows) {
    const houseType = pick(r, "주택형", "HOUSE_TY", "houseTy");
    const top = num(pick(r, "공급금액(분양최고금액)", "공급금액_분양최고금액", "공급금액", "LTTOT_TOP_AMOUNT", "supplyAmount"));
    if (!houseType || !Number.isFinite(top)) continue;
    out.push({
      houseManageNo: pick(r, "주택관리번호", "HOUSE_MANAGE_NO", "houseManageNo"),
      pblancNo: pick(r, "공고번호", "PBLANC_NO", "pblancNo"),
      modelNo: pick(r, "모델번호", "MODEL_NO", "modelNo"),
      houseType,
      supplyArea: num(pick(r, "주택공급면적", "SUPLY_AR", "suplyAr")),
      exclusiveArea: areaFromHouseType(houseType),
      generalUnits: num(pick(r, "일반공급세대수", "GNRL_HSHLDCO", "gnrlHshldco")) || 0,
      specialUnits: num(pick(r, "특별공급세대수", "SPSPLY_HSHLDCO", "spsplyHshldco")) || 0,
      topPriceManwon: top,
    });
  }
  return out;
}

/**
 * 전용면적이 **얼마나 가까우면 같은 타입인가**.
 * 실거래의 `excluUseAr` 와 청약홈 주택형의 숫자는 소수점 아래에서 갈린다
 * (84.9721 vs 84.97). 0.05㎡ 안이면 같은 타입으로 본다 — 한 단지 안에서
 * 그보다 가까운 서로 다른 타입은 없다.
 */
export const AREA_TOLERANCE = 0.05;

/**
 * 한 공고의 타입 목록에서 주어진 전용면적에 맞는 것을 고른다.
 * **둘 이상 맞으면 null 을 낸다** — 상록마을 사고와 같은 자리다.
 * 애매한 것을 하나 골라 붙이느니 못 이은 채로 두는 편이 낫다.
 */
export function matchType(types: TypePrice[], area: number): TypePrice | null {
  const hits = types.filter((t) => Math.abs(t.exclusiveArea - area) <= AREA_TOLERANCE);
  if (hits.length !== 1) return null;
  return hits[0];
}

/**
 * 프리미엄(만원). 실거래가에서 그 타입 **분양최고금액**을 뺀다.
 * 최고금액을 빼므로 결과는 **실제 프리미엄의 하한**이다 — 카드에 그렇게 적는다.
 */
export function premiumManwon(dealManwon: number, type: TypePrice): number {
  return dealManwon - type.topPriceManwon;
}

/** 응답 첫 행의 키 이름 전부. 유추가 틀렸을 때 답을 찾는 자리. */
export function rowKeys(rows: Record<string, unknown>[]): string[] {
  return rows.length ? Object.keys(rows[0]) : [];
}

/* ─────────────────────────── CSV 읽기 ───────────────────────────
 * 공공데이터포털 CSV 를 그대로 읽는다. 라이브러리를 안 쓰는 이유는
 * 이 저장소가 수집기에 의존성을 두지 않기 때문이다(`@wirit/collectors` dependencies: {}).
 * 대신 여기서 다루는 것만 정확히 다룬다: 따옴표로 감싼 칸, 칸 안의 콤마, 이스케이프된 따옴표, CRLF.
 */

/** 한 줄을 칸으로 쪼갠다. 따옴표 안의 콤마·줄바꿈은 구분자가 아니다. */
export function parseCsv(text: string): Record<string, string>[] {
  // BOM 제거 — 붙어 있으면 첫 컬럼 이름이 통째로 안 맞는다(가장 조용한 실패 중 하나다)
  const src = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; }  // "" → 따옴표 한 개
        else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') { quoted = true; continue; }
    if (c === ",") { row.push(cell); cell = ""; continue; }
    if (c === "\r") continue;
    if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; continue; }
    cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }

  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim());
  const out: Record<string, string>[] = [];
  for (const r of rows.slice(1)) {
    if (r.every((v) => v.trim() === "")) continue;   // 빈 줄은 건너뛴다
    const o: Record<string, string> = {};
    header.forEach((h, i) => { o[h] = (r[i] ?? "").trim(); });
    out.push(o);
  }
  return out;
}

/**
 * 공공데이터포털 CSV 는 **EUC-KR 인 경우가 많다.** UTF-8 로 읽으면 한글 컬럼 이름이
 * 깨지고, 그러면 파서는 "컬럼을 못 찾았다"고만 말한다 — 원인이 인코딩인지 이름인지
 * 구분이 안 된다. 그래서 **디코딩을 두 번 해 보고 한글이 살아 있는 쪽**을 쓴다.
 */
export function decodeKoreanCsv(buf: Uint8Array): { text: string; encoding: string } {
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  // U+FFFD(대체문자)가 있으면 UTF-8 이 아니다
  if (!utf8.includes("\uFFFD")) return { text: utf8, encoding: "utf-8" };
  try {
    const euc = new TextDecoder("euc-kr").decode(buf);
    return { text: euc, encoding: "euc-kr" };
  } catch {
    return { text: utf8, encoding: "utf-8(대체문자 있음)" };
  }
}
