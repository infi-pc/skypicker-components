var gulp = require('gulp');

var watch = require('gulp-watch');
var stylus = require('gulp-stylus');
var livereload = require('gulp-livereload');

var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var reactify = require('reactify');
var connect = require('gulp-connect');
var argv = require('yargs').argv;

var globalShim = require('browserify-global-shim').configure({
  'moment': 'moment',
  'react': 'React',
  'jQuery': '$'
});

//var rsync = require('gulp-rsync');

var contextName = argv.c;
var config = {
  app: 'contexts/'+contextName,
  dist: 'dist'
};

gulp.task('connect', function() {
  connect.server({
    root: [
      '.tmp',
      config.app,
      "shared"
    ],
    port: 9000,
    livereload: true
  });
});

gulp.task('stylus', function () {
  var src = './shared/styles/modules/*.styl';
  var dest = './.tmp/styles/modules/';

  gulp.src(src)
    .pipe(stylus())
    .pipe(gulp.dest(dest));

  watch(src)
    .pipe(stylus())
    .pipe(gulp.dest(dest))
    .pipe(connect.reload());

});


gulp.task('browserify', function(){
  browserifyfunc(false, 'builds/'+contextName+'/scripts');
});
gulp.task('watchify', function () {
  browserifyfunc(true, '.tmp/scripts');
});

function browserifyfunc(watch, dir){
  function rebundle (bundler) {
    return bundler.bundle()
      // Log errors if they happen.
      .on('error', function(e) {
        gutil.log('Browserify Error', e.message);
      })
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(dir))
      .pipe(connect.reload());
  }

  var b;
  var path = './contexts/'+contextName+'/root.jsx';
  if (watch){
    //console.log(watchify.args);
    b = watchify(browserify('./contexts/'+contextName+'/root.jsx', watchify.args));
    b.on('update', function() {
      rebundle(b)
    });
  } else {
    b = browserify(path, {
      basedir: "."
    });
  }

  b.transform(reactify);
  b.transform(globalShim);
  //b.require("./modules/containers/SearchDate.js", {expose: 'SearchDate'});

  return rebundle(b);
}



//gulp.task('deploy', function() {
//  gulp.src('build/**')
//    .pipe(rsync({
//      root: './../..',
//      hostname: 'alpha.whichairline.com',
//      destination: '/var/www/Whichairline'
//    }));
//});

gulp.task('serve', ['connect', 'stylus', 'watchify']);

gulp.task('build', ['browserify']);
