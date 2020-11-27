/*
 * Update tests list with:
 * $ find test/ -type f -name "*.test.js" | sed 's/test\///' | awk "{printf(\"import './%s';\n\", \$1);}" > test/import-tests.js
 */

import './enzyme';
import './import-tests';
