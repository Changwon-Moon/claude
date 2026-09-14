#!/usr/bin/env node
/**
 * 「연봉 1억 넘는 근로자」 카드 — `year-bars@2` (위 꺾은선 칸 + 아래 막대칸).
 *
 *   node scripts/build-wage-100m.mjs [--publish]
 *
 * ── 이 카드가 말하는 것
 * 아래 막대 = 총급여 1억 초과 근로소득자 **인원**
 * 위 꺾은선 = 그 인원이 **주민등록 총인구**에서 차지하는 비중
 *
 * ── 왜 겹치지 않고 위아래로 나누나 (오너 2026-09-14)
 * 인원(명)과 비중(%)은 단위가 다르다. 한 플롯에 겹쳐 그리면 두 축의 눈금을 독자가
 * 임의로 맞춰 읽게 되고, 축척을 조금만 흔들어도 "선이 막대를 앞질렀다" 같은
 * 없는 이야기가 만들어진다. 칸을 나누면 가로축(연도)만 공유하고 세로 눈금은 각자 갖는다.
 *
 * ── ⚠️ 비중이 둘이다. 섞으면 그대로 오보다.
 *   sharePayerPct = 억대 ÷ 연말정산 신고인원  → 기사가 쓰는 7.3%
 *   sharePopPct   = 억대 ÷ 주민등록 총인구    → 이 카드의 꺾은선
 * 분모가 다르므로 한 문장에 나란히 쓰지 않는다. 카드는 **인구 대비**만 선으로 그리고,
 * 신고인원 대비는 캡션에서 분모를 밝혀 따로 말한다.
 *
 * 수치는 전부 data/datasets/wage-100m.json 에서 온다 — 이 파일에 손으로 적은 숫자는 없다.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = resolve(ROOT, "data/datasets/wage-100m.json");

/* 카드 안쪽 폭과 막대 간격 — 템플릿 CSS 와 같은 값이어야 꺾은선 점이 막대 가운데에 선다.
 * 여기가 어긋나면 선이 막대에서 조금씩 밀리는데, **한 칸씩 밀린 그림도 그럴듯해 보인다.** */
const PLOT_W = 936;
const COL_GAP = 12;

/** 막대 높이의 천장. 값 라벨이 플롯 위로 넘치지 않게 남겨 두는 자리다. */
const BAR_CEIL = 86;
/** 꺾은선 칸에서 선이 쓸 수 있는 세로 범위(viewBox 1000 기준). 위는 라벨 자리로 비운다. */
const LINE_SPAN = 830;

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** i번째 칸의 가운데 x — viewBox 1000 좌표. 템플릿의 grid(1fr × n, gap) 와 같은 계산이다. */
function colCenter(i, n) {
  const colW = (PLOT_W - (n - 1) * COL_GAP) / n;
  const px = i * (colW + COL_GAP) + colW / 2;
  return (px / PLOT_W) * 1000;
}

/** 명 → "154.6" (만명 단위, 소수 한 자리). 단위는 카드 맨 윗줄이 한 번만 말한다. */
function man(n) {
  return (n / 10000).toFixed(1);
}

function main() {
  if (!existsSync(DATA)) {
    console.error(
      `❌ ${DATA} 가 없습니다.\n` +
      `   수집이 먼저입니다 — data/wage-bracket-queue.txt 에 한 줄 쓰고 push 하면\n` +
      `   wage-bracket-collect.yml 이 돌고, 결과는 data/wage-bracket-last.md 에 적힙니다.`,
    );
    process.exit(1);
  }
  const ds = JSON.parse(readFileSync(DATA, "utf8"));

  /* 검증된 데이터셋만 카드가 된다. */
  if (!ds?.meta?.verified) throw new Error("데이터셋이 verified: true 가 아니다 — 카드로 만들지 않는다");
  const rows = ds.rows ?? [];
  if (rows.length < 3) throw new Error(`연도가 ${rows.length}개뿐이다 — 추이 카드가 안 된다`);

  const n = rows.length;
  const first = rows[0];
  const last = rows[n - 1];

  /* ── 아래 막대칸: 인원 ───────────────────────────────────────── */
  const maxPeople = Math.max(...rows.map((r) => r.over100m));
  /* '최고'는 계산이 확인했을 때만 말한다. 마지막 해가 최고가 아니면 peak 는 그 해에 붙는다. */
  const peakYear = rows.find((r) => r.over100m === maxPeople).year;

  const points = rows.map((r) => {
    const h = (r.over100m / maxPeople) * BAR_CEIL;
    return {
      year: String(r.year),
      value: man(r.over100m),
      dir: "up",
      h: `${h.toFixed(2)}%`,
      totalH: `${h.toFixed(2)}%`,
      ...(r.year === peakYear ? { peak: true } : {}),
    };
  });

  /* ── 위 꺾은선 칸: 인구 대비 비중 ──────────────────────────────
   * 눈금 천장은 실제 최댓값에서 올려 잡는다(고정값을 박으면 다음 해에 선이 칸을 뚫는다). */
  const maxShare = Math.max(...rows.map((r) => r.sharePopPct));
  const yTop = Math.ceil(maxShare * 1.15 * 10) / 10;
  const xy = rows.map((r, i) => ({
    x: colCenter(i, n),
    y: 1000 - (r.sharePopPct / yTop) * LINE_SPAN,
  }));
  const fmt = (p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  const topLine = {
    height: "286px",
    caption: "<b>국민 100명 중 몇 명</b> · 주민등록 총인구 대비",
    points: xy.map(fmt).join(" "),
    /* 선 아래 옅은 면 — 값이 아니라 읽기를 돕는 바탕이다(아래 막대와 색이 같아 한 이야기로 읽힌다). */
    area: `${xy[0].x.toFixed(1)},1000 ${xy.map(fmt).join(" ")} ${xy[n - 1].x.toFixed(1)},1000`,
    dots: xy.map((p, i) => ({
      cx: Number(p.x.toFixed(1)),
      cy: Number(p.y.toFixed(1)),
      ...(i === n - 1 ? { on: true } : {}),
    })),
    /* 라벨은 양 끝만. 가운데까지 달면 선이 글자에 묻힌다. */
    labels: [
      {
        x: `${((xy[0].x / 1000) * 100).toFixed(2)}%`,
        y: `${((xy[0].y / 1000) * 100 - 1.5).toFixed(2)}%`,
        text: `${first.sharePopPct}%`,
        dim: true,
      },
      {
        x: `${((xy[n - 1].x / 1000) * 100).toFixed(2)}%`,
        y: `${((xy[n - 1].y / 1000) * 100 - 1.5).toFixed(2)}%`,
        text: `${last.sharePopPct}%`,
      },
    ],
  };

  /* 마지막 라벨이 카드 오른쪽 밖으로 나가지 않게 — 끝점은 오른쪽 끝에 가깝다. */
  if (xy[n - 1].x > 965) throw new Error("끝점이 너무 오른쪽이다 — 라벨이 잘린다. colGap 을 본다");

  const multiple = (last.over100m / first.over100m).toFixed(1);
  const card = {
    template: "year-bars@2",
    date: ds.meta.collectedAt,
    dense: n >= 13,
    subtitle: `막대 단위 만명 · 총급여 1억원 초과 근로소득자 · ${first.year}~${last.year}`,
    /* 제목은 계산이 확인한 것만 말한다 — 배수도 데이터에서 나온다. */
    title: `연봉 1억, <span class="hi">${multiple}배</span> 늘었다`,
    zeroAt: "100%",
    colGap: `${COL_GAP}px`,
    topLine,
    points,
    source: {
      name: ds.meta.sourceLabel,
      asOf: `${last.year}년 귀속`,
    },
  };

  const outDir = resolve(ROOT, `data/content/${ds.meta.collectedAt}`);
  mkdirSync(outDir, { recursive: true });
  const out = resolve(outDir, "wage-100m.json");
  writeFileSync(out, JSON.stringify(card, null, 2) + "\n");

  console.log(`wage-100m — ${first.year}~${last.year} (${n}칸)`);
  console.log(`   막대(인원)  ${man(first.over100m)}만 → ${man(last.over100m)}만 · ${multiple}배 · 최고 ${peakYear}`);
  console.log(`   선(인구대비) ${first.sharePopPct}% → ${last.sharePopPct}% · 눈금 천장 ${yTop}%`);
  console.log(`   참고(카드에 안 씀) 신고인원 대비 ${first.sharePayerPct}% → ${last.sharePayerPct}%`);
  console.log(`   → ${out}`);

  if (process.argv.includes("--publish")) console.log("   (등록은 data/review/sets.json 에서)");
}

main();
