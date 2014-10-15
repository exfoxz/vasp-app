/**
 * Created by sam on 03/07/2014.
 */
'use strict';

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.initConfig({
        watch: {
           app: {
                files: ['**/**/*', '!public/js/build/*'],
                options: {
                    livereload: true
                },
               tasks: ['concat']
           }
        },
        concat: {
            lib: {
                src: ['public/js/lodash.js', 'public/js/jquery.min.js', 'public/js/angular.min.js', 'public/js/angular-*.js', 'public/js/bootstrap*.js'],
                dest: 'public/js/build/lib.js'
            }
//            ng: {
//                src: ['public/js/ng*.js'],
//                dest: 'public/js/build/ng-app.js'
//            }
        }
//        uglify: {
//            js: {
//                files: [
//                    {
//                        expand: true,
//                        cwd: 'public/js',
//                        src: ['**/*.js'],
//                        dest: 'public/js/build'
//                    }
//                ]
//            }
//        }
    })
    grunt.registerTask('default', function () {
        grunt.log.writeln('Hello');
    })
}