import { addParameters } from '@storybook/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

import './global.css';
import './fonts.css';

addParameters({
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
});
