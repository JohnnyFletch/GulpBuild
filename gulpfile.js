const gulp = require('gulp')
const less = require('gulp-less')
const stylus = require('gulp-stylus')
const sass = require('gulp-sass')(require('sass'))
const ts = require('gulp-typescript')
const coffee = require('gulp-coffee')
const rename = require('gulp-rename')
const cleanCSS = require('gulp-clean-css')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const crypto = require('crypto')
const htmlmin = require('gulp-htmlmin')
const size = require('gulp-size')
const browserSync = require('browser-sync').create()
const gulpPug = require('gulp-pug')
const del = require('del')


//Пути к изначальным файлам и файлам назначения
const paths = {
  styles: {
    src: ['src/styles/**/*.less', 'src/styles/**/*.sass', 'src/styles/**/*.scss'], //'src/styles/**/*.styl'],
    dest: 'dist/css/'
  },
  scripts: {
    src: ['src/scripts/**/*.js', 'src/scripts/**/*.ts', 'src/scripts/**/*.coffee'],
    dest: 'dist/js/'
  },
  images: {
    src: 'src/img/**',
    dest: 'dist/img/'
  },
  html: {
    src: 'src/*.html',
    dest: 'dist/'
  },
  pug: {
    src: 'src/*.pug',
    dest: 'dist/'
  }
}

//Очистка каталога
function clean() {
  return del.deleteAsync(['dist/**', '!dist/img'])
}

//Задачи для обработки стилей
function styles() {  
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    // .pipe(less())
    // .pipe(stylus())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer({
      cascade: false
    })]))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(rename({
      basename: 'main',
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream())
}

//Задачи для обработки скриптов
function scripts() {
  return gulp.src(paths.scripts.src)
  .pipe(sourcemaps.init())
  .pipe(coffee({bare: true}))
  /* Возможность выбора typescript
  .pipe(ts({
    noImplicitAny: true,
    outFile: 'main.min.js'
}))
*/
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(uglify())
  .pipe(concat('main.min.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(size({ showFiles: true }))  
  .pipe(gulp.dest(paths.scripts.dest))
  .pipe(browserSync.stream())
}

//Задачи для обработки изображений
function img() {
  return gulp.src(paths.images.src, { encoding: false })
  .pipe(newer(paths.images.dest))
  .pipe(imagemin({verbose: true, progressive: true, optimizationLevel: 10
  }))
  .pipe(size({ showFiles: true }))
  .pipe(gulp.dest(paths.images.dest))
  .pipe(browserSync.stream())
}

//Задачи для обработки pug - препроцессора html с меньшим количество кода
function pug() {
  return gulp.src(paths.pug.src)
  .pipe(gulpPug())
  .pipe(size({ showFiles: true }))
  .pipe(gulp.dest(paths.pug.dest))
  .pipe(browserSync.stream())
}

//Задачи для обработки html
function html() {
  return gulp.src(paths.html.src)
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(size({ showFiles: true }))
  .pipe(gulp.dest(paths.html.dest))
  .pipe(browserSync.stream())
}

// Задача для автоматического слежения за изменениями в файлах
function watch() {
  browserSync.init({
    server: {
        baseDir: "./dist/"
    }
});
  gulp.watch(paths.styles.src, styles)
  gulp.watch(paths.scripts.src, scripts)
  gulp.watch(paths.images.src, img);
  gulp.watch(paths.html.src, html);
}

const build = gulp.series(clean, gulp.parallel(styles, scripts, img, html), watch);

exports.clean = clean;
exports.img = img
exports.html = html
exports.pug = pug
exports.styles = styles
exports.scripts = scripts
exports.watch = watch
exports.build = build

// Задача по умолчанию при вводе слова "gulp"
exports.default = build