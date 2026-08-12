#!/usr/bin/env python3
"""
인물 사진 규격화 — 얼굴을 재서 **같은 크기로** 맞춘다.

── 왜 필요한가 (2026-08-12 오너 지적)
「역대 정부 통화량」 카드의 대통령 6인 사진이 제각각이었다. 위키미디어에서 받은 원본은
공식 초상(가슴까지)부터 연단 발언 사진(마이크 포함)까지 화각이 달라, 높이만 맞추면
얼굴 크기가 두 배 가까이 차이 난다. **높이를 맞추는 것과 얼굴을 맞추는 것은 다르다.**

── 어떻게
사람이 칸마다 손으로 자르지 않는다. OpenCV 로 **얼굴을 검출해 그 크기를 기준으로**
모든 사진을 같은 틀에 맞춘다 — 얼굴 높이가 프레임의 일정 비율, 눈높이가 같은 자리.
검출이 안 되면 그 사진은 **건너뛰고 보고한다**(추측해서 자르지 않는다).

── 덤: 누끼 부스러기 제거
배경을 지운 PNG 에는 원본 스캔 자국이 조각으로 남는다(노무현 사진의 머리 위 뿔).
사람 본체와 **떨어져 있는 작은 덩어리**를 지운다 — 가장 큰 덩어리만 남긴다.

실행: python3 scripts/normalize-portraits.py <slug> [<slug> ...]
출력: templates/_shared/photos/<slug>-face.png  (원본은 그대로 둔다)
"""
import sys, os
import numpy as np
import cv2
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTOS = os.path.join(ROOT, "templates/_shared/photos")

# 출력 틀 — 3:4. 얼굴이 프레임 높이의 FACE_H 를, 얼굴 중심이 위에서 FACE_CY 지점에 오게 한다.
OUT_W, OUT_H = 480, 640
FACE_H = 0.40      # 얼굴(검출 상자) 높이 / 프레임 높이
FACE_CY = 0.34     # 얼굴 중심의 세로 위치(프레임 대비)

CASCADE = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"


def dekey_white(rgb, alpha, thr=238):
    """가장자리에서 번져 들어가며 **밝은 배경**을 투명으로 만든다.

    누끼 PNG 인데도 흰 배경이 사각형으로 남아 오는 경우가 있다(윤석열 초상 2026-08-12).
    카드 종이색(#fafaf8)과 미묘하게 달라 **흰 네모의 경계선**이 그대로 보인다.
    임계값으로 통째로 지우면 흰 셔츠·백발까지 날아가므로, **테두리에 닿아 있는 밝은 영역만**
    번지기(flood fill)로 지운다 — 인물 안쪽의 흰색은 테두리와 이어져 있지 않아 살아남는다.
    """
    h, w = alpha.shape
    bright = (rgb.min(axis=2) >= thr).astype(np.uint8)
    if bright.sum() < h * w * 0.02:
        return alpha, 0
    ff = bright.copy()
    mask = np.zeros((h + 2, w + 2), np.uint8)
    for x in range(0, w, max(1, w // 40)):
        for y in (0, h - 1):
            if ff[y, x] == 1:
                cv2.floodFill(ff, mask, (x, y), 2)
    for y in range(0, h, max(1, h // 40)):
        for x in (0, w - 1):
            if ff[y, x] == 1:
                cv2.floodFill(ff, mask, (x, y), 2)
    kill = (ff == 2)
    if not kill.any():
        return alpha, 0
    out = alpha.copy()
    out[kill] = 0
    return out, int(kill.sum())


def largest_component(alpha):
    """알파에서 가장 큰 덩어리만 남긴다 — 떨어져 나온 부스러기(스캔 자국) 제거."""
    mask = (alpha > 24).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    if n <= 2:
        return alpha, 0
    # 0 = 배경
    areas = stats[1:, cv2.CC_STAT_AREA]
    keep = 1 + int(np.argmax(areas))
    removed = int(mask.sum() - stats[keep, cv2.CC_STAT_AREA])
    out = alpha.copy()
    out[labels != keep] = 0
    return out, removed


def detect_face(bgr):
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    cc = cv2.CascadeClassifier(CASCADE)
    h = gray.shape[0]
    for mn in (int(h * 0.08), int(h * 0.04), 30):
        faces = cc.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=5, minSize=(mn, mn))
        if len(faces):
            # 가장 큰 얼굴 = 주인공
            return max(faces, key=lambda f: f[2] * f[3])
    return None


def process(slug):
    src = None
    for ext in ("-cut.png", ".png", ".jpg"):
        p = os.path.join(PHOTOS, slug + ext)
        if os.path.exists(p):
            src = p
            break
    if not src:
        return f"{slug}: 원본 없음"

    im = Image.open(src).convert("RGBA")
    arr = np.array(im)
    rgb, alpha = arr[:, :, :3], arr[:, :, 3]

    alpha, dekeyed = dekey_white(rgb, alpha)
    alpha, removed = largest_component(alpha)

    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    face = detect_face(bgr)
    if face is None:
        return f"{slug}: ❌ 얼굴 검출 실패 — 손대지 않았다"
    fx, fy, fw, fh = [int(v) for v in face]
    fcx, fcy = fx + fw / 2.0, fy + fh / 2.0

    # 얼굴 높이가 OUT_H*FACE_H 가 되도록 하는 배율
    scale = (OUT_H * FACE_H) / fh
    # 원본에서 잘라낼 창의 크기
    cw, ch = OUT_W / scale, OUT_H / scale
    x0 = fcx - cw / 2.0
    y0 = fcy - ch * FACE_CY

    # 창이 원본 밖으로 나가면 투명으로 채운다(억지로 밀어 넣으면 얼굴 위치가 어긋난다)
    canvas = np.zeros((int(round(ch)), int(round(cw)), 4), dtype=np.uint8)
    sx0, sy0 = int(round(x0)), int(round(y0))
    H, W = rgb.shape[0], rgb.shape[1]
    src_x0, src_y0 = max(0, sx0), max(0, sy0)
    src_x1, src_y1 = min(W, sx0 + canvas.shape[1]), min(H, sy0 + canvas.shape[0])
    if src_x1 <= src_x0 or src_y1 <= src_y0:
        return f"{slug}: ❌ 잘라낼 영역이 원본 밖"
    dst_x0, dst_y0 = src_x0 - sx0, src_y0 - sy0
    canvas[dst_y0:dst_y0 + (src_y1 - src_y0), dst_x0:dst_x0 + (src_x1 - src_x0), :3] = rgb[src_y0:src_y1, src_x0:src_x1]
    canvas[dst_y0:dst_y0 + (src_y1 - src_y0), dst_x0:dst_x0 + (src_x1 - src_x0), 3] = alpha[src_y0:src_y1, src_x0:src_x1]

    out = Image.fromarray(canvas).resize((OUT_W, OUT_H), Image.LANCZOS)
    dst = os.path.join(PHOTOS, f"{slug}-face.png")
    out.save(dst)
    return (f"{slug}: ✅ 얼굴 {fw}x{fh} → 배율 {scale:.3f}"
            + (f" · 흰배경 {dekeyed}px 제거" if dekeyed else "")
            + (f" · 부스러기 {removed}px 제거" if removed else "")
            + f" → {os.path.basename(dst)}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    for slug in sys.argv[1:]:
        print(process(slug))
