/* ==========================================================================
   CANDY.JS — PASO 3: ELEGIR EL CANDY
   Recibe por la URL lo elegido antes (película, fecha, horario, formato, tipo
   de butaca y butacas) y usa los precios de precios.js. Los productos están
   en candy.html (data-id, data-name, data-price, data-old).
   ?peli=...&fecha=2026-11-03&hora=18:15&formato=3D&butaca=D-BOX&asientos=G7,G9
   ========================================================================== */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const dinero = n => '$' + n.toLocaleString('es-AR');
  const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MAXQ = 20;            // máximo por producto
  const IMPUESTOS = 1.21;     // para mostrar el precio sin impuestos nacionales

  /* ---------- Datos que llegan por la URL (se validan) ---------- */
  const q = new URLSearchParams(location.search);
  const peli = q.get('peli');
  const fechaP = /^(\d{4})-(\d{2})-(\d{2})$/.exec(q.get('fecha') || '');
  const hora = /^\d{2}:\d{2}$/.test(q.get('hora') || '') ? q.get('hora') : '';
  const fmt = Object.prototype.hasOwnProperty.call(PRECIO_FORMATO, q.get('formato')) ? q.get('formato') : '2D';
  const dbox = q.get('butaca') === 'D-BOX';
  const asientos = (q.get('asientos') || '').split(',').filter(id => /^[A-N]\d{1,2}$/.test(id));

  if (!peli || !fechaP || !hora || !asientos.length) {
    $('#cBody').innerHTML =
      '<div class="head"><p class="eyebrow">Paso 3 · Candy</p><h1>Primero elige tus butacas</h1>' +
      '<p class="fn">Elige la película, el horario y tus butacas para continuar con tu compra.</p>' +
      '<p style="margin-top:22px"><a class="go" style="display:inline-block;width:auto" href="../cartelera.html">Ir a la cartelera</a></p></div>';
    return;
  }

  const f = new Date(+fechaP[1], +fechaP[2] - 1, +fechaP[3]);
  const fechaTxt = DIAS[f.getDay()] + ' ' + f.getDate() + ' de ' + MESES[f.getMonth()];

  // Entradas: precio del formato + adicional si la butaca es D-BOX (filas G y H)
  const precioButaca = id => PRECIO_FORMATO[fmt] + ('GH'.includes(id[0]) ? EXTRA_DBOX : 0);
  const totalEntradas = asientos.reduce((s, id) => s + precioButaca(id), 0);

  document.title = 'Cinemax | Candy para ' + peli;
  $('#rPeli').textContent = peli;
  $('#rCuando').textContent = fechaTxt + ' · ' + hora;
  $('#rSeats').textContent = asientos.join(', ');
  [peli, fechaTxt, hora, fmt, dbox ? 'Butaca D-BOX' : 'Butaca simple'].forEach(t => {
    const s = document.createElement('span'); s.textContent = t; $('#fnChips').appendChild(s);
  });
  $('#lTick').textContent = 'Entradas (' + asientos.length + ')';
  $('#pTick').textContent = dinero(totalEntradas);

  // Datos que viajan de una página a otra
  const base = new URLSearchParams();
  ['peli', 'fecha', 'hora', 'volver'].forEach(k => { if (q.get(k)) base.set(k, q.get(k)); });
  base.set('formato', fmt);
  base.set('butaca', dbox ? 'D-BOX' : 'Simple');
  base.set('asientos', asientos.join(','));
  $('#back').href = 'butacas.html?' + base.toString();


  /* ---------- Productos ---------- */
  const prod = new Map();   // id -> { name, price }
  $$('.prod').forEach(el => {
    const price = +el.dataset.price, old = +el.dataset.old || 0;
    prod.set(el.dataset.id, { name: el.dataset.name, price });

    el.querySelector('.pb').innerHTML =
      '<div class="pv">' + (old ? '<s>' + dinero(old) + '</s>' : '') +
      '<b>' + dinero(price) + '</b>' + (old ? '<em>Precio web</em>' : '') +
      '<small>Precio sin impuestos nacionales: ' + dinero(Math.round(price / IMPUESTOS)) + '</small></div>' +
      '<button type="button" class="add" data-add="' + el.dataset.id + '" aria-label="Sumar ' + el.dataset.name + '">+<i class="n" hidden></i></button>';

    // "Ver más" solo aparece si la descripción está cortada
    const ds = el.querySelector('.ds'), ver = el.querySelector('.ver');
    if (ds.scrollHeight > ds.clientHeight + 1) ver.hidden = false;
  });

  // La URL puede traer lo que ya se había sumado (si se vuelve desde el pago)
  const cart = {};
  (q.get('candy') || '').split(',').forEach(p => {
    const [id, n] = p.split(':');
    if (prod.has(id) && /^\d{1,2}$/.test(n)) cart[id] = Math.min(MAXQ, Math.max(1, +n));
  });

  function dibujar() {
    const ids = Object.keys(cart);
    let candy = 0, unidades = 0;

    $('#list').innerHTML = ids.length
      ? ids.map(id => {
          const p = prod.get(id), n = cart[id];
          candy += p.price * n; unidades += n;
          return '<li><span><b>' + p.name + '</b><small>' + n + ' × ' + dinero(p.price) + '</small></span>' +
            '<span class="pr">' + dinero(p.price * n) +
            '<button type="button" class="x" data-less="' + id + '" aria-label="Quitar uno de ' + p.name + '">−</button>' +
            '<button type="button" class="x" data-add="' + id + '" aria-label="Sumar uno de ' + p.name + '">+</button></span></li>';
        }).join('')
      : '<li class="vacia">Todavía no sumaste nada. Es opcional.</li>';

    $('#lCandy').textContent = 'Candy (' + unidades + ')';
    $('#pCandy').textContent = dinero(candy);
    $('#total').textContent = dinero(totalEntradas + candy);

    // Contador sobre el botón "+" de cada producto
    $$('.add[data-add]').forEach(b => {
      const n = b.querySelector('.n');
      if (!n) return;
      const c = cart[b.dataset.add] || 0;
      n.hidden = !c; n.textContent = c;
    });

    const go = $('#go'), datos = new URLSearchParams(base);
    // id:cantidad:precio:nombre (el pago necesita el detalle para mostrarlo)
    if (ids.length) datos.set('candy', ids.map(id => id + ':' + cart[id] + ':' + prod.get(id).price + ':' + prod.get(id).name.replace(/[,:]/g, ' ')).join(','));
    go.textContent = ids.length ? 'Continuar al pago ›' : 'Continuar sin candy ›';
    go.href = 'pago.html?' + datos.toString();
  }

  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]'), less = e.target.closest('[data-less]'), ver = e.target.closest('.ver');
    if (add && prod.has(add.dataset.add)) {
      cart[add.dataset.add] = Math.min(MAXQ, (cart[add.dataset.add] || 0) + 1);
      dibujar();
    }
    if (less && cart[less.dataset.less]) {
      if (--cart[less.dataset.less] < 1) delete cart[less.dataset.less];
      dibujar();
    }
    if (ver) {
      const ds = ver.previousElementSibling, abierto = ds.classList.toggle('open');
      ver.textContent = abierto ? 'Ver menos' : 'Ver más';
    }
  });

  dibujar();
})();
