"use strict";

var options = require('minimist')(process.argv.slice(2));

var gulp = require('gulp');
var runSequence = require('run-sequence').use(gulp);
require('agency-environment');
require('agency-server');

gulp.task('default', ['watch', 'server']);

gulp.task('run', function(callback) {
    if(!options.env || options.env === 'development' || options.env === 'package-development') {
        runSequence('prebuild', 'default', callback);
    } else {
        runSequence('build', 'server', callback);
    }
});

process.once('SIGINT', function() { process.exit(0); });
