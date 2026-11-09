(function(){
const {RM,$,$$}=K;
K.intro($('#intro'),2100);K.reveal();K.magnet('.mag');K.smooth();
const NUM='447849587808';
K.waLinks({num:NUM,greet:'Hi Justin, I found your page online and would like a quote.'});
const F=K.form($('#qf'),{num:NUM,biz:'Justin Plumb',areaLabel:'Postcode or area',greet:'Hi Justin, I would like a quote.'});window.__form=F;
$$('.pick').forEach(b=>b.addEventListener('click',()=>{const s=$('#qf').elements.service;s.value=b.dataset.job;s.dispatchEvent(new Event('change',{bubbles:true}));$('#quote').scrollIntoView({behavior:RM?'auto':'smooth'});setTimeout(()=>$('#qf').elements.name.focus({preventScroll:true}),500)}));
const secs=['top','work','words','about','quote'].map(id=>[id,document.getElementById(id)]);const links=$$('.dock a');
const hl=()=>{let cur='top';secs.forEach(([id,el])=>{if(el.getBoundingClientRect().top<innerHeight*.5)cur=id});links.forEach(a=>a.classList.toggle('on',a.dataset.s===cur))};
const W=window.WALL={scroll:0,pct:0};const wall=$('#wall');
addEventListener('scroll',()=>{hl();const r=wall.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){W.scroll=K.scrollP(wall);W.onScroll&&W.onScroll()}},{passive:true});hl();
W.report=p=>{W.pct=p;$('#mbar').style.width=p+'%';$('#mval').textContent=Math.round(p)+'%'};
$('#smoothAll').onclick=()=>W.all&&W.all();$('#resetWall').onclick=()=>W.reset&&W.reset();
})();
