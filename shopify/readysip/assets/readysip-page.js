/* ReadySip product page behaviour. No dependencies. */
(() => {
  if (window.__readysipPdp) return;
  window.__readysipPdp = true;

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function formatMoney(cents, format) {
    const template = (format || '${{amount}}').replace(/<[^>]*>/g, '');
    const group = (amount, decimals, thousands, decimal) => {
      const [whole, fraction] = (amount / 100).toFixed(decimals).split('.');
      return whole.replace(/\B(?=(\d{3})+(?!\d))/g, thousands) + (fraction ? decimal + fraction : '');
    };
    return template.replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => {
      switch (key) {
        case 'amount_no_decimals': return group(cents, 0, ',', '.');
        case 'amount_with_comma_separator': return group(cents, 2, '.', ',');
        case 'amount_no_decimals_with_comma_separator': return group(cents, 0, '.', ',');
        case 'amount_with_apostrophe_separator': return group(cents, 2, "'", '.');
        default: return group(cents, 2, ',', '.');
      }
    });
  }

  function setVariantParam(id) {
    const url = new URL(window.location.href);
    url.searchParams.set('variant', id);
    window.history.replaceState(window.history.state, '', url.toString());
  }

  /* ---------- Cart drawer ---------- */

  // The theme's "order reserved" cart timer starts from a native add-to-cart submit, which this page
  // replaces with an AJAX add. Its global cartTimerBar() is called with the new cart instead.
  async function syncCartTimer() {
    if (typeof window.cartTimerBar !== 'function') return;
    try {
      const cart = await (await fetch(`${(window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/'}cart.js`)).json();
      window.cartTimerBar(cart);
    } catch (e) { /* timer is optional */ }
  }

  // Puts the fresh cart drawer (and cart count) from a Section Rendering response on the page and opens it.
  // Uses the theme's own cart-drawer element when it supports it, otherwise swaps the markup in directly.
  function openCartDrawer(drawer, body) {
    const sections = body.sections || {};
    drawer.classList.remove('is-empty');
    if (typeof drawer.renderContents === 'function' && sections['cart-drawer']) {
      try { drawer.renderContents(body); syncCartTimer(); return; } catch (e) { /* fall back below */ }
    }
    const parse = (html) => new DOMParser().parseFromString(html || '', 'text/html');
    const fresh = parse(sections['cart-drawer']).querySelector('#CartDrawer');
    const current = document.querySelector('#CartDrawer');
    if (fresh && current) current.innerHTML = fresh.innerHTML;
    const bubble = document.querySelector('#cart-icon-bubble');
    const freshBubble = parse(sections['cart-icon-bubble']).querySelector('.shopify-section');
    if (bubble && freshBubble) bubble.innerHTML = freshBubble.innerHTML;
    if (typeof drawer.open === 'function') drawer.open();
    else { drawer.classList.add('active', 'animate'); document.body.classList.add('overflow-hidden'); }
    syncCartTimer();
  }

  // Re-fetches the cart drawer and cart count, then shows them (drawer stays open).
  async function refreshCartDrawer() {
    const drawer = document.querySelector('cart-drawer');
    if (!drawer) return;
    const res = await fetch(`${window.location.pathname}?sections=cart-drawer,cart-icon-bubble`);
    const sections = await res.json();
    // Swap the markup in directly: the theme's own re-render skips the top of the drawer.
    const parse = (html) => new DOMParser().parseFromString(html || '', 'text/html');
    const fresh = parse(sections['cart-drawer']).querySelector('#CartDrawer');
    const current = document.querySelector('#CartDrawer');
    if (fresh && current) current.innerHTML = fresh.innerHTML;
    const bubble = document.querySelector('#cart-icon-bubble');
    const freshBubble = parse(sections['cart-icon-bubble']).querySelector('.shopify-section');
    if (bubble && freshBubble) bubble.innerHTML = freshBubble.innerHTML;
    drawer.classList.remove('is-empty');
    drawer.classList.add('active');
    syncCartTimer();
  }

  // Optional shipping protection switch in the cart drawer (markup comes from the pp-cart-top snippet).
  function initShippingProtection() {
    if (window.__rsSp) return;
    window.__rsSp = true;
    document.addEventListener('click', async (event) => {
      const btn = event.target.closest && event.target.closest('[data-rs-sp-switch]');
      if (!btn || btn.getAttribute('aria-busy') === 'true') return;
      event.preventDefault();
      event.stopPropagation();
      const box = btn.closest('[data-rs-sp]');
      const on = btn.getAttribute('aria-checked') === 'true';
      const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
      btn.setAttribute('aria-busy', 'true');
      try {
        const res = on
          ? await fetch(`${root}cart/change.js`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ id: box.dataset.key, quantity: 0 }) })
          : await fetch(`${root}cart/add.js`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items: [{ id: Number(box.dataset.variant), quantity: 1 }] }) });
        if (!res.ok) throw new Error('cart');
        await refreshCartDrawer();
      } catch (e) {
        btn.removeAttribute('aria-busy');
      }
    }, true);
  }

  /* ---------- Free gifts with packs ---------- */

  // Config written by the "Free gift unlocks" block: straws per pack variant, and each gift's variant and unlock level.
  function giftConfig() {
    const el = document.querySelector('[data-rs-gifts-json]');
    if (!el) return null;
    try {
      const cfg = JSON.parse(el.textContent);
      return cfg.gifts && cfg.gifts.length ? cfg : null;
    } catch (e) { return null; }
  }
  const GIFT_PROP = '_readysip_gift';
  const cartRoot = () => (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  let giftSyncing = false;

  // Makes the cart's free gift lines match the biggest ReadySip pack in it: adds gifts it has earned, removes ones it no longer has.
  // Returns true when it changed the cart.
  async function syncGifts() {
    const cfg = giftConfig();
    if (!cfg || giftSyncing) return false;
    giftSyncing = true;
    try {
      const cart = await (await fetch(`${cartRoot()}cart.js`)).json();
      let straws = 0;
      cart.items.forEach((item) => {
        const n = cfg.packs[String(item.variant_id)];
        if (n && !(item.properties && item.properties[GIFT_PROP])) straws = Math.max(straws, n);
      });
      const wanted = cfg.gifts.filter((g) => straws >= g.min);
      const updates = {};
      const have = new Set();
      cart.items.forEach((item) => {
        const key = item.properties && item.properties[GIFT_PROP];
        if (!key) return;
        const keep = wanted.some((g) => g.key === key && g.variant === item.variant_id) && !have.has(key);
        if (keep) {
          have.add(key);
          if (item.quantity !== 1) updates[item.key] = 1;
        } else {
          updates[item.key] = 0;
        }
      });
      const adds = wanted.filter((g) => !have.has(g.key)).map((g) => ({ id: g.variant, quantity: 1, properties: { [GIFT_PROP]: g.key } }));
      const json = { 'Content-Type': 'application/json', Accept: 'application/json' };
      if (Object.keys(updates).length) {
        await fetch(`${cartRoot()}cart/update.js?rs=1`, { method: 'POST', headers: json, body: JSON.stringify({ updates }) });
      }
      if (adds.length) {
        await fetch(`${cartRoot()}cart/add.js?rs=1`, { method: 'POST', headers: json, body: JSON.stringify({ items: adds }) });
      }
      return Boolean(Object.keys(updates).length || adds.length);
    } catch (e) {
      return false;
    } finally {
      giftSyncing = false;
    }
  }

  // Marks free gift lines in the cart drawer so their quantity and remove controls are hidden (the theme adds its own "Free Gift" label).
  let markTimer;
  function markGiftLines() {
    clearTimeout(markTimer);
    markTimer = setTimeout(async () => {
      if (!giftConfig()) return;
      const rows = document.querySelectorAll('#CartDrawer [id^="CartDrawer-Item-"]');
      if (!rows.length) return;
      let cart;
      try { cart = await (await fetch(`${cartRoot()}cart.js`)).json(); } catch (e) { return; }
      cart.items.forEach((item, i) => {
        const row = document.getElementById(`CartDrawer-Item-${i + 1}`);
        if (!row) return;
        const isGift = Boolean(item.properties && item.properties[GIFT_PROP]);
        row.classList.toggle('rs-gift-line', isGift);
      });
    }, 150);
  }

  // Keeps gifts right when the shopper changes quantities or removes a pack in the drawer (the theme's own requests).
  function watchCartForGifts() {
    if (window.__rsGiftWatch || !giftConfig()) return;
    window.__rsGiftWatch = true;
    let pending;
    const onCartRequest = () => {
      clearTimeout(pending);
      pending = setTimeout(async () => {
        if (await syncGifts()) await refreshCartDrawer();
        markGiftLines();
      }, 700);
    };
    if ('PerformanceObserver' in window) {
      try {
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (/\/cart\/(change|update|add|clear)(\.js)?/.test(entry.name) && !/[?&]rs=1/.test(entry.name)) onCartRequest();
          });
        }).observe({ type: 'resource', buffered: false });
      } catch (e) { /* older browsers: gifts still sync on add to cart */ }
    }
    const drawerRoot = document.querySelector('cart-drawer');
    if (drawerRoot && 'MutationObserver' in window) {
      // Only when cart rows are (re)drawn: the theme's timer rewrites its text every second.
      const isRow = (n) => n.nodeType === 1 && (n.matches('[id^="CartDrawer-Item-"]') || n.querySelector('[id^="CartDrawer-Item-"]'));
      new MutationObserver((mutations) => {
        if (mutations.some((m) => Array.from(m.addedNodes).some(isRow))) markGiftLines();
      }).observe(drawerRoot, { childList: true, subtree: true });
    }
    markGiftLines();
  }

  /* ---------- Product section ---------- */

  class RsProduct {
    constructor(root) {
      this.root = root;
      const data = JSON.parse(qs('[data-rs-product-json]', root).textContent);
      this.variants = data.variants;
      this.stock = data.stock || {};
      this.moneyFormat = data.moneyFormat;
      this.form = qs('[data-rs-form]', root);
      this.addButton = qs('[data-rs-add]', root);
      this.afterAdd = root.dataset.afterAdd || 'drawer'; // drawer | stay | cart

      qsa('[data-rs-pack]', root).forEach((input) => {
        input.addEventListener('change', () => {
          if (input.checked) this.setVariant(this.variants.find((v) => String(v.id) === input.value));
        });
      });
      qsa('[data-rs-option] input', root).forEach((input) => {
        input.addEventListener('change', () => this.onOptionChange());
      });

      this.giftsRoot = qs('[data-rs-gifts]', root);
      this.initGallery();
      this.initForm();
      this.initSticky();
      const idInput = qs('[data-rs-variant-id]', root);
      const current = idInput && this.variants.find((v) => String(v.id) === idInput.value);
      this.updateStock(current);
      this.updateGifts(current);
      this.updateAvailability();
    }

    selectedOptions() {
      return qsa('[data-rs-option]', this.root).map((fieldset) => {
        const checked = qs('input:checked', fieldset);
        return checked ? checked.value : null;
      });
    }

    onOptionChange() {
      const selected = this.selectedOptions();
      qsa('[data-rs-option]', this.root).forEach((fieldset, i) => {
        const out = qs('[data-rs-option-value]', fieldset);
        if (out) out.textContent = selected[i];
      });
      this.updateAvailability();
      this.setVariant(this.variants.find((v) => v.options.every((value, i) => value === selected[i])));
    }

    updateAvailability() {
      const selected = this.selectedOptions();
      qsa('[data-rs-option]', this.root).forEach((fieldset, index) => {
        qsa('input', fieldset).forEach((input) => {
          const available = this.variants.some((v) => v.available && v.options[index] === input.value &&
            v.options.every((value, i) => i === index || selected[i] == null || value === selected[i]));
          input.classList.toggle('is-unavailable', !available);
        });
      });
    }

    setVariant(variant) {
      qsa('[data-rs-add], [data-rs-sticky-add]', this.root).forEach((button) => {
        const label = qs('[data-rs-add-label]', button);
        const available = Boolean(variant && variant.available);
        button.disabled = !available;
        label.textContent = !variant ? 'Unavailable' : available ? button.dataset.rsLabel : 'Sold out';
      });
      if (!variant) return;

      qsa('input[name="id"]', this.root).forEach((input) => {
        input.value = variant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      // Keep the pack cards and the plain option buttons in step with each other.
      qsa('[data-rs-pack]', this.root).forEach((input) => { input.checked = input.value === String(variant.id); });
      qsa('[data-rs-option]', this.root).forEach((fieldset, i) => {
        qsa('input', fieldset).forEach((input) => { input.checked = input.value === variant.options[i]; });
        const out = qs('[data-rs-option-value]', fieldset);
        if (out) out.textContent = variant.options[i];
      });

      const onSale = variant.compare_at_price > variant.price;
      qsa('[data-rs-price]', this.root).forEach((el) => { el.textContent = formatMoney(variant.price, this.moneyFormat); });
      qsa('[data-rs-compare]', this.root).forEach((el) => {
        el.hidden = !onSale;
        el.textContent = onSale ? formatMoney(variant.compare_at_price, this.moneyFormat) : '';
      });
      qsa('[data-rs-save]', this.root).forEach((el) => { el.hidden = !onSale; });
      qsa('[data-rs-save-pct]', this.root).forEach((el) => {
        el.textContent = onSale ? Math.floor(((variant.compare_at_price - variant.price) * 100) / variant.compare_at_price) : '';
      });
      qsa('[data-rs-sticky-variant]', this.root).forEach((el) => { el.textContent = variant.title; });

      this.updateStock(variant);
      this.updateGifts(variant);
      if (variant.featured_media) this.showMedia(variant.featured_media.id);
      setVariantParam(variant.id);
    }

    /* Low-stock note: real inventory only. */
    updateStock(variant) {
      const note = qs('[data-rs-stock]', this.root);
      if (!note) return;
      const count = variant ? this.stock[variant.id] : null;
      const threshold = Number(note.dataset.threshold || 0);
      const show = typeof count === 'number' && count > 0 && count <= threshold;
      note.hidden = !show;
      if (show) qs('[data-rs-stock-text]', note).textContent = note.dataset.template.replace('[count]', count);
    }

    /* Gallery */
    initGallery() {
      this.track = qs('[data-rs-gallery-track]', this.root);
      this.thumbs = qsa('[data-rs-thumb]', this.root);
      this.slides = this.track ? qsa('[data-media-id]', this.track) : [];
      this.counter = qs('[data-rs-gallery-index]', this.root);
      if (!this.track || this.slides.length < 2) return;

      this.thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => this.showMedia(thumb.dataset.rsThumb));
      });
      const step = (dir) => {
        const i = this.slides.findIndex((s) => s.dataset.mediaId === this.activeId);
        const next = this.slides[(Math.max(i, 0) + dir + this.slides.length) % this.slides.length];
        this.showMedia(next.dataset.mediaId);
      };
      const prev = qs('[data-rs-gallery-prev]', this.root);
      const next = qs('[data-rs-gallery-next]', this.root);
      if (prev) prev.addEventListener('click', () => step(-1));
      if (next) next.addEventListener('click', () => step(1));

      this.activeId = this.slides[0].dataset.mediaId;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) this.markThumb(entry.target.dataset.mediaId);
        });
      }, { root: this.track, threshold: 0.6 });
      this.slides.forEach((slide) => observer.observe(slide));
    }

    showMedia(mediaId) {
      const slide = this.track && qs(`[data-media-id="${mediaId}"]`, this.track);
      if (!slide) return;
      this.track.scrollTo({ left: slide.offsetLeft, behavior: reducedMotion() ? 'auto' : 'smooth' });
      this.markThumb(String(mediaId));
    }

    markThumb(mediaId) {
      this.activeId = mediaId;
      const index = this.slides.findIndex((s) => s.dataset.mediaId === mediaId);
      if (this.counter && index >= 0) this.counter.textContent = index + 1;
      this.thumbs.forEach((thumb) => {
        const active = thumb.dataset.rsThumb === mediaId;
        thumb.classList.toggle('is-active', active);
        if (active) {
          thumb.setAttribute('aria-current', 'true');
          thumb.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        } else {
          thumb.removeAttribute('aria-current');
        }
      });
    }

    /* Add to cart */
    // Unlocks the gift cards the chosen pack earns.
    updateGifts(variant) {
      if (!this.giftsRoot || !variant) return;
      const cfg = giftConfig();
      const straws = (cfg && cfg.packs[String(variant.id)]) || 1;
      let unlocked = 0;
      const cards = qsa('[data-rs-gift]', this.giftsRoot);
      cards.forEach((card) => {
        const on = straws >= Number(card.dataset.min || 1);
        if (on) unlocked += 1;
        card.classList.toggle('is-unlocked', on);
        const state = qs('[data-rs-gift-state]', card);
        if (state) state.textContent = on ? state.dataset.unlocked : state.dataset.locked;
      });
      const live = qs('[data-rs-gifts-live]', this.giftsRoot);
      if (live) live.textContent = `${unlocked} of ${cards.length} free gifts unlocked with this pack.`;
    }

    initForm() {
      if (!this.form || !this.addButton) return;
      const label = qs('[data-rs-add-label]', this.addButton);
      const error = qs('[data-rs-error]', this.form);
      const status = qs('[data-rs-status]', this.form);

      this.form.addEventListener('submit', async (event) => {
        error.hidden = true;
        this.addButton.setAttribute('aria-busy', 'true');
        label.textContent = 'Adding…';
        if (this.afterAdd === 'cart') return; // native submit goes to the cart page

        event.preventDefault();
        event.stopImmediatePropagation();
        const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
        const drawer = document.querySelector('cart-drawer');
        const useDrawer = this.afterAdd === 'drawer' && drawer;
        try {
          const data = new FormData(this.form);
          if (useDrawer) {
            data.append('sections', 'cart-drawer,cart-icon-bubble');
            data.append('sections_url', window.location.pathname);
          }
          const response = await fetch(`${root}cart/add.js`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            body: data,
          });
          const body = await response.json();
          if (!response.ok || body.status) throw new Error(body.description || body.message || 'Could not add to cart.');
          document.dispatchEvent(new CustomEvent('readysip:cart:added', { detail: body }));
          const giftsChanged = await syncGifts();
          if (useDrawer) {
            if (giftsChanged) {
              // Re-render with the gifts in the cart too.
              const fresh = await (await fetch(`${window.location.pathname}?sections=cart-drawer,cart-icon-bubble`)).json();
              openCartDrawer(drawer, Object.assign({}, body, { sections: fresh }));
            } else {
              openCartDrawer(drawer, body);
            }
            markGiftLines();
          } else {
            status.innerHTML = `Added to your cart. <a href="${root}cart">View cart</a>`;
          }
        } catch (err) {
          error.textContent = `${err.message} Please try again.`;
          error.hidden = false;
        } finally {
          this.addButton.removeAttribute('aria-busy');
          label.textContent = this.addButton.dataset.rsLabel;
        }
      }, true);

      window.addEventListener('pageshow', () => {
        this.addButton.removeAttribute('aria-busy');
        if (!this.addButton.disabled) label.textContent = this.addButton.dataset.rsLabel;
      });
    }

    /* Floating bar: shows once the main button has scrolled off the top. */
    initSticky() {
      const bar = qs('[data-rs-sticky]', this.root);
      if (!bar || !this.addButton) return;
      const setVisible = (visible) => {
        bar.classList.toggle('is-visible', visible);
        bar.inert = !visible;
      };
      new IntersectionObserver(([entry]) => {
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      }).observe(this.addButton);

      qs('[data-rs-sticky-add]', bar).addEventListener('click', () => {
        if (this.form.requestSubmit) this.form.requestSubmit(this.addButton);
        else this.addButton.click();
      });
    }
  }

  /* ---------- Announcement rotation ---------- */

  function initAnnounce(root) {
    const messages = qsa('.rs-announce__msg', root);
    if (messages.length < 2 || reducedMotion()) return;
    let i = 0;
    let paused = false;
    root.addEventListener('mouseenter', () => { paused = true; });
    root.addEventListener('mouseleave', () => { paused = false; });
    root.addEventListener('focusin', () => { paused = true; });
    root.addEventListener('focusout', () => { paused = false; });
    window.setInterval(() => {
      if (paused || document.hidden) return;
      messages[i].hidden = true;
      i = (i + 1) % messages.length;
      messages[i].hidden = false;
    }, Number(root.dataset.interval || 5) * 1000);
  }

  /* ---------- "Back to the buy box" buttons ---------- */

  function initScrollToBuy(scope) {
    qsa('[data-rs-scroll-buy]', scope).forEach((link) => {
      if (link.getAttribute('href') !== '#rs-buy' || link.__rs) return;
      link.__rs = true;
      link.addEventListener('click', (event) => {
        const target = qs('#rs-buy [data-rs-packs]') || qs('#rs-buy');
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
        const first = qs('input:checked', target) || qs('input', target);
        if (first) first.focus({ preventScroll: true });
      });
    });
  }

  /* ---------- Review tabs ---------- */

  function initTabs(root) {
    const tabs = qsa('[role="tab"]', root);
    if (!tabs.length) return;
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = qs('#' + t.getAttribute('aria-controls'), root);
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (event) => {
        const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        select(tabs[(next + tabs.length) % tabs.length], true);
      });
    });
  }

  /* ---------- Boot ---------- */

  function init(scope = document) {
    initShippingProtection();
    watchCartForGifts();
    qsa('[data-rs-product]', scope).forEach((root) => {
      if (!root.__rs) root.__rs = new RsProduct(root);
    });
    qsa('[data-rs-reviews-tabs]', scope).forEach((root) => {
      if (!root.__rs) { root.__rs = true; initTabs(root); }
    });
    qsa('[data-rs-announce]', scope).forEach((root) => {
      if (!root.__rs) { root.__rs = true; initAnnounce(root); }
    });
    initScrollToBuy(scope);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();
  document.addEventListener('shopify:section:load', (event) => init(event.target));
})();
