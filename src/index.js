import TandemSettings from './views/settings/TandemSettings';

import TrendsContainer from './containers/trends/TrendsContainer';

import vizReducer from './reducers/';

const containers = {
  TrendsContainer,
};

const views = {
  Settings: { TandemSettings },
};

export { containers, views, vizReducer };
