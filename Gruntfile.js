/* jshint node: true */

module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: [
                "Gruntfile.js",
                "./*.js",
                "./public/js/app/*.js"
            ],
            options: {
                jshintrc: '.jshintrc'
            },
        },
        jasmine: {
            src: "lib/**/*.js",
            options: {
                specs: "spec/**/*.js",
                vendor: "vendor/**/*.js",
                version: '2.0.0'
            }
        },
        uglify: {
            my_target: {
                options: {
                    preserveComments: 'some'
                },
                files: {
                    'build/popup.min.js': ['public/js/app/popup.js'],
                    'build/background.min.js': ['public/js/app/background.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('default', ['test']);
    grunt.registerTask('minify', ['jshint', 'uglify']);
    grunt.registerTask('build', ['jshint', 'uglify']);
};
