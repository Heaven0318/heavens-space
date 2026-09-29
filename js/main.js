/*
  HEAVEN'S SPACE — SITE BEHAVIOR
  This file controls interactions. Most styling lives in css/style.css.
*/

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Theme ----------

function setupTheme() {
  const savedTheme = localStorage.getItem('heavens-theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
    document.body.classList.add('light');
  }

  document.querySelectorAll('.theme-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      document.body.classList.toggle('light');
      const theme = document.body.classList.contains('light') ? 'light' : 'dark';
      localStorage.setItem('heavens-theme', theme);
    });
  });
}

// ---------- Shared page details ----------

function setCurrentYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll('.year, #year').forEach((element) => {
    element.textContent = year;
  });
}

function setupMobileMenu() {
  const menuButton = document.querySelector('.menu-button');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!menuButton || !mobileNav) return;

  menuButton.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuButton.textContent = isOpen ? 'CLOSE' : 'MENU';
    menuButton.setAttribute('aria-expanded', String(isOpen));
    mobileNav.setAttribute('aria-hidden', String(!isOpen));
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuButton.textContent = 'MENU';
      menuButton.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  });
}

// ---------- Scroll reveal ----------

function setupScrollReveal() {
  const elements = document.querySelectorAll('.reveal:not(.visible)');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  elements.forEach((element) => observer.observe(element));
}

// ---------- Projects ----------

function projectCard(project) {
  const number = String(projects.indexOf(project) + 1).padStart(2, '0');

  return `
    <a class="project-card reveal" href="#project=${project.slug}" data-category="${project.category}">
      <div class="project-visual ${project.image}">
        <span class="project-index">${number}</span>
      </div>
      <div class="project-meta">
        <div>
          <h3>${project.title}</h3>
          <p>${project.type} / ${project.description}</p>
        </div>
        <span class="project-arrow">↗</span>
      </div>
    </a>`;
}

// These are presentation placeholders, not projects or routable detail pages.
function comingSoonCard() {
  return `
    <article class="project-card project-placeholder reveal">
      <div class="project-visual coming-soon" aria-hidden="true">
        <span class="project-index">COMING SOON</span>
      </div>
      <div class="project-meta">
        <div>
          <h3>Project Coming Soon.</h3>
          <p>A new project is currently in development.</p>
        </div>
      </div>
    </article>`;
}

function renderProjects(filter = 'all') {
  const grid = document.getElementById('project-grid');
  if (!grid) return;

  const visibleProjects = projects.filter((project) => (
    filter === 'all' || project.category.includes(filter)
  ));

  const placeholders = filter === 'all' || visibleProjects.length === 0
    ? Array.from({ length: 4 }, comingSoonCard).join('') : '';
  grid.innerHTML = visibleProjects.map(projectCard).join('') + placeholders;
  setupScrollReveal();
}

function setupProjectFilters() {
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach((item) => {
        item.classList.remove('active');
      });

      button.classList.add('active');
      renderProjects(button.dataset.filter);
    });
  });
}

function projectDetail(label, content) {
  return `<div><p class="eyebrow">${label}</p><p>${content}</p></div>`;
}

function renderProjectPage() {
  const projectView = document.getElementById('project-view');
  const isProjectRoute = window.location.hash.startsWith('#project=');
  const slug = isProjectRoute ? window.location.hash.slice(9) : '';

  if (!projectView || !slug) return;

  const project = projects.find((item) => item.slug === slug);
  projectView.hidden = false;

  if (!project) {
    projectView.innerHTML = `
      <div class="not-found">
        <p class="eyebrow">ERROR / 404</p>
        <h1>PROJECT<br>NOT <em>FOUND.</em></h1>
        <a class="outline-button" href="#work">BACK TO WORK <span>↗</span></a>
      </div>`;
    return;
  }

  document.title = `${project.title} — Heaven's Space`;
  const number = String(projects.indexOf(project) + 1).padStart(2, '0');

  projectView.innerHTML = `
    <section class="page-hero project-hero">
      <p class="eyebrow">PROJECT / ${number} / ${project.type.toUpperCase()}</p>
      <h1>${project.title.toUpperCase()}</h1>
      <p class="page-intro">${project.description}</p>
    </section>
    <section class="project-detail section">
      <div class="project-detail-visual ${project.image}">
        <span class="project-index">PREVIEW / ${project.title.toUpperCase()}</span>
      </div>
      <div class="project-sections">
        ${project.liveUrl ? `<div><p class="eyebrow">LIVE WEBSITE</p><p><a class="text-link" href="${project.liveUrl}" target="_blank" rel="noreferrer">OPEN PROJECT <span>↗</span></a></p></div>` : ''}
        ${project.sourceUrl ? `<div><p class="eyebrow">SOURCE CODE</p><p><a class="text-link" href="${project.sourceUrl}" target="_blank" rel="noreferrer">VIEW ON GITHUB <span>↗</span></a></p></div>` : ''}
        ${projectDetail('OVERVIEW', project.description)}
        ${projectDetail('IDEA', project.idea)}
        ${projectDetail('FEATURES', project.features.join('<br>'))}
        ${projectDetail('TECHNOLOGIES', project.technologies.join(' · '))}
        ${projectDetail('PROCESS', project.process)}
        ${projectDetail('CHALLENGES', project.challenges)}
        ${projectDetail('RESULT', project.result)}
        ${projectDetail('REFLECTION', project.reflection)}
      </div>
    </section>
    <section class="project-end section">
      <a class="text-link" href="#work">← BACK TO WORK</a>
    </section>`;

  projectView.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  });
}

// ---------- Contact form ----------

function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = form.querySelector('.form-status');
  const button = form.querySelector('[type="submit"]');
  const fields = ['name', 'email', 'subject', 'message'];
  let sending = false;
  let lastSuccess = 0;
  const setError = (name, message) => {
    const input = form.elements.namedItem(name);
    form.querySelector(`[data-error="${name}"]`).textContent = message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };
  fields.forEach((name) => form.elements.namedItem(name).addEventListener('input', () => setError(name, '')));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    const values = Object.fromEntries(fields.map((name) => [name, form.elements.namedItem(name).value.trim()]));
    values.website = form.elements.namedItem('website').value;
    let firstInvalid = null;
    const limits = { name: 100, email: 254, subject: 160, message: 5000 };
    fields.forEach((name) => {
      let error = !values[name] ? 'This field is required.' : values[name].length > limits[name] ? `Use ${limits[name]} characters or fewer.` : '';
      if (name === 'email' && !error && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) error = 'Please enter a valid email address.';
      setError(name, error);
      if (error && !firstInvalid) firstInvalid = form.elements.namedItem(name);
    });
    if (firstInvalid) {
      status.textContent = 'Please correct the highlighted fields.';
      firstInvalid.focus();
      return;
    }
    if (Date.now() - lastSuccess < 30000) {
      status.textContent = 'Please wait before sending another message.';
      return;
    }
    const config = window.HeavensConfig;
    if (!config?.supabaseUrl || !config?.supabasePublishableKey) {
      status.textContent = 'Messaging is not configured yet. Please use the email address beside this form.';
      return;
    }
    sending = true;
    button.disabled = true;
    const originalLabel = button.innerHTML;
    button.textContent = 'SENDING…';
    status.textContent = 'Sending your message…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${config.supabaseUrl.replace(/\/$/, '')}/functions/v1/submit-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: config.supabasePublishableKey },
        body: JSON.stringify(values),
        signal: controller.signal
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 201 && result.id) {
        form.reset();
        lastSuccess = Date.now();
        status.textContent = 'Message sent. Thank you — I’ll get back to you soon.';
      } else if (response.status === 429) status.textContent = 'Too many messages. Please try again later.';
      else if (response.status === 409) status.textContent = 'This message was already sent recently.';
      else status.textContent = 'Your message could not be sent. Please try again or use the email address beside this form.';
    } catch {
      status.textContent = 'Connection failed. Your message was not sent; please try again.';
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      button.innerHTML = originalLabel;
    }
  });
}

// ---------- Small interactions ----------

function setupCursor() {
  const cursor = document.querySelector('.cursor');
  if (!cursor || !window.matchMedia('(pointer: fine)').matches) return;

  window.addEventListener('pointermove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  document.querySelectorAll('a, button').forEach((element) => {
    element.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    element.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

function setupSkipIntro() {
  const button = document.querySelector('.skip-entrance');
  const hero = document.querySelector('.hero');
  if (button && hero) button.addEventListener('click', () => hero.classList.add('skipped'));
}

// ---------- Interactive space map ----------

function setupSpaceMap() {
  const map = document.querySelector('.map-shell');
  if (!map) return;

  const orbits = [
    { name: 'home', node: '.node-home', ring: '.orbit-home', desktop: [0.26, 0.32], mobile: [0.15, 0.32], rotation: -12, speed: 0.34, angle: -1.15 },
    { name: 'work', node: '.node-work', ring: '.orbit-work', desktop: [0.36, 0.42], mobile: [0.13, 0.40], rotation: 18, speed: 0.22, angle: 0.25 },
    { name: 'about', node: '.node-about', ring: '.orbit-about', desktop: [0.52, 0.60], mobile: [0.16, 0.55], rotation: -24, speed: -0.14, angle: 2.2 },
    { name: 'contact', node: '.node-contact', ring: '.orbit-contact', desktop: [0.68, 0.76], mobile: [0.20, 0.68], rotation: 11, speed: 0.09, angle: -0.25 }
  ].map((orbit) => ({
    ...orbit,
    node: map.querySelector(orbit.node),
    ring: map.querySelector(orbit.ring),
    currentAngle: orbit.angle,
    radiusX: 0,
    radiusY: 0
  }));
  const nodes = orbits.map((orbit) => orbit.node);
  const active = new Set();
  let frame;
  let previousTimestamp;
  let compact = false;

  const updateGeometry = () => {
    compact = window.matchMedia('(max-width: 700px)').matches;
    const padding = 24;
    const width = Math.max(0, map.clientWidth - padding * 2);
    const height = Math.max(0, map.clientHeight - padding * 2);

    orbits.forEach((orbit) => {
      const [widthRatio, heightRatio] = compact ? orbit.mobile : orbit.desktop;
      orbit.radiusX = width * widthRatio / 2;
      orbit.radiusY = height * heightRatio / 2;
      orbit.ring.style.width = `${width * widthRatio}px`;
      orbit.ring.style.height = `${height * heightRatio}px`;
      orbit.ring.style.transform = `translate(-50%, -50%) rotate(${orbit.rotation}deg)`;
    });
  };

  updateGeometry();
  const resizeObserver = new ResizeObserver(updateGeometry);
  resizeObserver.observe(map);

  nodes.forEach((node) => {
    node.querySelector('.map-location').addEventListener('click', () => {
      nodes.forEach((item) => {
        item.classList.remove('selected');
        item.classList.remove('collapsed');
      });
      node.classList.add('collapsed');
    });
    node.addEventListener('mouseenter', () => {
      active.add(node);
      node.classList.remove('collapsed');
    });
    node.addEventListener('mouseleave', () => active.delete(node));
    node.addEventListener('focusin', () => active.add(node));
    node.addEventListener('focusout', () => active.delete(node));
  });

  if (prefersReducedMotion) return;

  const render = (timestamp) => {
    const delta = previousTimestamp ? Math.min((timestamp - previousTimestamp) / 1000, 0.05) : 0;
    previousTimestamp = timestamp;
    orbits.forEach((orbit) => {
      const { node, radiusX, radiusY, speed } = orbit;
      const paused = active.has(node);
      orbit.currentAngle += delta * speed * (Math.PI / 2) * (paused ? 0.05 : 1);
      const angle = orbit.currentAngle;
      const rotation = orbit.rotation * Math.PI / 180;
      const localX = Math.cos(angle) * radiusX;
      const localY = Math.sin(angle) * radiusY;
      const x = localX * Math.cos(rotation) - localY * Math.sin(rotation);
      const y = localX * Math.sin(rotation) + localY * Math.cos(rotation);
      node.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0)`;
      node.style.setProperty('--orbit-paused', paused ? '1' : '0');
    });

    frame = requestAnimationFrame(render);
  };

  frame = requestAnimationFrame(render);
}

function startSite() {
  setupTheme();
  setCurrentYear();
  setupMobileMenu();
  renderProjects();
  setupProjectFilters();
  renderProjectPage();
  setupScrollReveal();
  setupContactForm();
  setupCursor();
  setupSkipIntro();
  setupSpaceMap();

  // The page uses one HTML file. Reloading on a hash change keeps each view simple.
  window.addEventListener('hashchange', () => {
    renderProjectPage();

    if (!window.location.hash.startsWith('#project=')) {
      const projectView = document.getElementById('project-view');
      if (projectView) {
        projectView.hidden = true;
        projectView.innerHTML = '';
      }
      document.title = "Heaven's Space — Student Developer";
    }
  });
}

startSite();
