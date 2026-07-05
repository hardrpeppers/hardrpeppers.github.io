// Ambient motion, smooth section highlighting, reveal-on-scroll behavior, and animated statistics for the premium landing experience.
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js-enabled');

  const GATE_KEY = 'hrp-entry-gate-v2';
  const GATE_DURATION_MS = 24 * 60 * 60 * 1000;
  const siteShell = document.getElementById('site-shell');

  const hasValidGateAcceptance = () => {
    try {
      const raw = localStorage.getItem(GATE_KEY);
      if (!raw) {
        return false;
      }
      const parsed = JSON.parse(raw);
      return Boolean(parsed && typeof parsed.expiresAt === 'number' && Date.now() < parsed.expiresAt);
    } catch (_) {
      return false;
    }
  };

  const ensureGate = () => {
    let gateNode = document.getElementById('entry-gate');
    if (gateNode) {
      return gateNode;
    }

    gateNode = document.createElement('section');
    gateNode.className = 'entry-gate';
    gateNode.id = 'entry-gate';
    gateNode.setAttribute('aria-labelledby', 'entry-gate-title');
    gateNode.innerHTML = `
      <div class="entry-gate__backdrop" aria-hidden="true"></div>
      <div class="entry-gate__card" role="dialog" aria-modal="true" aria-describedby="entry-gate-description">
        <img src="assets/images/logo2.PNG" class="entry-gate__logo" alt="HardRPeppers logo">
        <h1 class="entry-gate__title" id="entry-gate-title">Research. Transparency.</h1>
        <p class="entry-gate__welcome">Welcome to HardRPeppers.</p>
        <p class="entry-gate__description" id="entry-gate-description">This website contains research materials and supporting documentation intended for laboratory and analytical research purposes.</p>
        <form class="entry-gate__form" id="entry-gate-form">
          <div class="entry-gate__checks">
            <label class="entry-gate__check" for="gate-check-1">
              <input type="checkbox" id="gate-check-1" class="entry-gate__checkbox" required>
              <span>I am at least 21 years of age.</span>
            </label>
            <label class="entry-gate__check" for="gate-check-2">
              <input type="checkbox" id="gate-check-2" class="entry-gate__checkbox" required>
              <span>I understand these materials are intended for laboratory and analytical research purposes only.</span>
            </label>
            <label class="entry-gate__check" for="gate-check-3">
              <input type="checkbox" id="gate-check-3" class="entry-gate__checkbox" required>
              <span>I understand these products are not intended for human consumption.</span>
            </label>
            <label class="entry-gate__check" for="gate-check-4">
              <input type="checkbox" id="gate-check-4" class="entry-gate__checkbox" required>
              <span>I understand it is my responsibility to comply with all applicable laws and regulations in my jurisdiction.</span>
            </label>
          </div>
          <div class="entry-gate__actions">
            <button type="submit" class="button button--primary entry-gate__enter" id="entry-gate-enter" disabled>Enter Research Portal</button>
            <a href="https://www.google.com" class="button button--secondary entry-gate__leave">Leave Website</a>
          </div>
        </form>
      </div>
    `;

    document.body.prepend(gateNode);
    return gateNode;
  };

  const setPageInert = (active) => {
    if (siteShell) {
      if (active) {
        siteShell.setAttribute('inert', '');
      } else {
        siteShell.removeAttribute('inert');
      }
      return;
    }

    Array.from(document.body.children).forEach((child) => {
      if (child.id === 'entry-gate') {
        return;
      }

      if (active) {
        child.setAttribute('inert', '');
      } else {
        child.removeAttribute('inert');
      }
    });
  };

  const closeGate = (gateNode) => {
    if (!gateNode) {
      return;
    }

    gateNode.classList.add('is-hidden');
    gateNode.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('entry-gate-active');
    document.body.classList.remove('entry-gate-active');
    setPageInert(false);
  };

  const initializeGate = () => {
    const shouldRequireGate = document.documentElement.classList.contains('entry-gate-active') || !hasValidGateAcceptance();
    const gateNode = ensureGate();
    const gateForm = document.getElementById('entry-gate-form');
    const gateEnter = document.getElementById('entry-gate-enter');
    const gateChecks = Array.from(document.querySelectorAll('.entry-gate__checkbox'));

    const updateGateEnterState = () => {
      if (!gateEnter) {
        return;
      }
      const allChecked = gateChecks.length > 0 && gateChecks.every((check) => check.checked);
      gateEnter.disabled = !allChecked;
    };

    if (!shouldRequireGate) {
      closeGate(gateNode);
      document.documentElement.classList.remove('entry-gate-pending');
      return;
    }

    gateNode.classList.remove('is-hidden');
    gateNode.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('entry-gate-active');
    document.body.classList.add('entry-gate-active');
    setPageInert(true);

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

        closeGate(gateNode);
      }, { once: true });
    }

    document.documentElement.classList.remove('entry-gate-pending');
  };

  initializeGate();

  const hero = document.querySelector('.hero__content');
  const glow = document.querySelector('.background-glow');
  const nav = document.querySelector('.site-nav');
  const navToggle = nav ? nav.querySelector('.site-nav__toggle') : null;
  const navLinks = Array.from(document.querySelectorAll('.site-nav__links a'));
  const counters = Array.from(document.querySelectorAll('.stats-card__value'));
  const productCatalog = document.getElementById('product-catalog');
  const coaGrid = document.getElementById('coa-grid');
  const coaModal = document.getElementById('pdf-modal');
  const coaModalTitle = document.getElementById('modal-title');
  const coaModalFrame = document.getElementById('modal-frame');
  const siteFooter = document.querySelector('footer.footer');
  const ORDER_PHONE = '16982013793';

  const normalizePrice = (value) => {
    const text = String(value || '').trim();
    if (!text) {
      return '';
    }
    return text.replace(/\.00$/, '');
  };

  const buildOrderMessage = (productName, productPrice) => {
    if (productName && productPrice) {
      return `Hi! I'd like to order:\n• ${productName} (${productPrice})\n\nName:\nShipping State:`;
    }
    return `Hi! I'd like to place an order.\n\nName:\nShipping State:`;
  };

  const buildSmsHref = (productName, productPrice) => {
    const encodedMessage = encodeURIComponent(buildOrderMessage(productName, productPrice));
    return `sms:+${ORDER_PHONE}?&body=${encodedMessage}`;
  };

  const resolveOrderDetails = (link) => {
    let productName = (link.dataset.orderProduct || '').trim();
    let productPrice = normalizePrice(link.dataset.orderPrice || '');

    if (!(productName && productPrice)) {
      const card = link.closest('.product-card');
      if (card) {
        const nameEl = card.querySelector('h3');
        const priceEl = card.querySelector('.product-card__price, .premium-product-card__price');
        productName = (nameEl ? nameEl.textContent : '').trim();
        productPrice = normalizePrice((priceEl ? priceEl.textContent : '').trim());
      }
    }

    return { productName, productPrice };
  };

  const wireTextOrderLinks = () => {
    const orderLinks = Array.from(document.querySelectorAll('a')).filter((link) => link.textContent && link.textContent.trim() === 'Text to Order');

    orderLinks.forEach((link) => {
      const { productName, productPrice } = resolveOrderDetails(link);
      link.classList.add('js-text-order', 'text-order-link');
      link.setAttribute('href', buildSmsHref(productName, productPrice));

      if (productName && productPrice) {
        link.setAttribute('aria-label', `Text to order ${productName} (${productPrice})`);
      } else {
        link.setAttribute('aria-label', 'Text to Order');
      }
    });
  };

  const products = [
    {
      name: 'Reta Single',
      price: '$38.00',
      category: 'Research Materials',
      image: 'assets/images/reta1.PNG',
      description: 'Single vial presentation with premium black cap styling and laboratory documentation support.',
      detailsUrl: 'product-a.html',
      coaUrl: 'coas.html',
      orderUrl: 'contact.html',
      featured: true,
    },
    {
      name: 'Reta 3 Pack',
      price: '$105.00',
      category: 'Research Materials',
      image: 'assets/images/reta3.PNG',
      description: 'Three-vial Reta pack configured for extended research workflows and consistent batch presentation.',
      detailsUrl: 'product-b.html',
      coaUrl: 'coas.html',
      orderUrl: 'contact.html',
    },
    {
      name: 'Antifreeze Single',
      price: '$16.00',
      category: 'Research Materials',
      image: 'assets/images/Anti1.PNG',
      description: 'Single antifreeze vial with premium blue cap styling and clean technical presentation.',
      detailsUrl: 'product-c.html',
      coaUrl: 'coas.html',
      orderUrl: 'contact.html',
    },
    {
      name: 'Starter Kit',
      price: '$65.00',
      category: 'Starter Kits',
      image: 'assets/images/Kit.PNG',
      description: 'Starter package with Reta, Antifreeze, and core support supplies for structured lab setup.',
      detailsUrl: 'product-e.html',
      coaUrl: 'coas.html',
      orderUrl: 'contact.html',
    },
  ];

  const coaRecords = [
    {
      title: 'Research Compound A',
      batch: 'B1042',
      date: '2026-06-10',
      status: 'Verified',
      pdfUrl: 'assets/pdfs/coa-sample.pdf',
    },
    {
      title: 'Research Compound B',
      batch: 'B1048',
      date: '2026-05-22',
      status: 'Verified',
      pdfUrl: 'assets/pdfs/coa-sample.pdf',
    },
    {
      title: 'Research Compound C',
      batch: 'B1061',
      date: '2026-04-17',
      status: 'Verified',
      pdfUrl: 'assets/pdfs/coa-sample.pdf',
    },
    {
      title: 'Reference Standard',
      batch: 'B1084',
      date: '2026-03-11',
      status: 'Verified',
      pdfUrl: 'assets/pdfs/coa-sample.pdf',
    },
  ];

  const closeNavMenu = () => {
    if (!nav || !navToggle) {
      return;
    }
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  const updateNavShrinkState = () => {
    if (!nav) {
      return;
    }

    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  const renderFooter = () => {
    if (siteFooter) {
      return;
    }

    const footer = document.createElement('footer');
    footer.classList.add('footer', 'site-footer', 'premium-footer', 'reveal');
    document.body.appendChild(footer);

    const currentYear = new Date().getFullYear();
    footer.innerHTML = `
      <div class="footer__panel premium-footer__panel">
        <div class="footer__brand premium-footer__brand">
          <img src="assets/images/logo2.PNG" class="footer__logo" alt="HardRPeppers logo">
          <div>
            <p class="footer__eyebrow">HardRPeppers</p>
            <p class="premium-footer__summary">Dark, clean, premium presentation with documentation-first transparency.</p>
          </div>
        </div>

        <div class="premium-footer__features" aria-label="Store highlights">
          <article><h3>Premium Quality</h3><p>Lab tested for purity and consistency.</p></article>
          <article><h3>Up-To-Date COAs</h3><p>Current third-party lab reports.</p></article>
          <article><h3>Discreet Shipping</h3><p>Secure packaging.</p></article>
          <article><h3>Fast Processing</h3><p>Orders ship quickly.</p></article>
        </div>

        <div class="footer__links premium-footer__links" aria-label="Quick navigation">
          <a href="index.html#home">Home</a>
          <a href="products.html">Products</a>
          <a href="coas.html">COAs</a>
          <a href="contact.html">Contact</a>
        </div>
      </div>

      <div class="footer__bottom premium-footer__bottom">
        <p>These products are intended for research purposes only. Not for human consumption. You must be 21 years of age or older to purchase.</p>
        <a href="contact.html" class="back-to-top">Text to Order</a>
      </div>
      <div class="footer__bottom footer__bottom--legal"><p>© ${currentYear} HardRPeppers. All rights reserved.</p></div>
    `;
  };

  const renderProductCatalog = () => {
    if (!productCatalog) {
      return;
    }

    productCatalog.innerHTML = '';

    products.forEach((product) => {
      const card = document.createElement('article');
      card.className = 'product-card product-card--catalog product-card--store reveal';
      card.innerHTML = `
        <div class="product-card__image product-card__image--catalog">
          ${product.featured ? '<span class="product-card__featured">Featured Product</span>' : ''}
          <span class="product-card__ribbon">COA Available</span>
          <img src="${product.image}" alt="${product.name} product image" width="1200" height="900" loading="lazy" decoding="async">
        </div>
        <div class="product-card__body">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <p class="product-card__price">${product.price}</p>
          <div class="product-card__actions">
            <a href="${product.detailsUrl}" class="button button--primary product-card__button">View Details</a>
            <a href="${product.orderUrl}" class="button product-card__button product-card__button--order">Text to Order</a>
            <a href="${product.coaUrl}" class="button product-card__button product-card__button--coa">View COA</a>
          </div>
        </div>
      `;

      productCatalog.appendChild(card);
      revealObserver.observe(card);
    });
  };

  const openCoaPreview = (title, pdfUrl) => {
    if (!coaModal || !coaModalTitle || !coaModalFrame) {
      return;
    }

    coaModalTitle.textContent = title;
    coaModalFrame.src = pdfUrl;
    coaModal.classList.add('is-open');
    coaModal.setAttribute('aria-hidden', 'false');
  };

  const closeCoaPreview = () => {
    if (!coaModal || !coaModalTitle || !coaModalFrame) {
      return;
    }

    coaModal.classList.remove('is-open');
    coaModal.setAttribute('aria-hidden', 'true');
    coaModalFrame.src = '';
  };

  const renderCoaCards = () => {
    if (!coaGrid) {
      return;
    }

    coaGrid.innerHTML = '';

    coaRecords.forEach((record) => {
      const card = document.createElement('article');
      card.className = 'coa-card reveal';
      card.innerHTML = `
        <div class="coa-card__badge">${record.status}</div>
        <h3>${record.title}</h3>
        <p class="coa-card__meta">Batch ${record.batch} · ${record.date}</p>
        <p>Clean batch documentation with quick preview and direct PDF download support.</p>
        <div class="coa-card__actions">
          <button type="button" class="table-action" data-coa-preview data-coa-title="${record.title} — Batch ${record.batch}" data-coa-pdf="${record.pdfUrl}">Preview</button>
          <a class="table-action table-action--download coa-download" href="${record.pdfUrl}" download>Download PDF</a>
        </div>
      `;

      coaGrid.appendChild(card);
      revealObserver.observe(card);
    });
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

  updateNavShrinkState();
  window.addEventListener('scroll', updateNavShrinkState, { passive: true });

  renderFooter();
  wireTextOrderLinks();

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

  renderProductCatalog();
  renderCoaCards();
  wireTextOrderLinks();

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const previewTrigger = target.closest('[data-coa-preview]');
    if (previewTrigger) {
      event.preventDefault();
      openCoaPreview(previewTrigger.getAttribute('data-coa-title') || 'Certificate', previewTrigger.getAttribute('data-coa-pdf') || '');
      return;
    }

    if (target.closest('[data-close-modal]')) {
      closeCoaPreview();
      return;
    }

    if (coaModal && target === coaModal) {
      closeCoaPreview();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCoaPreview();
    }
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
