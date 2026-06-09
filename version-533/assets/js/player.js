function initPlayer(sourceUrl) {
    var video = document.getElementById('video-player');
    var button = document.getElementById('play-button');
    var hlsInstance = null;
    var loaded = false;

    if (!video || !sourceUrl) {
        return;
    }

    function loadSource() {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function playVideo() {
        loadSource();
        if (button) {
            button.classList.add('hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (button) {
                    button.classList.remove('hidden');
                }
            });
        }
    }

    if (button) {
        button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener('play', function () {
        if (button) {
            button.classList.add('hidden');
        }
    });

    video.addEventListener('ended', function () {
        if (button) {
            button.classList.remove('hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
