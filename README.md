# Songbook - song book generator

`Songbook` is a command-line tool used to generate automatically a song book.

It currently support the following output formats: 

- HTML
- TXT
- PDF 

## Installation 

Install globally using npm: 

	npm install songbook -g

After the installation, `songbook` command can be execute everywhere in your terminal.

## Usage

	songbook <songs_folder> <output_filename>

### Options

	-c, --chord          	 							Show song chords
	-C, --column [count]   							Layout column count (default 2)
	-n, --song-number      							Add song number
	-V, --version          							Print version
	-r, --replace-chorus [chorusLabel]	Replace chorus with [chorusLabel]
	-h, --help             							Print usage information

# Contributors

- Angelo Moriconi
