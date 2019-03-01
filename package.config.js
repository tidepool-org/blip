const webpack = require('webpack');
const _ = require('lodash');

const baseConfig = require('./webpack.config');
const packageConfig = _.cloneDeep(baseConfig);

// eslint-disable-next-line no-underscore-dangle
const __DEV__ = process.env.NODE_ENV === 'development';

packageConfig.output.libraryTarget = 'commonjs';

packageConfig.externals = {
  'blob-stream': 'blob-stream',
  classnames: 'classnames',
  'd3-array': 'd3-array',
  'd3-format': 'd3-format',
  'd3-scale': 'd3-scale',
  'd3-shape': 'd3-shape',
  'd3-time': 'd3-time',
  i18next: 'i18next',
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

packageConfig.plugins = [
  new webpack.DefinePlugin({
    __DEV__,
  }),
  new webpack.LoaderOptionsPlugin({
    debug: false,
  }),
];

packageConfig.mode = 'production';

module.exports = packageConfig;
