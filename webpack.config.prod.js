var devConfig = require('./webpack.config.js');

var path = require('path');

module.exports = {
  entry: devConfig.entry,
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.[hash].js'
  },
  module: devConfig.module
};
