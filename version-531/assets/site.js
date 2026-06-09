(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
        if (!slides.length || !dots.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = next;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        setInterval(function () {
            show((index + 1) % slides.length);
        }, 5200);
    }

    function setupFilters() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-target"));
        if (!buttons.length || !cards.length) {
            return;
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var key = button.getAttribute("data-filter");
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                cards.forEach(function (card) {
                    var value = card.getAttribute("data-type") || "";
                    var match = key === "all" || value.indexOf(key) !== -1;
                    card.classList.toggle("is-hidden", !match);
                });
            });
        });
    }

    function setupSearch() {
        var input = document.querySelector("#movieSearchInput");
        var list = document.querySelector(".search-list");
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var count = document.querySelector("#searchCount");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function apply() {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var match = !keyword || text.indexOf(keyword) !== -1;
                card.classList.toggle("is-hidden", !match);
                if (match) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + " 部相关内容";
            }
        }
        input.addEventListener("input", apply);
        apply();
    }

    function hideBrokenImages() {
        Array.prototype.slice.call(document.querySelectorAll("img")).forEach(function (img) {
            img.addEventListener("error", function () {
                img.style.opacity = "0";
            });
        });
    }

    window.initMoviePlayer = function (videoUrl, videoId, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hls = null;
        if (!video || !overlay || !videoUrl) {
            return;
        }
        function attach() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
            } else {
                video.src = videoUrl;
            }
            video.setAttribute("data-ready", "1");
        }
        function start() {
            attach();
            overlay.classList.add("is-hidden");
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }
        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                overlay.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearch();
        hideBrokenImages();
    });
}());
