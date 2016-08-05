/**
 * Recognizes the edges in an image on the canvas
 *
 * @author Akshay Nair<phenax5@gmail.com>
 */


import { ImageProcessor } from './ImageProcessor';


export class EdgeDetector {

	/**
	 * EdgeDetector
	 *
	 * @param  {Object} config  Configuration
	 */
	constructor(config) {
		this.$canvas= config.canvas;
		this.ctx= this.$canvas.getContext('2d');
		this.dimen= config.dimen;
		this.isWebCam= false;

		if(!this.$canvas) {
			this.$canvas= document.createElement('canvas');
			document.body.appendChild(this.$canvas);
		}

		if(!this.dimen) {
			this.dimen= {
				width: this.canvas.width,
				height: this.canvas.height
			};
		}

		if(config.video) {
			this.isWebCam= true;
			this.$video= config.video;
		} else {
			this.imageSrc= config.image;
		}

		this.setDimensions();

		this.renderVideo= this.renderVideo.bind(this);
	}



	/**
	 * Sets the canvas and $video element dimensions
	 */
	setDimensions() {
		this.$canvas.width= this.dimen.width;
		this.$canvas.height= this.dimen.height;

		if(this.isWebCam) {
			this.$video.width= this.dimen.width;
			this.$video.height= this.dimen.height;
		}
	}



	/**
	 * Starts rendering
	 */
	start() {
		if(this.isWebCam) {
			this.callWebCam(()=> {
				window.requestAnimationFrame(this.renderVideo);
			});
		} else {
			this.loadImage(this.imageSrc);
		}

		this.image= new ImageProcessor({
			canvas: this.$canvas
		});
	}


	/**
	 * Loads an image to the canvas and renders edges
	 *
	 * @param  {string} src  The location of the image
	 */
	loadImage(src) {

		// Create an image object
		const img= new Image();

		img.src= src;

		// After image is done loading, render it on the canvas
		img.onload= ()=> {
			this.renderImage(img);
		};

	}



	/**
	 * Asks permission for the webcam
	 *
	 * @param  {Function} callback  Callback fired when access is granted
	 */
	callWebCam(callback) {

		// Broswer prefixes
		navigator.getUserMedia=
			navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia;

		// Ask for permissions
		navigator.getUserMedia(

			// No need for audio
			{ audio: false, video: this.dimen},

			// User allowed access
			(stream)=> {

				const dataUrl= window.URL.createObjectURL(stream);

				// Load video
				this.$video.src= dataUrl;

				callback();
			},

			// Error(user denied access)
			(err)=> {
				throw new Error("Something went wrong.");
			}
		);
	}




	/**
	* Processes one frame on the canvas and detects their edges
	*/
	frameProcessing() {

		// Reloads the canvas into the image processor
		this.image.reload();

		// Marks the edges of the image
		this.image.edgeDetection();

		// Renders the final image on the canvas
		this.image.renderMap();
	}





	/**
	 * Renders the video on the canvas
	 */
	renderVideo() {

		// Draw the video frame on the board
		this.ctx.drawImage(this.$video, 0, 0, this.dimen.width, this.dimen.height);

		// Process current frame
		this.frameProcessing();

		// Next frame
		window.requestAnimationFrame(this.renderVideo);
	}




	/**
	 * Renders an image on the canvas
	 *
	 * @param  {Image} img  The image object to load to the canvas
	 */
	renderImage(img) {

		// Draw the image on the canvas
		this.ctx.drawImage(img, 0, 0, this.dimen.width, this.dimen.height);

		// Process this frame(only once)
		this.frameProcessing();
	}



	matchTemplate(config) {
		
	}
}
