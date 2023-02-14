import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import UploadRedirect from '../../../app/pages/uploadredirect';

/* global chai */
/* global sinon */
/* global context */
/* global describe */
/* global it */
/* global beforeEach */
/* global before */
/* global after */
/* global afterEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('UploadRedirect', () => {
  let mount;

  let wrapper;
  let createWrapper;
  let defaultProps = {
    t: sinon.stub().callsFake((string) => string),
  };

  let store = mockStore({});
  let win = { close: sinon.stub() };
  let customProtocolCheckStub = sinon.stub().callsArg(2);

  before(() => {
    mount = createMount();
    UploadRedirect.__Rewire__('win', win);
    UploadRedirect.__Rewire__('customProtocolCheck', customProtocolCheckStub);
  });

  after(() => {
    mount.cleanUp();
    UploadRedirect.__ResetDependency__('win');
    UploadRedirect.__ResetDependency__('customProtocolCheck');
  });

  afterEach(() => {
    store.clearActions();
  });

  beforeEach(() => {
    win.close.resetHistory();
    customProtocolCheckStub.resetHistory();

    createWrapper = (hash = '') => {
      return mount(
        <Provider store={store}>
          <MemoryRouter initialEntries={[`/upload-redirect${hash}`]}>
            <Route
              path="/upload-redirect"
              render={(routeProps) => (
                <UploadRedirect {...routeProps} {...defaultProps} />
              )}
            />
          </MemoryRouter>
        </Provider>
      );
    };
  });

  context('no hash provided', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should redirect to `/login`', () => {
      expect(wrapper.find('UploadRedirect')).to.have.lengthOf(0);
      expect(wrapper.find('Router').prop('history').location.pathname).to.equal(
        '/login'
      );
    });
  });

  context('hash provided', () => {
    beforeEach(() => {
      wrapper = createWrapper('#someloginhash');
    });

    it('should run the custom protocol check with the expected link url', () => {
      expect(customProtocolCheckStub.calledOnce).to.be.true;
      expect(
        customProtocolCheckStub.calledWith(
          'tidepooluploader://localhost/keycloak-redirect#someloginhash'
        )
      ).to.be.true;
    });

    it("shouldn't run the protocol check when component is rendered a second time", () => {
      expect(customProtocolCheckStub.notCalled).to.be.true;
    });

    it('should close the window when close link is clicked', () => {
      let closeAnchor = wrapper.find('#close_browser');
      closeAnchor.simulate('click');
      expect(win.close.calledOnce).to.be.true;
    });

    it('should have a link with custom protocol URL attached', () => {
      let launchAnchor = wrapper.find('#launch_uploader');
      expect(launchAnchor).to.have.lengthOf(1);
      expect(launchAnchor.prop('href')).to.equal(
        'tidepooluploader://localhost/keycloak-redirect#someloginhash'
      );
    });
  });
});
