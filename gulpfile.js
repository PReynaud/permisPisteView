var gulp = require("gulp"),
	clean = require("gulp-clean"),
	http = require("http"),
	st = require("st"),
	browserify = require('browserify'),
	reactify = require('reactify'),
	source = require('vinyl-source-stream');

var path = {
	HTML: 'src/*.html',
	JS: 'src/*.jsx',
	OUT: 'app.js',
	ENTRY_POINT: 'src/index.jsx',
	DEST: 'dist'
};

gulp.task('dev', ['html', 'js', 'watch', 'server'], function(){
});

gulp.task('html', function(){
	return gulp.src(path.HTML)
        .pipe(gulp.dest(path.DEST));
});

gulp.task('js', function(){
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
	
});

gulp.task('watch', function() {
	gulp.watch(path.HTML, ['html']);
	gulp.watch(path.JS, ['js']);
});

gulp.task('server', function(done) {
  http.createServer(
    st({ path: __dirname + '/' + path.DEST, index: 'index.html', cache: false })
  ).listen(4991, done);
});

