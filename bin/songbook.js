#! /usr/bin/env node

'use strict';

 // Configurations
var cmd;
var newLabels = [];

const program = require('commander'),
	Q = require('q'),
	progress = require('cli-progress'),
	 _ = require('lodash'),
	fs = require('fs-extra'),
	ChordPro = require('./chordpro');
	/*jshint unused:false*/

//=============================================================================
// Utility function
//-----------------------------------------------------------------------------

//=============================================================================
// Command line initialization
//-----------------------------------------------------------------------------
program
.version('1.0.0')
  .usage('[options] <output_file>')
  .option('-v, --verbose', 'Verbose mode')

  .action(function(command, file) {
    cmd = command;
    if (typeof file === 'string') {
			var exportFilename = file.replace(/\.[^/.]+$/, '');
			console.dir(exportFilename);
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

// Check language folder existence
/*
if (!fs.existsSync('./languages')) {
  console.error('\nError: Folder \'./languages\' not found in current directory.'.bold.red);
  console.log('');
  console.log('Please, run l10n command from a directory that contains \'languages\' folder and structure.');
  process.exit(1);
}
*/

// Instantiate chordPro
var chordpro = new ChordPro();

var	chordProOptions = {
	showChords: true,
	// class:
	// chordFormatter:
	transpose: 0
};

// add css to main div that contains pages : column-count: 2;

console.log(chordpro.toHtml('{title: Pippo}\n [DO]Ciao sono un [RE]testo di prova\n[RE]vediamo come [LA]va', chordProOptions));

