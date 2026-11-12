(function () {
  const D = window.FLORYS;
  const $ = (s, r = document) => r.querySelector(s);
  const fmt = (n) => `${n} ₴`;
  const KEY = 'florys-cart';
  const byId = (id) => D.products.find((p) => p.id === id);
  const FREE_SHIPPING = 2000; // безкоштовна доставка від, ₴

  function updateShipping(total, show) {
    const box = $('#ship-box');
    if (!box) return;
    const left = FREE_SHIPPING - total;
    box.classList.toggle('hidden', !show);
    $('#ship-bar').max = FREE_SHIPPING;
    $('#ship-bar').value = Math.min(total, FREE_SHIPPING);
    $('#ship-text').textContent = left > 0
      ? `Додайте товарів ще на ${fmt(left)}, щоб отримати безкоштовну доставку`
      : 'Вітаємо! Доставка безкоштовна';
  }

  /* ---------- Кошик (localStorage) ---------- */
  const getCart = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const setCart = (c) => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {} updateCount(); };
  const announce = (msg) => { const l = $('#live'); if (l) { l.textContent = ''; setTimeout(() => (l.textContent = msg), 50); } };
  function updateCount() {
    const n = getCart().reduce((s, i) => s + i.qty, 0), el = $('#cart-count');
    if (el) { el.textContent = n; el.classList.toggle('hidden', n === 0); }
    $('#cart-link')?.setAttribute('aria-label', `Кошик, товарів: ${n}`);
  }
  // Рядок кошика = товар + обраний відтінок
  const same = (i, id, shade) => i.id === id && (i.shade || '') === (shade || '');
  const shadeOf = (i) => (byId(i.id)?.shades || []).find((s) => s.id === i.shade) || null;
  function addToCart(id, shade) {
    const c = getCart(), it = c.find((i) => same(i, id, shade));
    it ? it.qty++ : c.push({ id, shade: shade || '', qty: 1 });
    setCart(c);
    const s = (byId(id)?.shades || []).find((x) => x.id === shade);
    announce(s ? `Товар додано в кошик, відтінок ${s.name}` : 'Товар додано в кошик');
  }

  /* ---------- Шапка ---------- */
  function initHeader() {
    const t = $('#menu-toggle'), m = $('#mobile-menu');
    if (t && m) {
      const set = (open) => {
        m.classList.toggle('hidden', !open); m.classList.toggle('block', open);
        $('#icon-open').classList.toggle('hidden', open); $('#icon-close').classList.toggle('hidden', !open);
        t.setAttribute('aria-expanded', String(open));
        t.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
      };
      t.addEventListener('click', () => set(t.getAttribute('aria-expanded') !== 'true'));
      m.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && t.getAttribute('aria-expanded') === 'true') { set(false); t.focus(); }
      });
    }
    // Випадне меню <details>: закриття по кліку поза ним і по Esc
    document.addEventListener('click', (e) => {
      document.querySelectorAll('header details[open]').forEach((d) => { if (!d.contains(e.target)) d.open = false; });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('header details[open]').forEach((d) => { d.open = false; d.querySelector('summary').focus(); });
    });
  }

  /* ---------- Картка товару (для каталогу) ---------- */
  const OUT = 'inline-flex min-h-11 w-full items-center justify-center rounded-xl border-[1.5px] border-dark px-6 text-base font-semibold text-dark transition-colors hover:bg-tint active:bg-line motion-reduce:transition-none';
  const cardHTML = (p) => `
    <li>
      <article class="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow duration-200 hover:shadow-card focus-within:shadow-card motion-reduce:transition-none">
        <figure class="aspect-[4/5] bg-tint"><img src="${p.img}" alt="" width="480" height="600" loading="lazy" class="h-full w-full object-cover" /></figure>
        <div class="flex flex-1 flex-col gap-2 p-4 md:p-6">
          <div class="flex flex-wrap gap-1">${p.undertones.map((u) => `<span class="rounded-md bg-tint px-2 py-1 text-sm font-medium">${D.tones[u]}</span>`).join('')}</div>
          <h3 class="text-xl font-semibold leading-snug md:text-2xl">${p.name}</h3>
          <p class="text-sm text-muted">Фініш: ${p.finish}</p>
          <div class="mt-auto flex flex-col gap-3 pt-2">
            <p class="text-lg font-semibold"><span class="sr-only">Ціна: </span>${fmt(p.price)}</p>
            ${p.inStock
              ? `<button type="button" data-add="${p.id}" aria-label="Додати в кошик: ${p.name}" class="${OUT}">Додати в кошик</button>`
              : `<p class="flex items-center gap-2 text-sm font-medium text-warning"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" stroke-linecap="round" /></svg>Немає в наявності</p>
                 <button type="button" data-notify="${p.id}" class="${OUT}">Повідомити про наявність</button>`}
          </div>
        </div>
      </article>
    </li>`;

  /* ---------- Каталог: фільтри з параметрів URL ---------- */
  function initCatalog() {
    const grid = $('#catalog-grid');
    if (!grid) return;
    const q = new URLSearchParams(location.search);
    const cat = q.get('category'), col = q.get('collection'), text = (q.get('q') || '').trim().toLowerCase();
    const tones = q.getAll('tone'), fin = q.getAll('finish');
    const min = Number(q.get('min')) || 0, max = Number(q.get('max')) || Infinity;

    let list = D.products.filter((p) =>
      (!cat || p.category === cat) && (!col || p.collection === col) &&
      (!text || p.name.toLowerCase().includes(text)) &&
      (!tones.length || p.undertones.some((u) => tones.includes(u))) &&
      (!fin.length || fin.includes(p.finish)) && p.price >= min && p.price <= max);

    // Правило магазину: якщо за підтоном нічого немає, показати весь список із попередженням
    let fallback = false;
    if (tones.length && !list.length) {
      const rest = D.products.filter((p) =>
        (!cat || p.category === cat) && (!col || p.collection === col) &&
        (!text || p.name.toLowerCase().includes(text)) &&
        (!fin.length || fin.includes(p.finish)) && p.price >= min && p.price <= max);
      if (rest.length) { list = rest; fallback = true; }
    }
    $('#catalog-notice')?.classList.toggle('hidden', !fallback);

    const title = (col && D.collections.find((c) => c.slug === col)?.name) || D.cats[cat] || 'Каталог';
    $('#catalog-title').textContent = title;
    document.title = `${title} — Florys`;
    $('#catalog-count').textContent = `${fallback ? 'Показано' : 'Знайдено'} товарів: ${list.length}`;
    grid.innerHTML = list.map(cardHTML).join('');
    $('#catalog-empty').classList.toggle('hidden', list.length > 0);

    // Відновити стан форми та зберегти категорію/колекцію/пошук при застосуванні фільтрів
    const form = $('#filters-form');
    form.querySelectorAll('input[type=checkbox]').forEach((i) => { i.checked = q.getAll(i.name).includes(i.value); });
    form.elements.min.value = q.get('min') || ''; form.elements.max.value = q.get('max') || '';
    [['category', cat], ['collection', col], ['q', q.get('q')]].forEach(([n, v]) => {
      if (!v) return;
      const h = document.createElement('input'); h.type = 'hidden'; h.name = n; h.value = v; form.append(h);
    });
    // Активний пункт бічної панелі
    document.querySelectorAll('aside a[href^="catalog.html"]').forEach((a) => {
      const u = new URL(a.href), same = u.searchParams.get('category') === cat && u.searchParams.get('collection') === col;
      if (same) a.setAttribute('aria-current', 'page');
    });
  }

  /* ---------- Кошик: сторінка ---------- */
  function initCartPage() {
    const list = $('#cart-items');
    if (!list) return;
    const render = () => {
      const items = getCart().filter((i) => byId(i.id));
      $('#cart-empty').classList.toggle('hidden', items.length > 0);
      $('#cart-content').classList.toggle('hidden', items.length === 0);
      $('#cart-content').classList.toggle('lg:grid', items.length > 0);
      list.innerHTML = items.map((i) => {
        const p = byId(i.id), sh = shadeOf(i), key = `${i.id}|${i.shade || ''}`, B = 'inline-flex h-11 w-11 items-center justify-center rounded-lg border border-input-border text-xl transition-colors hover:bg-tint';
        return `<li class="flex gap-4 rounded-2xl border border-line bg-white p-4 md:p-6">
          <img src="${sh ? sh.img : p.img}" alt="" width="96" height="120" class="h-28 w-24 rounded-lg bg-tint object-cover" />
          <div class="flex flex-1 flex-col gap-2">
            <h2 class="text-lg font-semibold">${p.name}</h2>
            ${sh ? `<p class="text-sm text-muted">Відтінок: ${sh.name}</p>` : ''}
            <p class="text-muted">${fmt(p.price)}</p>
            <div class="mt-auto flex flex-wrap items-center gap-3">
              <div class="flex items-center gap-2">
                <button type="button" data-dec="${key}" aria-label="Зменшити кількість: ${p.name}${sh ? `, ${sh.name}` : ''}" class="${B}">−</button>
                <span class="min-w-8 text-center" aria-label="Кількість">${i.qty}</span>
                <button type="button" data-inc="${key}" aria-label="Збільшити кількість: ${p.name}${sh ? `, ${sh.name}` : ''}" class="${B}">+</button>
              </div>
              <button type="button" data-remove="${key}" class="min-h-11 rounded px-2 text-primary underline underline-offset-4">Видалити</button>
              <p class="ml-auto text-lg font-semibold">${fmt(p.price * i.qty)}</p>
            </div>
          </div>
        </li>`;
      }).join('');
      const total = items.reduce((s, i) => s + byId(i.id).price * i.qty, 0);
      $('#cart-total').textContent = fmt(total);
      updateShipping(total, items.length > 0);
    };
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-inc],[data-dec],[data-remove]');
      if (!b) return;
      const [id, shade = ''] = (b.dataset.inc || b.dataset.dec || b.dataset.remove).split('|');
      let c = getCart();
      const it = c.find((i) => same(i, id, shade));
      if (b.dataset.inc) it.qty++;
      if (b.dataset.dec) it.qty = Math.max(1, it.qty - 1);
      if (b.dataset.remove) { c = c.filter((i) => !same(i, id, shade)); announce('Товар видалено з кошика'); }
      setCart(c); render();
    });
    render();
  }

  /* ---------- Відтінки на картках товарів ---------- */
  // Наведення або клік на кружечок змінює фото й назву відтінку; вибір лишається,
  // доки курсор не переведено на інший відтінок. У кошик іде останній обраний відтінок.
  function initShades() {
    document.querySelectorAll('[data-add],[data-notify]').forEach((btn) => {
      const p = byId(btn.dataset.add || btn.dataset.notify);
      const card = btn.closest('article');
      if (!p || !p.shades || p.shades.length < 2 || !card || card.dataset.shades) return;
      card.dataset.shades = '1';
      const img = card.querySelector('img'), title = card.querySelector('h3, h4');
      if (!img || !title) return;
      const name = document.createElement('span');
      name.className = 'ml-1 text-base font-normal text-muted';
      title.append(name);
      img.classList.add('transition-opacity', 'duration-200', 'motion-reduce:transition-none');
      const row = document.createElement('div');
      row.setAttribute('role', 'radiogroup');
      row.setAttribute('aria-label', `Відтінок: ${p.name}`);
      row.className = 'flex flex-wrap items-center';
      const SEL = ['scale-125', 'ring-2', 'ring-dark', 'ring-offset-2'];
      const dots = p.shades.map((s, i) => {
        new Image().src = s.img; // завантажити заздалегідь, щоб заміна була миттєвою
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-label', s.name);
        b.className = 'inline-flex h-11 w-11 items-center justify-center rounded-full';
        const dot = document.createElement('span');
        dot.className = 'h-6 w-6 rounded-full border border-input-border transition-transform duration-150 motion-reduce:transition-none';
        dot.style.backgroundColor = s.hex;
        b.append(dot);
        b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') select(i); });
        b.addEventListener('click', () => select(i));
        row.append(b);
        return b;
      });
      function select(i) {
        const s = p.shades[i];
        if (new URL(s.img, location.href).href !== img.src) {
          img.onload = img.onerror = () => img.classList.remove('opacity-0');
          img.classList.add('opacity-0');
          img.src = s.img;
        }
        name.textContent = `– ${s.name}`;
        dots.forEach((d, k) => {
          d.setAttribute('aria-checked', String(k === i));
          SEL.forEach((c) => d.firstChild.classList.toggle(c, k === i));
        });
        btn.dataset.shade = s.id;
        if (btn.dataset.add !== undefined) {
          const out = s.inStock === false;
          btn.disabled = out;
          btn.textContent = out ? 'Немає в наявності' : 'Додати в кошик';
          btn.classList.toggle('opacity-60', out);
        }
      }
      btn.parentElement.parentElement.insertBefore(row, btn.parentElement);
      select(0);
    });
  }

  window.FLORYS_initShades = initShades;
  document.addEventListener('DOMContentLoaded', () => {
    initHeader(); updateCount(); initCatalog(); initCartPage(); initShades();
    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-add]');
      if (a && !a.disabled) addToCart(a.dataset.add, a.dataset.shade || '');
      if (e.target.closest('[data-notify]')) announce('Сповіщення про наявність буде доступне пізніше');
    });
  });
})();
