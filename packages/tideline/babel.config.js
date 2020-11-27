module.exports = function babelConfig(api) {
  const presets = [
    '@babel/preset-env',
    '@babel/preset-react',
    'babel-preset-react-app',
  ];

  const plugins = [
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-proposal-class-properties',
  ];

  const env = api.env();

  if (env === 'test') {
    plugins.unshift(
      ['babel-plugin-istanbul', {
        useInlineSourceMaps: false,
      }],
      'babel-plugin-rewire'
    );
  }

  api.cache(true);

  return {
    presets,
    plugins,
  };
};
