module.exports = function babelConfig(api) {
  const presets = [
    '@babel/preset-env',
    '@babel/preset-react',
    'babel-preset-react-app',
  ];

  const plugins = [
    '@babel/plugin-transform-modules-commonjs',
  ];

  const env = api.env();

  if (env === 'dev') {
    plugins.unshift(
      'react-hot-loader/babel',
    );
  }

  if (env === 'test') {
    plugins.unshift(
      ['babel-plugin-istanbul', {
        useInlineSourceMaps: false,
      }],
      'babel-plugin-rewire',
    );
  }

  api.cache(true);

  return {
    presets,
    plugins,
  };
};
