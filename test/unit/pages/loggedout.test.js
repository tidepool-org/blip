import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import _ from 'lodash';
import LoggedOut from '../../../app/pages/loggedout';
import { Paragraph2 } from '../../../app/components/elements/FontStyles';
import Button from '../../../app/components/elements/Button';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global before */
/* global after */
/* global context */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('LoggedOut', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    t: sinon.stub().callsFake((string) => string),
  };
  let store = mockStore({});
  let keycloakMock = {
    login: sinon.stub(),
  };
  let winMock = {
    location: {
      origin: 'windowOrigin',
    },
  };

  before(() => {
    LoggedOut.__Rewire__('keycloak', keycloakMock);
    LoggedOut.__Rewire__('win', winMock);
    mount = createMount();
  });

  after(() => {
    LoggedOut.__ResetDependency__('keycloak');
    LoggedOut.__ResetDependency__('win');
    mount.cleanUp();
  });

  beforeEach(() => {
    wrapper = mount(
      <Provider store={store}>
        <LoggedOut {...defaultProps} />
      </Provider>
    );
  });

  it('should render signed out message', () => {
    expect(wrapper.find(Paragraph2).text()).to.equal(
      'You have been signed out of your session.'
    );
  });

  it('should call keycloak.login when button clicked', () => {
    expect(keycloakMock.login.callCount).to.equal(0);
    let button = wrapper.find(Button);
    button.simulate('click');
    expect(keycloakMock.login.calledWith({ redirectUri: 'windowOrigin' })).to.be
      .true;
  });
});
