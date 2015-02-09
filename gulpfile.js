var gulp = require('gulp');

var watch = require('gulp-watch');
var stylus = require('gulp-stylus');
var livereload = require('gulp-livereload');

var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var reactify = require('reactify');
var strictify = require('strictify');

var argv = require('yargs').argv;
var karma = require('gulp-karma');
var open = require("gulp-open");
var rename = require("gulp-rename");

var app = require("./contexts.js");
//var server = require('gulp-express');
var contextsPort = 9001;
var livereloadPort = 35730;

var globalShim = require('browserify-global-shim').configure({
  'moment': 'moment',
  'react': 'React',
  'jQuery': '$'
});

//var rsync = require('gulp-rsync');

var bundleName = argv.bundle;

function browserifyfunc(watch, enableLivereload, inputFile, outputDir, outputFile){
  if (!outputFile) {
    outputFile = "bundle.js";
  }
  function rebundle (bundler) {
    var bundle = bundler.bundle()
      // Log errors if they happen.
      .on('error', function(e) {
        gutil.log('Browserify Error', e.message);
      })
      .pipe(source(outputFile))
      .pipe(gulp.dest(outputDir));
    if (enableLivereload) {
      return bundle.pipe(livereload());
    } else {
      return bundle;
    }
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
  b.transform(strictify);

  b.transform(globalShim);
  //b.require("./modules/containers/SearchDate.js", {expose: 'SearchDate'});

  return rebundle(b);
}


gulp.task('server', function () {
  console.log("see http://localhost:"+contextsPort+"/");

  //app.use(require('connect-livereload')({port: livereloadPort}));
  livereload.listen(livereloadPort);
  app.listen(contextsPort);
});

gulp.task('stylus', function () {
  var src = './shared/styles/modules/*.styl';
  var dest = './.tmp/styles/modules/';

  gulp.src(src)
    .pipe(stylus())
    .pipe(gulp.dest(dest))
    .pipe(livereload());

});

gulp.task('stylusWatch', function () {
  var src = './shared/styles/modules/**/*.styl';
  watch(src, function () {
    gulp.start('stylus');
  });
});

gulp.task('browserify', function(){
  browserifyfunc(false, false, './modules/bundles/'+bundleName+'.jsx', 'builds', bundleName + ".js");
});

gulp.task('watchify', function () {
  browserifyfunc(true, true, './contexts/scripts/'+bundleName+'.jsx', '.tmp/builds', bundleName + ".js");
});

//gulp.task('browserifyTests', function() {
//  browserifyfunc(false, false, './tests/units/root.js', '.tmp/tests');
//});

gulp.task('test', function() {
  browserifyfunc(true, true, './tests/units/root.js', '.tmp/tests');
});

gulp.task('export', function () {
  var bundleInProject, cssInProject;
  var projectPath = argv.path;
  //TODO use path to copying .js and .styl files


  var project = argv.project;

  browserifyfunc(true, false, './exports/'+project+'.jsx', "./builds/skypicker", "components.js");

  console.log(projectPath);

  var styleFolder = "./shared/styles/modules";
  function copyCss() {
    gulp.src(styleFolder+'/**/*.styl', {base: styleFolder})
      .pipe(gulp.dest(projectPath + '/node_modules/skypicker-components/shared/styles/modules'));
  }

  copyCss();
  watch(styleFolder+'/**/*.styl', function () {
    copyCss();
  });


  var jsFolder = "./builds/skypicker";
  function copyJs() {
    gulp.src(jsFolder+'/**/*.js', {base: jsFolder})
      .pipe(gulp.dest(projectPath + '/node_modules/skypicker-components/builds/skypicker'));
  }

  copyJs();
  watch(jsFolder+'/**/*.js', function () {
    copyJs();
  });

  //TODO add copying .styl files into bower_components in skypicker
  //watch('./shared/styles/modules/**/*.styl', function () {
  //  gulp.src("./shared/styles/modules/"+project+".styl")
  //    .pipe(stylus())
  //    .pipe(rename("components.css"))
  //    .pipe(gulp.dest("./builds/skypicker/components" + cssInProject));
  //});
});


gulp.task('serve', ['server', 'stylus', 'stylusWatch', 'watchify']);

gulp.task('build', ['browserify']);
