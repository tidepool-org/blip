var es = require('event-stream');

// Glup plugin to send first file to HTTP client
// Inspired by:
// https://github.com/wearefractal/gulp/blob/master/lib/createOutputStream/writeFile.js
var send = function(res) {
  var fileSent = false;

  function sendFile(file, cb) {
    if (!fileSent) {
      
      if (file.isStream()) {
        file.contents.once('end', function(){
          cb(null, file);
        });
        file.contents.pipe(res);
        fileSent = true;
        return;
      }

      if (file.isBuffer()) {
        res.end(file.contents);
        cb(null, file);
        fileSent = true;
        return;
      }

      res.end();
      cb(null, file);
      fileSent = true;
      return;
    }

    cb(null, file);
  }

  return es.map(sendFile);
};

module.exports = send;