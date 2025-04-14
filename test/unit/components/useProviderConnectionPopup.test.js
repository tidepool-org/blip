import React from 'react';
import useProviderConnectionPopup from '../../../app/components/datasources/useProviderConnectionPopup';
import * as actions from '../../../app/redux/actions';
import { mountWithProviders } from '../../utils/mountWithProviders';

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

describe('useProviderConnectionPopup', function () {
  let wrapper, store;

  const setToast = sinon.stub();
  const providers = {
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
  };

  const api = {
    user: {
      getDataSources: sinon.stub(),
    },
  };

  beforeEach(() => {
    useProviderConnectionPopup.__Rewire__('useToasts', () => ({ set: setToast }));
    useProviderConnectionPopup.__Rewire__('providers', providers);
    useProviderConnectionPopup.__Rewire__('api', api);

    const TestComponent = () => {
      const popup = useProviderConnectionPopup({ popupWatchTimeout: 0 });
      return <div>{popup?.location?.href ? 'Popup Open' : 'No Popup'}</div>;
    };

    const mount = mountWithProviders(<TestComponent />);
    store = mount.store;
    wrapper = mount.wrapper;
  });

  afterEach(() => {
    api.user.getDataSources.resetHistory();
    useProviderConnectionPopup.__ResetDependency__('useToasts');
    useProviderConnectionPopup.__ResetDependency__('providers');
    useProviderConnectionPopup.__ResetDependency__('api');
    setToast.resetHistory();
  });

  it('should open a popup when authorizedDataSource is set', (done) => {
    expect(wrapper.text()).to.equal('No Popup');

    const authorizedDataSource = { id: 'oauth/testProvider', url: `${window.location.origin}/foobar.html`};
    store.dispatch(actions.sync.connectDataSourceSuccess(authorizedDataSource.id, authorizedDataSource.url));
    wrapper.update();

    setTimeout(() => {
      expect(wrapper.text()).to.equal('Popup Open');
      done();
    })
  });

  it('should close the popup, show a toast message, and set justConnectedDataSourceProviderName on authorization success when popup url matches error oauth path', (done) => {
    // Simulate success redirect path
    const authorizedDataSource = { id: 'oauth/testProvider', url: `${window.location.origin}/oauth/testProvider/authorized`};
    store.dispatch(actions.sync.connectDataSourceSuccess(authorizedDataSource.id, authorizedDataSource.url));
    wrapper.update();

    sinon.spy(actions.sync, 'setJustConnectedDataSourceProviderName');

    setTimeout(() => {
      expect(setToast.calledOnce).to.be.true;

      expect(setToast.calledWith({
        message: 'Connection Authorized. Thank you for connecting!',
        variant: 'success',
      })).to.be.true;

      sinon.assert.calledOnce(actions.sync.setJustConnectedDataSourceProviderName);
      sinon.assert.calledWith(actions.sync.setJustConnectedDataSourceProviderName, 'testProvider');

      sinon.restore();

      done();
    }, 1000);
  });

  it('should close the popup and show a toast message on authorization error when popup url matches error oauth path', (done) => {
    // Simulate error redirect path
    const authorizedDataSource = { id: 'oauth/testProvider', url: `${window.location.origin}/oauth/testProvider/error`};
    store.dispatch(actions.sync.connectDataSourceSuccess(authorizedDataSource.id, authorizedDataSource.url));
    wrapper.update();

    setTimeout(() => {
      expect(setToast.calledOnce).to.be.true;
      expect(setToast.calledWith({
        message: 'Connection Authorization Error. Please try again.',
        variant: 'danger',
      })).to.be.true;

      done();
    }, 1000);
  });

  it('should fetch patient data sources when justConnectedDataSourceProviderName state is set', (done) => {
    sinon.assert.notCalled(api.user.getDataSources);

    store.dispatch(actions.sync.setJustConnectedDataSourceProviderName('testProvider'));
    wrapper.update();

    setTimeout(() => {
      sinon.assert.calledOnce(api.user.getDataSources);
      done();
    })
  });
});
