/* ============================================================
   Forno Rosso — interactions & animations
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky nav shadow ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById("navToggle");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  // close menu when a link is tapped
  nav.querySelectorAll(".nav__links a, .nav__cta").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  revealEls.forEach((el) => {
    const d = el.getAttribute("data-delay");
    if (d) el.style.setProperty("--d", d);
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Hero flag (for accent underline) ---------- */
  const hero = document.querySelector(".hero");
  if (hero) requestAnimationFrame(() => hero.classList.add("is-in"));

  /* ---------- Hero parallax ---------- */
  const pizza = document.querySelector(".pizza");
  if (pizza && !reduceMotion) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          pizza.style.transform = `translateY(${y * 0.12}px)`;
        }
      },
      { passive: true }
    );
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll(".stat__num");
  const runCounter = (el) => {
    const target = parseFloat(el.getAttribute("data-count"));
    const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1600;
    let startTime = null;

    const format = (val) => {
      let n = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString();
      return n + suffix;
    };

    if (reduceMotion) {
      el.textContent = format(target);
      return;
    }

    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = format(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const cObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => cObs.observe(c));
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Testimonials carousel ---------- */
  const track = document.getElementById("reviewsTrack");
  if (track) {
    const slides = Array.from(track.querySelectorAll(".review"));
    const dotsWrap = document.getElementById("reviewDots");
    const prevBtn = document.getElementById("reviewPrev");
    const nextBtn = document.getElementById("reviewNext");
    let index = 0;
    let timer = null;
    const INTERVAL = 6000;

    // build dots
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", `Review ${i + 1}`);
      if (i === 0) b.classList.add("is-active");
      b.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(b);
    });
    const dots = Array.from(dotsWrap.children);

    function go(next, userAction) {
      slides[index].classList.remove("is-active");
      dots[index].classList.remove("is-active");
      index = (next + slides.length) % slides.length;
      slides[index].classList.add("is-active");
      dots[index].classList.add("is-active");
      if (userAction) restart();
    }

    function start() {
      if (reduceMotion) return;
      timer = setInterval(() => go(index + 1), INTERVAL);
    }
    function stop() {
      if (timer) clearInterval(timer);
    }
    function restart() {
      stop();
      start();
    }

    nextBtn.addEventListener("click", () => go(index + 1, true));
    prevBtn.addEventListener("click", () => go(index - 1, true));

    // pause on hover
    const reviewsEl = track.closest(".reviews");
    reviewsEl.addEventListener("mouseenter", stop);
    reviewsEl.addEventListener("mouseleave", start);

    start();
  }

  /* ---------- Demo order button ---------- */
  const orderBtn = document.getElementById("orderBtn");
  const orderNote = document.getElementById("orderNote");
  if (orderBtn && orderNote) {
    orderBtn.addEventListener("click", (e) => {
      e.preventDefault();
      orderNote.hidden = false;
      orderBtn.textContent = "🍕 Order placed!";
      setTimeout(() => (orderBtn.textContent = "Order Online"), 2600);
    });
  }
})();
