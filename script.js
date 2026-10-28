(function () {
  /* Add your photos here: a path such as "images/hero.jpg" or a full image URL. Empty slots show a placeholder. */
  var IMAGES = {
    hero: "",
    face: "",
    body: "",
    clinic1: "",
    clinic2: "",
    clinic3: "",
    clinic4: ""
  };

  function loadSlot(slot, url) {
    var img = slot.querySelector('img');
    slot.classList.remove('has-img');
    if (!url) { img.removeAttribute('src'); return; }
    img.onload = function () { slot.classList.add('has-img'); };
    img.onerror = function () { slot.classList.remove('has-img'); };
    img.src = url;
  }
  document.querySelectorAll('.slot[data-slot]').forEach(function (slot) {
    loadSlot(slot, IMAGES[slot.getAttribute('data-slot')]);
  });

  var main = document.getElementById('gallery-main');
  var mainLabel = main.querySelector('.ph-label');
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.thumb'));
  var galleryEl = document.querySelector('.gallery');
  var ROTATE_MS = 10000;
  var current = 0, rotateTimer = null, hovering = false;

  function showClinic(i) {
    current = (i + thumbs.length) % thumbs.length;
    var th = thumbs[current];
    thumbs.forEach(function (t) { t.setAttribute('aria-pressed', t === th ? 'true' : 'false'); });
    var key = th.getAttribute('data-key');
    main.setAttribute('data-slot', key);
    if (mainLabel) mainLabel.textContent = th.getAttribute('data-label');
    loadSlot(main, IMAGES[key]);
  }
  function startRotate() {
    stopRotate();
    if (thumbs.length < 2) return;
    rotateTimer = setInterval(function () {
      if (!hovering && !document.hidden) showClinic(current + 1);
    }, ROTATE_MS);
  }
  function stopRotate() { clearInterval(rotateTimer); rotateTimer = null; }

  thumbs.forEach(function (th, i) {
    th.addEventListener('click', function () {
      showClinic(i);
      startRotate(); /* restart the 10 second countdown after a manual pick */
    });
  });
  /* Pause while the pointer or keyboard focus is on the gallery so people can look. */
  galleryEl.addEventListener('mouseenter', function () { hovering = true; });
  galleryEl.addEventListener('mouseleave', function () { hovering = false; });
  galleryEl.addEventListener('focusin', function () { hovering = true; });
  galleryEl.addEventListener('focusout', function () { hovering = false; });
  document.getElementById('g-prev').addEventListener('click', function () { showClinic(current - 1); startRotate(); });
  document.getElementById('g-next').addEventListener('click', function () { showClinic(current + 1); startRotate(); });
  startRotate();

  var toggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  var links = {};
  document.querySelectorAll('.nav a.navlink').forEach(function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });
  function setActive(id) {
    Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === id); });
  }

  /* A clicked link stays highlighted until the person scrolls on their own.
     Near the bottom of the page the browser cannot scroll the target to the top,
     so scroll position alone would highlight the wrong link. */
  var lockUntilScroll = false, lockTimer = null;
  function releaseLock() { lockUntilScroll = false; clearTimeout(lockTimer); }
  nav.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var id = (a.getAttribute('href') || '').slice(1);
    if (id === 'face' || id === 'body') id = 'treatments';
    if (!links[id]) return;
    setActive(id);
    lockUntilScroll = true;
    clearTimeout(lockTimer);
    lockTimer = setTimeout(releaseLock, 1500);
  });
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, releaseLock, { passive: true });
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (lockUntilScroll) return;
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(en.target.id);
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    Object.keys(links).forEach(function (k) {
      var el = document.getElementById(k);
      if (el) io.observe(el);
    });
  }
})();
