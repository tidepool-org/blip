/* eslint-disable */
import { configure } from '@storybook/react';
import { configureViewport, INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

// configureViewport({
//   viewports: {
//     ...INITIAL_VIEWPORTS,
//   }
// });

function loadStories() {
  const context = require.context('../stories', true, /.js$/); // Load .js files in /storybook
  context.keys().forEach(context);
}

configure(loadStories, module);
