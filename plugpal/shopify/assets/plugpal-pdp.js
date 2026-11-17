/* PlugPal product page (sections/plugpal-product.liquid). No libraries.
   Packs: finds the variant whose options match the chosen colour and pack size (1 / 3 / 6).
   If the product has no pack option, it adds the colour variant with quantity = pack size. */
(function () {
  'use strict';

  var root = document.getElementById('plugpal');
  if (!root || root.__pp) return;
  root.__pp = true;

  var $ = function (s, r) { return (r || root).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var data = {};
  try { data = JSON.parse(document.getElementById('plugpal-data').textContent); } catch (e) {}
  var product = data.product || { variants: [], options: [] };

  /* ---------- money ---------- */
  function money(cents) {
    if (window.Shopify && typeof window.Shopify.formatMoney === 'function') {
      try { return window.Shopify.formatMoney(cents, data.moneyFormat); } catch (e) {}
    }
    return '$' + (cents / 100).toFixed(2);
  }

  /* ---------- toast ---------- */
  var toastEl = $('[data-toast]');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 4500);
  }

  /* ---------- gallery ---------- */
  var slides = $$('.pp-gallery__slide');
  var thumbsWrap = $('[data-gallery-thumbs]');
  var countEl = $('[data-gallery-count]');
  var current = 0;
  var thumbs = slides.map(function (slide, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'pp-thumb' + (i === 0 ? ' pp-is-on' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Image ' + (i + 1));
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    var img = slide.querySelector('.pp-media > img');
    if (img) {
      b.innerHTML = '<img alt="" loading="lazy">';
      b.firstChild.src = img.getAttribute('src');
    } else {
      var use = slide.querySelector('.pp-ph__icon use');
      b.innerHTML = '<svg class="pp-icon" aria-hidden="true"><use href="' + (use ? use.getAttribute('href') : '#i-image') + '"/></svg>';
    }
    b.addEventListener('click', function () { show(i); });
    if (thumbsWrap) thumbsWrap.appendChild(b);
    return b;
  });
  function show(i) {
    if (!slides.length) return;
    current = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('pp-is-on', k === current); });
    thumbs.forEach(function (t, k) {
      t.classList.toggle('pp-is-on', k === current);
      t.setAttribute('aria-selected', k === current ? 'true' : 'false');
    });
    if (countEl) countEl.textContent = (current + 1) + ' / ' + slides.length;
    var t = thumbs[current];
    if (t && thumbsWrap && thumbsWrap.scrollWidth > thumbsWrap.clientWidth) {
      thumbsWrap.scrollTo({ left: t.offsetLeft - 8, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }
  var gPrev = $('[data-gallery-prev]'), gNext = $('[data-gallery-next]');
  if (gPrev) gPrev.addEventListener('click', function () { show(current - 1); });
  if (gNext) gNext.addEventListener('click', function () { show(current + 1); });
  var stage = $('.pp-gallery__stage');
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

  /* ---------- variants ---------- */
  var optNames = (product.options || []).map(function (o) { return String(o.name || o).toLowerCase(); });
  var colourIdx = optNames.findIndex(function (n) { return /colou?r|finish/.test(n); });
  var packIdx = optNames.findIndex(function (n) { return /pack|bundle|quantity|qty|units?|size/.test(n); });
  if (packIdx < 0) {
    // an option whose every value starts with a number counts as the pack option
    optNames.forEach(function (_, idx) {
      if (packIdx > -1 || idx === colourIdx) return;
      var all = (product.variants || []).every(function (v) { return /^\s*\d/.test(v.options[idx] || ''); });
      if (all && (product.variants || []).length) packIdx = idx;
    });
  }
  function packOf(v) { return packIdx < 0 ? null : parseInt(String(v.options[packIdx]).match(/\d+/), 10); }
  function colourMatches(v, colour) {
    return colourIdx < 0 || String(v.options[colourIdx]).toLowerCase().indexOf(colour) > -1;
  }
  function lineFor(colour, qty) {
    var vs = (product.variants || []).filter(function (v) { return colourMatches(v, colour); });
    if (packIdx > -1) {
      var v = vs.filter(function (x) { return packOf(x) === qty; })[0];
      return v ? { variant: v, quantity: 1, price: v.price, single: vs.filter(function (x) { return packOf(x) === 1; })[0] } : null;
    }
    if (colourIdx < 0 && (product.variants || []).length > 1) return null; // can't tell which variant is which
    return vs[0] ? { variant: vs[0], quantity: qty, price: vs[0].price * qty, single: vs[0] } : null;
  }

  // Hide colours the product doesn't sell; hide the picker if the product has no colour option.
  var colourWrap = $('[data-colours]');
  if (colourWrap && (product.variants || []).length) {
    if (colourIdx < 0) {
      colourWrap.hidden = true;
      var lbl = colourWrap.previousElementSibling;
      if (lbl && lbl.classList.contains('pp-picker-label')) lbl.hidden = true;
    } else {
      $$('[data-colour]', colourWrap).forEach(function (b) {
        var c = b.getAttribute('data-colour');
        var has = product.variants.some(function (v) { return colourMatches(v, c); });
        if (!has) b.hidden = true;
      });
    }
  }

  /* ---------- colour + pack pickers ---------- */
  var state = { colour: 'white', qty: 6 };
  function radioGroup(container, attr, key) {
    if (!container) return null;
    var opts = $$('[role="radio"]', container).filter(function (o) { return !o.hidden; });
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
    opts.forEach(function (o) {
      o.addEventListener('click', function () { select(o); });
      o.addEventListener('keydown', function (e) {
        var i = opts.indexOf(o);
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select(opts[(i + 1) % opts.length], true); }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select(opts[(i - 1 + opts.length) % opts.length], true); }
      });
    });
    var on = opts.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0] || opts[0];
    if (on) {
      opts.forEach(function (x) { x.tabIndex = x === on ? 0 : -1; x.setAttribute('aria-checked', x === on ? 'true' : 'false'); });
      state[key] = key === 'qty' ? parseInt(on.getAttribute(attr), 10) : on.getAttribute(attr);
    }
    return select;
  }
  var bundlesEl = $('[data-bundles]');
  var selectBundle = radioGroup(bundlesEl, 'data-qty', 'qty');
  radioGroup(colourWrap, 'data-colour', 'colour');

  function parsePrice(text) {
    var m = String(text).replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
    return m ? Math.round(parseFloat(m[1]) * 100) : null;
  }

  function renderPrices() {
    $$('.pp-bundle', bundlesEl).forEach(function (b) {
      var qty = parseInt(b.getAttribute('data-qty'), 10);
      var nowEl = b.querySelector('.pp-bundle__now');
      var wasEl = b.querySelector('.pp-bundle__was');
      var perEl = b.querySelector('.pp-bundle__per');
      var line = lineFor(state.colour, qty);
      var price, was = null;
      if (line) {
        price = line.price;
        var v = line.variant;
        if (v.compare_at_price && v.compare_at_price > v.price) was = v.compare_at_price * line.quantity;
        else if (qty > 1 && line.single && line.single.price * qty > price) was = line.single.price * qty;
        nowEl.textContent = money(price);
        if (wasEl) { wasEl.textContent = was ? money(was) : ''; wasEl.hidden = !was; }
        b.classList.toggle('pp-is-soldout', !v.available);
      } else {
        price = parsePrice(nowEl.textContent);
        if (wasEl) wasEl.hidden = !wasEl.textContent.trim();
      }
      if (perEl) perEl.textContent = price ? money(Math.round(price / qty)) + ' per room' : '';
    });
  }

  function imgSrc(v) {
    var fi = v && (v.featured_image || (v.featured_media && v.featured_media.preview_image));
    var src = fi && fi.src;
    if (!src) return null;
    return src + (src.indexOf('?') > -1 ? '&' : '?') + 'width=160';
  }
  function renderColour() {
    var nameEl = $('[data-colour-name]');
    if (nameEl) nameEl.textContent = state.colour.charAt(0).toUpperCase() + state.colour.slice(1);
    $$('.pp-bundle', bundlesEl).forEach(function (b) {
      var img = b.querySelector('[data-pack-img]');
      var line = lineFor(state.colour, parseInt(b.getAttribute('data-qty'), 10));
      var src = line && imgSrc(line.variant);
      if (img && src) img.src = src;
    });
  }

  function update() {
    renderPrices();
    renderColour();
    var b = bundlesEl && $('[data-qty="' + state.qty + '"]', bundlesEl);
    if (b) {
      var name = b.querySelector('.pp-bundle__name').firstChild.textContent.trim();
      var pill = b.querySelector('.pp-bundle__pill').textContent.trim();
      var nameEl = $('[data-sticky-name]'), priceEl = $('[data-sticky-price]');
      var colourShown = colourWrap && !colourWrap.hidden;
      var colour = state.colour.charAt(0).toUpperCase() + state.colour.slice(1);
      if (nameEl) nameEl.textContent = name + ' – ' + pill + (colourShown ? ' · ' + colour : '');
      if (priceEl) priceEl.textContent = b.querySelector('.pp-bundle__now').textContent;
    }
    var gifts = $$('[data-gifts] .pp-gift');
    var unlocked = 0;
    var mins = gifts.map(function (g) { return parseInt(g.getAttribute('data-min'), 10) || 0; });
    var minGift = Math.min.apply(null, mins.concat([99])), maxGift = Math.max.apply(null, mins.concat([0]));
    gifts.forEach(function (g) {
      var min = parseInt(g.getAttribute('data-min'), 10);
      var ok = state.qty >= min;
      if (ok) unlocked++;
      g.classList.toggle('pp-is-locked', !ok);
      var s = g.querySelector('[data-state]');
      if (s) s.innerHTML = ok
        ? '<svg class="pp-icon" aria-hidden="true"><use href="#i-check"/></svg>Unlocked'
        : '<svg class="pp-icon" aria-hidden="true"><use href="#i-lock"/></svg>With ' + (min >= 6 ? min + '-pack' : min + '+ pack');
    });
    var note = $('[data-gifts-note]');
    if (note) {
      note.textContent = unlocked === gifts.length
        ? 'All ' + gifts.length + ' free gifts unlocked with this pack.'
        : unlocked === 0
          ? 'Pick a ' + minGift + '-pack or bigger to unlock free gifts.'
          : unlocked + ' of ' + gifts.length + ' free gifts unlocked. Go to the ' + maxGift + '-pack for all ' + gifts.length + '.';
    }
  }
  update();

  $$('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function () {
      var target = bundlesEl && $('[data-qty="' + a.getAttribute('data-pick') + '"]', bundlesEl);
      if (target && selectBundle) selectBundle(target);
    });
  });

  /* ---------- buy ---------- */
  function buy(btn) {
    var line = lineFor(state.colour, state.qty);
    if (!line) { toast('This pack isn’t set up as a variant yet. Add it to the product in Shopify.'); return; }
    if (!line.variant.available) { toast('That pack is sold out right now.'); return; }
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    fetch(data.cartAdd || '/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: [{ id: line.variant.id, quantity: line.quantity }] })
    })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw j; return j; }); })
      .then(function () {
        window.location.href = data.afterAdd === 'cart' ? (data.cartUrl || '/cart') : (data.checkout || '/checkout');
      })
      .catch(function (err) {
        toast((err && (err.description || err.message)) || 'Couldn’t add that to your cart. Try again.');
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
      });
  }
  $$('[data-buy]').forEach(function (btn) { btn.addEventListener('click', function () { buy(btn); }); });

  /* ---------- sticky bar ---------- */
  var sticky = $('[data-sticky]');
  var mainBuy = $('.pp-buy [data-buy]');
  var footer = document.querySelector('footer, #fcf');
  if (sticky && mainBuy && 'IntersectionObserver' in window) {
    var pastBuy = false, atFooter = false;
    var set = function () {
      var on = pastBuy && !atFooter;
      sticky.classList.toggle('pp-is-on', on);
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
  $$('[data-acc] .pp-acc__btn').forEach(function (btn) {
    var panel = btn.nextElementSibling;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.hidden = open;
    });
  });

  /* ---------- video row ---------- */
  var track = $('[data-reel-track]');
  var rPrev = $('[data-reel-prev]'), rNext = $('[data-reel-next]');
  function reelButtons() {
    if (!track) return;
    var max = track.scrollWidth - track.clientWidth - 2;
    if (rPrev) rPrev.disabled = track.scrollLeft <= 2;
    if (rNext) rNext.disabled = track.scrollLeft >= max;
  }
  function reelStep(dir) {
    var item = track && track.querySelector('.pp-reel__item');
    if (!item) return;
    track.scrollBy({ left: dir * (item.getBoundingClientRect().width + 16), behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  if (track) {
    if (rPrev) rPrev.addEventListener('click', function () { reelStep(-1); });
    if (rNext) rNext.addEventListener('click', function () { reelStep(1); });
    track.addEventListener('scroll', reelButtons, { passive: true });
    window.addEventListener('resize', reelButtons);
    reelButtons();
    // tap a video to turn its sound on or off
    $$('.pp-reel__item video', track).forEach(function (v) {
      v.addEventListener('click', function () { v.muted = !v.muted; if (v.paused) v.play(); });
    });
  }

  /* ---------- night light demo ---------- */
  var night = $('[data-night]');
  var nToggle = $('[data-night-toggle]');
  if (night && nToggle) {
    nToggle.addEventListener('click', function () {
      var dark = nToggle.getAttribute('aria-pressed') !== 'true';
      nToggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
      night.classList.toggle('pp-is-dark', dark);
      $('[data-night-label]').textContent = dark ? 'Turn the lights back on' : 'Turn the lights off';
      $('[data-night-caption]').textContent = dark
        ? 'Dark. The sensor switches the night light on.'
        : 'Daytime. The light stays off.';
    });
  }
})();
