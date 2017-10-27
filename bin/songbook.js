#! /usr/bin/env node

'use strict';

 // Configurations
var songFolder = './songs';
var outputFileName = 'output';
var newLabels = [];

const supportedInputFormat = ['txt', 'chopro', 'cho', 'crd', 'pro', 'cpm'];

const program = require('commander'),
	Q = require('q'),
	process = require('process'),
	 _ = require('lodash'),
	fs = require('fs-extra'),
	htmlToText = require('html-to-text'),
	HTMLToPDF = require('html5-to-pdf'),
	ChordPro = require('./chordpro');
	/*jshint unused:false*/

//=============================================================================
// Utility function
//-----------------------------------------------------------------------------

//=============================================================================
// Command line initialization
//-----------------------------------------------------------------------------
program
.version('0.0.1')
  .usage('[options] <songs_folder> <output_filename>')
	.option('-c, --chord', 'Export song chords')
	.option('-n, --song-number', 'Export song number')
	.option('-C, --column [count]', 'Layout column count [2]', 2)

  .action(function(sf, outputFile) {
		songFolder = sf;
    if (typeof outputFile === 'string') {
			outputFileName = outputFile.replace(/\.[^/.]+$/, '');
    }
  });

program.parse(process.argv);

// Check songs folder existence
if (!fs.existsSync(songFolder)) {
  console.error('\nError: Folder \'' + songFolder + '\' not found in current directory.');
	console.log('Please, run songbook from a directory that contains \'songs\' folder.');
	console.log('');
  process.exit(1);
}

// Read HTML template
var htmlTemplate = '';
fs.readFile('./templates/main.html', function (err, data) {
  if (err) {
		process.exit(1);
		throw err;
	}

	htmlTemplate = data.toString();

	// Set column count
	htmlTemplate = htmlTemplate.replace(/\[columnCount\]/g, program.column);

	// Instantiate chordPro
	var chordpro = new ChordPro();

	var	chordProOptions = {
		showChords: _.isNil(program.chord) ? false : program.chord,
		// class:
		// chordFormatter:
		transpose: 0,
		songNumber: null
	};

	var songsHtml = '';

	// Read songs (chordpro files inside songFolder)
	fs.readdir(songFolder, function(err, files) {
		files
		.filter(function(file) {
			var fileExtensionPatter = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi;
			return supportedInputFormat.indexOf(file.match(fileExtensionPatter)[0].substring(1)) !== -1;
		})
		.forEach(function(file, index) {
			var song = fs.readFileSync(songFolder + '/' + file).toString();
			var htmlSong = chordpro.toHtml(song, chordProOptions);
			if (!_.isNil(program.songNumber) && program.songNumber) {
				chordProOptions.songNumber = index + 1;
			}
			songsHtml = songsHtml + chordpro.toHtml(song, chordProOptions);
		});
		htmlTemplate = htmlTemplate.replace('[songs]', songsHtml);

		// Write HTML file
		fs.writeFile(outputFileName + '.html', htmlTemplate, function (err) {
			if (err) { return console.log(err); }
		});

		// Write TXT file
		var text = htmlToText.fromString(htmlTemplate, {
			wordwrap: 180
		});
		fs.writeFile(outputFileName + '.txt', text, function (err) {
			if (err) { return console.log(err); }
		});

		// Write PDF file
		const htmlToPDF = new HTMLToPDF({
			inputBody: htmlTemplate,
			outputPath: './' + outputFileName + '.pdf',
			templatePath: './templates/pdf'
		});
		htmlToPDF.build(function(error) {
			if (error) { return console.log(error); }
		});
	});

});
