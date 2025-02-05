var camera = (function () {
    var options;
    var video, canvas, context;
    var renderTimer;
    function initVideoStream() {
        video = document.createElement("video");
        video.setAttribute("width", String(options.width));
        video.setAttribute("height", String(options.height));
        video.setAttribute("playsinline", "true");
        video.setAttribute("webkit-playsinline", "true");
        navigator.getUserMedia =
            navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia;
        window.URL =
            window.URL || window.webkitURL || window.mozURL || window.msURL;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({
                video: true,
                audio: false
            }, function (stream) {
                options.onSuccess();
                if (video.mozSrcObject !== undefined) {
                    // hack for Firefox < 19
                    video.mozSrcObject = stream;
                }
                else {
                    video.srcObject = stream;
                }
                initCanvas();
            }, options.onError);
        }
        else {
            options.onNotSupported();
        }
    }
    function initCanvas() {
        canvas = options.targetCanvas || document.createElement("canvas");
        canvas.setAttribute("width", options.width);
        canvas.setAttribute("height", options.height);
        context = canvas.getContext("2d");
        // mirror video
        if (options.mirror) {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }
    }
    function startCapture() {
        video.play();
        renderTimer = setInterval(function () {
            try {
                context.drawImage(video, 0, 0, video.width, video.height);
                options.onFrame(canvas);
            }
            catch (e) {
                // TODO
            }
        }, Math.round(1000 / options.fps));
    }
    function stopCapture() {
        pauseCapture();
        if (video.mozSrcObject !== undefined) {
            video.mozSrcObject = null;
        }
        else {
            video.srcObject = null;
        }
    }
    function pauseCapture() {
        if (renderTimer)
            clearInterval(renderTimer);
        video.pause();
    }
    return {
        init: function (captureCameraOptions) {
            var doNothing = function () { };
            options = captureCameraOptions;
            options.fps = options.fps || 30;
            options.width = options.width || 640;
            options.height = options.height || 480;
            options.mirror = options.mirror || false;
            options.targetCanvas = options.targetCanvas || null; // TODO: is the element actually a <canvas> ?
            options.onSuccess = options.onSuccess || doNothing;
            options.onError = options.onError || doNothing;
            options.onNotSupported = options.onNotSupported || doNothing;
            options.onFrame = options.onFrame || doNothing;
            initVideoStream();
        },
        start: startCapture,
        pause: pauseCapture,
        stop: stopCapture
    };
})();
