
## Usage

install

	npm install

it serves all contexts, but for watchify it needs to pick one bundle to watch

	gulp serve --bundle <bundle> #available contexts are in contexts folder
	
	gulp serve --bundle datepicker
	
	gulp serve --bundle searchform
	
## Export to another project

	gulp export --project skypicker --path C:\www\skypicker
