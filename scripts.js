document.addEventListener('DOMContentLoaded', () => {

  /* ---------- SCROLLSPY: highlight active nav section ---------- */
  const navLinks = document.querySelectorAll('.index-nav a');
  const sections = document.querySelectorAll('.section');

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const link = document.querySelector(`.index-nav a[data-target="${id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });

  sections.forEach(section => spyObserver.observe(section));

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  sections.forEach(section => revealObserver.observe(section));

  /* ---------- SMOOTH NAV CLICK (also works without CSS scroll-behavior support) ---------- */
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- PRINT / EXPORT ---------- */
  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      // make sure everything is visible before printing
      sections.forEach(s => s.classList.add('in-view'));
      window.print();
    });
  }

});
