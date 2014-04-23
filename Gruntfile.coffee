'use strict'

module.exports = (grunt) ->

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-simple-mocha'
  grunt.loadNpmTasks 'grunt-notify'

  grunt.registerTask "build",   [ 'coffeelint', 'coffee']
  grunt.registerTask "reload",   [ 'coffeelint', 'coffee', "watch"]
  grunt.registerTask 'test',    [ 'coffeelint', 'coffee']
  grunt.registerTask 'default', [ 'coffeelint', 'coffee', 'simplemocha', 'watch' ]
  grunt.registerTask "debug", ["coffeelint", "coffee", "watch"]

  grunt.initConfig

    coffeelint:
      options:
        max_line_length:
          value: 79
        indentation:
          value: 2
        newlines_after_classes:
          level: 'error'
        no_empty_param_list:
          level: 'error'
        no_unnecessary_fat_arrows:
          level: 'ignore'
      dist:
        files: [{
          expand: yes
          cwd: 'src/'
          src: [ '**/*.coffee' ]
        }]

    coffee:
      dist:
        files: [{
          expand: yes
          cwd: 'src/'
          src: [ '**/*.coffee' ]
          dest: 'lib/'
          ext: '.js'
        }]

    simplemocha:
      options:
        ui: 'bdd'
        reporter: 'spec'
        compilers: 'coffee:coffee-script'
        ignoreLeaks: no
        timeout: 10000
      dist:
        src: [ 'tests/test_manager.coffee', ]

    watch:
      options:
        interrupt: yes
      dist:
        files: [ 'src/**/*.coffee', 'tests/*.coffee' ]
        tasks: [ 'build' ]
