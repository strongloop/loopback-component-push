// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    jsdoc: {
      dist: {
        src: ['lib/*.js', 'models/installation.js', 'models/notification.js'],
        options: {
          destination: 'doc',
        },
      },
    },
    watch: {
      files: ['lib/*.js', 'models/*.js'],
      tasks: ['jsdoc'],
    },
  });

  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['jsdoc']);
};
