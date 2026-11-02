const $ = (s) => document.querySelector(s);

// Si la página está dentro de paginas/ las rutas necesitan "../"; dentro de paginas/peliculas/, "../../"
const BASE = location.pathname.includes('/paginas/peliculas/') ? '../../'
           : location.pathname.includes('/paginas/') ? '../' : '';

// Colores de fondo de los afiches (se ven mientras carga la imagen). Los usan la cartelera y las preventas.
const cols = ['#1c1c1c', '#261012', '#181818', '#2a1214', '#231315', '#2a0a0c'];


/* ======================= PRESENTACIÓN (carrusel) ======================= */
if ($('#sVid')) {

  // Película de cada diapositiva. v = ruta del video (sin audio)
  const S = [
    { tag: 'En preventa', t: 'Avengers Doomsday', i: 'Ciencia Ficción · 2 h 50 min · +16',
      p: 'Necesitamos un milagro..',
      c: '#2a0a0c', v: 'audio-video/lv_0_20261002205734.mp4' },
    { tag: 'Estreno', t: 'LA NOCHE DEL DEMONIO: ESTÁN ENTRE NOSOTROS', i: 'Terror · 1 h 47 min · +16',
      p: 'Gemma, una joven madre, descubre que puede viajar al Más Allá y, lo más peligroso, traer almas de vuelta. Cuando los demonios que la acechan descubren este poder, deciden invadir el mundo real.',
      c: '#1c1c1c', v: 'audio-video/lv_0_20261002210715.mp4' },
    { tag: 'Preventa abierta', t: 'DUNA: PARTE TRES', i: 'Ciencia Ficción · 2 h 30 min · Estreno 17 dic',
      p: 'Paul Atreides, convertido en un despiadado Emperador casi dos décadas después de tomar el poder, enfrenta las letales consecuencias de su reinado.',
      c: '#231315', v: 'audio-video/lv_0_20261002212449.mp4' }
  ];

  const DURACION = 10500;   // tiempo por película en milisegundos
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
    V.src = BASE + s.v;
    if (!RM) { const p = V.play(); if (p) p.catch(() => {}); }

    // Reinicia la barra de tiempo
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

  // Avance automático
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
}


/* ======================= LISTA DE PELÍCULAS EN CARTELERA =======================
   La usan la cartelera (tarjetas) y el carrusel "Más en cartelera" de cada película.
   url = ruta desde la raíz del proyecto (cada página le antepone su BASE).
   Aquí van solo los datos de la tarjeta; la información completa vive en el HTML de cada película. */
const CART = [
  { t: 'El gato con sombrero', g: 'Animación', r: 'ATP', d: '1 h 31 min', h: ['16:30', '19:00', '21:45'], img: 'img/Cartelera/El_gato_con_sombrero.webp', url: 'paginas/peliculas/gato-sombrero.html' },
  { t: 'Spider-man: un nuevo día', g: 'Acción', r: '+13', d: '2 h 30 min', h: ['15:00', '18:15', '21:00'], img: 'img/Cartelera/spider-man.avif', url: 'paginas/peliculas/Spider-man.html' },
  { t: 'Resident evil: noche cero', g: 'Terror', r: '+16', d: '1 h 34 min', h: ['17:00', '20:30', '23:00'], img: 'img/Cartelera/resident-evil.jfif', url: 'paginas/peliculas/resident-evil.html' },
  { t: 'Coyote vs acme', g: 'Comedia', r: 'ATP', d: '1 h 50 min', h: ['14:30', '17:30', '20:15'], img: 'img/Cartelera/Coyote-vs-acme.webp', url: 'paginas/peliculas/coyote-vs-acme.html' },
  { t: 'La noche del demonio: están entre nosotros', g: 'Terror', r: '+16', d: '1 h 46 min', h: ['18:00', '20:45', '23:15'], img: 'img/Cartelera/la-noche-del-demonio.jfif', url: 'paginas/peliculas/noche-demonio.html' },
  { t: 'Godzilla minus zero', g: 'Ciencia Ficción', r: '+16', d: '1 h 38 min', h: ['15:30', '18:00', '20:30'], img: 'img/Cartelera/godzilla-minus-zero.webp', url: 'paginas/peliculas/Godzilla-MZ.html' },
  { t: 'Vertigo: punto muerto', g: 'Thriller', r: '+13', d: '2 h 05 min', h: ['15:30', '18:00', '20:30'], img: 'img/Cartelera/vertigo2.jpg', url: 'paginas/peliculas/vertigo.html' },
  { t: 'Avengers: endgame encore', g: 'Ciencia Ficción', r: '+13', d: '3 h 05 min', h: ['15:30', '18:00', '20:30'], img: 'img/Cartelera/avengers-endgame-encore.png', url: 'paginas/peliculas/Avengers-EE.html' },
  { t: 'Clayface', g: 'Terror', r: '+16', d: '2 h 00 min', h: ['15:30', '18:00', '20:30'], img: 'img/Cartelera/clayface.webp', url: 'paginas/peliculas/Clayface.html' }
];


/* ======================= CARTELERA ======================= */
if ($('#cart')) {

  let gen = 'Todas'; // género seleccionado

  // Dibuja las tarjetas según el género elegido
  function drawCart() {
    const lista = CART.filter(m => gen === 'Todas' || m.g === gen);
    $('#cart').innerHTML = lista.length
      ? lista.map((m, i) => `
          <div class="col s6 m4 l3">
            <div class="card hoverable movie-card" data-url="${m.url}" style="cursor: pointer;">
              <div class="card-image cx-poster" style="background:${cols[i % cols.length]}">
                ${m.img ? `<img src="${BASE}${m.img}" alt="Afiche de ${m.t}" loading="lazy" onerror="this.remove()">` : ''}
                <span class="cx-rate">${m.r}</span>
              </div>
              <div class="card-content">
                <span class="card-title">${m.t}</span>
                <p>${m.g} · ${m.d}</p>
              </div>
              <div class="card-action">
                ${m.h.map(x => `<span class="chip cx-time">${x}</span>`).join('')}
              </div>
            </div>
          </div>`).join('')
      : '<div class="col s12"><p class="cx-empty">No hay películas de este género por ahora.</p></div>';
  }

  // Dibuja los chips de género
  function drawGen() {
    const generos = ['Todas', ...new Set(CART.map(m => m.g))];
    $('#gen').innerHTML = generos.map(g =>
      `<button type="button" class="chip${g === gen ? ' active' : ''}" data-g="${g}" aria-pressed="${g === gen}">${g}</button>`).join('');
  }

  // Al hacer clic en un género, filtra las películas
  $('#gen').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    gen = b.dataset.g;
    drawGen();
    drawCart();
  });

  // Evento para hacer clic en la tarjeta y abrir su página correspondiente
  $('#cart').addEventListener('click', (e) => {
    const card = e.target.closest('.movie-card');
    if (!card) return;

    // Si hacen clic en un horario, evitamos que abra la página (opcional)
    if (e.target.closest('.cx-time')) return;

    const movieUrl = card.dataset.url;
    
    // Redirige a la página específica de esa película usando el BASE correcto
    window.location.href = BASE + movieUrl;
  });

  drawGen();
  drawCart();
}


/* ======================= PREVENTAS ======================= */
if ($('#pre')) {

  // t = título, g = género, d = duración, f = fecha de estreno,
  // h = primera función, img = afiche (opcional)
  const PRE = [
    { t: 'Avengers Doomsday', g: 'Ciencia Ficción', d: '2 h 50 min', f: '16 dic', h: '18:00',
      img: 'img/Cartelera/preventa/avengers-doomsday.webp',
      url: 'paginas/peliculas/Avengers-D.html' },
    { t: 'Duna: Parte Tres', g: 'Ciencia Ficción', d: '2 h 30 min', f: '17 dic', h: '17:30',
      img: 'img/Cartelera/preventa/duna-parte-tres.jfif',
      url: 'paginas/peliculas/Duna-PT.html' }
  ];

  // Dibuja las tarjetas de preventa (Materialize: card horizontal)
  function drawPre() {
    $('#pre').innerHTML = PRE.map((m, i) => `
      <div class="col s12 l6">
        <div class="card horizontal cx-pre">
          <div class="card-image" style="background:${cols[(i * 3) % cols.length]}">
            ${m.img ? `<img src="${BASE}${m.img}" alt="Afiche de ${m.t}" loading="lazy" onerror="this.remove()">` : ''}
          </div>
          <div class="card-stacked">
            <div class="card-content">
              <span class="chip cx-badge">Preventa abierta</span>
              <span class="card-title">${m.t}</span>
              <p>${m.g} · ${m.d}</p>
              <p>Estreno ${m.f} · Funciones desde ${m.h}</p>
            </div>
            <div class="card-action">
              <a class="btn waves-effect waves-light" href="${BASE}${m.url}">
                <i class="material-icons left">confirmation_number</i>Reservar entradas
              </a>
            </div>
          </div>
        </div>
      </div>`).join('');
  }

  drawPre();
}


/* ======================= MATERIALIZE ======================= */
// Menú lateral (sidenav): el nav se convierte en sidebar en celular y tablet
if (window.M) {
  M.Sidenav.init(document.querySelectorAll('.sidenav'));
}

