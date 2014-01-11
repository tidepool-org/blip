REPORTER ?= spec
E2E_TESTS ?= test/e2e/*.js

install-selenium:
	./test/scripts/install_selenium.sh

test-e2e:
	export PATH=test/bin:$$PATH; \
		./node_modules/.bin/mocha \
			--reporter $(REPORTER) \
			--timeout 60000 \
			--slow 10000 \
			$(E2E_TESTS)