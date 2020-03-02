module.exports = {
  stories: ['../stories/**/*.stories.js'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-knobs',
    'storybook-addon-designs',
  ],
  webpackFinal: async config => {
    // do mutation to the config
    return config;
  },
};
