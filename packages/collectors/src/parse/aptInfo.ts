/**
 * 국토교통부 공동주택 단지 정보 파서 — 단지 목록 · 기본정보(세대수) XML → 정규화.
 *
 * ── 왜 이게 필요한가 (2026-08-12 오너 결정)
 * 신고가 알림을 **1000세대 이상 단지만** 받기로 했는데, 실거래 API에는 세대수가 없다.
 * 세대수는 별도 서비스(공동주택 기본 정보)에서만 나온다.
 *
 * ── 오보 0
 * 세대수는 여기서 코드가 읽는다. 사람이 옮겨 적지 않는다.
 * 단지 매칭에 실패하면 **추측하지 않고 제외**하고, 제외한 이름을 파일로 남긴다
 * (놓친 건 다음에 고칠 수 있지만, 잘못 붙인 건 오보가 된다).
 */
import { normAptName } from "./singo.js";

/**
 * ⚠️ 이 두 서비스는 **JSON 이 기본**이다(2026-08-12 오너가 포털 화면 확인 — 데이터포맷: JSON).
 * 그런데 `_type=xml` 을 받아주는 판도 있어서, **오는 대로 읽는다.**
 * 한쪽만 읽게 만들면 포털이 판을 올린 날 조용히 0건이 된다.
 */
function items(body: string): any[] | null {
  const t = body.trim();
  if (!t.startsWith("{") && !t.startsWith("[")) return null; // XML 이다
  try {
    const j = JSON.parse(t);
    // 서비스마다 껍데기가 다르다: 목록은 body.items.item[], 기본정보는 body.item{}.
    // 한쪽만 보면 다른 쪽이 조용히 0건이 된다.
    const b = j?.response?.body ?? j?.body ?? j;
    const it = b?.items ?? b?.item;
    if (it == null) return [];
    if (Array.isArray(it)) return it;
    if (Array.isArray(it.item)) return it.item;
    if (it.item) return [it.item];
    return [it];
  } catch {
    return null;
  }
}

function tag(block: string, ...names: string[]): string {
  for (const n of names) {
    const m = block.match(new RegExp(`<${n}>\\s*([\\s\\S]*?)\\s*</${n}>`));
    if (m) return m[1].trim();
  }
  return "";
}

function num(s: unknown): number {
  const n = Number(String(s ?? "").replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

export interface AptListItem {
  kaptCode: string;
  kaptName: string;
  bjdCode: string; // 법정동코드 10자리
  sido: string;
  sigungu: string;
  umd: string;
}

/** 공동주택 단지 목록 응답(JSON 또는 XML) → 단지 배열 */
export function parseAptList(body: string): AptListItem[] {
  const out: AptListItem[] = [];
  const js = items(body);
  if (js) {
    for (const o of js) {
      const kaptCode = String(o.kaptCode ?? "").trim();
      const kaptName = String(o.kaptName ?? "").trim();
      if (!kaptCode || !kaptName) continue;
      out.push({
        kaptCode,
        kaptName,
        bjdCode: String(o.bjdCode ?? "").trim(),
        sido: String(o.as1 ?? "").trim(),
        sigungu: String(o.as2 ?? "").trim(),
        umd: String(o.as3 ?? "").trim(),
      });
    }
    return out;
  }
  const xml = body;
  for (const it of xml.match(/<item>[\s\S]*?<\/item>/g) ?? []) {
    const kaptCode = tag(it, "kaptCode");
    const kaptName = tag(it, "kaptName");
    if (!kaptCode || !kaptName) continue;
    out.push({
      kaptCode,
      kaptName,
      bjdCode: tag(it, "bjdCode"),
      sido: tag(it, "as1"),
      sigungu: tag(it, "as2"),
      umd: tag(it, "as3"),
    });
  }
  return out;
}

export interface AptBasis {
  kaptCode: string;
  kaptName: string;
  hhldCnt: number; // 세대수(kaptdaCnt)
  dongCnt: number; // 동수
  useDate: string; // 사용승인일
  addr: string;
}

/** 공동주택 기본 정보 응답(JSON 또는 XML) → 세대수 등. 세대수를 못 읽으면 null */
export function parseAptBasis(raw: string): AptBasis | null {
  const js = items(raw);
  if (js) {
    const o = js[0];
    if (!o) return null;
    const hhld = num(o.kaptdaCnt);
    const code = String(o.kaptCode ?? "").trim();
    if (!code || !Number.isFinite(hhld) || hhld <= 0) return null;
    return {
      kaptCode: code,
      kaptName: String(o.kaptName ?? "").trim(),
      hhldCnt: hhld,
      dongCnt: num(o.kaptDongCnt) || 0,
      useDate: String(o.kaptUsedate ?? "").trim(),
      addr: String(o.kaptAddr ?? o.doroJuso ?? "").trim(),
    };
  }
  const xml = raw;
  const body = xml.match(/<item>[\s\S]*?<\/item>/)?.[0] ?? xml;
  const kaptCode = tag(body, "kaptCode");
  const hhldCnt = num(tag(body, "kaptdaCnt"));
  if (!kaptCode || !Number.isFinite(hhldCnt) || hhldCnt <= 0) return null;
  return {
    kaptCode,
    kaptName: tag(body, "kaptName"),
    hhldCnt,
    dongCnt: num(tag(body, "kaptDongCnt")) || 0,
    useDate: tag(body, "kaptUsedate"),
    addr: tag(body, "kaptAddr", "doroJuso"),
  };
}

/**
 * 실거래의 (법정동, 단지명) 을 단지 목록에서 찾는다.
 *
 * 1) 같은 법정동 + 정규화 이름 완전일치
 * 2) 같은 법정동 안에서 한쪽이 다른 쪽을 포함하고, **그런 후보가 하나뿐일 때만** 인정
 *    ("래미안" 처럼 후보가 여럿이면 붙이지 않는다 — 잘못 붙이면 세대수가 통째로 틀린다)
 * 못 찾으면 null.
 */
export function matchApt(list: AptListItem[], umdNm: string, aptNm: string): AptListItem | null {
  const want = normAptName(aptNm);
  if (!want) return null;
  const inUmd = list.filter((a) => a.umd === umdNm);
  const pool = inUmd.length ? inUmd : list;

  const exact = pool.filter((a) => normAptName(a.kaptName) === want);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return null; // 같은 이름이 둘 — 어느 쪽인지 모른다

  const part = pool.filter((a) => {
    const n = normAptName(a.kaptName);
    return n.length > 1 && (n.includes(want) || want.includes(n));
  });
  return part.length === 1 ? part[0] : null;
}
