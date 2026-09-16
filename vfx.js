(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initHeroDepth() {
    const hero = $(".hero");
    const visual = $(".hero__visual");
    if (!hero || !visual || reducedMotion.matches || !finePointer.matches) return;

    const main = $(".hero-photo--main", visual);
    const a = $(".hero-photo--a", visual);
    const b = $(".hero-photo--b", visual);
    const logo = $(".hero__logo-card", visual);
    const sticker = $(".hero-sticker", visual);

    let raf = 0;
    const render = (clientX, clientY) => {
      const rect = hero.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, ((clientX - rect.left) / Math.max(1, rect.width) - .5) * 2));
      const ny = Math.max(-1, Math.min(1, ((clientY - rect.top) / Math.max(1, rect.height) - .5) * 2));
      hero.style.setProperty("--vfx-x", `${((clientX - rect.left) / Math.max(1, rect.width)) * 100}%`);
      hero.style.setProperty("--vfx-y", `${((clientY - rect.top) / Math.max(1, rect.height)) * 100}%`);
      visual.style.setProperty("--halo-x", `${nx * 12}px`);
      visual.style.setProperty("--halo-y", `${ny * 10}px`);
      if (main) main.style.transform = `translate3d(${nx * 7}px,${ny * 6}px,0) rotateX(${ny * -1.1}deg) rotateY(${nx * 1.4}deg)`;
      if (a) a.style.transform = `translate3d(${nx * -10}px,${ny * -8}px,0) rotate(-4deg)`;
      if (b) b.style.transform = `translate3d(${nx * 9}px,${ny * -5}px,0) rotate(5deg)`;
      if (logo) logo.style.transform = `translate3d(${nx * -5}px,${ny * 7}px,0)`;
      if (sticker) sticker.style.transform = `translate3d(${nx * 5}px,${ny * -6}px,0) rotate(8deg)`;
    };

    hero.addEventListener("pointermove", (event) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => render(event.clientX, event.clientY));
    }, { passive: true });

    hero.addEventListener("pointerleave", () => {
      [main, a, b, logo, sticker].forEach((el) => { if (el) el.style.transform = ""; });
      hero.style.setProperty("--vfx-x", "50%");
      hero.style.setProperty("--vfx-y", "50%");
      visual.style.setProperty("--halo-x", "0px");
      visual.style.setProperty("--halo-y", "0px");
    });
  }

  function setPointerVars(element, event) {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    element.style.setProperty("--glare-x", `${x}%`);
    element.style.setProperty("--glare-y", `${y}%`);
  }

  function initGlare() {
    if (reducedMotion.matches || !finePointer.matches) return;
    document.addEventListener("pointermove", (event) => {
      const element = event.target.closest?.("[data-vfx-glare]");
      if (element) setPointerVars(element, event);
    }, { passive: true });
  }

  function initTilt() {
    if (reducedMotion.matches || !finePointer.matches) return;
    document.addEventListener("pointermove", (event) => {
      const card = event.target.closest?.("[data-vfx-tilt]");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = (event.clientX - rect.left) / rect.width - .5;
      const py = (event.clientY - rect.top) / rect.height - .5;
      card.style.setProperty("--tilt-y", `${px * 2.2}deg`);
      card.style.setProperty("--tilt-x", `${py * -2}deg`);
    }, { passive: true });

    document.addEventListener("pointerout", (event) => {
      const card = event.target.closest?.("[data-vfx-tilt]");
      if (!card || (event.relatedTarget && card.contains(event.relatedTarget))) return;
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  }

  function initCartFeedback() {
    const count = $("#headerCartCount");
    if (!count || !("MutationObserver" in window)) return;
    let last = count.textContent;
    const observer = new MutationObserver(() => {
      if (count.textContent === last) return;
      last = count.textContent;
      const targets = [$("#headerCartButton"), $("#mobileCartButton")].filter(Boolean);
      targets.forEach((target) => {
        target.classList.remove("is-pulsing");
        void target.offsetWidth;
        target.classList.add("is-pulsing");
      });
    });
    observer.observe(count, { childList: true, characterData: true, subtree: true });
  }

  function initSectionDepth() {
    if (reducedMotion.matches) return;
    const heroVisual = $(".hero__visual");
    if (!heroVisual || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => heroVisual.classList.toggle("vfx-active", entry.isIntersecting));
    }, { threshold: .15 });
    observer.observe(heroVisual);
  }

  function ensureDynamicCards() {
    const apply = () => {
      $$(".product-card").forEach((card) => {
        card.dataset.vfxTilt = "";
        card.dataset.vfxGlare = "";
      });
    };
    apply();
    const grid = $("#productsGrid");
    if (grid && "MutationObserver" in window) new MutationObserver(apply).observe(grid, { childList: true });
  }

  function init() {
    ensureDynamicCards();
    initHeroDepth();
    initGlare();
    initTilt();
    initCartFeedback();
    initSectionDepth();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
