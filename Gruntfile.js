module.exports = function(grunt) {

	grunt.initConfig({
	    concat: {
			options: {
				separator: '\n'
			},
			dist : {
				src: ['src/motif.js','src/motif_lexer.js','src/motif_runtime.js'],
				dest: 'motif.js',
				},
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.registerTask('build', ['concat']);
};
