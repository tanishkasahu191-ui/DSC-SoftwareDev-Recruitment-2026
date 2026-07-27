  // ---- Dark/Light mode (persisted) ----
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const savedTheme = localStorage.getItem('codegrid-theme');
  if(savedTheme){ body.setAttribute('data-theme', savedTheme); }
  themeToggle.addEventListener('click', () => {
    const next = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', next);
    localStorage.setItem('codegrid-theme', next);
  });

  // ---- Mobile menu ----
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  // ---- Countdown timer (fixed event date) ----
  const eventDate = new Date('2026-09-20T09:00:00');

  function updateCountdown(){
    const now = new Date();
    let diff = eventDate - now;
    if(diff < 0) diff = 0;
    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff / (1000*60*60)) % 24);
    const mins = Math.floor((diff / (1000*60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    document.getElementById('cd-days').textContent = String(days).padStart(2,'0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2,'0');
    document.getElementById('cd-mins').textContent = String(mins).padStart(2,'0');
    document.getElementById('cd-secs').textContent = String(secs).padStart(2,'0');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ---- Scroll reveal + timeline trace ----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.reveal, .t-item').forEach(el => observer.observe(el));

  // ---- Form validation ----
  const form = document.getElementById('regForm');
  const fields = {
    name: { el: document.getElementById('name'), validate: v => v.trim().length > 1 },
    lead: { el: document.getElementById('lead'), validate: v => v.trim().length > 1 },
    size: { el: document.getElementById('size'), validate: v => v !== '' },
    email: { el: document.getElementById('email'), validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    phone: { el: document.getElementById('phone'), validate: v => /^\d{10}$/.test(v) },
    track: { el: document.getElementById('track'), validate: v => v !== '' }
  };

  function setFieldState(key, valid){
    document.getElementById('f-' + key).classList.toggle('invalid', !valid);
  }

  Object.keys(fields).forEach(key => {
    fields[key].el.addEventListener('input', () => {
      setFieldState(key, fields[key].validate(fields[key].el.value));
    });
    fields[key].el.addEventListener('change', () => {
      setFieldState(key, fields[key].validate(fields[key].el.value));
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let allValid = true;
    Object.keys(fields).forEach(key => {
      const valid = fields[key].validate(fields[key].el.value);
      setFieldState(key, valid);
      if(!valid) allValid = false;
    });
    if(allValid){
      document.getElementById('successModal').classList.add('show');
      form.reset();
      Object.keys(fields).forEach(key => setFieldState(key, true));
    } else {
      const firstInvalid = form.querySelector('.invalid input, .invalid select');
      if(firstInvalid) firstInvalid.focus();
    }
  });

  // ---- Success modal close ----
  const successModal = document.getElementById('successModal');
  document.getElementById('modalClose').addEventListener('click', () => successModal.classList.remove('show'));
  successModal.addEventListener('click', (e) => { if(e.target === successModal) successModal.classList.remove('show'); });

  // ---- Stats counter (animate on scroll into view) ----
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const duration = 1200;
        const steps = 40;
        const increment = target / steps;
        const stepTime = duration / steps;
        const timer = setInterval(() => {
          current += increment;
          if(current >= target){
            current = target;
            clearInterval(timer);
          }
          el.textContent = prefix + Math.floor(current) + suffix;
        }, stepTime);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => statObserver.observe(el));

  // ---- Hero particle background ----
  (function initParticles(){
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    const hero = document.getElementById('home');
    let particles = [];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize(){
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
    function makeParticles(){
      const count = Math.floor((canvas.width * canvas.height) / 22000);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.6,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.5 + 0.15
      }));
    }
    function draw(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isLight = document.body.getAttribute('data-theme') === 'light';
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0) p.x = canvas.width; if(p.x > canvas.width) p.x = 0;
        if(p.y < 0) p.y = canvas.height; if(p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? `rgba(20,21,44,${p.alpha * 0.5})` : `rgba(242,169,59,${p.alpha})`;
        ctx.fill();
      });
      if(!reduceMotion) requestAnimationFrame(draw);
    }
    resize();
    makeParticles();
    draw();
    window.addEventListener('resize', () => { resize(); makeParticles(); });
  })();
