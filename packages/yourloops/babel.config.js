module.exports = function babelConfig(api) {
  const presets = [
    '@babel/preset-env',
    '@babel/preset-react',
    'babel-preset-react-app',
  ];

  const plugins = [
    // Disable the 'use strict', because it makes d3 crash.
    ['@babel/plugin-transform-modules-commonjs', { strictMode: false }],
  ];

  api.cache(true);

  return {
    presets,
    plugins,
  };
};
