(function () {
  function initBox(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.player-start');
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var loaded = false;
    var hls = null;
    function load() {
      if (loaded || !stream) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ autoStartLoad: true, enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      loaded = true;
    }
    function play() {
      load();
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }
    button.addEventListener('click', function () {
      button.classList.add('is-hidden');
      play();
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      button.classList.remove('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initBox);
  });
})();
