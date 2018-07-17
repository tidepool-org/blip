/* eslint-disable */
import { configure } from '@storybook/react';

function loadStories() {
  const context = require.context('../storiesDatatypes', true, /.js$/); // Load .js files in /storybook
  context.keys().forEach(context);
}

configure(loadStories, module);
