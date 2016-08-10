import { configure } from '@kadira/storybook';

function loadStories() {
  require('../stories/views/Settings');
}

configure(loadStories, module);
