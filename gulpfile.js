const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const babel = require('babelify');


const FLAGS= {
	filename: "-f",
	presets: "-p"
};

const BUILD_DIR= "./js";
const FILE_DIR= "./js_es6";

let babelPresets= [ "es2015" ];
let fileName= "script.js";



for(let i= 0; i< process.argv.length; i++) {
	switch(process.argv[i]) {
		case FLAGS.filename:
			if(i + 1 < process.argv.length)
				fileName= process.argv[i + 1];
			break;
		case FLAGS.presets:
			if(i + 1 < process.argv.length)
				babelPresets= (process.argv[i + 1]).split(",");
			break;
	}
}



function compileJS(watch) {
	const bundler = watchify(browserify({
			entries: [`${FILE_DIR}/${fileName}`],
			debug: true,
			extensions: [' ', 'js', 'jsx']
		}).transform(babel.configure({
			presets: babelPresets
		}))
	);

	function rebundle() {
		bundler.bundle()
			.on('error', (err)=> { console.error(err); this.emit('end'); })
			.pipe(source(fileName))
			.pipe(buffer())
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest(BUILD_DIR));
	}

	if (watch) {
		bundler.on('update', function() {
			console.log(`-> Bundling ${BUILD_DIR}...`);
			rebundle();
		});
	}

	rebundle();
}

function watchJS() {
	return compileJS(true);
};



gulp.task('buildJS', ()=> compileJS());

gulp.task('watchJS', watchJS);


gulp.task('default', ['watchJS', 'watchSASS']);
