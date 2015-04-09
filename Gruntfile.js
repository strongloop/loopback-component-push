module.exports = function(grunt) {
  grunt.initConfig({
    jsdoc : {
      dist : {
        src: ['lib/*.js', 'models/installation.js', 'models/notification.js'],
        options: {
          destination: 'doc'
        }
      }
    },
    watch: {
      files: ['lib/*.js', 'models/*.js'],
      tasks: ['jsdoc'],
    }
  });

  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['jsdoc']);
};
