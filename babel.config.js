module.exports = function babelConfig(api) {
  api.cache(true);

  const env = {
    test: {
      plugins: [
        'istanbul',
      ],
    },
  };

  const presets = [
    '@babel/preset-env',
    '@babel/preset-react',
    'babel-preset-react-app',
  ];

  const plugins = [
    'react-hot-loader/babel',
    '@babel/plugin-transform-modules-commonjs',
  ];

  return {
    env,
    presets,
    plugins,
  };
};
