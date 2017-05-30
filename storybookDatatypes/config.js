/* eslint-disable */
import { configure } from '@kadira/storybook';

function loadStories() {
  const context = require.context('../storiesDatatypes', true, /.js$/); // Load .js files in /storybook
  context.keys().forEach(context);
}

configure(loadStories, module);
