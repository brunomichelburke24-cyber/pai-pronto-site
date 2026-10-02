// Pai Pronto: interações da página (sem framework).
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Fases: abas que trocam sozinhas a cada 5 s até a pessoa clicar.
  var PH = [
    { thought: '"Não sei se estou ajudando ou atrapalhando."', res: 'Ela não precisa te pedir nada. A casa funciona e a noite tem dono.' },
    { thought: '"Tenho medo de segurar errado."', res: 'Você troca, faz arrotar e dá banho sem travar, mesmo depois que a licença acaba.' },
    { thought: '"Será que isso é normal?"', res: 'Você sabe de cor os sinais de alerta, e o sono seguro está conferido.' },
    { thought: '"Quero que ele cresça me querendo por perto."', res: 'O ritual diário está firme e ele acalma no seu colo.' }
  ];
  var tabs = $$('[data-dc-tpl="68"]');
  var thought = $('[data-dc-tpl="76"]');
  var result = $('[data-dc-tpl="79"]');
  var phase = 0, auto = true;
  function setPhase(i) {
    phase = i;
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.style.background = on ? '#E4572E' : '#17160F';
      t.style.color = on ? '#17160F' : '#FAF8F4';
      t.setAttribute('aria-pressed', on ? 'true' : 'false');
      var bar = $('[data-dc-tpl="72"]', t);
      if (bar) {
        bar.innerHTML = '';
        if (on) {
          var fill = document.createElement('div');
          fill.style.cssText = 'height:100%;background:#17160F;' + (auto && !reduce ? 'width:0;animation:fill 5s linear forwards' : 'width:100%');
          bar.appendChild(fill);
        }
      }
    });
    if (thought) thought.textContent = PH[i].thought;
    if (result) result.textContent = PH[i].res;
  }
  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () { auto = false; setPhase(k); });
  });
  if (tabs.length) {
    setPhase(0);
    setInterval(function () { if (auto) setPhase((phase + 1) % tabs.length); }, 5000);
  }

  // 2. Amostra do checklist: tocar marca e desmarca.
  var days = $$('[data-dc-tpl="90"]');
  var msg = $('[data-dc-tpl="96"]');
  var done = days.map(function () { return false; });
  function renderDays() {
    days.forEach(function (d, i) {
      var box = $('[data-dc-tpl="95"]', d), title = $('[data-dc-tpl="93"]', d);
      if (box) { box.style.background = done[i] ? '#E4572E' : 'transparent'; box.textContent = done[i] ? '✓' : ''; }
      if (title) title.style.textDecoration = done[i] ? 'line-through' : 'none';
      d.setAttribute('aria-pressed', done[i] ? 'true' : 'false');
    });
    var n = done.filter(Boolean).length;
    if (msg) msg.textContent = n === 3 ? '3 de 30 feitos. Faltam 27 dias no mesmo formato.'
      : n ? n + ' de 3 marcados. E mais 27 dias no mesmo formato.'
      : 'Toque pra marcar. E mais 27 dias no mesmo formato.';
  }
  days.forEach(function (d, i) { d.addEventListener('click', function () { done[i] = !done[i]; renderDays(); }); });
  renderDays();

  // 3. Barra fixa de compra: aparece depois que a pessoa passa do topo.
  var sticky = $('[data-dc-tpl="179"]');
  function onScroll() {
    if (!sticky) return;
    sticky.style.transform = window.scrollY > window.innerHeight * 0.8 ? 'translateY(0)' : 'translateY(110%)';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 4. Lanterna: brilho que segue o mouse ou o dedo.
  var lamp = document.getElementById('lanterna');
  if (lamp) {
    var raf = 0, px = 0, py = 0;
    var move = function (e) {
      var t = e.touches ? e.touches[0] : e; if (!t) return;
      px = t.clientX; py = t.clientY;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        lamp.style.setProperty('--mx', px + 'px');
        lamp.style.setProperty('--my', py + 'px');
        lamp.style.opacity = 1;
      });
    };
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('touchmove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', function () { lamp.style.opacity = 0; });
  }

  // 5. Blocos que sobem ao aparecer na tela.
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.style.opacity = 1; e.target.style.translate = '0 0'; io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    $$('[data-reveal]').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.style.opacity = 0; el.style.translate = '0 28px';
      el.style.transition = (el.style.transition ? el.style.transition + ',' : '') + 'opacity .7s ease, translate .7s cubic-bezier(.2,.7,.2,1)';
      io.observe(el);
    });
  }

  // 6. Pixel: clique no botão de compra vira InitiateCheckout.
  Array.prototype.slice.call(document.querySelectorAll('a[href*="pay.hotmart.com"]')).forEach(function (el) {
    el.addEventListener('click', function () {
      if (window.fbq) window.fbq('track', 'InitiateCheckout', { content_name: 'Pai Pronto', value: 67, currency: 'BRL' });
    });
  });
})();
