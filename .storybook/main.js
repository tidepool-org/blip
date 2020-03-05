module.exports = {
  stories: ['../stories/**/*.stories.js'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-knobs',
    'storybook-addon-designs',
    '@storybook/addon-viewport',
  ],
  webpackFinal: async config => {
    // do mutation to the config
    return config;
  },
};
