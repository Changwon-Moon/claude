/**
 * 신고가 알림 **미리보기** 만들기 — 네트워크 없이, 저장소에 이미 있는 실거래로만.
 *
 *   tsx src/singoPreviewCli.ts --baseline 202601,202606 --target 202607 --top 10
 *
 * ── 왜 이게 따로 있나 (2026-08-12 오너 "어제자 신고가 리스트 톡 한 번 보내줄래?")
 * 그날 정답은 **"못 보낸다"** 였다. 역대(2006~) 기준선이 61곳 중 1곳만 차 있었고,
 * 1000세대 명부는 0건이었다. 그 상태에서 "신고가"라고 보내면 그게 곧 오보다.
 *
 * 대신 **거짓말이 아닌 것**을 보낼 수는 있다. 저장소에는 2026-01~07 서울·경기 실거래가
 * 1차 출처로 이미 들어와 있다. 그걸로 "올해 상반기 대비 최고가"를 뽑으면
 * 수치는 전부 진짜고, 다른 것은 **기준선의 길이**뿐이다.
 *
 * 그래서 이 스크립트는 문구 머리에 **무엇이 진짜이고 무엇이 아직 아닌지**를 반드시 적는다.
 * 그 줄을 지우면 이 스크립트를 쓸 이유가 없어진다.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { validTrades } from "./parse/molit.js";
import { foldPeaks, findSingo, manwonToEok, type PeakEntry } from "./parse/singo.js";
import { singoRegions, monthRange } from "./sources/singoRegions.js";

const CWD = process.env.INIT_CWD || process.cwd();
const R = (p: string) => resolve(CWD, p);

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const [bFrom, bTo] = (arg("baseline") ?? "202601,202606").split(",");
const target = arg("target") ?? "202607";
const topN = Number(arg("top") ?? 10);
const outPath = R(arg("out") ?? "data/notify-once.txt");

const dir = R("data/datasets/molit");
const baseMonths = monthRange(bFrom, bTo);
const regions = singoRegions();

const hits: any[] = [];
let covered = 0;
for (const { gu, lawdCd } of regions) {
  const peaks: Record<string, PeakEntry> = {};
  let any = false;
  for (const ym of baseMonths) {
    const p = join(dir, `${lawdCd}-${ym}.json`);
    if (!existsSync(p)) continue;
    any = true;
    foldPeaks(peaks, lawdCd, validTrades(JSON.parse(readFileSync(p, "utf8")).trades));
  }
  const tp = join(dir, `${lawdCd}-${target}.json`);
  if (!any || !existsSync(tp)) continue;
  covered++;
  const tx = validTrades(JSON.parse(readFileSync(tp, "utf8")).trades).filter((t: any) => t.dealingGbn !== "직거래");
  hits.push(...findSingo(peaks, lawdCd, gu, tx));
}
hits.sort((a, b) => b.priceManwon - a.priceManwon);

const ym = `${target.slice(0, 4)}년 ${Number(target.slice(4, 6))}월`;
const bLabel = `${bFrom.slice(0, 4)}.${bFrom.slice(4, 6)}~${bTo.slice(4, 6)}`;

const lines = [
  `🧪 신고가 알림 미리보기 (아직 진짜 알림이 아닙니다)`,
  ``,
  `· 기준선이 **${bLabel} (${baseMonths.length}개월)** 입니다 — 진짜 기준인 2006년~ 는 아직 채우는 중`,
  `· **1,000세대 명부도 아직 미적용** — 지금은 전 단지 대상`,
  `· 아래 단지명·평·금액은 국토부 실거래 그대로입니다(직거래·해제 제외)`,
  ``,
  `📌 ${ym} 계약분 · ${covered}개 지역 · ${hits.length}건 중 거래가 상위 ${Math.min(topN, hits.length)}`,
  ``,
  ...hits.slice(0, topN).map((h) => `· ${h.aptNm} ${h.pyeong} ${manwonToEok(h.priceManwon)}`),
  ``,
  `실제 알림은 여기서 머리 3줄이 빠지고 목록만 옵니다.`,
];

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, lines.join("\n") + "\n");
console.log(lines.join("\n"));
console.log(`\n→ ${outPath}`);
