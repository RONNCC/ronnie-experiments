// Inside the Coagulation Lab — 11-bench app
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  // rail spy
  const rails=$$('.rail-link');
  const sections=rails.map(r=>document.getElementById(r.dataset.rail)).filter(Boolean);
  if('IntersectionObserver' in window){
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          rails.forEach(r=>r.classList.remove('is-active'));
          const lk=rails.find(r=>r.dataset.rail===e.target.id);
          if(lk) lk.classList.add('is-active');
        }
      });
    },{rootMargin:'-45% 0px -50% 0px',threshold:0});
    sections.forEach(s=>obs.observe(s));
  }
  rails.forEach(a=>a.addEventListener('click',e=>{e.preventDefault(); document.getElementById(a.dataset.rail).scrollIntoView({behavior:'smooth',block:'start'});}));

  // helper canvas util
  function setupCanvas(id, drawFn){
    const c=document.getElementById(id);
    if(!c) return;
    const ctx=c.getContext('2d');
    if(!ctx) return;
    // handle hidpi
    const dpr=window.devicePixelRatio||1;
    // we keep css size = attr size (already set), scale if needed
    drawFn(ctx,c);
    // redraw on resize? simple
    return {c,ctx};
  }

  // ========== VIT D ==========
  (function(){
    const steps=[...document.querySelectorAll('#vitd-stage .vitd-step')];
    let idx=0;
    const chrom=document.getElementById('vitd-chrom');
    const mix=document.getElementById('vitd-mix');
    const mixVal=document.getElementById('vitd-mix-val');
    const rD2=document.getElementById('vitd-r-d2');
    const rD3=document.getElementById('vitd-r-d3');
    const rTot=document.getElementById('vitd-r-total');
    const compare=document.getElementById('vitd-compare');
    const inset=document.getElementById('vitd-inset');
    function show(i){
      idx=(i+steps.length)%steps.length;
      steps.forEach((s,j)=>s.classList.toggle('is-active', j===idx));
      drawChrom();
    }
    function drawChrom(){
      if(!chrom) return;
      const ctx=chrom.getContext('2d');
      const W=chrom.width,H=chrom.height;
      ctx.clearRect(0,0,W,H);
      const padL=40,padR=10,padT=10,padB=22;
      ctx.fillStyle='#0B1E24'; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='#1E3A44'; for(let i=0;i<4;i++){const y=padT+(H-padT-padB)*(i/4); ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();}
      // retention time peaks: D2 earlier (~2.1), epi ~2.4, D3 ~3.0
      function peak(x0,width,height,color){
        const xToPx=t=>padL + (t/4.5)*(W-padL-padR);
        const yToPx=v=>padT + (1 - v/1.1)*(H-padT-padB);
        ctx.fillStyle=color;
        ctx.beginPath();
        for(let t=0;t<=4.5;t+=0.02){
          const v=height*Math.exp(-Math.pow((t-x0)/width,2)*8);
          const x=xToPx(t), y=yToPx(v);
          if(t===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.lineTo(padL + (4.5/4.5)*(W-padL-padR), padT + (H-padT-padB));
        ctx.lineTo(padL, padT + (H-padT-padB));
        ctx.closePath(); ctx.fill();
        return {x:xToPx(x0), h:height};
      }
      const d2mixVals = mix? +mix.value : 30;
      const total=40; // illustrative total from slider? we compute D2 = total * d2mix/100 etc. But slider defines D2 proportion? We'll keep total 40 fixed, D2 = total * pct/100
      const d2h = (d2mixVals/100)*0.9*0.8 + 0.1;
      const d3h = ((100-d2mixVals)/100)*0.9*1.0 + 0.1;
      peak(1.4,0.18,d2h,'rgba(244,211,94,.9)');
      peak(1.85,0.12,0.28,'rgba(155,142,196,.7)'); // epi
      peak(2.45,0.22,d3h,'rgba(255,138,91,.95)');
      // IS coelute small
      peak(1.42,0.18,0.55,'rgba(46,196,182,.45)');
      peak(2.47,0.22,0.60,'rgba(46,196,182,.45)');
      ctx.fillStyle='#8BA3AD'; ctx.font='8px sans-serif';
      ctx.fillText('D2', padL+ (1.4/4.5)*(W-padL-padR)-8, padT+12);
      ctx.fillText('epi', padL+ (1.85/4.5)*(W-padL-padR)-8, padT+12);
      ctx.fillText('D3', padL+ (2.45/4.5)*(W-padL-padR)-8, padT+12);
      ctx.fillStyle='#8BA3AD'; ctx.font='7px sans-serif';
      ctx.fillText('0 min', padL-6, H-padB+12);
      ctx.fillText('4.5 min', W-padR-26, H-padB+12);
      ctx.save(); ctx.translate(8,H/2); ctx.rotate(-Math.PI/2); ctx.fillText('ion counts',0,0); ctx.restore();
    }
    function updateMix(){
      if(!mix) return;
      const pct=+mix.value;
      // Keep total around 40 for illustration, allow slider to shift D2 vs D3
      const total=40;
      const d2=Math.round(total * pct/100);
      const d3=total - d2;
      if(rD2) rD2.textContent=d2+' ng/mL';
      if(rD3) rD3.textContent=d3+' ng/mL';
      if(rTot) rTot.innerHTML=`<strong>${total} ng/mL</strong> <span class="u">(= ${(total*2.496).toFixed(0)} nmol/L)</span>`;
      if(mixVal) mixVal.textContent=`D2 ${d2} ng/mL · D3 ${d3} ng/mL → Total ${total} ng/mL`;
      const why=document.getElementById('vitd-mix-why');
      if(why) why.textContent = pct>60? 'D2-heavy: suggests D2 supplement dominating — immunoassay would miss split; LC-MS/MS shows it.' : pct<20? 'D3-heavy: sun/animal + D3 supplement — LC-MS/MS confirms D3 fraction; epi peak small in adult.' : 'Mixed D2/D3 — LC-MS/MS separates; epi resolved to avoid overread. IS corrects.';
      drawChrom();
    }
    $('#vitd-play')?.addEventListener('click',()=>{
      let i=idx;
      const timer=setInterval(()=>{
        i++;
        if(i>=steps.length){clearInterval(timer); return;}
        show(i);
      },900);
    });
    $('#vitd-step')?.addEventListener('click',()=>show(idx+1));
    $('#vitd-reset')?.addEventListener('click',()=>show(0));
    mix?.addEventListener('input',updateMix);
    compare?.addEventListener('change',()=>{ if(inset) inset.hidden=!compare.checked;});
    updateMix(); show(0); drawChrom();
  })();

  // ========== LA REFLEX ==========
  (function(){
    const tree=document.getElementById('la-tree');
    const conditional=document.getElementById('la-conditional');
    const verdict=document.getElementById('la-verdict');
    const sub=document.getElementById('la-verdict-sub');
    const btns=$$('[data-la]');
    const scenarios={
      normal:{cond:0,text:'LA not detected — both screens ≤1.20, no reflex performed',sub:'PT normal, no anticoagulant pattern — stop, add interpretive comment per ARUP/Mayo.'},
      la:{cond:1,text:'LA detected — phospholipid-dependent (example synthetic)',sub:'PTT-LA 1.42 & dRVVT screen 1.61 → anti-Xa negative, TT 16 s → mix 1.38 persists, confirm 1.12 shortens, HPE Δ 10.4 s — meets reflex criteria.'},
      doac:{cond:1,text:'Uninterpretable due to anticoagulant (apixaban illustration)',sub:'dRVVT screen markedly prolonged by anti-Xa DOAC — mimics LA; TT normal helps exclude heparin; suggest repeat off drug or DOAC adsorbent per guidance.'},
      warfarin:{cond:1,text:'Prolonged but not LA — warfarin effect (PT 22 s, INR 1.9)',sub:'Screens prolonged due to vitamin K-dependent factor reduction; mixing corrects (deficiency) but confirm not phospholipid-dependent — not LA; test off VKA if LA truly suspected.'}
    };
    function apply(k){
      btns.forEach(b=>b.classList.toggle('is-active', b.dataset.la===k));
      const s=scenarios[k];
      if(conditional) conditional.style.opacity = s.cond? '1':'0.28';
      if(verdict) verdict.textContent=s.text;
      if(sub) sub.textContent=s.sub;
      // animate screen highlight
      const row=document.getElementById('la-screen-row');
      if(row) row.style.outline = k==='normal' ? '2px solid #2EC4B6' : '2px solid #FF8A5B';
    }
    btns.forEach(b=>b.addEventListener('click',()=>apply(b.dataset.la)));
    $('#la-reset')?.addEventListener('click',()=>apply('normal'));
    apply('normal');
  })();

  // ========== APS ==========
  (function(){
    const cvs=document.getElementById('aps-curve');
    if(!cvs) return;
    const ctx=cvs.getContext('2d');
    function drawAPS(mode){
      const W=cvs.width,H=cvs.height;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#0B1E24'; ctx.fillRect(0,0,W,H);
      const padL=36,padR=10,padT=8,padB=18;
      ctx.strokeStyle='#1E3A44'; for(let i=0;i<3;i++){const y=padT+(H-padT-padB)*(i/3); ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();}
      // aPTT-like sigmoid
      const tClot=34; // s illustrative
      const maxT=60;
      ctx.strokeStyle='#F4D35E'; ctx.lineWidth=2; ctx.beginPath();
      for(let t=0;t<=maxT;t+=0.5){
        const a=0.12 + 0.78/(1+Math.exp(-0.55*(t-tClot)));
        const x=padL + (t/maxT)*(W-padL-padR);
        const y=padT + (1 - a)*(H-padT-padB);
        if(t===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      ctx.fillStyle='#8BA3AD'; ctx.font='7px sans-serif';
      ctx.fillText('aPTT trace (representative): turbidity ↑ at fibrin', padL+4, padT+8);
      ctx.fillText('0 s', padL-4, H-padB+10);
      ctx.fillText('60 s', W-padR-18, H-padB+10);
    }
    drawAPS();
    $('#aps-play')?.addEventListener('click',()=>{ let p=0; const id=setInterval(()=>{p+=2; drawAPS(p); if(p>60) clearInterval(id);},40);});
    $('#aps-reset')?.addEventListener('click',()=>drawAPS());
  })();

  // ========== PS ANTIGEN ==========
  (function(){
    const cvs=document.getElementById('psag-canvas');
    const slider=document.getElementById('psag-slider');
    const out=document.getElementById('psag-slider-val');
    const toggle=document.getElementById('psag-free-toggle');
    function drawPS(){
      if(!cvs) return;
      const ctx=cvs.getContext('2d');
      const W=cvs.width,H=cvs.height;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#0B1E24'; ctx.fillRect(0,0,W,H);
      const padL=36,padR=10,padT=10,padB=18;
      ctx.strokeStyle='#1E3A44'; for(let i=0;i<3;i++){const y=padT+(H-padT-padB)*(i/3); ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();}
      const free = slider? +slider.value : 68;
      const isFree = toggle? toggle.checked : true;
      // calibration: free 30-140% vs ΔA
      ctx.strokeStyle='#5BC0DE'; ctx.lineWidth=2; ctx.beginPath();
      for(let v=20; v<=150; v+=2){
        const delta = 0.05 + 0.65*(v/150); // linear turbidimetry
        const x=36 + (v/150)*(W-46);
        const y=padT + (1 - delta)*(H-padT-padB);
        if(v===20) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      // patient point
      const px=36 + (free/150)*(W-46);
      const py=padT + (1 - (0.05+0.65*free/150))*(H-padT-padB);
      ctx.fillStyle=isFree?'#5BC0DE':'#F4D35E'; ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle='#E8F1F2'; ctx.font='8px sans-serif'; ctx.fillText(free+'% free',px+8,py-6);
      ctx.fillStyle='#8BA3AD'; ctx.font='7px sans-serif';
      ctx.fillText('20%',36,H-padB+10); ctx.fillText('150%',W-padR-18,H-padB+10);
    }
    function updatePS(){
      const v= slider? +slider.value : 68;
      const total = Math.max(60, Math.min(140, Math.round(88 + (Math.random()*0-0)))); // keep illustrative total 88-92
      // we keep total 92% steady, free varies via slider
      const totalVal=88; // as per example
      if(out){
        if(v<60) out.textContent=`Free PS ${v}% · Total ${totalVal}% → pattern: low free + low total (type I-like) or low free normal total with lower v? Acquired vs inherited needs repeat.`;
        else if(v<70) out.textContent=`Free PS ${v}% · Total ${totalVal}% → borderline low free, normal total — within assay CV, clinical correlation`;
        else out.textContent=`Free PS ${v}% · Total ${totalVal}% → pattern: low free, normal total (Type III-like acquired in this slider)`;
      }
      drawPS();
    }
    slider?.addEventListener('input',updatePS);
    toggle?.addEventListener('change',()=>{ drawPS(); });
    $('#psag-play')?.addEventListener('click',()=>{ let v=35; const id=setInterval(()=>{v+=3; if(slider) slider.value=v; updatePS(); if(v>=140) clearInterval(id);},60);});
    $('#psag-reset')?.addEventListener('click',()=>{ if(slider) slider.value=68; updatePS();});
    updatePS(); drawPS();
  })();

  // ========== FVL ==========
  (function(){
    const segBtns=$$('#s5 .seg-btn');
    let genotype='wt';
    const amp=document.getElementById('fvl-amp-canvas');
    const melt=document.getElementById('fvl-melt-canvas');
    const alleles=document.getElementById('fvl-alleles');
    const call=document.getElementById('fvl-call');
    function drawAmp(prog){
      if(!amp) return;
      const ctx=amp.getContext('2d');
      const W=amp.width,H=amp.height;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#0B1E24'; ctx.fillRect(0,0,W,H);
      const padL=28,padR=10,padT=10,padB=18;
      ctx.strokeStyle='#1E3A44'; for(let i=0;i<3;i++){const y=padT+(H-padT-padB)*(i/3); ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();}
      const maxC=35;
      const xToPx=c=>padL + (c/35)*(W-padL-padR);
      const yToPx=v=>padT + (1 - v/1.1)*(H-padT-padB);
      function ampCurve(mid,w){
        ctx.beginPath();
        for(let c=0;c<=prog;c+=0.3){
          const v=0.05 + 0.9/(1+Math.exp(-0.7*(c-mid)));
          const x=xToPx(c), y=yToPx(v);
          if(c===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      // wild G probe blue, mutant A probe orange
      if(genotype==='wt' || genotype==='het'){
        ctx.strokeStyle='#5BC0DE'; ctx.lineWidth=2; ampCurve(23,0.7);
      }
      if(genotype==='hom' || genotype==='het'){
        ctx.strokeStyle='#FF8A5B'; ctx.lineWidth=2; ampCurve(genotype==='het'?23:22.5,0.7);
      }
      // if wt, mutant tiny background
      if(genotype==='wt'){
        ctx.strokeStyle='rgba(255,138,91,.25)'; ctx.lineWidth=1; ampCurve(33,0.7);
      }
      if(genotype==='hom'){
        ctx.strokeStyle='rgba(91,192,222,.25)'; ctx.lineWidth=1; ampCurve(33,0.7);
      }
      ctx.fillStyle='#8BA3AD'; ctx.font='7px sans-serif';
      ctx.fillText('0',padL-4,H-padB+10); ctx.fillText('35',W-padR-8,H-padB+10);
    }
    function drawMelt(){
      if(!melt) return;
      const ctx=melt.getContext('2d');
      const W=melt.width,H=melt.height;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#0B1E24'; ctx.fillRect(0,0,W,H);
      const padL=28,padR=10,padT=12,padB=18;
      ctx.strokeStyle='#1E3A44'; for(let i=0;i<3;i++){const y=padT+(H-padT-padB)*(i/3); ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();}
      const xToPx=t=>padL + (t-55)/25*(W-padL-padR);
      const yToPx=v=>padT + (1 - v/1.1)*(H-padT-padB);
      function peak(center,height,color){
        ctx.strokeStyle=color; ctx.lineWidth=2; ctx.beginPath();
        for(let t=55;t<=80;t+=0.2){
          const v=height*Math.exp(-Math.pow((t-center)/1.6,2)*6);
          const x=xToPx(t), y=yToPx(v);
          if(t===55) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      if(genotype==='wt') peak(64,1,'#5BC0DE');
      else if(genotype==='hom') peak(57,1,'#FF8A5B');
      else { peak(64,0.75,'#5BC0DE'); peak(57,0.75,'#FF8A5B'); }
      ctx.fillStyle='#8BA3AD'; ctx.font='7px sans-serif'; ctx.fillText('55°C',padL-4,H-padB+10); ctx.fillText('80°C',W-padR-14,H-padB+10);
    }
    function apply(g){
      genotype=g;
      segBtns.forEach(b=>b.classList.toggle('is-active', b.dataset.gene===g));
      if(alleles) alleles.textContent = g==='wt'?'G/G': g==='het'?'G/A':'A/A';
      if(call) call.innerHTML = g==='wt'? '<strong>G/G wild-type</strong> — no variant detected' : g==='het'? '<strong>G/A heterozygous</strong> — one copy (synthetic)' : '<strong>A/A homozygous</strong> — two copies (synthetic)';
      drawAmp(35); drawMelt();
    }
    segBtns.forEach(b=>b.addEventListener('click',()=>apply(b.dataset.gene)));
    let prog=0, timer=null;
    $('#fvl-play')?.addEventListener('click',()=>{
      prog=0;
      if(timer) clearInterval(timer);
      timer=setInterval(()=>{
        prog+=0.8; drawAmp(prog);
        if(prog>=35){ clearInterval(timer); drawMelt(); }
      },30);
    });
    $('#fvl-reset')?.addEventListener('click',()=>{apply('wt');});
    apply('wt'); drawAmp(35); drawMelt();
  })();

  // ========== PS FUNCTIONAL ==========
  (function(){
    const cvs=document.getElementById('psfunc-canvas');
    const slider=document.getElementById('psfunc-slider');
    const out=document.getElementById('psfunc-slider-val');
    const valDisplay=document.getElementById('psfunc-val');
    function drawPSF(){
      if(!cvs) return;
      const ctx=cvs.getContext('2d');
      const W=cvs.width,H=cvs.height;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#0B1E24'; ctx.fillRect(0,0,W,H);
      const padL=36,padR=10,padT=10,padB=18;
      ctx.strokeStyle='#1E3A44'; for(let i=0;i<3;i++){const y=padT+(H-padT-padB)*(i/3); ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();}
      const act = slider? +slider.value : 82;
      // clot time inverse: high PS functional = longer time (more APC help)
      // map act 15-150 to time 28-58s
      const t = 26 + (act/150)*32;
      // show calibration points normal ~38s
      ctx.strokeStyle='#5BC0DE'; ctx.lineWidth=2; ctx.beginPath();
      for(let a=15;a<=150;a+=2){
        const tt=26 + (a/150)*32;
        const x=padL + (a/150)*(W-padL-padR);
        const y=padT + (1 - (tt-26)/32)*(H-padT-padB);
        if(a===15) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      const px=padL + (act/150)*(W-padL-padR);
      const py=padT + (1 - (t-26)/32)*(H-padT-padB);
      ctx.fillStyle='#5BC0DE'; ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.fill();
      if(valDisplay) valDisplay.textContent=act+'%';
      ctx.fillStyle='#8BA3AD'; ctx.font='7px sans-serif'; ctx.fillText('15%',padL-4,H-padB+10); ctx.fillText('150%',W-padR-12,H-padB+10);
    }
    function update(){
      const v= slider? +slider.value : 82;
      if(out) out.textContent = v+'% — within illustrative normal (60–140%)' + (v<60? ' low':'');
      drawPSF();
    }
    slider?.addEventListener('input',update);
    $('#psfunc-play')?.addEventListener('click',()=>{
      let v=15; const id=setInterval(()=>{v+=4; if(slider) slider.value=v; update(); if(v>=150) clearInterval(id);},40);
    });
    $('#psfunc-reset')?.addEventListener('click',()=>{ if(slider) slider.value=82; update();});
    update();
  })();

  // ========== ANTITHROMBIN ==========
  (function(){
    const cvs=document.getElementById('at-canvas');
    const slider=document.getElementById('at-slider');
    const out=document.getElementById('at-slider-val');
    const rate=document.getElementById('at-rate');
    function drawAT(){
      if(!cvs) return;
      const ctx=cvs.getContext('2d');
      const W=cvs.width,H=cvs.height;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#0B1E24'; ctx.fillRect(0,0,W,H);
      const padL=36,padR=10,padT=10,padB=18;
      ctx.strokeStyle='#1E3A44'; for(let i=0;i<3;i++){const y=padT+(H-padT-padB)*(i/3); ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();}
      const act = slider? +slider.value : 92;
      // inverse: AT high -> residual FXa low -> rate low
      // rate = 0.8 * (1 - act/180)
      const rateVal = 0.05 + 0.75*(1 - act/150);
      // kinetic trace A405 vs time
      ctx.strokeStyle='#2EC4B6'; ctx.lineWidth=2; ctx.beginPath();
      for(let t=0;t<=60;t+=1){
        const a = rateVal * (t/60) + 0.02 + Math.random()*0.003;
        const x=padL + (t/60)*(W-padL-padR);
        const y=padT + (1 - a/0.9)*(H-padT-padB);
        if(t===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      if(rate) rate.textContent=rateVal.toFixed(3)+' ΔA/min (inverse to AT)';
      ctx.fillStyle='#8BA3AD'; ctx.font='7px sans-serif'; ctx.fillText('0 s',padL-4,H-padB+10); ctx.fillText('60 s',W-padR-12,H-padB+10);
    }
    function update(){
      const v= slider? +slider.value:92;
      if(out) out.textContent = v+'% activity — illustrative normal (80–120%) → low residual FXa → low color rate' + (v<80?' low':'');
      drawAT();
    }
    slider?.addEventListener('input',update);
    $('#at-play')?.addEventListener('click',()=>{ let v=20; const id=setInterval(()=>{v+=5; if(slider) slider.value=v; update(); if(v>=150) clearInterval(id);},40);});
    $('#at-reset')?.addEventListener('click',()=>{ if(slider) slider.value=92; update();});
    update();
  })();

  // ========== PC ANTIGEN ==========
  (function(){
    const cvs=document.getElementById('pcag-canvas');
    const slider=document.getElementById('pcag-slider');
    const out=document.getElementById('pcag-slider-val');
    const od=document.getElementById('pcag-od');
    function drawPCAG(){
      if(!cvs) return;
      const ctx=cvs.getContext('2d');
      const W=cvs.width,H=cvs.height;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#0B1E24'; ctx.fillRect(0,0,W,H);
      const padL=36,padR=10,padT=10,padB=18;
      ctx.strokeStyle='#1E3A44'; for(let i=0;i<3;i++){const y=padT+(H-padT-padB)*(i/3); ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();}
      const ag = slider? +slider.value : 88;
      ctx.strokeStyle='#9B8EC4'; ctx.lineWidth=2; ctx.beginPath();
      for(let v=20;v<=150;v+=2){
        const odval=0.08 + 0.75*(v/150);
        const x=padL + (v/150)*(W-padL-padR);
        const y=padT + (1 - odval/0.9)*(H-padT-padB);
        if(v===20) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      const px=padL + (ag/150)*(W-padL-padR);
      const o=0.08 + 0.75*ag/150;
      const py=padT + (1 - o/0.9)*(H-padT-padB);
      ctx.fillStyle='#9B8EC4'; ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.fill();
      if(od) od.textContent=o.toFixed(3)+' OD450 (∝ antigen)';
    }
    function update(){
      const v= slider? +slider.value:88;
      if(out) out.textContent=v+'% antigen — illustrative normal (70–140%)';
      drawPCAG();
    }
    slider?.addEventListener('input',update);
    $('#pcag-play')?.addEventListener('click',()=>{ let v=20; const id=setInterval(()=>{v+=5; if(slider) slider.value=v; update(); if(v>=150) clearInterval(id);},40);});
    $('#pcag-reset')?.addEventListener('click',()=>{ if(slider) slider.value=88; update();});
    update();
  })();

  // ========== FII ACTIVITY ==========
  (function(){
    const cvs=document.getElementById('f2-canvas');
    const slider=document.getElementById('f2-slider');
    const out=document.getElementById('f2-slider-val');
    const timeEl=document.getElementById('f2-time');
    function drawF2(){
      if(!cvs) return;
      const ctx=cvs.getContext('2d');
      const W=cvs.width,H=cvs.height;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#0B1E24'; ctx.fillRect(0,0,W,H);
      const padL=36,padR=10,padT=10,padB=18;
      ctx.strokeStyle='#1E3A44'; for(let i=0;i<3;i++){const y=padT+(H-padT-padB)*(i/3); ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();}
      const act = slider? +slider.value : 98;
      // PT time inverse: high FII -> short time, approx time = 45 - 18*log10(act/10)
      function timeFor(act){ return 45 - 14*Math.log10(act/10); }
      ctx.strokeStyle='#F4D35E'; ctx.lineWidth=2; ctx.beginPath();
      for(let a=15;a<=160;a+=2){
        const t=timeFor(a);
        const x=padL + (Math.log10(a)-Math.log10(15))/(Math.log10(160)-Math.log10(15))*(W-padL-padR);
        const y=padT + (t-12)/20*(H-padT-padB);
        if(a===15) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      const t=timeFor(act);
      const px=padL + (Math.log10(act)-Math.log10(15))/(Math.log10(160)-Math.log10(15))*(W-padL-padR);
      const py=padT + (t-12)/20*(H-padT-padB);
      ctx.fillStyle='#F4D35E'; ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.fill();
      if(timeEl) timeEl.textContent=t.toFixed(1)+' s';
      ctx.fillStyle='#8BA3AD'; ctx.font='7px sans-serif'; ctx.fillText('15%',padL-4,H-padB+10); ctx.fillText('160%',W-padR-14,H-padB+10);
    }
    function update(){
      const v= slider? +slider.value:98;
      if(out) out.textContent=v+'% — illustrative normal (70–130% example)';
      drawF2();
    }
    slider?.addEventListener('input',update);
    $('#f2-play')?.addEventListener('click',()=>{ let v=15; const id=setInterval(()=>{v+=6; if(slider) slider.value=v; update(); if(v>=160) clearInterval(id);},40);});
    $('#f2-reset')?.addEventListener('click',()=>{ if(slider) slider.value=98; update();});
    update();
  })();

  // ========== PC FUNCTIONAL ==========
  (function(){
    const cvs=document.getElementById('pcf-canvas');
    const slider=document.getElementById('pcf-slider');
    const out=document.getElementById('pcf-slider-val');
    const rate=document.getElementById('pcf-rate');
    function drawPCF(){
      if(!cvs) return;
      const ctx=cvs.getContext('2d');
      const W=cvs.width,H=cvs.height;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#0B1E24'; ctx.fillRect(0,0,W,H);
      const padL=36,padR=10,padT=10,padB=18;
      ctx.strokeStyle='#1E3A44'; for(let i=0;i<3;i++){const y=padT+(H-padT-padB)*(i/3); ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();}
      const act = slider? +slider.value : 84;
      const rateVal = 0.08 + 0.60*act/150;
      ctx.strokeStyle='#2EC4B6'; ctx.lineWidth=2; ctx.beginPath();
      for(let t=0;t<=60;t+=1){
        const a = rateVal * (t/60) + 0.02;
        const x=padL + (t/60)*(W-padL-padR);
        const y=padT + (1 - a/0.85)*(H-padT-padB);
        if(t===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      if(rate) rate.textContent=rateVal.toFixed(3)+' ΔA/min (∝ functional PC)';
    }
    function update(){
      const v= slider? +slider.value:84;
      if(out) out.textContent=v+'% functional — illustrative normal (70–140%) → moderate pNA rate';
      drawPCF();
    }
    slider?.addEventListener('input',update);
    $('#pcf-play')?.addEventListener('click',()=>{ let v=20; const id=setInterval(()=>{v+=6; if(slider) slider.value=v; update(); if(v>=150) clearInterval(id);},40);});
    $('#pcf-reset')?.addEventListener('click',()=>{ if(slider) slider.value=84; update();});
    update();
  })();

  // report toggle
  $('#report-toggle')?.addEventListener('click',()=>{
    const flags=document.getElementById('report-flags');
    if(!flags) return;
    flags.innerHTML = flags.innerHTML.includes('interference') ?
      '<span class="flag ok">QC passed</span><span class="flag ok">No drug interference</span><span class="flag warn">Context: female, not pregnant</span>' :
      '<span class="flag warn">Interference overlay: apixaban present → dRVVT/PS functional clot-based flagged, antigen/DNA not</span><span class="flag ok">AT chromogenic unaffected if FXa-based</span>';
  });
})();
