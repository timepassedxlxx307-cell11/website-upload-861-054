(function() {
    function loadHlsScript(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1';
        script.setAttribute('data-hls-loader', 'true');
        script.addEventListener('load', callback, { once: true });
        document.head.appendChild(script);
    }

    window.initializeMoviePlayer = function(videoUrl) {
        var shell = document.querySelector('[data-player-shell]');
        var video = shell ? shell.querySelector('video') : null;
        var button = shell ? shell.querySelector('[data-player-button]') : null;
        var hls = null;
        var ready = false;

        if (!shell || !video || !button || !videoUrl) {
            return;
        }

        function markPlaying() {
            shell.classList.add('is-playing');
        }

        function safePlay() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(markPlaying).catch(function() {
                    shell.classList.remove('is-playing');
                });
            } else {
                markPlaying();
            }
        }

        function attachWithHls() {
            if (!window.Hls || !window.Hls.isSupported()) {
                video.src = videoUrl;
                safePlay();
                ready = true;
                return;
            }
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                safePlay();
            });
            ready = true;
        }

        function start() {
            markPlaying();
            if (ready) {
                safePlay();
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
                ready = true;
                safePlay();
                return;
            }
            loadHlsScript(attachWithHls);
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function() {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', markPlaying);
        video.addEventListener('pause', function() {
            if (!video.ended) {
                shell.classList.remove('is-playing');
            }
        });
        window.addEventListener('beforeunload', function() {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
