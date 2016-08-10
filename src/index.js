require('./styles/colors.css');

import Medtronic from './containers/settings/medtronic/Medtronic';
import Tandem from './containers/settings/tandem/Tandem';

const views = {
  Settings: {
    Tandem,
    Medtronic,
  },
};

export default views;
