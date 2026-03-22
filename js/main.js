/* ========================================
   KOMMZA LANDING — main.js
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initRevealAnimations();
  initHeaderScroll();
  initMenuOverlay();
  initHorizontalPanels();
  initFaqAccordion();
  initStickyCta();
  initModal();
  initGlowCards();
  initChatBubbleSequence();
  initCounterAnimation();
  initHeroVideoRotation();
  initTiltCards();
  initScrollProgress();
  initMagneticButtons();
  initStepsStagger();
  initHpanelContentReveal();
});

/* --- Reveal Animations (IntersectionObserver) --- */
function initRevealAnimations() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => observer.observe(el));
}

/* --- Header: transparent → solid on scroll --- */
function initHeaderScroll() {
  const header = document.getElementById('header');
  const hero = document.getElementById('hero');
  if (!header || !hero) return;

  const observer = new IntersectionObserver(([entry]) => {
    header.classList.toggle('header--solid', !entry.isIntersecting);
  }, { threshold: 0, rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--header-h').trim()} 0px 0px 0px` });

  observer.observe(hero);
}

/* --- Menu Overlay --- */
function initMenuOverlay() {
  const btn = document.getElementById('menuBtn');
  const overlay = document.getElementById('menuOverlay');
  if (!btn || !overlay) return;

  const links = overlay.querySelectorAll('.menu-overlay__link');

  function open() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  function close() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  btn.addEventListener('click', () => {
    const isOpen = overlay.classList.contains('is-open');
    isOpen ? close() : open();
  });

  links.forEach(link => link.addEventListener('click', close));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });
}

/* --- Horizontal Scroll-Driven Panels with Lerp --- */
function initHorizontalPanels() {
  const wrap = document.getElementById('hpanelWrap');
  const track = document.getElementById('hpanelTrack');
  const dots = document.getElementById('hpanelDots');
  if (!wrap || !track) return;

  // Don't run on mobile (< 960px) — CSS handles vertical stack
  if (window.innerWidth < 960) return;

  const panels = track.querySelectorAll('.hpanel');
  const numPanels = panels.length;
  const dotEls = dots ? dots.querySelectorAll('.hpanel-dot') : [];

  let targetX = 0;
  let currentX = 0;
  let rafId = null;
  const LERP_FACTOR = 0.07; // Lower = smoother/slower

  function getProgress() {
    const wrapTop = wrap.offsetTop;
    const scrollY = window.scrollY || window.pageYOffset;
    const relativeScroll = scrollY - wrapTop;
    const maxScroll = wrap.offsetHeight - window.innerHeight;
    return Math.max(0, Math.min(1, relativeScroll / maxScroll));
  }

  function updateDots(progress) {
    const activeIndex = Math.round(progress * (numPanels - 1));
    dotEls.forEach((dot, i) => {
      dot.classList.toggle('hpanel-dot--active', i === activeIndex);
    });
    if (dots) {
      dots.classList.toggle('hpanel-dots--dark', activeIndex >= 1);
    }
  }

  function animate() {
    const progress = getProgress();
    targetX = progress * (numPanels - 1) * -100;

    // Lerp interpolation for smooth movement
    currentX += (targetX - currentX) * LERP_FACTOR;

    // Snap if close enough (avoid infinite tiny movements)
    if (Math.abs(currentX - targetX) < 0.01) {
      currentX = targetX;
    }

    track.style.transform = `translateX(${currentX}vw)`;
    updateDots(progress);

    rafId = requestAnimationFrame(animate);
  }

  // Start animation loop
  rafId = requestAnimationFrame(animate);

  // Cleanup on resize (switch to vertical on mobile)
  window.addEventListener('resize', () => {
    if (window.innerWidth < 960) {
      cancelAnimationFrame(rafId);
      track.style.transform = '';
    }
  });
}

/* --- FAQ Accordion --- */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq__item');

  items.forEach(item => {
    const btn = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      items.forEach(other => {
        if (other === item) return;
        const otherBtn = other.querySelector('.faq__question');
        const otherAnswer = other.querySelector('.faq__answer');
        if (otherBtn && otherAnswer) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.style.maxHeight = '0';
        }
      });

      // Toggle current
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0';
      } else {
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* --- Sticky CTA --- */
function initStickyCta() {
  const stickyCta = document.getElementById('stickyCta');
  const hero = document.getElementById('hero');
  const finalCta = document.getElementById('final-cta');
  if (!stickyCta || !hero) return;

  let heroVisible = true;
  let finalVisible = false;

  const heroObserver = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    updateVisibility();
  }, { threshold: 0 });

  const finalObserver = new IntersectionObserver(([entry]) => {
    finalVisible = entry.isIntersecting;
    updateVisibility();
  }, { threshold: 0 });

  function updateVisibility() {
    const show = !heroVisible && !finalVisible;
    stickyCta.classList.toggle('is-visible', show);
    stickyCta.setAttribute('aria-hidden', !show);
  }

  heroObserver.observe(hero);
  if (finalCta) finalObserver.observe(finalCta);
}

/* --- B2B Modal --- */
function initModal() {
  const modal = document.getElementById('b2bModal');
  const form = document.getElementById('b2bForm');
  const success = document.getElementById('modalSuccess');
  const backdrop = document.getElementById('modalBackdrop');
  const closeBtn = document.getElementById('modalClose');
  if (!modal) return;

  // All triggers
  const triggers = document.querySelectorAll('#openModal, .final-cta__b2b, [onclick*="openModal"]');

  let previousFocus = null;

  function openModal() {
    previousFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => {
      const firstInput = modal.querySelector('.modal__input');
      if (firstInput) firstInput.focus();
    }, 100);
    // Focus trap
    modal.addEventListener('keydown', trapFocus);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modal.removeEventListener('keydown', trapFocus);
    if (previousFocus) previousFocus.focus();
    // Reset form state after close animation
    setTimeout(() => {
      if (form) { form.hidden = false; form.reset(); }
      if (success) success.hidden = true;
    }, 300);
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusable = modal.querySelectorAll('input, textarea, button, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // Open triggers
  document.getElementById('openModal')?.addEventListener('click', openModal);
  document.querySelectorAll('.final-cta__b2b').forEach(el => {
    el.addEventListener('click', openModal);
  });

  // Close triggers
  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  // Form validation + submission
  const errorName = document.getElementById('errorName');
  const errorEmail = document.getElementById('errorEmail');

  function clearErrors() {
    [errorName, errorEmail].forEach(el => el?.classList.remove('is-visible'));
    form?.querySelectorAll('.modal__input').forEach(el => el.classList.remove('is-invalid'));
  }

  // Clear errors on input
  form?.querySelectorAll('.modal__input').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      const errorEl = input.nextElementSibling;
      if (errorEl?.classList.contains('modal__error')) errorEl.classList.remove('is-visible');
    });
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    const email = form.querySelector('input[name="email"]');
    const name = form.querySelector('input[name="name"]');
    let valid = true;

    if (!name.value.trim()) {
      name.classList.add('is-invalid');
      errorName?.classList.add('is-visible');
      name.focus();
      valid = false;
    }
    if (!email.value.includes('@') || !email.value.includes('.')) {
      email.classList.add('is-invalid');
      errorEmail?.classList.add('is-visible');
      if (valid) email.focus();
      valid = false;
    }
    if (!valid) return;

    // Disable submit button while sending
    const submitBtn = form.querySelector('.modal__submit');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'ОТПРАВКА...'; }

    // Send to Google Sheets
    fetch('https://script.google.com/macros/s/AKfycbzNsN8jqqTiCX7Ghn8MAQUsNQTKmqO83Uxn6JXh62N-SvcrISrR8KVo0QrqjsZTRv4q0Q/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        name: name.value.trim(),
        email: email.value.trim(),
        company: form.querySelector('input[name="company"]')?.value.trim() || '',
        message: form.querySelector('textarea[name="message"]')?.value.trim() || ''
      })
    })
    .finally(() => {
      form.hidden = true;
      success.hidden = false;
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'ОТПРАВИТЬ'; }
    });
  });
}

/* --- Scroll Progress Bar --- */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (scrollTop / docHeight * 100) + '%';
  }, { passive: true });
}

/* --- Magnetic Buttons: slight pull toward cursor --- */
function initMagneticButtons() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.03)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* --- Steps Stagger Animation: 1→2→3 fly in --- */
function initStepsStagger() {
  const steps = document.querySelectorAll('.steps__item');
  const lines = document.querySelectorAll('.steps__line');
  if (!steps.length) return;

  // Hide initially
  [...steps, ...lines].forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-40px) scale(0.8)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  });

  // On panel 2 becoming visible (we'll use a simple check in the hpanel system)
  // For now, use IntersectionObserver on the steps container
  const stepsContainer = steps[0]?.closest('.steps');
  if (!stepsContainer) return;

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      const allEls = stepsContainer.querySelectorAll('.steps__item, .steps__line');
      allEls.forEach((el, i) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateX(0) scale(1)';
        }, i * 200);
      });
      observer.unobserve(stepsContainer);
    }
  }, { threshold: 0.3 });

  observer.observe(stepsContainer);
}

/* --- Tilt Cards: 3D perspective on hover --- */
function initTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${y * -8}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* --- Hpanel Content Reveal: fade-in cards when each panel is active --- */
function initHpanelContentReveal() {
  const wrap = document.getElementById('hpanelWrap');
  const track = document.getElementById('hpanelTrack');
  if (!wrap || !track || window.innerWidth < 960) return;

  const panels = track.querySelectorAll('.hpanel');
  const revealed = new Set();

  function checkPanels() {
    const wrapTop = wrap.offsetTop;
    const scrollY = window.scrollY;
    const relativeScroll = scrollY - wrapTop;
    const maxScroll = wrap.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, relativeScroll / maxScroll));
    const numPanels = panels.length;
    const activeIndex = Math.round(progress * (numPanels - 1));

    panels.forEach((panel, i) => {
      if (i === activeIndex && !revealed.has(i)) {
        revealed.add(i);
        // Reveal cards inside this panel with stagger
        const cards = panel.querySelectorAll('.feature-card, .uc-card');
        cards.forEach((card, ci) => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(24px)';
          card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 200 + ci * 300);
        });
      }
    });
  }

  window.addEventListener('scroll', checkPanels, { passive: true });
}

/* --- Hero Video Rotation: crossfade between 2 videos --- */
function initHeroVideoRotation() {
  const videos = document.querySelectorAll('.hero__video');
  if (videos.length < 2) return;

  let currentIndex = 0;

  function switchVideo() {
    const current = videos[currentIndex];
    const nextIndex = (currentIndex + 1) % videos.length;
    const next = videos[nextIndex];

    // Start playing next video before crossfade
    next.currentTime = 0;
    next.play().catch(() => {});

    // Crossfade
    current.classList.remove('hero__video--active');
    next.classList.add('hero__video--active');

    currentIndex = nextIndex;
  }

  // When current video ends, switch to next
  videos.forEach((video, i) => {
    video.addEventListener('ended', () => {
      if (video.classList.contains('hero__video--active')) {
        switchVideo();
      }
    });
  });

  // Start first video with fallback
  videos[0].play().catch(() => {
    // Autoplay blocked — show overlay darker as fallback
    const overlay = document.querySelector('.hero__overlay');
    if (overlay) overlay.style.background = 'rgba(9,12,15,0.9)';
  });
}

/* --- Glow Cards: radial gradient follows cursor --- */
function initGlowCards() {
  document.querySelectorAll('.glow-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--glow-x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--glow-y', (e.clientY - rect.top) + 'px');
    });
  });
}

/* --- Chat Bubble Sequence: typewriter effect, one by one --- */
function initChatBubbleSequence() {
  const chatBody = document.querySelector('.chat-window__body');
  const bubbles = document.querySelectorAll('.chat-bubble');
  const dividers = document.querySelectorAll('.chat-bubble__divider');
  if (!bubbles.length || !chatBody) return;

  // Store original texts, hide everything
  const originals = [];
  bubbles.forEach(b => {
    const p = b.querySelector('p');
    originals.push(p ? p.textContent : '');
    if (p) p.textContent = '';
    b.style.opacity = '0';
    b.style.transform = 'translateY(16px)';
    b.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  dividers.forEach(d => { d.style.opacity = '0'; d.style.transition = 'opacity 0.3s ease'; });

  const aiSection = document.getElementById('ai');
  if (!aiSection) return;

  function typeText(el, text, speed) {
    return new Promise(resolve => {
      let i = 0;
      function tick() {
        if (i <= text.length) {
          el.textContent = text.slice(0, i);
          i++;
          // Scroll chat body to bottom
          chatBody.scrollTop = chatBody.scrollHeight;
          setTimeout(tick, speed);
        } else {
          resolve();
        }
      }
      tick();
    });
  }

  async function playSequence() {
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      const p = b.querySelector('p');

      // Check if it's a divider before this bubble
      if (i > 0) {
        const prev = bubbles[i-1];
        const nextSib = prev.nextElementSibling;
        if (nextSib && nextSib.classList.contains('chat-bubble__divider')) {
          await new Promise(r => setTimeout(r, 800));
          nextSib.style.opacity = '1';
          await new Promise(r => setTimeout(r, 400));
        }
      }

      // Show bubble
      b.style.opacity = '1';
      b.style.transform = 'translateY(0)';
      await new Promise(r => setTimeout(r, 300));

      // Typewriter
      if (p && originals[i]) {
        await typeText(p, originals[i], 25);
      }

      // Pause between messages
      await new Promise(r => setTimeout(r, 800));
    }
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      playSequence();
      observer.unobserve(aiSection);
    }
  }, { threshold: 0.25 });

  observer.observe(aiSection);
}

/* --- Counter Animation: animate numbers from 0 --- */
function initCounterAnimation() {
  const amounts = document.querySelectorAll('.price-card__amount');
  if (!amounts.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const text = el.textContent.trim();
      // Extract number: "450 ₽" → 450, "9 600 ₽" → 9600, "0 ₽" → 0
      const numStr = text.replace(/[^\d]/g, '');
      const target = parseInt(numStr);
      if (!target || target === 0) { observer.unobserve(el); return; }

      const suffix = text.replace(/[\d\s]/g, '').trim(); // "₽"
      const hasSpace = text.includes(' ');
      const duration = 1200;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = Math.round(target * eased);
        // Format with spaces for thousands
        const formatted = current.toLocaleString('ru-RU');
        el.textContent = formatted + ' ' + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  amounts.forEach(el => observer.observe(el));
}
