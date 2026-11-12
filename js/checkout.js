/* Оформлення замовлення Florys */
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzpqErMJMcMYMY4IZN1FBa0cJ6Udc5nD19Km-WIJqGwDUBu60lFXkp4wFaOLemBCT0y/exec";
const FREE_FROM = 2000;
// Промокоди: заповніть, коли визначите тип знижки. Приклад: 'FLORYS10': { type: 'percent', value: 10 }
const PROMOS = {};

// Підсумки: знижка за промокодом, кешбек, безкоштовна доставка
function calc(subtotal, promo, cashback) {
  const disc = !promo
    ? 0
    : promo.type === "percent"
      ? Math.round((subtotal * promo.value) / 100)
      : Math.min(promo.value, subtotal);
  const cb = Math.max(0, Math.min(cashback || 0, subtotal - disc));
  return {
    disc,
    cb,
    total: subtotal - disc - cb,
    freeShipping: subtotal >= FREE_FROM,
  };
}
const rules = {
  name: (v) =>
    v.trim().split(/\s+/).filter(Boolean).length >= 2 ||
    "Вкажіть прізвище та ім’я",
  phone: (v) =>
    /^\+380\d{9}$/.test(v.replace(/[\s()-]/g, "")) ||
    "Введіть номер у форматі +380XXXXXXXXX",
  nick: (v) => v.trim().length >= 3 || "Вкажіть нік у Telegram або Instagram",
  city: (v) => v.trim().length >= 2 || "Вкажіть місто",
  branch: (v) =>
    /^\d{1,4}$/.test(v.trim()) || "Вкажіть номер відділення цифрами",
};
if (typeof module !== "undefined") module.exports = { calc, rules };

(function () {
  if (typeof document === "undefined") return;
  const D = window.FLORYS,
    $ = (s) => document.querySelector(s),
    fmt = (n) => `${n} ₴`;
  const form = $("#checkout-form");
  if (!form) return;
  const CART = "florys-cart";
  const read = (k) => {
    try {
      return JSON.parse(localStorage.getItem(k));
    } catch {
      return null;
    }
  };
  const byId = (id) => D.products.find((p) => p.id === id);
  const user = read("florys-user");
  let promo = null,
    cashback = 0;
  const cart = () => (read(CART) || []).filter((i) => byId(i.id));
  const subtotal = () =>
    cart().reduce((s, i) => s + byId(i.id).price * i.qty, 0);
  const OUT =
    "inline-flex min-h-11 items-center justify-center rounded-xl border-[1.5px] border-dark px-4 text-base font-semibold text-dark transition-colors hover:bg-tint active:bg-line motion-reduce:transition-none";

  function render() {
    const items = cart(),
      sub = subtotal(),
      r = calc(sub, promo, cashback);
    $("#checkout-empty").classList.toggle("hidden", items.length > 0);
    $("#checkout-layout").classList.toggle("hidden", items.length === 0);
    $("#sum-items").innerHTML = items
      .map((i) => {
        const p = byId(i.id),
          sh = (p.shades || []).find((s) => s.id === i.shade);
        return `<li class="flex items-center gap-3">
        <span class="relative shrink-0"><img src="${sh ? sh.img : p.img}" alt="" width="64" height="80" class="h-20 w-16 rounded-lg bg-tint object-cover" /><span class="absolute -right-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-dark px-1 text-sm text-white" aria-label="Кількість: ${i.qty}">${i.qty}</span></span>
        <span class="flex-1">${p.name}${sh ? `<span class="block text-sm text-muted">${sh.name}</span>` : ""}</span><span class="font-medium">${fmt(p.price * i.qty)}</span></li>`;
      })
      .join("");
    $("#sum-subtotal").textContent = fmt(sub);
    $("#sum-promo-row").classList.toggle("hidden", !r.disc);
    $("#sum-promo").textContent = `−${fmt(r.disc)}`;
    $("#sum-cb-row").classList.toggle("hidden", !r.cb);
    $("#sum-cb").textContent = `−${fmt(r.cb)}`;
    $("#sum-ship").textContent = r.freeShipping
      ? "Безкоштовна"
      : "За тарифом служби доставки";
    $("#sum-total").textContent = fmt(r.total);
    const inCart = items.map((i) => i.id),
      rec = D.products
        .filter((p) => p.inStock && !inCart.includes(p.id))
        .slice(0, 2);
    $("#recs").innerHTML = rec
      .map(
        (
          p,
        ) => `<li class="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
      <img src="${p.img}" alt="" width="56" height="70" loading="lazy" class="h-[70px] w-14 rounded-lg bg-tint object-cover" />
      <span class="flex-1"><span class="block">${p.name}</span><span class="font-semibold">${fmt(p.price)}</span></span>
      <button type="button" data-rec="${p.id}" aria-label="Додати в кошик: ${p.name}" class="${OUT}">Додати</button></li>`,
      )
      .join("");
    $("#recs-box").classList.toggle("hidden", rec.length === 0);
  }

  // Промокод
  $("#promo-apply").addEventListener("click", () => {
    const code = $("#promo").value.trim().toUpperCase(),
      msg = $("#promo-msg"),
      ok = Boolean(PROMOS[code]);
    promo = ok ? PROMOS[code] : null;
    msg.textContent = ok ? "Промокод застосовано" : "Промокод не знайдено";
    msg.className = `mt-2 text-sm font-medium ${ok ? "text-primary" : "text-danger"}`;
    render();
  });

  // Кешбек
  const bal = (user && user.cashback) || 0;
  $("#cb-box").innerHTML = user
    ? `<label for="cb" class="mb-1 block text-sm font-medium">Списати кешбек (доступно ${fmt(bal)})</label><input id="cb" type="number" min="0" max="${bal}" value="0" ${bal ? "" : "disabled"} class="min-h-12 w-full rounded-xl border border-input-border bg-white px-4 text-base" />`
    : '<p class="text-sm text-muted">Увійдіть, щоб отримувати 5% кешбеку з кожного замовлення. <a href="account.html" class="text-primary underline underline-offset-4">Увійти</a></p>';
  $("#cb")?.addEventListener("input", (e) => {
    cashback = Math.max(0, Math.min(Number(e.target.value) || 0, bal));
    render();
  });

  // Рекомендації
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rec]");
    if (!b) return;
    const c = read(CART) || [],
      it = c.find((i) => i.id === b.dataset.rec);
    it ? it.qty++ : c.push({ id: b.dataset.rec, qty: 1 });
    localStorage.setItem(CART, JSON.stringify(c));
    render();
  });

  // Валідація й відправка
  const show = (n, m) => {
    const e = $(`#err-${n}`);
    if (!e) return;
    e.classList.toggle("hidden", !m);
    e.classList.toggle("flex", Boolean(m));
    e.querySelector("span").textContent = m || "";
    form.elements[n]?.setAttribute?.("aria-invalid", String(Boolean(m)));
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let first = null;
    Object.keys(rules).forEach((n) => {
      const v = rules[n](form.elements[n].value);
      show(n, v === true ? "" : v);
      if (v !== true && !first) first = form.elements[n];
    });
    const consent = form.elements.consent.checked;
    show("consent", consent ? "" : "Підтвердіть, що ознайомлені з умовами");
    if (!consent && !first) first = form.elements.consent;
    if (first) {
      first.focus();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    const origBtnText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Відправляємо...";
    }

    const f = new FormData(form),
      num = `FL-${Date.now().toString(36).toUpperCase()}`,
      r = calc(subtotal(), promo, cashback);
    const currentItems = cart();

    // Формуємо список товарів для таблиці разом із назвою відтінку (якщо він є)
    const itemsText = currentItems
      .map((i) => {
        const p = byId(i.id);
        const sh = (p.shades || []).find((s) => s.id === i.shade);
        const shadeLabel = sh ? ` (${sh.name})` : "";
        return `${p.name}${shadeLabel} × ${i.qty} шт. (${p.price * i.qty} ₴)`;
      })
      .join("\n");

    const order = {
      number: num,
      total: r.total,
      delivery: f.get("carrier"),
      payment: f.get("payment"),
      items: currentItems,
      itemsText: itemsText,
      contact: {
        name: f.get("name"),
        phone: f.get("phone"),
        nick: f.get("nick"),
        city: f.get("city"),
        branch: f.get("branch"),
      },
    };

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(order),
      });

      try {
        localStorage.setItem("florys-last-order", JSON.stringify(order));
        localStorage.removeItem(CART);
      } catch {}
      const cnt = $("#cart-count");
      if (cnt) cnt.classList.add("hidden");
      const cod = f.get("payment") === "cod";

      $("#checkout-layout").innerHTML =
        `<section aria-labelledby="done-title" class="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-6 md:p-8 lg:col-span-2">
        <h2 id="done-title" tabindex="-1" class="font-display text-2xl font-semibold md:text-3xl">Дякуємо за замовлення!</h2>
        <p class="mt-2">Номер замовлення: <strong>${num}</strong>. Сума до сплати: <strong>${fmt(r.total)}</strong>.</p>
        <p class="mt-4">${cod ? "Оплата при отриманні на відділенні." : "Реквізити для оплати: {{РЕКВІЗИТИ}}. Після оплати надішліть скриншот у Telegram або Instagram із номером замовлення, ми перевіримо його вручну."}</p>
        <p class="mt-4 text-muted">Про статус замовлення повідомимо в месенджері: ${order.contact.nick}.</p>
        ${user ? "" : '<p class="mt-4">Створіть акаунт, щоб отримувати 5% кешбеку з кожного замовлення. <a href="account.html" class="text-primary underline underline-offset-4">Створити акаунт</a></p>'}
        <a href="index.html" class="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border-[1.5px] border-dark px-6 font-semibold text-dark hover:bg-tint">На головну</a></section>`;
      $("#done-title").focus();
    } catch (err) {
      console.error("Помилка відправки замовлення:", err);
      alert(
        "Не вдалося відправити замовлення. Перевірте з’єднання з інтернетом та спробуйте ще раз.",
      );
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = origBtnText;
      }
    }
  });

  render();
})();
