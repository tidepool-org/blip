var createTidepoolClient = require('tidepool-platform-client');

var tidepool = createTidepoolClient({
  host: 'http://localhost:8009',
  metricsSource: 'travis',
  metricsVersion: '0.0.0'
});

console.log();

tidepool.initialize(function() {
  console.log('API initialized.');
  console.log();
});

tidepool.signup({
  emails: ['jane+skip@tidepool.org'],
  username: 'jane+skip@tidepool.org',
  password: 'password'
}, function(err, resp) {
  // most (all?) errors come thru as resp
  if (err) {
    console.log(err);
  }
  if (resp && !resp.code) {
    console.log(resp);
    console.log();
    console.log('Jane Doe account created.');
    console.log();
  }
  process.exit();
});
