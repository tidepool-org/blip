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

export const setupStore = (preloadedState, dispatchSpy) => {
  const createStoreWithMiddleware = applyMiddleware(thunkMiddleware)(createStore);
  const store = createStoreWithMiddleware(reducer, { blip: preloadedState });
  if (dispatchSpy) store.dispatch = dispatchSpy;
  return store;
};

// Inspired by the redux team recommended approach to testing connected components
// https://redux.js.org/usage/writing-tests#setting-up-a-reusable-test-render-function
// Their examples use react-testing-library, and redux tookit, so perhaps this will stil be useful
// when we migrate to those libraries.
export function mountWithProviders(
  ui,
  {
    preloadedState = {...initialState},
    dispatchSpy,
    // Automatically create a store instance if no store was passed in
    store = setupStore(defaultsDeep(preloadedState, initialState), dispatchSpy),
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
