dist:
	mkdir -p dist
	node_modules/.bin/browserify --debug js/index.js --standalone tideline --ignore-missing > dist/tideline.js
	node_modules/.bin/browserify --debug plugins/blip/index.js --standalone tideline.blip --ignore-missing > dist/tideline-blip.js
	node_modules/.bin/browserify --debug plugins/data/preprocess/index.js --standalone tideline.preprocess --ignore-missing > dist/tideline-preprocess.js
	node_modules/.bin/browserify --debug plugins/data/watson/index.js --standalone tideline.watson --ignore-missing > dist/tideline-watson.js
	node_modules/.bin/lessc css/tideline.less dist/tideline.css

example:
	mkdir -p example/dist
	node_modules/.bin/browserify --debug js/index.js --standalone tideline > example/dist/tideline.js
	node_modules/.bin/browserify --debug plugins/blip/index.js --standalone tideline.blip > example/dist/tideline-blip.js
	node_modules/.bin/browserify --debug plugins/data/preprocess/index.js --standalone tideline.preprocess > example/dist/tideline-preprocess.js
	node_modules/.bin/browserify --debug plugins/data/watson/index.js --standalone tideline.watson > example/dist/tideline-watson.js
	node_modules/.bin/browserify --debug example/example.js > example/bundle.js
	node_modules/.bin/lessc example/example.less example/example.css

test:
	./node_modules/.bin/mocha test/*_test.js --reporter spec

minimal-test:
	./node_modules/.bin/mocha test/*_test.js --reporter nyan

server:
	python dev/simple_server.py

develop: minimal-test example server

.PHONY: dist example test minimal-test server develop run