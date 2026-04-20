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

// ---------- Navbar: scroll state + active link ----------
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links li a');
const sections = document.querySelectorAll('section[id]');

function updateNav() {
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

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinksEl.classList.toggle('open');
});

// Close mobile nav on link click
navLinksEl.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
  });
});

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
    const offset = navbar.offsetHeight + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
