const _ = require('lodash');
const baseConfig = require('./webpack.config');

const packageConfig = _.cloneDeep(baseConfig);

packageConfig.output.libraryTarget = 'commonjs';

packageConfig.externals = {
  classnames: 'classnames',
  lodash: 'lodash',
  'moment-timezone': 'moment-timezone',
  react: 'react',
  'react-addons-update': 'react-addons-update',
  'react-redux': 'react-redux',
  redux: 'redux',
};

module.exports = packageConfig;
