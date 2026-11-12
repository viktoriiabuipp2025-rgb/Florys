/* Тест підтону Florys: 6 питань + уточнення за зразками шкіри */
const TONES = { cool: 'Холодний', warm: 'Теплий', neutral: 'Нейтральний', olive: 'Оливковий' };
const QUESTIONS = [
  { q: "Якого кольору вени на зап'ясті?", a: [['Блакитні або фіолетові', { cool: 1 }], ['Зеленуваті', { warm: 0.5, olive: 0.5 }], ['Поєднання синіх і зелених', { neutral: 1 }]] },
  { q: 'Як ваша шкіра реагує на сонце?', a: [['Швидко червоніє та обгорає', { cool: 1 }], ['Спочатку червоніє, потім засмагає', { neutral: 1 }], ['Легко засмагає до золотистого відтінку', { warm: 1 }], ['Засмагає до оливкового або бронзового відтінку', { olive: 1 }]] },
  { q: 'Які прикраси вам пасують більше?', a: [['Срібло або біле золото', { cool: 1 }], ['Жовте золото', { warm: 1 }], ['І срібло, і золото однаково добре', { neutral: 1 }], ['Золото з оливковим відтінком шкіри виглядає найкраще', { olive: 1 }]] },
  { q: 'Який колір одягу найкраще підкреслює вашу зовнішність?', a: [['Блакитний, фіолетовий, холодний рожевий', { cool: 1 }], ['Персиковий, кораловий, помаранчевий', { warm: 1 }], ['І холодні, і теплі відтінки', { neutral: 1 }], ['Хакі, оливковий, землисті відтінки', { olive: 1 }]] },
  { q: 'Який відтінок тонального крему зазвичай вам підходить?', a: [['Рожевий або холодний', { cool: 1 }], ['Жовтий або золотистий', { warm: 1 }], ['Нейтральний бежевий', { neutral: 1 }], ['Оливковий або з зеленуватим відтінком', { olive: 1 }]] },
  { q: 'Як виглядає ваша шкіра при природному освітленні?', a: [['Має рожевий або червонуватий відтінок', { cool: 1 }], ['Має жовтуватий або золотистий відтінок', { warm: 1 }], ['Має збалансований бежевий відтінок', { neutral: 1 }], ['Має легкий зеленуватий або сіруватий відтінок', { olive: 1 }]] },
];
const PHOTO = [['Холодний (рожевий)', 'cool'], ['Нейтральний (бежевий)', 'neutral'], ['Теплий (золотистий)', 'warm'], ['Оливковий (зеленуватий)', 'olive']];

// Підрахунок балів і кандидати (при рівності їх кілька)
function score(answers) {
  const s = { cool: 0, warm: 0, neutral: 0, olive: 0 };
  answers.forEach((i, n) => i != null && Object.entries(QUESTIONS[n].a[i][1]).forEach(([k, v]) => (s[k] += v)));
  const max = Math.max(...Object.values(s));
  return { s, candidates: Object.keys(s).filter((k) => s[k] === max) };
}
// Рішення після питання про зразки: зафіксувати підтон або попросити вибрати
function decide(candidates, photo) {
  if (candidates.length === 1) return !photo || photo === candidates[0] ? { lock: candidates[0] } : { choose: [candidates[0], photo], why: 'mismatch' };
  return photo && candidates.includes(photo) ? { lock: photo } : { choose: candidates, why: 'tie' };
}
if (typeof module !== 'undefined') module.exports = { score, decide };

(function () {
  if (typeof document === 'undefined') return; // для перевірки логіки в Node
  const root = document.getElementById('test-root');
  if (!root) return;
  const KEY = 'florys-profile';
  const st = { step: 0, answers: Array(QUESTIONS.length).fill(null), photo: null, view: 'q', choose: [], why: '', tone: null };
  const BTN = 'inline-flex min-h-11 items-center justify-center rounded-xl px-6 text-base font-semibold transition-colors motion-reduce:transition-none';
  const PRIMARY = `${BTN} bg-primary text-white hover:bg-primary-hover active:bg-primary-hover disabled:cursor-not-allowed disabled:bg-line disabled:text-muted`;
  const OUTLINE = `${BTN} border-[1.5px] border-dark text-dark hover:bg-tint active:bg-line`;
  const radio = (name, i, label, checked) => `<label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-input-border bg-white p-4 transition-colors has-[:checked]:border-dark has-[:checked]:bg-tint motion-reduce:transition-none"><input type="radio" name="${name}" value="${i}" ${checked ? 'checked' : ''} class="h-5 w-5 shrink-0 accent-[#9C4E62]" /><span>${label}</span></label>`;
  const total = QUESTIONS.length + 1;

  function render() {
    let html = '';
    if (st.view === 'q') {
      const photo = st.step === QUESTIONS.length;
      const cur = photo ? st.photo : st.answers[st.step];
      const opts = photo ? PHOTO.map((p) => p[0]).concat('Не впевнена') : QUESTIONS[st.step].a.map((a) => a[0]);
      const sel = photo ? (st.photo === 'none' ? PHOTO.length : PHOTO.findIndex((p) => p[1] === st.photo)) : st.answers[st.step];
      html = `<p class="mb-2 text-sm font-medium text-muted">Питання ${st.step + 1} з ${total}</p>
        <progress max="${total}" value="${st.step + 1}" aria-label="Прогрес тесту" class="mb-6 h-2 w-full appearance-none overflow-hidden rounded-full bg-line [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-line [&::-webkit-progress-value]:bg-primary"></progress>
        <fieldset><legend id="q-title" tabindex="-1" class="mb-4 text-xl font-semibold md:text-2xl">${photo ? 'Який зі зразків найближчий до відтінку вашої шкіри?' : QUESTIONS[st.step].q}</legend>
        ${photo ? '<img src="assets/images/color.type.choose.webp" alt="Чотири зразки шкіри: холодний рожевий, нейтральний бежевий, теплий золотистий, оливковий зеленуватий" width="1112" height="741" class="mb-4 h-auto w-full rounded-xl" />' : ''}
        <div class="flex flex-col gap-3">${opts.map((o, i) => radio('opt', i, o, sel === i)).join('')}</div></fieldset>
        <div class="mt-6 flex flex-col gap-3 md:flex-row md:justify-between">
          <button type="button" data-back class="${OUTLINE} w-full md:w-auto" ${st.step === 0 ? 'disabled hidden' : ''}>Назад</button>
          <button type="button" data-next class="${PRIMARY} w-full md:w-auto" ${sel == null || sel < 0 ? 'disabled' : ''}>${photo ? 'Показати результат' : 'Далі'}</button></div>`;
    } else if (st.view === 'choose') {
      const why = st.why === 'tie' ? 'Результат неоднозначний: кілька підтонів набрали однаково балів.' : 'Відповіді й зразок вказують на різні підтони.';
      html = `<h3 id="q-title" tabindex="-1" class="mb-2 text-xl font-semibold md:text-2xl">Уточнімо результат</h3><p class="mb-4 text-muted">${why} Оберіть підтон, який ближчий до вашої шкіри.</p>
        <div class="flex flex-col gap-3 md:flex-row">${st.choose.map((t) => `<button type="button" data-lock="${t}" class="${OUTLINE} w-full md:w-auto">${TONES[t]} підтон</button>`).join('')}</div>`;
    } else {
      html = `<h3 id="q-title" tabindex="-1" class="mb-2 font-display text-3xl font-semibold md:text-4xl">Ваш підтон: ${TONES[st.tone].toLowerCase()}</h3>
        <p class="mb-6 text-muted">Підтон закріплено за вашим профілем у цьому браузері.</p>
        <div class="flex flex-col gap-3 md:flex-row"><a href="catalog.html?tone=${st.tone}" class="${PRIMARY} w-full md:w-auto">Переглянути відтінки</a><button type="button" data-restart class="${OUTLINE} w-full md:w-auto">Пройти ще раз</button></div>`;
    }
    root.innerHTML = html;
    root.querySelector('#q-title')?.focus({ preventScroll: true });
  }
  function finish() {
    const { candidates } = score(st.answers);
    const d = decide(candidates, st.photo && st.photo !== 'none' ? st.photo : null);
    if (d.lock) lock(d.lock); else { Object.assign(st, { view: 'choose', choose: d.choose, why: d.why }); render(); }
  }
  function lock(tone) {
    st.tone = tone; st.view = 'result';
    try { localStorage.setItem(KEY, JSON.stringify({ tone })); } catch {}
    render();
  }
  root.addEventListener('change', (e) => {
    if (e.target.name !== 'opt') return;
    const i = Number(e.target.value);
    if (st.step === QUESTIONS.length) st.photo = i === PHOTO.length ? 'none' : PHOTO[i][1]; else st.answers[st.step] = i;
    root.querySelector('[data-next]').disabled = false;
  });
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-next]')) { st.step === QUESTIONS.length ? finish() : (st.step++, render()); }
    else if (e.target.closest('[data-back]')) { st.step--; render(); }
    else if (e.target.closest('[data-lock]')) lock(e.target.closest('[data-lock]').dataset.lock);
    else if (e.target.closest('[data-restart]')) { Object.assign(st, { step: 0, answers: Array(QUESTIONS.length).fill(null), photo: null, view: 'q' }); render(); }
  });
  render();
})();