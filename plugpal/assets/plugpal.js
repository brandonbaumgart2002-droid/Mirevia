/* PlugPal single-product site — behaviour. No libraries. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CHECKOUT SETUP
     Paste your Shopify variant IDs here (Products → PlugPal → variant →
     the number at the end of the URL).
     - One variant per pack:  white: { 1: '4512…', 2: '4512…', 4: '4512…' }
     - One variant, pack = quantity:  white: '4512…'
     Until IDs are added, the buy buttons show a notice instead.
     ------------------------------------------------------------------ */
  var CONFIG = {
    store: 'https://mirevia.com.co',
    variants: {
      white: { 1: '', 2: '', 4: '' },
      black: { 1: '', 2: '', 4: '' }
    }
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- toast ---------- */
  var toastEl = $('[data-toast]');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 4200);
  }

  /* ---------- images: drop files into /images and they replace the briefs ---------- */
  $$('[data-src]').forEach(function (box) {
    var img = new Image();
    img.alt = box.getAttribute('data-alt') || '';
    img.decoding = 'async';
    img.loading = 'lazy';
    img.onload = function () {
      box.insertBefore(img, box.firstChild);
      box.classList.add('has-img');
      syncThumb(box);
    };
    img.src = box.getAttribute('data-src');
  });

  /* ---------- announcement rotator ---------- */
  var msgs = $$('[data-rotate] .announce__msg');
  if (msgs.length > 1) {
    var mi = 0;
    setInterval(function () {
      msgs[mi].classList.remove('is-on');
      mi = (mi + 1) % msgs.length;
      msgs[mi].classList.add('is-on');
    }, 3800);
  }

  /* ---------- header border ---------- */
  var header = $('[data-header]');
  function onScroll() { if (header) header.classList.toggle('is-stuck', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- gallery ---------- */
  var gallery = $('[data-gallery]');
  var slides = gallery ? $$('.gallery__slide', gallery) : [];
  var thumbsWrap = $('[data-gallery-thumbs]');
  var countEl = $('[data-gallery-count]');
  var current = 0;
  var thumbs = [];

  slides.forEach(function (slide, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb' + (i === 0 ? ' is-on' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Image ' + (i + 1));
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    var use = slide.querySelector('.ph__icon use');
    var href = use ? use.getAttribute('href') : '#i-image';
    b.innerHTML = '<svg class="icon" aria-hidden="true"><use href="' + href + '"/></svg>';
    b.addEventListener('click', function () { show(i); });
    thumbsWrap && thumbsWrap.appendChild(b);
    thumbs.push(b);
  });

  function syncThumb(box) {
    var slide = box.closest('.gallery__slide');
    if (!slide) return;
    var i = slides.indexOf(slide);
    var img = box.querySelector('img');
    if (i > -1 && thumbs[i] && img) thumbs[i].innerHTML = '<img src="' + img.src + '" alt="">';
  }

  function show(i) {
    if (!slides.length) return;
    current = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('is-on', k === current); });
    thumbs.forEach(function (t, k) {
      t.classList.toggle('is-on', k === current);
      t.setAttribute('aria-selected', k === current ? 'true' : 'false');
    });
    if (countEl) countEl.textContent = (current + 1) + ' / ' + slides.length;
    var t = thumbs[current];
    if (t && thumbsWrap && thumbsWrap.scrollWidth > thumbsWrap.clientWidth) {
      thumbsWrap.scrollTo({ left: t.offsetLeft - 8, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }
  var prevBtn = $('[data-gallery-prev]');
  var nextBtn = $('[data-gallery-next]');
  prevBtn && prevBtn.addEventListener('click', function () { show(current - 1); });
  nextBtn && nextBtn.addEventListener('click', function () { show(current + 1); });

  // swipe
  var stage = gallery && $('.gallery__stage', gallery);
  if (stage) {
    var x0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ---------- colour + bundles ---------- */
  var state = { colour: 'white', qty: 4 };

  function radioGroup(container, attr, key) {
    if (!container) return;
    var opts = $$('[role="radio"]', container);
    opts.forEach(function (o) {
      o.addEventListener('click', function () { select(o); });
      o.addEventListener('keydown', function (e) {
        var i = opts.indexOf(o);
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select(opts[(i + 1) % opts.length], true); }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select(opts[(i - 1 + opts.length) % opts.length], true); }
      });
    });
    function select(o, focus) {
      opts.forEach(function (x) {
        x.setAttribute('aria-checked', x === o ? 'true' : 'false');
        x.tabIndex = x === o ? 0 : -1;
      });
      var v = o.getAttribute(attr);
      state[key] = key === 'qty' ? parseInt(v, 10) : v;
      if (focus) o.focus();
      update();
    }
    var on = opts.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0] || opts[0];
    opts.forEach(function (x) { x.tabIndex = x === on ? 0 : -1; });
    state[key] = key === 'qty' ? parseInt(on.getAttribute(attr), 10) : on.getAttribute(attr);
    return select;
  }

  var bundlesEl = $('[data-bundles]');
  var selectBundle = radioGroup(bundlesEl, 'data-qty', 'qty');
  radioGroup($('[data-colours]'), 'data-colour', 'colour');

  function currentBundle() {
    return bundlesEl ? $('[data-qty="' + state.qty + '"]', bundlesEl) : null;
  }

  function update() {
    var b = currentBundle();
    if (b) {
      var name = b.querySelector('.bundle__name').firstChild.textContent.trim();
      var pill = b.querySelector('.bundle__pill').textContent.trim();
      var price = b.querySelector('.bundle__now').textContent.trim();
      var nameEl = $('[data-sticky-name]');
      var priceEl = $('[data-sticky-price]');
      var colour = state.colour.charAt(0).toUpperCase() + state.colour.slice(1);
      if (nameEl) nameEl.textContent = name + ' – ' + pill + ' · ' + colour;
      if (priceEl) priceEl.textContent = price;
    }
    // gifts
    var gifts = $$('[data-gifts] .gift');
    var unlocked = 0;
    gifts.forEach(function (g) {
      var min = parseInt(g.getAttribute('data-min'), 10);
      var ok = state.qty >= min;
      if (ok) unlocked++;
      g.classList.toggle('is-locked', !ok);
      var s = g.querySelector('[data-state]');
      if (s) s.innerHTML = ok
        ? '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Unlocked'
        : '<svg class="icon" aria-hidden="true"><use href="#i-lock"/></svg>With ' + (min === 4 ? '4-pack' : '2+ pack');
    });
    var note = $('[data-gifts-note]');
    if (note) {
      note.textContent = unlocked === gifts.length
        ? 'All ' + gifts.length + ' free gifts unlocked with this pack.'
        : unlocked === 0
          ? 'Pick a 2-pack or bigger to unlock free gifts.'
          : unlocked + ' of ' + gifts.length + ' free gifts unlocked. Go to the 4-pack for all ' + gifts.length + '.';
    }
  }
  update();

  // "whole-home pack" links elsewhere on the page
  $$('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function () {
      var target = bundlesEl && $('[data-qty="' + a.getAttribute('data-pick') + '"]', bundlesEl);
      if (target && selectBundle) selectBundle(target);
    });
  });

  /* ---------- buy ---------- */
  $$('[data-buy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var v = CONFIG.variants[state.colour];
      var id = typeof v === 'string' ? v : v && v[state.qty];
      var qty = typeof v === 'string' ? state.qty : 1;
      if (!id) {
        toast('Checkout isn’t connected yet. Add your Shopify variant IDs in assets/plugpal.js.');
        return;
      }
      window.location.href = CONFIG.store.replace(/\/$/, '') + '/cart/' + id + ':' + qty;
    });
  });

  /* ---------- sticky bar ---------- */
  var sticky = $('[data-sticky]');
  var mainBuy = $('.buy [data-buy]');
  var footer = $('.footer');
  if (sticky && mainBuy && 'IntersectionObserver' in window) {
    var pastBuy = false, atFooter = false;
    var set = function () {
      var on = pastBuy && !atFooter;
      sticky.classList.toggle('is-on', on);
      sticky.setAttribute('aria-hidden', on ? 'false' : 'true');
      var sb = sticky.querySelector('[data-buy]');
      if (sb) sb.tabIndex = on ? 0 : -1;
    };
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { pastBuy = !e.isIntersecting && e.boundingClientRect.top < 0; });
      set();
    }).observe(mainBuy);
    if (footer) new IntersectionObserver(function (es) {
      es.forEach(function (e) { atFooter = e.isIntersecting; });
      set();
    }).observe(footer);
  }

  /* ---------- accordions ---------- */
  $$('[data-acc] .acc__btn').forEach(function (btn) {
    var panel = btn.nextElementSibling;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.hidden = open;
    });
  });

  /* ---------- video reel ---------- */
  var track = $('[data-reel-track]');
  var rPrev = $('[data-reel-prev]');
  var rNext = $('[data-reel-next]');
  function reelButtons() {
    if (!track) return;
    var max = track.scrollWidth - track.clientWidth - 2;
    if (rPrev) rPrev.disabled = track.scrollLeft <= 2;
    if (rNext) rNext.disabled = track.scrollLeft >= max;
  }
  function reelStep(dir) {
    var item = track && track.querySelector('.reel__item');
    if (!item) return;
    track.scrollBy({ left: dir * (item.getBoundingClientRect().width + 16), behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  if (track) {
    rPrev && rPrev.addEventListener('click', function () { reelStep(-1); });
    rNext && rNext.addEventListener('click', function () { reelStep(1); });
    track.addEventListener('scroll', reelButtons, { passive: true });
    window.addEventListener('resize', reelButtons);
    reelButtons();
  }

  /* ---------- night light demo ---------- */
  var night = $('[data-night]');
  var nToggle = $('[data-night-toggle]');
  if (night && nToggle) {
    nToggle.addEventListener('click', function () {
      var dark = nToggle.getAttribute('aria-pressed') !== 'true';
      nToggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
      night.classList.toggle('is-dark', dark);
      $('[data-night-label]').textContent = dark ? 'Turn the lights back on' : 'Turn the lights off';
      $('[data-night-caption]').textContent = dark
        ? 'Dark. The sensor switches the night light on.'
        : 'Daytime. The light stays off.';
    });
  }

  /* ---------- newsletter (wire to Shopify's customer form when moved into the theme) ---------- */
  var form = $('[data-signup]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (!input.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        toast('Enter an email address like name@example.com.');
        input.focus();
        return;
      }
      form.hidden = true;
      $('[data-signup-ok]').hidden = false;
    });
  }
})();
