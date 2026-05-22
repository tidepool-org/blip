import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { ToastProvider } from '../../../app/providers/ToastProvider';

jest.mock('../../../app/keycloak', () => ({
  __esModule: true,
  redirectToKeycloakAction: jest.fn(),
}));

import { redirectToKeycloakAction } from '../../../app/keycloak';
import EditPersonalDetailsDialog from '../../../app/pages/userprofile/EditPersonalDetailsDialog';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

const defaultWorking = { inProgress: false, completed: false, notification: null };

const buildState = (user, working = defaultWorking) => ({
  blip: {
    loggedInUserId: 'u1',
    allUsersMap: { u1: { userid: 'u1', ...user } },
    working: { updatingUser: working },
  },
});

const clinicianUser = {
  roles: ['clinician'],
  username: 'sally@clinic.org',
  profile: {
    fullName: 'Sally Seastar',
    clinic: { role: 'endocrinologist' },
  },
};

const ssoClinicianUser = {
  ...clinicianUser,
  roles: ['clinician', 'brokered'],
};

const personalUser = {
  roles: [],
  username: 'pat@example.com',
  profile: { fullName: 'Pat Personal' },
};

const renderWith = (state, propsOverrides = {}) => {
  const store = mockStore(state);
  const trackMetric = sinon.stub();
  const onClose = sinon.stub();
  const props = {
    open: true,
    onClose,
    api: {},
    trackMetric,
    ...propsOverrides,
  };
  const utils = render(
    <Provider store={store}>
      <ToastProvider>
        <EditPersonalDetailsDialog {...props} />
      </ToastProvider>
    </Provider>
  );
  const roleSelect = () => screen.queryByLabelText(/Job title/);
  return { ...utils, store, trackMetric, onClose, roleSelect };
};

const updateUserRequests = (store) =>
  store.getActions().filter((a) => a.type === 'UPDATE_USER_REQUEST');

describe('EditPersonalDetailsDialog', () => {
  beforeEach(() => {
    redirectToKeycloakAction.mockClear();
  });

  describe('non-SSO clinician', () => {
    it('prefills Name, Job Title, and Email; shows Update Email button and no SSO caption', () => {
      const { roleSelect } = renderWith(buildState(clinicianUser));
      expect(screen.getByLabelText(/Name/).value).to.equal('Sally Seastar');
      expect(roleSelect().value).to.equal('endocrinologist');
      expect(screen.getByText('sally@clinic.org')).to.exist;
      expect(screen.getByRole('button', { name: 'Update Email' })).to.exist;
      expect(screen.queryByText(/managed via your organization's SSO/)).to.be.null;
    });
  });

  describe('SSO clinician', () => {
    it('hides Update Email button, shows SSO caption, keeps Job Title field', () => {
      const { roleSelect } = renderWith(buildState(ssoClinicianUser));
      expect(screen.queryByRole('button', { name: 'Update Email' })).to.be.null;
      expect(screen.getByText(/managed via your organization's SSO/)).to.exist;
      expect(roleSelect()).to.exist;
    });
  });

  describe('personal user', () => {
    it('hides Job Title field; Update Email button still visible (non-SSO)', () => {
      const { roleSelect } = renderWith(buildState(personalUser));
      expect(roleSelect()).to.be.null;
      expect(screen.getByRole('button', { name: 'Update Email' })).to.exist;
    });
  });

  describe('Update Email click', () => {
    it('fires trackMetric, redirects to Keycloak UPDATE_EMAIL, and does not call onClose or dispatch', () => {
      const { store, trackMetric, onClose } = renderWith(buildState(clinicianUser));
      fireEvent.click(screen.getByRole('button', { name: 'Update Email' }));
      expect(trackMetric.calledOnceWith('Clicked Update Email in Account')).to.be.true;
      expect(redirectToKeycloakAction.mock.calls).to.have.lengthOf(1);
      expect(redirectToKeycloakAction.mock.calls[0]).to.deep.equal([
        'UPDATE_EMAIL',
        `${window.location.origin}/profile`,
      ]);
      expect(onClose.called).to.be.false;
      expect(updateUserRequests(store)).to.have.lengthOf(0);
    });

    it('does not call redirectToKeycloakAction for SSO users (button absent)', () => {
      renderWith(buildState(ssoClinicianUser));
      expect(screen.queryByRole('button', { name: 'Update Email' })).to.be.null;
      expect(redirectToKeycloakAction.mock.calls).to.have.lengthOf(0);
    });
  });

  describe('Save Changes — happy path', () => {
    it('dispatches UPDATE_USER_REQUEST with the merged profile payload', async () => {
      const { store, roleSelect } = renderWith(buildState(clinicianUser));

      fireEvent.change(screen.getByLabelText(/Name/), {
        target: { value: 'Dr. Sally Seastar' },
      });
      fireEvent.change(roleSelect(), {
        target: { value: 'primary_care_physician' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => expect(updateUserRequests(store)).to.have.lengthOf(1));
      const request = updateUserRequests(store)[0];
      expect(request.payload.updatingUser.profile.fullName).to.equal('Dr. Sally Seastar');
      expect(request.payload.updatingUser.profile.clinic.role).to.equal('primary_care_physician');
    });
  });

  describe('Save Changes — empty name', () => {
    it('shows validation error, disables Save Changes, and does not dispatch', async () => {
      const { store } = renderWith(buildState(clinicianUser));

      const saveButton = screen.getByRole('button', { name: 'Save Changes' });
      expect(saveButton.disabled).to.be.false;

      fireEvent.change(screen.getByLabelText(/Name/), { target: { value: '' } });

      await screen.findByText('Please enter your full name');
      await waitFor(() => expect(saveButton.disabled).to.be.true);

      fireEvent.click(saveButton);
      expect(updateUserRequests(store)).to.have.lengthOf(0);
    });
  });

  describe('Save Changes — personal user payload', () => {
    it('omits profile.clinic from the dispatched payload', async () => {
      const { store } = renderWith(buildState(personalUser));

      fireEvent.change(screen.getByLabelText(/Name/), {
        target: { value: 'Pat P. Personal' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => expect(updateUserRequests(store)).to.have.lengthOf(1));
      const profile = updateUserRequests(store)[0].payload.updatingUser.profile;
      expect(profile.fullName).to.equal('Pat P. Personal');
      expect(profile.clinic).to.be.undefined;
    });
  });

  describe('Cancel', () => {
    it('calls onClose and does not dispatch', () => {
      const { store, onClose } = renderWith(buildState(clinicianUser));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onClose.calledOnce).to.be.true;
      expect(updateUserRequests(store)).to.have.lengthOf(0);
    });
  });
});
