/* Mirevia product page behaviour. No dependencies. */
(() => {
  if (window.__mireviaPdp) return;
  window.__mireviaPdp = true;

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ } },
  };
  const NEED_KEY = 'mirevia:need';

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

  function setParam(name, value) {
    const url = new URL(window.location.href);
    if (value == null) url.searchParams.delete(name);
    else url.searchParams.set(name, value);
    window.history.replaceState(window.history.state, '', url.toString());
  }

  /* ---------- Product section ---------- */

  class MvProduct {
    constructor(root) {
      this.root = root;
      const data = JSON.parse(qs('[data-mv-product-json]', root).textContent);
      this.variants = data.variants;
      this.moneyFormat = data.moneyFormat;
      this.form = qs('[data-mv-form]', root);
      this.addButton = qs('[data-mv-add]', root);
      this.afterAdd = root.dataset.afterAdd || 'cart';

      qsa('[data-mv-option] input', root).forEach((input) => {
        input.addEventListener('change', () => this.onOptionChange());
      });
      this.initGallery();
      this.initForm();
      this.initSticky();
      this.updateAvailability();
    }

    selectedOptions() {
      return qsa('[data-mv-option]', this.root).map((fieldset) => {
        const checked = qs('input:checked', fieldset);
        return checked ? checked.value : null;
      });
    }

    onOptionChange() {
      const selected = this.selectedOptions();
      qsa('[data-mv-option]', this.root).forEach((fieldset, i) => {
        const out = qs('[data-mv-option-value]', fieldset);
        if (out) out.textContent = selected[i];
      });
      const variant = this.variants.find((v) => v.options.every((value, i) => value === selected[i]));
      this.updateAvailability();
      this.setVariant(variant);
    }

    updateAvailability() {
      const selected = this.selectedOptions();
      qsa('[data-mv-option]', this.root).forEach((fieldset, index) => {
        qsa('input', fieldset).forEach((input) => {
          const available = this.variants.some((v) => v.available && v.options[index] === input.value &&
            v.options.every((value, i) => i === index || selected[i] == null || value === selected[i]));
          input.classList.toggle('is-unavailable', !available);
        });
      });
    }

    setVariant(variant) {
      qsa('[data-mv-add], [data-mv-sticky-add]', this.root).forEach((button) => {
        const label = qs('[data-mv-add-label]', button);
        const available = Boolean(variant && variant.available);
        button.disabled = !available;
        label.textContent = !variant ? 'Unavailable' : available ? button.dataset.mvLabel : 'Sold out';
      });
      if (!variant) return;

      qsa('input[name="id"]', this.root).forEach((input) => {
        input.value = variant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      const onSale = variant.compare_at_price > variant.price;
      qsa('[data-mv-price]', this.root).forEach((el) => { el.textContent = formatMoney(variant.price, this.moneyFormat); });
      qsa('[data-mv-compare]', this.root).forEach((el) => {
        el.hidden = !onSale;
        el.textContent = onSale ? formatMoney(variant.compare_at_price, this.moneyFormat) : '';
      });
      qsa('[data-mv-saving]', this.root).forEach((el) => { el.hidden = !onSale; });
      qsa('[data-mv-saving-amount]', this.root).forEach((el) => {
        el.textContent = onSale ? formatMoney(variant.compare_at_price - variant.price, this.moneyFormat) : '';
      });

      if (variant.featured_media) this.showMedia(variant.featured_media.id);
      setParam('variant', variant.id);
    }

    /* Gallery */
    initGallery() {
      this.track = qs('[data-mv-gallery-track]', this.root);
      this.thumbs = qsa('[data-mv-thumb]', this.root);
      if (!this.track || !this.thumbs.length) return;

      this.thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => this.showMedia(thumb.dataset.mvThumb));
      });

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) this.markThumb(entry.target.dataset.mediaId);
        });
      }, { root: this.track, threshold: 0.6 });
      qsa('[data-media-id]', this.track).forEach((slide) => observer.observe(slide));
    }

    showMedia(mediaId) {
      const slide = this.track && qs(`[data-media-id="${mediaId}"]`, this.track);
      if (!slide) return;
      this.track.scrollTo({ left: slide.offsetLeft, behavior: reducedMotion() ? 'auto' : 'smooth' });
      this.markThumb(mediaId);
    }

    markThumb(mediaId) {
      this.thumbs.forEach((thumb) => {
        const active = thumb.dataset.mvThumb === String(mediaId);
        thumb.classList.toggle('is-active', active);
        if (active) thumb.setAttribute('aria-current', 'true');
        else thumb.removeAttribute('aria-current');
      });
    }

    /* Add to bag */
    initForm() {
      if (!this.form || !this.addButton) return;
      const label = qs('[data-mv-add-label]', this.addButton);
      const error = qs('[data-mv-error]', this.form);
      const status = qs('[data-mv-status]', this.form);

      this.form.addEventListener('submit', async (event) => {
        error.hidden = true;
        this.addButton.setAttribute('aria-busy', 'true');
        label.textContent = 'Adding…';
        // The theme's cart drawer, when it has one with the render hook we need.
        const drawer = document.querySelector('cart-drawer');
        const useDrawer = this.afterAdd === 'drawer' && drawer && typeof drawer.renderContents === 'function';
        if (this.afterAdd === 'cart' || (this.afterAdd === 'drawer' && !useDrawer)) return; // native submit goes to the cart page

        event.preventDefault();
        const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
        const data = new FormData(this.form);
        if (useDrawer) {
          // Ask Shopify to render the drawer in the same request, so it opens already up to date.
          data.append('sections', 'cart-drawer,cart-icon-bubble');
          data.append('sections_url', window.location.pathname);
        }
        try {
          const response = await fetch(`${root}cart/add.js`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            body: data,
          });
          const body = await response.json();
          if (!response.ok) throw new Error(body.description || body.message || 'Could not add to bag.');
          if (useDrawer && body.sections) {
            drawer.renderContents(body); // also opens the drawer
          } else {
            status.innerHTML = `Added to your bag. <a href="${root}cart">View bag</a>`;
          }
          document.dispatchEvent(new CustomEvent('mirevia:cart:added', { detail: body }));
        } catch (err) {
          error.textContent = `${err.message} Please try again.`;
          error.hidden = false;
        } finally {
          this.addButton.removeAttribute('aria-busy');
          label.textContent = this.addButton.dataset.mvLabel;
        }
      });

      // Restore the label if the shopper comes back via the browser's back button.
      window.addEventListener('pageshow', () => {
        this.addButton.removeAttribute('aria-busy');
        if (!this.addButton.disabled) label.textContent = this.addButton.dataset.mvLabel;
      });
    }

    /* Floating bar: shows once the main button has scrolled off the top. */
    initSticky() {
      const bar = qs('[data-mv-sticky]', this.root);
      if (!bar || !this.addButton) return;
      const setVisible = (visible) => {
        bar.classList.toggle('is-visible', visible);
        bar.inert = !visible;
      };
      new IntersectionObserver(([entry]) => {
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      }).observe(this.addButton);

      qs('[data-mv-sticky-add]', bar).addEventListener('click', () => {
        if (this.form.requestSubmit) this.form.requestSubmit(this.addButton);
        else this.addButton.click();
      });
    }
  }

  /* ---------- Made for you ---------- */

  function showPersonalNote(text) {
    qsa('[data-mv-personal-note]').forEach((note) => {
      qs('[data-mv-personal-note-text]', note).textContent = text;
      note.hidden = !text;
    });
  }

  function initPersonalise(root) {
    const tabs = qsa('[role="tab"]', root);
    if (!tabs.length) return;

    const select = (tab, { focus = false, remember = true } = {}) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        qs(`#${t.getAttribute('aria-controls')}`, root).hidden = !selected;
      });
      if (focus) tab.focus();
      if (!remember) return;
      const panel = qs(`#${tab.getAttribute('aria-controls')}`, root);
      store.set(NEED_KEY, tab.dataset.key);
      setParam('for', tab.dataset.key);
      showPersonalNote(panel.dataset.note);
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (event) => {
        const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        select(tabs[(next + tabs.length) % tabs.length], { focus: true });
      });
    });

    const fromLink = new URLSearchParams(window.location.search).get('for');
    const initial = tabs.find((t) => t.dataset.key === fromLink) ||
      tabs.find((t) => t.dataset.key === store.get(NEED_KEY));
    if (initial) select(initial);
  }

  /* ---------- Boot ---------- */

  function init(scope = document) {
    qsa('[data-mv-product]', scope).forEach((root) => {
      if (!root.__mv) root.__mv = new MvProduct(root);
    });
    qsa('[data-mv-personalise]', scope).forEach((root) => {
      if (!root.__mv) { root.__mv = true; initPersonalise(root); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();
  document.addEventListener('shopify:section:load', (event) => init(event.target));
})();
