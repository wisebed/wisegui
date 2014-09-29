module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      'dist/js/<%= pkg.name %>.browserify.js': ['src/<%= pkg.name %>.js']
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        sourceMap : true
      },
      build: {
        src: 'dist/js/<%= pkg.name %>.browserify.js',
        dest: 'dist/js/<%= pkg.name %>.min.js'
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'static/', src:['**'], dest: 'dist/'}
        ]
      }
    },
	clean: ['dist/','docs/'],
    jshint: {
      all: ['src/**/*.js']
    },
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: 'src/',
          outdir: 'docs/'
        }
      }
    },
    watch: {
      js: {
        files: ['src/*.js'],
        tasks: ['jshint','browserify','uglify']
      },
      static: {
        files: ['static/**'],
        tasks: ['copy']
      },
      docs: {
        files: ['src/*.js'],
        tasks: ['yuidoc']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');

  grunt.registerTask('doc', ['yuidoc']);
  grunt.registerTask('default', ['jshint','browserify','uglify','copy','yuidoc']);

};
