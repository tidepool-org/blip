import React from 'react';
import { defaultsDeep } from 'lodash';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { mount } from 'enzyme';

import reducers from '../../app/redux/reducers';
import initialState from '../../app/redux/reducers/initialState';
import { ToastProvider } from '../../app/providers/ToastProvider';
import { AppBannerProvider } from '../../app/providers/AppBanner/AppBannerProvider';
import { MemoryRouter, Route } from 'react-router';

const reducer = combineReducers({
  blip: reducers,
  router: {},
});

export const setupStore = preloadedState => {
  const createStoreWithMiddleware = applyMiddleware(thunkMiddleware)(createStore);
  const store = createStoreWithMiddleware(reducer, { blip: preloadedState });
  return store;
};

export function mountWithProviders(
  ui,
  {
    preloadedState = {...initialState},
    // Automatically create a store instance if no store was passed in
    store = setupStore(defaultsDeep(preloadedState, initialState)),
    mountOptions = {}
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/']}>
            <Route path='/' children={() => (
              <AppBannerProvider>
                {children}
              </AppBannerProvider>
            )} />
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );
  }
  return { store, wrapper: mount(ui, { wrappingComponent: Wrapper, ...mountOptions }) };
}
