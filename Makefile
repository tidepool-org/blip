REPORTER ?= spec
E2E_TESTS ?= test/e2e/*.js

install-selenium:
	./test/scripts/install_selenium.sh

test-e2e:
	export PATH=test/bin:$$PATH; \
		./node_modules/.bin/mocha \
			--reporter $(REPORTER) \
			--timeout 60000 \
			--slow 30000 \
			test/lib/e2esetup.js $(E2E_TESTS)

sc:
	./test/bin/sc -u $$SAUCE_USERNAME -k $$SAUCE_ACCESS_KEY