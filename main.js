/**
 * ApexOps — main.js
 * Handles: nav scroll, aurora parallax, scroll reveal,
 * dashboard counters, FAQ accordion, mobile menu, multi-step form.
 *
 * FORM SETUP:
 * 1. Create a free account at formspree.io
 * 2. Create a new form, copy your form ID
 * 3. Replace REPLACE_WITH_YOUR_FORMSPREE_ID below with your ID
 *    e.g. 'xvgojpqz'
 */

const FORMSPREE_ID = 'mgonellp';

/* ============================================================
   UTILITIES
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/* ============================================================
   NAVIGATION — scroll glass effect
   ============================================================ */
function initNav() {
  const nav = $('#nav');
  if (!nav) return;

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
function initMobileMenu() {
  const hamburger   = $('.hamburger');
  const mobileNav   = $('#mobile-nav');
  const closeBtn    = $('.mobile-nav-close');
  const mobileLinks = $$('.mobile-nav-links a');
  if (!hamburger || !mobileNav) return;

  function openMenu() {
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.classList.add('open');
    mobileNav.classList.add('open');
    mobileNav.removeAttribute('aria-hidden');
    document.body.classList.add('menu-open');
    // Focus the close button
    setTimeout(() => closeBtn && closeBtn.focus(), 50);
  }

  function closeMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    hamburger.focus();
  }

  hamburger.addEventListener('click', openMenu);
  closeBtn && closeBtn.addEventListener('click', closeMenu);

  // Close on link click
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeMenu();
  });
}

/* ============================================================
   AURORA MOUSE PARALLAX
   ============================================================ */
function initAuroraParallax() {
  const orbs = $$('.aurora .aurora-orb');
  if (!orbs.length) return;

  let mouseX = 0.5;
  let mouseY = 0.5;
  let currentX = 0.5;
  let currentY = 0.5;
  let rafId = null;
  const hero = $('.hero');
  if (!hero) return;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  const strengths = [18, -22, 14]; // px offset per orb

  function tick() {
    // Lerp toward mouse position (smooth follow)
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;

    orbs.forEach((orb, i) => {
      const s = strengths[i] || 15;
      const dx = (currentX - 0.5) * s;
      const dy = (currentY - 0.5) * s;
      orb.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    rafId = requestAnimationFrame(tick);
  }

  tick();
}

/* ============================================================
   SCROLL REVEAL — IntersectionObserver
   ============================================================ */
function initScrollReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  // Check prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    els.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach(el => observer.observe(el));
}

/* ============================================================
   DASHBOARD COUNTERS — animate numbers up
   ============================================================ */
function initCounters() {
  const counters = $$('.counter');
  if (!counters.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        observer.unobserve(el);

        if (prefersReduced) {
          el.textContent = target;
          return;
        }

        animateCounter(el, target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el, target) {
  const duration = 1400;
  const start = performance.now();

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value    = Math.floor(easeOutCubic(progress) * target);
    el.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFAQ() {
  const items = $$('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      items.forEach(other => {
        if (other === item) return;
        other.classList.remove('open');
        const otherBtn    = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherBtn)    otherBtn.setAttribute('aria-expanded', 'false');
        if (otherAnswer) otherAnswer.hidden = true;
      });

      if (isOpen) {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        answer.hidden = true;
      } else {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });
}

/* ============================================================
   FORM — multi-step + Formspree submission
   ============================================================ */
function initForm() {
  const form       = $('#audit-form');
  const step1      = $('#form-step-1');
  const step2      = $('#form-step-2');
  const success    = $('#form-success');
  const btnNext    = $('#btn-next');
  const btnBack    = $('#btn-back');
  const btnSubmit  = $('#btn-submit');
  const progress   = $$('.form-progress-step');
  const progressEl = $('.form-progress');

  if (!form) return;

  // ---- Validation helpers ----
  function validateField(input) {
    const errorEl = input.parentElement.querySelector('.field-error');
    let msg = '';

    if (input.required && !input.value.trim()) {
      msg = 'This field is required.';
    } else if (input.type === 'email' && input.value.trim()) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(input.value.trim())) msg = 'Please enter a valid email address.';
    }

    if (errorEl) errorEl.textContent = msg;
    input.classList.toggle('error', !!msg);
    return !msg;
  }

  function validateStep(stepEl) {
    const inputs = $$('input[required], select[required]', stepEl);
    return inputs.map(validateField).every(Boolean);
  }

  // Live validation on blur
  $$('input, select', form).forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  // ---- Progress indicator ----
  function setProgress(step) {
    progress.forEach((dot, i) => {
      dot.classList.toggle('active', i + 1 === step);
      dot.classList.toggle('completed', i + 1 < step);
      const numEl = dot.querySelector('.progress-num');
      if (numEl) {
        numEl.textContent = i + 1 < step ? '✓' : String(i + 1);
      }
    });
    if (progressEl) {
      progressEl.setAttribute('aria-valuenow', String(step));
    }
  }

  // ---- Step navigation ----
  btnNext && btnNext.addEventListener('click', () => {
    if (!validateStep(step1)) return;

    step1.hidden = true;
    step1.classList.remove('active');
    step2.hidden = false;
    step2.classList.add('active');
    setProgress(2);

    // Focus first field in step 2
    const firstInput = step2.querySelector('select');
    if (firstInput) firstInput.focus();
  });

  btnBack && btnBack.addEventListener('click', () => {
    step2.hidden = true;
    step2.classList.remove('active');
    step1.hidden = false;
    step1.classList.add('active');
    setProgress(1);
  });

  // ---- Form submission ----
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateStep(step2)) return;

    // Swap button to loading state
    const labelEl   = btnSubmit.querySelector('.btn-label');
    const loadingEl = btnSubmit.querySelector('.btn-loading');
    if (labelEl)   labelEl.hidden   = true;
    if (loadingEl) loadingEl.hidden = false;
    btnSubmit.disabled = true;

    const data = new FormData(form);

    try {
      const endpoint = `https://formspree.io/f/${FORMSPREE_ID}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        showSuccess();
      } else {
        const json = await res.json().catch(() => ({}));
        showError(json.errors ? json.errors.map(e => e.message).join(', ') : 'Submission failed. Please try again or email braedon@apexoperations.us directly.');
      }
    } catch {
      showError('Network error. Please check your connection and try again, or email braedon@apexoperations.us.');
    } finally {
      if (labelEl)   labelEl.hidden   = false;
      if (loadingEl) loadingEl.hidden = true;
      btnSubmit.disabled = false;
    }
  });

  function showSuccess() {
    step2.hidden  = true;
    success.hidden = false;
    const progressWrapper = form.querySelector('.form-progress');
    if (progressWrapper) progressWrapper.style.display = 'none';
    // Scroll card into view
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showError(msg) {
    // Show below the submit button
    let errEl = form.querySelector('.form-global-error');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'form-global-error field-error';
      errEl.style.marginTop = '0.5rem';
      form.appendChild(errEl);
    }
    errEl.textContent = msg;
  }
}

/* ============================================================
   SMOOTH ANCHOR SCROLLING
   (fallback for browsers that don't support CSS scroll-behavior)
   ============================================================ */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update URL without triggering scroll
      history.pushState(null, '', `#${id}`);
    });
  });
}

/* ============================================================
   TEXT SCRAMBLE — hero headline reveal on load
   ============================================================ */
function initTextScramble() {
  const el = $('.scramble-text');
  if (!el) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const original = el.textContent.trim();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let frame = 0;
  let iteration = 0;

  function update() {
    el.textContent = original.split('').map((char, i) => {
      if (char === ' ' || char === "'" || char === '.') return char;
      if (i < iteration) return original[i];
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');

    if (frame % 2 === 0 && iteration < original.length) iteration++;
    frame++;

    if (iteration < original.length) {
      requestAnimationFrame(update);
    } else {
      el.textContent = original;
    }
  }

  // Start after hero entrance animation begins
  setTimeout(update, 350);
}

/* ============================================================
   3D CARD TILT — desktop only, respects reduced motion
   ============================================================ */
function initCardTilt() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 1023px)').matches;
  if (prefersReduced || isMobile) return;

  const cards = $$('.pain-card, .system-module, .offer-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -6}deg) rotateY(${x * 6}deg) translateY(-5px)`;
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ============================================================
   INIT — run everything
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMobileMenu();
  initAuroraParallax();
  initScrollReveal();
  initCounters();
  initFAQ();
  initForm();
  initSmoothScroll();
  initTextScramble();
  initCardTilt();

  // Hero entrance animation — stagger children
  const heroText = $('.hero-text');
  if (heroText) {
    const children = [...heroText.children];
    children.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms`;

      // Trigger on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
  }
});
