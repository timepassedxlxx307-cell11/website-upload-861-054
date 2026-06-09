(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = select('.mobile-toggle');
    var panel = select('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = selectAll('.hero-slide');
    var dots = selectAll('.hero-dot');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function initSearch() {
    var page = select('[data-search-page]');
    if (!page) {
      return;
    }
    var input = select('[data-search-input]', page);
    var region = select('[data-region-filter]', page);
    var type = select('[data-type-filter]', page);
    var year = select('[data-year-filter]', page);
    var cards = selectAll('.movie-card', page);
    var empty = select('.search-empty', page);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function matchText(card, query) {
      if (!query) {
        return true;
      }
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-genre') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
      return text.indexOf(query) !== -1;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matchText(card, query);
        if (ok && regionValue) {
          ok = card.getAttribute('data-region') === regionValue;
        }
        if (ok && typeValue) {
          ok = card.getAttribute('data-type') === typeValue;
        }
        if (ok && yearValue) {
          ok = card.getAttribute('data-year') === yearValue;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    page.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });

    apply();
  }

  function initPlayers() {
    selectAll('.js-player').forEach(function (shell) {
      var video = select('video[data-video-url]', shell);
      var cover = select('.player-cover', shell);
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-video-url') || '';
      var hlsInstance = null;
      var loaded = false;

      function load() {
        if (loaded || !source) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        load();
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', function () {
          play();
        });
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });

      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });
})();
