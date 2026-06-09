(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-slide')) || 0);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var pageSearch = document.getElementById('page-search');
    var typeFilter = document.getElementById('type-filter');
    var yearFilter = document.getElementById('year-filter');
    var resetFilter = document.getElementById('reset-filter');
    var filterItems = Array.prototype.slice.call(document.querySelectorAll('.filter-target .movie-card, .filter-target .rank-row'));

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        var keyword = normalize(pageSearch && pageSearch.value);
        var typeValue = normalize(typeFilter && typeFilter.value);
        var yearValue = normalize(yearFilter && yearFilter.value);

        filterItems.forEach(function (item) {
            var text = normalize([
                item.getAttribute('data-title'),
                item.getAttribute('data-year'),
                item.getAttribute('data-region'),
                item.getAttribute('data-type'),
                item.getAttribute('data-genre'),
                item.textContent
            ].join(' '));
            var type = normalize(item.getAttribute('data-type'));
            var year = normalize(item.getAttribute('data-year'));
            var matched = true;

            if (keyword && text.indexOf(keyword) === -1) {
                matched = false;
            }
            if (typeValue && type.indexOf(typeValue) === -1) {
                matched = false;
            }
            if (yearValue && year !== yearValue) {
                matched = false;
            }

            item.classList.toggle('is-hidden', !matched);
        });
    }

    [pageSearch, typeFilter, yearFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    if (resetFilter) {
        resetFilter.addEventListener('click', function () {
            if (pageSearch) {
                pageSearch.value = '';
            }
            if (typeFilter) {
                typeFilter.value = '';
            }
            if (yearFilter) {
                yearFilter.value = '';
            }
            applyFilters();
        });
    }

    var globalInput = document.getElementById('global-search-input');
    var globalForm = document.getElementById('global-search-form');
    var resultGrid = document.getElementById('search-results');
    var searchTitle = document.getElementById('search-title');

    function movieCardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
            '<img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-shade"></span>',
            '<span class="play-chip">播放</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="movie-meta-row"><span>' + movie.year + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
            '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="tag-list">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function renderSearch(query) {
        if (!resultGrid || !window.movieSearchData) {
            return;
        }

        var keyword = normalize(query);
        var matches = window.movieSearchData.filter(function (movie) {
            var text = normalize([
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' '));
            return !keyword || text.indexOf(keyword) !== -1;
        }).slice(0, 96);

        resultGrid.innerHTML = matches.map(movieCardTemplate).join('');
        if (searchTitle) {
            searchTitle.textContent = keyword ? '搜索结果' : '推荐影片';
        }
    }

    if (globalInput && resultGrid) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        globalInput.value = initialQuery;
        renderSearch(initialQuery);
        globalInput.addEventListener('input', function () {
            renderSearch(globalInput.value);
        });
    }

    if (globalForm) {
        globalForm.addEventListener('submit', function (event) {
            event.preventDefault();
            renderSearch(globalInput ? globalInput.value : '');
        });
    }
})();
