/* ============================================================
   BARBER SHOP — script.js
   Mobile nav · Navbar scroll · FAQ accordion · WhatsApp booking
   ============================================================ */

/* ── WhatsApp number (replace with real number when going live) ── */
const WA_NUMBER = '491234567890';

/* ────────────────────────────────────────────────────────────────
   1. NAVBAR — scroll behaviour & mobile toggle
──────────────────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('navToggle');
  const mobileNav = document.getElementById('navMobile');

  if (!navbar || !toggle || !mobileNav) return;

  /* Scroll: add .scrolled class once user scrolls past 20px */
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load in case page is already scrolled

  /* Mobile menu toggle */
  toggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    /* Prevent body scroll when menu is open */
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* Close mobile menu when a link is clicked */
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* Close mobile menu on resize to desktop */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      mobileNav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();

/* ────────────────────────────────────────────────────────────────
   2. SMOOTH SCROLLING for in-page anchor links
──────────────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '72',
        10
      );

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ────────────────────────────────────────────────────────────────
   3. FAQ ACCORDION
──────────────────────────────────────────────────────────────── */
(function initFAQ() {
  const faqList = document.getElementById('faqList');
  if (!faqList) return;

  faqList.querySelectorAll('.faq-item').forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const inner  = item.querySelector('.faq-answer-inner');

    if (!btn || !answer || !inner) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      /* Close all other open items */
      faqList.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-answer').style.maxHeight = '0';
          openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
      });

      /* Toggle current item */
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = '0';
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        answer.style.maxHeight = inner.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* ────────────────────────────────────────────────────────────────
   4. BOOKING FORM — validation + WhatsApp link generation
──────────────────────────────────────────────────────────────── */
(function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  /* Set the minimum selectable date to today */
  const dateInput = document.getElementById('bookDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  /* Helper: show or hide an error message */
  function setError(errorId, visible) {
    const el = document.getElementById(errorId);
    if (el) el.classList.toggle('visible', visible);
  }

  /* Helper: mark an input/select border red or reset it */
  function setFieldState(fieldEl, isInvalid) {
    if (!fieldEl) return;
    fieldEl.style.borderColor = isInvalid
      ? '#e57373'
      : ''; /* resets to CSS variable */
  }

  /* Clear errors when the user interacts with a field */
  ['bookName', 'bookService', 'bookDate', 'bookTime'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input',  () => { setError(id + 'Error', false); setFieldState(el, false); });
    el.addEventListener('change', () => { setError(id + 'Error', false); setFieldState(el, false); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    /* Grab field values */
    const nameEl    = document.getElementById('bookName');
    const serviceEl = document.getElementById('bookService');
    const dateEl    = document.getElementById('bookDate');
    const timeEl    = document.getElementById('bookTime');
    const noteEl    = document.getElementById('bookNote');

    const name    = nameEl    ? nameEl.value.trim()    : '';
    const service = serviceEl ? serviceEl.value        : '';
    const date    = dateEl    ? dateEl.value           : '';
    const time    = timeEl    ? timeEl.value           : '';
    const note    = noteEl    ? noteEl.value.trim()    : '';

    /* Validate required fields */
    let valid = true;

    if (!name) {
      setError('nameError', true);
      setFieldState(nameEl, true);
      valid = false;
    }

    if (!service) {
      setError('serviceError', true);
      setFieldState(serviceEl, true);
      valid = false;
    }

    if (!date) {
      setError('dateError', true);
      setFieldState(dateEl, true);
      valid = false;
    }

    if (!time) {
      setError('timeError', true);
      setFieldState(timeEl, true);
      valid = false;
    }

    if (!valid) {
      /* Scroll to first error */
      const firstError = form.querySelector('.form-error.visible');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    /* Format date for the message (e.g. "Monday, 31 March 2025") */
    const dateFormatted = formatDate(date);

    /* Build the WhatsApp message */
    let message =
      `Hello, my name is ${name}. ` +
      `I would like to book ${service} on ${dateFormatted} at ${time}.`;

    if (note) {
      message += ` Note: ${note}.`;
    }

    /* Open WhatsApp with the pre-filled message */
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });

  /* Format ISO date string into a readable date */
  function formatDate(isoDate) {
    if (!isoDate) return isoDate;
    try {
      const [year, month, day] = isoDate.split('-').map(Number);
      /* Using UTC to avoid timezone-shift issues with date-only strings */
      const d = new Date(Date.UTC(year, month - 1, day));
      return d.toLocaleDateString('en-GB', {
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric',
        timeZone: 'UTC'
      });
    } catch {
      return isoDate;
    }
  }
})();

/* ────────────────────────────────────────────────────────────────
   5. INTERSECTION OBSERVER — subtle fade-in on scroll
──────────────────────────────────────────────────────────────── */
(function initFadeIn() {
  /* Only run if the browser supports IntersectionObserver */
  if (!('IntersectionObserver' in window)) return;

  /* Add the base fade style via JS so it only applies when JS runs */
  const style = document.createElement('style');
  style.textContent = `
    .fade-in-el {
      opacity: 0;
      transform: translateY(22px);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    .fade-in-el.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  /* Target elements to animate */
  const targets = document.querySelectorAll(
    '.service-card, .why-card, .testimonial-card, .gallery-item, ' +
    '.about-pillar, .service-full-card, .faq-item, .contact-info-item'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        /* Stagger siblings slightly */
        const siblings = Array.from(entry.target.parentElement.children);
        const index    = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${index * 0.07}s`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach(el => {
    el.classList.add('fade-in-el');
    observer.observe(el);
  });
})();
