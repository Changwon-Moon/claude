import sys, os, glob
from rembg import remove, new_session
from PIL import Image
sess = new_session('u2net')
photos = "templates/_shared/photos"

# --missing: -cut.png 이 없는 원본 사진 전부 누끼(파이프라인에서 신규 사진 자동 처리)
args = sys.argv[1:]
if args and args[0] == "--missing":
    slugs = []
    for p in sorted(glob.glob(os.path.join(photos, "*.jpg")) + glob.glob(os.path.join(photos, "*.png"))):
        b = os.path.basename(p)
        if b.endswith("-cut.png"):
            continue
        s = os.path.splitext(b)[0]
        if not os.path.exists(os.path.join(photos, s + "-cut.png")):
            slugs.append(s)
    args = slugs
    print("누끼 대상(신규):", slugs)

for slug in args:
    src = None
    for ext in (".jpg",".png",".jpeg"):
        p = os.path.join(photos, slug+ext)
        if os.path.exists(p): src = p; break
    if not src:
        print("없음:", slug); continue
    img = Image.open(src).convert("RGBA")
    out = remove(img, session=sess)   # 투명 배경
    dst = os.path.join(photos, slug+"-cut.png")
    out.save(dst)
    print("누끼:", dst, out.size)
