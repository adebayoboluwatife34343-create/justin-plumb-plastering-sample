import * as THREE from './three.module.js';
import {makeEnv} from './env.js';
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv=document.getElementById('c3d'),box=cv.parentElement;
let r;try{r=new THREE.WebGLRenderer({canvas:cv,antialias:true})}catch(e){document.getElementById('nowebgl').hidden=false;throw e}
r.setPixelRatio(Math.min(devicePixelRatio,1.75));r.toneMapping=THREE.ACESFilmicToneMapping;r.outputColorSpace=THREE.SRGBColorSpace;
const sc=new THREE.Scene();sc.background=new THREE.Color(0x2a1620);sc.environment=makeEnv(THREE,r,{bg:0x2a1620,lights:[[0xffe9e0,3],[0xffb3c8,2],[0xd7b8ff,1.5]]});
const cam=new THREE.PerspectiveCamera(32,1,.1,60);cam.position.set(0,0,13);
const rake=new THREE.DirectionalLight(0xffe2d2,3.4);rake.position.set(-9,3.2,3.2);sc.add(rake);
const rim=new THREE.DirectionalLight(0xff7aa8,1.1);rim.position.set(8,-3,5);sc.add(rim);sc.add(new THREE.AmbientLight(0x6a3a55,.55));
const SX=240,SY=135,WW=18,HH=10.125;
const geo=new THREE.PlaneGeometry(WW,HH,SX,SY);const pos=geo.attributes.position,N=pos.count;
const col=new Float32Array(N*3);geo.setAttribute('color',new THREE.BufferAttribute(col,3));
const noise=new Float32Array(N),sm=new Float32Array(N);
function h(x,y){const s=Math.sin(x*127.1+y*311.7)*43758.5453;return s-Math.floor(s)}
function vn(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return h(xi,yi)*(1-u)*(1-v)+h(xi+1,yi)*u*(1-v)+h(xi,yi+1)*(1-u)*v+h(xi+1,yi+1)*u*v}
for(let i=0;i<N;i++){const x=pos.getX(i),y=pos.getY(i);noise[i]=(vn(x*1.2,y*1.2)*.4+vn(x*4,y*4)*.28+vn(x*12,y*12)*.2+vn(x*38,y*38)*.12)-.5}
const gc=document.createElement('canvas');gc.width=gc.height=256;const gx=gc.getContext('2d');gx.fillStyle='#bdbdbd';gx.fillRect(0,0,256,256);for(let i=0;i<9000;i++){const v=150+Math.random()*105|0;gx.fillStyle=`rgb(${v},${v},${v})`;gx.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*2.5,1+Math.random()*2.5)}for(let i=0;i<300;i++){gx.fillStyle='rgba(60,50,50,.25)';gx.fillRect(Math.random()*256,Math.random()*256,2+Math.random()*5,1)}
const grain=new THREE.CanvasTexture(gc);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(18,10);grain.colorSpace=THREE.SRGBColorSpace;grain.anisotropy=4;
const mat=new THREE.MeshStandardMaterial({vertexColors:true,map:grain,roughness:.78,metalness:0});
const mesh=new THREE.Mesh(geo,mat);sc.add(mesh);
const raw=new THREE.Color(0xa8857c),fin=new THREE.Color(0xf0cfc3),c=new THREE.Color();
const AMP=.5;let dirty=true,sum=0;
function rebuild(){
  let tot=0;
  for(let i=0;i<N;i++){const s=sm[i];tot+=s;pos.setZ(i,noise[i]*AMP*(1-s)*(1-s)+ (1-s)*.0);
    const v=.78+noise[i]*.9;c.copy(raw).multiplyScalar(v).lerp(fin,Math.min(1,s*1.05));col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
  pos.needsUpdate=true;geo.attributes.color.needsUpdate=true;geo.computeVertexNormals();
  const p=tot/N*100;if(window.WALL&&window.WALL.report)window.WALL.report(p);dirty=false}
function brush(wx,wy,rad){let ch=false;const ix=(wx+WW/2)/WW*SX,iy=(HH/2-wy)/HH*SY;const rx=rad/WW*SX,ry=rad/HH*SY;
  for(let j=Math.max(0,Math.floor(iy-ry));j<=Math.min(SY,Math.ceil(iy+ry));j++)for(let i=Math.max(0,Math.floor(ix-rx));i<=Math.min(SX,Math.ceil(ix+rx));i++){
    const d=Math.hypot((i-ix)/rx,(j-iy)/ry);if(d<1){const k=j*(SX+1)+i;const v=Math.min(1,(1-d)*3.2);if(v>sm[k]){sm[k]=v;ch=true}}}
  if(ch)dirty=true}
/* trowel */
const tr=new THREE.Group();const blade=new THREE.Mesh(new THREE.BoxGeometry(1.5,.05,.55),new THREE.MeshStandardMaterial({color:0xffffff,metalness:.25,roughness:.35,emissive:0xb8bec9,emissiveIntensity:.75}));tr.add(blade);
const hd=new THREE.Mesh(new THREE.CylinderGeometry(.07,.08,.8,12),new THREE.MeshStandardMaterial({color:0x3a1d2c,roughness:.5}));hd.position.set(0,.45,0);hd.rotation.x=.2;tr.add(hd);const nk=new THREE.Mesh(new THREE.BoxGeometry(.05,.4,.05),new THREE.MeshStandardMaterial({color:0xdfe3e8,metalness:1,roughness:.2}));nk.position.set(0,.2,0);tr.add(nk);
tr.rotation.set(-1.15,0,.25);tr.position.set(0,0,1.2);sc.add(tr);
let tx=0,ty=0,tgx=0,tgy=0,trVis=false;
function toWorld(e){const b=cv.getBoundingClientRect();const nx=((e.clientX-b.left)/b.width-.5),ny=((e.clientY-b.top)/b.height-.5);const hh=Math.tan(cam.fov*Math.PI/360)*cam.position.z*2,ww=hh*cam.aspect;return [nx*ww,-ny*hh]}
let down=false,last=null;
function move(e){const [x,y]=toWorld(e);tgx=x;tgy=y;trVis=true;if(RM&&!down)return;if(last){const n=Math.ceil(Math.hypot(x-last[0],y-last[1])/.18);for(let i=1;i<=n;i++)brush(last[0]+(x-last[0])*i/n,last[1]+(y-last[1])*i/n,.6)}else brush(x,y,.6);last=[x,y]}
cv.addEventListener('pointermove',e=>{if(e.pointerType==='touch'&&!down)return;move(e)});
cv.addEventListener('pointerleave',()=>{last=null;trVis=false});
cv.addEventListener('pointerdown',e=>{down=true;last=null;move(e)});addEventListener('pointerup',()=>{down=false;last=null});
cv.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();all()}});cv.tabIndex=0;
/* scroll skim: bands from top to bottom */
let scrollDone=0;
function onScroll(){const p=Math.min(1,(window.WALL?window.WALL.scroll:0)*1.15);if(RM)return;const rows=Math.floor(p*SY);if(rows>scrollDone){for(let j=scrollDone;j<=rows;j++)for(let i=0;i<=SX;i++){const k=j*(SX+1)+i;if(sm[k]<1)sm[k]=Math.min(1,sm[k]+.9);}scrollDone=rows;dirty=true}}
function all(){sm.fill(1);scrollDone=SY;dirty=true;if(RM)frame()}
function reset(){sm.fill(0);scrollDone=0;dirty=true;if(RM)frame()}
window.WALL=Object.assign(window.WALL||{},{all,reset,onScroll});
/* intro auto trowel pass */
let auto={t:0,on:!RM};
function frame(){
  if(dirty)rebuild();
  tx+=(tgx-tx)*.25;ty+=(tgy-ty)*.25;tr.visible=trVis||auto.on;tr.position.set(tx,ty,.9);tr.rotation.z=.25+Math.sin(tx*.6)*.12;
  r.render(sc,cam)}
let autoLast=null;let vis=true,t0=performance.now()+2300;
function loop(now){
  if(vis){
    if(auto.on&&now>t0){let _x,_y;const k=(now-t0)/4200;if(k>=1)auto.on=false;else{const row=Math.floor(k*4),f=(k*4)%1,dir=row%2?1-f:f;const x=(dir-.5)*WW*.8,y=(HH/2-1.2)-row*(HH-2.4)/3;tgx=x;tgy=y;trVis=true;if(autoLast){const n=Math.ceil(Math.hypot(x-autoLast[0],y-autoLast[1])/.18);for(let q=1;q<=n;q++)brush(autoLast[0]+(x-autoLast[0])*q/n,autoLast[1]+(y-autoLast[1])*q/n,.7)}else brush(x,y,.7);autoLast=[x,y]}}
    else if(auto.on&&now<=t0){tgx=0;tgy=0;trVis=false}
    frame()}
  requestAnimationFrame(loop)}
function size(){const w=box.clientWidth,hgt=box.clientHeight;r.setSize(w,hgt,false);cam.aspect=w/hgt;cam.fov=cam.aspect<.8?50:32;cam.updateProjectionMatrix();if(RM)frame()}
new ResizeObserver(size).observe(box);new IntersectionObserver(es=>{vis=es[0].isIntersecting}).observe(box);
size();rebuild();frame();if(!RM)requestAnimationFrame(loop);window.__wall=true;
if(window.WALL&&window.WALL.scroll)onScroll();
