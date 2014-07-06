/**
 * Created by sam on 03/07/2014.
 */
'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.initConfig({
        watch: {
           app: {
                files: ['**/**/*'],
                options: {
                    livereload: true
                }
           }
        }
    })
    grunt.registerTask('pat', function (data) {
        grunt.log.writeln("Keep going, you're great Sam!");
    })
    grunt.registerTask('default', function () {
        grunt.log.writeln('Hello');
    })
}