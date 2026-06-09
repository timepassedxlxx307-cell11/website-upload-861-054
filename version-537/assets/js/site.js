(function() {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileNav() {
        var toggle = document.querySelector('.mobile-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function() {
            var isHidden = nav.hasAttribute('hidden');
            if (isHidden) {
                nav.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
                toggle.textContent = '×';
            } else {
                nav.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.textContent = '☰';
            }
        });
    }

    function setupHero() {
        var slides = selectAll('[data-hero-slide]');
        var dots = selectAll('[data-hero-dot]');
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, position) {
                slide.classList.toggle('is-active', position === current);
            });
            dots.forEach(function(dot, position) {
                dot.classList.toggle('is-active', position === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function(dot, position) {
            dot.addEventListener('click', function() {
                show(position);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function() {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                show(current + 1);
                start();
            });
        }

        start();
    }

    function setupFilters() {
        var panels = selectAll('.filter-panel');
        panels.forEach(function(panel) {
            var container = panel.parentElement;
            var cards = selectAll('[data-title]', container);
            var inputs = selectAll('[data-filter]', panel);
            var empty = panel.querySelector('.filter-empty');
            if (!cards.length || !inputs.length) {
                return;
            }

            var params = new URLSearchParams(window.location.search);
            var preset = params.get('q');
            if (preset) {
                inputs.forEach(function(input) {
                    if (input.getAttribute('data-filter') === 'text') {
                        input.value = preset;
                    }
                });
            }

            function valueFor(name) {
                var input = panel.querySelector('[data-filter="' + name + '"]');
                return input ? input.value.trim().toLowerCase() : '';
            }

            function apply() {
                var text = valueFor('text');
                var year = valueFor('year');
                var type = valueFor('type');
                var region = valueFor('region');
                var shown = 0;

                cards.forEach(function(card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-category'),
                        card.textContent
                    ].join(' ').toLowerCase();

                    var ok = true;
                    if (text && haystack.indexOf(text) === -1) {
                        ok = false;
                    }
                    if (year && String(card.getAttribute('data-year')).toLowerCase() !== year) {
                        ok = false;
                    }
                    if (type && String(card.getAttribute('data-type')).toLowerCase().indexOf(type) === -1) {
                        ok = false;
                    }
                    if (region && String(card.getAttribute('data-region')).toLowerCase().indexOf(region) === -1) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        shown += 1;
                    }
                });

                if (empty) {
                    empty.hidden = shown !== 0;
                }
            }

            inputs.forEach(function(input) {
                input.addEventListener('input', apply);
                input.addEventListener('change', apply);
            });
            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        setupMobileNav();
        setupHero();
        setupFilters();
    });
})();
