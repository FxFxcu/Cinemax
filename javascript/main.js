const $ = (s) => document.querySelector(s);

/* ======================= PRESENTACIÓN (carrusel) ======================= */

// Película de cada diapositiva. v = ruta del video (sin audio)
const S = [
  { tag: 'En preventa', t: 'Avengers Doomsday', i: 'Ciencia Ficción · 2 h 50 min · +16',
    p: 'Necesitamos un milagro..',
    c: '#2a0a0c', v: 'AUDIO-VIDEO/lv_0_20261002205734.mp4' },
  { tag: 'Estreno', t: 'LA NOCHE DEL DEMONIO: ESTÁN ENTRE NOSOTROS', i: 'Terror · 1 h 47 min · +16',
    p: 'Gemma , una joven madre, descubre que puede viajar al Más Allá y, lo más peligroso, traer almas de vuelta. Cuando los demonios que la acechan descubren este poder, deciden invadir el mundo real.',
    c: '#1c1c1c', v: 'AUDIO-VIDEO/lv_0_20261002210715.mp4' },
  { tag: 'Preventa abierta', t: 'DUNA: PARTE TRES', i: 'Ciencia Ficción · 2 h 30 min · Estreno 17 ndic',
    p: 'Paul Atreides, convertido en un despiadado Emperador casi dos décadas después de tomar el poder, enfrenta las letales consecuencias de su reinado.',
    c: '#231315', v: 'AUDIO-VIDEO/lv_0_20261002212449.mp4' }
];

const DURACION = 10500;   // 10 segundos por película
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const V = $('#sVid');
let idx = 0, timer, swap;

// Puntos del carrusel
$('#dots').innerHTML = S.map((_, i) =>
  `<button aria-label="Ir a la película ${i + 1}" data-i="${i}"></button>`).join('');

// El video nunca se queda pausado
V.addEventListener('playing', () => V.classList.add('on'));
V.addEventListener('error', () => V.classList.remove('on'));
V.addEventListener('pause', () => { if (!V.ended && !RM) V.play().catch(() => {}); });

// Carga la información y el video de la película actual
function fill() {
  const s = S[idx];
  $('#sTag').textContent = s.tag;
  $('#sTit').textContent = s.t;
  $('#sInf').textContent = s.i;
  $('#sTxt').textContent = s.p;
  $('#sArt').style.background = s.c;
  $('#sName').textContent = s.t;

  V.classList.remove('on');
  V.muted = true;
  V.volume = 0;
  V.src = s.v;
  if (!RM) { const p = V.play(); if (p) p.catch(() => {}); }

  // Reinicia la barra de 10 segundos
  const bar = $('#sBar');
  bar.classList.remove('run');
  void bar.offsetWidth;
  if (!RM) bar.classList.add('run');

  document.querySelectorAll('#dots button')
    .forEach((d, k) => d.setAttribute('aria-current', k === idx));
}

// Cambia de película con una transición de aparición y desaparición
function show(i, first) {
  idx = (i + S.length) % S.length;   // después de la última vuelve a la primera
  const sl = document.querySelector('.slide');
  clearTimeout(swap);
  if (first || RM) { fill(); return; }
  sl.classList.add('out');
  swap = setTimeout(() => { fill(); sl.classList.remove('out'); }, 400);
}

// Avance automático cada 10 segundos
function auto() {
  clearInterval(timer);
  if (!RM) timer = setInterval(() => show(idx + 1), DURACION);
}

$('#prev').onclick = () => { show(idx - 1); auto(); };
$('#next').onclick = () => { show(idx + 1); auto(); };
$('#dots').onclick = (e) => {
  const b = e.target.closest('button');
  if (b) { show(+b.dataset.i); auto(); }
};

show(0, true);
auto();
