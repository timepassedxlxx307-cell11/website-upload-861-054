(function () {
    var configTag = document.getElementById("player-config");
    var frame = document.querySelector("[data-player]");
    if (!configTag || !frame) {
        return;
    }

    var video = frame.querySelector("video");
    var trigger = frame.querySelector("[data-play-trigger]");
    if (!video) {
        return;
    }

    var config;
    try {
        config = JSON.parse(configTag.textContent || "{}");
    } catch (error) {
        config = {};
    }

    var source = config.src || "";
    var ready = false;
    var hlsInstance = null;

    function prepare() {
        if (ready || !source) {
            return;
        }
        ready = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            return;
        }
        video.src = source;
    }

    function start() {
        if (trigger) {
            trigger.classList.add("is-hidden");
        }
        prepare();
        var playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(function () {
                video.controls = true;
            });
        }
    }

    if (trigger) {
        trigger.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener("play", function () {
        if (trigger) {
            trigger.classList.add("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
})();
