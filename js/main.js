const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const navLinks = document.querySelectorAll('.nav a');
const revealItems = document.querySelectorAll('[data-reveal]');
const modal = document.getElementById('certificate-modal');
const openModalButtons = document.querySelectorAll('[data-modal-open]');
const closeModalButtons = document.querySelectorAll('[data-modal-close]');
const splitTargets = document.querySelectorAll('.split-target');
const spotlightCards = document.querySelectorAll('.spotlight-card');
const staggerGroups = document.querySelectorAll('.stagger');
const heroSection = document.getElementById('hero');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastFocusedElement = null;

const splitText = () => {
  if (prefersReducedMotion) return;

  splitTargets.forEach(target => {
    if (target.dataset.splitReady === 'true') return;

    const text = target.textContent.trim();
    if (!text) return;

    target.setAttribute('aria-label', text);
    target.dataset.splitReady = 'true';

    const words = text.split(/(\s+)/);
    target.textContent = '';

    let wordIndex = 0;

    words.forEach(part => {
      if (/^\s+$/.test(part)) {
        target.appendChild(document.createTextNode(part));
        return;
      }

      const span = document.createElement('span');
      span.className = 'split-word';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--word-delay', `${wordIndex * 42}ms`);
      span.textContent = part;
      target.appendChild(span);
      wordIndex += 1;
    });
  });
};

splitText();

staggerGroups.forEach(group => {
  [...group.children].forEach((item, index) => {
    item.style.setProperty('--stagger-index', index);
  });
});

if (menuToggle && nav) {
  const closeMenu = () => {
    body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = body.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (event) => {
    if (!body.classList.contains('menu-open')) return;
    const target = event.target;
    if (target instanceof Element && !target.closest('.nav') && !target.closest('.menu-toggle')) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && body.classList.contains('menu-open')) {
      closeMenu();
    }
  });
}

if (revealItems.length) {
  if (prefersReducedMotion) {
    revealItems.forEach(item => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach(item => revealObserver.observe(item));
  }
}

if (!prefersReducedMotion && spotlightCards.length) {
  spotlightCards.forEach(card => {
    card.addEventListener('pointerenter', () => {
      card.style.setProperty('--spotlight-x', '0px');
      card.style.setProperty('--spotlight-y', '0px');
    });

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 24;
      const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 24;
      card.style.setProperty('--spotlight-x', `${offsetX}px`);
      card.style.setProperty('--spotlight-y', `${offsetY}px`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--spotlight-x');
      card.style.removeProperty('--spotlight-y');
    });
  });
}

if (heroSection && !prefersReducedMotion) {
  let rafId = null;

  const onHeroPointerMove = (event) => {
    const rect = heroSection.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rayX = Math.min(88, Math.max(64, 64 + x * 24));
    const rayY = Math.min(42, Math.max(18, 18 + y * 24));

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      heroSection.style.setProperty('--ray-x', `${rayX}%`);
      heroSection.style.setProperty('--ray-y', `${rayY}%`);
    });
  };

  heroSection.addEventListener('pointermove', onHeroPointerMove);
}

const trapFocus = (event) => {
  if (!modal || !modal.classList.contains('is-open') || event.key !== 'Tab') return;
  const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

const closeModal = () => {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  body.classList.remove('modal-open');
  document.removeEventListener('keydown', trapFocus);
  if (lastFocusedElement) lastFocusedElement.focus();
};

const openModal = () => {
  if (!modal) return;
  lastFocusedElement = document.activeElement;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  body.classList.add('modal-open');
  const closeButton = modal.querySelector('.modal__close');
  if (closeButton) closeButton.focus();
  document.addEventListener('keydown', trapFocus);
};

openModalButtons.forEach(button => {
  button.addEventListener('click', openModal);
});

closeModalButtons.forEach(button => {
  button.addEventListener('click', closeModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal?.classList.contains('is-open')) {
    closeModal();
  }
});
