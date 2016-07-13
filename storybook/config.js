import { configure } from '@kadira/storybook';

function loadStories() {
  require('../stories/views/TandemSettings');
}

configure(loadStories, module);
