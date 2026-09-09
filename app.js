(() => {
  'use strict';
  const root = document.documentElement;
  const nav = document.getElementById('section-nav');
  const menu = document.getElementById('menu-toggle');
  const theme = document.getElementById('theme-toggle');
  const mobile = matchMedia('(max-width: 1099px)');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : systemTheme.matches;
  const updateThemeLabel = () => theme.setAttribute('aria-label', `Activar tema ${isDark() ? 'claro' : 'oscuro'}`);
  updateThemeLabel();
  theme.addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('plagout-theme', root.dataset.theme); } catch {}
    updateThemeLabel();
  });
  systemTheme.addEventListener('change', updateThemeLabel);

  function closeMenu(returnFocus = false) {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    if (returnFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (open) nav.querySelector('a').focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header')) closeMenu();
  });
  document.addEventListener('focusin', event => {
    if (!event.target.closest('.header')) closeMenu();
  });
  mobile.addEventListener('change', () => closeMenu());
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const target = document.querySelector(link.getAttribute('href'));
      const wasOpen = nav.classList.contains('is-open');
      closeMenu();
      if (wasOpen && target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
    });
  });

  const sectionLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  const backTop = document.getElementById('back-top');
  let scheduled = false;
  function updateScroll() {
    const offset = document.querySelector('.header').offsetHeight + 90;
    let current = '';
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= offset) current = section.id;
    }
    // Benefits belongs to the product tour.
    if (current === 'beneficios') current = 'como-funciona';
    sectionLinks.forEach(link => {
      if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const scrollRange = document.documentElement.scrollHeight - innerHeight;
    document.getElementById('reading-progress-fill').style.transform = `scaleX(${scrollRange > 0 ? Math.min(1, Math.max(0, scrollY / scrollRange)) : 0})`;
    backTop.hidden = scrollY < 600;
    scheduled = false;
  }
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  addEventListener('resize', updateScroll);
  updateScroll();

  // Responsive SVG: fixed-size labels and plot geometry recalculated at the available width.
  const chart = document.getElementById('gdd-chart');
  const ns = 'http://www.w3.org/2000/svg';
  function svgNode(name, attrs, text) {
    const el = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    if (text !== undefined) el.textContent = text;
    return el;
  }
  const points = [[0, 0], [5, 25], [10, 65], [15, 125], [20, 190], [25, 260], [30, 345], [33, 400], [36, 445], [40, 500]];
  function thresholdState() {
    const percent = 80;
    const value = 500 * percent / 100;
    const end = points.findIndex(point => point[1] >= value);
    const [d0, v0] = points[end - 1], [d1, v1] = points[end];
    return { percent, value, day: d0 + (value - v0) / (v1 - v0) * (d1 - d0) };
  }
  function drawChart() {
    const width = chart.parentElement.clientWidth;
    if (!width) return;
    const height = chart.parentElement.clientHeight;
    chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const previous = chart.querySelector('g');
    if (previous) previous.remove();
    const g = svgNode('g', {});
    const left = 35, right = width - 15, top = 33, bottom = height - 49;
    const x = day => left + day / 40 * (right - left);
    const y = value => bottom - value / 500 * (bottom - top);
    g.append(svgNode('text', { x: left, y: 14, class: 'chart-axis' }, 'GDD'));
    [0, 200, 400, 500].forEach(value => {
      g.append(svgNode('line', { x1: left, y1: y(value), x2: right, y2: y(value), class: 'chart-grid' }));
      g.append(svgNode('text', { x: left - 8, y: y(value) + 3, 'text-anchor': 'end', class: 'chart-axis' }, value));
    });
    const ticks = width < 360 ? [0, 20, 40] : [0, 10, 20, 30, 40];
    ticks.forEach(day => g.append(svgNode('text', { x: x(day), y: bottom + 19, 'text-anchor': 'middle', class: 'chart-axis' }, day)));
    g.append(svgNode('text', { x: (left + right) / 2, y: height - 6, 'text-anchor': 'middle', class: 'chart-axis' }, 'Días desde el biofix'));
    const { value, day } = thresholdState();
    const path = points.map(([day, value], index) => `${index ? 'L' : 'M'} ${x(day)} ${y(value)}`).join(' ');
    g.append(svgNode('path', { d: `${path} L ${right} ${bottom} L ${left} ${bottom} Z`, class: 'chart-area' }));
    g.append(svgNode('line', { x1: left, y1: y(value), x2: right, y2: y(value), class: 'chart-threshold' }));
    g.append(svgNode('path', { d: path, pathLength: 1, class: 'chart-curve' }));
    g.append(svgNode('circle', { cx: x(day), cy: y(value), r: 5.5, class: 'chart-dot' }));
    chart.append(g);
  }
  if ('ResizeObserver' in window) new ResizeObserver(drawChart).observe(chart.parentElement);
  else addEventListener('resize', drawChart);
  drawChart();

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let motionPaused = reduced.matches;
  const video = document.getElementById('app-demo');
  const playButton = document.getElementById('demo-play');
  const demoControl = document.getElementById('demo-control');
  const phases = [...document.querySelectorAll('[data-demo-phase]')];
  let loaded = false, visible = false, userPaused = false, manualPlayback = false, automaticPause = false;
  video.muted = true;
  // Custom controls avoid native overlays shading the recording.
  // The video also stays out of opacity/transform entrance animations.
  video.controls = false;
  const fullscreenButton = document.getElementById('demo-fullscreen');
  const videoDialog = document.getElementById('video-dialog');
  const phone = document.querySelector('.demo-phone');
  const phoneHome = phone.parentElement;
  // Keep a separate poster over the decoder surface until a frame is presented.
  const loadingPoster = phone.querySelector('.demo-loading-poster');
  video.addEventListener('playing', () => {
    const revealFrame = () => { loadingPoster.hidden = true; };
    if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(revealFrame);
    else requestAnimationFrame(() => requestAnimationFrame(revealFrame));
  }, { once: true });
  let controlsTimer;
  function revealTouchControls() {
    clearTimeout(controlsTimer);
    phone.classList.add('controls-visible');
    controlsTimer = setTimeout(() => phone.classList.remove('controls-visible'), 3000);
  }
  phone.addEventListener('pointerup', event => {
    if (event.pointerType === 'mouse') return;
    if (event.target.closest('button')) { revealTouchControls(); return; }
    if (phone.classList.contains('controls-visible')) {
      clearTimeout(controlsTimer);
      phone.classList.remove('controls-visible');
    } else revealTouchControls();
  });
  let expanded = false;
  fullscreenButton.addEventListener('click', async () => {
    if (expanded) { videoDialog.close(); return; }
    phoneHome.style.minHeight = `${phoneHome.getBoundingClientRect().height}px`;
    expanded = true;
    const wasPlaying = !video.paused;
    videoDialog.querySelector('.expanded-video-stage').append(phone);
    videoDialog.showModal();
    document.body.classList.add('video-expanded');
    fullscreenButton.setAttribute('aria-label', 'Reducir video');
    if (wasPlaying) startVideo();
    videoDialog.querySelector('.video-dialog-close').focus();
  });
  videoDialog.querySelector('.video-dialog-close').addEventListener('click', () => videoDialog.close());
  videoDialog.addEventListener('click', event => { if (event.target === videoDialog) videoDialog.close(); });
  videoDialog.addEventListener('close', () => {
    const wasPlaying = !video.paused;
    phoneHome.append(phone);
    phoneHome.style.minHeight = '';
    expanded = false;
    document.body.classList.remove('video-expanded');
    fullscreenButton.setAttribute('aria-label', 'Ampliar video');
    if (wasPlaying) startVideo();
    fullscreenButton.focus({ preventScroll: true });
  });
  function loadVideo() {
    if (loaded) return;
    video.querySelector('source').src = video.querySelector('source').dataset.src;
    loaded = true;
    video.load();
  }
  async function startVideo() {
    loadVideo();
    try { await video.play(); } catch { playButton.hidden = false; }
  }
  function syncVideo() {
    if ((visible || expanded) && (!motionPaused || manualPlayback) && !userPaused && !document.hidden) startVideo();
    else if (!video.paused) { automaticPause = true; video.pause(); }
  }
  function updateMotion() {
    manualPlayback = false;
    root.classList.toggle('motion-paused', motionPaused);
    syncVideo();
  }
  reduced.addEventListener('change', () => { motionPaused = reduced.matches; updateMotion(); });
  updateMotion();
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncVideo();
  }, { threshold: .35 }).observe(video);
  document.addEventListener('visibilitychange', syncVideo);
  playButton.addEventListener('click', () => { userPaused = false; manualPlayback = true; startVideo(); });
  demoControl.addEventListener('click', () => {
    if (video.paused) { userPaused = false; manualPlayback = true; startVideo(); }
    else { userPaused = true; video.pause(); }
  });
  video.addEventListener('play', () => { playButton.hidden = true; demoControl.setAttribute('aria-label', 'Pausar demo'); demoControl.classList.add('is-playing'); });
  video.addEventListener('pause', () => {
    demoControl.setAttribute('aria-label', 'Reproducir demo'); demoControl.classList.remove('is-playing');
    if (automaticPause) automaticPause = false;
    else { userPaused = true; manualPlayback = false; }
  });
  video.addEventListener('error', () => { demoControl.setAttribute('aria-label', 'Video no disponible'); demoControl.disabled = true; playButton.hidden = true; });
  const phaseStarts = [0, 5, 12, 22.75];
  function syncPhase() {
    const t = video.currentTime;
    const phase = Math.max(0, phaseStarts.findLastIndex(start => t >= start));
    phases.forEach((item, i) => {
      item.classList.toggle('is-active', i === phase);
      const button = item.querySelector('button');
      if (i === phase) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    });
  }
  video.addEventListener('timeupdate', syncPhase);
  let requestedPhase = 0;
  phases.forEach((item, i) => item.querySelector('button').addEventListener('click', async () => {
    requestedPhase = i;
    loadVideo();
    const seek = () => {
      video.currentTime = phaseStarts[requestedPhase] + .05;
      userPaused = false;
      manualPlayback = true;
      syncPhase();
      startVideo();
    };
    if (video.readyState >= 1) seek();
    else video.addEventListener('loadedmetadata', seek, { once: true });
    if (matchMedia('(max-width: 639px)').matches) {
      video.scrollIntoView({ behavior: motionPaused ? 'instant' : 'smooth', block: 'center' });
    }
  }));
  syncPhase();
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } });
  }, { threshold: .1 });
  document.querySelectorAll('.journey-step,.how-copy,.section-heading,.decision-card,.alert-card,.definition,.faq-heading').forEach((el, i) => {
    el.classList.add('reveal'); el.style.setProperty('--reveal-delay', `${i % 3 * 90}ms`); revealObserver.observe(el);
  });
  const chartCard = document.getElementById('chart-card');
  function animateChart() {
    chartCard.classList.remove('chart-running');
    void chartCard.offsetWidth;
    if (!motionPaused) chartCard.classList.add('chart-running');
  }
  new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) animateChart(); else chartCard.classList.remove('chart-running'); });
  }, { threshold: .4 }).observe(chartCard);
  document.getElementById('chart-replay').addEventListener('click', animateChart);
  function updateThreshold() {
    const { percent, value, day } = thresholdState();
    const dayText = Number.isInteger(day) ? String(day) : day.toLocaleString('es-419', { maximumFractionDigits: 1 });
    chartCard.classList.remove('chart-running');
    document.getElementById('threshold-legend').textContent = `Umbral del ${percent} %`;
    document.getElementById('threshold-result').textContent = `Día ${dayText} · ${value} de 500 GDD · Umbral ${percent} %`;
    document.getElementById('chart-desc').textContent = `Ejemplo ilustrativo: la curva sube desde cero hasta 500 GDD al día 40. Cruza el umbral de ${value} GDD, equivalente al ${percent} %, alrededor del día ${dayText}, cuando se emite el aviso.`;
    drawChart();
  }
  updateThreshold();

  // Native POST preserves FormSubmit CAPTCHA and the automatic confirmation email.
  const form = document.getElementById('pilot-form');
  const submitButton = form.querySelector('button[type=submit]');
  const status = document.getElementById('form-status');
  form.elements._next.value = new URL('inscripcion.html', location.href).href;
  form.addEventListener('submit', () => {
    submitButton.disabled = true;
    status.textContent = 'Enviando tu solicitud… Completa la verificación si se solicita.';
    status.hidden = false;
  });
  addEventListener('pageshow', () => { submitButton.disabled = false; status.hidden = true; });
  const journey = document.querySelector('.journey');
  const journeySteps = [...journey.querySelectorAll('.journey-step')];
  journeySteps.forEach((step, i) => step.style.setProperty('--journey-delay', `${i * 220}ms`));
  new IntersectionObserver(entries => {
    for (const entry of entries) journey.classList.toggle('journey-running', entry.isIntersecting && !motionPaused);
  }, { threshold: .25 }).observe(journey);
})();
