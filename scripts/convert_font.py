#!/usr/bin/env python3
"""OTF(CFF) → WOFF2 재패키징 (Chromium OTS 통과용).

세션(코드 대화창)은 폰트 변환 도구 설치가 막혀 있어 Actions(font-convert.yml)에서 돈다.
태백체 OTF는 vhea/vmtx(세로쓰기 메트릭) 테이블을 포함해 Chromium OTS가 거부한다.
→ fontTools로 로드해 세로 메트릭·DSIG를 제거하고 전 테이블을 재컴파일한 뒤 WOFF2로 저장.
가로 텍스트에는 vhea/vmtx가 불필요하므로 제거해도 렌더 영향 없음. 결정적(입력 동일=출력 동일).

  python3 scripts/convert_font.py <in.otf> <out.woff2>
"""
import sys
from fontTools.ttLib import TTFont

DROP = ["vhea", "vmtx", "VORG", "DSIG"]  # OTS 트러블 유발 세로 메트릭 등 제거


def main() -> None:
    src, out = sys.argv[1], sys.argv[2]
    f = TTFont(src, recalcBBoxes=True, recalcTimestamp=False)
    removed = []
    for tag in DROP:
        if tag in f:
            del f[tag]
            removed.append(tag)
    # 전 테이블 재컴파일(체크섬·구조 정상화) 후 WOFF2 패키징
    f.flavor = "woff2"
    f.save(out, reorderTables=True)
    print(f"✅ {out} 저장 · 제거 테이블: {removed or '(없음)'}")

    # 검증: 다시 열어 필수 테이블 + 아웃라인(CFF 또는 glyf) 존재 확인
    chk = TTFont(out)
    need = ["cmap", "head", "hhea", "hmtx", "maxp", "name", "post", "OS/2"]
    missing = [t for t in need if t not in chk]
    if missing:
        raise SystemExit(f"⛔ 필수 테이블 누락: {missing}")
    if "CFF " not in chk and "glyf" not in chk:
        raise SystemExit("⛔ 아웃라인 테이블(CFF/glyf) 없음")
    print(f"   검증 OK · 테이블 {len(chk.keys())}개 · 아웃라인={'CFF' if 'CFF ' in chk else 'glyf'}")


if __name__ == "__main__":
    main()
