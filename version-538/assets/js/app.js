(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var index = 0;
    var timer = null;
    function setSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot) {
        dot.classList.toggle('active', Number(dot.getAttribute('data-hero-dot')) === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    setSlide(0);
    start();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initSearchAndFilters() {
    var inputs = selectAll('[data-search]');
    var cards = selectAll('[data-card]');
    var chips = selectAll('[data-filter]');
    var empty = document.querySelector('[data-empty-state]');
    var activeFilter = 'all';
    function currentQuery() {
      var values = inputs.map(function (input) {
        return normalize(input.value);
      }).filter(Boolean);
      return values.length ? values[0] : '';
    }
    function apply() {
      var query = currentQuery();
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = activeFilter === 'all' || text.indexOf(normalize(activeFilter)) !== -1;
        var show = matchQuery && matchFilter;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0 && cards.length > 0);
      }
    }
    inputs.forEach(function (input) {
      input.addEventListener('input', apply);
    });
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = chip.getAttribute('data-filter') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        apply();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearchAndFilters();
  });
})();
