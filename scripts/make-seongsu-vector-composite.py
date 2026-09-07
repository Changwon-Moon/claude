#!/usr/bin/env python3
"""
성수 카드 지도 판형 v3 — **기울인 백지도 위에 구역 4개를 칠하고, 각 사 투시도를 세운다.**

── 왜 이 판인가 (2026-09-06 오너)
 "디자인이 촌스럽다 · 정확한 구역을 확정짓고 · 그 위에 3D 투시도를 이질감 없이 얹어라 ·
  백지도(네이버 일반지도를 3D로 눕힌 것)를 바탕으로 · 조감도보다 투시도가 어울리게"

── 무엇이 어디서 오나 (전부 데이터셋 `vectorMap` 에 적혀 있다)
 · 바탕     : 오너가 준 기울인 백지도 (seongsu-3d-vector.png)
 · 강변북로  : 주황 띠를 **색으로 검출**해 직선으로 맞춘 것 — 구역의 남쪽 경계
 · 뚝섬로   : 눈으로 잰 점 4개의 직선 근사 — 구역의 북쪽 경계 (⚠️ 검출이 아니다)
 · 구역 나눔 : 지구단위계획 결정(변경)도에서 잰 비율 0.33 / 0.56 / 0.75
 · 투시도   : 각 사 투시도에서 배경을 뺀 것 (templates/_shared/photos/seongsu-cut/)
 · 크기·자리 : **구역 폭에 비례**해 계산한다. 손으로 정하지 않는다

── 정직하게 적어 둘 것
 · 투시도 네 장은 카메라 각도가 제각각이라 완전히 자연스럽지는 않다. 이건 "지도 위 3D 아이콘"으로
   읽히게 하는 판이지 항공사진 합성이 아니다. 각주에 그렇게 적는다.
 · 결정적이다 — 같은 입력이면 같은 픽셀 (난수·시각 없음).

실행: python3 scripts/make-seongsu-vector-composite.py
출력: templates/_shared/photos/seongsu-vector-composite.png  (+ 구역 사변형을 data/out/_spike 에 JSON 으로)
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PH = ROOT / "templates/_shared/photos"
DS = json.loads((ROOT / "data/datasets/seongsu-jeongbi-2026.json").read_text("utf8"))
COLORS = json.loads((ROOT / "data/datasets/builder-colors.json").read_text("utf8"))["colors"]
VM = DS["vectorMap"]
ST = VM["strip"]

OUT = PH / "seongsu-vector-composite.png"
MAX_TOWER_H = 340      # 투시도 최대 높이 — 제목 영역을 침범하지 않는 선
ZONE_ALPHA = 92        # 구역 채움 투명도
TOWER_W_RATIO = 0.78   # 투시도 폭 = 구역 폭 × 이 값


def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def zone_polys():
    ys = lambda x: ST["south"]["a"] + ST["south"]["b"] * x
    yn = lambda x: ST["north"]["a"] + ST["north"]["b"] * x
    xs_w, xn_w, xe = ST["westSouth"], ST["westNorth"], ST["east"]
    F = [0.0, *ST["dividers"], 1.0]
    polys = []
    for i in range(4):
        f0, f1 = F[i], F[i + 1]
        xs0, xs1 = xs_w + (xe - xs_w) * f0, xs_w + (xe - xs_w) * f1
        xn0, xn1 = xn_w + (xe - xn_w) * f0, xn_w + (xe - xn_w) * f1
        polys.append([(xn0, yn(xn0)), (xn1, yn(xn1)), (xs1, ys(xs1)), (xs0, ys(xs0))])
    return polys, ys


def main():
    zones = sorted(DS["zones"], key=lambda z: z["id"])
    base = Image.open(PH / VM["file"]).convert("RGBA")
    polys, ys = zone_polys()

    # ① 구역 채움 — 시공사 색, 흰 테두리
    ov = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for z, p in zip(zones, polys):
        c = hexrgb(COLORS[z["builder"]]["hex"])
        d.polygon(p, fill=c + (ZONE_ALPHA,), outline=(255, 255, 255, 235), width=4)
    canvas = Image.alpha_composite(base, ov)

    # ② 투시도 — 구역 폭에 비례해 키우고, 구역 남쪽에 세운다. 그림자 먼저.
    cut_dir = PH / VM["cutouts"]["dir"]
    files = {1: "1-gs.png", 2: "2-dl.png", 3: "3-samsung.png", 4: "4-lotte.png"}
    items = []
    for z, p in zip(zones, polys):
        f = cut_dir / files[z["id"]]
        if not f.exists():
            raise SystemExit(f"투시도 잘라낸 것이 없다: {f}")
        cut = Image.open(f).convert("RGBA")
        xs = [q[0] for q in p]
        zone_w = max(xs) - min(xs)
        cx = sum(q[0] for q in p) / 4
        scale = (zone_w * TOWER_W_RATIO) / cut.width
        if cut.height * scale > MAX_TOWER_H:
            scale = MAX_TOWER_H / cut.height
        cut = cut.resize((max(1, int(cut.width * scale)), max(1, int(cut.height * scale))), Image.LANCZOS)
        bottom = ys(cx) - 22
        items.append((bottom, cx, cut))
    for bottom, cx, cut in sorted(items, key=lambda t: t[0]):
        sh = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(sh)
        sd.ellipse([cx - cut.width * 0.42, bottom - 16, cx + cut.width * 0.42, bottom + 14], fill=(0, 0, 0, 85))
        canvas = Image.alpha_composite(canvas, sh.filter(ImageFilter.GaussianBlur(9)))
        canvas.alpha_composite(cut, (int(cx - cut.width / 2), int(bottom - cut.height)))

    canvas.convert("RGB").save(OUT)
    (ROOT / "data/out/_spike").mkdir(parents=True, exist_ok=True)
    (ROOT / "data/out/_spike/seongsu-zone-polys.json").write_text(json.dumps({"polys": polys}, ensure_ascii=False), "utf8")
    print(f"✅ {OUT.name} {canvas.size} — 구역 4 · 투시도 4")


if __name__ == "__main__":
    main()
