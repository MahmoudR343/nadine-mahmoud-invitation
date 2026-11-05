(function () {
  'use strict';
  var CFG = window.WEDDING || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var T = {
    en: {
      the: 'The', family: 'Family', brideFam: 'Alhoussamy', groomFam: 'Raslan', bride: 'Nadine', groom: 'Mahmoud',
      invite: 'invite you to celebrate their children’s wedding',
      maps: 'Open in Google Maps', langName: 'English', langTo: 'Switch language', musicOn: 'Pause music', musicOff: 'Play music',
      name: 'Name(s)', guests: 'Number of guests', accept: 'Joyfully accepts', decline: 'Regretfully declines', page: 'Page'
    },
    ar: {
      the: 'عائلة', family: '', brideFam: 'الحسامي', groomFam: 'رسلان', bride: 'نادين', groom: 'محمود',
      invite: 'تتشرّفان بدعوتكم لحضور حفل زفاف ولدَيهما',
      maps: 'افتح الموقع في خرائط جوجل', langName: 'العربية', langTo: 'تغيير اللغة', musicOn: 'إيقاف الموسيقى', musicOff: 'تشغيل الموسيقى',
      name: 'الاسم', guests: 'عدد الضيوف', accept: 'نلبّي الدعوة بكل سرور', decline: 'نعتذر عن الحضور', page: 'الصفحة'
    }
  };
  var MONTHS = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ar: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول']
  };
  var DAYS = { en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] };
  var lang = 'en';
  function t(k) { return (T[lang] && T[lang][k] != null) ? T[lang][k] : ''; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function digits(s) { return lang === 'ar' ? String(s).replace(/[0-9]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }) : String(s); }

  /* ---------- date & countdown ---------- */
  function tzOffsetMin(ms, tz) {
    try {
      var p = {}; new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
        .formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
      return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - ms) / 60000;
    } catch (e) { return 180; }
  }
  var target = null, ymd = null;
  (function () {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(CFG.date || ''); if (!m) return;
    ymd = [+m[1], +m[2], +m[3]];
    var tm = /^(\d{1,2}):(\d{2})$/.exec(CFG.time || '') || [0, 0, 0];
    var guess = Date.UTC(ymd[0], ymd[1] - 1, ymd[2], +tm[1], +tm[2]);
    target = guess - tzOffsetMin(guess, CFG.timezone || 'Europe/Istanbul') * 60000;
  })();
  function renderDate() {
    if (!ymd) return;
    var wd = new Date(Date.UTC(ymd[0], ymd[1] - 1, ymd[2])).getUTCDay();
    $('#weekday').textContent = DAYS[lang][wd];
    $('#dateLine').textContent = lang === 'ar' ? digits(ymd[2] + ' ' + MONTHS.ar[ymd[1] - 1] + ' ' + ymd[0]) : MONTHS.en[ymd[1] - 1] + ' ' + ymd[2] + ', ' + ymd[0];
  }
  var cdEls = $$('.cd');
  function tick() {
    if (target == null) return;
    var s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    var v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
    cdEls.forEach(function (el) { var i = +el.getAttribute('data-u'); var n = v[i]; el.textContent = digits(i === 0 ? n : (n < 10 ? '0' + n : n)); });
  }

  /* ---------- language ---------- */
  function render() {
    var html = document.documentElement;
    html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = lang === 'ar' ? 'نادين ومحمود' : 'Nadine & Mahmoud';
    $$('[data-i]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i')); });
    $$('img[data-src-en]').forEach(function (img) {
      var src = img.getAttribute('data-src-' + lang); if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    });
    var v = (CFG.venue || {})[lang] || {};
    $('#venueName').textContent = v.name || ''; $('#venueCity').textContent = v.city || '';
    var link = (CFG.venue || {}).mapsLink || '';
    ['#mapsBtn', '#pinLink'].forEach(function (s) { var a = $(s); if (link) a.href = link; else a.removeAttribute('href'); });
    $('#langName').textContent = t('langName'); $('#langBtn').setAttribute('aria-label', t('langTo'));
    $('#rsvpName').setAttribute('aria-label', t('name')); $('#rsvpGuests').setAttribute('aria-label', t('guests'));
    $('#rsvpGuests').value = digits(($('#rsvpGuests').value || '').replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }));
    // RSVP tiles: in Arabic the "accept" tile is the right-hand one (reading order)
    var acc = lang === 'ar' ? 'R' : 'L', dec = lang === 'ar' ? 'L' : 'R';
    $('#tile' + acc).dataset.choice = 'yes'; $('#tile' + dec).dataset.choice = 'no';
    $('#tile' + acc + ' .sr').textContent = t('accept'); $('#tile' + dec + ' .sr').textContent = t('decline');
    syncTiles();
    updateMusicBtn(); buildDots(); renderDate(); tick();
  }
  function setLang(l) { lang = l === 'ar' ? 'ar' : 'en'; store('nm3-lang', lang); render(); }

  /* ---------- RSVP (display only: nothing is sent or stored) ---------- */
  var choice = null;
  function syncTiles() {
    ['L', 'R'].forEach(function (k) {
      var on = !!choice && $('#tile' + k).dataset.choice === choice;
      $('#tile' + k).setAttribute('aria-pressed', on ? 'true' : 'false');
      $('#check' + k).classList.toggle('on', on);
    });
  }
  ['L', 'R'].forEach(function (k) {
    $('#tile' + k).addEventListener('click', function () { var c = this.dataset.choice; choice = choice === c ? null : c; syncTiles(); });
  });
  $('#rsvpGuests').addEventListener('input', function () {
    var raw = this.value.replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/\D/g, '').slice(0, 2);
    this.value = digits(raw);
  });

  /* ---------- music ---------- */
  var audio = $('#music'), playing = false;
  function updateMusicBtn() { var b = $('#musicBtn'); b.setAttribute('aria-pressed', playing ? 'true' : 'false'); b.setAttribute('aria-label', playing ? t('musicOn') : t('musicOff')); }
  function fade(to, ms, cb) { var from = audio.volume, t0 = performance.now(); (function step(n) { var k = Math.min(1, (n - t0) / ms); try { audio.volume = from + (to - from) * k; } catch (e) { } if (k < 1) requestAnimationFrame(step); else if (cb) cb(); })(t0); }
  function play() {
    if (!CFG.music) return;
    if (!audio.getAttribute('src')) audio.setAttribute('src', CFG.music);
    playing = true; updateMusicBtn();
    try { audio.volume = 0; } catch (e) { }
    var pr = audio.play(); if (pr && pr.then) pr.then(function () { fade(0.6, 2500); }).catch(function () { playing = false; updateMusicBtn(); }); else fade(0.6, 2500);
  }
  function pause() { playing = false; updateMusicBtn(); fade(0, 500, function () { if (!playing) audio.pause(); }); }
  $('#musicBtn').addEventListener('click', function () { playing ? pause() : play(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && playing) { audio.pause(); } else if (!document.hidden && playing) { audio.play().catch(function () { }); } });

  /* ---------- pages, dots, reveal ---------- */
  var book = $('#book'), pages = $$('.page');
  function buildDots() {
    var nav = $('#dots'); nav.innerHTML = '';
    pages.forEach(function (p, i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', t('page') + ' ' + digits(i + 1));
      b.addEventListener('click', function () { p.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
      nav.appendChild(b);
    });
    markDot();
  }
  function markDot() {
    var mid = book.scrollTop + book.clientHeight / 2, cur = 0;
    pages.forEach(function (p, i) { if (p.offsetTop <= mid) cur = i; });
    $$('#dots button').forEach(function (b, i) { b.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
  }
  book.addEventListener('scroll', function () { requestAnimationFrame(markDot); }, { passive: true });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting && document.body.classList.contains('is-open')) e.target.classList.add('in'); });
  }, { root: book, threshold: 0.35 }) : null;
  pages.slice(1).forEach(function (p) { if (io) io.observe(p); else p.classList.add('in'); });

  /* ---------- the gate ---------- */
  var opened = false;
  function open(l) {
    if (opened) return; opened = true;
    setLang(l);
    if (CFG.playMusicOnOpen !== false) play();
    var body = document.body;
    var fast = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    body.classList.add('is-opening');
    setTimeout(function () { pages[0].classList.add('in'); }, fast ? 50 : 2750);
    setTimeout(function () {
      body.classList.remove('is-gate', 'is-opening'); body.classList.add('is-open');
      $('#controls').hidden = false; $('#dots').hidden = false;
      pages.slice(1).forEach(function (p) { var r = p.getBoundingClientRect(); if (r.top < innerHeight * .7 && r.bottom > innerHeight * .3) p.classList.add('in'); });
    }, fast ? 100 : 3450);
  }
  $$('[data-choose]').forEach(function (b) { b.addEventListener('click', function () { open(this.getAttribute('data-choose')); }); });
  $('#langBtn').addEventListener('click', function () { setLang(lang === 'ar' ? 'en' : 'ar'); });

  // first paint: remembered language decides text direction of the page behind the gate
  var saved = store('nm3-lang'); lang = saved === 'ar' ? 'ar' : 'en';
  render();
  setInterval(tick, 1000);
})();
