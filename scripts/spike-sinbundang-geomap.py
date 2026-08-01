# -*- coding: utf-8 -*-
"""신분당선 실좌표 지도 그림 — 타일 없이 지리적 배경 위에 노선/역/대표단지.
기본: /tmp/geomap/sinbundang-geomap.png (제목·워터마크 포함)
BARE 모드(env WIRIT_BARE=1): 제목·워터마크·주석 제거, 카드 페이퍼 톤 → templates/_shared/maps/sinbundang-route.png
   (위릿 카드 프레임 안에 넣기 위한 순수 지도)"""
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
TTL = fm.FontProperties(fname="/tmp/fonts/TAEBAEK.otf")
RED="#D4003B"; INK="#141821"; LAND="#eceae3"; RIVER="#bcd6e8"; GRAY="#8a8f98"
PAPER = "#fafaf8" if BARE else "#f4f2ec"  # 카드 페이퍼 톤 매칭

stations = [
 ("신사",37.5163,127.0203,[("3","#EF7C1C")]),
 ("논현",37.5110,127.0216,[("7","#747F00")]),
 ("신논현",37.5045,127.0251,[("9","#8c8467")]),
 ("강남",37.4979,127.0276,[("2","#00A84D")]),
 ("양재",37.4846,127.0343,[("3","#EF7C1C")]),
 ("양재시민의숲",37.4703,127.0388,[]),
 ("청계산입구",37.4472,127.0543,[]),
 ("판교",37.3947,127.1112,[("경강","#003DA5")]),
 ("정자",37.3669,127.1082,[("분당","#d9a400")]),
 ("미금",37.3499,127.1084,[("분당","#d9a400")]),
 ("동천",37.3386,127.1045,[]),
 ("수지구청",37.3221,127.0954,[]),
 ("성복",37.3124,127.0553,[]),
 ("상현",37.2996,127.0470,[]),
 ("광교중앙",37.2872,127.0464,[]),
 ("광교",37.2835,127.0607,[]),
]
ds = json.load(open("data/datasets/sinbundang-daejang-2026.json"))
price = {p["station"]: (p["danji"], p["price"]) for p in ds["picks"]}

def merc(lat, lon):
    return lon, math.degrees(math.log(math.tan(math.pi/4 + math.radians(lat)/2)))

xs=np.array([merc(s[1],s[2])[0] for s in stations])
ys=np.array([merc(s[1],s[2])[1] for s in stations])

fig = plt.figure(figsize=(9.7,11.6) if BARE else (10.8,13.5), dpi=(150 if BARE else 100))
ax = fig.add_axes([0,0,1,1])
minx,maxx = 126.985,127.150
miny,maxy = merc(37.258,0)[1], merc(37.552,0)[1]
ax.set_xlim(minx,maxx); ax.set_ylim(miny,maxy)
ax.add_patch(mpatches.Rectangle((minx,miny),maxx-minx,maxy-miny,color=PAPER,zorder=0))
ax.add_patch(mpatches.Rectangle((minx,miny),maxx-minx,maxy-miny,facecolor=LAND,edgecolor="none",zorder=0,alpha=0.5))
for gx in np.arange(127.00,127.15,0.03):
    ax.plot([gx,gx],[miny,maxy],color="#ffffff",lw=1.1,zorder=1,alpha=0.65)
for glat in np.arange(37.28,37.56,0.03):
    gy=merc(glat,0)[1]; ax.plot([minx,maxx],[gy,gy],color="#ffffff",lw=1.1,zorder=1,alpha=0.65)

# 한강
han_lon=np.array([126.985,127.00,127.02,127.045,127.07,127.10,127.150])
hy=[merc(la,0)[1] for la in [37.531,37.528,37.5305,37.527,37.531,37.535,37.531]]
ax.plot(han_lon,hy,color=RIVER,lw=24,solid_capstyle="round",zorder=1)
ax.text(*merc(37.535,127.09),"한강",fontproperties=PRE,fontsize=14,color="#5c7d93",ha="center",va="center",zorder=2)

for nm,la,lo in [("용인 수지",37.330,127.118),("광교신도시",37.293,127.020),("서초구",37.455,127.013)]:
    ax.text(*merc(la,lo),nm,fontproperties=PRE,fontsize=16,color=GRAY,ha="center",va="center",zorder=2,alpha=0.5)

# 노선
ax.plot(xs,ys,color=RED,lw=8,solid_capstyle="round",solid_joinstyle="round",zorder=4)

def draw_label(sx,sy, la,lo, name, has_price, side, box=True):
    lx,ly = merc(la,lo)
    # 지시선
    ax.plot([sx,lx],[sy,ly],color=RED,lw=1.1,alpha=0.55,zorder=5)
    ha = {"l":"right","r":"left","c":"center"}[side]
    txt = name
    yname = ly+0.0018 if has_price else ly
    ax.text(lx,yname, name, fontproperties=PRE, fontsize=15, color=INK, ha=ha, va="center",
            zorder=8, weight="bold",
            bbox=dict(boxstyle="round,pad=0.18",fc="white",ec="none",alpha=0.85) if box else None)
    if has_price:
        dn,pr = price[name]
        ax.text(lx, ly-0.0028, f"{dn} · {pr}억", fontproperties=PRE, fontsize=11.5, color=RED,
                ha=ha, va="center", zorder=8, weight="bold",
                bbox=dict(boxstyle="round,pad=0.16",fc="white",ec="none",alpha=0.85))

# 라벨 앵커 (밀집 상단 5역은 우측 빈공간 사다리로 지시선)
# name -> (label_lat, label_lon, side)
anchor = {
 "신사":(37.521,127.062,"r"),
 "논현":(37.507,127.062,"r"),
 "신논현":(37.493,127.062,"r"),
 "강남":(37.478,127.062,"r"),
 "양재":(37.462,127.062,"r"),
 "양재시민의숲":(37.449,127.062,"r"),
 "청계산입구":(37.447,127.036,"l"),
 "판교":(37.398,127.126,"r"),
 "정자":(37.367,127.126,"r"),
 "미금":(37.350,127.126,"r"),
 "동천":(37.336,127.126,"r"),
 "수지구청":(37.320,127.126,"r"),
 "성복":(37.316,127.072,"r"),
 "상현":(37.301,127.036,"l"),
 "광교중앙":(37.279,127.028,"l"),
 "광교":(37.2835,127.070,"r"),
}
for i,(nm,la,lo,tr) in enumerate(stations):
    a=anchor[nm]
    draw_label(xs[i],ys[i], a[0], a[1], nm, nm in price, a[2])

# 역 점 + 환승 뱃지(점 바로 옆)
for i,(nm,la,lo,tr) in enumerate(stations):
    x,y=xs[i],ys[i]
    ax.add_patch(Circle((x,y),0.0015,facecolor="#fff",edgecolor=RED,lw=3.0,zorder=7))
    off=0
    for code,col in tr:
        cx=x+0.0030+off
        ax.add_patch(Circle((cx,y),0.00115,facecolor=col,edgecolor="#fff",lw=1.4,zorder=9))
        ax.text(cx,y,code,fontproperties=PRE,fontsize=(9 if len(code)<=1 else 6.5),color="#fff",
                ha="center",va="center",zorder=10,weight="bold")
        off+=0.0026

# 제목/워터마크/주석 (BARE 모드에선 카드 프레임이 대신하므로 생략)
if not BARE:
    ax.text(minx+0.006, maxy-0.004, "신분당선", fontproperties=TTL, fontsize=42, color=RED, ha="left", va="top", zorder=11)
    ax.text(minx+0.008, maxy-0.026, "신사 → 광교 · 역세권 대장아파트 지도", fontproperties=PRE, fontsize=16, color=INK, ha="left", va="top", zorder=11, weight="bold")
    ax.text(maxx-0.004, miny+0.006, "@wirit_note", fontproperties=NUM, fontsize=18, color=INK, ha="right", va="bottom", zorder=11, weight="bold")
    ax.text(minx+0.006, miny+0.004, "역 위치=실좌표 근사 · 시세=대표평형 매매 근사치(2026.7) · 스트리트맵 아님", fontproperties=PRE, fontsize=10.5, color=GRAY, ha="left", va="bottom", zorder=11)

ax.set_xticks([]); ax.set_yticks([])
for sp in ax.spines.values(): sp.set_visible(False)
if BARE:
    out="templates/_shared/maps/sinbundang-route.png"
    fig.savefig(out, dpi=150, facecolor=PAPER)
    print("saved (bare) →", out)
else:
    os.makedirs("/tmp/geomap",exist_ok=True)
    fig.savefig("/tmp/geomap/sinbundang-geomap.png", dpi=100, facecolor=PAPER)
    print("saved")
