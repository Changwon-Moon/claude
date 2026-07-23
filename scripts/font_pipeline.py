#!/usr/bin/env python3
"""폰트 → Chromium OTS 통과 WOFF2 파이프라인 (Actions 전용, 네트워크 필요).

Chromium은 폰트를 OTS(OpenType Sanitizer)로 검증 후 로드한다. 태백체 OTF(CFF+세로메트릭)는
OTS가 거부 → 텍스트가 폴백 폰트로 렌더된다. opentype-sanitizer(ots) 파이썬 API로:
  1) 원본을 OTS 정화 시도 → 통과하면 그 산출물 사용
  2) 실패 시 CFF→TTF(glyf) 변환 후 OTS 재시도(glyf가 OTS에 관대)
  3) 통과본을 세로메트릭 제거 후 WOFF2로 패키징
  4) 최종 WOFF2를 OTS로 재검증(= Chromium 로딩 보장)

  python3 scripts/font_pipeline.py <in.otf> <out.woff2>
"""
import os
import sys
from ots import sanitize  # opentype-sanitizer
from fontTools.ttLib import TTFont

TMP = "/tmp"
DROP = ["vhea", "vmtx", "VORG", "DSIG"]


def ots_ok(src: str, dst: str) -> bool:
    """OTS 정화 실행 — 통과(정화본 생성)면 True. 오류는 stderr로 로그에 남김."""
    try:
        sanitize(src, dst)
        return os.path.exists(dst) and os.path.getsize(dst) > 0
    except Exception as e:  # noqa: BLE001
        print(f"   OTS 거부 [{os.path.basename(src)}]: {e}")
        return False


def main() -> None:
    otf, out = sys.argv[1], sys.argv[2]
    name = os.path.splitext(os.path.basename(out))[0]

    print("===== 1) 원본 OTS 정화 =====")
    clean = None
    cand = f"{TMP}/{name}.ots.otf"
    if ots_ok(otf, cand):
        clean = cand
        print("   → 원본이 OTS 통과")
    else:
        print("===== 2) CFF→TTF(glyf) 변환 후 재시도 =====")
        ttf = f"{TMP}/{name}.ttf"
        rc = os.system(f"otf2ttf -o {ttf} {otf}")
        cand2 = f"{TMP}/{name}.ots.ttf"
        if rc == 0 and os.path.exists(ttf) and ots_ok(ttf, cand2):
            clean = cand2
            print("   → TTF 변환본이 OTS 통과")

    if not clean:
        raise SystemExit("⛔ OTS를 통과하는 산출물이 없음 — 위 거부 사유 확인")

    print("===== 3) WOFF2 패키징(세로메트릭 제거) =====")
    f = TTFont(clean)
    removed = [t for t in DROP if t in f]
    for t in removed:
        del f[t]
    f.flavor = "woff2"
    f.save(out, reorderTables=True)
    print(f"   ✅ {out} 저장 · 제거 {removed or '(없음)'}")

    print("===== 4) 최종 WOFF2 OTS 재검증 =====")
    if not ots_ok(out, f"{TMP}/{name}.final.check"):
        raise SystemExit("⛔ 최종 WOFF2가 OTS 재검증 실패")
    outline = "CFF" if "CFF " in TTFont(out) else "glyf"
    print(f"   ✅ 재검증 통과 · 아웃라인={outline} · {os.path.getsize(out)//1024}KB")


if __name__ == "__main__":
    main()
