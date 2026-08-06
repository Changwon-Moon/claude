import sys, os
from rembg import remove, new_session
from PIL import Image
sess = new_session('u2net')
photos = "templates/_shared/photos"
for slug in sys.argv[1:]:
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
