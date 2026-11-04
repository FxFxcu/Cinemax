/* ==========================================================================
   BUTACAS.JS — PASO 2: ELEGIR LAS BUTACAS
   Recibe por la URL lo elegido antes (película, fecha, horario, formato y tipo
   de butaca) y usa los precios de precios.js.
   ?peli=...&fecha=2026-11-03&hora=18:15&volver=Spider-man.html&formato=3D&butaca=D-BOX
   ========================================================================== */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const dinero = n => '$' + n.toLocaleString('es-AR');
  const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  /* ---------- Datos que llegan por la URL (se validan) ---------- */
  const q = new URLSearchParams(location.search);
  const peli = q.get('peli');
  const fechaP = /^(\d{4})-(\d{2})-(\d{2})$/.exec(q.get('fecha') || '');
  const hora = /^\d{2}:\d{2}$/.test(q.get('hora') || '') ? q.get('hora') : '';
  const volver = /^[\w-]+\.html$/.test(q.get('volver') || '') ? q.get('volver') : '';
  const fmt = Object.prototype.hasOwnProperty.call(PRECIO_FORMATO, q.get('formato')) ? q.get('formato') : '2D';
  const dbox = q.get('butaca') === 'D-BOX';

  if (!peli || !fechaP || !hora) {
    $('#bBody').innerHTML =
      '<div class="head"><p class="eyebrow">Paso 2 · Butacas</p><h1>Primero elige una función</h1>' +
      '<p class="fn">Elige la película, la fecha y el horario para continuar con tu compra.</p>' +
      '<p style="margin-top:22px"><a class="go" style="display:inline-block;width:auto" href="../cartelera.html">Ir a la cartelera</a></p></div>';
    return;
  }

  const f = new Date(+fechaP[1], +fechaP[2] - 1, +fechaP[3]);
  const cuando = DIAS[f.getDay()] + ' ' + f.getDate() + ' de ' + MESES[f.getMonth()] + ' · ' + hora;
  const tipoTxt = dbox ? 'Butaca D-BOX' : 'Butaca simple';

  document.title = 'Cinemax | Butacas para ' + peli;
  $('#rPeli').textContent = peli;
  $('#rCuando').textContent = cuando;
  [peli, DIAS[f.getDay()] + ' ' + f.getDate() + ' de ' + MESES[f.getMonth()], hora, fmt, tipoTxt].forEach(t => {
    const s = document.createElement('span'); s.textContent = t; $('#fnChips').appendChild(s);
  });

  // Datos que viajan de una página a otra
  const base = new URLSearchParams();
  ['peli', 'fecha', 'hora', 'volver'].forEach(k => { if (q.get(k)) base.set(k, q.get(k)); });
  base.set('formato', fmt);
  base.set('butaca', dbox ? 'D-BOX' : 'Simple');
  $('#back').href = 'entradas.html?' + base.toString();


  /* ---------- La sala ---------- */
  // Filas A-F (cerca de la pantalla): 6 filas de 18 butacas, solo en el centro, porque la
  // entrada a la sala está en los costados. Filas G-N: 8 filas de 24 (3 + 18 + 3).
  // Total: 6 x 18 + 8 x 24 = 300 butacas.
  const FILAS = 'ABCDEFGHIJKLMN'.split('');
  const FRENTE = 6, CENTRO = 18, LADO = 3, MAX = 8;
  const esDbox = id => 'GH'.includes(id[0]);                    // filas G y H: D-BOX
  const cant = fila => FILAS.indexOf(fila) < FRENTE ? CENTRO : CENTRO + 2 * LADO;

  // Butacas ocupadas: salen de la función (película + día + hora), así no cambian al recargar
  function semilla(txt) { let h = 2166136261; for (const c of txt) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
  function azar(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const r = azar(semilla(peli + '|' + q.get('fecha') + '|' + hora));
  const ocupadas = new Set();
  FILAS.forEach(fila => { for (let c = 1; c <= cant(fila); c++) if (r() < 0.28) ocupadas.add(fila + c); });
  ['C8', 'C9', 'C10', 'C11', 'D9', 'D10'].forEach(x => ocupadas.delete(x));

  // Según el tipo de butaca elegido en el paso anterior, solo se pueden usar unas filas
  const bloqueada = id => dbox ? !esDbox(id) : esDbox(id);
  const precio = id => PRECIO_FORMATO[fmt] + (esDbox(id) ? EXTRA_DBOX : 0);

  $('#aviso').textContent = dbox
    ? 'Elegiste butaca D-BOX: solo están habilitadas las filas G y H. Si quieres otra butaca, vuelve al paso anterior.'
    : 'Elegiste butaca simple: las filas G y H (D-BOX) no están disponibles. Si las quieres, vuelve al paso anterior.';

  let h = '';
  FILAS.forEach((fila, i) => {
    const frente = i < FRENTE;
    let n = 0;
    const butaca = () => {
      n++;
      const id = fila + n, oc = ocupadas.has(id), bl = bloqueada(id);
      const estado = oc ? 'ocupada' : bl ? 'no disponible' : esDbox(id) ? 'D-BOX, premium' : 'simple';
      return '<button type="button" class="seat' + (esDbox(id) ? ' pr' : '') + (oc ? ' occ' : '') + (!oc && bl ? ' blk' : '') +
        '" data-id="' + id + '"' + (oc || bl ? ' disabled' : '') + ' aria-pressed="false" aria-label="Fila ' + fila + ', butaca ' + n + ', ' + estado + '"></button>';
    };
    const lado = () => Array.from({ length: LADO }, butaca).join('');
    const entrada = () => '<span class="ent">' + (i === 2 ? 'ENTRADA' : '') + '</span>';
    if (fila === 'G') h += '<div class="zona">D-BOX · BUTACAS CON MOVIMIENTO</div>';
    h += '<div class="sr"><span class="rl">' + fila + '</span><div class="seats">';
    h += frente ? entrada() : lado();
    h += '<span class="sgap"></span>';
    for (let c = 0; c < CENTRO; c++) h += butaca();
    h += '<span class="sgap"></span>';
    h += frente ? entrada() : lado();
    h += '</div><span class="rl">' + fila + '</span></div>';
  });
  $('#map').innerHTML = h;


  /* ---------- La selección ---------- */
  const sel = new Set();

  // Si se vuelve desde el candy, se recuperan las butacas elegidas
  (q.get('asientos') || '').split(',').forEach(id => {
    if (!/^[A-N]\d{1,2}$/.test(id)) return;
    const b = document.querySelector('.seat[data-id="' + id + '"]');
    if (b && !b.disabled && sel.size < MAX) sel.add(id);
  });

  const ordenar = ids => ids.sort((a, b) => a[0] === b[0] ? parseInt(a.slice(1)) - parseInt(b.slice(1)) : a[0].localeCompare(b[0]));

  function dibujar() {
    const ids = ordenar([...sel]);

    $('#list').innerHTML = ids.length
      ? ids.map(id =>
          '<li><span><b>' + id[0] + ' · butaca ' + id.slice(1) + '</b><small>' + (esDbox(id) ? 'D-BOX' : 'Simple') + '</small></span>' +
          '<span class="pr">' + dinero(precio(id)) +
          '<button type="button" class="x" data-x="' + id + '" aria-label="Quitar butaca ' + id + '">×</button></span></li>').join('')
      : '<li class="vacia">Toca una butaca libre del mapa para elegirla.</li>';

    $('#total').textContent = dinero(ids.reduce((s, id) => s + precio(id), 0));
    $('#cnt').textContent = ids.length;

    document.querySelectorAll('.seat[data-id]').forEach(b => {
      const on = sel.has(b.dataset.id);
      b.classList.toggle('sel', on);
      b.setAttribute('aria-pressed', on);
    });

    // "Continuar": solo funciona con al menos una butaca
    const go = $('#go');
    const datos = new URLSearchParams(base);
    datos.set('asientos', ids.join(','));
    go.setAttribute('aria-disabled', ids.length ? 'false' : 'true');
    go.tabIndex = ids.length ? 0 : -1;
    go.href = ids.length ? 'candy.html?' + datos.toString() : '#';
  }

  let aviso;
  function limite() {
    $('#lim').textContent = 'Puedes elegir hasta ' + MAX + ' butacas por compra.';
    clearTimeout(aviso);
    aviso = setTimeout(() => { $('#lim').textContent = ''; }, 2500);
  }

  // Elegir o quitar una butaca
  $('#bBody').addEventListener('click', e => {
    const b = e.target.closest('.seat[data-id]'), x = e.target.closest('[data-x]');
    if (b && !b.disabled) {
      const id = b.dataset.id;
      if (sel.has(id)) sel.delete(id);
      else if (sel.size >= MAX) { limite(); return; }
      else sel.add(id);
      dibujar();
    }
    if (x) { sel.delete(x.dataset.x); dibujar(); }
    if (e.target.closest('#go') && $('#go').getAttribute('aria-disabled') === 'true') e.preventDefault();
  });

  dibujar();
})();
