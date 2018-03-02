const _ = require('lodash');
const baseConfig = require('./webpack.config');

const packageConfig = _.cloneDeep(baseConfig);

packageConfig.output.libraryTarget = 'commonjs';

packageConfig.externals = {
  'blob-stream': 'blob-stream',
  classnames: 'classnames',
  'd3-array': 'd3-array',
  'd3-format': 'd3-format',
  'd3-scale': 'd3-scale',
  'd3-shape': 'd3-shape',
  'd3-time': 'd3-time',
  'moment-timezone': 'moment-timezone',
  pdfkit: 'pdfkit',
  react: 'react',
  'react-addons-update': 'react-addons-update',
  'react-collapse': 'react-collapse',
  'react-dimensions': 'react-dimensions',
  'react-height': 'react-height',
  'react-motion': 'react-motion',
  'react-redux': 'react-redux',
  redux: 'redux',
};

module.exports = packageConfig;
