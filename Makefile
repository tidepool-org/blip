REPORTER ?= spec

install-selenium:
	./test/scripts/install_selenium.sh

test-e2e:
	export PATH=test/bin:$$PATH; \
		./node_modules/.bin/mocha \
			--reporter $(REPORTER) \
			--timeout 60000 \
			--slow 10000 \
			test/e2e/*.js