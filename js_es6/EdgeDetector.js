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
		}

		this.image= new ImageProcessor({
			canvas: this.$canvas
		});
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
	 * Renders the video on the canvas
	 */
	renderVideo() {
		this.ctx.drawImage(this.$video, 0, 0, this.dimen.width, this.dimen.height);

		this.image.reload();

		this.image.edgeDetection();

		this.image.renderMap();

		window.requestAnimationFrame(this.renderVideo);
	}
}
