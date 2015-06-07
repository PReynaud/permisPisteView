var gulp = require("gulp"),
	clean = require("gulp-clean"),
	http = require("http"),
	st = require("st"),
	browserify = require('browserify'),
	reactify = require('reactify'),
	source = require('vinyl-source-stream'),
	concat = require('gulp-concat'),
	mainBowerFiles = require('main-bower-files');

var path = {
	HTML: 'src/*.html',
	/*JS: 'src/*.jsx',*/
	OUT: 'app.js',
	/*ENTRY_POINT: 'src/index.jsx',*/
	DEST: 'dist',
	ALL_JS: 'src/*/*.js',
	MAIN_JS: 'src/js/app.js',
	BOWER: 'bower_components/*/*.js'
};

/*gulp.task('dev-react', ['html', 'react', 'watch-react', 'server'], function(){
});*/

gulp.task('dev', ['html', 'backbone', 'bower', 'watch', 'server'], function(){

});

gulp.task('html', function(){
	return gulp.src(path.HTML)
        .pipe(gulp.dest(path.DEST));
});

/*gulp.task('react', function(){
	return browserify({
	    entries: [path.ENTRY_POINT],
	    transform: [reactify],
	    debug: true,
	    cache: {}, 
	    packageCache: {}, 
	    fullPaths: true
	})
	    .bundle()
	    .pipe(source(path.OUT))
	    .pipe(gulp.dest(path.DEST));
	
});*/

gulp.task("backbone", function(){
	return browserify({
	    entries: [path.MAIN_JS],
	    debug: true,
	    cache: {}, 
	    packageCache: {}, 
	    fullPaths: true
	})
		.bundle()
	    .pipe(source(path.OUT))
	    .pipe(gulp.dest(path.DEST));
});

gulp.task('bower', function(){
	/*return gulp.src(mainBowerFiles)
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest(path.DEST));*/

		return gulp.src('bower_components/**/*.*')
		.pipe(gulp.dest(path.DEST));
});

/*gulp.task('watch-react', function() {
	gulp.watch(path.HTML, ['html']);
	gulp.watch(path.JS, ['js']);
});*/

gulp.task('watch', function(){
	gulp.watch(path.HTML, ['html']);
	gulp.watch(path.ALL_JS, ['backbone']);
});

gulp.task('server', function(done) {
  http.createServer(
    st({ path: __dirname + '/' + path.DEST, index: 'index.html', cache: false })
  ).listen(4991, done);
});

