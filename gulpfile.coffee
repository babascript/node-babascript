gulp = require 'gulp'
plumber = require 'gulp-plumber'
webpack = require 'gulp-webpack'
coffee = require 'gulp-coffee'
lint = require 'gulp-coffeelint'
gutil = require 'gulp-util'
mocha = require 'gulp-mocha'

gulp.task 'coffee:compile', ->
  return gulp.src "src/**/*.coffee"
  .pipe plumber()
  .pipe coffee({bare: true}).on 'error', gutil.log
  .pipe gulp.dest 'lib/'

gulp.task 'coffee:lint', ->
  return gulp.src "src/**/*.coffee"
  .pipe plumber()
  .pipe lint()
  .pipe lint.reporter()

gulp.task 'mocha', ->
  return gulp.src "tests/**/*.coffee"
  .pipe plumber()
  .pipe mocha
    ui: 'bdd'
    reporter: 'spec'
    ignoreLeaks: no
    timeout: 10000

gulp.task 'webpack', ->
  return gulp.src 'src/browser.coffee'
  .pipe plumber()
  .pipe webpack
    output:
      filename: 'browser_babascript.js'
    module:
      loaders: [{test: /\.coffee/, loader: 'coffee'}]
    resolve:
      extensions: ["", ".web.coffee", ".web.js", ".coffee", ".js"]
      modulesDirectories: ['node_modules']
  .pipe gulp.dest 'lib'

gulp.task 'default', ['coffee:lint', 'coffee:compile', 'mocha'], ->
    gulp.watch 'src/**/*.coffee', ['coffee:lint', 'coffee:compile', 'mocha', 'webpack']
