/* SFLCM creative homepage prototype: motion + small utilities. No dependencies. */
(function () {
  'use strict';

  var doc = document;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TZ = 'America/New_York';

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function smooth(t) { return t * t * (3 - 2 * t); }

  /* ---------- hero intro + logo assembly ---------- */
  var hero = $('[data-hero]');
  var headerMark = $('[data-mark="header"]');

  var arch = $('[data-arch]');
  var archReady = false;
  var archVisible = false;

  function startArch() {
    if (!hero || hero.classList.contains('arch-live')) return;
    hero.classList.add('arch-live');
    var m = $('[data-mark="hero"]', hero);
    if (m) m.classList.add('is-assembled');
  }
  function maybeStartArch() { if (archReady && archVisible) startArch(); }
  function startHero() {
    if (!hero || hero.classList.contains('is-live')) return;
    hero.classList.add('is-live');
    archReady = true;
    maybeStartArch();
  }
  // On phones the arch sits below the fold, so its sunrise waits until it is actually seen.
  if (arch && 'IntersectionObserver' in window) {
    var archIO = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { archVisible = true; maybeStartArch(); archIO.disconnect(); }
    }, { threshold: 0.35 });
    archIO.observe(arch);
  } else {
    archVisible = true;
  }
  requestAnimationFrame(function () {
    if (headerMark) headerMark.classList.add('is-assembled');
  });
  var heroTimer = setTimeout(startHero, 700);
  if (doc.fonts && doc.fonts.ready) {
    doc.fonts.ready.then(function () { clearTimeout(heroTimer); requestAnimationFrame(startHero); });
  }

  /* ---------- reveal on scroll ---------- */
  var revealTargets = $$('[data-reveal], [data-mark="finale"]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        if (e.target.hasAttribute('data-mark')) e.target.classList.add('is-assembled');
        var counters = $$('[data-count]', e.target);
        if (counters.length) counters.forEach(countUp);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in', 'is-assembled'); });
  }

  /* ---------- counters ---------- */
  var roster = $$('[data-roster] > li').length;
  $$('[data-count-roster]').forEach(function (el) {
    if (roster) { el.setAttribute('data-count', roster); el.textContent = roster; }
  });
  function fmt(n, dec) {
    return dec ? n.toFixed(dec) : Math.round(n).toLocaleString('en-US');
  }
  if (!reduced) {
    $$('[data-count]').forEach(function (el) { el.textContent = fmt(0, parseInt(el.getAttribute('data-decimals') || '0', 10)); });
  }
  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    var to = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (reduced) { el.textContent = fmt(to, dec); return; }
    var t0 = performance.now();
    var dur = 1700;
    (function step(now) {
      var p = clamp((now - t0) / dur, 0, 1);
      var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = fmt(to * e, dec);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- scroll-linked progress ---------- */
  var header = $('[data-header]');
  var stage = $('[data-stage]');
  var dock = $('[data-dock]');
  var trialSection = $('#trial');
  var footer = $('.site-footer');
  var dockBlocked = { trial: false, footer: false };
  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight || 800;
    var y = window.pageYOffset || doc.documentElement.scrollTop;

    if (header) header.classList.toggle('is-scrolled', y > 8);

    if (hero) {
      var hr = hero.getBoundingClientRect();
      var hp = 0;
      if (!reduced && arch) {
        // Bloom starts once the arch's centre passes mid-screen (immediately on desktop, later on phones).
        var ar = arch.getBoundingClientRect();
        var start = Math.max(0, ar.top + y + ar.height / 2 - vh / 2);
        hp = clamp((y - start) / Math.max(1, ar.height * 0.9), 0, 1);
      }
      hero.style.setProperty('--hp', hp.toFixed(4));
      if (dock) {
        var show = hr.bottom < vh * 0.25 && !dockBlocked.trial && !dockBlocked.footer;
        dock.classList.toggle('is-visible', show);
        dock.setAttribute('aria-hidden', show ? 'false' : 'true');
        $$('a', dock).forEach(function (a) { a.tabIndex = show ? 0 : -1; });
      }
    }

    if (stage) {
      var sr = stage.getBoundingClientRect();
      var d = reduced ? 1 : smooth(clamp((vh * 0.92 - sr.top) / (vh * 0.55), 0, 1));
      stage.style.setProperty('--door', d.toFixed(4));
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  if ('IntersectionObserver' in window && dock) {
    var dockIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target === trialSection) dockBlocked.trial = e.isIntersecting;
        if (e.target === footer) dockBlocked.footer = e.isIntersecting;
      });
      onScroll();
    }, { threshold: 0.05 });
    if (trialSection) dockIO.observe(trialSection);
    if (footer) dockIO.observe(footer);
  }

  /* ---------- stage spotlight follows the pointer ---------- */
  if (stage && !reduced) {
    var spot = $('.stage__spot', stage);
    var cur = { x: 60, y: 55 };
    var goal = { x: 60, y: 55 };
    var raf = 0;
    var lerp = function () {
      cur.x += (goal.x - cur.x) * 0.12;
      cur.y += (goal.y - cur.y) * 0.12;
      stage.style.setProperty('--sx', cur.x.toFixed(2) + '%');
      stage.style.setProperty('--sy', cur.y.toFixed(2) + '%');
      raf = (Math.abs(goal.x - cur.x) + Math.abs(goal.y - cur.y) > 0.1) ? requestAnimationFrame(lerp) : 0;
    };
    var aim = function (x, y) {
      goal.x = x; goal.y = y;
      if (!raf) raf = requestAnimationFrame(lerp);
    };
    stage.addEventListener('pointermove', function (e) {
      var r = spot.getBoundingClientRect();
      aim(clamp((e.clientX - r.left) / r.width * 100, 5, 95), clamp((e.clientY - r.top) / r.height * 100, 20, 90));
    });
    stage.addEventListener('pointerleave', function () { aim(60, 55); });
  }

  /* ---------- logo half-turn on hover (lands on the identical orientation) ---------- */
  function halfTurn(trigger, markEl) {
    if (!trigger || !markEl) return;
    var spin = $('.mark-spin', markEl);
    var turn = 0;
    var go = function () {
      if (reduced || !markEl.classList.contains('is-assembled')) return;
      turn += 180;
      spin.style.setProperty('--turn', turn + 'deg');
    };
    trigger.addEventListener('mouseenter', go);
    trigger.addEventListener('focus', go);
  }
  halfTurn($('[data-brand]'), headerMark);
  halfTurn($('.finale'), $('[data-mark="finale"]'));

  /* ---------- Grand Opening countdown ---------- */
  var cd = $('[data-countdown]');
  var shortCd = $('[data-countdown-short]');
  var ribbon = $('.ribbon');
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function tick() {
    if (!cd) return;
    var start = Date.parse(cd.getAttribute('data-start'));
    var end = Date.parse(cd.getAttribute('data-end'));
    var now = Date.now();
    var status = $('[data-countdown-status]', cd);
    if (now < start) {
      var diff = start - now;
      var d = Math.floor(diff / 864e5);
      var h = Math.floor((diff % 864e5) / 36e5);
      var m = Math.floor((diff % 36e5) / 6e4);
      $('[data-cd="d"]', cd).textContent = d;
      $('[data-cd="h"]', cd).textContent = pad(h);
      $('[data-cd="m"]', cd).textContent = pad(m);
      if (shortCd) shortCd.textContent = d >= 2 ? d + ' days to go' : (d === 1 ? 'Tomorrow' : 'Today at 3 PM');
    } else if (now < end) {
      cd.classList.add('is-past');
      status.textContent = 'Happening now: the doors are open until 6:30 PM at 1940 Harrison St.';
      if (shortCd) shortCd.textContent = 'Happening now';
    } else {
      cd.classList.add('is-past');
      status.textContent = 'Thank you for celebrating our Grand Opening with us. See you at the next recital!';
      if (ribbon) ribbon.hidden = true;
    }
  }
  tick();
  setInterval(tick, 30000);

  /* ---------- add to calendar (.ics works from file:// too) ---------- */
  var icsBtn = $('[data-ics]');
  if (icsBtn) {
    icsBtn.addEventListener('click', function () {
      var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      var ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SFLCM//Homepage Prototype//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:grand-opening-2026-10@sflcm.com',
        'DTSTAMP:' + stamp,
        'DTSTART:20261010T190000Z',
        'DTEND:20261010T223000Z',
        'SUMMARY:SFLCM Grand Opening: Open House & Teachers\u2019 Concert',
        'LOCATION:South Florida Conservatory of Music\\, 1940 Harrison St\\, Suite 100\\, Hollywood\\, FL 33020',
        'DESCRIPTION:Open house 3\u20135 PM: no RSVP needed. Teachers\u2019 concert 5\u20136:30 PM: free RSVP required. Tickets: https://www.eventbrite.com/e/2001078722326',
        'URL:https://sflcm.com/events',
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');
      var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      var a = doc.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sflcm-grand-opening.ics';
      doc.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });
  }

  /* ---------- hide past calendar items ---------- */
  $$('[data-event-end]').forEach(function (li) {
    if (Date.parse(li.getAttribute('data-event-end')) < Date.now()) li.hidden = true;
  });

  /* ---------- open / closed right now (Hollywood, FL time) ---------- */
  var openEl = $('[data-open-status]');
  var HOURS = { 1: [14, 21], 2: [14, 21], 3: [14, 21], 4: [14, 21], 5: [14, 21], 6: [10, 17] };
  var CLOSED = ['2026-11-11', '2026-11-26', '2026-11-27', '2026-11-28', '2026-12-24', '2026-12-25', '2026-12-31', '2027-01-01'];
  var DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function hr12(h) { return (h % 12 || 12) + (h < 12 ? ' AM' : ' PM'); }
  function nyNow(offsetDays) {
    var t = new Date(Date.now() + (offsetDays || 0) * 864e5);
    var parts = {};
    new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(t).forEach(function (p) { parts[p.type] = p.value; });
    return { date: parts.year + '-' + parts.month + '-' + parts.day, dow: DAY.indexOf(parts.weekday), mins: (+parts.hour % 24) * 60 + (+parts.minute) };
  }
  function openStatus() {
    if (!openEl) return;
    var now = nyNow(0);
    var today = CLOSED.indexOf(now.date) > -1 ? null : HOURS[now.dow];
    var text, open = false;
    if (today && now.mins >= today[0] * 60 && now.mins < today[1] * 60) {
      open = true;
      text = 'Open now · until ' + hr12(today[1]);
    } else if (today && now.mins < today[0] * 60) {
      text = 'Closed now · opens today at ' + hr12(today[0]);
    } else {
      for (var i = 1; i <= 7; i++) {
        var nd = nyNow(i);
        var hrs = CLOSED.indexOf(nd.date) > -1 ? null : HOURS[nd.dow];
        if (hrs) { text = 'Closed now · opens ' + (i === 1 ? 'tomorrow' : DAY[nd.dow]) + ' at ' + hr12(hrs[0]); break; }
      }
      if (CLOSED.indexOf(now.date) > -1) text = 'Closed today for the holiday · ' + text.replace('Closed now · ', '');
    }
    openEl.textContent = text;
    openEl.classList.toggle('is-open', open);
    openEl.classList.toggle('is-closed', !open);
  }
  try { openStatus(); setInterval(openStatus, 60000); } catch (e) { /* keep static hours */ }

  /* ---------- mobile menu ---------- */
  var menuBtn = $('[data-menu-btn]');
  var menu = $('[data-menu]');
  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    $('.menu-btn__label', menuBtn).textContent = open ? 'Close' : 'Menu';
    if (open && header) menu.style.setProperty('--menu-top', Math.max(0, header.getBoundingClientRect().bottom) + 'px');
    menu.hidden = !open;
    doc.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) { var first = $('a', menu); if (first) first.focus(); }
  }
  if (menuBtn && menu) {
    $$('.mobile-menu__list li', menu).forEach(function (li, i) { li.style.setProperty('--i', i); });
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1100) setMenu(false); });
  }

  /* ---------- nav: highlight the section in view ---------- */
  var navLinks = $$('.nav__list a[href^="#"]');
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = byId[e.target.id];
        if (a && e.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('is-current'); l.removeAttribute('aria-current'); });
          a.classList.add('is-current');
          a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var s = doc.getElementById(id); if (s) navIO.observe(s); });
  }

  /* ---------- octave keys: sound + one-shot resonance ---------- */
  function press(key, name) {
    if (window.SFLCMSynth) window.SFLCMSynth.play(name);
    key.classList.remove('is-playing');
    void key.offsetWidth;
    key.classList.add('is-playing', 'is-pressed');
    clearTimeout(key._t);
    key._t = setTimeout(function () { key.classList.remove('is-pressed'); }, 240);
    clearTimeout(key._p);
    key._p = setTimeout(function () { key.classList.remove('is-playing'); }, 1100);
  }
  $$('[data-sound]').forEach(function (btn) {
    btn.addEventListener('click', function () { press(btn.closest('.key'), btn.getAttribute('data-sound')); });
  });
  var keysEl = $('.keys');
  var keysInView = false;
  if (keysEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { keysInView = entries[0].isIntersecting; }, { threshold: 0.4 }).observe(keysEl);
    var map = { a: 0, s: 1, d: 2, f: 3, g: 4, h: 5, j: 6 };
    doc.addEventListener('keydown', function (e) {
      if (!keysInView || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      var i = map[(e.key || '').toLowerCase()];
      if (i === undefined) return;
      var btn = $$('[data-sound]', keysEl)[i];
      if (btn) press(btn.closest('.key'), btn.getAttribute('data-sound'));
    });
  }

  /* ---------- phrase slur drawn through the real note positions ---------- */
  var staffEl = $('.phrase__staff');
  var slur = staffEl && $('.phrase__slur', staffEl);
  function layoutSlur() {
    if (!slur || getComputedStyle(slur).display === 'none') return;
    var notes = $$('.pillar__note', staffEl);
    if (notes.length < 2) return;
    var ends = [notes[0], notes[notes.length - 1]].map(function (n) {
      var p = n.offsetParent;
      return [p.offsetLeft + n.offsetLeft + n.offsetWidth / 2, p.offsetTop + n.offsetTop + n.offsetHeight / 2 - 20];
    });
    var s = ends[0], e = ends[1], bow = 52;
    var f = function (pt) { return pt[0].toFixed(1) + ' ' + pt[1].toFixed(1); };
    var d = 'M' + f(s) + 'C' +
      f([s[0] + (e[0] - s[0]) * 0.3, s[1] + (e[1] - s[1]) * 0.3 - bow]) + ' ' +
      f([s[0] + (e[0] - s[0]) * 0.7, s[1] + (e[1] - s[1]) * 0.7 - bow]) + ' ' + f(e);
    slur.setAttribute('viewBox', '0 0 ' + staffEl.offsetWidth + ' 140');
    $('path', slur).setAttribute('d', d);
  }

  /* ---------- ticket notches sit exactly on the perforation ---------- */
  var ticket = $('.ticket');
  function layoutTicket() {
    if (!ticket) return;
    var stub = $('.ticket__stub', ticket);
    ticket.style.setProperty('--cut-x', stub.offsetLeft + 'px');
    ticket.style.setProperty('--cut-y', stub.offsetTop + 'px');
  }

  function layout() { layoutSlur(); layoutTicket(); }
  var layoutTimer;
  layout();
  window.addEventListener('resize', function () { clearTimeout(layoutTimer); layoutTimer = setTimeout(layout, 120); });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(layout);

  /* ---------- footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
