document.addEventListener('DOMContentLoaded', () => {

  /* ── PARTICLE MESH ── */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles;
  const COUNT = 72, DIST = 140, C = '124,140,255';

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function mkParticles() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-.5)*.35, vy: (Math.random()-.5)*.35,
      r: Math.random()*1.6+.5
    }));
  }
  function draw() {
    ctx.clearRect(0,0,W,H);
    for (let i=0;i<particles.length;i++) {
      for (let j=i+1;j<particles.length;j++) {
        const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
        const d=Math.hypot(dx,dy);
        if (d<DIST) {
          ctx.beginPath();
          ctx.strokeStyle=`rgba(${C},${(1-d/DIST)*.32})`;
          ctx.lineWidth=.7;
          ctx.moveTo(particles[i].x,particles[i].y);
          ctx.lineTo(particles[j].x,particles[j].y);
          ctx.stroke();
        }
      }
    }
    particles.forEach(p=>{
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${C},.55)`; ctx.fill();
    });
  }
  function tick() { particles.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1; }); draw(); requestAnimationFrame(tick); }
  resize(); mkParticles(); tick();
  window.addEventListener('resize',()=>{ resize(); mkParticles(); });

  /* ── TYPEWRITER ── */
  const tw = document.getElementById('typewriter');
  let twT = null;
  function typewrite(name) {
    clearTimeout(twT); tw.textContent=''; let i=0;
    (function t(){ tw.textContent=name.slice(0,i++); if(i<=name.length) twT=setTimeout(t,65); })();
  }

  /* ── LANG SWITCH ── */
  const EN='en', FA='fa';
  let lang = localStorage.getItem('resumeLang') || EN;

  function applyLang(l) {
    lang = l;
    localStorage.setItem('resumeLang', l);
    document.documentElement.setAttribute('lang', l);
    document.documentElement.setAttribute('dir', l===FA ? 'rtl' : 'ltr');
    document.body.classList.toggle('fa', l===FA);

    // update all translatable text nodes (skip elements with child elements)
    document.querySelectorAll('[data-en][data-fa]').forEach(el => {
      const val = el.getAttribute('data-'+l);
      if (val === null) return;
      // only swap if element has no element children (pure text node holder)
      if (el.children.length === 0) el.textContent = val;
    });

    typewrite(l===FA ? 'حسین سلیمی' : 'Hossein Salimi');

    // update toggle label
    const btn = document.getElementById('langToggle');
    btn.textContent = l===FA ? 'EN' : 'FA';
  }

  document.getElementById('langToggle').addEventListener('click', () => {
    applyLang(lang===EN ? FA : EN);
  });

  applyLang(lang);

  /* ── SCROLL REVEAL ── */
  const revealObs = new IntersectionObserver(els => {
    els.forEach(el => { if(el.isIntersecting){ el.target.classList.add('in-view'); revealObs.unobserve(el.target); } });
  }, { threshold:.1 });
  document.querySelectorAll('.section, .entry').forEach(el => revealObs.observe(el));

  /* ── SCROLLSPY ── */
  const navLinks = document.querySelectorAll('.index-nav a');
  const spyObs = new IntersectionObserver(els => {
    els.forEach(el => {
      if (el.isIntersecting) {
        navLinks.forEach(l=>l.classList.remove('active'));
        const lk = document.querySelector(`.index-nav a[data-target="${el.target.id}"]`);
        if (lk) lk.classList.add('active');
      }
    });
  }, { rootMargin:'-20% 0px -65% 0px' });
  document.querySelectorAll('.section').forEach(s=>spyObs.observe(s));

  /* ── SMOOTH NAV ── */
  navLinks.forEach(lk => {
    lk.addEventListener('click', e => {
      const t = document.getElementById(lk.dataset.target);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });
  });

  /* ── 3D TILT ── */
  document.querySelectorAll('.layer[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r=card.getBoundingClientRect();
      const rx=((e.clientY-r.top-r.height/2)/(r.height/2))*5;
      const ry=((e.clientX-r.left-r.width/2)/(r.width/2))*-5;
      card.style.transform=`perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
    });
    card.addEventListener('mouseleave',()=>{ card.style.transform=''; });
  });

  /* ── PRINT ── */
  document.getElementById('printBtn').addEventListener('click', () => {
    document.querySelectorAll('.section,.entry').forEach(el=>el.classList.add('in-view'));
    window.print();
  });

});
