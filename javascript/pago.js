/* ==========================================================================
   PAGO.JS — PASO 4: PAGO
   Recibe por la URL todo lo elegido antes (película, fecha, horario, formato,
   tipo de butaca, butacas y candy) y usa los precios de precios.js.
   ?peli=...&fecha=2026-11-03&hora=18:15&formato=3D&butaca=D-BOX&asientos=G7,G9
   &candy=id:cantidad:precio:nombre,...

   IMPORTANTE: es una simulación. No se cobra nada y los datos de la tarjeta
   no se guardan ni se envían a ningún lado: solo se validan en el navegador.
   ========================================================================== */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const dinero = n => '$' + n.toLocaleString('es-AR');
  const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  /* ==================== 1. DATOS QUE LLEGAN POR LA URL (se validan) ==================== */
  const q = new URLSearchParams(location.search);
  const peli = q.get('peli');
  const fechaP = /^(\d{4})-(\d{2})-(\d{2})$/.exec(q.get('fecha') || '');
  const hora = /^\d{2}:\d{2}$/.test(q.get('hora') || '') ? q.get('hora') : '';
  const fmt = Object.prototype.hasOwnProperty.call(PRECIO_FORMATO, q.get('formato')) ? q.get('formato') : '2D';
  const dbox = q.get('butaca') === 'D-BOX';
  const asientos = (q.get('asientos') || '').split(',').filter(id => /^[A-N]\d{1,2}$/.test(id));

  const candy = [];   // { id, n, precio, nombre }
  (q.get('candy') || '').split(',').forEach(p => {
    const [id, n, precio, ...nombre] = p.split(':');
    if (/^[\w-]+$/.test(id) && /^\d{1,2}$/.test(n) && +n >= 1 && /^\d{1,7}$/.test(precio) && nombre.join(':').trim())
      candy.push({ id, n: +n, precio: +precio, nombre: nombre.join(':').trim().slice(0, 60) });
  });

  if (!peli || !fechaP || !hora || !asientos.length) {
    $('#pBody').innerHTML =
      '<div class="head"><p class="eyebrow">Paso 4 · Pago</p><h1>Primero elige tus butacas</h1>' +
      '<p class="fn">Elige la película, el horario y tus butacas para continuar con tu compra.</p>' +
      '<p style="margin-top:22px"><a class="go" style="display:inline-block;width:auto" href="../cartelera.html">Ir a la cartelera</a></p></div>';
    return;
  }

  const f = new Date(+fechaP[1], +fechaP[2] - 1, +fechaP[3]);
  const fechaTxt = DIAS[f.getDay()] + ' ' + f.getDate() + ' de ' + MESES[f.getMonth()];
  const precioButaca = id => PRECIO_FORMATO[fmt] + ('GH'.includes(id[0]) ? EXTRA_DBOX : 0);
  const totalEntradas = asientos.reduce((s, id) => s + precioButaca(id), 0);
  const totalCandy = candy.reduce((s, c) => s + c.precio * c.n, 0);
  const total = totalEntradas + totalCandy;
  const unidades = candy.reduce((s, c) => s + c.n, 0);

  // Datos que viajan de una página a otra
  const base = new URLSearchParams();
  ['peli', 'fecha', 'hora', 'volver'].forEach(k => { if (q.get(k)) base.set(k, q.get(k)); });
  base.set('formato', fmt);
  base.set('butaca', dbox ? 'D-BOX' : 'Simple');
  base.set('asientos', asientos.join(','));
  const datosCandy = q.get('candy');
  if (datosCandy) base.set('candy', datosCandy);
  $('#back').href = 'candy.html?' + base.toString();


  /* ==================== 2. RESUMEN DE LA COMPRA ==================== */
  document.title = 'Cinemax | Pago de ' + peli;
  $('#rPeli').textContent = peli;
  $('#rCuando').textContent = fechaTxt + ' · ' + hora;
  $('#rSeats').textContent = asientos.join(', ') + ' · ' + fmt + (dbox ? ' · D-BOX' : '');
  [peli, fechaTxt, hora, fmt].forEach(t => { const s = document.createElement('span'); s.textContent = t; $('#fnChips').appendChild(s); });

  $('#lTick').textContent = 'Entradas (' + asientos.length + ')';
  $('#pTick').textContent = dinero(totalEntradas);
  $('#lCandy').textContent = 'Candy (' + unidades + ')';
  $('#pCandy').textContent = dinero(totalCandy);
  $('#total').textContent = dinero(total);
  $('#pay').textContent = 'Pagar ' + dinero(total);

  candy.forEach(c => {
    const li = document.createElement('li');
    const a = document.createElement('span'), b = document.createElement('span'), s = document.createElement('small');
    a.textContent = c.nombre; s.textContent = c.n + ' × ' + dinero(c.precio); a.appendChild(s);
    b.textContent = dinero(c.precio * c.n);
    li.append(a, b); $('#list').appendChild(li);
  });

  // La advertencia de D-BOX solo se pide si se eligió esa butaca
  if (!dbox) $('#w-cDbox').hidden = true;


  /* ==================== 3. MÉTODO DE PAGO ==================== */
  const NOTAS = {
    modo: 'Al confirmar, vas a completar el pago desde la app de tu banco con MODO.',
    cuenta: 'Al confirmar, vas a pagar con el dinero disponible en tu cuenta.'
  };
  let metodo = 'tarjeta';

  function dibujarMetodo() {
    $$('.mp').forEach(l => l.classList.toggle('on', l.querySelector('input').checked));
    $('#cardBox').hidden = metodo !== 'tarjeta';
    $('#nota').hidden = metodo === 'tarjeta';
    $('#nota').textContent = NOTAS[metodo] || '';
  }

  $$('input[name="metodo"]').forEach(r => r.addEventListener('change', () => { metodo = r.value; dibujarMetodo(); }));


  /* ==================== 4. FORMATO DE LOS CAMPOS ==================== */
  const soloNum = (el, max) => el.addEventListener('input', () => { el.value = el.value.replace(/\D/g, '').slice(0, max); });
  soloNum($('#fDni'), 8);
  soloNum($('#fCvv'), 4);

  $('#fCard').addEventListener('input', e => {                      // 1234 5678 9012 3456
    const d = e.target.value.replace(/\D/g, '').slice(0, 19);
    e.target.value = d.replace(/(.{4})/g, '$1 ').trim();
  });

  $('#fExp').addEventListener('input', e => {                       // MM/AA
    const d = e.target.value.replace(/\D/g, '').slice(0, 4);
    e.target.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  });


  /* ==================== 5. VALIDACIÓN ==================== */
  const luhn = num => {
    let suma = 0, doble = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let d = +num[i];
      if (doble && (d *= 2) > 9) d -= 9;
      suma += d; doble = !doble;
    }
    return suma % 10 === 0;
  };

  const REGLAS = {
    fNombre: v => v.trim().length < 2 ? 'Ingresa tu nombre.' : '',
    fApellido: v => v.trim().length < 2 ? 'Ingresa tu apellido.' : '',
    fEmail: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Ingresa un email válido.',
    fCard: v => { const n = v.replace(/\s/g, ''); return n.length >= 13 && n.length <= 19 && luhn(n) ? '' : 'El número de la tarjeta no es válido.'; },
    fTitular: v => /\S+\s+\S+/.test(v.trim()) ? '' : 'Ingresa nombre y apellido del titular.',
    fDni: v => /^\d{7,8}$/.test(v) ? '' : 'Ingresa un DNI de 7 u 8 dígitos.',
    fExp: v => {
      const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v);
      if (!m) return 'Usa el formato MM/AA.';
      const vence = new Date(2000 + +m[2], +m[1], 1);               // primer día del mes siguiente
      return vence > new Date() ? '' : 'La tarjeta está vencida.';
    },
    fCvv: v => /^\d{3,4}$/.test(v) ? '' : 'Ingresa 3 o 4 dígitos.'
  };
  const CAMPOS_TARJETA = ['fCard', 'fTitular', 'fDni', 'fExp', 'fCvv'];
  const CHECKS = { cDbox: 'Debes aceptar las advertencias del formato D-BOX.', cMenores: 'Debes aceptar esta declaración.', cTyc: 'Debes aceptar los Términos y Condiciones.' };

  function marcar(id, msg) {
    const e = $('#e-' + id), el = $('#' + id);
    e.textContent = msg; e.hidden = !msg;
    if (el.closest('.fld')) el.closest('.fld').classList.toggle('bad', !!msg);
    el.setAttribute('aria-invalid', !!msg);
  }

  function validar(id) {
    const msg = REGLAS[id] ? REGLAS[id]($('#' + id).value) : ($('#' + id).checked ? '' : CHECKS[id]);
    marcar(id, msg);
    return !msg;
  }

  Object.keys(REGLAS).forEach(id => $('#' + id).addEventListener('blur', () => validar(id)));
  [...Object.keys(REGLAS), ...Object.keys(CHECKS)].forEach(id => $('#' + id).addEventListener('input', () => { if (!$('#e-' + id).hidden) validar(id); }));
  Object.keys(CHECKS).forEach(id => $('#' + id).addEventListener('change', () => validar(id)));


  /* ==================== 6. CONFIRMAR LA COMPRA ==================== */
  $('#payForm').addEventListener('submit', e => {
    e.preventDefault();
    const ids = ['fNombre', 'fApellido', 'fEmail'];
    if (metodo === 'tarjeta') ids.push(...CAMPOS_TARJETA);
    ids.push('cMenores', 'cTyc');
    if (dbox) ids.push('cDbox');

    const malos = ids.filter(id => !validar(id));
    if (malos.length) { $('#' + malos[0]).focus(); return; }

    const btn = $('#pay');
    btn.disabled = true; btn.textContent = 'Procesando…';
    setTimeout(() => confirmar($('#fEmail').value.trim()), 900);
  });

  function confirmar(email) {
    const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const codigo = 'CX-' + Array.from({ length: 6 }, () => ABC[Math.floor(Math.random() * ABC.length)]).join('');
    const filas = [['Película', peli], ['Función', fechaTxt + ' · ' + hora], ['Butacas', asientos.join(', ')], ['Formato', fmt + (dbox ? ' · D-BOX' : '')]];
    if (unidades) filas.push(['Candy', unidades + (unidades === 1 ? ' producto' : ' productos')]);
    filas.push(['Total pagado', dinero(total)]);

    const box = document.createElement('div');
    box.className = 'ok-box';
    const dl = document.createElement('dl');
    filas.forEach(([k, v]) => {
      const d = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = k; dd.textContent = v; d.append(dt, dd); dl.appendChild(d);
    });
    box.innerHTML = '<p class="eyebrow">Compra confirmada</p><h1>¡Gracias por tu compra!</h1>' +
      '<p class="fn" style="justify-content:center">Tu código de compra</p><div class="code"></div>';
    box.querySelector('.code').textContent = codigo;
    const info = document.createElement('p');
    info.className = 'note';
    info.textContent = 'Guarda este código: lo vas a necesitar para retirar tus entradas' + (unidades ? ' y tu candy' : '') + '. (' + email + ')';
    const volver = document.createElement('a');
    volver.className = 'go'; volver.href = '../../index.html'; volver.textContent = 'Volver al inicio';
    volver.style.cssText = 'display:inline-block;width:auto;margin-top:18px';
    box.append(dl, info, volver);

    $('#pBody').replaceChildren(box);
    $('#steps').querySelector('.st.on').className = 'st ok';
    $('#steps').querySelector('.st.ok:last-of-type b').textContent = '✓';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  dibujarMetodo();
})();
