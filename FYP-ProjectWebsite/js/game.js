/* EverMotion – Game Landing Page JS */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     NAV: add .scrolled class for backdrop-blur once user scrolls
  ------------------------------------------------------------------ */
  const nav = document.getElementById('game-nav');

  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ------------------------------------------------------------------
     SCREENSHOT CAROUSEL
  ------------------------------------------------------------------ */
  const track      = document.getElementById('carousel-track');
  const prevBtn    = document.getElementById('carousel-prev');
  const nextBtn    = document.getElementById('carousel-next');
  const dotsEl     = document.getElementById('carousel-dots');
  const dots       = dotsEl ? Array.from(dotsEl.querySelectorAll('.carousel-dot')) : [];
  const totalSlides = dots.length;

  let current     = 0;
  let autoTimer   = null;

  function goTo(index) {
    current = ((index % totalSlides) + totalSlides) % totalSlides;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(function () { goTo(current + 1); }, 4500);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      goTo(current - 1);
      startAuto();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      goTo(current + 1);
      startAuto();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goTo(parseInt(dot.dataset.index, 10));
      startAuto();
    });
  });

  /* Pause auto-scroll on hover */
  var carouselEl = document.getElementById('screenshot-carousel');
  if (carouselEl) {
    carouselEl.addEventListener('mouseenter', stopAuto);
    carouselEl.addEventListener('mouseleave', startAuto);
  }

  /* Keyboard arrow support when carousel is in view */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  /* Touch / swipe support */
  var touchStartX = null;

  if (track) {
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 50) {
        goTo(delta < 0 ? current + 1 : current - 1);
        startAuto();
      }
      touchStartX = null;
    }, { passive: true });
  }

  /* Kick off auto-scroll */
  startAuto();

  /* ------------------------------------------------------------------
     SMOOTH SCROLL for same-page anchor links (older browser fallback)
  ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();

/* ------------------------------------------------------------------
   FEEDBACK FEED – fetch live responses from Google Sheets CSV
------------------------------------------------------------------ */
(function () {
  'use strict';

  var SHEET_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTLW19kXyCTEr37YRoPBRae_L1bLmLeuFKqVDVJrWxpPUHTvOu-rurc2YX9UyJg0-2L4hNTEwyGWi4B/pub?gid=62154183&single=true&output=csv';

  /* Proper CSV line parser — handles quoted fields containing commas */
  function parseCSVLine(line) {
    var fields = [];
    var current = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current);
    return fields;
  }

  function formatDate(raw) {
    try {
      var d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return raw;
    }
  }

  function buildStars(rating) {
    var n = parseInt(rating, 10);
    if (isNaN(n) || n < 1) n = 0;
    if (n > 5) n = 5;
    var filled = '★'.repeat(n);
    var empty  = '☆'.repeat(5 - n);
    var span = document.createElement('span');
    span.style.color = '#f5c518';
    span.textContent = filled + empty;
    return span;
  }

  function buildCard(row) {
    var name      = (row[1] || '').trim();
    var rating    = (row[2] || '').trim();
    var message   = (row[3] || '').trim();
    var games     = (row[4] || '').trim();
    var timestamp = (row[0] || '').trim();

    var card = document.createElement('div');
    card.className = 'forum-card';

    /* Avatar */
    var avatar = document.createElement('div');
    avatar.className = 'forum-avatar';
    avatar.textContent = name ? name.charAt(0).toUpperCase() : '?';
    card.appendChild(avatar);

    /* Body */
    var body = document.createElement('div');
    body.className = 'forum-body';

    var meta = document.createElement('div');
    meta.className = 'forum-meta';

    var username = document.createElement('span');
    username.className = 'forum-username';
    username.textContent = name || 'Anonymous';
    meta.appendChild(username);

    meta.appendChild(buildStars(rating));

    var date = document.createElement('span');
    date.className = 'forum-date';
    date.textContent = formatDate(timestamp);
    meta.appendChild(date);

    body.appendChild(meta);

    /* Game pills */
    if (games) {
      var pillsWrap = document.createElement('div');
      pillsWrap.style.margin = '0.35rem 0';
      var gameList = games.split(/[;,]/).map(function (g) { return g.trim(); }).filter(Boolean);
      gameList.forEach(function (g) {
        var pill = document.createElement('span');
        pill.className = 'game-pill';
        pill.textContent = g;
        pillsWrap.appendChild(pill);
      });
      body.appendChild(pillsWrap);
    }

    /* Message */
    var msg = document.createElement('p');
    msg.className = 'forum-message';
    msg.textContent = message;
    body.appendChild(msg);

    card.appendChild(body);
    return card;
  }

  function renderError(feed) {
    feed.innerHTML = '<p class="forum-empty">Unable to load feedback. Please try again later.</p>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var feed = document.getElementById('feedback-feed');
    if (!feed) return;

    try {
      fetch(SHEET_CSV)
        .then(function (res) {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.text();
        })
        .then(function (csv) {
          try {
            var lines = csv.trim().split('\n');
            /* Skip header row, reverse so newest first */
            var dataRows = lines.slice(1).reverse();

            feed.innerHTML = '';

            if (dataRows.length === 0 || (dataRows.length === 1 && dataRows[0].trim() === '')) {
              feed.innerHTML = '<p class="forum-empty">No feedback submitted yet. Be the first!</p>';
              return;
            }

            dataRows.forEach(function (line) {
              if (!line.trim()) return;
              var row = parseCSVLine(line);
              feed.appendChild(buildCard(row));
            });
          } catch (parseErr) {
            renderError(feed);
          }
        })
        .catch(function () {
          renderError(feed);
        });
    } catch (e) {
      renderError(feed);
    }
  });

})();

/* ------------------------------------------------------------------
   COMMUNITY TABS
------------------------------------------------------------------ */
(function () {
  'use strict';

  var tabBtns   = document.querySelectorAll('.community-tab');
  var tabPanels = document.querySelectorAll('.community-panel');

  if (!tabBtns.length) return;

  function activateTab(targetTab) {
    tabBtns.forEach(function (btn) {
      var isActive = btn.dataset.tab === targetTab;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    tabPanels.forEach(function (panel) {
      var isActive = panel.id === 'tab-' + targetTab;
      panel.classList.toggle('active', isActive);
      if (isActive) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activateTab(btn.dataset.tab);
    });
  });

})();
