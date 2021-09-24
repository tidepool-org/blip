import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { ToastProvider } from '../../../../app/providers/ToastProvider';
import InviteMember from '../../../../app/pages/share/InviteMember';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global before */
/* global after */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('InviteMember', () => {
  let mount;

  let wrapper;
  const defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      invitation: {
        send: sinon.stub(),
      },
    },
  };

  before(() => {
    mount = createMount();
  });

  after(() => {
    mount.cleanUp();
  });

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const state = {
    blip: {
      loggedInUserId: 'patient123',
      working: {
        sendingInvite: defaultWorkingState,
      },
    },
  };

  let store;

  beforeEach(() => {
    store = mockStore(state);
    defaultProps.trackMetric.resetHistory();

    wrapper = mount(
      <Provider store={store}>
        <ToastProvider>
          <InviteMember {...defaultProps} />
        </ToastProvider>
      </Provider>
    );
  });

  it('should show an invite form with an email address field and an upload permissions checkbox', () => {
    const form = wrapper.find('form#invite-member');
    expect(form).to.have.length(1);

    const emailField = wrapper.find('input#email[type="text"]');
    expect(emailField).to.have.length(1);

    const permissionsCheckbox = wrapper.find('input#uploadPermission[type="checkbox"]');
    expect(permissionsCheckbox).to.have.length(1);
  });

  it('should go back to main share page if cancel is clicked', () => {
    const cancelButton = wrapper.find('button#cancel');
    expect(cancelButton).to.have.length(1);

    const expectedActions = [
      {
        type: '@@router/CALL_HISTORY_METHOD',
        payload: {
          args: [
            '/patients/patient123/share',
          ],
          method: 'push',
        },
      },
    ];

    cancelButton.props().onClick();
    const actions = store.getActions();
    expect(actions).to.eql(expectedActions);
  });

  it('should navigate to the share code invite form if link is clicked', () => {
    const shareCodeInviteLink = wrapper.find('button#shareCodeInviteLink');
    expect(shareCodeInviteLink).to.have.length(1);

    const expectedActions = [
      {
        type: '@@router/CALL_HISTORY_METHOD',
        payload: {
          args: [
            '/patients/patient123/share/clinic',
          ],
          method: 'push',
        },
      },
    ];

    shareCodeInviteLink.props().onClick();
    const store = wrapper.props().store;
    const actions = store.getActions();
    expect(actions).to.eql(expectedActions);
  });

  it('should sumbit an invitation if submit is clicked', (done) => {
    const submitButton = () => wrapper.find('button#submit');
    expect(submitButton()).to.have.length(1);
    expect(submitButton().prop('disabled')).to.be.true;

    const emailField = wrapper.find('input#email[type="text"]');
    expect(emailField).to.have.length(1);

    // input bad email, submit remains disabled
    emailField.simulate('change', { target: { id: 'email', value: 'clint@foo'} })
    expect(submitButton().prop('disabled')).to.be.true;

    // input good email, submit becomes enabled
    emailField.simulate('change', { target: { id: 'email', value: 'clint@foo.com'} })
    expect(submitButton().prop('disabled')).to.be.false;

    // enable upload permission
    const permissionsCheckbox = wrapper.find('input#uploadPermission[type="checkbox"]');
    permissionsCheckbox.simulate('change', {
      target: { id: 'uploadPermission', value: true },
    });

    const expectedActions = [
      {
        type: 'SEND_INVITE_REQUEST',
      },
    ];

    submitButton().simulate('submit');
    const actions = store.getActions();

    // Formik submissions are async, so need to wrap in a timeout and call done()
    window.setTimeout(() => {
      expect(actions).to.eql(expectedActions);
      sinon.assert.calledWith(
        defaultProps.api.invitation.send,
        'clint@foo.com',
        { note: {}, upload: {}, view: {} }
      );
      done();
    }, 0);
  });
});
