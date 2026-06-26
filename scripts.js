document.addEventListener('DOMContentLoaded', () => {

  /* ── PARTICLE MESH BACKGROUND ── */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  const PARTICLE_COUNT = 72;
  const CONNECTION_DIST = 140;
  const ACCENT = '124,140,255';

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.5,
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    // connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.35;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${ACCENT},${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    // dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT},0.55)`;
      ctx.fill();
    });
  }

  function updateParticles() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
  }

  function animate() {
    updateParticles();
    drawParticles();
    requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();
  window.addEventListener('resize', () => { resize(); createParticles(); });

  /* ── TYPEWRITER ── */
  const tw = document.getElementById('typewriter');
  const full = 'Hossein Salimi';
  let idx = 0;
  function type() {
    if (idx <= full.length) {
      tw.textContent = full.slice(0, idx++);
      setTimeout(type, 70);
    }
  }
  setTimeout(type, 300);

  /* ── SCROLL REVEAL ── */
  const sections = document.querySelectorAll('.section');
  const entries  = document.querySelectorAll('.entry');

  const revealObs = new IntersectionObserver(els => {
    els.forEach(el => {
      if (el.isIntersecting) { el.target.classList.add('in-view'); revealObs.unobserve(el.target); }
    });
  }, { threshold: 0.1 });

  sections.forEach(s => revealObs.observe(s));
  entries.forEach(e => revealObs.observe(e));

  /* ── SCROLLSPY ── */
  const navLinks = document.querySelectorAll('.index-nav a');
  const spyObs = new IntersectionObserver(els => {
    els.forEach(el => {
      if (el.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.index-nav a[data-target="${el.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -65% 0px' });
  sections.forEach(s => spyObs.observe(s));

  /* ── SMOOTH NAV ── */
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const target = document.getElementById(link.dataset.target);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* ── 3D TILT ON STACK CARDS ── */
  document.querySelectorAll('.layer[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const rx = ((e.clientY - cy) / (rect.height / 2)) * 5;
      const ry = ((e.clientX - cx) / (rect.width  / 2)) * -5;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    });
  });

  /* ── PRINT ── */
  document.getElementById('printBtn').addEventListener('click', () => {
    sections.forEach(s => s.classList.add('in-view'));
    entries.forEach(e => e.classList.add('in-view'));
    window.print();
  });

});
