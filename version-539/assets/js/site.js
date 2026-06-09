(function () {
  function one(s, r) { return (r || document).querySelector(s); }
  function all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function text(v) { return String(v || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function menu() {
    var b = one('[data-menu-toggle]'), p = one('[data-mobile-menu]');
    if (b && p) b.addEventListener('click', function () { p.classList.toggle('is-open'); });
  }
  function hero() {
    var h = one('[data-hero]');
    if (!h) return;
    var slides = all('[data-hero-slide]', h), dots = all('[data-hero-dot]', h), i = 0, timer;
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, x) { s.classList.toggle('is-active', x === i); });
      dots.forEach(function (d, x) { d.classList.toggle('is-active', x === i); });
    }
    function run() { clearInterval(timer); timer = setInterval(function () { show(i + 1); }, 5000); }
    var prev = one('[data-hero-prev]', h), next = one('[data-hero-next]', h);
    if (prev) prev.addEventListener('click', function () { show(i - 1); run(); });
    if (next) next.addEventListener('click', function () { show(i + 1); run(); });
    dots.forEach(function (d, x) { d.addEventListener('click', function () { show(x); run(); }); });
    show(0); run();
  }
  function localFilter() {
    all('[data-filter-panel]').forEach(function (panel) {
      var kw = one('[data-local-filter]', panel), region = one('[data-filter-region]', panel), type = one('[data-filter-type]', panel), cards = all('[data-card]');
      function apply() {
        var q = (kw && kw.value || '').trim().toLowerCase(), r = (region && region.value || '').trim(), t = (type && type.value || '').trim();
        cards.forEach(function (card) {
          var hay = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre].join(' ').toLowerCase();
          var ok = (!q || hay.indexOf(q) !== -1) && (!r || (card.dataset.region || '').indexOf(r) !== -1) && (!t || (card.dataset.type || '').indexOf(t) !== -1 || (card.dataset.genre || '').indexOf(t) !== -1);
          card.classList.toggle('hidden-card', !ok);
        });
      }
      [kw, region, type].forEach(function (el) { if (el) { el.addEventListener('input', apply); el.addEventListener('change', apply); } });
    });
  }
  function searchPage() {
    var box = one('[data-search-results]'), form = one('[data-search-form]');
    if (!box || !form || !window.MOVIE_INDEX) return;
    var q = one('[name="q"]', form), region = one('[name="region"]', form), type = one('[name="type"]', form), empty = one('[data-search-empty]'), p = new URLSearchParams(location.search);
    q.value = p.get('q') || ''; region.value = p.get('region') || ''; type.value = p.get('type') || '';
    function card(m) {
      var tags = m.tags.slice(0, 3).map(function (v) { return '<span class="tag">' + text(v) + '</span>'; }).join('');
      return '<article class="movie-card"><a class="poster-link" href="' + text(m.url) + '"><img src="' + text(m.cover) + '" alt="' + text(m.title) + '" loading="lazy"><span class="rating-badge">★ ' + text(m.rating) + '</span><span class="play-chip">播放</span></a><div class="movie-card-body"><h3><a href="' + text(m.url) + '">' + text(m.title) + '</a></h3><p class="card-meta">' + text(m.year) + ' · ' + text(m.region) + ' · ' + text(m.type) + '</p><p class="card-desc">' + text(m.oneLine) + '</p><div class="mini-tags">' + tags + '</div></div></article>';
    }
    function apply() {
      var a = q.value.trim().toLowerCase(), r = region.value.trim(), t = type.value.trim();
      var found = window.MOVIE_INDEX.filter(function (m) {
        var hay = [m.title, m.region, m.type, m.year, m.genre, m.oneLine, m.tags.join(' ')].join(' ').toLowerCase();
        return (!a || hay.indexOf(a) !== -1) && (!r || m.region.indexOf(r) !== -1) && (!t || m.type.indexOf(t) !== -1 || m.genre.indexOf(t) !== -1);
      }).slice(0, 96);
      box.innerHTML = found.map(card).join('');
      if (empty) empty.classList.toggle('is-visible', found.length === 0);
    }
    form.addEventListener('submit', function (ev) { ev.preventDefault(); apply(); });
    [q, region, type].forEach(function (el) { el.addEventListener('input', apply); el.addEventListener('change', apply); });
    apply();
  }
  function players() {
    all('[data-player]').forEach(function (frame) {
      var src = frame.dataset.src, video = one('video', frame), overlay = one('[data-play-overlay]', frame), hls;
      if (!src || !video) return;
      function attach(done) {
        if (video.dataset.loaded === 'true') { done(); return; }
        video.dataset.loaded = 'true';
        if (video.canPlayType('application/vnd.apple.mpegurl')) { video.src = src; done(); return; }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src); hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, done);
          setTimeout(done, 1500);
          return;
        }
        video.src = src; done();
      }
      function play() {
        attach(function () {
          if (overlay) overlay.classList.add('is-hidden');
          var p = video.play();
          if (p && p.catch) p.catch(function () {});
        });
      }
      if (overlay) overlay.addEventListener('click', play);
      video.addEventListener('play', function () { if (overlay) overlay.classList.add('is-hidden'); });
      addEventListener('beforeunload', function () { if (hls) hls.destroy(); });
    });
  }
  document.addEventListener('DOMContentLoaded', function () { menu(); hero(); localFilter(); searchPage(); players(); });
})();
