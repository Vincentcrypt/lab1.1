

// Помечаем, что JS работает (без него reveal-элементы просто видимы)
document.documentElement.classList.add('js');
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Фон меню при прокрутке + индикатор прогресса
const nav = $('.nav'), bar = $('.progress');
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    nav.classList.toggle('scrolled', scrollY > 10);
    const doc = document.documentElement;
    const max = doc.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    ticking = false;
  });
}, { passive: true });

// Мобильное меню
const burger = $('#burger'), links = $('#navLinks');
const closeMenu = () => {
  links.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
};
burger.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
});
$$('.nav-link').forEach(a => a.addEventListener('click', closeMenu));

// Появление блоков при прокрутке
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealIO.unobserve(e.target); }
  });
}, { threshold: .15 });
$$('.reveal').forEach(el => revealIO.observe(el));

// Подсветка активного пункта меню
const sectionIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    $$('.nav-link').forEach(a =>
      a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => sectionIO.observe(s));

// Анимированные счётчики в статистике
const countIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    const el = e.target, end = +el.dataset.count;
    if (reduceMotion) { el.textContent = end; return; }
    const t0 = performance.now(), dur = 1200;
    const step = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}, { threshold: .6 });
$$('[data-count]').forEach(el => countIO.observe(el));

// Лёгкий 3D-наклон код-карточки за курсором (только мышь, без reduce-motion)
const card = $('#codeCard');
if (card && matchMedia('(pointer: fine)').matches && !reduceMotion) {
  const zone = card.parentElement;
  zone.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  });
  zone.addEventListener('pointerleave', () => { card.style.transform = ''; });
}

$('#year').textContent = new Date().getFullYear();