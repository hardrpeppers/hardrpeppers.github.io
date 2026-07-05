// Ambient motion, smooth section highlighting, reveal-on-scroll behavior, and animated statistics for the premium landing experience.
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js-enabled');

  const GATE_KEY = 'hrp-entry-gate-v1';
  const GATE_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
  const gate = document.getElementById('entry-gate');
  const gateForm = document.getElementById('entry-gate-form');
  const gateEnter = document.getElementById('entry-gate-enter');
  const gateChecks = Array.from(document.querySelectorAll('.entry-gate__checkbox'));
  const siteShell = document.getElementById('site-shell');

  const updateGateEnterState = () => {
    if (!gateEnter) {
      return;
    }
    const allChecked = gateChecks.length > 0 && gateChecks.every((check) => check.checked);
    gateEnter.disabled = !allChecked;
  };

  const closeGate = () => {
    if (!gate) {
      return;
    }

    gate.classList.add('is-hidden');
    gate.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('entry-gate-active');
    if (siteShell) {
      siteShell.removeAttribute('inert');
    }
  };

  if (gate) {
    document.body.classList.add('entry-gate-active');
    if (siteShell) {
      siteShell.setAttribute('inert', '');
    }

    updateGateEnterState();
    gateChecks.forEach((check) => check.addEventListener('change', updateGateEnterState));

    if (gateForm) {
      gateForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!gateChecks.every((check) => check.checked)) {
          updateGateEnterState();
          return;
        }

        const acceptedAt = Date.now();
        try {
          localStorage.setItem(GATE_KEY, JSON.stringify({
            acceptedAt,
            expiresAt: acceptedAt + GATE_DURATION_MS,
          }));
        } catch (_) {
          // Continue even if storage is unavailable.
        }

        closeGate();
      });
    }
  }

  const hero = document.querySelector('.hero__content');
  const glow = document.querySelector('.background-glow');
  const nav = document.querySelector('.site-nav');
  const navToggle = nav ? nav.querySelector('.site-nav__toggle') : null;
  const navLinks = Array.from(document.querySelectorAll('.site-nav__links a'));
  const counters = Array.from(document.querySelectorAll('.stats-card__value'));
  const searchInput = document.getElementById('product-search');
  const filterButtons = Array.from(document.querySelectorAll('.catalog-filter'));
  const catalog = document.getElementById('product-catalog');

  const closeNavMenu = () => {
    if (!nav || !navToggle) {
      return;
    }
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  if (nav && navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeNavMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeNavMenu();
      }
    });
  }

  const updatePointerGlow = (event) => {
    if (!hero || !glow) {
      return;
    }

    const x = `${(event.clientX / window.innerWidth) * 100}%`;
    const y = `${(event.clientY / window.innerHeight) * 100}%`;

    hero.style.setProperty('--pointer-x', x);
    hero.style.setProperty('--pointer-y', y);
    glow.style.setProperty('--pointer-x', x);
    glow.style.setProperty('--pointer-y', y);
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (window.innerWidth <= 768) {
        closeNavMenu();
      }

      const targetId = link.getAttribute('href');
      const target = targetId ? document.querySelector(targetId) : null;

      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const sections = document.querySelectorAll('main section[id], header[id], footer[id], .feature-section[id]');

  const updateActiveLink = () => {
    const scrollPosition = window.scrollY + 120;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        const targetId = `#${section.id}`;
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === targetId);
        });
      }
    });
  };

  const animateCounters = () => {
    counters.forEach((counter) => {
      const targetValue = counter.dataset.counter;
      const prefix = counter.dataset.prefix || '';
      const suffix = counter.dataset.suffix || '';
      const duration = 1200;
      const startTime = performance.now();
      const targetNumber = Number(targetValue);

      const step = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(easedProgress * targetNumber);
        counter.textContent = `${prefix}${value}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = `${prefix}${targetValue}${suffix}`;
        }
      };

      requestAnimationFrame(step);
    });
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

  if (catalog) {
    // Add Product template: duplicate one object and update its values.
    const products = [
      {
        name: 'R3ta 10mg',
        price: '$38',
        category: 'Research Materials',
        image: 'assets/images/IMG_3099.JPG',
        coa: '/coas/r3ta.pdf',
        description: 'Precision-prepared research material designed for laboratory analysis.',
        featured: true,
        orderMessage: "Hello! I'd like to order R3ta 10mg.",
      },
      {
        name: 'Antifreeze',
        price: '$16',
        category: 'Support Products',
        image: 'assets/images/IMG_3107.jpeg',
        coa: '/coas/antifreeze.pdf',
        description: 'Laboratory support fluid intended for controlled research setups and technical workflows.',
        featured: false,
        orderMessage: "Hello! I'd like to order Antifreeze.",
      },
      {
        name: 'Complete Starter Kit',
        price: '$65',
        category: 'Starter Kits',
        image: 'assets/images/IMG_3127.jpeg',
        coa: '/coas/starter-kit.pdf',
        description: 'A complete starter package with professional presentation and documentation-ready organization.',
        featured: false,
        orderMessage: "Hello! I'd like to order the Complete Starter Kit.",
      },
    ];

    const smsPhone = '+15551234567';
    const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const categoryToFilter = (category) => slugify(category);
    const toCurrency = (price) => {
      if (!price.startsWith('$')) {
        return price;
      }

      const numeric = Number(price.replace('$', ''));
      if (Number.isNaN(numeric)) {
        return price;
      }

      return `$${numeric.toFixed(2)}`;
    };

    const createProductCard = (product) => {
      const card = document.createElement('article');
      card.className = 'product-card product-card--catalog product-card--store reveal';
      card.dataset.category = categoryToFilter(product.category);
      card.dataset.productName = product.name;
      card.dataset.productKeywords = `${product.name} ${product.category} ${product.description}`;

      const fallback = `coa-coming-soon.html?product=${encodeURIComponent(product.name)}`;
      const smsBody = encodeURIComponent(product.orderMessage);

      card.innerHTML = `
        <div class="product-card__image product-card__image--catalog">
          ${product.featured ? '<span class="product-card__featured">Featured Product</span>' : ''}
          <span class="product-card__ribbon">Research Use Only</span>
          <img src="${product.image}" alt="${product.name} product image" loading="lazy">
        </div>
        <div class="product-card__body">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <p class="product-card__price">${toCurrency(product.price)}</p>
          <p class="product-card__disclaimer">For laboratory and analytical research use only. Not for human consumption.</p>
          <div class="product-card__actions">
            <a href="${product.coa}" class="product-card__button product-card__button--coa" data-coa-fallback="${fallback}">View COA</a>
            <a href="sms:${smsPhone}?body=${smsBody}" class="product-card__button product-card__button--order">Order Now</a>
          </div>
        </div>
      `;

      return card;
    };

    products.forEach((product) => {
      const card = createProductCard(product);
      catalog.appendChild(card);
      revealObserver.observe(card);
    });

    const productCards = Array.from(catalog.querySelectorAll('.product-card--store'));
    let activeFilter = 'all';

    const applyProductFilters = () => {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

      productCards.forEach((card) => {
        const category = (card.dataset.category || '').toLowerCase();
        const productName = (card.dataset.productName || '').toLowerCase();
        const keywordText = (card.dataset.productKeywords || '').toLowerCase();
        const matchesFilter = activeFilter === 'all' || category === activeFilter;
        const matchesSearch = !query || productName.includes(query) || keywordText.includes(query);
        card.classList.toggle('is-filtered-out', !(matchesFilter && matchesSearch));
      });
    };

    if (searchInput) {
      searchInput.addEventListener('input', applyProductFilters);
    }

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.filter || 'all';
        filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
        applyProductFilters();
      });
    });

    applyProductFilters();
  }

  document.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest('.product-card__button--coa');
    if (!button) {
      return;
    }

    const coaUrl = button.getAttribute('href');
    const fallback = button.getAttribute('data-coa-fallback') || 'coa-coming-soon.html';
    if (!coaUrl) {
      return;
    }

    event.preventDefault();

    try {
      const response = await fetch(coaUrl, { method: 'HEAD' });
      if (response.ok) {
        window.location.href = coaUrl;
        return;
      }
    } catch (_) {
      // Continue to fallback when file availability cannot be confirmed.
    }

    window.location.href = fallback;
  });

  window.addEventListener('pointermove', updatePointerGlow);
  if (hero && glow) {
    window.addEventListener('pointerleave', () => {
      hero.style.removeProperty('--pointer-x');
      hero.style.removeProperty('--pointer-y');
      glow.style.removeProperty('--pointer-x');
      glow.style.removeProperty('--pointer-y');
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }
});
