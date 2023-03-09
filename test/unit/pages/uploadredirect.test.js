import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Title } from '../../../app/components/elements/FontStyles';
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
  let customProtocolCheckStub = sinon.stub().callsArg(2);

  before(() => {
    mount = createMount();
    UploadRedirect.__Rewire__('customProtocolCheck', customProtocolCheckStub);
  });

  after(() => {
    mount.cleanUp();
    UploadRedirect.__ResetDependency__('customProtocolCheck');
  });

  afterEach(() => {
    store.clearActions();
  });

  beforeEach(() => {
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

    it('should contain Chrome specific open text in Chrome', () => {
      let title = wrapper.find(Title);
      expect(title.text()).to.include('Click Open Tidepool Uploader on the dialog')
    });

    context('in Firefox', () => {
      before(() => {
        UploadRedirect.__Rewire__('UAParser', () => ({getResult:()=>({browser:{name:'Firefox'}})}))
      })
      after(()=>{
        UploadRedirect.__ResetDependency__('UAParser')
      })
      it('should contain Firefox specific open text in Firefox', () => {
        let title = wrapper.find(Title);
        expect(title.text()).to.include('Click Open Link on the dialog')
      });
    });

    context('in Edge', () => {
      before(() => {
        UploadRedirect.__Rewire__('UAParser', () => ({getResult:()=>({browser:{name:'Edge'}})}))
      })
      after(()=>{
        UploadRedirect.__ResetDependency__('UAParser')
      })
      it('should contain Edge specific open text in Edge', () => {
        let title = wrapper.find(Title);
        expect(title.text()).to.include('Click Open on the dialog')
      });
    });


    it("shouldn't run the protocol check when component is rendered a second time", () => {
      expect(customProtocolCheckStub.notCalled).to.be.true;
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
