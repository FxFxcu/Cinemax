/* ======================= AYUDA (PREGUNTAS FRECUENTES) ======================= */

// Preguntas y respuestas. Para agregar otra, copia una línea y cambia el texto.
const $ = (s) => document.querySelector(s);
// Preguntas y respuestas. Reemplaza la lista FAQ de tu ayuda.js por esta.
// Para agregar otra, copia una línea y cambia el texto.
const FAQ = [
  { q: '¿Cómo compro entradas?',
    a: 'Elige la película en la cartelera, selecciona el horario y confirma la compra.' },
  { q: '¿Cómo funcionan las preventas?',
    a: 'Puedes reservar tus entradas antes del estreno y elegir tu butaca con anticipación.' },
  { q: '¿Hay descuentos?',
    a: 'Sí, los miércoles tienes entradas al 50% de descuento en todos los formatos de salas.' },
  { q: '¿Puedo elegir mi butaca?',
    a: 'Sí. Al comprar tus entradas verás el mapa de la sala y podrás elegir los asientos disponibles.' },
  { q: '¿Qué medios de pago aceptan?',
    a: 'Aceptamos tarjetas de débito y crédito, billeteras virtuales y pago en efectivo en la boletería.' },
  { q: '¿Puedo cambiar o cancelar mi entrada?',
    a: 'Puedes cambiar tu función hasta 1 horas antes del inicio de la pelicula. Las entradas de preventa se pueden cancelar hasta 48 horas antes del estreno.' },
  { q: '¿Con cuánta anticipación debo llegar?',
    a: 'Te recomendamos llegar entre 15 y 10 minutos antes de la función para ubicarte con tiempo en tu butaca.' },
  { q: '¿Qué significa la clasificación de cada película?',
    a: 'ATP es apta para todo público. +13, +16 y +18 indican la edad mínima recomendada para ver la película.' },
  { q: '¿Puedo ingresar con comida o bebida de afuera?',
    a: 'No. Contamos con un candy bar dentro del cine con snacks, bebidas y combos para disfrutar en la sala.' },
  { q: '¿Cómo creo una cuenta?',
    a: 'Toca "Crear cuenta" en la parte superior de la página, completa tus datos y confirma tu correo electrónico.' },
];

// Dibuja las preguntas
$('#acc').innerHTML = FAQ.map((f, i) => `
  <div class="acc">
    <button aria-expanded="false" aria-controls="p${i}">${f.q}</button>
    <div class="acc-panel" id="p${i}" hidden>${f.a}</div>
  </div>`).join('');

// Abre o cierra la respuesta al hacer clic en la pregunta
$('#acc').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const abierta = b.getAttribute('aria-expanded') === 'true';
  b.setAttribute('aria-expanded', !abierta);
  $('#' + b.getAttribute('aria-controls')).hidden = abierta;
});