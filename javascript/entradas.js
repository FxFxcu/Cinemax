/* ==========================================================================
   1. CONSTANTES Y DATOS INICIALES
   ========================================================================== */
const $ = s => document.querySelector(s);
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Datos de la función: llegan por la URL desde la página de cada película.
// Ej: entradas.html?peli=Spider-man&fecha=2026-11-03&hora=18:15&volver=Spider-man.html
const params = new URLSearchParams(location.search);
const peli = params.get('peli');
const fechaP = /^(\d{4})-(\d{2})-(\d{2})$/.exec(params.get('fecha') || '');
const horaP = /^\d{2}:\d{2}$/.test(params.get('hora') || '') ? params.get('hora') : '';
const volverP = /^[\w-]+\.html$/.test(params.get('volver') || '') ? params.get('volver') : '';

// Precio de la entrada según el formato
const FORMATOS = [
  { id: '2D', ds: 'Imagen tradicional en pantalla grande.', p: PRECIO_FORMATO['2D'] },
  { id: '3D', ds: 'Imagen con profundidad. Los lentes están incluidos.', p: PRECIO_FORMATO['3D'] },
  { id: 'XD', ds: 'Pantalla gigante y sonido envolvente.', p: PRECIO_FORMATO['XD'] },
  { id: '4D', ds: 'Butacas con movimiento y efectos en la sala.', p: PRECIO_FORMATO['4D'] }
];

// Adicional según el tipo de butaca
const BUTACAS = [
  { id: 'Simple', nombre: 'Butaca simple', ds: 'Butaca cómoda en cualquier fila de la sala.', x: 0 },
  { id: 'D-BOX', nombre: 'Butaca D-BOX', ds: 'Butaca con movimiento sincronizado con la película. Filas G y H.', x: EXTRA_DBOX }
];

// Si se vuelve desde las butacas, se recuerda lo que se había elegido
const fmtP = params.get('formato'), seatP = params.get('butaca');
let fmt = FORMATOS.some(o => o.id === fmtP) ? fmtP : '2D';
let seat = BUTACAS.some(o => o.id === seatP) ? seatP : 'Simple';


/* ==========================================================================
   2. FUNCIONES DE RENDERIZADO Y UTILIDADES
   ========================================================================== */
const $$ = n => '$' + n.toLocaleString('es-AR');

function rows(el, name, list, cur) {
  el.innerHTML = list.map(o => {
    const on = o.id === cur;
    const precio = o.p !== undefined ? $$(o.p) : (o.x ? '+ ' + $$(o.x) : 'Sin costo adicional');
    return '<label class="op' + (on ? ' on' : '') + '">' +
      '<input type="radio" name="' + name + '" value="' + o.id + '"' + (on ? ' checked' : '') + '>' +
      '<span class="rd" aria-hidden="true"></span>' +
      '<span class="tx"><b>' + (o.nombre || o.id) + '</b><small>' + o.ds + '</small></span>' +
      '<span class="pr">' + precio + '</span>' +
      '</label>';
  }).join('');
}

function draw() {
  const f = FORMATOS.find(o => o.id === fmt);
  const b = BUTACAS.find(o => o.id === seat);
  rows($('#fmt'), 'fmt', FORMATOS, fmt);
  rows($('#seat'), 'seat', BUTACAS, seat);

  $('#lFmt').textContent = 'Entrada ' + f.id;
  $('#pFmt').textContent = $$(f.p);
  $('#lSeat').textContent = b.nombre;
  $('#pSeat').textContent = b.x ? '+ ' + $$(b.x) : 'Incluida';
  $('#price').textContent = $$(f.p + b.x);
}

function datosFuncion() {
  $('#fPeli').textContent = peli || 'Elige una película en la cartelera';
  $('#rPeli').textContent = peli || '—';
  if (peli) document.title = 'Cinemax | Entradas para ' + peli;

  let cuando = '';
  if (fechaP) {
    const d = new Date(+fechaP[1], +fechaP[2] - 1, +fechaP[3]);
    cuando = DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()];
    $('#fFecha').textContent = cuando;
  } else {
    $('#fFecha').remove();
  }

  if (horaP) { $('#fHora').textContent = horaP; cuando += (cuando ? ' · ' : '') + horaP; }
  else $('#fHora').remove();

  $('#rCuando').textContent = cuando || '—';

  // "Volver a la película" lleva a la película elegida
  $('#back').href = volverP ? '../peliculas/' + volverP : '../cartelera.html';
}


/* ==========================================================================
   3. MANEJADORES DE EVENTOS E INICIALIZACIÓN
   ========================================================================== */
document.addEventListener('change', e => {
  if (e.target.name === 'fmt') fmt = e.target.value;
  if (e.target.name === 'seat') seat = e.target.value;
  draw();
  const c = document.querySelector('input[name="' + e.target.name + '"]:checked');
  if (c) c.focus();
});

// Continuar: pasa a elegir las butacas, llevando la función y lo elegido acá
$('#go').addEventListener('click', () => {
  const datos = new URLSearchParams();
  ['peli', 'fecha', 'hora', 'volver'].forEach(k => { if (params.get(k)) datos.set(k, params.get(k)); });
  datos.set('formato', fmt);
  datos.set('butaca', seat);
  location.href = 'butacas.html?' + datos.toString();
});

$('#desde').textContent = $$(Math.min(...Object.values(PRECIO_FORMATO)));   // precio más bajo
datosFuncion();
draw();
