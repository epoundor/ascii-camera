/*
	camera.js v1.1
	http://github.com/idevelop/camera.js

	Author: Andrei Gheorghe (http://idevelop.github.com)
	License: MIT
*/
interface Navigator {
  getUserMedia(
    options: { video?: boolean; audio?: boolean },
    success: (stream: any) => void,
    error?: (error: string) => void
  ): void;

  webkitGetUserMedia(
    options: { video?: boolean; audio?: boolean },
    success: (stream: any) => void,
    error?: (error: string) => void
  ): void;

  mozGetUserMedia(
    options: { video?: boolean; audio?: boolean },
    success: (stream: any) => void,
    error?: (error: string) => void
  ): void;

  msGetUserMedia(
    options: { video?: boolean; audio?: boolean },
    success: (stream: any) => void,
    error?: (error: string) => void
  ): void;
}

interface Window {
  mozURL: {
    new (url: string | URL, base?: string | URL | undefined): URL;
    prototype: URL;
    createObjectURL(obj: MediaSource | Blob): string;
    revokeObjectURL(url: string): void;
  };

  msURL: {
    new (url: string | URL, base?: string | URL | undefined): URL;
    prototype: URL;
    createObjectURL(obj: MediaSource | Blob): string;
    revokeObjectURL(url: string): void;
  };
}

interface HTMLVideoElement {
  mozSrcObject: MediaProvider | null;
}

interface CameraOption {
  width: number;
  height: number;
  onSuccess: () => void;
  onError: (error) => void;
  onNotSupported: () => void;
  targetCanvas?: HTMLCanvasElement | null;
  mirror: boolean;
  onFrame: (arg0: any) => void;
  fps: number;
}
var camera = (function () {
  var options: CameraOption;
  var video: HTMLVideoElement,
    canvas: {
      setAttribute: (arg0: string, arg1: any) => void;
      getContext: (arg0: string) => any;
      width: any;
    },
    context: {
      translate: (arg0: any, arg1: number) => void;
      scale: (arg0: number, arg1: number) => void;
      drawImage: (
        arg0: any,
        arg1: number,
        arg2: number,
        arg3: any,
        arg4: any
      ) => void;
    };
  var renderTimer: string | number | NodeJS.Timer | undefined;

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
      navigator.getUserMedia(
        {
          video: true,
          audio: false,
        },
        function (stream: any) {
          options.onSuccess();

          if (video.mozSrcObject !== undefined) {
            // hack for Firefox < 19
            video.mozSrcObject = stream;
          } else {
            video.srcObject = stream;
          }

          initCanvas();
        },
        options.onError
      );
    } else {
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
      } catch (e) {
        // TODO
      }
    }, Math.round(1000 / options.fps));
  }

  function stopCapture() {
    pauseCapture();

    if (video.mozSrcObject !== undefined) {
      video.mozSrcObject = null;
    } else {
      video.srcObject = null;
    }
  }

  function pauseCapture() {
    if (renderTimer) clearInterval(renderTimer);
    video.pause();
  }

  return {
    init: function (captureCameraOptions: CameraOption) {
      var doNothing = function () {};

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

    stop: stopCapture,
  };
})();
