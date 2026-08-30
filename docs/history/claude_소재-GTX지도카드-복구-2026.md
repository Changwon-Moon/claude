# GTX 지도 카드(실좌표 노선지도) — 복구 노트 (2026-08-02)

> 오너 지시: GTX는 지하철 U자 카드와 **다른 별도 템플릿**, 첨부(APT_LAP)처럼 **실제 지도 기반**으로 노선+단지. → 레포의 `sinbundang-geomap`(실좌표 matplotlib 지도, 타일없음·결정적) 방식을 GTX용으로 확장. **완성·렌더 OK지만 git push 막혀(403) 저장 못함** → 여기로 복구.
> 방식: 구글맵 실사 배경(비결정적·저작권)이 아니라 **실좌표 종이톤 지도**(오보 0·결정적). matplotlib 3.10 + `/tmp/fonts/*` 필요(이 환경에 있음).
> 데이터셋은 형제 문서 `소재-GTX노선-카드-2026.md` 의 `gtxa-daejang-2026.json` 사용.

## 파일 3개 (그대로 생성 후 build)
### scripts/gtxa-geomap.py
```python
# -*- coding: utf-8 -*-
"""GTX-A 실좌표 지도 — 타일 없이 지리적 배경 위에 노선/역/대표단지(운정중앙~동탄).
BARE(env WIRIT_BARE=1): 카드 프레임용 순수 지도 → templates/_shared/maps/gtxa-route.png"""
import json, math, os
BARE = os.environ.get("WIRIT_BARE") == "1"
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
from matplotlib.patches import Circle
import matplotlib.patches as mpatches
import numpy as np

for p in ["/tmp/fonts/Pretendard.ttf","/tmp/fonts/WantedSans.ttf","/tmp/fonts/TAEBAEK.otf"]:
    fm.fontManager.addfont(p)
PRE = fm.FontProperties(fname="/tmp/fonts/Pretendard.ttf")
NUM = fm.FontProperties(fname="/tmp/fonts/WantedSans.ttf")
PINK="#DA2C7C"; INK="#141821"; LAND="#eceae3"; RIVER="#bcd6e8"; GRAY="#8a8f98"
PAPER = "#fafaf8" if BARE else "#f4f2ec"

stations = [
 ("운정중앙",37.7192,126.7570,[]),
 ("킨텍스",37.6712,126.7465,[]),
 ("대곡",37.6353,126.8110,[("3","#EF7C1C"),("경의","#77C5A5")]),
 ("연신내",37.6190,126.9210,[("3","#EF7C1C"),("6","#CD7C2F")]),
 ("서울역",37.5546,126.9706,[("1","#0D3692"),("4","#00A5DE"),("공항","#0072BC"),("KTX","#003D7A")]),
 ("삼성",37.5088,127.0631,[("2","#00A84D"),("C","#EF7C00")]),
 ("수서",37.4872,127.1015,[("3","#EF7C1C"),("분당","#d9a400"),("SRT","#4B2E83")]),
 ("성남",37.3930,127.1000,[]),
 ("구성",37.2990,127.1060,[("분당","#d9a400")]),
 ("동탄",37.2010,127.0980,[("SRT","#4B2E83")]),
]
ds = json.load(open("data/datasets/gtxa-daejang-2026.json"))
price = {p["station"]: (p["danji"], p["price"]) for p in ds["picks"]}

def merc(lat, lon):
    return lon, math.degrees(math.log(math.tan(math.pi/4 + math.radians(lat)/2)))

xs=np.array([merc(s[1],s[2])[0] for s in stations])
ys=np.array([merc(s[1],s[2])[1] for s in stations])

fig = plt.figure(figsize=(9.7,11.6), dpi=150)
ax = fig.add_axes([0,0,1,1])
minx,maxx = 126.70,127.19
miny,maxy = merc(37.16,0)[1], merc(37.76,0)[1]
ax.set_xlim(minx,maxx); ax.set_ylim(miny,maxy)
ax.add_patch(mpatches.Rectangle((minx,miny),maxx-minx,maxy-miny,color=PAPER,zorder=0))
ax.add_patch(mpatches.Rectangle((minx,miny),maxx-minx,maxy-miny,facecolor=LAND,edgecolor="none",zorder=0,alpha=0.5))
for gx in np.arange(126.75,127.19,0.06):
    ax.plot([gx,gx],[miny,maxy],color="#ffffff",lw=1.1,zorder=1,alpha=0.6)
for glat in np.arange(37.20,37.76,0.06):
    gy=merc(glat,0)[1]; ax.plot([minx,maxx],[gy,gy],color="#ffffff",lw=1.1,zorder=1,alpha=0.6)

han_lon=np.array([126.70,126.83,126.92,126.97,127.03,127.10,127.19])
hy=[merc(la,0)[1] for la in [37.578,37.575,37.548,37.520,37.523,37.530,37.520]]
ax.plot(han_lon,hy,color=RIVER,lw=20,solid_capstyle="round",zorder=1)
ax.text(*merc(37.556,126.86),"한강",fontproperties=PRE,fontsize=14,color="#5c7d93",ha="center",va="center",zorder=2)

for nm,la,lo in [("파주",37.735,126.80),("고양",37.66,126.90),("서울",37.545,127.02),
                 ("성남",37.42,127.02),("용인",37.30,127.02),("화성",37.20,126.92)]:
    ax.text(*merc(la,lo),nm,fontproperties=PRE,fontsize=17,color=GRAY,ha="center",va="center",zorder=2,alpha=0.5)

ax.plot(xs,ys,color=PINK,lw=8,solid_capstyle="round",solid_joinstyle="round",zorder=4)

def draw_label(sx,sy, la,lo, name, has_price, side):
    lx,ly = merc(la,lo)
    ax.plot([sx,lx],[sy,ly],color=PINK,lw=1.2,alpha=0.55,zorder=5)
    ha = {"l":"right","r":"left","c":"center"}[side]
    yname = ly+0.006 if has_price else ly
    ax.text(lx,yname, name, fontproperties=PRE, fontsize=16, color=INK, ha=ha, va="center",
            zorder=8, weight="bold", bbox=dict(boxstyle="round,pad=0.2",fc="white",ec="none",alpha=0.88))
    if has_price:
        dn,pr = price[name]
        ax.text(lx, ly-0.009, f"{dn} · {pr}억", fontproperties=PRE, fontsize=12, color=PINK,
                ha=ha, va="center", zorder=8, weight="bold",
                bbox=dict(boxstyle="round,pad=0.18",fc="white",ec="none",alpha=0.88))

anchor = {
 "운정중앙":(37.726,126.86,"r"), "킨텍스":(37.678,126.86,"r"), "대곡":(37.640,126.905,"r"),
 "연신내":(37.612,127.005,"r"), "서울역":(37.560,127.055,"r"), "삼성":(37.512,126.980,"l"),
 "수서":(37.480,127.150,"r"), "성남":(37.393,127.010,"l"), "구성":(37.299,127.012,"l"), "동탄":(37.201,127.010,"l"),
}
for i,(nm,la,lo,tr) in enumerate(stations):
    a=anchor[nm]; draw_label(xs[i],ys[i], a[0], a[1], nm, nm in price, a[2])

for i,(nm,la,lo,tr) in enumerate(stations):
    x,y=xs[i],ys[i]
    ax.add_patch(Circle((x,y),0.0045,facecolor="#fff",edgecolor=PINK,lw=3.2,zorder=7))
    off=0
    for code,col in tr:
        cx=x+0.009+off
        ax.add_patch(Circle((cx,y),0.0038,facecolor=col,edgecolor="#fff",lw=1.4,zorder=9))
        ax.text(cx,y,code,fontproperties=PRE,fontsize=(9 if len(code)<=1 else 6.2),color="#fff",
                ha="center",va="center",zorder=10,weight="bold")
        off+=0.0092

ax.set_xticks([]); ax.set_yticks([])
for sp in ax.spines.values(): sp.set_visible(False)
out="templates/_shared/maps/gtxa-route.png"
os.makedirs("templates/_shared/maps",exist_ok=True)
fig.savefig(out, dpi=150, facecolor=PAPER)
print("saved →", out)
```

### scripts/build-gtxa-geomap.mjs
```js
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const date = process.argv[2] || "2026-08-02";
const ds = JSON.parse(readFileSync(join(ROOT, "data/datasets/gtxa-daejang-2026.json"), "utf8"));
const mapPath = join(ROOT, "templates/_shared/maps/gtxa-route.png");
const r = spawnSync("python3", [join(ROOT, "scripts/gtxa-geomap.py")], { cwd: ROOT, env: { ...process.env, WIRIT_BARE: "1" }, stdio: "inherit" });
if (r.status !== 0 && !existsSync(mapPath)) { console.log("::warning::지도 생성 실패 + 파일 없음"); process.exit(1); }
const card = {
  template: "gtxa-geomap@1", date,
  subtitle: "운정중앙→동탄 · 역세권 34평(84㎡) 최고가 · 국토부 실거래",
  title: `<span class="ln">GTX-A</span> 역세권 대장아파트 지도`,
  map: "gtxa-route.png",
  note: "역 위치=실좌표 근사 · 시세=전용 84㎡ 매매 실거래 최고가 · 대곡·성남은 역세권 84㎡ 대단지 없어 역명만 · 파주·용인·화성은 01~06 기준 · 스트리트맵 아님 · 투자 권유 아님",
  source: { name: "국토부 실거래가", asOf: ds.meta.asOf },
};
const outDir = join(ROOT, `data/content/${date}`); mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "gtxa-geomap.json"), JSON.stringify(card, null, 2) + "\n");
console.log(`✅ GTX-A 지도 카드 → data/content/${date}/gtxa-geomap.json`);
```

### templates/gtxa-geomap/template.html
`templates/sinbundang-geomap/template.html` 복사 후: 주석 `sinbundang-geomap@1`→`gtxa-geomap@1`, `.sg .wirit-title .ln { color: #DA2C7C; }`, img alt "GTX-A 노선지도". 나머지 동일.

## 실행
`node scripts/build-gtxa-geomap.mjs 2026-08-02` → renderer render → 카드 PNG. `data/review/builders.json`·`sets.json` 등록.

## 다듬을 점(다음)
- 삼성 라벨 지시선이 노선을 살짝 가로지름(anchor 조정 가능).
- 07 수집 후 파주·용인·화성 refresh 로 01~07 통일.
- GTX-C·B 도 같은 py 복제(좌표·bounds·한강·color 만 교체). C=#EF7C00, B=#00954F.
