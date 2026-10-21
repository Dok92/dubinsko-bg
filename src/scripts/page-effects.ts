const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const ba = document.getElementById('ba');
const range = document.getElementById('baRange') as HTMLInputElement | null;
if (ba && range) {
  let raf = 0;
  const apply = () => {
    raf = 0;
    ba.style.setProperty('--pos', `${range.value}%`);
  };
  range.addEventListener(
    'input',
    () => {
      raf ||= requestAnimationFrame(apply);
    },
    { passive: true },
  );

  if (!reduce) {
    let stop = false;
    const halt = () => {
      stop = true;
    };
    range.addEventListener('pointerdown', halt, { once: true });
    range.addEventListener('keydown', halt, { once: true });
    const start = performance.now() + 900;
    const dur = 1500;
    const tick = (now: number) => {
      if (stop) return;
      const p = Math.min(Math.max((now - start) / dur, 0), 1);
      range.value = String(50 + 28 * Math.sin(p * Math.PI) * (1 - p));
      apply();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
  Array.from(group.children).forEach((child, i) => {
    (child as HTMLElement).style.setProperty('--d', `${i * 90}ms`);
  });
});

// ---- Counters ----
const fmt = new Intl.NumberFormat('sr-RS');
const countUp = (el: HTMLElement) => {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix ?? '';
  if (reduce || !target) return;
  const dur = 1400;
  const t0 = performance.now();
  const step = (now: number) => {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = fmt.format(Math.round(target * (1 - Math.pow(1 - p, 3)))) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      el.classList.add('in');
      el.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
      io.unobserve(el);
    }
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
