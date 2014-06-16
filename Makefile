dist:
	mkdir -p dist
	browserify --debug js/index.js --standalone tideline --ignore-missing > dist/tideline.js
	browserify --debug plugins/blip/index.js --standalone tideline.blip --ignore-missing > dist/tideline-blip.js
	browserify --debug plugins/data/preprocess/index.js --standalone tideline.preprocess --ignore-missing > dist/tideline-preprocess.js
	browserify --debug plugins/data/watson/index.js --standalone tideline.watson --ignore-missing > dist/tideline-watson.js
	lessc css/tideline.less dist/tideline.css

test:
	webpack --progress --colors
	browserify --debug test/index.js > test/test.js
	testem

minitest:
	mocha test/*_test.js --reporter nyan

.PHONY: dist test minitest