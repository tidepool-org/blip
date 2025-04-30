/* global expect, after, before, chai, describe, it, sinon, beforeEach, context */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // for useParams
import configureStore from 'redux-mock-store'; // for mockStore
import { Switch, Route } from 'react-router-dom';

const expect = chai.expect;

import OAuthConnection from '../../../../app/pages/oauth/OAuthConnection';
import { Provider } from 'react-redux';

describe('OAuthConnection', ()  => {
  const mockStore = configureStore([]);
  let store = mockStore({});
  const trackMetric = sinon.stub();

  it('displays an error message when unable to detect', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/oauth/dexcom/unknown']}>
          <Switch>
            <Route path='/oauth/:providerName/:status'>
              <OAuthConnection trackMetric={trackMetric} />
            </Route>
          </Switch>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('We were unable to determine your Dexcom connection status.')).to.exist;
  });

  it('displays a success message when dexcom & authorized', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/oauth/dexcom/authorized']}>
          <Switch>
            <Route path='/oauth/:providerName/:status'>
              {/* will need to use element={} prop instead of passing children after React 18 */}
              <OAuthConnection trackMetric={trackMetric} />
            </Route>
          </Switch>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('You have successfully connected your Dexcom data to Tidepool.')).to.exist;
  });
});
