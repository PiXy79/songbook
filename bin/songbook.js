#! /usr/bin/env node

'use strict';

 // Configurations
var songFolder = './songs';
var outputFileName = 'output';
var newLabels = [];

const program = require('commander'),
	Q = require('q'),
	process = require('process'),
	progress = require('cli-progress'),
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

  .action(function(sf, outputFile) {
		songFolder = sf;
    if (typeof outputFile === 'string') {
			outputFileName = outputFile.replace(/\.[^/.]+$/, '');
    }
  });

program.parse(process.argv);

// Check command
/*
if (typeof cmd === 'undefined' || (cmd !== 'export' && cmd !== 'import' && cmd !== 'inspect')) {
  console.error('\nError: please specify or type the right command.'.bold.red);
  console.log('');
  console.log('  Available commands are:');
  console.log('   export   :  Export new labels from language JSON files creating csv/xlsx localization file/files');
  console.log('   import   :  Import csx/xlsx files to update (merge) new labels in language JSON files.');
  console.log('   inspect  :  Inspect language files checking for missing, untranslated and duplicate values.');
  process.exit(1);
}
*/

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
	// Read songs
	fs.readdir(songFolder, function(err, files) {
    files.forEach(function(file, index) {
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
