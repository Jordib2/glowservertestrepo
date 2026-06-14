import os, json, math, uuid, subprocess, random
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np, cv2
from app.persistence.repositories.collage_repository import CollageRepository
from app.persistence.repositories.videos_repository import VideosRepository

def _cbp(p0,p1,p2,p3,n=100):
    pts=[]
    for i in range(n+1):
        t=i/n; mt=1-t
        x=mt**3*p0[0]+3*mt**2*t*p1[0]+3*mt*t**2*p2[0]+t**3*p3[0]
        y=mt**3*p0[1]+3*mt**2*t*p1[1]+3*mt*t**2*p2[1]+t**3*p3[1]
        pts.append((x,y))
    return pts

def _draw_scene(draw, cam_x, sw, H, seed=42):
    rng=random.Random(seed)
    W=sw
    tl=int(H*0.055)

    def branch(p0,p1,p2,p3,thick):
        pts=_cbp(p0,p1,p2,p3)
        for i in range(len(pts)-1):
            draw.line([(pts[i][0]-cam_x,pts[i][1]),(pts[i+1][0]-cam_x,pts[i+1][1])],
                      fill=(255,255,255),width=thick)
        for i in range(0,len(pts),12):
            x,y=pts[i][0]-cam_x,pts[i][1]
            if not(-50<=x<=sw+50 and 0<=y<=H): continue
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

    branch((0,H*.12),(W*.3,H*.04),(W*.7,H*.18),(W,H*.08),  11)
    branch((0,H*.30),(W*.25,H*.16),(W*.6,H*.32),(W,H*.20), 12)
    branch((0,H*.50),(W*.2,H*.36),(W*.75,H*.52),(W,H*.40), 14)
    branch((0,H*.65),(W*.3,H*.52),(W*.65,H*.68),(W,H*.58), 13)
    branch((0,H*.80),(W*.25,H*.70),(W*.7,H*.85),(W,H*.75), 11)
    branch((0,H*.92),(W*.3,H*.84),(W*.65,H*.94),(W,H*.86),  9)
    branch((0,H*.05),(W*.15,H*.22),(W*.35,H*.08),(W*.5,H*.20),     8)
    branch((W*.45,H*.05),(W*.6,H*.20),(W*.8,H*.06),(W,H*.18),      8)
    branch((0,H*.22),(W*.12,H*.36),(W*.28,H*.20),(W*.42,H*.34),    7)
    branch((W*.4,H*.22),(W*.55,H*.36),(W*.7,H*.22),(W*.85,H*.35),  7)
    branch((W*.8,H*.20),(W*.88,H*.35),(W*.94,H*.20),(W,H*.34),     6)
    branch((0,H*.88),(W*.12,H*.98),(W*.25,H*.86),(W*.4,H*.96),     8)
    branch((W*.38,H*.88),(W*.52,H*.98),(W*.65,H*.86),(W*.78,H*.96),7)
    branch((W*.75,H*.88),(W*.85,H*.98),(W*.92,H*.86),(W,H*.96),    7)
    branch((0,H*.42),(W*.18,H*.55),(W*.38,H*.42),(W*.55,H*.54),    9)
    branch((W*.5,H*.40),(W*.65,H*.55),(W*.8,H*.42),(W,H*.52),      9)
    branch((0,H*.58),(W*.2,H*.70),(W*.4,H*.58),(W*.6,H*.68),       8)
    branch((W*.55,H*.58),(W*.7,H*.70),(W*.85,H*.58),(W,H*.68),     8)

class VideoService:
    def __init__(self):
        self.video_repo=VideosRepository()
        self.collage_repo=CollageRepository()
        self.base_media_dir=os.getenv("MEDIA_DIR","media")
        self.video_dir=Path(self.base_media_dir)/"videos"

    def _resolve_local_path(self,url):
        if '/media/' in url: return os.path.join(self.base_media_dir,url.split('/media/',1)[1])
        if url.startswith(self.base_media_dir+'/'): return url
        return os.path.join(self.base_media_dir,url.lstrip('/'))

    def _animated(self,sprite,t):
        a=sprite["anim"]
        cx,cy,angle,scale=sprite["_cx"],sprite["_cy"],sprite["angle"],1.0
        f1=a["freq"]; f2=f1*1.618; ph=a["phase"]
        wave=0.75*math.sin(2*math.pi*f1*t+ph)+0.25*math.sin(2*math.pi*f2*t+ph*1.3)
        if   a["type"]=="bob":   cy    +=a["amp"]*self._vs*wave
        elif a["type"]=="tilt":  angle +=a["amp"]*wave
        elif a["type"]=="pulse": scale *=1.0+a["amp"]*wave
        return cx,cy,angle,scale

    def generate_video(self,collage_url,collage_id,progress_callback=None):
        if not collage_url: raise ValueError("empty collage_url")
        pp=self._resolve_local_path(collage_url)
        sp=os.path.splitext(pp)[0]+".json"
        if not os.path.exists(sp): raise ValueError(f"Scene JSON missing: {sp}")
        with open(sp) as f: scene=json.load(f)
        cw,ch=scene["canvas"]; sprites=scene["sprites"]
        VW,VH=1900,1200
        self._vs=VH/ch; sw=int(cw*self._vs)
        if sw<=VW: raise ValueError("Collage too narrow")
        bg=Image.open(scene["background_path"]).convert("RGBA")
        bg_s=bg.resize((sw,VH),Image.LANCZOS)
        for s in sprites:
            img=Image.open(s["image_path"]).convert("RGBA")
            img.thumbnail((s["size"],s["size"]),Image.LANCZOS)
            tgt=max(1,int(s["size"]*self._vs))
            sc=tgt/max(img.width,img.height)
            fs=(max(1,int(img.width*sc)),max(1,int(img.height*sc)))
            s["_image"]=img.resize(fs,Image.LANCZOS)
            s["_cx"]=s["center_x"]*self._vs; s["_cy"]=s["center_y"]*self._vs
        self.video_dir.mkdir(parents=True,exist_ok=True)
        fps,dur=30,10; total=fps*dur; step=(sw-VW)/total
        fname=f"{uuid.uuid4()}_collage_{collage_id}.mp4"
        out=self.video_dir/fname; tmp=self.video_dir/f"temp_{fname}"
        wr=cv2.VideoWriter(str(tmp),cv2.VideoWriter_fourcc(*'mp4v'),fps,(VW,VH))
        if not wr.isOpened(): raise RuntimeError(f"VideoWriter failed: {tmp}")
        try:
            for i in range(total):
                t=i/fps; cam=int(i*step)
                frame=self._render_frame(bg_s,sprites,cam,VW,VH,t,sw)
                wr.write(cv2.cvtColor(np.array(frame.convert("RGB")),cv2.COLOR_RGB2BGR))
                if i%30==0:
                    print(f"Frame {i}/{total}")
                    if progress_callback: progress_callback(i,total)
        finally:
            wr.release()
        try:
            subprocess.run(["ffmpeg","-y","-i",str(tmp),"-vcodec","libx264",
                            "-pix_fmt","yuv420p","-movflags","+faststart",str(out)],check=True)
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"FFmpeg: {e}")
        finally:
            if os.path.exists(tmp): os.remove(tmp)
        rel=f"videos/{fname}"
        saved=self.video_repo.save_video(collage_id,str(rel))
        BASE=os.getenv("BASE_URL","http://127.0.0.1:8000")
        if progress_callback: progress_callback(total,total)
        return {"message":f"Video created for collage {collage_id}","video_id":saved["id"],
                "collage_id":collage_id,"video_url":f"{BASE}/media/{rel}"}

    def _render_frame(self,bg_s,sprites,cam,vw,vh,t,sw):
        frame=bg_s.crop((cam,0,cam+vw,vh)).convert("RGBA")
        _draw_scene(ImageDraw.Draw(frame),cam,sw,vh,seed=42)
        for s in sprites:
            cx,cy,angle,dsc=self._animated(s,t)
            tile=s["_image"]
            if abs(dsc-1.)>1e-3:
                tile=tile.resize((max(1,int(tile.width*dsc)),max(1,int(tile.height*dsc))),Image.LANCZOS)
            if angle: tile=tile.rotate(angle,expand=True,resample=Image.BICUBIC)
            sx,sy=int(cx-cam),int(cy)
            hw,hh=tile.width//2,tile.height//2
            if sx+hw<0 or sx-hw>vw or sy+hh<0 or sy-hh>vh: continue
            frame.paste(tile,(sx-hw,sy-hh),tile)
        return frame