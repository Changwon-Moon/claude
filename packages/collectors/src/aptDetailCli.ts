/**
 * 단지코드 → **주차대수** (국토교통부 공동주택 상세정보 · 키 필요 → GitHub Actions 전용).
 *
 *   MOLIT_API_KEY=xxx tsx src/aptDetailCli.ts --kapt A42385801
 *
 * ── 왜 따로 받나 (2026-08-16 오너 "전용면적·층수 아래 주차대수 0.0대 추가")
 * 세대수는 **기본정보**에, 주차대수는 **상세정보**에 있다. 서로 다른 오퍼레이션이라
 * `apt-hhld.json`(대장 8,062건)에는 주차대수가 아예 없다. 단지 하나짜리 카드에
 * 8,062건을 다시 훑을 이유가 없어, **짚어 준 단지만** 받아 따로 적어 둔다.
 *
 * ── 오보 0
 * · 지상(kaptdPcnt) + 지하(kaptdPcntu) 를 **둘 다** 더한다 — 한쪽만 읽으면 지하주차장
 *   단지에서 "0.1대"가 나온다.
 * · 둘 다 0이면 **파일을 안 쓴다.** 0대인 아파트는 없다 — 그건 응답이 빈 것이고,
 *   그걸 0으로 적으면 카드에 "주차 0.0대"가 그대로 나간다.
 * · 세대당 대수는 **여기서 계산하지 않는다.** 세대수는 대장(apt-hhld.json)에 있고
 *   빌더가 그 둘을 물려 나눈다 — 나눗셈이 두 곳에 있으면 언젠가 서로 달라진다.
 *
 * 결과: `data/datasets/apt-detail/{kaptCode}.json`
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fetchAptDetail, chosenOps } from "./sources/aptInfo.js";

const CWD = process.env.INIT_CWD || process.cwd();
const R = (p: string) => resolve(CWD, p);
const arg = (n: string) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

async function main() {
  const key = process.env.MOLIT_API_KEY || process.env.DATA_GO_KR_KEY || "";
  if (!key) {
    console.error("MOLIT_API_KEY 환경변수가 없습니다 (GitHub Secrets에 등록).");
    process.exit(1);
  }
  const kapt = arg("kapt");
  if (!kapt) {
    console.error("사용법: --kapt A42385801");
    process.exit(1);
  }

  const d = await fetchAptDetail(kapt, key);
  if (!d) {
    // ⚠️ 못 받았으면 **아무것도 쓰지 않는다.** 빈 값을 0으로 적는 순간 그게 오보다.
    console.error(`⛔ ${kapt} 의 주차대수를 못 받았습니다 — 파일을 쓰지 않습니다.`);
    process.exit(1);
  }

  const outDir = R("data/datasets/apt-detail");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `${kapt}.json`);
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        _: [
          "국토교통부 공동주택 **상세**정보의 주차대수. 지상(kaptdPcnt)+지하(kaptdPcntu) 합이다.",
          "세대당 대수는 여기 없다 — 세대수는 apt-hhld.json 에 있고 빌더가 나눈다.",
          "둘 다 0이면 이 파일이 아예 없다. 카드는 그때 주차 줄을 붙이지 않는다.",
        ],
        kaptCode: d.kaptCode,
        parkGround: d.parkGround,
        parkUnder: d.parkUnder,
        parkTotal: d.parkTotal,
        source: `국토교통부 공동주택 상세정보 (${chosenOps().dtl})`,
        collectedFor: new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10),
      },
      null,
      2,
    ) + "\n",
  );

  console.log(
    `${outPath}\n${kapt} 주차 지상 ${d.parkGround} + 지하 ${d.parkUnder} = **${d.parkTotal}대** ` +
      `(오퍼레이션 ${chosenOps().dtl})`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
