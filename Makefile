dist:
	mkdir -p dist
	browserify --debug js/index.js --standalone tideline --ignore-missing > dist/tideline.js
	browserify --debug plugins/blip/index.js --standalone tideline.blip --ignore-missing > dist/tideline-blip.js
	browserify --debug plugins/data/preprocess/index.js --standalone tideline.preprocess --ignore-missing > dist/tideline-preprocess.js
	browserify --debug plugins/data/watson/index.js --standalone tideline.watson --ignore-missing > dist/tideline-watson.js
	lessc css/tideline.less dist/tideline.css

example:
	mkdir -p example/dist
	browserify --debug js/index.js --standalone tideline > example/dist/tideline.js
	browserify --debug plugins/blip/index.js --standalone tideline.blip > example/dist/tideline-blip.js
	browserify --debug plugins/data/preprocess/index.js --standalone tideline.preprocess > example/dist/tideline-preprocess.js
	browserify --debug plugins/data/watson/index.js --standalone tideline.watson > example/dist/tideline-watson.js
	browserify --debug example/example.js > example/bundle.js
	lessc example/example.less example/example.css

test:
	browserify --debug test/index.js > test/test.js
	testem

minimal-test:
	mocha test/*_test.js --reporter nyan

run-test: example test

server:
	python dev/simple_server.py

develop: minimal-test example server

.PHONY: dist example test minimal-test server develop run