/* eslint-disable */
import { configure } from '@kadira/storybook';

function loadStories() {
  require('../stories/index');
  require('../stories/components/trends/cbg/ChartExplainer');
  require('../stories/components/common/controls/TwoOptionToggle');
}

configure(loadStories, module);
