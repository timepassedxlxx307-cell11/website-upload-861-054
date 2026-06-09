(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.nav-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.textContent = open ? '×' : '☰';
        });
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function applyFilter(input, scope) {
        var query = normalize(input.value);
        var cards = selectAll('.movie-card', scope || document);
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search') || card.textContent);
            card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
        });
    }

    function initFilters() {
        selectAll('[data-local-filter]').forEach(function (form) {
            var input = form.querySelector('input[type="search"]');
            var scope = document.querySelector('[data-filter-scope]');
            if (!input || !scope) {
                return;
            }
            var params = new URLSearchParams(window.location.search);
            var incoming = params.get('q');
            if (incoming) {
                input.value = incoming;
                applyFilter(input, scope);
            }
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                applyFilter(input, scope);
            });
            input.addEventListener('input', function () {
                applyFilter(input, scope);
            });
        });
    }

    function initHero() {
        var slides = selectAll('.hero-slide');
        if (!slides.length) {
            return;
        }
        var dots = selectAll('.hero-dot');
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function reset() {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        }
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                reset();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                reset();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-slide'), 10) || 0);
                reset();
            });
        });
        play();
    }

    function initVideoPlayer() {
        var shell = document.querySelector('.video-shell');
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-overlay');
        var stream = shell.getAttribute('data-stream');
        var hls = null;
        var ready = false;
        function playNow() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }
        function attach(autoplay) {
            if (ready) {
                if (autoplay) {
                    playNow();
                }
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                if (autoplay) {
                    playNow();
                }
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (autoplay) {
                        playNow();
                    }
                });
                return;
            }
            video.src = stream;
            if (autoplay) {
                playNow();
            }
        }
        function start() {
            shell.classList.add('is-playing');
            attach(true);
        }
        if (button) {
            button.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        video.addEventListener('loadedmetadata', function () {
            shell.classList.add('is-playing');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initFilters();
        initHero();
        initVideoPlayer();
    });
}());
