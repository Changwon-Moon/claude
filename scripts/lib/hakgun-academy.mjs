/**
 * 학군지 × 학원 원장 잇기 — **한 곳에만 둔다.**
 *
 * 학원 카드와, 나중에 학원 수를 인용할 캡션·다른 카드가 같은 규칙을 써야 한다.
 * 두 벌로 갈리면 같은 계정에서 서로 다른 「대치 학원 수」가 나간다.
 *
 * ── 어떻게 잇나
 * 학원 원장에는 법정동 칸이 없어, 수집기가 주소에서 **시군구 + 법정동**을 뽑아 뒀다.
 * 학군지는 (시군구코드 + 법정동 목록)으로 정의돼 있으므로 그 둘을 맞춘다.
 *
 * ⚠️ **시도만 맞추면 안 된다.** 서현동·정자동·목동·상동 같은 이름은 여러 시군구에 있다 —
 *    시도 단위로만 걸렀더니 분당에 수원 장안구·남양주가 통째로 딸려 왔다(2026-09-02 실측).
 *
 * ⚠️ 이름의 이음새가 둘 있다. 지어내지 않고 **여기 적어 둔다.**
 *    ① 최근 분구: 화성시↔화성시동탄구, 부천시↔부천시원미구 — 주소가 옛 이름으로도 온다.
 *    ② 세종: 지오데이터는 「세종시」, 주소는 「세종특별자치시」.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/** 지오데이터의 시군구명 → 주소에 나오는 이름. 다르면 여기 적는다(유추 금지). */
const SGG_ALIAS = { 세종시: "세종특별자치시" };

/** 학원 집계를 전부 읽어 한 배열로. 파일이 없으면 던진다 — 조용히 0이 되면 안 된다. */
export function loadAcademyRows(root) {
  const dir = join(root, "data/datasets/neis-academy");
  let files;
  try {
    files = readdirSync(dir).filter((f) => /^[A-Z]\d{2}\.json$/.test(f));
  } catch {
    throw new Error(`학원 집계가 없습니다: ${dir} — data/neis-queue.txt 에 한 줄 밀어 수집하세요.`);
  }
  if (!files.length) throw new Error(`학원 집계가 비었습니다: ${dir}`);
  const rows = [];
  const sido = [];
  for (const f of files) {
    const j = JSON.parse(readFileSync(join(dir, f), "utf8"));
    if (j.meta?.verified !== true) throw new Error(`verified:true 가 아닌 학원 파일: ${f}`);
    if (!j.rows?.[0] || !("ipsiAca" in j.rows[0]))
      throw new Error(`${f} 이 옛 판입니다(ipsiAca 없음) — force=true 로 다시 수집하세요.`);
    sido.push({ code: j.meta.sidoCode, coverage: j.meta.coverage, collectedAt: j.meta.collectedAt });
    rows.push(...j.rows);
  }
  return { rows, sido };
}

/**
 * 학군지 하나의 학원 수. `{ aca, gyoseup, jeongwonPct, sgg[] }`.
 * aca = 분야가 「입시·검정 및 보습」인 **학원**(교습소 제외).
 */
export function countArea(area, rows, nameOfLawd) {
  const codes = [area.sggCd, ...(area.alsoSggCd || [])];
  const want = new Set(
    codes.map((c) => {
      const n = nameOfLawd[c];
      if (!n) throw new Error(`시군구 코드를 지오데이터에서 못 찾았습니다: ${c} (${area.name})`);
      return SGG_ALIAS[n] || n;
    }),
  );
  // 분구 전 이름도 받는다 — 「화성시동탄구」의 주소가 아직 「화성시」로도 온다.
  const loose = new Set([...want].map((n) => n.replace(/(시)(.+구)$/, "$1")));
  const hit = rows.filter((r) => (want.has(r.sgg) || loose.has(r.sgg)) && area.dongs.includes(r.dong));
  const aca = hit.reduce((s, x) => s + x.ipsiAca, 0);
  const gyoseup = hit.reduce((s, x) => s + x.ipsiGyoseup, 0);
  const jwN = hit.reduce((s, x) => s + x.ipsiJeongwonN, 0);
  return {
    aca,
    gyoseup,
    ipsi: aca + gyoseup,
    // 정원은 아직 카드에 안 쓴다 — 신고 편차가 커서(곳당 61~660명) 규모로 못 읽는다.
    // 얼마나 적혀 있는지만 들고 다니며, 충분히 높아지면 그때 쓴다.
    jeongwonPct: aca + gyoseup ? Math.round((jwN / (aca + gyoseup)) * 100) : 0,
    sgg: [...new Set(hit.map((h) => h.sgg))],
    dongsHit: [...new Set(hit.map((h) => h.dong))],
  };
}

/** 지오데이터에서 법정동코드(앞5)→시군구명 표를 만든다. 손으로 적지 않는다. */
export function lawdNameTable(root) {
  const geo = JSON.parse(readFileSync(join(root, "data/geo/korea-sgg-2026.geojson"), "utf8"));
  const t = {};
  for (const f of geo.features) if (f.properties.lawd) t[f.properties.lawd] = f.properties.name;
  return t;
}
