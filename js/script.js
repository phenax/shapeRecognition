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

	/**
  * EdgeDetector
  * 
  * @param  {Object} config  Configuration
  */
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

		this.renderVideo = this.renderVideo.bind(this);
	}

	/**
  * Sets the canvas and $video element dimensions
  */


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

		/**
   * Starts rendering
   */

	}, {
		key: 'start',
		value: function start() {
			var _this = this;

			if (this.isWebCam) {
				this.callWebCam(function () {
					window.requestAnimationFrame(_this.renderVideo);
				});
			}

			this.image = new _ImageProcessor.ImageProcessor({
				canvas: this.$canvas
			});
		}

		/**
   * Asks permission for the webcam
   * 
   * @param  {Function} callback  Callback fired when access is granted
   */

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

		/**
   * Renders the video on the canvas
   */

	}, {
		key: 'renderVideo',
		value: function renderVideo() {
			this.ctx.drawImage(this.$video, 0, 0, this.dimen.width, this.dimen.height);

			this.image.reload();

			this.image.edgeDetection();

			this.image.renderMap();

			window.requestAnimationFrame(this.renderVideo);
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
 * Manipulates or frames
 *
 * @author Akshay Nair<phenax5@gmail.com>
 */

var MAX_INTENSITY = 100;
var MIN_INTENSITY = 30;

var MAX_BRIGHT = 25;
var MIN_BRIGHT = 0.7;

var MAX_FACTOR = 18;
var MIN_FACTOR = 4;

var ImageProcessor = exports.ImageProcessor = function () {

	/**
  * ImageProcessor
  * 
  * @param  {Object} config  Configuration
  */
	function ImageProcessor(config) {
		_classCallCheck(this, ImageProcessor);

		this.$canvas = config.canvas;
		this.ctx = this.$canvas.getContext('2d');

		this.reload();
	}

	/**
  * Reload the image on canvas
  */


	_createClass(ImageProcessor, [{
		key: 'reload',
		value: function reload() {
			this.imageData = this.ctx.getImageData(0, 0, this.$canvas.width, this.$canvas.height);
		}

		/**
   * Finds the color intensity of a pixel
   * 
   * @param  {Number} r  Red color value
   * @param  {Number} g  Green color value
   * @param  {Number} b  Blue color value
   * 
   * @return {Number}   Pixel intensity
   */

	}, {
		key: 'colorIntensity',
		value: function colorIntensity(r, g, b) {
			return 0.3 * r + 0.59 * g + 0.11 * b;
		}

		/**
   * Maps through all the pixels
   * 
   * @param  {Function} callback  Callback that modifies the pixels
   */

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

		/**
   * Renders the modified image on the canvas
   */

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
    * Desaturates a pixel
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

			/**
    * Saturates a pixel
    */
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
   * Applies three filters(brightness, sat, desat) on the image
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

		/**
   * Detects all the edges of the specified image
   *
   * @param  {Number} factor Grain factor
   * @param  {Array}  The color of the edges marked
   */

	}, {
		key: 'edgeMapping',
		value: function edgeMapping(factor, rgba) {
			var _this3 = this;

			var diffIsHigh = function diffIsHigh(value) {
				return value > 2.55 * factor;
			};

			this.colorMapping(function (i, pixels) {
				var horizontalDiff = Math.abs(pixels[i + 4] - pixels[i]);
				var verticalDiff = Math.abs(pixels[i + 4 * _this3.$canvas.width] - pixels[i]);

				if (diffIsHigh(horizontalDiff) || diffIsHigh(verticalDiff)) {
					pixels[i] = rgba[0];
					pixels[i + 1] = rgba[1];
					pixels[i + 2] = rgba[2];
					pixels[i + 3] = rgba[3];
				} else pixels[i + 3] = 0;
			});
		}

		/**
   * Finds the average intensity of all the pixels on the canvas
   * 
   * @return {Number}  Average Intensity
   */

	}, {
		key: 'getAverageIntensity',
		value: function getAverageIntensity() {
			var _this4 = this;

			var totalIntensity = 0;
			var numberOfPixels = this.$canvas.width * this.$canvas.height;

			this.colorMapping(function (i, pixels) {
				totalIntensity += _this4.colorIntensity(pixels[i], pixels[i + 1], pixels[i + 2]);
			});

			return totalIntensity / numberOfPixels;
		}

		/**
   * Applies the required filter adjusted for intensity
   */

	}, {
		key: 'edgeDetection',
		value: function edgeDetection() {
			var intensity = this.getAverageIntensity();

			var factor = this.edgeDetectionFactor(intensity);
			var brightness = this.brightnessFactor(intensity);

			this.customFilter(brightness, 0, 1);
			this.edgeMapping(factor, [255, 0, 0, 255]);
		}

		/**
   * Finds the brightness required mapped to the intensity
   * 
   * @param  {Number} intensity Average intensity of image
   * 
   * @return {Number}           Brightness required
   */

	}, {
		key: 'brightnessFactor',
		value: function brightnessFactor(intensity) {
			return (MAX_BRIGHT - MIN_BRIGHT) * (intensity - MIN_INTENSITY) / (MAX_INTENSITY - MIN_INTENSITY) + MIN_BRIGHT;
		}

		/**
   * Finds the edge detection factor required mapped to the intensity
   * 
   * @param  {Number} intensity Average intensity of image
   * 
   * @return {Number}           Edge detection factor required
   */

	}, {
		key: 'edgeDetectionFactor',
		value: function edgeDetectionFactor(intensity) {
			return (MAX_FACTOR - MIN_FACTOR) * (intensity - MIN_INTENSITY) / (MAX_INTENSITY - MIN_INTENSITY) + MIN_FACTOR;
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
