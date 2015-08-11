var gulp = require('gulp'),
	stylus = require('gulp-stylus'),
	watch = require('gulp-watch'),
	uglify = require('gulp-uglify'),
	browserSync = require('browser-sync'),
	reload      = browserSync.reload,
	paths = {
	  stylus: './_gulp/css/**/*.styl',
	  scripts: './_gulp/js/**/*.js'
	};

var config = {
	open : true,
	logFileChanges : true
}

browserSync(config);

gulp.src([ './package.json']);

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('live-reload', function() {
    gulp.watch(paths.stylus, ['stylus']);
    gulp.watch(paths.scripts, ['uglify']);
});

gulp.task('stylus', function() {
  gulp.src(paths.stylus)
    .pipe(stylus())
    .pipe(gulp.dest('./assets/css'))
    .pipe(reload({stream:true}));

});

gulp.task('uglify', function() {
  gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(gulp.dest('./assets/js'))
    .pipe(reload({stream:true}));
});

gulp.task('watch', function() {
  gulp.watch(paths.stylus, ['stylus']);
  gulp.watch(paths.scripts, ['uglify']);
});


gulp.task('default', ['stylus','uglify','live-reload']);
