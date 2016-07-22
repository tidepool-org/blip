/* eslint-disable */
import { configure } from '@kadira/storybook';

function loadStories() {
  require('../stories/index');
  require('../stories/components/trends/cbg/ChartExplainer');
}

configure(loadStories, module);
