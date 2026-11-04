/* ==================================PELICULAS======================================= */
(function () {
  'use strict';

  if (typeof infoPeli === 'undefined') {
    console.error('peliculas.js: falta definir "infoPeli" en el HTML de la película.');
    return;
  }

  const m = infoPeli;
  const ROOT = '../../';                      
  const COLOR = '#1c1c1c';                     
  const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
                 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MAXD = 7;
  const EXTRA = 3;

  const $id = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let toastTimer;
  function toast(msg) {
    let t = $id('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), 2200);
  }


  /* ======================= PORTADA: AFICHE, TÍTULO, SINOPSIS ======================= */
  function drawHero() {
    document.title = m.t + ' | Cinemax';

    const bg = $id('mvBg');
    bg.style.background = COLOR;
    if (m.img) {
      bg.style.backgroundImage = 'url("' + ROOT + m.img + '")';
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center';
    }

    const poster = $id('mvPoster');
    poster.style.background = COLOR;
    poster.innerHTML = (m.r ? '<span class="rate">' + esc(m.r) + '</span>' : '') + esc(m.t);
    if (m.img) {
      const img = new Image();
      img.alt = 'Afiche de ' + m.t;
      img.onerror = () => img.remove();
      img.src = ROOT + m.img;
      poster.appendChild(img);
    }

    $id('mvTag').textContent = m.tag || 'En cartelera';
    $id('mvTit').textContent = m.t;
    $id('mvSin').textContent = m.sin || 'Sinopsis próximamente.';

    $id('mvPills').innerHTML =
      (m.r ? '<span class="mv-pill r">' + esc(m.r) + '</span>' : '') +
      [m.g, m.d, m.idioma].filter(Boolean).map((x) => '<span class="mv-pill">' + esc(x) + '</span>').join('');

    const trl = $id('mvTrailer');
    if (m.trailer && m.trailer !== '#') {
      trl.href = m.trailer;
      trl.target = '_blank';
      trl.rel = 'noopener';
    } else {
      trl.addEventListener('click', (e) => {
        e.preventDefault();
        toast('El tráiler todavía no está cargado');
      });
    }
  }


  /* ======================= FICHA TÉCNICA ======================= */
  function drawFicha() {
    const filas = [
      ['Director', m.dir], ['Estreno', m.f], ['Duración', m.d], ['Género', m.g],
      ['Clasificación', m.r], ['Idioma', m.idioma], ['Formato', m.formato]
    ].concat(m.extra || []).filter((a) => a[1]);

    let html = filas.map((a) =>
      '<div class="mv-item"><dt>' + esc(a[0]) + '</dt><dd>' + esc(a[1]) + '</dd></div>').join('');

    if (m.reparto && m.reparto.length) {
      html += '<div class="mv-item full"><dt>Reparto</dt><dd class="mv-chips">' +
        m.reparto.map((a) => '<span class="mv-chip">' + esc(a) + '</span>').join('') + '</dd></div>';
    }
    $id('mvInfo').innerHTML = html;
  }


  /* ======================= CALENDARIO, HORARIOS Y COMPRA ======================= */
  let sel = 0, selT = null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let inicio = hoy;
  if (m.desde) {
    const p = m.desde.split('-').map(Number);
    const d = new Date(p[0], p[1] - 1, p[2]);
    if (d > hoy) inicio = d;
  }
  const preventa = inicio > hoy;

  const addD = (n) => { const d = new Date(inicio); d.setDate(d.getDate() + n); return d; };
  const fecha = (d) => DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()];

  function drawDays() {
    $id('mvHint').textContent = preventa
      ? 'Preventa: las funciones comienzan el ' + fecha(addD(0)) + '. Por ahora puedes elegir hasta el ' +
        fecha(addD(MAXD - 1)) + '. Las demás fechas se liberan más adelante.'
      : 'Las entradas se habilitan con 7 días de anticipación: hoy puedes elegir hasta el ' +
        fecha(addD(MAXD - 1)) + '. Las demás fechas se liberan día a día.';
    let h = '';
    for (let i = 0; i < MAXD + EXTRA; i++) {
      const d = addD(i), lock = i >= MAXD, on = i === sel && !lock;
      h += '<button type="button" class="day' + (lock ? ' lock' : '') + (on ? ' on' : '') + '" data-d="' + i + '" aria-pressed="' + on + '">' +
           '<small>' + (i === 0 && !preventa ? 'Hoy' : DIAS[d.getDay()]) + '</small>' +
           '<b>' + d.getDate() + '</b>' +
           '<small>' + (lock ? 'Bloqueado' : MESES[d.getMonth()].slice(0, 3)) + '</small>' +
           '</button>';
    }
    $id('mvDays').innerHTML = h;
  }

  function drawTimes() {
    const horas = m.h || [];
    const n = new Date(), ahora = n.getHours() * 60 + n.getMinutes();
    const pasada = (x) => { const p = x.split(':').map(Number); return sel === 0 && !preventa && p[0] * 60 + p[1] <= ahora; };

    $id('mvTimes').innerHTML = horas.map((x) =>
      '<button type="button" data-t="' + x + '"' + (pasada(x) ? ' disabled' : '') + (x === selT ? ' class="on"' : '') + '>' + x + '</button>').join('');

    if (!horas.length) {
      $id('mvMsg').textContent = 'Todavía no hay funciones cargadas para esta película.';
    } else if (horas.every(pasada)) {
      $id('mvMsg').textContent = 'Ya no quedan funciones para hoy. Elige otro día.';
    }
  }

  function drawBuy() {
    $id('mvBuy').hidden = !selT;
    if (!selT) return;
    $id('mvBFn').textContent = fecha(addD(sel)) + ' · ' + selT;
    $id('mvBFm').textContent = m.formato || '';
    $id('mvBFmBox').hidden = !m.formato;
  }

  function drawFunciones() {
    selT = null;
    $id('mvMsg').textContent = '';
    drawDays();
    drawTimes();
    drawBuy();
  }

  $id('mvFun').addEventListener('click', (e) => {
    const d = e.target.closest('[data-d]');
    if (d) {
      const i = +d.dataset.d;
      if (i >= MAXD) {
        $id('mvMsg').textContent = preventa
          ? 'El ' + fecha(addD(i)) + ' todavía no está disponible. Por ahora puedes elegir hasta el ' + fecha(addD(MAXD - 1)) + '.'
          : 'El ' + fecha(addD(i)) + ' se libera el ' + fecha(addD(i - (MAXD - 1))) +
            '. Por ahora puedes comprar entradas hasta el ' + fecha(addD(MAXD - 1)) + '.';
        return;
      }
      sel = i;
      drawFunciones();
      return;
    }

    const t = e.target.closest('[data-t]');
    if (t && !t.disabled) {
      selT = t.dataset.t;
      drawTimes();
      drawBuy();
      $id('mvBuy').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    if (e.target.closest('#mvGo')) {
      const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const datos = new URLSearchParams({
        peli: m.t,
        fecha: iso(addD(sel)),
        hora: selT,
        volver: location.pathname.split('/').pop()
      });
      location.href = '../compras/entradas.html?' + datos.toString();
    }
  });


  /* ======================= CARRUSEL ======================= */
  function initCarrusel() {
    const track = $id('mvTrack');
    if (!track || typeof CART === 'undefined') return;

    const COLS = ['#261012', '#1c1c1c', '#2a1214', '#181818', '#231315', '#2a0a0c'];
    const actual = location.pathname.split('/').pop().toLowerCase();
    const archivo = (c) => c.url.split('/').pop().toLowerCase();

    const card = (c, i) =>
      '<a class="mc' + (archivo(c) === actual ? ' cur' : '') + '" href="' + ROOT + c.url + '">' +
        '<div class="mp" style="background:' + COLS[i % COLS.length] + '">' +
          '<span class="rate">' + esc(c.r) + '</span>' + esc(c.t) +
          (c.img ? '<img src="' + ROOT + c.img + '" alt="Afiche de ' + esc(c.t) + '" loading="lazy" onerror="this.remove()">' : '') +
        '</div>' +
        '<p class="mm">' + esc(c.g) + ' · ' + esc(c.d) + '</p>' +
        '<span class="now">Estás viendo esta</span>' +
      '</a>';

    track.innerHTML = CART.concat(CART.slice(0, 5)).map(card).join('');

    let ci = 0, busy = false, timer;
    const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const paso = () => track.children[0].offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 18);

    function mover(i, anim) {
      track.classList.toggle('no', !anim);
      ci = i;
      track.style.transform = 'translateX(' + (-i * paso()) + 'px)';
    }
    function sig() {
      if (busy) return;
      busy = true;
      mover(ci + 1, true);
      setTimeout(() => { if (ci >= CART.length) mover(0, false); busy = false; }, 640);
    }
    function ant() {
      if (busy) return;
      busy = true;
      if (ci === 0) { mover(CART.length, false); void track.offsetWidth; }
      mover(ci - 1, true);
      setTimeout(() => { busy = false; }, 640);
    }
    function auto() {
      clearInterval(timer);
      if (!reducir) timer = setInterval(sig, 3000);
    }

    $id('mvNext').onclick = () => { sig(); auto(); };
    $id('mvPrev').onclick = () => { ant(); auto(); };
    window.addEventListener('resize', () => mover(ci, false));
    auto();
  }

  drawHero();
  drawFicha();
  drawFunciones();
  initCarrusel();
})();
