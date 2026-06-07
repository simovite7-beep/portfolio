/**
 * Premium Portfolio — Main Script
 * GSAP · Lenis · SplitType · Interactions
 */

(function () {
  'use strict';

  /* ---- Utilities ---- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /** Encode asset path for safe URL usage */
  function encodeAssetPath(path) {
    return path.split('/').map((segment) => encodeURIComponent(segment)).join('/');
  }

  /** Check reduced motion preference */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** State */
  let lenis = null;
  let currentFilter = 'all';
  let modalOpen = false;

  /* ============================================
     PRELOADER
     ============================================ */
  function initPreloader() {
    const preloader = $('#preloader');
    const progress = $('.preloader-progress');
    const percent = $('.preloader-percent');
    if (!preloader) {
      initHeroAnimations();
      return;
    }

    // Hero brand image — priority load
    const heroSrc = 'assets/seemo-brand.png';
    const heroImg = new Image();
    heroImg.onload = () => {
      const wrap = $('.reveal-hero');
      if (wrap) {
        wrap.style.opacity = '1';
        wrap.style.transform = 'none';
      }
    };
    heroImg.src = heroSrc;

    const images = [heroSrc, ...PROJECTS.map((p) => encodeAssetPath(p.image))];
    let loaded = 0;
    const total = Math.min(images.length, 8);

    function updateProgress() {
      loaded++;
      const pct = Math.round((loaded / total) * 100);
      if (progress) progress.style.width = `${pct}%`;
      if (percent) percent.textContent = `${pct}%`;

      if (loaded >= total) {
        setTimeout(hidePreloader, 300);
      }
    }

    images.slice(0, total).forEach((src) => {
      const img = new Image();
      img.onload = updateProgress;
      img.onerror = updateProgress;
      img.src = src;
    });

    setTimeout(hidePreloader, 4000);

    function hidePreloader() {
      if (preloader.classList.contains('hidden')) return;
      preloader.classList.add('hidden');
      document.body.style.overflow = '';
      initHeroAnimations();
    }

    document.body.style.overflow = 'hidden';
  }

  /* ============================================
     LENIS SMOOTH SCROLL
     ============================================ */
  function initLenis() {
    if (prefersReducedMotion || typeof Lenis === 'undefined') return;

    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* ============================================
     CUSTOM CURSOR
     ============================================ */
  function initCursor() {
    if (window.innerWidth < 768 || prefersReducedMotion) return;

    const cursor = $('#cursor');
    const cursorLabel = $('#cursor-label');
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.set(cursor.querySelector('.cursor-dot'), { x: mouseX, y: mouseY });
    });

    gsap.ticker.add(() => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      gsap.set(cursor.querySelector('.cursor-ring'), { x: ringX, y: ringY });
      if (cursorLabel?.classList.contains('visible')) {
        gsap.set(cursorLabel, { x: mouseX, y: mouseY + 40 });
      }
    });

    // Hover states
    const hoverTargets = 'a, button, .portfolio-item-inner, .magnetic, input, textarea';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.add('hover');
      }
      if (e.target.closest('.portfolio-item-inner')) {
        cursorLabel?.classList.add('visible');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.remove('hover');
      }
      if (e.target.closest('.portfolio-item-inner')) {
        cursorLabel?.classList.remove('visible');
      }
    });
    document.addEventListener('mousedown', () => cursor.classList.add('click'));
    document.addEventListener('mouseup', () => cursor.classList.remove('click'));
  }

  /* ============================================
     MAGNETIC BUTTONS
     ============================================ */
  function initMagnetic() {
    if (prefersReducedMotion) return;

    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * 0.25, y: y * 0.25, duration: 0.4, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ============================================
     NAVIGATION
     ============================================ */
  function initNavigation() {
    const header = $('#header');
    const menuToggle = $('#menu-toggle');
    const mobileMenu = $('#mobile-menu');

    // Scroll state
    ScrollTrigger.create({
      start: 'top -80',
      onUpdate: (self) => {
        header?.classList.toggle('scrolled', self.scroll() > 80);
      },
    });

    // Mobile menu
    menuToggle?.addEventListener('click', () => {
      const isOpen = mobileMenu?.classList.toggle('open');
      menuToggle.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileMenu?.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      if (lenis) isOpen ? lenis.stop() : lenis.start();
    });

    // Close mobile menu on link click
    $$('.mobile-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu?.classList.remove('open');
        menuToggle?.classList.remove('active');
        menuToggle?.setAttribute('aria-expanded', 'false');
        lenis?.start();
      });
    });

    // Smooth anchor scroll
    $$('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -80 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* ============================================
     HERO
     ============================================ */
  function initHeroGallery() {
    const gallery = $('#hero-gallery');
    if (!gallery || !HERO_IMAGES?.length) return;

    HERO_IMAGES.forEach((project, i) => {
      const item = document.createElement('div');
      item.className = 'hero-gallery-item';
      item.style.gridRow = i % 2 === 0 ? 'span 2' : 'span 1';
      item.innerHTML = `<img src="${encodeAssetPath(project.image)}" alt="" loading="lazy" decoding="async">`;
      gallery.appendChild(item);
    });

    // Parallax on hero gallery
    if (!prefersReducedMotion) {
      gsap.to('.hero-gallery-item', {
        y: (i) => (i % 2 === 0 ? -60 : -30),
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }
  }

  function initHeroAnimations() {
    const heroWrap = $('.reveal-hero');
    if (heroWrap) {
      heroWrap.style.opacity = '1';
      heroWrap.style.transform = 'none';
    }

    $$('[data-hero-animate]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    if (prefersReducedMotion || typeof gsap === 'undefined') return;

    if (heroWrap) {
      gsap.fromTo(
        heroWrap,
        { scale: 0.94, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: 'power4.out', delay: 0.2 }
      );
    }

    gsap.from('[data-hero-animate]', {
      y: 24,
      opacity: 0,
      duration: 0.9,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.6,
    });
  }

  /* ============================================
     ABOUT
     ============================================ */
  function initAbout() {
    const aboutImage = $('#about-image');
    const aboutBio = $('#about-bio');
    const aboutLocation = $('#about-location');

    if (aboutBio) aboutBio.textContent = DESIGNER.bio;
    if (aboutLocation) aboutLocation.textContent = DESIGNER.location;

    const featured = ABOUT_IMAGE || PROJECTS[0];
    if (aboutImage && featured) {
      aboutImage.src = encodeAssetPath(featured.image);
      aboutImage.alt = `${DESIGNER.name} — Visual Designer portfolio showcase`;
    }

    // Dynamic hero stats
    const statNums = $$('.hero-stats .stat-num');
    if (statNums[0]) statNums[0].textContent = PROJECTS.length;
    if (statNums[1]) statNums[1].textContent = CATEGORIES.length - 1;
  }

  /* ============================================
     PORTFOLIO
     ============================================ */
  function renderPortfolio(filter = 'all') {
    const grid = $('#portfolio-grid');
    const countEl = $('#project-count');
    if (!grid) return;

    currentFilter = filter;
    const filtered = filter === 'all'
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === filter);

    grid.innerHTML = '';

    filtered.forEach((project, index) => {
      const item = document.createElement('article');
      item.className = `portfolio-item size-${project.size}`;
      item.setAttribute('role', 'listitem');
      item.dataset.id = project.id;
      item.dataset.category = project.category;

      item.innerHTML = `
        <div class="portfolio-item-inner" tabindex="0" role="button" aria-label="Voir ${project.title}">
          <img
            class="portfolio-item-image"
            src="${encodeAssetPath(project.image)}"
            alt="${project.alt}"
            loading="lazy"
            decoding="async"
            width="600"
            height="800"
          >
          <div class="portfolio-item-overlay">
            <span class="portfolio-item-category">${project.categoryLabel}</span>
            <h3 class="portfolio-item-title">${project.title}</h3>
          </div>
        </div>
      `;

      grid.appendChild(item);

      // Click / keyboard open modal
      const inner = item.querySelector('.portfolio-item-inner');
      inner.addEventListener('click', () => openModal(project.id));
      inner.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(project.id);
        }
      });
    });

    if (countEl) countEl.textContent = filtered.length;

    // Animate items in
    animatePortfolioItems();
  }

  function animatePortfolioItems() {
    if (prefersReducedMotion) return;

    gsap.from('.portfolio-item', {
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.06,
      ease: 'power3.out',
      clearProps: 'opacity,transform',
    });
  }

  function initPortfolioFilters() {
    const container = $('#portfolio-filters');
    if (!container) return;

    CATEGORIES.forEach((cat) => {
      const btn = document.createElement('button');
      btn.textContent = cat.label;
      btn.dataset.filter = cat.id;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', cat.id === 'all' ? 'true' : 'false');
      if (cat.id === 'all') btn.classList.add('active');

      btn.addEventListener('click', () => {
        $$('#portfolio-filters button').forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        renderPortfolio(cat.id);
      });

      container.appendChild(btn);
    });

    renderPortfolio('all');
  }

  /* ============================================
     PROJECT MODAL
     ============================================ */
  function openModal(projectId) {
    const project = PROJECTS.find((p) => p.id === projectId);
    if (!project) return;

    const modal = $('#project-modal');
    const modalImage = $('#modal-image');
    const modalTitle = $('#modal-title');
    const modalCategory = $('#modal-category');
    const modalYear = $('#modal-year');
    const modalDescription = $('#modal-description');
    const modalTags = $('#modal-tags');
    const relatedGrid = $('#modal-related-grid');

    if (modalImage) {
      modalImage.src = encodeAssetPath(project.image);
      modalImage.alt = project.alt;
    }
    if (modalTitle) modalTitle.textContent = project.title;
    if (modalCategory) modalCategory.textContent = project.categoryLabel;
    if (modalYear) modalYear.textContent = project.year;
    if (modalDescription) modalDescription.textContent = project.description;

    if (modalTags) {
      modalTags.innerHTML = project.tags
        .map((tag) => `<span>${tag}</span>`)
        .join('');
    }

    // Related projects
    if (relatedGrid) {
      const related = getRelatedProjects(projectId, 4);
      relatedGrid.innerHTML = related
        .map(
          (r) => `
          <div class="modal-related-item" data-id="${r.id}" tabindex="0" role="button" aria-label="Voir ${r.title}">
            <img src="${encodeAssetPath(r.image)}" alt="${r.alt}" loading="lazy">
          </div>
        `
        )
        .join('');

      relatedGrid.querySelectorAll('.modal-related-item').forEach((item) => {
        item.addEventListener('click', () => openModal(item.dataset.id));
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') openModal(item.dataset.id);
        });
      });
    }

    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden', 'false');
    modalOpen = true;
    lenis?.stop();
    document.body.style.overflow = 'hidden';

    // Modal entrance animation
    if (!prefersReducedMotion) {
      gsap.from('.modal-hero', { y: 60, opacity: 0, duration: 0.8, ease: 'power3.out' });
      gsap.from('.modal-body > *', { y: 30, opacity: 0, duration: 0.6, stagger: 0.1, delay: 0.2, ease: 'power3.out' });
    }

    // Focus trap
    $('.modal-close')?.focus();
  }

  function closeModal() {
    const modal = $('#project-modal');
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
    modalOpen = false;
    lenis?.start();
    document.body.style.overflow = '';
  }

  function initModal() {
    $('.modal-close')?.addEventListener('click', closeModal);
    $('.modal-backdrop')?.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOpen) closeModal();
    });
  }

  /* ============================================
     EXPERTISE
     ============================================ */
  function initExpertise() {
    const grid = $('#expertise-grid');
    if (!grid) return;

    EXPERTISE.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'expertise-card reveal';
      card.innerHTML = `
        <div class="expertise-icon">${item.icon}</div>
        <h3 class="font-display text-xl font-semibold mb-3">${item.title}</h3>
        <p class="text-muted text-sm leading-relaxed">${item.description}</p>
        <div class="expertise-stat">
          <span class="expertise-stat-num">${item.stat}</span>
          <span class="block text-xs text-muted mt-1">${item.statLabel}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  /* ============================================
     PROCESS
     ============================================ */
  function initProcess() {
    const timeline = $('#process-timeline');
    if (!timeline) return;

    PROCESS_STEPS.forEach((step) => {
      const el = document.createElement('div');
      el.className = 'process-step';
      el.innerHTML = `
        <span class="process-step-num">${step.step}</span>
        <div>
          <h3 class="process-step-title">${step.title}</h3>
          <p class="text-muted leading-relaxed">${step.description}</p>
        </div>
      `;
      timeline.appendChild(el);
    });
  }

  /* ============================================
     CONTACT
     ============================================ */
  function initContact() {
    const emailLink = $('#contact-email');
    const phoneLink = $('#contact-phone');
    const whatsappBtn = $('#contact-whatsapp-btn');
    const socialLinks = $('#social-links');
    const form = $('#contact-form');
    const status = $('#form-status');

    if (emailLink) {
      emailLink.href = `mailto:${DESIGNER.email}`;
      emailLink.querySelector('.contact-link-value').textContent = DESIGNER.email;
    }

    if (phoneLink && DESIGNER.phone) {
      phoneLink.href = `tel:${DESIGNER.phone.replace(/\s/g, '')}`;
      phoneLink.querySelector('.contact-link-value').textContent = DESIGNER.phone;
    }

    if (whatsappBtn && DESIGNER.whatsapp) {
      whatsappBtn.href = DESIGNER.whatsapp;
    }

    const whatsappFloat = $('#whatsapp-float');
    if (whatsappFloat && DESIGNER.whatsapp) {
      whatsappFloat.href = DESIGNER.whatsapp;
    }

    if (socialLinks && DESIGNER.social) {
      socialLinks.innerHTML = `
        <a href="${DESIGNER.social.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="social-btn">Instagram</a>
        <a href="${DESIGNER.whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" class="social-btn social-btn--whatsapp">WhatsApp</a>
      `;
    }

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#name')?.value.trim();
      const email = $('#email')?.value.trim();
      const message = $('#message')?.value.trim();

      if (!name || !email || !message) {
        if (status) {
          status.textContent = 'Veuillez remplir tous les champs.';
          status.className = 'form-status error';
        }
        return;
      }

      const whatsappText = [
        '🎨 *Nouvelle demande — SEEMO Portfolio*',
        '',
        '👤 *Nom:* ' + name,
        '📧 *Email:* ' + email,
        '',
        '💬 *Message:*',
        message,
        '',
        '—',
        'Envoyé depuis le portfolio SEEMO',
      ].join('\n');

      const whatsappUrl =
        (DESIGNER.whatsapp || 'https://wa.me/212699360172') +
        '?text=' +
        encodeURIComponent(whatsappText);

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      if (status) {
        status.textContent = 'Ouverture de WhatsApp avec votre message...';
        status.className = 'form-status success';
      }
      form.reset();
    });
  }

  /* ============================================
     SCROLL REVEAL ANIMATIONS
     ============================================ */
  function initScrollAnimations() {
    if (prefersReducedMotion) {
      $$('.reveal, .process-step').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // General reveals
    $$('.reveal').forEach((el) => {
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Process steps
    $$('.process-step').forEach((step, i) => {
      gsap.to(step, {
        x: 0,
        opacity: 1,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: step,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // About image parallax
    gsap.to('.about-image', {
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-visual',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });

    // Expertise cards stagger
    gsap.from('.expertise-card', {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#expertise-grid',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* ============================================
     INIT
     ============================================ */
  function init() {
    gsap.registerPlugin(ScrollTrigger);

    initPreloader();
    initLenis();
    initCursor();
    initMagnetic();
    initNavigation();
    initHeroGallery();
    initAbout();
    initPortfolioFilters();
    initModal();
    initExpertise();
    initProcess();
    initContact();

    // Defer scroll animations until DOM ready
    requestAnimationFrame(() => {
      initScrollAnimations();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
