(function () {
  // revelar ao rolar
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12 }) : null;
  document.querySelectorAll('.rv').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });

  // menu mobile
  var menu = document.getElementById('menu'), panel = document.getElementById('panel');
  function setMenu(on) { panel.classList.toggle('on', on); menu.setAttribute('aria-expanded', String(on)); }
  menu.addEventListener('click', function () { setMenu(!panel.classList.contains('on')); });
  panel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', function (e) { if (!panel.contains(e.target) && !menu.contains(e.target)) setMenu(false); });

  // faq
  document.querySelectorAll('.qa button').forEach(function (b) {
    b.addEventListener('click', function () {
      var qa = b.parentNode, open = !qa.classList.contains('open');
      document.querySelectorAll('.qa').forEach(function (o) { o.classList.remove('open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) { qa.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  // preco mensal / anual
  var bill = document.getElementById('bill');
  if (bill) bill.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    bill.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
    document.querySelectorAll('.price span[data-y]').forEach(function (s) { window.helloTween ? helloTween(s, +s.getAttribute('data-' + b.getAttribute('data-m'))) : (s.textContent = '$' + s.getAttribute('data-' + b.getAttribute('data-m'))); }); if (window.helloPill) helloPill();
  });
})();

(function () {
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ordem de entrada nas grades
  $$('.fgrid,.plans').forEach(function (g) { Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--i', i); }); });

  // icones: desenhar o traco
  $$('.fi svg *').forEach(function (n) { n.setAttribute('pathLength', '1'); });
  $$('.cmp td svg path').forEach(function (n) { n.setAttribute('pathLength', '1'); });

  // brilho que segue o mouse
  $$('.sp').forEach(function (c) {
    c.addEventListener('pointermove', function (e) { var b = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - b.left) + 'px'); c.style.setProperty('--my', (e.clientY - b.top) + 'px'); });
  });

  // titulo das paginas internas: palavra por palavra
  function split(node) {
    var f = document.createDocumentFragment();
    Array.prototype.forEach.call(node.childNodes, function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(p)); return; }
          var w = document.createElement('span'); w.className = 'w'; var s = document.createElement('span'); s.textContent = p; w.appendChild(s); f.appendChild(w);
        });
      } else if (n.classList && n.classList.contains('rot')) { f.appendChild(n); }
      else { var c = n.cloneNode(false); c.appendChild(split(n)); f.appendChild(c); }
    });
    return f;
  }
  if (!rm) $$('.ph h1').forEach(function (h) {
    var rot = h.querySelector('.rot'), frag = split(h);
    h.textContent = ''; h.appendChild(frag);
    $$('.w > span', h).forEach(function (s, i) { s.style.animationDelay = (i * 70 + 80) + 'ms'; });
  });

  // palavra que gira: fade + deslize + largura animada (sem cortar)
  $$('.rot').forEach(function (el) {
    var words = el.getAttribute('data-words').split(','), i = 0, inn = el.querySelector('.rot-in');
    if (rm) return;
    function fit() { el.style.width = inn.getBoundingClientRect().width + 'px'; }
    fit(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); addEventListener('resize', fit);
    setInterval(function () {
      inn.classList.add('out');
      setTimeout(function () {
        i = (i + 1) % words.length; inn.textContent = words[i]; fit();
        inn.classList.remove('out'); inn.classList.add('pre'); void inn.offsetWidth; inn.classList.remove('pre');
      }, 520);
    }, 3000);
  });
  // numeros que contam
  window.helloTween = function (el, to) {
    var from = parseFloat(el.textContent.replace(/[^0-9.]/g, '')) || 0, t0 = null, dur = 600;
    if (rm) { el.textContent = '$' + to; return; }
    cancelAnimationFrame(el._r);
    (function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = '$' + Math.round(from + (to - from) * e);
      if (p < 1) el._r = requestAnimationFrame(step);
    })(performance.now());
  };

  // toggle de preco: pilula que desliza
  window.helloPill = function () {
    var bill = document.getElementById('bill'); if (!bill) return;
    var on = bill.querySelector('button.on'), pill = bill.querySelector('.tpill'); if (!on || !pill) return;
    pill.style.width = on.offsetWidth + 'px'; pill.style.transform = 'translateX(' + (on.offsetLeft - 3) + 'px)';
  };
  helloPill(); addEventListener('load', helloPill);

  // filtro de features
  var fl = document.getElementById('filters');
  if (fl) fl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    $$('button', fl).forEach(function (x) { x.classList.toggle('on', x === b); });
    var f = b.getAttribute('data-f');
    $$('#fg .fcard').forEach(function (c) { c.classList.toggle('dim', f !== 'all' && c.getAttribute('data-cat') !== f); });
  });

  // demo do produto
  $$('.demo').forEach(function (demo) {
    var tabs = $$('.d-tab', demo), panels = $$('.d-panel', demo), cur = 0, timer, DUR = 4500;
    demo.style.setProperty('--dur', DUR + 'ms');
    function restart() {
      clearTimeout(timer);
      tabs.forEach(function (t) { var b = t.querySelector('.bar i'); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; });
      if (!rm) timer = setTimeout(function () { show((cur + 1) % tabs.length); }, DUR);
    }
    function show(i) {
      cur = i;
      tabs.forEach(function (t, k) { t.classList.toggle('on', k === i); });
      panels.forEach(function (p, k) { p.classList.toggle('on', k === i); });
      restart();
    }
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { show(k); }); });
    demo.addEventListener('mouseenter', function () { clearTimeout(timer); demo.classList.add('paused'); });
    demo.addEventListener('mouseleave', function () { demo.classList.remove('paused'); restart(); });
    restart();
  });
})();

/* calculadora de preco */
(function () {
  var seg = document.getElementById('plan'); if (!seg) return;
  var P = {
    solo: { y: 9, m: 12, inc: ['One local number', 'Calls and texts', 'Free number porting', 'Mobile and desktop apps'] },
    business: { y: 29, m: 39, inc: ['Shared inbox and routing', 'Recording and AI summaries', 'CRM sync and open API', 'Free number porting'] },
    ultra: { y: 90, m: 90, inc: ['Everything in Business', 'Advanced reporting', 'Priority support', 'Dedicated onboarding'] }
  };
  var plan = 'business', add = { ai: false, dialer: false };
  var total = document.getElementById('total'), note = document.getElementById('note'), inc = document.getElementById('inc'), bill = document.getElementById('bill');
  var ck = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg>';
  function segPill() { var on = seg.querySelector('button.on'), p = seg.querySelector('.sgp'); p.style.width = on.offsetWidth + 'px'; p.style.transform = 'translateX(' + (on.offsetLeft - 3) + 'px)'; }
  function render() {
    var m = bill.querySelector('button.on').getAttribute('data-m'), per = P[plan][m];
    if (window.helloTween) helloTween(total, per); else total.textContent = '$' + per;
    var save = (P[plan].m - P[plan].y) * 12, parts = [];
    if (m === 'y' && save > 0) parts.push('saves $' + save + ' a year per seat');
    if (add.ai) parts.push('+ $29 / agent AI receptionist');
    if (add.dialer) parts.push('+ $45 / team power dialer');
    note.textContent = parts.join('  \u00b7  ');
    var items = P[plan].inc.slice(); if (add.ai) items.push('AI receptionist'); if (add.dialer) items.push('Power dialer');
    inc.innerHTML = items.map(function (t, i) { return '<li style="--k:' + i + '">' + ck + t + '</li>'; }).join('');
    segPill(); if (window.helloPill) helloPill();
  }
  seg.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; seg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); plan = b.getAttribute('data-p'); render(); });
  bill.addEventListener('click', function () { setTimeout(render, 0); });
  Array.prototype.forEach.call(document.querySelectorAll('.sw'), function (s) { s.addEventListener('click', function () { var on = s.getAttribute('aria-checked') !== 'true'; s.setAttribute('aria-checked', String(on)); add[s.getAttribute('data-a')] = on; render(); }); });
  render(); addEventListener('load', render);
})();
/* ========== movimento ========== */
(function () {
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(pointer: fine)').matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  if (rm) return;

  // barra de progresso + nav que some ao descer
  var nav = document.querySelector('.nav'), panel = document.getElementById('panel'), lastY = 0, tick = false;
  var svs = $$('.zig .sv');
  function para() {
    var vh = innerHeight; if (innerWidth <= 980) return;
    svs.forEach(function (el) { var r = el.parentNode.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; el.style.setProperty('--py', (-(r.top + r.height / 2 - vh / 2) * 0.055).toFixed(1) + 'px'); });
  }
  function onScroll() {
    var h = document.documentElement, y = h.scrollTop, max = h.scrollHeight - h.clientHeight;
    if (nav) nav.classList.toggle('scrolled', y > 24);
    lastY = y; para(); tick = false;
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // titulos: palavra por palavra ao entrar na tela
  function split(node) {
    var f = document.createDocumentFragment();
    Array.prototype.forEach.call(node.childNodes, function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(p)); return; }
          var w = document.createElement('span'); w.className = 'w'; var s = document.createElement('span'); s.textContent = p; w.appendChild(s); f.appendChild(w);
        });
      } else if (n.classList && n.classList.contains('rot')) { f.appendChild(n); }
      else if (n.nodeName === 'BR') { f.appendChild(n.cloneNode()); }
      else { var c = n.cloneNode(false); c.appendChild(split(n)); f.appendChild(c); }
    });
    return f;
  }
  $$('.zig-tx h2,.section-head .h2,.final h2,.gk-top h2,.sync-copy h2').forEach(function (h) {
    var frag = split(h); h.textContent = ''; h.appendChild(frag);
    $$('.w > span', h).forEach(function (s, i) { s.style.animationDelay = (i * 60 + 120) + 'ms'; });
  });

  // contador de discagens
  $$('.cnt b').forEach(function (b) { var n = +b.textContent; setInterval(function () { n++; b.textContent = n; }, 1300); });

  if (fine) {
    // brilho que segue o cursor
    var g = document.createElement('div'); g.className = 'glow'; document.body.appendChild(g);
    var tx = innerWidth / 2, ty = 200, cx = tx, cy = ty;
    addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() { cx += (tx - cx) * .08; cy += (ty - cy) * .08; g.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)'; requestAnimationFrame(loop); })();
  }

  // cortina entre paginas
  var cur = document.createElement('div'); cur.className = 'curtain'; document.body.appendChild(cur);
  var came = false; try { came = sessionStorage.getItem('hc') === '1'; sessionStorage.removeItem('hc'); } catch (e) {}
  if (came) { cur.classList.add('cover'); requestAnimationFrame(function () { requestAnimationFrame(function () { cur.classList.remove('cover'); cur.classList.add('reveal'); }); }); }
  addEventListener('pageshow', function (e) { if (e.persisted) { cur.className = 'curtain'; } });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    var h = a.getAttribute('href');
    if (!/^[\w-]+\.html(#.*)?$/.test(h)) return;
    var here = location.pathname.split('/').pop() || 'index.html';
    if (h.split('#')[0] === here && h.indexOf('#') > -1) return;
    e.preventDefault();
    try { sessionStorage.setItem('hc', '1'); } catch (err) {}
    cur.classList.add('go');
    setTimeout(function () { location.href = h; }, 480);
  });
})();

/* ========== globo 3D (canvas) ========== */
(function () {
  var cv = document.querySelector('canvas.globe'); if (!cv) return;
  var ctx = cv.getContext('2d'), rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LAND = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAfAP8DAAAAAAAAAAAAAAAAAAAAAADo//z//wcAAAAAAAACAAAAAAAAAAAAhvvw//8PAPABAAAAwAMAAAAAAAAAwADkw////wEABAAAAABgAAAAAAAAAADAUT8A/v8PAAAAAAwA/j8AuAEAAAAAcBHtDcD/fwAAAAAwAPz/fwMAABCAAQD5w/wD8P8FAAAMAIL7//////9/AP//////////////B/D/SAAAAAAAQID//////////////x8AKAAEAAAAAAAA8///////////////YCgAAAAAAAAAAADw/////wEs4AEAAHz+////////////gL////8HeAAcAADg5///////////9ADgAf7/f4AnAAAAAH78////////H0QAAAiA//8f8AcAAIBB4////////38ADwAQAOD//5//AQAAHAT/////////A3AAAAAA/v//+T8AAGDz//////////8DAQAAAMD/////AwAAsP//////////LwAAAAAA6P///2IAAAD+//////////8CAAAAAAD///8/CAAA4P//////////JwAAAAAA8P///wYAAAD+/unz/////z8AAAAAAAD///8HAAAA/pgPPP//////MQAAAAAA8P//PwAAAMBD9v7n/////wcBAAAAAAD///8AAAAAPkD7f/7///8hEAAAAAAA4P//DwAAAIDhAv/n////f8YAAAAAAAD8//8AAAAA+AdE//////8jDwAAAAAAgP//AwAAAMD/APD/////PxgAAAAAAADw/x8AAAAA/n/v//////8HAAAAAAAAAPwDAgAAAOD////7////fwAAAAAAAACgHyAAAACA//9/f/7///8DAAAAAAAAAPQBAAAAAPj//+cv+P//PwAAAAAAAAAAHjAAAADA/////g/+//8EAAAAAAAAAOBhCAAAAP7//99/4D//AAAAAAAAAAAAPAMEAADA////+Qf84BcAAAAAAAAAAAA/AAAAAPz//58fgAf+QAAAAAAAAAAAAA8AAADg////ewA4gA8EAAAAAAAAAADAAAAAAPz//38BgAP4QQAAAAAAAAAAAAgPAADA////zwAwgAwQAAAAAAAAAAAA9Q8AAPj///8HAAVIAAAAAAAAAAAAAID/AQAA////fwBAAAAQAAAAAAAAAAAA+P8AAGDh//8DAAA0GAAAAAAAAAAAAID/HwAAAPj/HwAAgMIBAAAAAAAAAAAA/P8BAACA//8AAAAYXgAAAAAAAAAAAMD/fwAAAPz/BwAAAOOBAQAAAAAAAAAA/P8/AACA/z8AAABgbtQBAAAAAAAAAOD//w8AAPD/AwAAAAQIeAAAAAAAAAAA/P//AQAA/z8AAACAA4APAQAAAAAAAID//w8AAPD/AwAAAAARsEAAAAAAAAAA+P9/AAAA/j8AAAAAAAAAAAAAAAAAAAD//wcAAPD/QwAAAACAIwAAAAAAAAAA8P9/AAAA/z8EAAAAAD8GIAAAAAAAAAD8/wMAAPD/cQAAAAD4ZwAAAAAAAAAAgP8/AAAA/w8HAAAAgP8HAAAAAAAAAAD4/wMAAOD/MAAAAAD//wEBAAAAAAAAgP8PAAAA/g8DAAAA+P8fAAAAAAAAAAD4PwAAAOB/EAAAAID//wMAAAAAAAAAgP8DAAAA/AMAAAAA+P9/AAAAAAAAAAD8HwAAAMA/AAAAAID//wcAAAAAAAAAwP8BAAAA+AEAAAAA8P9/AAAAAAAAAAD8DwAAAIAPAAAAAAAP/gMAAAAAAAAAwB8AAAAAAAAAAAAAEIAfAAEAAAAAAAD+AwAAAAAAAAAAAAAA8AEgAAAAAAAA4AcAAAAAAAAAAAAAAAAAAAYAAAAAAABeAAAAAAAAAAAAAAAAwAAwAAAAAAAAwAMAAAAAAAAAAAAAAAAIgAEAAAAAAAAeAAAAAAAAAAAAAAAAAAAMAAAAAAAA4AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAABAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAB4AEDwn/8HAAAAAAAAAAAwAAAAAACA/P/h/////w8AAAAAAAAAwAcAAAD4////z///////PwAAAAAAHALwAACA//////////////8HAADw/y///wMAAP7/////////////HwAA+P///38AAID///////////////8AAPL/////BwAO////////////////DwAA8P////8HEPD//////////////z8AAOD/////////////////////////HwDgPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', GW = 180, GH = 90, bin = atob(LAND), bits = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bits[i] = bin.charCodeAt(i);
  function isLand(lat, lon) { var c = Math.min(GW - 1, Math.floor((lon + 180) / 360 * GW)), r = Math.min(GH - 1, Math.floor((90 - lat) / 180 * GH)), k = r * GW + c; return (bits[k >> 3] >> (k & 7)) & 1; }
  function vec(lat, lon) { var la = lat * Math.PI / 180, lo = lon * Math.PI / 180; return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)]; }
  // pontos de terra (fibonacci) -> distribuicao uniforme
  var pts = [], N = 13000, ga = Math.PI * (3 - Math.sqrt(5));
  for (var n = 0; n < N; n++) {
    var y = 1 - (n / (N - 1)) * 2, rr = Math.sqrt(1 - y * y), th = ga * n, x = Math.cos(th) * rr, z = Math.sin(th) * rr;
    var lat = Math.asin(y) * 180 / Math.PI, lon = Math.atan2(x, z) * 180 / Math.PI;
    if (isLand(lat, lon)) pts.push([x, y, z]);
  }
  var C = { sf: [37.8, -122.4], ny: [40.7, -74], sp: [-23.5, -46.6], ldn: [51.5, -0.1], lag: [6.5, 3.4], dxb: [25.2, 55.3], mum: [19.1, 72.9], tok: [35.7, 139.7], syd: [-33.9, 151.2], sin: [1.35, 103.8], cpt: [-33.9, 18.4], mex: [19.4, -99.1] };
  var pairs = [['sf', 'tok'], ['ny', 'ldn'], ['ldn', 'dxb'], ['sp', 'lag'], ['mum', 'syd'], ['ny', 'sp'], ['lag', 'cpt'], ['dxb', 'sin'], ['sin', 'syd'], ['mex', 'ny'], ['tok', 'sin'], ['ldn', 'lag'], ['sf', 'mex'], ['dxb', 'mum']];
  var arcs = pairs.map(function (p, i) {
    var a = vec(C[p[0]][0], C[p[0]][1]), b = vec(C[p[1]][0], C[p[1]][1]);
    var dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])), om = Math.acos(dot), seg = [], S = 40;
    for (var s = 0; s <= S; s++) {
      var t = s / S, k1 = Math.sin((1 - t) * om) / Math.sin(om), k2 = Math.sin(t * om) / Math.sin(om);
      var v = [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2], l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]), lift = 1 + Math.sin(Math.PI * t) * 0.22 * (om / 1.6 + .25);
      seg.push([v[0] / l * lift, v[1] / l * lift, v[2] / l * lift]);
    }
    return { seg: seg, a: p[0], b: p[1], off: (i * 0.9) % 7, per: 6.4 };
  });
  var rotY = 0.9, tilt = 0.36, vel = 0.16, drag = false, lastX = 0, W = 0, H = 0, R = 0, dpr = 1, visible = false, raf = 0, t0 = performance.now();
  function size() {
    var b = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
    W = Math.max(10, b.width); H = Math.max(10, b.height); cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); R = Math.min(W, H) / 2 - 6;
  }
  function rot(p) {
    var cy = Math.cos(rotY), sy = Math.sin(rotY), x = p[0] * cy + p[2] * sy, z = -p[0] * sy + p[2] * cy, y = p[1];
    var ct = Math.cos(tilt), st = Math.sin(tilt), y2 = y * ct - z * st, z2 = y * st + z * ct;
    return [x, y2, z2];
  }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function frame(now) {
    raf = 0; if (!visible) return;
    var dt = Math.min(.05, (now - t0) / 1000); t0 = now;
    if (!drag && !rm) rotY -= vel * dt;
    var T = now / 1000, cx = W / 2, cy = H / 2;
    ctx.clearRect(0, 0, W, H);
    // esfera
    var g = ctx.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R);
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#ececef');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.strokeStyle = '#d4d4d8'; ctx.lineWidth = 1; ctx.stroke();
    // terra
    for (var i = 0; i < pts.length; i++) {
      var q = rot(pts[i]); if (q[2] < -0.02) continue;
      var zz = Math.max(0, q[2]), a = .38 + .62 * zz, sz = 1.05 + .75 * zz;
      ctx.fillStyle = 'rgba(24,24,27,' + a.toFixed(2) + ')';
      ctx.fillRect(cx + q[0] * R - sz / 2, cy - q[1] * R - sz / 2, sz, sz);
    }
    // cidades que estao ativas
    var act = {};
    // arcos
    arcs.forEach(function (ar) {
      var ph = ((T + ar.off) % ar.per) / ar.per, head, alpha = 1;
      if (ph < .55) head = ease(ph / .55); else { head = 1; alpha = ph < .8 ? 1 : 1 - (ph - .8) / .2; }
      var n = Math.floor(head * (ar.seg.length - 1)), tailStart = ph < .55 ? 0 : Math.floor(((ph - .55) / .45) * .9 * (ar.seg.length - 1));
      var prev = null;
      for (var s = tailStart; s <= n; s++) {
        var q = rot(ar.seg[s]); var vis = q[2] > 0.0;
        var px = cx + q[0] * R, py = cy - q[1] * R;
        if (prev && vis && prev.v) {
          var k = (s - tailStart) / Math.max(1, n - tailStart);
          ctx.strokeStyle = 'rgba(0,122,255,' + (alpha * (.18 + .82 * k)).toFixed(2) + ')'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(px, py); ctx.stroke();
        }
        prev = { x: px, y: py, v: vis };
      }
      if (prev && prev.v && ph < .6) { ctx.fillStyle = '#007aff'; ctx.beginPath(); ctx.arc(prev.x, prev.y, 2.6, 0, 7); ctx.fill(); }
      if (ph > .05) act[ar.a] = Math.max(act[ar.a] || 0, 1 - Math.min(1, ph * 2));
      if (ph > .5 && ph < .9) act[ar.b] = Math.max(act[ar.b] || 0, 1 - (ph - .5) / .4);
    });
    // cidades
    Object.keys(C).forEach(function (k) {
      var q = rot(vec(C[k][0], C[k][1])); if (q[2] < 0.02) return;
      var px = cx + q[0] * R, py = cy - q[1] * R;
      ctx.fillStyle = '#34c759'; ctx.beginPath(); ctx.arc(px, py, 3, 0, 7); ctx.fill();
      var p = act[k]; if (p > 0) { ctx.strokeStyle = 'rgba(52,199,89,' + (p * .7).toFixed(2) + ')'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(px, py, 3 + (1 - p) * 13, 0, 7); ctx.stroke(); }
    });
    // brilho da borda
    var e = ctx.createRadialGradient(cx, cy, R * .78, cx, cy, R);
    e.addColorStop(0, 'rgba(255,255,255,0)'); e.addColorStop(1, 'rgba(255,255,255,.9)');
    ctx.fillStyle = e; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf) { t0 = performance.now(); raf = requestAnimationFrame(frame); } }
  size(); addEventListener('resize', function () { size(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: .05 }).observe(cv); else { visible = true; start(); }
  if (rm) { visible = true; frame(performance.now()); }
})();

/* ========== animacoes so rodam quando visiveis ========== */
(function () {
  if (!('IntersectionObserver' in window)) { Array.prototype.forEach.call(document.querySelectorAll('.sv'), function (e) { e.classList.add('live'); }); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('live', e.isIntersecting); }); }, { threshold: .18 });
  Array.prototype.forEach.call(document.querySelectorAll('.sv'), function (e) { io.observe(e); });
})();