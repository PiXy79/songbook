/*
 * ChorPro: library to parse ChorPro file and get Html or Text output
 * Version: 0.2
 * Date: 27/06/2015
 */

'use strict';

const _ = require('lodash');

function ChordPro() {
}

ChordPro.prototype.ITchordsDiesis = ["DO","DO#","RE","RE#","MI","FA","FA#","SOL","SOL#","LA","LA#","SI" ];
ChordPro.prototype.ITchordsBemolle = ["DO","REb","RE","MIb","MI","FA","SOLb","SOL","LAb","LA","SIb","SI" ];

ChordPro.prototype.ENchordsDiesis = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B" ];
ChordPro.prototype.ENchordsBemolle = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B" ];

ChordPro.prototype.parse = function(source, showChords) {
	var lineInfos = [];

	var chordRegex = /\[([a-zA-Z0-9#-/]+)\]/g;
	var directiveRegex = /^{.*}/;
	var commentRegex = /^#/;

	var chorus = false;

	source.split('\n').forEach(function (line) {

		var fragment;
		if (line.match(commentRegex)) {
			// TODO: handle comments
		}
		else if (line.match(directiveRegex)) {
			// TODO: handle directives

			// Remove curly brackets
			var testRegex = /{(.*?)}/;
			var match = line.match(testRegex);
			var content = match[1];

			if(content.indexOf('soc') === 0) {
				chorus = true;
			} else if(content.indexOf('eoc') === 0) {
				chorus = false;
			}
			else if(content.indexOf('title:') === 0 || content.indexOf('t:') === 0) {
				lineInfos.push({
					type: 'title',
					text: content.replace('title:','').replace('t:','')
				});
			} else if(content.indexOf('subtitle:') === 0 || content.indexOf('st:') === 0) {
				lineInfos.push({
					type: 'subtitle',
					text: content.replace('subtitle:','').replace('st:','')
				});
			}
		}
		else if (line.match(chordRegex)) {
			var lineInfo = {
				type: 'lyrics',
				lyrics: '',
				chords: [],
				chorus: chorus
			};

			var sourcePos = 0;
			var chordMatch;
			while ((chordMatch = chordRegex.exec(line))) {

				// append lyrics text ending at current match position
				fragment = line.substring(sourcePos, chordMatch.index);
				if (fragment) {
					lineInfo.lyrics += fragment;
				}

				// determine offset to apply if previous chord is too long and would overlap with current chord
				var offset = 0;
				if (lineInfo.chords.length > 0) {
					var previousChordInfo = lineInfo.chords[lineInfo.chords.length - 1];
					offset = Math.max(0, previousChordInfo.pos + previousChordInfo.chord.length + 1 - lineInfo.lyrics.length);
				}

				// pad lyrics field if needed
				for (var i = 0; i < offset; i++) {
					lineInfo.lyrics += ' ';
				}

				// add chord
				var sourceChord = chordMatch[0];
				if(showChords) {
					lineInfo.chords.push({
						pos: lineInfo.lyrics.length + (chorus ? 5 : 0),
						chord: sourceChord.replace(/[\[\]]/g, '')
					});
				}
				sourcePos = chordMatch.index + sourceChord.length;
			}

			// append lyrics text following last chord
			fragment = line.substring(sourcePos, line.length);
			if (fragment) {
				lineInfo.lyrics += fragment;
			}

			// trim end of lyrics text
			lineInfo.lyrics = lineInfo.lyrics.replace(/\s+$/, '');
            if(lineInfo.lyrics.length > 0 || lineInfo.chords.length > 0) {
				lineInfos.push(lineInfo);
            }
		}
		else {
          lineInfos.push({
            type: 'lyrics',
            lyrics: line,
            chorus: chorus,
            chords: []
          });
		}
	});

	return lineInfos;
};

ChordPro.prototype.addChord = function(line, chordInfo, options) {
	// pad the current line up to the chord position
	var strippedLine = line.replace(/(<([^>]+)>)/ig, '');
	var padding = chordInfo.pos - strippedLine.length;
	if (padding > 0) {
		line += new Array(padding + 1).join(' ');
	}

	var chord = chordInfo.chord;

	if(options.transpose !== 0) {

		var normalizedChord = chord.replace(/[0-9]/g, '').replace(/\+|\-/ig,'').replace('dim','');

		var chordFound = false;
		_.forEach(ChordPro.prototype.ITchordsDiesis, function(val) {
			if(normalizedChord === val) {
				var index = _.indexOf(ChordPro.prototype.ITchordsDiesis, val) + options.transpose;
				if(index < 0) {
					index = ChordPro.prototype.ITchordsDiesis.length + index;
				}
				chord = chord.replace(val,ChordPro.prototype.ITchordsDiesis[index % ChordPro.prototype.ITchordsDiesis.length]);
				chordFound = true;
				return false;
			}
		});
		if(!chordFound) {
			_.forEach(ChordPro.prototype.ITchordsBemolle, function(val) {
				if(normalizedChord === val) {

					var index = _.indexOf(ChordPro.prototype.ITchordsBemolle, val) + options.transpose;
					if(index < 0) {
						index = ChordPro.prototype.ITchordsBemolle.length - index;
					}

					chord = chord.replace(val,ChordPro.prototype.ITchordsBemolle[index % ChordPro.prototype.ITchordsBemolle.length]);
					return false;
				}
			});
		}
	}
	if (options.chordFormatter) {
		chord = options.chordFormatter(chord);
	}

	line += chord;
	return line;
};

ChordPro.prototype.formatLyricsEntry = function(entry, lineEnd, options) {

	var text = '';

	// add chord line if available
	if (entry.chords.length > 0) {
		var line = '';
		var self = this;
		entry.chords.forEach(function (chordInfo) {
			line = self.addChord(line, chordInfo, options);
		});

		text += line;
	}

	// add lyrics line if available, or empty line if no chords and no lyrics
	if (entry.lyrics.length > 0 || entry.chords.length === 0) {
		if (text.length > 0) {
			text += lineEnd;
		}

		text += entry.chorus ? '<span class="chorus">' + entry.lyrics.trim() + '</span>' : entry.lyrics.trim();
	}

	return text;
};

ChordPro.prototype.format = function(source, newLine, options) {
	var parsed = this.parse(source, options.showChords);
	var text = '';
	var self = this;
	parsed.forEach(function (entry) {
		if (entry.type === 'lyrics') {
			if (text.length > 0) {
				text += newLine;
			}
			text += self.formatLyricsEntry(entry, newLine, options);
		} else if(entry.type === 'title') {
			text += '<span style="font-weight: bold; font-size: 130%; line-height: 130%;">';
			if (options.songNumber !== null) {
				text += '<span class="songNumber">' + options.songNumber + '</span> ';
			}
			text += entry.text.trim() + '</span>';
		} else if(entry.type === 'subtitle') {
			text += '<br><span style="font-weight: bold;">' + entry.text.trim() + '</span>';
		}
	});

	return text;
};

ChordPro.prototype.toText = function(source) {
	return this.format(source, '\n');
};

ChordPro.prototype.toHtml = function(source, options) {

	if (!options) {
		options = {};
	}
    if (!options.transpose) {
      options.transpose = 0;
    }
	if (!options.chordFormatter) {
		options.chordFormatter = function (chord) {
			return '<span class="chord">' + chord + '</span>';
		};
	}
	if(typeof options.showChords === 'undefined') {
		options.showChords = true;
	}
	var openingPre = '<pre>';
	if (options.class) {
		openingPre = '<pre class="'+ options.class + '">';
	}
	return openingPre + this.format(source, '<br/>', options) + '</pre>';
};

module.exports = ChordPro;
