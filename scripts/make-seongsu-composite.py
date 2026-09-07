#!/usr/bin/env python3
"""
성수 카드 지도 판형 — **3D 항공사진 위에 전체 조감도를 얹어 한 장으로 만든다.**

── 왜 이 방식인가 (2026-09-06 오너 "지도 위에 조감도를 3d로 얹히는 작업은 못해?")

먼저 **개별 투시도 네 장을 잘라 세워 봤고, 안 됐다.**
 · 네 장의 카메라 각도가 제각각이다(1지구 눈높이 / 2지구 높은 조감 / 3지구 지상 근경 / 4지구 강 위).
   위에서 비스듬히 내려다본 항공사진에 그대로 세우면 시점이 어긋나 가짜로 보인다.
 · 배경 제거(rembg u2net)가 건축 렌더의 옅은 하늘·가는 타워 모서리를 먹었다 —
   3·4지구는 타워가 절반쯤 사라졌다. 시험 결과는 세션 기록에 남겼다.

**전체 조감도 한 장은 된다.** 카메라가 하나뿐이고, 항공사진과 같은 방향(강 쪽에서 북쪽)이라
띠째로 얹으면 축이 맞는다. 그래서 **잘라 붙이지 않고 띠를 통째로 덮고 가장자리를 흐린다.**

⚠️ **이 조감도는 정비계획 당시 이미지지 지금 시공사들의 설계가 아니다.**
   그래서 카드 각주에 그렇게 적는다. 안 적으면 "성수가 이렇게 지어진다"로 읽힌다 — 그게 오보다.
   각 시공사의 실제 제안은 카드 **아래 네 칸의 투시도**가 따로 보여 준다.

결정적이다 — 같은 입력이면 같은 픽셀이 나온다(난수·시각 없음).

실행: python3 scripts/make-seongsu-composite.py
출력: templates/_shared/photos/seongsu-3d-composite.png
"""
from PIL import Image, ImageFilter, ImageDraw
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PH = ROOT / "templates/_shared/photos"

BASE = PH / "seongsu-3d-wide.png"                    # 네이버 3D 항공뷰(오너 제공)
OVER = PH / "_source-seongsu-aerial-blue.png"        # 전체 조감도(오너 제공 · 참고자료)
OUT = PH / "seongsu-3d-composite.png"

CROP = (150, 95, 1985, 1120)   # 데이터셋 aerial.crop 과 같은 창. 여기서 미리 잘라 둔다
BAND = (120, 60, 935, 378)     # 조감도에서 타워 띠만
BAND_W = 1480                  # 얹을 폭 — 1지구 서쪽 끝 ~ 4지구 동쪽 끝을 덮는 길이
PASTE_X = 140                  # 크롭 좌표 기준
BASE_Y = 706                   # 조감도의 강변북로가 항공사진의 강변북로에 앉는 높이
FADE_BOTTOM, FADE_SIDE, FADE_TOP, BLUR = 96, 130, 70, 11


def main():
    base = Image.open(BASE).convert("RGB").crop(CROP)
    band = Image.open(OVER).convert("RGB").crop(BAND)
    h = round(band.height * BAND_W / band.width)
    band = band.resize((BAND_W, h), Image.LANCZOS)

    # 가장자리를 흐려 이음매를 지운다 — 아래는 도로에, 좌우·위는 기존 시가지에 녹인다.
    mask = Image.new("L", (BAND_W, h), 255)
    d = ImageDraw.Draw(mask)
    for i in range(FADE_BOTTOM):
        d.line([(0, h - 1 - i), (BAND_W, h - 1 - i)], fill=int(255 * i / FADE_BOTTOM))
    for i in range(FADE_TOP):
        d.line([(0, i), (BAND_W, i)], fill=int(255 * i / FADE_TOP))
    for i in range(FADE_SIDE):
        v = int(255 * i / FADE_SIDE)
        d.line([(i, 0), (i, h)], fill=v)
        d.line([(BAND_W - 1 - i, 0), (BAND_W - 1 - i, h)], fill=v)
    mask = mask.filter(ImageFilter.GaussianBlur(BLUR))

    out = base.copy()
    out.paste(band, (PASTE_X, BASE_Y - h), mask)
    out.save(OUT)
    print(f"✅ {OUT.name} {out.size} — 조감도 띠 {BAND_W}×{h} @ ({PASTE_X}, {BASE_Y - h})")


if __name__ == "__main__":
    main()
