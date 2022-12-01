/*
 * ASCII Camera
 * http://idevelop.github.com/ascii-camera/
 *
 * Copyright 2013, Andrei Gheorghe (http://github.com/idevelop)
 * Released under the MIT license
 */
const app = (function () {
  var asciiContainer = document.getElementById("ascii");
  var capturing = false;

  camera.init({
    width: 160,
    height: 120,
    fps: 30,
    mirror: false,

    onFrame: function (canvas) {
      ascii.fromCanvas(canvas, {
        contrast: 128,
        callback: function (asciiString) {
          if (asciiContainer) asciiContainer.innerHTML = asciiString;
        },
      });
    },

    onSuccess: function () {
      const info = document.getElementById("info");
      if (info) info.style.display = "none";

      const button = document.getElementById("button");
      if (button) {
        button.style.display = "block";
        button.onclick = function () {
          if (capturing) {
            camera.pause();
            button.innerText = "resume";
          } else {
            camera.start();
            button.innerText = "pause";
          }
          capturing = !capturing;
        };
      }
    },

    onError: function () {
      // TODO: log error
    },

    onNotSupported: function () {
      const info = document.getElementById("info");
      if (info) info.style.display = "none";
      if (asciiContainer) asciiContainer.style.display = "none";
      const nS = document.getElementById("notSupported");
      if (nS) nS.style.display = "block";
    },
  });
})();
