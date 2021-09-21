# Songbook - song book generator

`Songbook` is a command-line tool used to generate automatically a song book. Songbook accept songs in the [chorpro file format](https://www.chordpro.org/chordpro/ChordPro-File-Format-Specification.html) with the following extension: 

- txt, chopro, cho, crd, pro, cpm


It currently support the following output formats: 

- HTML
- TXT
- PDF 

---

![alt text](https://user-images.githubusercontent.com/25789363/32336538-d715615a-bfef-11e7-86d1-792bfc23ba30.png)

## Apple silicon M1 issues

To run correctly on Apple M1 type: 

npm install --arch=x64

It will use Rosetta and download the right version of Electron needed by html5-to-pdf library.

## Installation 

Install globally using npm: 

	npm install songbook -g

After the installation, `songbook` command can be execute everywhere in your terminal.

## Usage

	songbook <songs_folder> <output_filename>

### Options

	-c, --chord          	 							Show song chords
	-C, --column [count]   							Layout column count (default 2)
	-f, --font-size [size], 						CSS font-size (default 14px)
	-b, --avoid-page-break, 						Avoid page break inside song
	-m, --margin [size]									Page margin (default 1cm)
	-n, --song-number      							Add song number
	-V, --version          							Print version
	-r, --replace-chorus [chorusLabel]	Replace chorus with a label (default 'CHORUS')
	-o, --one-song-per-column						Print one song per column
	-h, --help             							Print usage information
