module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            build: {
                src: [
                    // Order is important for browser dependencies
                    'src/promise.js',
                    'src/index.js',
                    'src/util.js',
                    'src/resource.js',
                    'src/record.js',
                    'src/collection.js',
                    'src/client.js'
                ],
                dest: '<%= pkg.name %>.js'
            }
        },
        usebanner: {
            build: {
                options: {
                    position: 'top',
                    banner: '/*! <%= pkg.name %>.js (Version <%= pkg.version %>) <%= grunt.template.today("yyyy-mm-dd") %> */',
                    linebreak: true
                }
            }
        },
        uglify: {
            build: {
                options: {
                    banner: "/*! <%= pkg.name %>.js (Version <%= pkg.version %>) <%= grunt.template.today(\"yyyy-mm-dd\") %> */\n"
                },
                files: [
                    {
                        src: '<%= pkg.name %>.js',
                        dest: '<%= pkg.name %>.min.js'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-banner');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'uglify', 'usebanner']);
    grunt.registerTask('dev', ['concat', 'usebanner']);
};