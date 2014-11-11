var gulp = require('gulp');

var watch = require('gulp-watch');
var stylus = require('gulp-stylus');
var livereload = require('gulp-livereload');
//var rsync = require('gulp-rsync');


gulp.task('stylus', function () {
  watch('./app/styles/modules/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./app/styles/modules/'));
});


//gulp.task('deploy', function() {
//  gulp.src('build/**')
//    .pipe(rsync({
//      root: './../..',
//      hostname: 'alpha.whichairline.com',
//      destination: '/var/www/Whichairline'
//    }));
//});

gulp.task('default', function() {
  // place code for your default task here
});
