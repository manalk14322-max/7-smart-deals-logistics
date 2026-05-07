const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector("[data-nav-menu]");
const navbar = document.querySelector(".navbar");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(pointer: coarse)").matches;

document.documentElement.classList.add("js-ready");

const createChrome = () => {
  const preloader = document.createElement("div");
  preloader.className = "preloader";
  preloader.innerHTML = `
    <div class="preloader__mark">
      <span class="preloader__truck"></span>
      <strong>7 Smart Deals Logistics</strong>
      <i></i>
    </div>
  `;
  document.body.prepend(preloader);

  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.append(progress);

  if (!isTouch) {
    const cursor = document.createElement("div");
    cursor.className = "cursor-glow";
    document.body.append(cursor);
    window.addEventListener("pointermove", (event) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    });
  }

  return { preloader, progress };
};

const { preloader, progress } = createChrome();

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menu.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

const updateScrollUi = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  progress.style.transform = `scaleX(${ratio})`;
  navbar?.classList.toggle("is-scrolled", window.scrollY > 16);
};

window.addEventListener("scroll", updateScrollUi, { passive: true });
updateScrollUi();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll("a[href$='.html'], .brand[href]").forEach((link) => {
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;

  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    document.body.classList.add("page-leaving");
    setTimeout(() => {
      window.location.href = link.href;
    }, reduceMotion ? 0 : 420);
  });
});

const animateWithGsap = () => {
  if (!window.gsap || reduceMotion) {
    preloader.classList.add("is-hidden");
    document.body.classList.add("page-loaded");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const loadTl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      preloader.classList.add("is-hidden");
      document.body.classList.add("page-loaded");
    }
  });

  loadTl
    .to(".preloader__truck", { x: 92, duration: 0.9, ease: "power2.inOut" })
    .to(".preloader__mark i", { scaleX: 1, duration: 0.45 }, 0.15)
    .to(preloader, { opacity: 0, duration: 0.45, pointerEvents: "none" }, "+=0.15")
    .from(".hero .eyebrow, .page-hero .breadcrumb", { opacity: 0, y: 22, filter: "blur(10px)", duration: 0.65 }, "-=0.1")
    .from(".hero h1, .page-hero h1", { opacity: 0, y: 28, filter: "blur(10px)", duration: 0.8 }, "-=0.45")
    .from(".hero__copy, .page-hero p:last-child", { opacity: 0, y: 22, duration: 0.62 }, "-=0.45")
    .from(".hero__actions .btn", { opacity: 0, y: 18, duration: 0.5, stagger: 0.14 }, "-=0.34")
    .from(".hero__points .point", { opacity: 0, y: 24, duration: 0.5, stagger: 0.12 }, "-=0.2")
    .from(".hero__media", { opacity: 0.2, scale: 1.05, duration: 1.15 }, 2.15);

  gsap.utils.toArray("section:not(.hero):not(.page-hero), .service-detail__main, .service-sidebar, .contact-panel, .contact-info").forEach((section) => {
    gsap.from(section, {
      opacity: 0,
      y: 72,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 84%",
        once: true
      }
    });
  });

  gsap.from(".service-card, .process-card, .testimonial-card, .trust-item, .stat", {
    opacity: 0,
    y: 46,
    scale: 0.96,
    duration: 0.62,
    stagger: 0.09,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".service-grid, .process, .testimonial-track, .trust-strip, .stats",
      start: "top 82%",
      once: true
    }
  });

  gsap.utils.toArray(".stat strong").forEach((counter) => {
    const raw = counter.textContent.trim();
    const target = Number(raw.replace(/[^0-9]/g, ""));
    if (!target) return;
    const suffix = raw.replace(/[0-9,]/g, "");
    const state = { value: 0 };

    gsap.to(state, {
      value: target,
      duration: 1.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: counter,
        start: "top 88%",
        once: true
      },
      onUpdate: () => {
        counter.textContent = `${Math.round(state.value).toLocaleString()}${suffix}`;
      }
    });
  });

  if (!isTouch) {
    gsap.to(".hero__media", {
      backgroundPosition: "center, center, right 3vw center",
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.8
      }
    });
  }
};

const addMagneticCards = () => {
  if (isTouch || reduceMotion) return;

  document.querySelectorAll(".service-card, .process-card, .testimonial-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 7;
      const rotateX = ((y / rect.height) - 0.5) * -7;
      card.style.setProperty("--spot-x", `${x}px`);
      card.style.setProperty("--spot-y", `${y}px`);
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0,-8px,0)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
};

const addHeroParallax = () => {
  const hero = document.querySelector(".hero");
  if (!hero || isTouch || reduceMotion) return;

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
    hero.style.setProperty("--hero-shift-x", `${x}px`);
    hero.style.setProperty("--hero-shift-y", `${y}px`);
  });

  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--hero-shift-x", "0px");
    hero.style.setProperty("--hero-shift-y", "0px");
  });
};

const addTestimonials = () => {
  const track = document.querySelector("[data-testimonial-track]");
  if (!track || reduceMotion) return;
  const cards = [...track.children];
  cards.forEach((card) => track.append(card.cloneNode(true)));
};

window.addEventListener("load", () => {
  animateWithGsap();
  addMagneticCards();
  addHeroParallax();
  addTestimonials();
});
