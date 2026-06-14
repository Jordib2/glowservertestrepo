import os, json, math, random, uuid
from typing import List
from PIL import Image, ImageDraw
from app.persistence.repositories.collage_repository import CollageRepository

ANIM_PARAMS = {
    "bob":   {"amp": (2, 4),       "freq": (0.12, 0.25)},
    "tilt":  {"amp": (1, 3),       "freq": (0.10, 0.22)},
    "pulse": {"amp": (0.01, 0.03), "freq": (0.10, 0.20)},
}

def _random_anim(rng):
    t = rng.choice(list(ANIM_PARAMS))
    p = ANIM_PARAMS[t]
    return {"type":t,"amp":rng.uniform(*p["amp"]),
            "freq":rng.uniform(*p["freq"]),"phase":rng.uniform(0,2*math.pi)}

def _cbp(p0,p1,p2,p3,n=100):
    pts=[]
    for i in range(n+1):
        t=i/n; mt=1-t
        x=mt**3*p0[0]+3*mt**2*t*p1[0]+3*mt*t**2*p2[0]+t**3*p3[0]
        y=mt**3*p0[1]+3*mt**2*t*p1[1]+3*mt*t**2*p2[1]+t**3*p3[1]
        pts.append((x,y))
    return pts

def _build_scene(draw, W, H, seed=42):
    rng = random.Random(seed)
    all_pts = []

    def branch(p0,p1,p2,p3,thick,sprite_every=170):
        pts=_cbp(p0,p1,p2,p3)
        for i in range(len(pts)-1):
            draw.line([pts[i],pts[i+1]],fill=(255,255,255),width=thick)
        # Sprite anchors directly ON branch
        dist=0
        for i in range(1,len(pts)):
            dist+=math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1])
            if dist>=sprite_every:
                dist=0
                x,y=pts[i]
                if 0<=x<=W and 0<=y<=H:
                    j=min(i+3,len(pts)-1); k=max(i-3,0)
                    ang=math.degrees(math.atan2(pts[j][1]-pts[k][1],pts[j][0]-pts[k][0]))
                    all_pts.append((x,y,ang))
        # Short twigs off branch
        tl=int(H*0.055)
        for i in range(0,len(pts),12):
            x,y=pts[i]
            if not(0<=x<=W and 0<=y<=H): continue
            j=min(i+3,len(pts)-1); k=max(i-3,0)
            ang=math.degrees(math.atan2(pts[j][1]-pts[k][1],pts[j][0]-pts[k][0]))
            side=rng.choice([-1,1])
            ta=ang+side*90+rng.uniform(-25,25)
            ar=math.radians(ta)
            ex=x+tl*math.cos(ar); ey=y+tl*math.sin(ar)
            draw.line([(x,y),(ex,ey)],fill=(255,255,255),width=max(1,thick//3))
            for fd in [-18,14]:
                far=math.radians(ta+fd)
                fl=tl*0.3
                draw.line([(ex,ey),(ex+fl*math.cos(far),ey+fl*math.sin(far))],
                          fill=(255,255,255),width=1)

    # MAIN sweeping branches — edge to edge, fill entire canvas height
    branch((0,H*.12),(W*.3,H*.04),(W*.7,H*.18),(W,H*.08),  11, 160)
    branch((0,H*.30),(W*.25,H*.16),(W*.6,H*.32),(W,H*.20), 12, 155)
    branch((0,H*.50),(W*.2,H*.36),(W*.75,H*.52),(W,H*.40), 14, 150)
    branch((0,H*.65),(W*.3,H*.52),(W*.65,H*.68),(W,H*.58), 13, 155)
    branch((0,H*.80),(W*.25,H*.70),(W*.7,H*.85),(W,H*.75), 11, 160)
    branch((0,H*.92),(W*.3,H*.84),(W*.65,H*.94),(W,H*.86),  9, 170)
    # SECONDARY — fill top/bottom corners and gaps
    branch((0,H*.05),(W*.15,H*.22),(W*.35,H*.08),(W*.5,H*.20),     8, 150)
    branch((W*.45,H*.05),(W*.6,H*.20),(W*.8,H*.06),(W,H*.18),      8, 150)
    branch((0,H*.22),(W*.12,H*.36),(W*.28,H*.20),(W*.42,H*.34),    7, 155)
    branch((W*.4,H*.22),(W*.55,H*.36),(W*.7,H*.22),(W*.85,H*.35),  7, 155)
    branch((W*.8,H*.20),(W*.88,H*.35),(W*.94,H*.20),(W,H*.34),     6, 155)
    branch((0,H*.88),(W*.12,H*.98),(W*.25,H*.86),(W*.4,H*.96),     8, 155)
    branch((W*.38,H*.88),(W*.52,H*.98),(W*.65,H*.86),(W*.78,H*.96),7, 155)
    branch((W*.75,H*.88),(W*.85,H*.98),(W*.92,H*.86),(W,H*.96),    7, 160)
    # EXTRA cross-branches for density in remaining gaps
    branch((0,H*.42),(W*.18,H*.55),(W*.38,H*.42),(W*.55,H*.54),    9, 150)
    branch((W*.5,H*.40),(W*.65,H*.55),(W*.8,H*.42),(W,H*.52),      9, 150)
    branch((0,H*.58),(W*.2,H*.70),(W*.4,H*.58),(W*.6,H*.68),       8, 155)
    branch((W*.55,H*.58),(W*.7,H*.70),(W*.85,H*.58),(W,H*.68),     8, 155)

    return all_pts

class CollageService:
    def __init__(self):
        self.collage_repo = CollageRepository()

    def _resolve_local_path(self, url, base_media_dir):
        if '/media/' in url:
            return os.path.join(base_media_dir, url.split('/media/',1)[1])
        if url.startswith('media/') or url.startswith(base_media_dir+'/'):
            return url
        return os.path.join(base_media_dir, url.lstrip('/'))

    def generate_collage(self, collage_id, image_urls: List[str]) -> str:
        base_media_dir = os.getenv("MEDIA_DIR","media")
        source_paths=[]
        for url in image_urls:
            p=self._resolve_local_path(url,base_media_dir)
            if os.path.exists(p): source_paths.append(p)
            else: print(f"Missing: {p}")
        if not source_paths: raise ValueError("No valid images found")

        base_dir=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        bg_path=os.path.join(base_dir,"assets","collage_background.png")
        bg=Image.open(bg_path).convert("RGBA")
        W,H=bg.size
        print(f"Canvas: {W}x{H}")

        canvas=bg.copy()
        draw=ImageDraw.Draw(canvas)
        pts=_build_scene(draw,W,H,seed=42)
        print(f"Anchor points: {len(pts)}")

        MIN_SIZE=int(H*0.11)
        MAX_SIZE=int(H*0.16)
        MIN_DIST=int(MAX_SIZE*1.05)

        rng=random.Random(42)
        random.shuffle(pts)
        random.shuffle(source_paths)
        sprites,placed,cycle=[],[],0

        for ax,ay,angle in pts:
            if any(math.hypot(ax-px,ay-py)<MIN_DIST for px,py in placed): continue
            size=rng.randint(MIN_SIZE,MAX_SIZE)
            placed.append((ax,ay))
            sprites.append({
                "image_path": source_paths[cycle%len(source_paths)],
                "center_x":   ax,
                "center_y":   ay - size*0.38,
                "size":       size,
                "angle":      angle*0.06 + rng.uniform(-5,5),
                "scale":      1.0,
                "anim":       _random_anim(rng),
            })
            cycle+=1

        print(f"Placed {len(sprites)} sprites")
        collages_dir=os.path.join(base_media_dir,"collages")
        os.makedirs(collages_dir,exist_ok=True)
        sid=uuid.uuid4().hex
        scene={"canvas":[W,H],"background_path":bg_path,"sprites":sprites}
        scene_path=os.path.join(collages_dir,f"{sid}.json")
        preview_path=os.path.join(collages_dir,f"{sid}.png")
        with open(scene_path,"w") as f: json.dump(scene,f)
        self._render_preview(scene,canvas,preview_path)
        url=f"{base_media_dir}/collages/{sid}.png"
        self.collage_repo.update_collage_path(collage_id,url)
        return url

    def _render_preview(self,scene,canvas,out):
        c=canvas.copy()
        for s in scene["sprites"]:
            img=Image.open(s["image_path"]).convert("RGBA")
            img.thumbnail((s["size"],s["size"]),Image.LANCZOS)
            if s["angle"]: img=img.rotate(s["angle"],expand=True,resample=Image.BICUBIC)
            c.paste(img,(int(s["center_x"]-img.width//2),int(s["center_y"]-img.height//2)),img)
        c.save(out,"PNG")