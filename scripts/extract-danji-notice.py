#!/usr/bin/env python3
"""입주자모집공고문(PDF)에서 청약 카드용 수치를 **코드가** 뽑는다 — 오보 0.

청약홈 API 는 분양가·동수·층수·전용면적 구성을 주지 않는다. 지금까지는 사람이
공고문을 눈으로 읽어 데이터셋에 옮겨 적었는데, 옮겨 적는 순간 그 숫자의 출처는
"사람의 눈"이 된다. 이 스크립트는 그 자리를 코드로 바꾼다.

무엇을 하나
  ① 공급대상 표에서  주택형(약식) → 총공급 세대수
  ② 공급금액 표에서  주택형별 동/라인·층별 행 → **세대수**와 **공급금액(계)**
  ③ ②의 행을 ①의 세대수만큼 순서대로 먹어 가며 타입 경계를 스스로 찾고,
     **먹은 합이 ①과 정확히 같지 않으면 던진다.**
     → 이게 이 스크립트의 유일한 안전장치다. 두 표는 공고문 안의 서로 다른 표이므로
       파싱이 한 칸이라도 밀리면 합이 어긋난다. 합이 맞으면 밀리지 않았다는 뜻이다.
  ④ 면적대(㎡)로 묶어 면적대별 세대수 합과 **최고 분양가**를 낸다.

무엇을 하지 않나
  · 값을 추정하지 않는다. 못 읽으면 던진다.
  · 데이터셋을 직접 고치지 않는다. JSON 을 찍기만 한다 — 사람이 보고 붙인다.

공고문마다 표의 좌표가 다르므로 **프로필**이 필요하다(아래 NOTICES).
새 공고를 넣을 때는 프로필 한 덩어리를 추가한다. 좌표는
`--probe` 로 그 구간의 낱말과 x 좌표를 찍어 보고 정한다.

실행:
    python3 scripts/extract-danji-notice.py 2026000382
    python3 scripts/extract-danji-notice.py 2026000354 --probe 1540 1600
"""
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    sys.exit("pdfplumber 가 필요합니다:  pip install pdfplumber --break-system-packages")

ROOT = Path(__file__).resolve().parent.parent
NOTICE_DIR = ROOT / "data/review/notices"

# ── 공고문 프로필 ────────────────────────────────────────────────────────────
# supply : 공급대상 표. 낱말을 순서대로 읽어 `typeIdx`·`unitsIdx` 번째를 쓴다.
# price  : 공급금액 표. 세대수·금액(계) 열의 x 구간으로 고른다.
# charSplit: 낱말이 글자 단위로 쪼개져 나오는 PDF(롯데캐슬)면 True — 붙여서 되살린다.
NOTICES = {
    "2026000382": {
        "name": "두산위브더제니스 부천",
        "file": "2026000382-doosan-we-ve-zenith-bucheon.pdf",
        "charSplit": False,
        "supply": {"x": (55, 340), "top": (650, 725), "typeIdx": 2, "unitsIdx": -2},
        "price": {
            "x": (55, 210),
            "top": (800, 1400),
            "unitsX": (85, 95),
            "totalX": (170, 182),
            # 계(금액)가 10억을 넘으면 앞 열과 붙어 한 낱말이 된다: "627,000,0001,045,000,000"
            "mergedX": (138, 145),
            "mergedTail": 13,
        },
    },
    "2026000354": {
        "name": "상동역 롯데캐슬 시그니처",
        "file": "2026000354-sangdong-lotte-castle.pdf",
        "charSplit": True,
        "supply": {"x": (30, 520), "top": (1140, 1230), "typeIdx": 2, "unitsIdx": 9},
        "price": {
            "x": (80, 215),
            "top": (1545, 2320),
            "unitsX": (84, 92),
            "totalX": (186, 192),
            # 대지비·건축비·부가세·계가 통째로 한 낱말이 되는 행이 있다
            "mergedX": (125, 132),
            "mergedTail": 13,
        },
    },
}

MONEY = re.compile(r"\d{1,2},\d{3},\d{3},\d{3}|\d{3},\d{3},\d{3}")


def rows_of(page, box, char_split):
    """같은 밑선(top)에 있는 낱말을 한 행으로 묶어 (텍스트, x0) 목록으로 돌려준다."""
    x0, x1 = box["x"]
    t0, t1 = box["top"]
    sel = [w for w in page.extract_words() if x0 <= w["x0"] <= x1 and t0 <= w["top"] <= t1]
    band = defaultdict(list)
    for w in sel:
        band[round(w["top"], 1)].append(w)
    out = []
    for top in sorted(band):
        ws = sorted(band[top], key=lambda w: w["x0"])
        if not char_split:
            out.append((top, [(w["text"], w["x0"]) for w in ws]))
            continue
        # 글자 단위로 쪼개진 PDF — 가로로 붙어 있으면 한 낱말이다
        toks, cur, cx, cx0 = [], ws[0]["text"], ws[0]["x1"], ws[0]["x0"]
        for w in ws[1:]:
            if w["x0"] - cx < 1.2:
                cur += w["text"]
                cx = w["x1"]
            else:
                toks.append((cur, cx0))
                cur, cx, cx0 = w["text"], w["x1"], w["x0"]
        toks.append((cur, cx0))
        out.append((top, toks))
    return out


def read_supply(page, prof):
    """공급대상 표 → [(약식표기, 총공급세대수)] (표에 적힌 순서 그대로)."""
    spec = prof["supply"]
    got = []
    for _, toks in rows_of(page, spec, prof["charSplit"]):
        texts = [t for t, _ in toks]
        # 모델번호(01, 02 …)로 시작하는 줄만 공급대상 행이다
        if not texts or not re.fullmatch(r"\d{2}", texts[0]):
            continue
        try:
            label = texts[spec["typeIdx"]]
            units = int(texts[spec["unitsIdx"]].replace(",", ""))
        except (IndexError, ValueError):
            continue
        got.append((label, units))
    if not got:
        raise SystemExit("공급대상 표를 못 읽었습니다 — 프로필의 supply 좌표를 확인하세요")
    return got


def read_price_rows(page, prof):
    """공급금액 표 → [(세대수, 공급금액 계)] (표에 적힌 순서 그대로)."""
    spec = prof["price"]
    ux, tx, mx = spec["unitsX"], spec["totalX"], spec.get("mergedX")
    rows = []
    for _, toks in rows_of(page, spec, prof["charSplit"]):
        units = total = None
        for text, x in toks:
            if ux[0] <= x <= ux[1] and re.fullmatch(r"\d{1,3}", text):
                units = int(text)
            elif tx[0] <= x <= tx[1] and MONEY.fullmatch(text):
                total = int(text.replace(",", ""))
            elif mx and mx[0] <= x <= mx[1] and len(text) > spec["mergedTail"]:
                tail = text[-spec["mergedTail"] :]
                if MONEY.fullmatch(tail):
                    total = int(tail.replace(",", ""))
        if units is not None and total is not None:
            rows.append((units, total))
    if not rows:
        raise SystemExit("공급금액 표를 못 읽었습니다 — 프로필의 price 좌표를 확인하세요")
    return rows


def fold(supply, price_rows):
    """공급금액 행을 공급대상 세대수만큼 순서대로 먹어 타입 경계를 찾는다.

    합이 정확히 맞지 않으면 던진다 — 파싱이 밀렸다는 뜻이고,
    밀린 채 나온 숫자는 카드에 실리면 안 된다.
    """
    i, out = 0, {}
    for label, want in supply:
        got, top = 0, 0
        while i < len(price_rows) and got < want:
            u, w = price_rows[i]
            got += u
            top = max(top, w)
            i += 1
        if got != want:
            raise SystemExit(
                f"세대수가 안 맞습니다 — {label}: 공급금액 표에서 {got}세대를 먹었는데 "
                f"공급대상 표는 {want}세대입니다. 파싱이 한 칸 밀렸을 수 있습니다"
            )
        out[label] = {"units": want, "maxWon": top}
    if i != len(price_rows):
        raise SystemExit(f"공급금액 표에 안 쓰인 행이 {len(price_rows) - i}개 남았습니다 — 좌표를 확인하세요")
    return out


def main():
    argv = sys.argv[1:]
    if not argv:
        sys.exit(f"사용법: python3 scripts/extract-danji-notice.py <공고번호>\n  아는 공고: {', '.join(NOTICES)}")
    no = argv[0]
    prof = NOTICES.get(no)
    if not prof:
        sys.exit(f"모르는 공고번호입니다: {no} (아는 것: {', '.join(NOTICES)})")
    pdf_path = NOTICE_DIR / prof["file"]
    if not pdf_path.exists():
        sys.exit(f"공고문 PDF 가 없습니다: {pdf_path}")

    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        if "--probe" in argv:
            k = argv.index("--probe")
            t0, t1 = float(argv[k + 1]), float(argv[k + 2])
            for top, toks in rows_of(page, {"x": (0, 800), "top": (t0, t1)}, prof["charSplit"]):
                print(round(top), " ¦ ".join(f"{t}@{round(x)}" for t, x in toks)[:200])
            return
        supply = read_supply(page, prof)
        by_type = fold(supply, read_price_rows(page, prof))

    by_area = {}
    for label, v in by_type.items():
        m2 = int(re.match(r"\d+", label).group())
        a = by_area.setdefault(m2, {"m2": m2, "units": 0, "won": 0, "types": []})
        a["units"] += v["units"]
        a["won"] = max(a["won"], v["maxWon"])
        a["types"].append(label[len(str(m2)) :] or "-")

    total = sum(v["units"] for v in by_type.values())
    print(f"\n🏢 {prof['name']} (공고 {no}) — 공급 {total:,}세대 · 주택형 {len(by_type)}개\n")
    print("  타입별 (최고 분양가)")
    for label, v in by_type.items():
        print(f"    {label:>6}  {v['units']:>5,}세대   {v['maxWon']:>15,}원  ({v['maxWon'] / 1e8:.2f}억)")
    print("\n  데이터셋에 붙일 조각 — areas / price.byArea\n")
    print(json.dumps(
        {
            "total": total,
            "areas": [{"m2": a["m2"], "units": a["units"], "types": a["types"]} for a in by_area.values()],
            "price": {"byArea": [{"m2": a["m2"], "won": a["won"]} for a in by_area.values()]},
        },
        ensure_ascii=False,
        indent=2,
    ))
    print(
        "\n  ✅ 공급금액 표의 모든 행을 공급대상 표의 세대수로 정확히 나눠 먹었습니다"
        f" (합 {total:,}세대) — 파싱이 밀리지 않았습니다.\n"
    )


if __name__ == "__main__":
    main()
