import { withKnobs } from '@storybook/addon-knobs';

import './global.css';
import './fonts.css';

const preview = {
  decorators: [
    withKnobs,
  ],
};

export default preview;
