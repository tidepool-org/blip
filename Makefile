dist:
	mkdir -p dist
	browserify js/index.js --standalone tideline > dist/tideline.js
	lessc css/tideline.less dist/tideline.css

example:
	browserify --debug example/example.js > example/bundle.js
	lessc example/example.less example/example.css

test:
	./node_modules/.bin/mocha --reporter spec

server:
	python -m SimpleHTTPServer

.PHONY: dist example test server