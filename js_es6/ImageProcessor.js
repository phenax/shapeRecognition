/**
 * Manipulates or frames
 *
 * @author Akshay Nair<phenax5@gmail.com>
 */


const MAX_INTENSITY= 100;
const MIN_INTENSITY= 30;

const MAX_BRIGHT= 25;
const MIN_BRIGHT= 0.7;

const MAX_FACTOR= 18;
const MIN_FACTOR= 4;


export class ImageProcessor {

	/**
	 * ImageProcessor
	 *
	 * @param  {Object} config  Configuration
	 */
    constructor(config) {
        this.$canvas= config.canvas;
        this.ctx= this.$canvas.getContext('2d');

        this.reload();
    }


    /**
     * Reload the image on canvas
     */
    reload() {
        this.imageData=
            this.ctx.getImageData(
                0, 0,
                this.$canvas.width, this.$canvas.height
            );
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
    colorIntensity(r, g, b) {
    	return 0.3 * r + 0.59 * g + 0.11 * b;
    }


    /**
     * Maps through all the pixels
     *
     * @param  {Function} callback  Callback that modifies the pixels
     */
    colorMapping(callback) {
        const { data }= this.imageData;
        let j;

        for(let i= 0; i< data.length; i+=4) {
            callback(i, data);

            for(j= 0; j< 4; j++) {
                if(data[i + j] > 255)
        				data[i + j]= 255;
        		else if(data[i + j] < 0)
        			data[i + j]= 0;
            }
        }
    }


    /**
     * Renders the modified image on the canvas
     */
    renderMap() {
        this.ctx.putImageData(this.imageData, 0, 0);
    }


    /**
	 * Sets the brigthness of the image on the canvas to the passed value
	 *
	 * @param {Number} factor  The brightness value(0 - (+inf))
	 */
	setBrightness(factor) {

		// Map through all pixels and increases its brightness
		this.colorMapping((i, pixels)=> {

			// Multiply it by the brightness factor
			pixels[i]*=factor;
			pixels[i + 1]*=factor;
			pixels[i + 2]*=factor;
		});
	}


	/**
	 * Desaturates the image on the canvas
	 *
	 * @param  {Number} factor  The amount of desaturation(0 - 1)
	 */
	desaturate(factor) {
		let intensity;

		/**
		 * Desaturates a pixel
		 */
		const desat= (val, i)=> (i*factor + (val*(1 - factor)));

		// Cycle through and desaturate
		this.colorMapping((i, pixels)=> {
			intensity= this.colorIntensity(pixels[i], pixels[i + 1], pixels[i + 2]);

			pixels[i]= desat(pixels[i], intensity);
			pixels[i + 1]= desat(pixels[i + 1], intensity);
			pixels[i + 2]= desat(pixels[i + 2], intensity);
		});
	}



	/**
	 * Saturates the image on the canvas
	 *
	 * @param  {Number} factor  The amount of saturation((-inf) - (+inf))
	 */
	saturate(factor) {
		let intensity;

		/**
		 * Saturates a pixel
		 */
		const satur= (val, i)=> (factor*val + (1-factor)*i);

		this.colorMapping((i, pixels)=> {
			intensity= this.colorIntensity(pixels[i], pixels[i + 1], pixels[i + 2]);

			pixels[i]= satur(pixels[i], intensity);
			pixels[i + 1]= satur(pixels[i + 1], intensity);
			pixels[i + 2]= satur(pixels[i + 2], intensity);
		});
	}



	/**
	 * Applies three filters(brightness, sat, desat) on the image
	 *
	 * @param  {Number} brightness The amount of brightness to apply
	 * @param  {Number} saturation The amount of saturation to apply
	 * @param  {Number} desat      The amount of desaturation to apply
	 */
	customFilter(brightness, saturation, desat) {
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
	edgeMapping(factor, rgba) {

		const diffIsHigh= (value)=> (value > 2.55*factor);

		this.colorMapping((i, pixels) => {
			const horizontalDiff= Math.abs(pixels[i + 4] - pixels[i]);
			const verticalDiff= Math.abs(pixels[i + 4*this.$canvas.width] - pixels[i]);

			if(diffIsHigh(horizontalDiff) || diffIsHigh(verticalDiff)) {
				pixels[i]= rgba[0];
				pixels[i + 1]= rgba[1];
				pixels[i + 2]= rgba[2];
				pixels[i + 3]= rgba[3];
			} else
				pixels[i + 3]= 0;

		});
	}


	/**
	 * Finds the average intensity of all the pixels on the canvas
	 *
	 * @return {Number}  Average Intensity
	 */
	getAverageIntensity() {
		let totalIntensity= 0;
		const numberOfPixels= this.$canvas.width*this.$canvas.height;

		this.colorMapping((i, pixels)=> {
			totalIntensity+= this.colorIntensity(pixels[i], pixels[i + 1], pixels[i + 2]);
		});

		return totalIntensity/numberOfPixels;
	}



	/**
	 * Applies the required filter adjusted for intensity
	 */
	edgeDetection() {
		const intensity= this.getAverageIntensity();

		const factor= this.edgeDetectionFactor(intensity);
		const brightness= this.brightnessFactor(intensity);

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
	brightnessFactor(intensity) {
		return ((MAX_BRIGHT - MIN_BRIGHT) * (intensity - MIN_INTENSITY) /
			(MAX_INTENSITY - MIN_INTENSITY)) + MIN_BRIGHT;
	}


	/**
	 * Finds the edge detection factor required mapped to the intensity
	 *
	 * @param  {Number} intensity Average intensity of image
	 *
	 * @return {Number}           Edge detection factor required
	 */
	edgeDetectionFactor(intensity){
		return ((MAX_FACTOR - MIN_FACTOR) * (intensity - MIN_INTENSITY) /
			(MAX_INTENSITY - MIN_INTENSITY)) + MIN_FACTOR;
	}




    
}
