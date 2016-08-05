/**
 * Manipulate images or frames
 *
 * @author Akshay Nair<phenax5@gmail.com>
 */


export class ImageProcessor {

    constructor(config) {
        this.$canvas= config.canvas;
        this.ctx= this.$canvas.getContext('2d');

        this.reload();

        this.colorIntensity= (r, g, b)=> (0.3 * r + 0.59 * g + 0.11 * b);
    }

    reload() {
        this.imageData=
            this.ctx.getImageData(
                0, 0,
                this.$canvas.width, this.$canvas.height
            );
    }

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
		 * Desaturates each color value
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

		const satur= (val, i)=> (factor*val + (1-factor)*i);

		this.colorMapping((i, pixels)=> {
			intensity= this.colorIntensity(pixels[i], pixels[i + 1], pixels[i + 2]);

			pixels[i]= satur(pixels[i], intensity);
			pixels[i + 1]= satur(pixels[i + 1], intensity);
			pixels[i + 2]= satur(pixels[i + 2], intensity);
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
	customFilter(brightness, saturation, desat) {
		this.setBrightness(brightness);
		this.saturate(saturation);
		this.desaturate(desat);
	}
}
