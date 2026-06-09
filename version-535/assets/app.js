(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initSearch() {
    var panel = document.querySelector("[data-search-panel]");
    var input = document.querySelector("[data-site-search]");
    var results = document.querySelector("[data-search-results]");
    var openers = document.querySelectorAll("[data-open-search]");
    var closer = document.querySelector("[data-close-search]");
    if (!panel || !input || !results) {
      return;
    }

    function openPanel() {
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
      setTimeout(function () {
        input.focus();
      }, 30);
    }

    function closePanel() {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
    }

    function render(query) {
      var value = query.trim().toLowerCase();
      results.innerHTML = "";
      if (!value) {
        return;
      }
      var list = (window.MOVIE_SEARCH || []).filter(function (item) {
        return item.search.indexOf(value) !== -1;
      }).slice(0, 12);
      list.forEach(function (item) {
        var link = document.createElement("a");
        var image = document.createElement("img");
        var wrap = document.createElement("span");
        var title = document.createElement("strong");
        var meta = document.createElement("span");
        link.className = "search-result";
        link.href = item.url;
        image.src = item.cover;
        image.alt = item.title;
        title.textContent = item.title;
        meta.textContent = item.meta;
        wrap.appendChild(title);
        wrap.appendChild(meta);
        link.appendChild(image);
        link.appendChild(wrap);
        results.appendChild(link);
      });
    }

    openers.forEach(function (button) {
      button.addEventListener("click", openPanel);
    });
    if (closer) {
      closer.addEventListener("click", closePanel);
    }
    panel.addEventListener("click", function (event) {
      if (event.target === panel) {
        closePanel();
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closePanel();
      }
    });
    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initLocalFilter() {
    var input = document.querySelector("[data-filter-input]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        card.classList.toggle("hidden-by-filter", value && text.indexOf(value) === -1);
      });
    });
  }

  function initPlayer() {
    var players = document.querySelectorAll(".player-box");
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".player-start");
      var url = box.getAttribute("data-video");
      var hls = null;
      if (!video || !button || !url) {
        return;
      }

      function attach() {
        if (box.getAttribute("data-ready") === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        box.setAttribute("data-ready", "1");
      }

      function play() {
        attach();
        box.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!box.classList.contains("is-playing")) {
          play();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initSearch();
    initHero();
    initLocalFilter();
    initPlayer();
  });
})();
