/* ============================================================
   EverMotion Project Website – JS
   ============================================================ */

// ---------- Theme toggle ----------
const THEME_KEY = 'evermotion-theme';
const themeToggle = document.getElementById('themeToggle');
const themeToggleLabel = themeToggle?.querySelector('.theme-toggle-label');
const themeToggleIcon = themeToggle?.querySelector('.theme-toggle-icon');

function applyTheme(theme) {
  const activeTheme = theme === 'light' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', activeTheme);

  if (themeToggle && themeToggleLabel && themeToggleIcon) {
    const nextTheme = activeTheme === 'light' ? 'dark' : 'light';
    themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
    themeToggleLabel.textContent = activeTheme === 'light' ? 'Dark' : 'Light';
    themeToggleIcon.innerHTML = activeTheme === 'light' ? '&#9790;' : '&#9788;';
  }
}

const savedTheme = localStorage.getItem(THEME_KEY);
applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  });
}

window.addEventListener('storage', event => {
  if (event.key === THEME_KEY) {
    applyTheme(event.newValue);
  }
});

// ---------- Navbar: scroll state + active link ----------
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link, .mega-menu a');
const megaTriggers = document.querySelectorAll('.mega-trigger');
const sections = document.querySelectorAll('section[id]');

function updateNav() {
  if (!navbar) return;

  // Scrolled style
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Active link highlighting
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 90;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });

  megaTriggers.forEach(trigger => trigger.classList.remove('active'));

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
      link.closest('.mega-item')?.querySelector('.mega-trigger')?.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');
const megaItems = document.querySelectorAll('.mega-item');
const mobileNavQuery = window.matchMedia('(max-width: 680px)');

function setMegaOpen(item, isOpen) {
  const trigger = item.querySelector('.mega-trigger');
  item.classList.toggle('open', isOpen);
  trigger?.setAttribute('aria-expanded', String(isOpen));
}

megaItems.forEach(item => {
  const trigger = item.querySelector('.mega-trigger');
  if (!trigger) return;

  trigger.addEventListener('click', () => {
    if (!mobileNavQuery.matches) return;
    setMegaOpen(item, !item.classList.contains('open'));
  });

  item.addEventListener('mouseenter', () => {
    if (!mobileNavQuery.matches) setMegaOpen(item, true);
  });

  item.addEventListener('mouseleave', () => {
    if (!mobileNavQuery.matches) setMegaOpen(item, false);
  });

  item.addEventListener('focusin', () => {
    if (!mobileNavQuery.matches) setMegaOpen(item, true);
  });

  item.addEventListener('focusout', event => {
    if (!mobileNavQuery.matches && !item.contains(event.relatedTarget)) {
      setMegaOpen(item, false);
    }
  });
});

mobileNavQuery.addEventListener('change', () => {
  navLinksEl?.classList.remove('open');
  megaItems.forEach(item => setMegaOpen(item, false));
});

if (navToggle && navLinksEl) {
  navToggle.addEventListener('click', () => {
    navLinksEl.classList.toggle('open');
    if (!navLinksEl.classList.contains('open')) {
      megaItems.forEach(item => setMegaOpen(item, false));
    }
  });

  // Close mobile nav on link click
  navLinksEl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
      megaItems.forEach(item => setMegaOpen(item, false));
    });
  });
}

// ---------- Intersection Observer: fade-in on scroll ----------
const fadeTargets = document.querySelectorAll(
  '.about-card, .feature-card, .game-card, .tech-card, ' +
  '.team-card, .impact-block, .roadmap-list li, ' +
  '.user-card, .pill, .media-placeholder, .contact-card'
);

fadeTargets.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

fadeTargets.forEach(el => observer.observe(el));

// ---------- Stagger children within grids ----------
function staggerChildren(parentSelector, delay = 80) {
  document.querySelectorAll(parentSelector).forEach(parent => {
    const children = parent.children;
    Array.from(children).forEach((child, i) => {
      child.style.transitionDelay = (i * delay) + 'ms';
    });
  });
}

staggerChildren('.about-grid');
staggerChildren('.features-grid');
staggerChildren('.games-grid');
staggerChildren('.tech-grid');
staggerChildren('.team-cards');
staggerChildren('.user-cards', 60);
staggerChildren('.impact-pills', 50);

// ---------- Animated progress bar (trigger on scroll) ----------
const stageBar = document.querySelector('.stage-bar');
if (stageBar) {
  stageBar.style.width = '0';

  const barObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        stageBar.style.transition = 'width 1.4s cubic-bezier(0.4,0,0.2,1)';
        stageBar.style.width = stageBar.style.getPropertyValue('--pct') || '20%';
        // Read from CSS var
        const pct = getComputedStyle(stageBar).getPropertyValue('--pct').trim();
        stageBar.style.width = pct;
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  barObserver.observe(stageBar);
}

// ---------- Smooth scroll offset for fixed navbar ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = (navbar?.offsetHeight || 0) + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ---------- Games Carousel ----------
function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const dotsContainer = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const outer = document.getElementById('carouselOuter');

  if (!track) return null;

  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  const total = slides.length;
  if (total === 0) return null;

  let current = 0;
  let timer = null;
  let clickCooldown = false;
  const INTERVAL = 4500;

  function goTo(idx) {
    current = ((idx % total) + total) % total;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }
  }

  function next()       { goTo(current + 1); }
  function prev()       { goTo(current - 1); }
  function startTimer() {
    if (!timer) timer = setInterval(next, INTERVAL);
  }
  function stopTimer()  { clearInterval(timer); timer = null; }
  function resetTimer() { stopTimer(); startTimer(); }

  // Prevents a second user interaction from firing mid-transition (0.6s CSS transition).
  // Auto-play bypasses this â€” only click/swipe/dot interactions are gated.
  function onUserNav(fn) {
    if (clickCooldown) return;
    clickCooldown = true;
    fn();
    setTimeout(() => { clickCooldown = false; }, 650);
  }

  // Build dot indicators
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to game ' + (i + 1));
    dot.setAttribute('role', 'tab');
    dot.addEventListener('click', () => onUserNav(() => { goTo(i); resetTimer(); }));
    if (dotsContainer) dotsContainer.appendChild(dot);
  });

  if (prevBtn) prevBtn.addEventListener('click', () => onUserNav(() => { prev(); resetTimer(); }));
  if (nextBtn) nextBtn.addEventListener('click', () => onUserNav(() => { next(); resetTimer(); }));

  if (outer) {
    outer.addEventListener('mouseenter', stopTimer);
    // resetTimer (not startTimer) â€” prevents a second interval spawning when the
    // user clicks Next while hovering, then moves the mouse away.
    outer.addEventListener('mouseleave', resetTimer);
  }

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { onUserNav(() => { dx < 0 ? next() : prev(); resetTimer(); }); }
  }, { passive: true });

  startTimer();

  // Public API (used by unit tests)
  return {
    goTo,
    next,
    prev,
    getCurrent: () => current,
    getTotal:   () => total,
    stop:  stopTimer,
    start: startTimer,
  };
}

window._carousel = initCarousel();

// Session toggles //
document.querySelectorAll('.session-toggle').forEach(button => {
  button.addEventListener('click',()=>{
    const targetId = button.getAttribute('data-target');
    const targetContent = document.getElementById(targetId);
    if (targetContent){
      targetContent.classList.toggle('collapsed');
      button.classList.toggle('collapsed');
    }
  });
});
