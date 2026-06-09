(function () {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    var forms = document.querySelectorAll('.site-search');
    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            if (value) {
                window.location.href = './search.html?q=' + encodeURIComponent(value);
            } else {
                window.location.href = './search.html';
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    if (slides.length > 1) {
        var active = 0;
        var showSlide = function (index) {
            active = index % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === active);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });
        window.setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var localInput = document.querySelector('.local-filter-input');
    if (localInput && query) {
        localInput.value = query;
    }

    var filterCards = function (value) {
        var keyword = (value || '').trim().toLowerCase();
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var visible = 0;
        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre')
            ].join(' ').toLowerCase();
            var match = !keyword || text.indexOf(keyword) !== -1;
            card.classList.toggle('hidden-card', !match);
            if (match) {
                visible += 1;
            }
        });
        var empty = document.querySelector('.empty-state');
        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    };

    if (localInput) {
        filterCards(localInput.value);
        localInput.addEventListener('input', function () {
            filterCards(localInput.value);
        });
    }
})();
