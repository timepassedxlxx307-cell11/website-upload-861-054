(function () {
    var mobileButton = document.querySelector(".mobile-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");
    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener("click", function () {
            mobilePanel.hidden = !mobilePanel.hidden;
        });
    }

    var searchToggle = document.querySelector(".nav-search-toggle");
    var searchPanel = document.querySelector(".nav-search-panel");
    var globalSearch = document.getElementById("global-search");
    if (searchToggle && searchPanel && globalSearch) {
        searchToggle.addEventListener("click", function () {
            searchPanel.hidden = !searchPanel.hidden;
            if (!searchPanel.hidden) {
                globalSearch.focus();
            }
        });
        globalSearch.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                var value = globalSearch.value.trim();
                if (value) {
                    window.location.href = "./search.html?q=" + encodeURIComponent(value);
                }
            }
        });
    }

    document.querySelectorAll("img").forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("image-missing");
        });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var activeIndex = 0;
        var timer;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === activeIndex);
            });
        }

        function startAuto() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5000);
        }

        if (previous) {
            previous.addEventListener("click", function () {
                showSlide(activeIndex - 1);
                startAuto();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(activeIndex + 1);
                startAuto();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startAuto();
            });
        });

        showSlide(0);
        startAuto();
    }

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage) {
        var keyword = document.getElementById("search-keyword");
        var region = document.getElementById("search-region");
        var type = document.getElementById("search-type");
        var category = document.getElementById("search-category");
        var status = document.getElementById("search-status");
        var cards = Array.prototype.slice.call(searchPage.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (keyword && query) {
            keyword.value = query;
        }

        function textOf(card) {
            return [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.category,
                card.dataset.tags,
                card.textContent
            ].join(" ").toLowerCase();
        }

        function applyFilter() {
            var term = keyword ? keyword.value.trim().toLowerCase() : "";
            var regionValue = region ? region.value : "";
            var typeValue = type ? type.value : "";
            var categoryValue = category ? category.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var matched = true;
                if (term && textOf(card).indexOf(term) === -1) {
                    matched = false;
                }
                if (regionValue && card.dataset.region !== regionValue) {
                    matched = false;
                }
                if (typeValue && card.dataset.type !== typeValue) {
                    matched = false;
                }
                if (categoryValue && card.dataset.category !== categoryValue) {
                    matched = false;
                }
                card.classList.toggle("is-filtered", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (status) {
                status.textContent = visible > 0 ? "已筛选出匹配影片" : "没有找到匹配影片";
            }
        }

        [keyword, region, type, category].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        applyFilter();
    }
})();
