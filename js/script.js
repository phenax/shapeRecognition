(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.EdgeDetector = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Recognizes the edges in an image on the canvas
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author Akshay Nair<phenax5@gmail.com>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _ImageProcessor = require('./ImageProcessor');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EdgeDetector = exports.EdgeDetector = function () {
	function EdgeDetector(config) {
		_classCallCheck(this, EdgeDetector);

		this.$canvas = config.canvas;
		this.ctx = this.$canvas.getContext('2d');
		this.dimen = config.dimen;
		this.isWebCam = false;

		if (!this.$canvas) {
			this.$canvas = document.createElement('canvas');
			document.body.appendChild(this.$canvas);
		}

		if (!this.dimen) {
			this.dimen = {
				width: this.canvas.width,
				height: this.canvas.height
			};
		}

		if (config.video) {
			this.isWebCam = true;
			this.$video = config.video;
		}

		this.setDimensions();

		this.renderImage = this.renderImage.bind(this);
	}

	_createClass(EdgeDetector, [{
		key: 'setDimensions',
		value: function setDimensions() {
			this.$canvas.width = this.dimen.width;
			this.$canvas.height = this.dimen.height;

			if (this.isWebCam) {
				this.$video.width = this.dimen.width;
				this.$video.height = this.dimen.height;
			}
		}
	}, {
		key: 'start',
		value: function start() {
			var _this = this;

			if (this.isWebCam) {
				this.callWebCam(function () {
					window.requestAnimationFrame(_this.renderImage);
				});
			}

			this.image = new _ImageProcessor.ImageProcessor({
				canvas: this.$canvas
			});
		}
	}, {
		key: 'callWebCam',
		value: function callWebCam(callback) {
			var _this2 = this;

			// Broswer prefixes
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

			// Ask for permissions
			navigator.getUserMedia(

			// No need for audio
			{ audio: false, video: this.dimen },

			// User allowed access
			function (stream) {
				var dataUrl = window.URL.createObjectURL(stream);

				_this2.$video.src = dataUrl;

				callback();
			},

			// Error(user denied access)
			function (err) {
				throw new Error("Something went wrong.");
			});
		}
	}, {
		key: 'renderImage',
		value: function renderImage() {
			this.ctx.drawImage(this.$video, 0, 0, this.dimen.width, this.dimen.height);

			this.image.reload();

			this.image.customFilter(4.5, 0, 1);

			this.image.renderMap();

			window.requestAnimationFrame(this.renderImage);
		}
	}]);

	return EdgeDetector;
}();

},{"./ImageProcessor":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Manipulate images or frames
 *
 * @author Akshay Nair<phenax5@gmail.com>
 */

var ImageProcessor = exports.ImageProcessor = function () {
	function ImageProcessor(config) {
		_classCallCheck(this, ImageProcessor);

		this.$canvas = config.canvas;
		this.ctx = this.$canvas.getContext('2d');

		this.reload();

		this.colorIntensity = function (r, g, b) {
			return 0.3 * r + 0.59 * g + 0.11 * b;
		};
	}

	_createClass(ImageProcessor, [{
		key: 'reload',
		value: function reload() {
			this.imageData = this.ctx.getImageData(0, 0, this.$canvas.width, this.$canvas.height);
		}
	}, {
		key: 'colorMapping',
		value: function colorMapping(callback) {
			var data = this.imageData.data;

			var j = void 0;

			for (var i = 0; i < data.length; i += 4) {
				callback(i, data);

				for (j = 0; j < 4; j++) {
					if (data[i + j] > 255) data[i + j] = 255;else if (data[i + j] < 0) data[i + j] = 0;
				}
			}
		}
	}, {
		key: 'renderMap',
		value: function renderMap() {
			this.ctx.putImageData(this.imageData, 0, 0);
		}

		/**
  * Sets the brigthness of the image on the canvas to the passed value
  *
  * @param {Number} factor  The brightness value(0 - (+inf))
  */

	}, {
		key: 'setBrightness',
		value: function setBrightness(factor) {

			// Map through all pixels and increases its brightness
			this.colorMapping(function (i, pixels) {

				// Multiply it by the brightness factor
				pixels[i] *= factor;
				pixels[i + 1] *= factor;
				pixels[i + 2] *= factor;
			});
		}

		/**
   * Desaturates the image on the canvas
   *
   * @param  {Number} factor  The amount of desaturation(0 - 1)
   */

	}, {
		key: 'desaturate',
		value: function desaturate(factor) {
			var _this = this;

			var intensity = void 0;

			/**
    * Desaturates each color value
    */
			var desat = function desat(val, i) {
				return i * factor + val * (1 - factor);
			};

			// Cycle through and desaturate
			this.colorMapping(function (i, pixels) {
				intensity = _this.colorIntensity(pixels[i], pixels[i + 1], pixels[i + 2]);

				pixels[i] = desat(pixels[i], intensity);
				pixels[i + 1] = desat(pixels[i + 1], intensity);
				pixels[i + 2] = desat(pixels[i + 2], intensity);
			});
		}

		/**
   * Saturates the image on the canvas
   *
   * @param  {Number} factor  The amount of saturation((-inf) - (+inf))
   */

	}, {
		key: 'saturate',
		value: function saturate(factor) {
			var _this2 = this;

			var intensity = void 0;

			var satur = function satur(val, i) {
				return factor * val + (1 - factor) * i;
			};

			this.colorMapping(function (i, pixels) {
				intensity = _this2.colorIntensity(pixels[i], pixels[i + 1], pixels[i + 2]);

				pixels[i] = satur(pixels[i], intensity);
				pixels[i + 1] = satur(pixels[i + 1], intensity);
				pixels[i + 2] = satur(pixels[i + 2], intensity);
			});
		}

		/**
   * Applies three filters(brghtns, sat, desat) one-by-one on the image
   * loaded in the canvas
   *
   * @param  {Number} brightness The amount of brightness to apply
   * @param  {Number} saturation The amount of saturation to apply
   * @param  {Number} desat      The amount of desaturation to apply
   */

	}, {
		key: 'customFilter',
		value: function customFilter(brightness, saturation, desat) {
			this.setBrightness(brightness);
			this.saturate(saturation);
			this.desaturate(desat);
		}
	}]);

	return ImageProcessor;
}();

},{}],3:[function(require,module,exports){
'use strict';

var _EdgeDetector = require('./EdgeDetector');

var edgeDetector = new _EdgeDetector.EdgeDetector({
    canvas: document.getElementById('edgeDetection'),
    video: document.getElementById('showWebCam'),
    dimen: {
        width: 300,
        height: 200
    }
});

edgeDetector.start();

},{"./EdgeDetector":1}]},{},[3])


//# sourceMappingURL=script.js.map
