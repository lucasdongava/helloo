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

  // palavra que gira
  $$('.rot').forEach(function (el) {
    var words = el.getAttribute('data-words').split(','), i = 0, inn = el.querySelector('.rot-in');
    if (rm) return;
    setInterval(function () {
      inn.classList.add('out');
      setTimeout(function () {
        i = (i + 1) % words.length; inn.textContent = words[i];
        inn.classList.remove('out'); inn.classList.add('pre'); void inn.offsetWidth; inn.classList.remove('pre');
      }, 450);
    }, 2200);
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