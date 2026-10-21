// Inside the Coagulation Lab — app.js
(function(){
  const $ = s=>document.querySelector(s);
  const $$ = s=>[...document.querySelectorAll(s)];

  // --- Predict cards generic ---
  $$('.predict-card').forEach(card=>{
    const correct = card.dataset.correct;
    const opts = [...card.querySelectorAll('[data-choice]')];
    const reveal = card.querySelector('.predict-reveal');
    opts.forEach(b=>{
      b.addEventListener('click',()=>{
        opts.forEach(o=>o.classList.remove('is-correct','is-wrong'));
        const choice = b.dataset.choice;
        if(choice===correct){ b.classList.add('is-correct'); reveal.querySelector('.verdict').textContent='✓ Correct.'; reveal.querySelector('.verdict').style.color='#2EC4B6';}
        else { b.classList.add('is-wrong'); reveal.querySelector('.verdict').textContent='✗ Not quite — see below.'; reveal.querySelector('.verdict').style.color='#FF8A5B';}
        reveal.hidden=false;
      });
    });
    const jump = card.querySelector('.jump-btn');
    if(jump) jump.addEventListener('click',()=> document.querySelector('#'+jump.dataset.jump)?.scrollIntoView({behavior:'smooth',block:'center'}));
  });

  // rail scrollspy
  const rails = $$('.rail-link');
  const sections = rails.map(r=>document.getElementById(r.dataset.rail)).filter(Boolean);
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        rails.forEach(r=>r.classList.remove('is-active'));
        const link = rails.find(r=>r.dataset.rail===e.target.id);
        if(link) link.classList.add('is-active');
      }
    });
  },{rootMargin:'-45% 0px -50% 0px',threshold:0});
  sections.forEach(s=>obs.observe(s));
  // smooth anchor
  rails.forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();
    document.getElementById(a.dataset.rail).scrollIntoView({behavior:'smooth',block:'start'});
  }));

  // ================= S0 =================
  (function(){
    const fill = $('#s0-fill'), hct=$('#s0-hct'), fillVal=$('#s0-fill-val'), hctVal=$('#s0-hct-val');
    const blood = $('#s0-blood'), citrate=$('#s0-citrate'), ratioLabel=$('#s0-ratio-label'), bloodLabel=$('#s0-blood-label');
    const excessEl=$('#s0-excess'), biasEl=$('#s0-bias'), fillWhy=$('#s0-fill-why'), hctWhy=$('#s0-hct-why');
    const plasma=$('#s0-plasma'), rotor=$('#s0-rotor'), pppBlood=$('#s0-ppp-blood'), pppRbc=$('#s0-ppp-rbc'), buffy=$('#s0-buffy'), pppLabel=$('#s0-ppp-label');
    let spun=false, anim=null;
    function update(){
      const f = +fill.value;
      const h = +hct.value;
      // tube visuals: fill height maps to y position
      // tube from y 60 to 192 = 132px blood height at 100%
      const hPx = 14 + (f/100)*132; // citrate 14 + blood variable
      const bloodH = (f/100)*132;
      blood.setAttribute('height', bloodH);
      blood.setAttribute('y', 192 - bloodH);
      plasma.setAttribute('height', Math.max(6, bloodH*0.18));
      plasma.setAttribute('y', 192 - bloodH);
      // ratio label
      if(f<85){ ratioLabel.textContent=`Ratio ~1:${(9 * (100/f)).toFixed(1)} ✗ excess citrate`; ratioLabel.setAttribute('fill','#E63946'); }
      else { ratioLabel.textContent='Ratio 1:9 ✓'; ratioLabel.setAttribute('fill','#C9D8DD');}
      fillVal.textContent = f===100? '100% — adequate' : f>=90? `${f}% — borderline, may be accepted` : `${f}% — rejected (excess citrate)`;
      const excess = Math.round((100/Math.max(f,1)*9 -9)/9*100); // approx
      // simpler: excess citrate % = (100/f -1)*100
      const excessPct = Math.round((100/f -1)*100);
      excessEl.textContent = excessPct<=0? '0%' : `+${excessPct}%`;
      // bias
      if(f<90 || excessPct>20) { biasEl.textContent='Prolonged PT/aPTT'; biasEl.style.color='#FF8A5B';}
      else if(h>55) { biasEl.textContent='Prolonged (Hct)'; biasEl.style.color='#FF8A5B';}
      else { biasEl.textContent='None'; biasEl.style.color='#2EC4B6';}
      fillWhy.textContent = f<90 ? 'Underfill → extra citrate per mL plasma chelates added Ca²⁺ → longer times. Collect new tube.' : 'Correct fill — citrate mass matches blood volume for standardized free Ca²⁺ after recalcification.';
      // Hct
      if(h>55){ hctVal.textContent=`${h}% — high; adjust citrate`; hctWhy.textContent='High Hct: plasma is less of total volume, so same citrate is more concentrated. Lab reduces citrate via (100−Hct)/(595−Hct) × volume.'; hctVal.style.color='#FF8A5B';}
      else if(h<30){ hctVal.textContent=`${h}% — anemic (less RBC, more plasma)`; hctWhy.textContent='Low Hct: more plasma per tube → citrate slightly dilute but accepted without adjustment in most protocols.'; hctVal.style.color='var(--text)';}
      else { hctVal.textContent=`${h}% — no adjustment`; hctWhy.textContent='Typical Hct. No citrate adjustment needed per CLSI.'; hctVal.style.color='var(--text)';}
      // if spun, update ppp color hint
      if(!spun){ pppLabel.textContent='PPP — pale yellow'; pppBlood.setAttribute('fill','#F4D35E'); }
    }
    fill?.addEventListener('input', update);
    hct?.addEventListener('input', update);
    update();
    // spin animation
    const spinBtn=$('#s0-spin'), spinLabel=$('#s0-spin-label');
    spinBtn?.addEventListener('click',()=>{
      if(spun){
        // reset
        spun=false;
        spinLabel.textContent='Spin';
        rotor.style.transition='none';
        rotor.setAttribute('transform','rotate(0 110 128)');
        pppRbc.style.opacity='0';
        buffy.style.opacity='0';
        pppBlood.setAttribute('y','40'); pppBlood.setAttribute('height','170');
        pppLabel.textContent='PPP — pale yellow';
        return;
      }
      spun=true;
      spinLabel.textContent='Reset';
      // animate rotor
      let angle=0;
      cancelAnimationFrame(anim);
      function tick(){
        angle+=12;
        rotor.setAttribute('transform',`rotate(${angle} 110 128)`);
        if(angle<720) { anim=requestAnimationFrame(tick); }
        else {
          // reveal separation
          pppBlood.setAttribute('y','40'); pppBlood.setAttribute('height','100');
          pppRbc.style.transition='opacity .6s'; buffy.style.transition='opacity .6s';
          pppRbc.style.opacity='1'; buffy.style.opacity='1';
          pppRbc.setAttribute('y','160'); // ensure visible
          pppLabel.textContent='Separated — PPP on top';
        }
      }
      tick();
    });
    $('#s0-reset')?.addEventListener('click',()=>{
      fill.value=100; hct.value=42; spun=false; rotor.setAttribute('transform','rotate(0 110 128)'); spinLabel.textContent='Spin';
      pppRbc.style.opacity='0'; buffy.style.opacity='0';
      update();
    });
  })();

  // ================= S1 =================
  (function(){
    const assayBtns = $$('[data-assay]');
    const segBtns = $$('#s1 .seg-btn');
    let assay='pt';
    const reagentName=$('#s1-reagent-name'), reagentDesc=$('#s1-reagent-desc'), reagentDot=$('#s1-reagent-dot');
    const factor=$('#s1-factor'), factorVal=$('#s1-factor-val'), factorWhy=$('#s1-factor-why');
    const anticoag=$('#s1-anticoag'), dose=$('#s1-dose'), doseVal=$('#s1-dose-val'), doseGroup=$('#s1-interfer-group'), anticoagWhy=$('#s1-anticoag-why');
    const timeEl=$('#s1-time'), refEl=$('#s1-ref');
    const inrPt=$('#inr-pt'), inrMnpt=$('#inr-mnpt'), inrIsi=$('#inr-isi'), inrOut=$('#inr-out');
    const canvas=$('#s1-curve'), ctx=canvas?.getContext('2d');
    let curveData={t:0, absorbance:[]};
    let running=false, raf=null;
    function setAssay(a){
      assay=a;
      segBtns.forEach(b=>{ b.classList.toggle('is-active', b.dataset.assay===a); b.setAttribute('aria-pressed', b.dataset.assay===a); });
      if(a==='pt'){ reagentName.textContent='Thromboplastin'; reagentDesc.textContent='TF + phospholipid'; reagentDot.style.background='#2EC4B6'; refEl.textContent='PT 10–13 s · INR 0.9–1.1'; }
      else { reagentName.textContent='Partial thromboplastin'; reagentDesc.textContent='Phospholipid (no TF)'; reagentDot.style.background='#FF8A5B'; refEl.textContent='aPTT 25–35 s · ratio 0.9–1.2'; }
      drawCurve(0);
    }
    assayBtns.forEach(b=>b.addEventListener('click',()=>setAssay(b.dataset.assay)));

    function computeTime(){
      const f = +factor.value; // 5-150
      const drug = anticoag.value;
      const d = +dose.value; // 0-100
      // base times
      let base = assay==='pt'? 12.0 : 30.0;
      // factor effect: time ∝ 1/sqrt? simplified: time = base * (100/f)^0.6 ; clamp
      let factorMult = Math.pow(100/Math.max(f,8), 0.45);
      let t = base * factorMult;
      // drug effect
      if(drug!=='none'){
        const level = d/100;
        if(drug==='warfarin'){
          // warfarin reduces functional vitamin K factors; PT sensitive, aPTT less
          if(assay==='pt') t *= (1 + level*1.8);
          else t *= (1 + level*0.6);
        } else if(drug==='heparin'){
          if(assay==='aptt') t *= (1 + level*2.2);
          else t *= (1 + level*0.3);
        } else if(drug==='apixaban'){
          if(assay==='pt') t *= (1 + level*0.5);
          else t *= (1 + level*0.8);
        } else if(drug==='dabigatran'){
          // thrombin inhibitor prolongs both, aPTT more
          t *= (1 + level*1.2 + (assay==='aptt'?0.4:0));
        }
      }
      return {t:Math.round(t*10)/10, base};
    }

    function describe(){
      const f=+factor.value;
      const drug=anticoag.value;
      const {t}=computeTime();
      factorVal.textContent = f<30? `${f}% — severe deficiency` : f<60? `${f}% — mild deficiency` : f<=120? `${f}% — normal` : `${f}% — elevated (acute phase)`;
      factorWhy.textContent = f<30? `Clotting factor(s) low → longer time. In vivo threshold ~30% often still hemostatic; <10% severe.` : f<60? `Low-normal. Times prolonged, but modestly — check specific factor levels if indicated.` : `Factor complement adequate.`;
      if(drug==='none'){ anticoagWhy.textContent='No anticoagulant. Times reflect factor levels only.'; doseGroup.style.display='none';}
      else {
        doseGroup.style.display='block';
        const names={warfarin:'Warfarin: ↓ γ-carboxylated II, VII, IX, X (and PC/PS). PT most sensitive (VII half-life shortest).', heparin:'UFH: antithrombin·heparin inactivates IIa/Xa → aPTT prolongs dose-dependently; anti-Xa assay preferred for monitoring.', apixaban:'Apixaban (anti-Xa): variable PT/aPTT prolongation by reagent — don’t use times to quantify; use anti-Xa calibrated or drug level.', dabigatran:'Dabigatran (anti-IIa): prolongs aPTT, PT, TT markedly; TT most sensitive — dilute TT or drug level for quant.'};
        anticoagWhy.textContent=names[drug];
      }
      timeEl.textContent = running? 'running…' : `${t.toFixed(1)} s`;
      timeEl.style.color = t> (assay==='pt'?13:35) ? '#FF8A5B' : assay==='pt' && t<10 ? '#2EC4B6' : '#2EC4B6';
      if(assay==='pt'){ refEl.textContent = t>13? '↑ prolonged' : t<10? '↓ short (high VII?)' : 'PT 10–13 s · normal'; }
      else { refEl.textContent = t>35? '↑ prolonged' : 'aPTT 25–35 s · normal';}
    }
    factor?.addEventListener('input', ()=>{ describe(); drawCurve(0); });
    anticoag?.addEventListener('change', ()=>{ describe(); drawCurve(0); });
    dose?.addEventListener('input', ()=>{ doseVal.textContent = dose.value+'%'; describe(); drawCurve(0); });
    factorVal && (factorVal.textContent='100% — normal');

    // INR calc
    function updateINR(){
      const pt=+inrPt.value||0, mnpt=+inrMnpt.value||1, isi=+inrIsi.value||1;
      const inr = Math.pow(pt/mnpt, isi);
      inrOut.textContent = isFinite(inr)? inr.toFixed(2): '—';
    }
    [inrPt,inrMnpt,inrIsi].forEach(el=>el?.addEventListener('input', updateINR));
    updateINR();

    // Canvas drawing
    function drawCurve(phase){ // 0 idle, 1..100 progress
      if(!ctx) return;
      const W=canvas.width, H=canvas.height;
      const padL=44, padR=16, padT=16, padB=28;
      ctx.clearRect(0,0,W,H);
      // bg
      ctx.fillStyle='#0B1E24'; ctx.fillRect(0,0,W,H);
      // grid
      ctx.strokeStyle='#1E3A44'; ctx.lineWidth=1;
      for(let i=0;i<=4;i++){ const y=padT + (H-padT-padB)*(i/4); ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();}
      for(let i=0;i<=5;i++){ const x=padL + (W-padL-padR)*(i/5); ctx.beginPath(); ctx.moveTo(x,padT); ctx.lineTo(x,H-padB); ctx.stroke();}
      // axes labels
      ctx.fillStyle='#8BA3AD'; ctx.font='10px sans-serif';
      ctx.fillText('Time (s)', W/2-20, H-6);
      ctx.save(); ctx.translate(10,H/2); ctx.rotate(-Math.PI/2); ctx.fillText('Absorbance / viscosity',0,0); ctx.restore();
      // compute target time
      const {t} = computeTime();
      const maxT = Math.max(60, t*1.6);
      // generate sigmoid-like absorbance curve: baseline 0.1, rise at clot time
      const points=[];
      const steps=120;
      for(let i=0;i<=steps;i++){
        const time = (i/steps)*maxT;
        // sigmoid centered at t, steepness 1.2, amplitude 0.8
        const k= 2.2; // steepness
        const a = 0.12 + 0.78/(1+Math.exp(-k*(time - t)));
        points.push({time, a});
      }
      // draw baseline
      ctx.strokeStyle='#2EC4B6'; ctx.lineWidth=2; ctx.beginPath();
      points.forEach((p,i)=>{
        const x=padL + (p.time/maxT)*(W-padL-padR);
        const y=padT + (1 - p.a)*(H-padT-padB);
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      });
      ctx.stroke();
      // threshold line at midpoint of rise ~0.5 absorbance
      const thrA = 0.5;
      const thrY = padT + (1-thrA)*(H-padT-padB);
      ctx.strokeStyle='rgba(244,211,94,.9)'; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(padL,thrY); ctx.lineTo(W-padR,thrY); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle='#F4D35E'; ctx.font='9px sans-serif'; ctx.fillText('threshold', W-padR-50, thrY-4);
      // vertical at t
      const tx = padL + (t/maxT)*(W-padL-padR);
      if(phase>=1){
        ctx.strokeStyle='#FF8A5B'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(tx,padT); ctx.lineTo(tx, H-padB); ctx.stroke();
        ctx.fillStyle='#FF8A5B'; ctx.fillRect(tx-12, padT-2, 48, 14); ctx.fillStyle='#fff'; ctx.font='bold 9px sans-serif'; ctx.fillText(t.toFixed(1)+' s', tx-10, padT+8);
      }
      // animate progress: show up to phase
      if(phase>0 && phase<100){
        const cutoff = (phase/100)*maxT;
        const cx = padL + (cutoff/maxT)*(W-padL-padR);
        ctx.fillStyle='rgba(8,15,20,.35)'; ctx.fillRect(cx, padT, W-padR-cx, H-padT-padB);
        // moving dot at current time
        const progTime = cutoff;
        const progA = 0.12 + 0.78/(1+Math.exp(-2.2*(progTime - t)));
        const py = padT + (1-progA)*(H-padT-padB);
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(cx, py, 4,0,Math.PI*2); ctx.fill();
      }
      // time ticks
      ctx.fillStyle='#8BA3AD'; ctx.font='9px sans-serif';
      for(let i=0;i<=5;i++){ const v=Math.round((maxT/5)*i); const x=padL + (v/maxT)*(W-padL-padR); ctx.fillText(v+'s', x-8, H-padB+12); }
    }
    // Run animation
    $('#s1-run')?.addEventListener('click',()=>{
      if(running) return;
      running=true; $('#s1-run-label').textContent='Running…';
      const {t} = computeTime();
      let p=0;
      cancelAnimationFrame(raf);
      function tick(){
        p+= (t>40?1.2:2.0);
        if(p>=100){ p=100; running=false; $('#s1-run-label').textContent='Run assay'; describe(); }
        else requestAnimationFrame(tick);
        drawCurve(p);
        // animate steps highlight
        const steps=$$('#s1-step-1,#s1-step-2,#s1-step-3,#s1-step-4');
        steps.forEach(s=>s.style.color='#C9D8DD');
        if(p<25) steps[0].style.color='#2EC4B6';
        else if(p<50) steps[1].style.color='#F4D35E';
        else if(p<75) steps[2].style.color='#FF8A5B';
        else steps[3].style.color='#2EC4B6';
        if(running) raf=requestAnimationFrame(tick); else drawCurve(100);
      }
      tick();
    });
    $('#s1-reset')?.addEventListener('click',()=>{ running=false; $('#s1-run-label').textContent='Run assay'; drawCurve(0); describe(); });
    describe(); drawCurve(0);
  })();

  // ================= S2 =================
  (function(){
    const slider=$('#s2-fib-slider'), out=$('#s2-fib-slider-val'), why=$('#s2-fib-why'), interfer=$('#s2-interfer'), interferWhy=$('#s2-interfer-why');
    const canvas=$('#s2-curve'), ctx=canvas?.getContext('2d');
    const timeEl=$('#s2-time'), fibEl=$('#s2-fib'), cuvetteLabel=$('#s2-cuvette-label'), plasma=$('#s2-plasma'), mesh=$('#s2-fibrin-mesh');
    // calibration: time = a - b*log10(fib) approx; fit illustrative
    // we want time ~30s at 50 mg/dL, ~14s at 100, ~8s at 280, ~5s at 700
    function timeFromFib(fibMg){
      // power law: time = 85 * fib^-0.52  (tuned)
      return 85 * Math.pow(fibMg, -0.52) * 2.2; // adjust
      // actually let's compute: fib 280 => time ~8.5
      // 280^-0.52 ~ 0.052, *85=4.42 *2.2=9.7 ok
    }
    function fibFromTime(t){
      // inverse
      return Math.pow(t/(85*2.2), -1/0.52);
    }
    let points=[]; // stored clicks
    function draw(){
      if(!ctx) return;
      const W=canvas.width, H=canvas.height;
      const padL=46, padR=14, padT=18, padB=30;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#0B1E24'; ctx.fillRect(0,0,W,H);
      // grid log x
      ctx.strokeStyle='#1E3A44'; ctx.lineWidth=1;
      for(let i=0;i<=4;i++){ const y=padT + (H-padT-padB)*(i/4); ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();}
      // x log from 50 to 800
      const xToPx = (x)=> padL + (Math.log10(x)-Math.log10(50))/(Math.log10(800)-Math.log10(50))*(W-padL-padR);
      const yToPx = (t)=> padT + (t-2)/(30-2)*(H-padT-padB);
      // calibration curve
      ctx.strokeStyle='#F4D35E'; ctx.lineWidth=2; ctx.beginPath();
      for(let fib=50; fib<=800; fib+=2){
        const t=timeFromFib(fib);
        const x=xToPx(fib), y=yToPx(t);
        if(fib===50) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      // normal band 200-400 mg/dL zone
      const x1=xToPx(200), x2=xToPx(400);
      ctx.fillStyle='rgba(46,196,182,.12)'; ctx.fillRect(x1, padT, x2-x1, H-padT-padB);
      ctx.fillStyle='#2EC4B6'; ctx.font='8px sans-serif'; ctx.fillText('normal Clauss', x1+4, padT+10);
      // points
      points.forEach(p=>{
        const x=xToPx(p.fib), y=yToPx(p.t);
        ctx.fillStyle= p.bad? '#E63946':'#2EC4B6'; ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=1.2; ctx.stroke();
        ctx.fillStyle='#E8F1F2'; ctx.font='9px sans-serif'; ctx.fillText(`${p.fib} mg/dL → ${p.t.toFixed(1)}s`, x+8, y-6);
      });
      // axes
      ctx.fillStyle='#8BA3AD'; ctx.font='9px sans-serif';
      [50,100,200,400,800].forEach(v=>{ const x=xToPx(v); ctx.fillText(v, x-10, H-padB+14); });
      [5,10,15,20,25].forEach(v=>{ const y=yToPx(v); ctx.fillText(v+'s', 8, y+4); });
      ctx.fillText('Fibrinogen (mg/dL) — log scale', W/2-60, H-4);
      ctx.save(); ctx.translate(12,H/2); ctx.rotate(-Math.PI/2); ctx.fillText('Clot time (s)',0,0); ctx.restore();
    }
    function update(){
      const fib=+slider.value;
      const intf=interfer.value;
      let t = timeFromFib(fib);
      let labelFib = fib;
      if(intf==='heparin'){ t*=1.8; labelFib = Math.round(fib*0.62); } // apparent low
      if(intf==='fdp'){ t*=1.5; labelFib = Math.round(fib*0.75); }
      out.textContent = fib + ' mg/dL — ' + (fib<150? 'low (bleeding/DIC risk)' : fib<=200? 'borderline low' : fib<=400? 'normal (200–400)' : fib<=600? 'high — acute phase' : 'very high — inflammation/pregnancy');
      why.textContent = fib<150? 'Hypofibrinogenemia — confirm with repeat Clauss; consider DIC, dilution post-op, congenital. TT also prolonged.' : fib>400? 'Acute-phase — IL-6 drives hepatic synthesis; can be 600–800 mg/dL after surgery, infection, pregnancy — masks consumption.' : 'Normal adult. PT-derived estimate would match Clauss here only because fibrinogen is normal.';
      if(intf==='none'){ interferWhy.textContent='Clean sample. TT 14–19 s. Fibrin forms a firm mesh.'; }
      else if(intf==='heparin'){ interferWhy.textContent='Heparin/dabigatran inhibits thrombin → TT prolonged even with normal fibrinogen. Reptilase bypasses this (stays normal). Apparent Clauss may read falsely low if instrument detects prolonged time without correction.'; }
      else { interferWhy.textContent='FDPs coat fibrin monomers / dysfibrinogen makes weak mesh → prolonged TT and prolonged reptilase. Clauss may be falsely low if calibration assumes normal polymerization.';}
      timeEl.textContent = t.toFixed(1)+' s';
      fibEl.textContent = (intf==='none'? fib : labelFib) + ' mg/dL';
      fibEl.style.color = (fibEl.textContent.includes('low')|| intf!=='none' && labelFib<150) ? '#FF8A5B' : '#2EC4B6';
      cuvetteLabel.textContent = intf==='none'? `Diluted PPP → + thrombin → fibrin (${fib} mg/dL → ${t.toFixed(1)}s)`: `+ thrombin (inhibited) → slow mesh ~${t.toFixed(1)}s`;
    }
    slider?.addEventListener('input', update);
    interfer?.addEventListener('change', update);
    $('#s2-run')?.addEventListener('click',()=>{
      const fib=+slider.value;
      const intf=interfer.value;
      let t=timeFromFib(fib);
      if(intf==='heparin') t*=1.8;
      if(intf==='fdp') t*=1.5;
      points.push({fib: intf==='none'? fib : Math.round(fib* (intf==='heparin'?0.62:0.75)), t, bad: intf!=='none'});
      if(points.length>6) points.shift();
      draw();
      mesh.style.opacity='1';
      plasma.style.fill='#FFE9A0';
      setTimeout(()=>{ mesh.style.opacity='0';},1200);
    });
    $('#s2-reset')?.addEventListener('click',()=>{ points=[]; draw(); });
    update(); draw();
  })();

  // ================= S3 =================
  (function(){
    const level=$('#s3-level'), out=$('#s3-level-val'), why=$('#s3-level-why'), turbEl=$('#s3-turb'), dval=$('#s3-dval');
    const canvas=$('#s3-canvas'), ctx=canvas?.getContext('2d');
    const chart=$('#s3-chart'), cctx=chart?.getContext('2d');
    const cuvetteFill=$('#s3-cuvette-fill');
    let beads=[];
    // init beads
    function initBeads(){
      beads=[];
      for(let i=0;i<32;i++) beads.push({x: Math.random()*280+40, y: Math.random()*120+30, vx:(Math.random()-0.5)*0.6, vy:(Math.random()-0.5)*0.6, r:6+Math.random()*4, clumped:false});
    }
    initBeads();
    let agitating=false, raf=null;
    function turbidityFromConc(c){ // 0-4000 -> delta A
      // latex turbidimetric: ~ logistic: low -> 0.05, mid 500 -> 0.18, high 4000 -> 0.85
      return 0.06 + 0.85/(1+Math.exp(-0.0022*(c-1500)));
    }
    function drawBeads(){
      if(!ctx) return;
      const W=canvas.width, H=canvas.height;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#0B1E24'; ctx.fillRect(0,0,W,H);
      const conc=+level.value;
      const turb= turbidityFromConc(conc);
      // cuvette rect
      ctx.fillStyle=`rgba(244,211,94,${0.7+turb*0.3})`; ctx.fillRect(22,18,316,160);
      ctx.strokeStyle='#2E4E58'; ctx.strokeRect(22,18,316,160);
      // agglutination effect: more conc => beads cluster
      const clusterStrength = Math.min(1, conc/1800);
      beads.forEach(b=>{
        // simple attraction to center if clumped
        if(agitating){
          // jostle
          b.x += b.vx*2 + (Math.random()-0.5);
          b.y += b.vy*2 + (Math.random()-0.5);
        } else {
          b.x += b.vx; b.y += b.vy;
          if(clusterStrength>0.3){
            // attract beads slightly towards each other via pseudo gravity to center of clusters
            const cx=180, cy=100;
            b.x += (cx - b.x)*clusterStrength*0.002;
            b.y += (cy - b.y)*clusterStrength*0.002;
          }
        }
        // bounce
        if(b.x<30) b.x=30; if(b.x>330) b.x=330; if(b.y<24) b.y=24; if(b.y>170) b.y=170;
        // draw bead
        ctx.fillStyle='#CDEDF5';
        ctx.strokeStyle='#8BA3AD';
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); ctx.stroke();
        // antibody nubs
        ctx.fillStyle='#2EC4B6';
        for(let k=0;k<3;k++){ const a=k*2.1; ctx.beginPath(); ctx.arc(b.x+Math.cos(a)*b.r*0.7, b.y+Math.sin(a)*b.r*0.7, 1.6,0,Math.PI*2); ctx.fill();}
      });
      // clusters: draw bridges for high conc
      if(clusterStrength>0.4){
        ctx.strokeStyle='rgba(46,196,182,.55)'; ctx.lineWidth=1.5;
        for(let i=0;i<beads.length;i+=4){
          const a=beads[i], b=beads[(i+2)%beads.length];
          if(Math.hypot(a.x-b.x,a.y-b.y)<60){
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
            // small D-dimer bridge dot
            ctx.fillStyle='#F4D35E'; ctx.beginPath(); ctx.arc((a.x+b.x)/2,(a.y+b.y)/2,2.5,0,Math.PI*2); ctx.fill();
          }
        }
      }
      // light beam through
      ctx.strokeStyle=`rgba(255,255,255,${0.15+turb*0.4})`; ctx.lineWidth=2; ctx.setLineDash([6,4]); ctx.beginPath(); ctx.moveTo(22,92); ctx.lineTo(338,92); ctx.stroke(); ctx.setLineDash([]);
      // label
      ctx.fillStyle='#8BA3AD'; ctx.font='7px sans-serif'; ctx.fillText(`beads + D-dimer bridges (agglutination) — `+(clusterStrength>0.5?'strong':'weak'), 26,30);
    }
    function drawChart(){
      if(!cctx) return;
      const W=chart.width, H=chart.height;
      const padL=44, padR=12, padT=14, padB=28;
      cctx.clearRect(0,0,W,H);
      cctx.fillStyle='#0B1E24'; cctx.fillRect(0,0,W,H);
      // grid
      cctx.strokeStyle='#1E3A44'; cctx.lineWidth=1;
      for(let i=0;i<=4;i++){ const y=padT +(H-padT-padB)*(i/4); cctx.beginPath(); cctx.moveTo(padL,y); cctx.lineTo(W-padR,y); cctx.stroke();}
      for(let i=0;i<=4;i++){ const x=padL +(W-padL-padR)*(i/4); cctx.beginPath(); cctx.moveTo(x,padT); cctx.lineTo(x,H-padB); cctx.stroke();}
      // curve turb vs conc (conc 0-4000)
      const xToPx=(c)=> padL + (c/4000)*(W-padL-padR);
      const yToPx=(t)=> padT + (1 - t/1.0)*(H-padT-padB);
      cctx.strokeStyle='#2EC4B6'; cctx.lineWidth=2; cctx.beginPath();
      for(let c=0;c<=4000;c+=10){
        const t=turbidityFromConc(c);
        const x=xToPx(c), y=yToPx(t);
        if(c===0) cctx.moveTo(x,y); else cctx.lineTo(x,y);
      }
      cctx.stroke();
      // cutoff line 0.50 mg/L FEU -> ~conc 500
      const cutC=500;
      const cx=xToPx(cutC);
      cctx.strokeStyle='#F4D35E'; cctx.setLineDash([5,4]); cctx.beginPath(); cctx.moveTo(cx,padT); cctx.lineTo(cx,H-padB); cctx.stroke(); cctx.setLineDash([]);
      cctx.fillStyle='#F4D35E'; cctx.font='8px sans-serif'; cctx.fillText('cutoff 0.50 mg/L FEU', cx+4, padT+10);
      // current point
      const cur=+level.value;
      const ct=turbidityFromConc(cur);
      const px=xToPx(cur), py=yToPx(ct);
      cctx.fillStyle='#FF8A5B'; cctx.beginPath(); cctx.arc(px,py,5,0,Math.PI*2); cctx.fill(); cctx.strokeStyle='#fff'; cctx.lineWidth=1.2; cctx.stroke();
      cctx.fillStyle='#E8F1F2'; cctx.font='9px sans-serif'; cctx.fillText(cur+' mg/L', px+8, py-6);
      // axes
      cctx.fillStyle='#8BA3AD'; cctx.font='9px sans-serif';
      [0,1000,2000,3000,4000].forEach(v=>{ const x=xToPx(v); cctx.fillText(String(v), x-12, H-padB+14); });
      [0,0.25,0.5,0.75,1.0].forEach(v=>{ const y=yToPx(v); cctx.fillText(v.toFixed(2), 8, y+4); });
      cctx.fillText('D-dimer FEU (mg/L)', W/2-40, H-4);
      cctx.save(); cctx.translate(10,H/2); cctx.rotate(-Math.PI/2); cctx.fillText('ΔAbs turbidity',0,0); cctx.restore();
    }
    function update(){
      const v=+level.value;
      const turb=turbidityFromConc(v);
      out.textContent= `${v} FEU mg/L — ` + (v<500? 'below cutoff (negative in low PTP)' : v<1000? 'mildly elevated — non-specific' : v<2000? 'markedly elevated — consider clot but also inflammation' : 'very high — high sensitivity, locate cause');
      out.style.color = v>=500? '#FF8A5B' : '#2EC4B6';
      why.textContent = v>=500? 'Above this assay’s rule-out threshold — not diagnostic alone; requires imaging/clinical probability.' : 'Below cutoff — useful for exclusion only when Wells/YEARS low. Sensitivity >95% for PE/DVT in that context.';
      turbEl.textContent = turb.toFixed(3)+' ΔA';
      dval.textContent = v+' FEU mg/L' + ` (${(v/2).toFixed(0)} DDU)`;
      // cuvette opacity reflects turbidity
      const opacity = 0.12 + turb*0.5;
      cuvetteFill.style.fill=`rgba(244,211,94,${opacity})`;
      cuvetteFill.style.stroke='#F4D35E';
      drawBeads(); drawChart();
    }
    level?.addEventListener('input', update);
    $('#s3-run')?.addEventListener('click',()=>{ agitating=true; setTimeout(()=>agitating=false,700); });
    $('#s3-reset')?.addEventListener('click',()=>{ level.value=420; update(); });
    // anim loop
    function loop(){ drawBeads(); requestAnimationFrame(loop); }
    loop();
    update();
  })();

  // ================= S4 Mixing =================
  (function(){
    const cases={
      deficiency:{patient:68, npp:28, mixImmediate:31, mixInc:33, interp:'Factor deficiency — correction', sub:'1:1 mix supplies ~50% factor → hemostatic threshold passed. Rosner ~4% (low). Investigate specific factor assay.'},
      la:{patient:64, npp:28, mixImmediate:58, mixInc:60, interp:'Lupus anticoagulant pattern — no correction', sub:'Mix stays prolonged (Rosner ~47%). Phospholipid-dependent inhibitor not diluted out. Proceed to LA panel.'},
      fviii:{patient:78, npp:28, mixImmediate:44, mixInc:68, interp:'Time-dependent inhibitor (FVIII Ab)', sub:'Partial immediate correction, worsens on incubation. Bethesda titer next; not LA (LA is immediate).'},
    };
    let current='deficiency';
    const patientVal=$('#s4-patient-val'), mixVal=$('#s4-mix-val'), mixTime=$('#s4-mix-time'), mixFill=$('#s4-mix-fill'), mixLabel=$('#s4-mix-label'), interp=$('#s4-interp'), interpSub=$('#s4-interp-sub'), rosnerEl=$('#s4-rosner'), incubateLabel=$('#s4-incubate-label');
    const btns=$$('[data-case]');
    function applyCase(k){
      current=k;
      btns.forEach(b=>b.classList.toggle('is-active', b.dataset.case===k));
      const c=cases[k];
      patientVal.textContent=c.patient+' s';
      // animate mix value immediate then incubated? Simplification show immediate
      mixVal.textContent=c.mixImmediate+' s';
      mixTime.textContent=`Mix ${c.mixImmediate}s`;
      // color
      const rosner = ((c.mixImmediate - c.npp)/c.patient)*100;
      rosnerEl.textContent = `Rosner ${(rosner).toFixed(1)}% — ${rosner<12?'correction (deficiency-leaning)':'inhibitor-leaning'}; cutoffs assay-specific. Mix ${c.mixImmediate}s → incubated ${c.mixInc}s.`;
      interp.textContent=c.interp;
      interpSub.textContent=c.sub;
      mixLabel.textContent='1:1 mix';
      // fill color
      mixFill.style.fill = k==='deficiency'? '#CDEDF5' : k==='la'? '#FFE0E0' : '#FFD9B0';
      incubateLabel.textContent = `Incubated 2h: ${c.mixInc}s ${k==='fviii'?'— worsens (time-dependent)': k==='la'?'— remains prolonged':'— stable (corrected)'}`;
    }
    btns.forEach(b=>b.addEventListener('click',()=>applyCase(b.dataset.case)));
    applyCase(current);
  })();

  // ================= S5 LA =================
  (function(){
    const laCases={
      normal:{drvvtScreen:32, drvvtScreenRatio:0.97, apttScreen:31, mix:'correction', drvvtConfirm:30, sctConfirm:0.92, ratio:1.03, mixInterp:'corrects (factor)', confirmInterp:'no phospholipid dependence'},
      la:{drvvtScreen:58, drvvtScreenRatio:1.76, apttScreen:54, mix:'no correction', drvvtConfirm:34, sctConfirm:1.42, ratio:1.71, mixInterp:'inhibitor persists', confirmInterp:'shortens with excess PL — LA'},
      warfarin:{drvvtScreen:44, drvvtScreenRatio:1.33, apttScreen:42, mix:'correction', drvvtConfirm:42, sctConfirm:1.02, ratio:1.05, mixInterp:'deficiency corrects', confirmInterp:'no PL dependence — VKA, not LA'},
      doac:{drvvtScreen:62, drvvtScreenRatio:1.88, apttScreen:48, mix:'no correction', drvvtConfirm:58, sctConfirm:1.38, ratio:1.07, mixInterp:'DOAC in mix — false non-correction', confirmInterp:'phospholipid effect blunted by drug — uninterpretable'},
    };
    let current='normal', step=0;
    const drvvtScreenEl=$('#s5-drvvt-screen'), apttScreenEl=$('#s5-aptt-screen'), mixStatus=$('#s5-mix-status'), ratioEl=$('#s5-ratio'), mixInterpEl=$('#s5-mix-interp'), confirmInterpEl=$('#s5-confirm-interp'), drvvtConfirmEl=$('#s5-drvvt-confirm'), sctConfirmEl=$('#s5-sct-confirm');
    const s1=$('#s5-step1'), s2=$('#s5-step2'), s3=$('#s5-step3');
    const btns=$$('[data-la]');
    function render(){
      const c=laCases[current];
      drvvtScreenEl.textContent=c.drvvtScreen+' s';
      drvvtScreenEl.style.color=c.drvvtScreenRatio>1.2?'#E63946':'#2EC4B6';
      apttScreenEl.textContent=c.apttScreen+' s';
      apttScreenEl.style.color=c.apttScreen>40?'#E63946':'#2EC4B6';
      mixStatus.textContent = step>=1 ? (c.mix==='no correction'?'still prolonged → inhibitor':'corrects → deficiency') : 'awaiting step 1';
      ratioEl.textContent= `dRVVT screen/confirm = ${c.ratio.toFixed(2)} ${c.ratio>1.2?'— LA-leaning':''}`;
      ratioEl.style.color=c.ratio>1.2?'#F4D35E':'#8BA3AD';
      mixInterpEl.textContent=c.mixInterp;
      confirmInterpEl.textContent=c.confirmInterp;
      drvvtConfirmEl.textContent=c.drvvtConfirm+' s';
      sctConfirmEl.textContent= c.sctConfirm? c.sctConfirm.toFixed(2): '—';
      // step opacity
      s1.style.opacity= step>=0? '1':'.35';
      s2.style.opacity= step>=1? '1':'.35'; s2.style.borderColor= step>=1? '#2EC4B6':'#3A5A63';
      s3.style.opacity= step>=2? '1':'.35'; s3.style.borderColor= step>=2? '#2EC4B6':'#3A5A63';
    }
    btns.forEach(b=>b.addEventListener('click',()=>{ current=b.dataset.la; step=0; btns.forEach(x=>x.classList.remove('is-active')); b.classList.add('is-active'); render(); }));
    $('#s5-run')?.addEventListener('click',()=>{ step=Math.min(2, step+1); render(); });
    $('#s5-reset')?.addEventListener('click',()=>{ step=0; render(); });
    render();
  })();

  // ================= S6 Proteins =================
  (function(){
    const tabs=$$('[data-p]');
    const panes={at:$('#s6-at'), pc:$('#s6-pc'), ps:$('#s6-ps'), apcr:$('#s6-apcr')};
    const controls={at:$('#s6-control-at'), pc:$('#s6-control-pc'), ps:$('#s6-control-ps'), apcr:$('#s6-control-apcr')};
    const atSlider=$('#s6-at-slider'), atOut=$('#s6-at-out'), atLabel=$('#s6-at-label'), atBar=$('#s6-at-bar');
    const pcSlider=$('#s6-pc-slider'), pcOut=$('#s6-pc-out'), pcLabel=$('#s6-pc-label');
    const psSlider=$('#s6-ps-slider'), psOut=$('#s6-ps-out'), psLabel=$('#s6-ps-label'), psBar=$('#s6-ps-bar');
    const apcrSlider=$('#s6-apcr-slider'), apcrOut=$('#s6-apcr-out'), apcrLabel=$('#s6-apcr-label'), apcrBar=$('#s6-apcr-bar'), apcrNote=$('#s6-apcr-note');
    const wellCanvas=$('#s6-well-canvas'), wctx=wellCanvas?.getContext('2d');
    let current='at';
    function switchP(p){
      current=p;
      tabs.forEach(t=>t.classList.toggle('is-active', t.dataset.p===p));
      Object.entries(panes).forEach(([k,el])=> el.classList.toggle('is-active', k===p));
      Object.entries(controls).forEach(([k,el])=> el.style.display = k===p? 'block':'none');
      drawWells();
    }
    tabs.forEach(t=>t.addEventListener('click',()=>switchP(t.dataset.p)));
    // wells visualization: row of 8 wells with color intensity inverse for AT/PC (more protein less color) else direct
    function drawWells(){
      if(!wctx) return;
      const W=wellCanvas.width, H=wellCanvas.height;
      wctx.clearRect(0,0,W,H);
      wctx.fillStyle='#0B1E24'; wctx.fillRect(0,0,W,H);
      // standards strip
      const wellW=68, wellH=54, gap=16;
      const startX=20;
      const y=20;
      // calibration shades
      const vals=[120,100,80,60,40,20]; // standards
      wctx.font='7px sans-serif'; wctx.fillStyle='#9ECFD5'; wctx.fillText('Standards → patient', startX, 14);
      vals.forEach((v,i)=>{
        const x=startX + i*(wellW+gap);
        let intensity;
        if(current==='at' || current==='pc'){
          // inverse: more protein less color
          intensity = 1 - (v/130);
        } else {
          intensity = v/130;
        }
        const alpha = 0.15 + intensity*0.85;
        wctx.fillStyle=`rgba(244,211,94,${alpha})`;
        wctx.strokeStyle='#2E4E58';
        wctx.beginPath(); wctx.roundRect(x,y,wellW,wellH,10); wctx.fill(); wctx.stroke();
        wctx.fillStyle='#0A1419'; wctx.font='bold 8px sans-serif'; wctx.fillText(v+'%', x+wellW/2-10, y+wellH/2+3);
      });
      // patient well highlight
      let patientVal;
      if(current==='at') patientVal=+atSlider.value;
      else if(current==='pc') patientVal=+pcSlider.value;
      else if(current==='ps') patientVal=+psSlider.value;
      else patientVal= +apcrSlider.value*10; // scale for visual
      const px=startX + vals.length*(wellW+gap)+8;
      let pint;
      if(current==='at' || current==='pc') pint= 1 - (patientVal/130);
      else pint= patientVal/130;
      wctx.fillStyle=`rgba(46,196,182,${0.2+pint*0.7})`;
      wctx.strokeStyle='#2EC4B6'; wctx.lineWidth=2;
      wctx.beginPath(); wctx.roundRect(px,y,wellW,wellH,10); wctx.fill(); wctx.stroke();
      wctx.fillStyle='#E8F1F2'; wctx.font='bold 8px sans-serif'; wctx.fillText('PT', px+wellW/2-7, y+wellH/2+3);
      wctx.fillStyle='#8BA3AD'; wctx.font='7px sans-serif'; wctx.fillText('patient', px+wellW/2-14, y+wellH+12);
      if(wellCanvas.width!==wellCanvas.clientWidth){ /* hi-dpi handled via width attr */ }
    }
    function updateAT(){
      const v=+atSlider.value;
      atOut.textContent= v+'% — '+(v<70?'low': v<80?'borderline': v<=120?'normal':'high');
      atOut.style.color = v<70?'#E63946': v<80?'#FF8A5B':'#2EC4B6';
      atLabel.textContent=`AT ${v}% — `+(v<70?'low': v<80?'borderline low':'normal');
      atLabel.style.fill=v<70?'#E63946':'#E8F1F2';
      atBar.style.width=`${Math.max(8, v/1.3)}%`;
      atBar.style.background = v<70?'#E63946': v<80?'#FF8A5B':'#2EC4B6';
      drawWells();
    }
    function updatePC(){
      const v=+pcSlider.value;
      pcOut.textContent= v+'% — '+(v<60?'low': v<70?'borderline': v<=140?'normal':'high');
      pcOut.style.color = v<60?'#E63946': v<70?'#FF8A5B':'#9B8EC4';
      if(pcLabel) pcLabel.textContent=`PC ${v}% — `+(v<60?'low':'normal');
      drawWells();
    }
    function updatePS(){
      const v=+psSlider.value;
      psOut.textContent= v+'% — '+(v<55?'low': v<60?'low-normal (female/preg)': v<=130?'normal':'high');
      psOut.style.color = v<55?'#E63946': v<60?'#FF8A5B':'#5BC0DE';
      psLabel.textContent=`Free PS antigen ${v}% — `+(v<55?'low':'low-normal (female lower)');
      psBar.style.width=`${Math.max(8, v/1.3)}%`;
      psBar.style.background = v<55?'#E63946': v<60?'#FF8A5B':'#5BC0DE';
      drawWells();
    }
    function updateAPCR(){
      const r=(+apcrSlider.value)/10;
      apcrOut.textContent= r.toFixed(1)+' — '+(r<1.5?'homo-like resistant': r<2.0?'het-like resistant': 'normal sensitivity to APC');
      apcrOut.style.color = r<2.0?'#E63946':'#2EC4B6';
      apcrLabel.textContent=`Ratio ${r.toFixed(1)} — `+(r<2.0?'low (APC resistance)':'normal (≥2.0)');
      apcrNote.textContent = r<2.0? 'APC fails to cleave Va — suspect FVL, confirm by PCR' : 'FVa inactivation intact';
      apcrBar.style.width=`${Math.max(8, (r/4)*100)}%`;
      apcrBar.style.background = r<2.0?'#E63946':'#2EC4B6';
      drawWells();
    }
    atSlider?.addEventListener('input', updateAT);
    pcSlider?.addEventListener('input', updatePC);
    psSlider?.addEventListener('input', updatePS);
    apcrSlider?.addEventListener('input', updateAPCR);
    updateAT(); updatePC(); updatePS(); updateAPCR();
    drawWells();
  })();

  // ================= S7 DNA =================
  (function(){
    const geneBtns=$$('[data-gene]'), genotypeBtns=$$('[data-genotype]');
    let gene='f5', genotype='wt';
    const ampCanvas=$('#s7-amp-canvas'), actx=ampCanvas?.getContext('2d');
    const meltCanvas=$('#s7-melt-canvas'), mctx=meltCanvas?.getContext('2d');
    const callEl=$('#s7-call'), interpEl=$('#s7-interp'), allelesEl=$('#s7-alleles'), riskEl=$('#s7-risk'), variantTitle=$('#s7-variant-title'), variantDesc=$('#s7-variant-desc');
    const wellsEl=$('#s7-wells'), cycleLabel=$('#s7-cycle-label');
    let cycle=0, anim=null, ampData=[];
    const genotypes={
      wt:{label:'G/G wild-type', rTxt:'~1×', ratio:'G/G'},
      het:{label:'G/A heterozygous', rTxt:'~5× (FVL) / ~3× (F2)', ratio:'G/A'},
      hom:{label:'A/A homozygous', rTxt:'~30–80× (FVL) severe', ratio:'A/A'},
    };
    function setGene(g){
      gene=g;
      geneBtns.forEach(b=>b.classList.toggle('is-active', b.dataset.gene===g));
      if(g==='f5'){ variantTitle.textContent='F5 LEIDEN — rs6025 G→A · Arg506Gln'; variantDesc.textContent='APC cleavage site lost → Va resistant → ↑ thrombin. AD inheritance.'; }
      else { variantTitle.textContent='F2 G20210A — prothrombin 20210G>A'; variantDesc.textContent='3′UTR ↑ polyadenylation → ↑ mRNA → ↑ prothrombin ~30%. AD, milder than FVL.'; }
      resetPCR();
    }
    function setGenotype(gt){
      genotype=gt;
      genotypeBtns.forEach(b=>b.classList.toggle('is-active', b.dataset.genotype===gt));
      allelesEl.textContent= genotypes[gt].ratio;
      riskEl.textContent= genotypes[gt].rTxt;
      callEl.textContent= genotypes[gt].label;
      interpEl.textContent= gt==='wt'? 'No variant — baseline population risk (still VTE possible)' : gt==='het'? 'One copy — counsel on estrogen, pregnancy, family; don’t anticoagulate asymptomatic' : 'Two copies — high risk; specialist counseling; avoid estrogen; perinatal hemostasis input.';
      drawMelt(); drawAmp(0);
    }
    geneBtns.forEach(b=>b.addEventListener('click',()=>setGene(b.dataset.gene)));
    genotypeBtns.forEach(b=>b.addEventListener('click',()=>setGenotype(b.dataset.genotype)));

    // draw wells grid 96-well impression
    function drawTherm(){
      if(!wellsEl) return;
      wellsEl.innerHTML='';
      const svgNS='http://www.w3.org/2000/svg';
      for(let r=0;r<6;r++) for(let c=0;c<10;c++){
        const well=document.createElementNS(svgNS,'rect');
        well.setAttribute('x', 22 + c*36); well.setAttribute('y', 26 + r*14); well.setAttribute('width','28'); well.setAttribute('height','10'); well.setAttribute('rx','4');
        well.setAttribute('fill', (r===2 && c<4)? '#2EC4B6' : '#112A33'); well.setAttribute('stroke','#2E4E58'); well.setAttribute('stroke-width','0.6');
        wellsEl.appendChild(well);
      }
    }
    drawTherm();

    function genAmpData(){
      // 0-35 cycles, fluorescence logistic
      ampData=[];
      const cycles=35;
      for(let i=0;i<=cycles;i++){
        let wt=0, mut=0;
        if(genotype==='wt'){ wt = 0.05 + 0.92/(1+Math.exp(-0.7*(i-24))); mut=0.05+ 0.08/(1+Math.exp(-0.9*(i-33))); }
        else if(genotype==='het'){ wt = 0.05 + 0.85/(1+Math.exp(-0.68*(i-24))); mut=0.05+0.85/(1+Math.exp(-0.68*(i-24))); }
        else { mut=0.05+0.92/(1+Math.exp(-0.7*(i-24))); wt=0.05+0.08/(1+Math.exp(-0.9*(i-33))); }
        ampData.push({cycle:i, wt, mut});
      }
    }
    function drawAmp(progress){ // progress 0-35
      if(!actx) return;
      const W=ampCanvas.width, H=ampCanvas.height;
      const padL=36, padR=14, padT=14, padB=28;
      actx.clearRect(0,0,W,H);
      actx.fillStyle='#0B1E24'; actx.fillRect(0,0,W,H);
      // grid
      actx.strokeStyle='#1E3A44'; actx.lineWidth=1;
      for(let i=0;i<=4;i++){ const y=padT+(H-padT-padB)*(i/4); actx.beginPath(); actx.moveTo(padL,y); actx.lineTo(W-padR,y); actx.stroke();}
      for(let i=0;i<=5;i++){ const x=padL+(W-padL-padR)*(i/5); actx.beginPath(); actx.moveTo(x,padT); actx.lineTo(x,H-padB); actx.stroke();}
      const xToPx=(c)=> padL + (c/35)*(W-padL-padR);
      const yToPx=(v)=> padT + (1 - v/1.05)*(H-padT-padB);
      genAmpData();
      // draw wt (VIC/HEX) blue
      actx.strokeStyle='#5BC0DE'; actx.lineWidth=2; actx.beginPath();
      ampData.forEach((d,i)=>{ const x=xToPx(d.cycle), y=yToPx(d.wt); if(d.cycle>progress) return; if(i===0) actx.moveTo(x,y); else actx.lineTo(x,y); }); actx.stroke();
      // mut (FAM) orange
      actx.strokeStyle='#FF8A5B'; actx.lineWidth=2; actx.beginPath();
      ampData.forEach((d,i)=>{ const x=xToPx(d.cycle), y=yToPx(d.mut); if(d.cycle>progress) return; if(i===0) actx.moveTo(x,y); else actx.lineTo(x,y); }); actx.stroke();
      // legend
      actx.fillStyle='#5BC0DE'; actx.fillRect(W-padR-110, padT+6, 10,10); actx.fillStyle='#E8F1F2'; actx.font='8px sans-serif'; actx.fillText('Wild-type probe (VIC)', W-padR-96, padT+14);
      actx.fillStyle='#FF8A5B'; actx.fillRect(W-padR-110, padT+20,10,10); actx.fillStyle='#E8F1F2'; actx.fillText('Mutant probe (FAM)', W-padR-96, padT+28);
      // axes
      actx.fillStyle='#8BA3AD'; actx.font='9px sans-serif'; actx.fillText('Cycle', W/2-12, H-6); actx.save(); actx.translate(10,H/2); actx.rotate(-Math.PI/2); actx.fillText('Fluorescence (ΔRn)',0,0); actx.restore();
      [0,10,20,30].forEach(v=>{ const x=xToPx(v); actx.fillText(String(v), x-6, H-padB+14); });
    }
    function drawMelt(){
      if(!mctx) return;
      const W=meltCanvas.width, H=meltCanvas.height;
      const padL=36, padR=14, padT=18, padB=30;
      mctx.clearRect(0,0,W,H);
      mctx.fillStyle='#0B1E24'; mctx.fillRect(0,0,W,H);
      mctx.strokeStyle='#1E3A44'; mctx.lineWidth=1;
      for(let i=0;i<=4;i++){ const y=padT+(H-padT-padB)*(i/4); mctx.beginPath(); mctx.moveTo(padL,y); mctx.lineTo(W-padR,y); mctx.stroke();}
      for(let i=0;i<=5;i++){ const x=padL+(W-padL-padR)*(i/5); mctx.beginPath(); mctx.moveTo(x,padT); mctx.lineTo(x,H-padB); mctx.stroke();}
      // melt peaks: negative derivative -dF/dT
      const temps=[]; for(let t=60;t<=90;t+=0.2) temps.push(t);
      function peak(t,center,height,width){ return height*Math.exp(-0.5*Math.pow((t-center)/width,2));}
      temps.forEach(t=>{
        // no draw yet, compute peaks per genotype
      });
      // draw per genotype: wt single peak ~72°C, mut ~66°C (illustrative), het both
      const xToPx=(t)=> padL + (t-60)/30*(W-padL-padR);
      const yToPx=(v)=> padT + (1 - v/1.1)*(H-padT-padB);
      mctx.lineWidth=2;
      if(genotype==='wt'){
        mctx.strokeStyle='#5BC0DE'; mctx.beginPath();
        temps.forEach((t,i)=>{ const v=peak(t,72,1,1.2); const x=xToPx(t), y=yToPx(v); if(i===0) mctx.moveTo(x,y); else mctx.lineTo(x,y);}); mctx.stroke();
      } else if(genotype==='hom'){
        mctx.strokeStyle='#FF8A5B'; mctx.beginPath();
        temps.forEach((t,i)=>{ const v=peak(t,66,1,1.2); const x=xToPx(t), y=yToPx(v); if(i===0) mctx.moveTo(x,y); else mctx.lineTo(x,y);}); mctx.stroke();
      } else {
        mctx.strokeStyle='#5BC0DE'; mctx.beginPath();
        temps.forEach((t,i)=>{ const v=peak(t,72,0.65,1.2); const x=xToPx(t), y=yToPx(v); if(i===0) mctx.moveTo(x,y); else mctx.lineTo(x,y);}); mctx.stroke();
        mctx.strokeStyle='#FF8A5B'; mctx.beginPath();
        temps.forEach((t,i)=>{ const v=peak(t,66,0.65,1.2); const x=xToPx(t), y=yToPx(v); if(i===0) mctx.moveTo(x,y); else mctx.lineTo(x,y);}); mctx.stroke();
      }
      mctx.fillStyle='#8BA3AD'; mctx.font='9px sans-serif'; mctx.fillText('Temperature (°C)', W/2-30, H-6); mctx.save(); mctx.translate(10,H/2); mctx.rotate(-Math.PI/2); mctx.fillText('-dF/dT (melt peak)',0,0); mctx.restore();
      [60,65,70,75,80,85].forEach(v=>{ const x=xToPx(v); mctx.fillText(String(v), x-8, H-padB+14);});
    }
    function resetPCR(){ cycle=0; cancelAnimationFrame(anim); drawAmp(0); drawMelt(); cycleLabel.textContent='Ready — press Cycle PCR'; }
    $('#s7-run')?.addEventListener('click',()=>{
      if(cycle>=35) { resetPCR(); return; }
      let p=0;
      cancelAnimationFrame(anim);
      function tick(){
        p+=0.6;
        if(p>=35){ p=35; cycleLabel.textContent=`Done — Ct ~${genotype==='wt'?24: genotype==='het'?24:24} for present allele(s)`; drawAmp(p); drawMelt(); return;}
        drawAmp(p);
        cycleLabel.textContent=`Cycling… ${Math.floor(p)}/35`;
        anim=requestAnimationFrame(tick);
      }
      tick();
    });
    $('#s7-reset')?.addEventListener('click', resetPCR);
    setGene('f5'); setGenotype('wt'); drawAmp(0); drawMelt();
  })();

  // ================= S8 Cases =================
  (function(){
    const tbody=$('#s8-tbody'), chips=$('#s8-chips'), caption=$('#s8-caption');
    const cases={
      normal:{name:'Healthy', rows:[
        ['PT','11.8 s','PT 10–13 s','normal'],
        ['INR','1.0','—','for reference'],
        ['aPTT','28 s','25–35 s','normal'],
        ['Fibrinogen (Clauss)','2.8 g/L','2.0–4.0','normal'],
        ['D-dimer','0.28 mg/L FEU','<0.50','negative'],
        ['LA dRVVT screen','0.98','<1.2','negative'],
        ['AT / PC / free PS','98% / 92% / 88%','>~70–80%','normal'],
        ['FV Leiden / F2','G/G / G/G','wild-type','no variant'],
      ], chips:['No interferent'], caption:'Baseline healthy physiology — all assays reflect true protein/gene levels.'},
      acute:{name:'Acute PE', rows:[
        ['PT','12.0 s','10–13 s','normal (acute clot barely moves PT)'],
        ['aPTT','29 s','25–35 s','often normal or short (FVIII acute-phase)'],
        ['Fibrinogen','4.6 g/L','↑ high','acute-phase ↑ (IL-6) — can mask DIC'],
        ['D-dimer','2.8 mg/L FEU','<0.50 → high','sensitive — markedly raised, non-specific'],
        ['Factor VIII','198%','60–150 → high','acute-phase — major VTE risk marker but acquired'],
        ['AT / PC / free PS','68% / 58% / 52%','↓ low','consumed/acquired ↓ — do not diagnose deficiency now!'],
        ['LA','—','—','defer — acute phase ± anticoag ruin interpretation'],
        ['Genetics','—','—','DNA unaffected by acute event'],
      ], chips:['Acute phase distortion','Don’t label AT/PC/PS deficiency in acute event','FVIII/fibrinogen high — expected'], caption:'Day-1 acute thrombosis: inflammatory acute-phase + consumption. Deficiency testing now is mostly noise.'},
      warfarin:{name:'Warfarin', rows:[
        ['PT/INR','22 s / INR 2.5','therapeutic 2–3','↑ prolonged — VKA reduces VII, X, II, IX'],
        ['aPTT','42 s','↑ prolonged','mildly prolonged (FIX/X ↓)'],
        ['Protein C','32%','↓','falsely low on VKA (vit K–dependent) — not true deficiency'],
        ['Protein S','28%','↓','falsely low on VKA — do not interpret'],
        ['AT','96%','normal','vit K–independent — interpretable (heparin-free)'],
        ['LA panel','—','—','VKA prolongs dRVVT/aPTT — high false-positive LA. Test off VKA or with caution.'],
        ['DOAC-like LA traps','—','—','—'],
        ['FVL PCR','G/A if present','—','DNA remains reliable on VKA'],
      ], chips:['VKA interferes PC/PS & LA','AT & DNA still interpretable'], caption:'Vitamin K antagonist: PT/INR therapeutic by design; vitamin-K dependent proteins look deficient when they’re just under-carboxylated.'},
      doac:{name:'Apixaban', rows:[
        ['PT','14 s','10–13 → mildly ↑','DOAC may or may not prolong PT — reagent-dependent'],
        ['aPTT','38 s','↑ prolonged (variable)','DOAC → variable PT/aPTT prolongation'],
        ['dRVVT screen','1.72','<1.2 → false +','apixaban/rivaroxaban devastate dRVVT — false LA'],
        ['TT','>120 s (dabigatran) / normal (xa)','—','dabigatran → TT hugely ↑; anti-Xa DOACs spare TT'],
        ['Clot-based PC/PS & APCR','—','—','DOAC prolongs clot-based → spurious low activity / low ratio'],
        ['Chromogenic AT/PC','—','—','chromogenic usually OK, but check kit for heparin/DOAC adsorbent'],
        ['Free PS antigen (immuno)','—','—','antigen immunoassay unaffected by DOAC'],
        ['FVL PCR','—','genetics intact','DNA unaffected — use if APC-R needed while anticoagulated'],
      ], chips:['DOAC mimics LA & factor deficiency','Prefer DOAC-neutralized assay or hold before protein/LA testing','Antigen & DNA spared'], caption:'Modern trap: DOACs poison clot-based assays. A “new LA” or “new protein S deficiency” on apixaban is almost always the drug.'},
      pregnant:{name:'Pregnancy', rows:[
        ['Fibrinogen','5.2 g/L','↑ high (pregnancy)','physiologic 3rd-trimester ↑ (3.5–6 g/L)'],
        ['D-dimer','1.8 mg/L FEU','“elevated”','physiologically ↑ — D-dimer rule-out cutoffs not validated in pregnancy'],
        ['Free protein S','34%','↓ low','↑ C4bBP → ↓ free PS — physiologic; don’t diagnose deficiency in pregnancy'],
        ['APC resistance ratio','1.6','<2.0','acquired APCR of pregnancy (high FVIII, ↓ free PS) — not FVL'],
        ['AT','88%','often normal','may drift low; marked ↓ suggests pathology'],
        ['LA','—','defer if possible','acute-phase + hormonal shifts muddy interpretation'],
      ], chips:['Pregnancy physiology mimics thrombophilia','Test outside pregnancy for heritable proteins','D-dimer/LA/APCR unreliable'], caption:'Pregnancy is a thrombophilic physiology — free PS falls, APCR appears, fibrinogen/D-dimer soar — all back to baseline postpartum.'},
      liver:{name:'Cirrhosis', rows:[
        ['PT/INR','18 s / 1.8','↑ prolonged','↓ synthetic: II, VII, IX, X, fibrinogen, also ↓ anticoagulants — rebalanced!'],
        ['aPTT','40 s','↑','prolonged — yet clot risk not abolished'],
        ['Fibrinogen','1.3 g/L','↓ low','↓ synthetic + dysfibrinogenemia'],
        ['AT / PC / PS','42% / 38% / 40%','↓ low','↓ synthetic + consumption — not inherited deficiency'],
        ['D-dimer','1.2 mg/L','↑','↑ impaired clearance + low-grade DIC'],
        ['LA/FVL','—','—','LA interpret with caution; DNA still valid'],
      ], chips:['Rebalanced hemostasis — PT does ≠ bleeding risk','Low AT/PC/PS here is liver, not genetics'], caption:'Cirrhosis: “auto-anticoagulated” myth — pro- and anticoagulants both ↓; thrombosis still occurs. PT prolongation ≠ protection.'},
    };
    function render(k){
      const c=cases[k];
      tbody.innerHTML= c.rows.map(r=>`<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('');
      // highlight abnormal
      [...tbody.querySelectorAll('tr')].forEach(tr=>{
        const t0=tr.cells[1]?.textContent||'';
        if(t0.includes('↓')||t0.includes('>')||t0.includes('↑')||t0.includes('low')||t0.includes('high')) tr.style.background='rgba(255,138,91,.06)';
      });
      chips.innerHTML= c.chips.map(s=>`<span class="chip ${s.includes('Don')?'warn':s.includes('DOAC')?'bad':' '}">${s}</span>`).join('');
      caption.textContent=c.caption;
      $$('.case-btn').forEach(b=>b.classList.toggle('is-active', b.dataset.case===k));
    }
    $$('[data-case]').forEach(b=>b.addEventListener('click',()=>render(b.dataset.case)));
    render('normal');
    // also existing s8-reset button? map to normal
    $('#s8-reset')?.addEventListener('click',()=>render('normal'));
  })();

})();
