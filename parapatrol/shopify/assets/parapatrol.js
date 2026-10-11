/*
  ParaPatrol PDP behaviour. No dependencies.
  - Shared purchase state across every [data-pp-buybox] (hero, final CTA) and the sticky bar
  - Add to cart via /cart/add.js with selling_plan; opens the theme cart drawer when it can
  - Gallery, accordions, review filter, bundle add, headline A/B (?h=a|b|c)
  - Highlights [VERIFY …], [IMG: …] and [SETUP] text so open items are easy to spot
  - Re-initialises sections in the theme editor
  Loaded by several sections; the guard makes it run once.
*/
(function () {
  'use strict';
  if (window.__parapatrol) return;
  window.__parapatrol = true;

  var MAX_QTY = 10;
  var data = null;   // product JSON from the first buy box
  var state = null;  // { variantId, plan: 'sub'|'once', planId, qty }

  /* ---------------- helpers ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function formatMoney(cents, format) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    format = format || '${{amount}}';
    function delimit(n, precision, thousands, decimal) {
      thousands = thousands === undefined ? ',' : thousands;
      decimal = decimal === undefined ? '.' : decimal;
      if (isNaN(n) || n == null) return '0';
      n = (n / 100).toFixed(precision);
      var parts = n.split('.');
      var whole = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      return whole + (parts[1] ? decimal + parts[1] : '');
    }
    var m = format.match(/\{\{\s*(\w+)\s*\}\}/);
    var value;
    switch (m ? m[1] : 'amount') {
      case 'amount_no_decimals': value = delimit(cents, 0); break;
      case 'amount_with_comma_separator': value = delimit(cents, 2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': value = delimit(cents, 0, '.', ','); break;
      case 'amount_with_apostrophe_separator': value = delimit(cents, 2, "'", '.'); break;
      default: value = delimit(cents, 2);
    }
    return format.replace(/\{\{\s*\w+\s*\}\}/, value);
  }
  function money(c) { return formatMoney(c, data && data.moneyFormat); }

  function variant() {
    if (!data) return null;
    for (var i = 0; i < data.variants.length; i++) if (data.variants[i].id === state.variantId) return data.variants[i];
    return data.variants[0];
  }
  function currentPlan(v) {
    v = v || variant();
    if (!v || !v.plans.length) return null;
    for (var i = 0; i < v.plans.length; i++) if (v.plans[i].id === state.planId) return v.plans[i];
    return v.plans[0];
  }
  function unitPrice() {
    var v = variant();
    if (state.plan === 'sub') { var p = currentPlan(v); if (p) return p.price; }
    return v.price;
  }
  function total() { return unitPrice() * state.qty; }

  /* ---------------- toast ---------------- */
  var toastTimer;
  function toast(msg) {
    var el = $('[data-pp-toast]');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('opacity-0', '-translate-y-2');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.add('opacity-0', '-translate-y-2'); }, 2800);
  }

  /* ---------------- cart ---------------- */
  function mainEl() { return $('[data-pp-main]'); }
  function cartAddUrl() { var m = mainEl(); return ((m && m.getAttribute('data-cart-add-url')) || '/cart/add') + '.js'; }
  function cartUrl() { var m = mainEl(); return (m && m.getAttribute('data-cart-url')) || '/cart'; }
  function afterAdd() { var m = mainEl(); return (m && m.getAttribute('data-after-add')) || 'drawer'; }

  function updateCartCount() {
    var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    fetch(root + 'cart.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        $$('[data-cart-count], .cart-count-bubble span[aria-hidden="true"], .cart-count').forEach(function (el) { el.textContent = cart.item_count; });
        document.dispatchEvent(new CustomEvent('cart:refresh', { detail: { cart: cart } }));
      })
      .catch(function () {});
  }

  function addItems(items, label) {
    var mode = afterAdd();
    var drawer = $('cart-drawer') || $('cart-notification');
    var body = { items: items };
    var useDrawer = mode === 'drawer' && drawer && typeof drawer.getSectionsToRender === 'function' && typeof drawer.renderContents === 'function';
    if (useDrawer) {
      body.sections = drawer.getSectionsToRender().map(function (s) { return s.section || s.id; });
      body.sections_url = window.location.pathname;
    }
    return fetch(cartAddUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(body)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, json: j }; }); })
      .then(function (res) {
        if (!res.ok || res.json.status) throw new Error(res.json.description || res.json.message || 'Sorry, we couldn’t add that to your bag.');
        document.dispatchEvent(new CustomEvent('parapatrol:added', { detail: { items: items, response: res.json } }));
        if (mode === 'cart') { window.location.href = cartUrl(); return; }
        if (useDrawer) {
          var first = (res.json.items && res.json.items[0]) || {};
          var payload = Object.assign({}, first, { sections: res.json.sections });
          drawer.classList.remove('is-empty');
          drawer.renderContents(payload);
          return;
        }
        toast(label);
        updateCartCount();
      });
  }

  /* ---------------- buy boxes ---------------- */
  function initState() {
    var box = $('[data-pp-buybox]');
    if (!box) return false;
    try { data = JSON.parse($('[data-pp-buybox-json]', box).textContent); } catch (e) { return false; }
    var input = $('[data-pp-variant-input]', box);
    var vid = input ? Number(input.value) : data.variants[0].id;
    state = { variantId: vid, plan: 'once', planId: null, qty: 1 };
    var v = variant();
    if (v && v.plans.length) { state.plan = 'sub'; state.planId = v.plans[0].id; }
    return true;
  }

  function bindBox(box) {
    if (box.__ppBound) return;
    box.__ppBound = true;

    $$('[data-pp-plan]', box).forEach(function (r) {
      r.addEventListener('change', function () { if (r.checked) { state.plan = r.getAttribute('data-pp-plan'); renderBoxes(); } });
    });
    var freq = $('[data-pp-freq]', box);
    if (freq) freq.addEventListener('change', function () { state.planId = Number(freq.value); state.plan = 'sub'; renderBoxes(); });
    var vsel = $('[data-pp-variant]', box);
    if (vsel) vsel.addEventListener('change', function () {
      state.variantId = Number(vsel.value);
      var v = variant();
      if (!v.plans.length && !data.requiresPlan) state.plan = 'once';
      renderBoxes();
    });
    $$('[data-pp-qty]', box).forEach(function (b) {
      b.addEventListener('click', function () { setQty(state.qty + Number(b.getAttribute('data-pp-qty'))); });
    });
    var qi = $('[data-pp-qty-input]', box);
    if (qi) qi.addEventListener('change', function () { setQty(parseInt(qi.value, 10) || 1); });

    var form = $('form', box);
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); addFromState(box); });
  }

  function setQty(n) { state.qty = Math.max(1, Math.min(MAX_QTY, n)); renderBoxes(); }

  function renderBoxes() {
    if (!state) return;
    var v = variant();
    var plan = currentPlan(v);
    var sub = state.plan === 'sub' && plan;
    var gap = data.freeShipping > 0 ? data.freeShipping - total() : null;
    var FREE_ALL = 'Free shipping on every order.';

    // Hero price line under the title follows the chosen plan
    var hp = $('[data-pp-hero-price]');
    if (hp) {
      hp.textContent = money(sub ? plan.price : v.price);
      var hc = $('[data-pp-hero-compare]'), hs = $('[data-pp-hero-save]'), hn = $('[data-pp-hero-note]');
      [hc, hs, hn].forEach(function (el) { if (el) el.hidden = !sub; });
      if (hc) hc.textContent = money(v.price);
    }

    $$('[data-pp-buybox]').forEach(function (box) {
      var bundled = hasBundles(box);
      box.classList.toggle('pp-has-bundles', bundled);
      var vi = $('[data-pp-variant-input]', box); if (vi) vi.value = v.id;
      var vs = $('[data-pp-variant]', box); if (vs) vs.value = v.id;

      $$('[data-pp-plan]', box).forEach(function (r) {
        var kind = r.getAttribute('data-pp-plan');
        r.checked = kind === (sub ? 'sub' : 'once');
        if (kind === 'sub' && plan) r.value = plan.id;
      });
      $$('[data-pp-dot]', box).forEach(function (d) {
        d.style.visibility = d.getAttribute('data-pp-dot') === (sub ? 'sub' : 'once') ? 'visible' : 'hidden';
        d.classList.remove('invisible');
      });
      var fw = $('[data-pp-freq-wrap]', box); if (fw) fw.hidden = !sub;
      var fq = $('[data-pp-freq]', box); if (fq && plan) fq.value = plan.id;

      var sp = $('[data-pp-sub-price]', box); if (sp && plan) sp.textContent = money(plan.price);
      var cp = $('[data-pp-compare]', box); if (cp) cp.textContent = money(v.price);
      var op = $('[data-pp-once-price]', box); if (op) op.textContent = money(v.price);
      var sv = $('[data-pp-save]', box);
      if (sv && plan) {
        var pct = Math.floor((v.price - plan.price) * 100 / v.price);
        sv.textContent = 'SAVE ' + pct + '%'; sv.hidden = pct <= 0;
      }

      if (bundled) { syncBundle(box); return; } // quantity, label and shipping come from the bundle
      var qi = $('[data-pp-qty-input]', box); if (qi) qi.value = state.qty;
      var dec = $('[data-pp-qty="-1"]', box); if (dec) dec.disabled = state.qty <= 1;
      var inc = $('[data-pp-qty="1"]', box); if (inc) inc.disabled = state.qty >= MAX_QTY;

      var add = $('[data-pp-add]', box);
      if (add && !add.__ppBusy) {
        add.disabled = !v.available;
        add.textContent = v.available ? 'Add to Bag' : 'Sold out';
      }
      var ship = $('[data-pp-ship]', box);
      if (ship) {
        ship.hidden = false;
        ship.textContent = gap === null ? FREE_ALL : (gap > 0 ? 'You’re ' + money(gap) + ' away from free shipping.' : 'You’ve unlocked free shipping.');
      }
    });

    var meta = $('[data-pp-sticky-meta]');
    var heroBox = $('[data-pp-hero-box] [data-pp-buybox]');
    if (meta && !(heroBox && hasBundles(heroBox))) {
      var freqLabel = '';
      var fq0 = $('[data-pp-freq]');
      if (sub && fq0 && fq0.selectedIndex > -1) freqLabel = ' · ' + fq0.options[fq0.selectedIndex].text;
      meta.textContent = (sub ? 'Subscribe' + freqLabel : 'One-time') + ' · ' + money(total());
    }
    var sAdd = $('[data-pp-sticky-add]');
    if (sAdd) { sAdd.disabled = !v.available; sAdd.setAttribute('aria-label', v.available ? 'Add to Bag, ' + money(total()) : 'Sold out'); }
  }

  function addFromState(box) {
    var v = variant();
    if (!v || !v.available) return;
    var plan = currentPlan(v);
    var item = { id: v.id, quantity: state.qty };
    if (state.plan === 'sub' && plan) item.selling_plan = plan.id;

    var btn = box ? $('[data-pp-add]', box) : null;
    var err = box ? $('[data-pp-error]', box) : null;
    if (err) err.hidden = true;
    if (btn) { btn.__ppBusy = true; btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.textContent = 'Adding…'; }

    var label = 'Added ' + state.qty + ' × ' + (data.title || 'item') + (item.selling_plan ? ' (subscription)' : '') + ' to your bag.';
    addItems([item], label)
      .catch(function (e) {
        if (err) { err.textContent = e.message; err.hidden = false; } else toast(e.message);
      })
      .then(function () {
        if (btn) { btn.__ppBusy = false; btn.removeAttribute('aria-busy'); }
        renderBoxes();
      });
  }

  function initBuyBoxes() {
    var boxes = $$('[data-pp-buybox]');
    if (!boxes.length) return;
    if (!state && !initState()) return;
    boxes.forEach(bindBox);
    renderBoxes();

    var sAdd = $('[data-pp-sticky-add]');
    if (sAdd && !sAdd.__ppBound) {
      sAdd.__ppBound = true;
      sAdd.addEventListener('click', function () {
        var hero = $('[data-pp-hero-box] [data-pp-buybox]') || boxes[0];
        // A bundle app (Kaching) adds the chosen bundle on the main button's click, so go through it
        if (hasBundles(hero)) { var main = $('[data-pp-add]', hero); if (main) main.click(); return; }
        addFromState(hero);
      });
    }
  }

  /* ---------------- bundle app (Kaching Bundles) inside the buy box ----------------
     Kaching sets the quantity, adds the bundle on click and writes the bundle price into our button.
     We hide our own purchase options (CSS: .pp-has-bundles), keep a plain "Add to Bag" label,
     and work out the free-shipping line and the sticky bar text from the bundle price. */
  function hasBundles(box) { return !!(box && box.querySelector('kaching-bundle, .kaching-bundles')); }
  function priceCents(text) {
    var m = (text || '').match(/\d[\d,]*(?:\.\d{1,2})?/g);
    return m ? Math.round(parseFloat(m[m.length - 1].replace(/,/g, '')) * 100) : null;
  }
  function syncBundle(box) {
    var add = $('[data-pp-add]', box); if (!add || add.__ppBusy) return;
    // Kaching writes the bundle price into the button; read it, then put back a plain label (no price on the button)
    var label = add.textContent.trim();
    var cents = priceCents(label);
    if (cents === null) {
      var selPrice = box.querySelector('.kaching-bundles__bar--selected .kaching-bundles__bar-price');
      cents = selPrice ? priceCents(selPrice.textContent) : null;
    }
    if (label !== 'Add to Bag' && !/adding/i.test(label)) add.textContent = 'Add to Bag';
    var ship = $('[data-pp-ship]', box);
    if (ship && data && (cents !== null || !(data.freeShipping > 0))) {
      var gap = data.freeShipping > 0 ? data.freeShipping - cents : null;
      var t = gap === null ? 'Free shipping on every order.' : (gap > 0 ? 'You’re ' + money(gap) + ' away from free shipping.' : 'You’ve unlocked free shipping.');
      if (ship.textContent !== t) ship.textContent = t;
      ship.hidden = false;
    }
    if (box.closest('[data-pp-hero-box]')) {
      var meta = $('[data-pp-sticky-meta]');
      var sel = box.querySelector('.kaching-bundles__bar--selected .kaching-bundles__bar-title');
      if (meta && cents !== null) {
        var mt = (sel ? sel.textContent.trim() : 'Bundle') + ' · ' + money(cents);
        if (meta.textContent !== mt) meta.textContent = mt;
      }
    }
  }
  function watchBundles() {
    $$('[data-pp-buybox]').forEach(function (box) {
      if (box.__ppBundleObs || !('MutationObserver' in window)) return;
      var queued = false;
      box.__ppBundleObs = new MutationObserver(function () {
        if (queued) return; queued = true;
        requestAnimationFrame(function () {
          queued = false;
          var bundled = hasBundles(box);
          if (bundled !== box.classList.contains('pp-has-bundles')) renderBoxes();
          else if (bundled) syncBundle(box);
        });
      });
      box.__ppBundleObs.observe(box, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class'] });
    });
  }

  /* ---------------- sticky bar ---------------- */
  var stickyObs = [];
  function initSticky() {
    stickyObs.forEach(function (o) { o.disconnect(); });
    stickyObs = [];
    var sticky = $('[data-pp-sticky]');
    var heroAdd = $('[data-pp-hero-box] [data-pp-add]');
    if (!sticky || !heroAdd || !('IntersectionObserver' in window)) return;
    // Shown once the main Add to Bag has scrolled up past the top of the screen (not before the visitor reaches it),
    // and hidden again while the closing call to action is on screen.
    var pastHero = false, finalVisible = false;
    function update() {
      var show = pastHero && !finalVisible;
      sticky.classList.toggle('translate-y-full', !show);
      if (show) sticky.removeAttribute('inert'); else sticky.setAttribute('inert', '');
    }
    var o1 = new IntersectionObserver(function (e) { pastHero = !e[0].isIntersecting && e[0].boundingClientRect.bottom < 0; update(); });
    o1.observe(heroAdd); stickyObs.push(o1);
    var fin = $('[data-pp-final]');
    if (fin) {
      var o2 = new IntersectionObserver(function (e) { finalVisible = e[0].isIntersecting; update(); }, { threshold: 0.15 });
      o2.observe(fin); stickyObs.push(o2);
    }
  }

  /* ---------------- gallery ---------------- */
  function initGallery(root) {
    $$('[data-pp-gallery]', root).forEach(function (g) {
      if (g.__ppBound) return; g.__ppBound = true;
      var track = $('[data-pp-gallery-track]', g);
      var thumbs = $$('[data-pp-thumb]', g);
      var dots = $$('[data-pp-dot-nav]', g);
      if (!track) return;
      function setActive(i) {
        thumbs.forEach(function (t, j) {
          ['ring-2', 'ring-primary', 'ring-offset-2'].forEach(function (c) { t.classList.toggle(c, i === j); });
          if (i === j) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
        });
        dots.forEach(function (d, j) { d.classList.toggle('bg-primary', i === j); d.classList.toggle('bg-line', i !== j); });
      }
      function go(i) {
        i = Math.max(0, Math.min(track.children.length - 1, i));
        track.scrollTo({ left: track.clientWidth * i, behavior: 'smooth' });
        setActive(i);
      }
      thumbs.forEach(function (t, i) { t.addEventListener('click', function () { go(i); }); });
      var timer;
      track.addEventListener('scroll', function () {
        clearTimeout(timer);
        timer = setTimeout(function () { setActive(Math.round(track.scrollLeft / track.clientWidth)); }, 60);
      }, { passive: true });
      track.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        go(Math.round(track.scrollLeft / track.clientWidth) + (e.key === 'ArrowRight' ? 1 : -1));
      });
    });
  }

  /* ---------------- delivery estimate ----------------
     "Order today, arrives X – Y": processing counts business days (no weekends), delivery counts calendar
     days from today. Recalculated in the visitor's own timezone and date format. */
  function initDelivery(root) {
    $$('[data-pp-delivery]', root).forEach(function (box) {
      function num(k, d) { var n = parseInt(box.getAttribute(k), 10); return isNaN(n) ? d : n; }
      function addDays(n) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d; }
      function addBusiness(n) {
        var d = new Date(); d.setHours(12, 0, 0, 0);
        while (n > 0) { d.setDate(d.getDate() + 1); var w = d.getDay(); if (w !== 0 && w !== 6) n--; }
        return d;
      }
      function fmt(d) { try { return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch (e) { return d.toDateString().slice(4, 10); } }
      var shipA = fmt(addBusiness(num('data-proc-min', 1))), shipB = fmt(addBusiness(num('data-proc-max', 2)));
      var delA = fmt(addDays(num('data-del-min', 7))), delB = fmt(addDays(num('data-del-max', 15)));
      [['[data-pp-ship-a]', shipA], ['[data-pp-ship-b]', shipB], ['[data-pp-del-a]', delA], ['[data-pp-del-b]', delB], ['[data-pp-del-a2]', delA], ['[data-pp-del-b2]', delB]]
        .forEach(function (p) { var el = $(p[0], box); if (el) el.textContent = p[1]; });
    });
  }

  /* ---------------- "Show more reviews" ---------------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-pp-more-btn]');
    if (!btn) return;
    var wrap = btn.closest('section') || document;
    var first = null;
    $$('.pp-more-hidden', wrap).forEach(function (li) { li.classList.remove('pp-more-hidden'); if (!first) first = li; });
    btn.parentNode.removeChild(btn);
    if (first) { first.setAttribute('tabindex', '-1'); first.focus({ preventScroll: true }); }
  });

  /* ---------------- sliders (reviews) ----------------
     Native scroll-snap does the sliding; the buttons scroll one card at a time and the counter follows. */
  function initSliders(root) {
    $$('[data-pp-slider]', root).forEach(function (wrap) {
      if (wrap.__ppBound) return; wrap.__ppBound = true;
      var track = $('[data-pp-slider-track]', wrap);
      var prev = $('[data-pp-slider-prev]', wrap), next = $('[data-pp-slider-next]', wrap), pos = $('[data-pp-slider-pos]', wrap);
      if (!track) return;
      function step() { var c = track.children[0]; return c ? c.getBoundingClientRect().width + 16 : track.clientWidth; }
      function update() {
        var max = track.scrollWidth - track.clientWidth - 2;
        if (prev) prev.disabled = track.scrollLeft <= 2;
        if (next) next.disabled = track.scrollLeft >= max;
        if (pos) pos.textContent = Math.min(track.children.length, Math.round(track.scrollLeft / step()) + 1);
      }
      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
      if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
      track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
      window.addEventListener('resize', update);
      update();
    });
  }

  /* ---------------- custom scrollbar (review scroller) ---------------- */
  function initScrollbars(root) {
    $$('[data-pp-scrollbar]', root).forEach(function (wrap) {
      if (wrap.__ppBound) return; wrap.__ppBound = true;
      var track = $('[data-pp-scrollbar-track]', wrap), rail = $('[data-pp-scrollbar-rail]', wrap), thumb = $('[data-pp-scrollbar-thumb]', wrap);
      if (!track || !rail || !thumb) return;
      function update() {
        var max = track.scrollWidth - track.clientWidth;
        rail.hidden = max <= 2;
        var tw = Math.max(40, rail.clientWidth * track.clientWidth / track.scrollWidth);
        thumb.style.width = tw + 'px';
        thumb.style.transform = 'translateX(' + (max > 0 ? (rail.clientWidth - tw) * track.scrollLeft / max : 0) + 'px)';
      }
      function scrollToX(x, grab) {
        var tw = thumb.offsetWidth, r = rail.getBoundingClientRect();
        var ratio = Math.min(1, Math.max(0, (x - r.left - grab) / (r.width - tw)));
        track.scrollLeft = ratio * (track.scrollWidth - track.clientWidth);
      }
      rail.addEventListener('pointerdown', function (e) {
        var tr = thumb.getBoundingClientRect();
        var grab = (e.clientX >= tr.left && e.clientX <= tr.right) ? e.clientX - tr.left : thumb.offsetWidth / 2;
        rail.setPointerCapture(e.pointerId); wrap.classList.add('is-drag'); rail.classList.add('is-drag');
        scrollToX(e.clientX, grab);
        function move(ev) { scrollToX(ev.clientX, grab); }
        function up() { rail.removeEventListener('pointermove', move); rail.removeEventListener('pointerup', up); rail.removeEventListener('pointercancel', up); wrap.classList.remove('is-drag'); rail.classList.remove('is-drag'); }
        rail.addEventListener('pointermove', move); rail.addEventListener('pointerup', up); rail.addEventListener('pointercancel', up);
        e.preventDefault();
      });
      track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
      window.addEventListener('resize', update);
      update();
    });
  }

  /* ---------------- Kaching free-gift images (swap app defaults for brand art) ---------------- */
  function initGiftImages() {
    var map = window.ppGiftImages;
    if (!map || window.__ppGiftObs) return;
    function swap() {
      $$('.kaching-bundles__progressive-gifts__gift').forEach(function (g) {
        var t = $('.kaching-bundles__progressive-gifts__gift__title', g);
        var img = $('img.kaching-bundles__progressive-gifts__gift__image', g);
        if (!t || !img) return;
        var src = map[t.textContent.trim().toLowerCase()];
        if (src && img.getAttribute('src') !== src) { img.setAttribute('src', src); img.removeAttribute('srcset'); }
      });
    }
    var queued = false;
    window.__ppGiftObs = new MutationObserver(function () {
      if (queued) return; queued = true;
      window.requestAnimationFrame(function () { queued = false; swap(); });
    });
    window.__ppGiftObs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
    swap();
  }

  /* ---------------- accordions ---------------- */
  function initAccordions(root) {
    $$('[data-pp-accordion] .acc-btn', root).forEach(function (btn) {
      if (btn.__ppBound) return; btn.__ppBound = true;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (panel) panel.hidden = open;
      });
    });
  }

  /* ---------------- review filter ---------------- */
  function initReviews(root) {
    $$('[data-pp-reviews]', root).forEach(function (wrap) {
      if (wrap.__ppBound) return; wrap.__ppBound = true;
      var btns = $$('[data-pp-filter]', wrap);
      var items = $$('[data-pp-review]', wrap);
      var status = $('[data-pp-filter-status]', wrap);
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          var f = b.getAttribute('data-pp-filter'), shown = 0;
          btns.forEach(function (x) {
            var on = x === b;
            x.setAttribute('aria-pressed', String(on));
            x.classList.toggle('bg-primary', on); x.classList.toggle('text-white', on); x.classList.toggle('border-primary', on);
            x.classList.toggle('bg-white', !on); x.classList.toggle('text-primary-dark', !on); x.classList.toggle('border-primary/30', !on);
          });
          items.forEach(function (r) {
            var tags = (r.getAttribute('data-tags') || '').split(/\s+/);
            var match = f === 'all' || tags.indexOf(f) > -1;
            r.hidden = !match; if (match) shown++;
          });
          if (status) status.textContent = 'Showing ' + shown + ' review' + (shown === 1 ? '' : 's') + '.';
        });
      });
    });
  }

  /* ---------------- bundle ---------------- */
  function initBundle(root) {
    $$('[data-pp-bundle]', root).forEach(function (b) {
      if (b.__ppBound) return; b.__ppBound = true;
      var btn = $('[data-pp-bundle-add]', b);
      var err = $('[data-pp-bundle-error]', b);
      if (!btn) return;
      btn.addEventListener('click', function () {
        var ids = (b.getAttribute('data-ids') || '').split(',').filter(Boolean);
        if (!ids.length) return;
        var label = btn.textContent;
        btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.textContent = 'Adding…';
        if (err) err.hidden = true;
        addItems(ids.map(function (id) { return { id: Number(id), quantity: 1 }; }), 'Added the routine bundle to your bag.')
          .catch(function (e) { if (err) { err.textContent = e.message; err.hidden = false; } })
          .then(function () { btn.disabled = false; btn.removeAttribute('aria-busy'); btn.textContent = label; });
      });
    });
  }

  /* ---------------- headline A/B ---------------- */
  function initHeadline() {
    var h = (new URLSearchParams(window.location.search).get('h') || '').toLowerCase();
    if (!/^[abc]$/.test(h)) return;
    $$('[data-pp-headline]').forEach(function (el) {
      var t = el.getAttribute('data-' + h);
      if (t) el.textContent = t;
    });
  }

  /* ---------------- placeholder highlighting ---------------- */
  var MARK = /\[(?:VERIFY|SETUP)[^\]]*\]/g;
  function highlight(root) {
    $$('.pp', root).forEach(function (scope) {
      var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          var p = n.parentNode;
          if (!p || /^(SCRIPT|STYLE|OPTION|SELECT|TEXTAREA)$/.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
          if (p.closest && p.closest('.verify, .ph')) return NodeFilter.FILTER_REJECT;
          MARK.lastIndex = 0;
          return MARK.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (n) {
        var frag = document.createDocumentFragment(), text = n.nodeValue, last = 0, m;
        MARK.lastIndex = 0;
        while ((m = MARK.exec(text))) {
          if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
          var s = document.createElement('span'); s.className = 'verify'; s.textContent = m[0];
          frag.appendChild(s); last = m.index + m[0].length;
        }
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        n.parentNode.replaceChild(frag, n);
      });
    });
  }

  /* ---------------- FDA asterisks: move focus to the disclaimer ---------------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.pp a.fda');
    if (!a) return;
    var target = document.getElementById('pp-fda');
    if (target) setTimeout(function () { target.focus({ preventScroll: true }); }, 0);
  });

  /* ---------------- stats rings: fill on first view ---------------- */
  function initStats(root) {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    $$('[data-pp-stats]', root).forEach(function (sec) {
      if (sec.__ppStats) return;
      sec.__ppStats = true;
      sec.classList.add('is-armed');
      var o = new IntersectionObserver(function (e) {
        if (!e[0].isIntersecting) return;
        // next frame so the empty state paints before the fill transition starts
        requestAnimationFrame(function () { sec.classList.add('is-in'); });
        o.disconnect();
      }, { threshold: 0.3 });
      o.observe(sec);
    });
  }

  /* ---------------- final CTA: back up to the main buy box ---------------- */
  document.addEventListener('click', function (e) {
    // [data-pp-to-buy] scrolls to the buy box; [data-pp-scroll] scrolls to the section its href points at (e.g. #safety)
    var a = e.target.closest && e.target.closest('[data-pp-to-buy], [data-pp-scroll]');
    if (!a) return;
    var toBuy = a.hasAttribute('data-pp-to-buy');
    var box = document.getElementById(toBuy ? 'pp-buy' : (a.getAttribute('href') || '').replace(/^.*#/, ''));
    if (!box) return; // no hero buy box on this page: let the link do nothing harmful
    e.preventDefault();
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Land below whatever the theme pins to the top (sticky header, announcement bar)
    function headerOffset() {
      var h = 0;
      document.querySelectorAll('header, sticky-header, .shopify-section-group-header-group, [id^="shopify-section"][id*="header"]').forEach(function (el) {
        var cs = getComputedStyle(el), r = el.getBoundingClientRect();
        if ((cs.position === 'sticky' || cs.position === 'fixed') && r.top <= 1 && r.bottom > h && r.height < innerHeight / 3) h = r.bottom;
      });
      return h;
    }
    function target() { return box.getBoundingClientRect().top + window.pageYOffset - Math.max(headerOffset(), 70) - 16; }
    window.scrollTo({ top: target(), behavior: reduce ? 'auto' : 'smooth' });
    var add = toBuy ? box.querySelector('[data-pp-add]') : null;
    setTimeout(function () {
      // the header can reappear while scrolling up: correct once the scroll settles
      var off = box.getBoundingClientRect().top - Math.max(headerOffset(), 70) - 16;
      if (Math.abs(off) > 8) window.scrollTo({ top: window.pageYOffset + off, behavior: 'auto' });
      if (add) add.focus({ preventScroll: true });
    }, reduce ? 0 : 900);
  });

  /* ---------------- boot ---------------- */
  function initAll(root) {
    root = root || document;
    highlight(root);
    initGallery(root);
    initAccordions(root);
    initDelivery(root);
    initSliders(root);
    initScrollbars(root);
    initGiftImages();
    initReviews(root);
    initBundle(root);
    initStats(root);
    initBuyBoxes();
    watchBundles();
    initSticky();
  }

  function boot() { initHeadline(); initAll(document); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // Theme editor: re-bind sections that were re-rendered
  document.addEventListener('shopify:section:load', function (e) {
    if ($('[data-pp-buybox]', e.target)) { state = null; data = null; }
    initAll(e.target);
  });
})();
