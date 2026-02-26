import React from 'react';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router';
import { cleanup, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import UploadRedirect from '../../../app/pages/uploadredirect';

/* global sinon */
/* global chai */
/* global context */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

let mockBrowserName = 'Chrome';
const mockCustomProtocolCheck = jest.fn((linkUrl, onFail, onSuccess) => onSuccess());

jest.mock('custom-protocol-check', () => (...args) => mockCustomProtocolCheck(...args));
jest.mock('ua-parser-js', () => jest.fn().mockImplementation(() => ({
  getResult: () => ({ browser: { name: mockBrowserName } }),
})));

describe('UploadRedirect', () => {
  let defaultProps;
  let store;

  const renderWithRoute = (hash = '', propOverrides = {}) => {
    const history = createMemoryHistory({ initialEntries: [`/upload-redirect${hash}`] });

    const renderResult = render(
      <Provider store={store}>
        <Router history={history}>
          <Route
            path="/upload-redirect"
            render={(routeProps) => (
              <UploadRedirect {...routeProps} {...defaultProps} {...propOverrides} />
            )}
          />
          <Route path="/login" render={() => <div>login page</div>} />
        </Router>
      </Provider>
    );

    return {
      history,
      ...renderResult,
    };
  };

  beforeEach(() => {
    defaultProps = {
      t: sinon.stub().callsFake((string) => string),
    };

    store = mockStore({
      blip: {
        allUsersMap: {
          user123: {
            profile: {
              fullName: 'cool user',
            },
          },
        },
        loggedInUserId: 'user123',
      },
    });

    mockCustomProtocolCheck.mockClear();
    mockBrowserName = 'Chrome';
  });

  afterEach(() => {
    store.clearActions();
    cleanup();
  });

  context('no hash provided', () => {
    it('should redirect to `/login`', () => {
      const { history } = renderWithRoute();
      expect(history.location.pathname).to.equal('/login');
    });
  });

  context('hash provided', () => {
    it('should run the custom protocol check with the expected link url', () => {
      renderWithRoute('#someloginhash');
      expect(mockCustomProtocolCheck.mock.calls.length).to.equal(1);
      expect(mockCustomProtocolCheck.mock.calls[0][0]).to.equal('tidepooluploader://localhost/keycloak-redirect#someloginhash');
    });

    it('should contain Chrome specific open text in Chrome', () => {
      const { container } = renderWithRoute('#someloginhash');
      expect(container.textContent).to.include('Click Open Tidepool Uploader on the dialog shown by your browser');
    });

    context('in Firefox', () => {
      it('should contain Firefox specific open text in Firefox', () => {
        mockBrowserName = 'Firefox';
        const { container } = renderWithRoute('#someloginhash');
        expect(container.textContent).to.include('Click Open Link on the dialog shown by your browser');
      });
    });

    context('in Edge', () => {
      it('should contain Edge specific open text in Edge', () => {
        mockBrowserName = 'Edge';
        const { container } = renderWithRoute('#someloginhash');
        expect(container.textContent).to.include('Click Open on the dialog shown by your browser');
      });
    });

    it("shouldn't run the protocol check when component is rendered a second time", () => {
      renderWithRoute('#someloginhash');
      const firstRenderCallCount = mockCustomProtocolCheck.mock.calls.length;
      cleanup();
      renderWithRoute('#someloginhash');
      expect(mockCustomProtocolCheck.mock.calls.length).to.equal(firstRenderCallCount);
    });

    it('should have a link with custom protocol URL attached', () => {
      renderWithRoute('#someloginhash');
      const launchAnchor = document.querySelector('#launch_uploader');
      expect(launchAnchor).to.exist;
      expect(launchAnchor.getAttribute('href')).to.equal(
        'tidepooluploader://localhost/keycloak-redirect#someloginhash'
      );
    });

    context('from profile form', () => {
      it('should contain thank you text', () => {
        const { container } = renderWithRoute('#uploader', {
          location: {
            state: {
              referrer: 'profile',
            },
            hash: '#uploader',
            pathname: '/upload-redirect',
            search: '',
          },
        });

        expect(container.textContent).to.include('Thank you for completing your account registration');
      });
    });

    context('user has no fullName', () => {
      it('should forward the user to the user profile', () => {
        store = mockStore({
          blip: {
            allUsersMap: {
              user123: {
                profile: {},
              },
            },
            loggedInUserId: 'user123',
          },
        });

        renderWithRoute('#someloginhash');

        const expectedActions = [
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: {
              method: 'push',
              args: [
                {
                  pathname: '/profile',
                  state: {
                    referrer: 'upload-launch',
                  },
                },
              ],
            },
          },
        ];

        const actions = store.getActions();
        expect(actions).to.deep.equal(expectedActions);
      });
    });

    context('clinician has no clinic profile', () => {
      it('should forward the user to the clinician profile', () => {
        store = mockStore({
          blip: {
            allUsersMap: {
              user123: {
                isClinicMember: true,
                profile: {},
              },
            },
            loggedInUserId: 'user123',
          },
        });

        renderWithRoute('#someloginhash');

        const expectedActions = [
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: {
              method: 'push',
              args: [
                {
                  pathname: '/clinic-details/profile',
                  state: {
                    referrer: 'upload-launch',
                  },
                },
              ],
            },
          },
        ];

        const actions = store.getActions();
        expect(actions).to.deep.equal(expectedActions);
      });
    });
  });
});
