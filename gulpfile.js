'use strict';

const
  { src, dest, task, watch, series, parallel } = require('gulp'), // only use what you need instead of loading the entire gulp package! No longer need prefix of 'gulp.'
  imagemin = require('gulp-imagemin'),
  sass = require('gulp-sass'),
  prefix = require('gulp-autoprefixer'),
  uglify = require('gulp-uglify'),
  plumber = require('gulp-plumber'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  connect = require('gulp-connect-php'),
  rootdir = {
    src  : '*.php'
  },
  styles = {
    src  : 'src/styles/*.scss',
    build : 'build/styles/'
  },
  styleImports = {
    src  : 'src/styles/**/*.scss' // Watch SCSS files that are imported and not compiled individually
  },
  scripts = {
    src  : 'src/scripts/*.js',
    build : 'build/scripts/'
  },
  gfx = {
    src  : 'src/assets/gfx/*',
    build : 'assets/gfx/'
  },
  ui = {
    src  : 'src/assets/ui/*',
    build : 'assets/ui/'
  };

///// Browser Sync & Watch (Runs in Browser & Reloads Project on Changes)
function browser_sync(done) {
  connect.server({}, function (){
    browserSync({ proxy: 'localhost' }); // I use this with WAMP Server
  })

  watch(styles.src, series(build_sass, reload));
  watch(styleImports.src, series(build_sass, reload));
  watch(scripts.src, series(build_js, reload));
  watch(rootdir.src, series(reload));
  watch(ui.src, series(img_ui, reload));
  watch(gfx.src, series(img_gfx, reload));

  done();

}

///// Compress JS Files
function build_js() {
  return src(scripts.src)
    .pipe(plumber())
    .pipe(uglify())
    .pipe(dest(scripts.build));
}

///// Compile Sass Files & Compress CSS
function build_sass() {
  return src(styles.src)
    .pipe(plumber())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(prefix('last 2 versions'))
    .pipe(dest(styles.build));
}

///// Compresses Images in /gfx/
function img_gfx() {
  return src(gfx.src)
    .pipe(imagemin())
    .pipe(dest(gfx.build))
}

///// Compresses Images in /ui/
function img_ui() {
  return src(UI.src)
    .pipe(imagemin())
    .pipe(dest(UI.build))
}

// *** Default Task - Run During Development
task('default', parallel(build_js, build_sass, browser_sync));

// *** Build Task - Run for Newly Pulled Project
task('build', parallel(build_js, build_sass, img_gfx, img_ui));
