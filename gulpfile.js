var gulp = require('gulp');

var watch = require('gulp-watch');
var stylus = require('gulp-stylus');
var livereload = require('gulp-livereload');

var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var reactify = require('reactify');
var argv = require('yargs').argv;
var karma = require('gulp-karma');
var open = require("gulp-open");
var app = require("./contexts.js");
//var server = require('gulp-express');
var contextsPort = 9001;
var livereloadPort = 35729;

var globalShim = require('browserify-global-shim').configure({
  'moment': 'moment',
  'react': 'React',
  'jQuery': '$'
});

//var rsync = require('gulp-rsync');

var bundleName = argv.b;

//gulp.task('connect', function() {
//  connect.server({
//    root: [
//      '.tmp',
//      "shared"
//    ],
//    port: 9000,
//    livereload: true
//  });
//});





gulp.task('server', function () {
  console.log("see http://localhost:"+contextsPort+"/");

  //app.use(require('connect-livereload')({port: livereloadPort}));
  livereload.listen();
  app.listen(contextsPort);
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
    .pipe(livereload());

});


gulp.task('browserify', function(){
  browserifyfunc(false, './contexts/bundles/'+bundleName+'.jsx', 'builds', bundleName + ".js");
});
gulp.task('watchify', function () {
  browserifyfunc(true, './contexts/bundles/'+bundleName+'.jsx', '.tmp/builds', bundleName + ".js");
});

function browserifyfunc(watch, inputFile, outputDir, outputFile){
  if (!outputFile) {
    outputFile = "bundle.js";
  }
  function rebundle (bundler) {
    return bundler.bundle()
      // Log errors if they happen.
      .on('error', function(e) {
        gutil.log('Browserify Error', e.message);
      })
      .pipe(source(outputFile))
      .pipe(gulp.dest(outputDir))
      .pipe(livereload());
  }

  var b;
  if (watch){
    //console.log(watchify.args);
    var options = {};
    for (var opt in watchify.args) { options[opt] = watchify.args[opt]; }
    options.debug = true;

    b = watchify(browserify(inputFile, options));
    b.on('update', function() {
      rebundle(b)
    });
  } else {
    b = browserify(inputFile, {
      basedir: "."
    });
  }

  b.transform(reactify, {"es6": true});
  b.transform(globalShim);
  //b.require("./modules/containers/SearchDate.js", {expose: 'SearchDate'});

  return rebundle(b);
}


gulp.task('browserifyTests', function() {
  browserifyfunc(false, './tests/units/root.js', '.tmp/tests');
});

gulp.task('watchifyTests', function() {
  browserifyfunc(true, './tests/units/root.js', '.tmp/tests');
});

/* use if you don't have webstorm */
gulp.task('runKarma', function() {
  var files = [
    'shared/scripts/jquery-2.1.1.js',
    'shared/scripts/react-0.12.1/build/react-with-addons.js',
    'shared/scripts/moment-with-locales.js',
    ".tmp/tests/bundle.js"
  ];
  gulp.src(files)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch'
    }));
});
/* use if you don't have webstorm */
gulp.task('openBrowser', function() {
  var options = {
    url: "http://localhost:9876/debug.html",
    app: "chrome"
  };
  gulp.src("./just-file.html")
    .pipe(open("", {
      url: "http://localhost:9876",
      app: "chrome"
    }))
    .pipe(open("", {
      url: "http://localhost:9876/debug.html",
      app: "chrome"
    }));
});


gulp.task('test', ['watchifyTests']);

gulp.task('serve', ['server', 'stylus', 'watchify']);

gulp.task('build', ['browserify']);
