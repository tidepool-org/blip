import React from 'react';
import useProviderConnectionPopup from '../../../app/components/datasources/useProviderConnectionPopup';
import * as actions from '../../../app/redux/actions';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router';
import { AppBannerProvider } from '../../../app/providers/AppBanner/AppBannerProvider';
import { setupStore } from '../../utils/mountWithProviders';
import { useToasts } from '../../../app/providers/ToastProvider';
import api from '../../../app/core/api';
import utils from '../../../app/core/utils';

/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global before */
/* global beforeEach */
/* global afterEach */
/* global after */
/* global context */
/* global window */

const expect = chai.expect;

jest.mock('../../../app/providers/ToastProvider', () => {
  const actual = jest.requireActual('../../../app/providers/ToastProvider');
  return {
    ...actual,
    useToasts: jest.fn(),
  };
});

jest.mock('../../../app/components/datasources/DataConnections', () => ({
  providers: {
    testProvider: {
      id: 'oauth/testProvider',
      displayName: 'Test Provider',
      restrictedTokenCreate: {
        paths: [
          '/v1/oauth/testProvider',
        ],
      },
      dataSourceFilter: {
        providerType: 'oauth',
        providerName: 'testProvider',
      },
    },
  },
}));

jest.mock('../../../app/core/api', () => ({
  __esModule: true,
  default: {
    user: {
      getDataSources: jest.fn(),
    },
  },
}));

describe('useProviderConnectionPopup', function () {
  let wrapper, store;
  let mockPopup;
  let openStub;
  let isMobileStub;

  const setToast = sinon.stub();

  const trackMetric = sinon.stub();

  const renderWithProviders = (ui) => {
    const Wrapper = ({ children }) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Route
            path='/'
            children={() => (
              <AppBannerProvider>
                {children}
              </AppBannerProvider>
            )}
          />
        </MemoryRouter>
      </Provider>
    );

    return render(ui, { wrapper: Wrapper });
  };

  beforeEach(() => {
    store = setupStore(undefined);
    useToasts.mockReturnValue({ set: setToast });
    isMobileStub = sinon.stub(utils, 'isMobile').returns(false);

    mockPopup = {
      location: {
        href: `${window.location.origin}/foobar.html`,
        pathname: '/foobar.html',
      },
      closed: false,
      close: sinon.stub().callsFake(() => {
        mockPopup.closed = true;
      }),
    };
    openStub = sinon.stub(window, 'open').returns(mockPopup);

    const TestComponent = () => {
      const popup = useProviderConnectionPopup({ popupWatchTimeout: 0, trackMetric });
      return <div>{popup?.location?.href ? 'Popup Open' : 'No Popup'}</div>;
    };

    wrapper = renderWithProviders(<TestComponent />);
  });

  afterEach(() => {
    api.user.getDataSources.mockReset();
    isMobileStub.restore();
    openStub.restore();
    setToast.resetHistory();
    trackMetric.resetHistory();
  });

  it('should open a popup when authorizedDataSource is set', (done) => {
    sinon.assert.notCalled(trackMetric);
    expect(wrapper.getByText('No Popup')).to.not.equal(null);

    const authorizedDataSource = { id: 'oauth/testProvider', url: `${window.location.origin}/foobar.html`};
    store.dispatch(actions.sync.connectDataSourceSuccess(authorizedDataSource.id, authorizedDataSource.url));

    setTimeout(() => {
      expect(wrapper.getByText('Popup Open')).to.not.equal(null);

      sinon.assert.calledWith(trackMetric, 'Started provider connection flow', {
        providerName: 'testProvider',
        status: null,
      });

      done();
    }, 100);
  });

  it('should close the popup, show a success toast, and set justConnectedDataSourceProviderName on authorization success when popup url matches authorized oauth path', (done) => {
    sinon.assert.notCalled(trackMetric);

    // Simulate success redirect path
    mockPopup.location.href = `${window.location.origin}/oauth/testProvider/authorized`;
    mockPopup.location.pathname = '/oauth/testProvider/authorized';
    const authorizedDataSource = { id: 'oauth/testProvider', url: `${window.location.origin}/oauth/testProvider/authorized`};
    store.dispatch(actions.sync.connectDataSourceSuccess(authorizedDataSource.id, authorizedDataSource.url));

    setTimeout(() => {
      expect(setToast.calledOnce).to.be.true;

      expect(setToast.calledWith({
        message: 'Connection Authorized. Thank you for connecting!',
        variant: 'success',
      })).to.be.true;

      expect(store.getState().blip.justConnectedDataSourceProviderName).to.equal('testProvider');

      sinon.assert.calledWith(trackMetric, 'Completed provider connection flow', {
        providerName: 'testProvider',
        status: 'authorized',
      });

      done();
    }, 1000);
  });

  it('should close the popup and show a toast message on authorization error when popup url matches error oauth path', (done) => {
    // Simulate error redirect path
    mockPopup.location.href = `${window.location.origin}/oauth/testProvider/error`;
    mockPopup.location.pathname = '/oauth/testProvider/error';
    const authorizedDataSource = { id: 'oauth/testProvider', url: `${window.location.origin}/oauth/testProvider/error`};
    store.dispatch(actions.sync.connectDataSourceSuccess(authorizedDataSource.id, authorizedDataSource.url));

    setTimeout(() => {
      expect(setToast.calledOnce).to.be.true;
      expect(setToast.calledWith({
        message: 'Connection Authorization Error. Please try again.',
        variant: 'danger',
      })).to.be.true;

      done();
    }, 1000);
  });

  it('should not show a toast message when the authorization status is `redirect`', (done) => {
    // Simulate interim platform redirect path
    mockPopup.location.href = `${window.location.origin}/v1/oauth/testProvider/redirect`;
    mockPopup.location.pathname = '/v1/oauth/testProvider/redirect';
    const authorizedDataSource = { id: 'oauth/testProvider', url: `${window.location.origin}/v1/oauth/testProvider/redirect`};
    store.dispatch(actions.sync.connectDataSourceSuccess(authorizedDataSource.id, authorizedDataSource.url));

    setTimeout(() => {
      expect(setToast.notCalled).to.be.true;
      done();
    }, 1000);
  });

  it('should fetch patient data sources when justConnectedDataSourceProviderName state is set', (done) => {
    expect(api.user.getDataSources.mock.calls.length).to.equal(0);

    store.dispatch(actions.sync.setJustConnectedDataSourceProviderName('testProvider'));

    setTimeout(() => {
      expect(api.user.getDataSources.mock.calls.length).to.equal(1);
      done();
    }, 100);
  });
});
