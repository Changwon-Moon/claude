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

export interface AptDetail {
  kaptCode: string;
  parkGround: number; // 지상 주차대수(kaptdPcnt)
  parkUnder: number; // 지하 주차대수(kaptdPcntu)
  parkTotal: number;
}

/**
 * 공동주택 **상세** 정보 → 주차대수 (오너 2026-08-16 "전용면적·층수 아래 주차대수 0.0대").
 *
 * ⚠️ 주차대수는 **기본정보(getAphusBassInfo)에 없다.** 상세정보(getAphusDtlInfo)에만 있다 —
 *    지상 `kaptdPcnt` + 지하 `kaptdPcntu` 두 칸으로 나뉘어 온다. 한쪽만 읽으면
 *    지하주차장 단지에서 "0.1대"가 나온다.
 * ⚠️ **둘 다 0이면 null 을 돌려준다.** 0대는 있을 수 없는 값이고, 응답이 빈 것을
 *    0으로 적어 버리면 카드에 "주차 0.0대"가 그대로 나간다(그게 오보다).
 */
export function parseAptDetail(raw: string): AptDetail | null {
  const readPair = (g: (k: string) => unknown) => {
    const ground = num(g("kaptdPcnt"));
    const under = num(g("kaptdPcntu"));
    const a = Number.isFinite(ground) ? ground : 0;
    const b = Number.isFinite(under) ? under : 0;
    return { a, b };
  };
  const js = items(raw);
  if (js) {
    const o = js[0];
    if (!o) return null;
    const code = String(o.kaptCode ?? "").trim();
    const { a, b } = readPair((k) => (o as Record<string, unknown>)[k]);
    if (!code || a + b <= 0) return null;
    return { kaptCode: code, parkGround: a, parkUnder: b, parkTotal: a + b };
  }
  const body = raw.match(/<item>[\s\S]*?<\/item>/)?.[0] ?? raw;
  const code = tag(body, "kaptCode");
  const { a, b } = readPair((k) => tag(body, k));
  if (!code || a + b <= 0) return null;
  return { kaptCode: code, parkGround: a, parkUnder: b, parkTotal: a + b };
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

/**
 * 공동주택 대장 주소에서 **지번**을 뽑는다.
 *   "서울특별시 송파구 장지동 901 송파꿈에그린아파트"   → "901"
 *   "서울특별시 강동구 둔촌동 633- 올림픽파크포레온"     → "633"
 *   "서울특별시 종로구 신문로2가 1-434 광화문스페이스본"  → "1-434"
 *
 * ── 왜 필요한가 (2026-08-25)
 * 실거래 신고명과 대장명이 **아예 다른** 단지가 있다:
 *   실거래 「위례24단지(꿈에그린)」  ↔  대장 「송파꿈에그린아파트」
 * 이름으로는 어떤 규칙으로도 못 잇는다. 그런데 **지번은 둘 다 장지동 901** 이다.
 * 실측하니 명부 1,147개 중 이름으로 이어진 것이 652개(56.8%)뿐이었고,
 * 지번을 덧대면 834개(72.7%)가 된다 — **182개가 되살아난다.**
 *
 * ⚠️ 법정동 이름에도 숫자가 붙는다("신문로2가"). 그래서 **동 이름 토막을 건너뛴 뒤**의
 *    첫 숫자 토막만 본다 — '가'·'동'·'읍'·'면'·'리' 로 끝나는 토막까지는 주소다.
 * ⚠️ 끝의 '-' 는 떼고 돌려준다(대장은 "633-" 처럼 부번 없이 남기기도 한다).
 *    실거래 지번과 맞대려면 양쪽을 같은 모양으로 만들어야 한다 — 그건 normJibun 이 한다.
 */
export function jibunFromAddr(addr: string): string | null {
  const toks = String(addr ?? "").trim().split(/\s+/);
  let i = toks.findIndex((t) => /[가동읍면리]$/.test(t));
  if (i < 0) return null;
  for (let k = i + 1; k < toks.length; k++) {
    const t = toks[k];
    if (/^\d+(-\d+)?-?$/.test(t)) return normJibun(t);
    break; // 숫자가 바로 안 나오면 지번이 없는 주소다
  }
  return null;
}

/** 지번 표기 통일 — 끝의 '-' 를 떼고 앞뒤 공백을 없앤다. 빈 값·문자 지번은 null. */
export function normJibun(raw: string): string | null {
  const s = String(raw ?? "").trim().replace(/-+$/, "");
  return /^\d+(-\d+)?$/.test(s) ? s : null;
}
