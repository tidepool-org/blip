import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import EditPersonalDetailsDialog from '../../../app/pages/userprofile/EditPersonalDetailsDialog';
import { useUpdateUserProfileMutation } from '../../../app/redux/features/userProfile/userProfileApi';

/* global chai */
/* global sinon */
/* global describe */
/* global it */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

jest.mock('../../../app/redux/features/userProfile/userProfileApi');

const buildState = (user) => ({
  blip: {
    loggedInUserId: 'u1',
    allUsersMap: { u1: { userid: 'u1', ...user } },
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

describe('EditPersonalDetailsDialog', () => {
  let mockMutate;

  beforeEach(() => {
    mockMutate = jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    useUpdateUserProfileMutation.mockReturnValue([mockMutate, { isLoading: false }]);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    it('fires trackMetric and does not call onClose or mutation', () => {
      const { trackMetric, onClose } = renderWith(buildState(clinicianUser));
      fireEvent.click(screen.getByRole('button', { name: 'Update Email' }));
      expect(trackMetric.calledOnceWith('Clicked Update Email in Account')).to.be.true;
      expect(onClose.called).to.be.false;
      expect(mockMutate.mock.calls).to.have.lengthOf(0);
    });
  });

  describe('Save Changes — happy path', () => {
    it('calls mutation with the merged profile payload', async () => {
      const { roleSelect } = renderWith(buildState(clinicianUser));

      fireEvent.change(screen.getByLabelText(/Name/), {
        target: { value: 'Dr. Sally Seastar' },
      });
      fireEvent.change(roleSelect(), {
        target: { value: 'primary_care_physician' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => expect(mockMutate.mock.calls).to.have.lengthOf(1));
      const [profileUpdates] = mockMutate.mock.calls[0];
      expect(profileUpdates.profile.fullName).to.equal('Dr. Sally Seastar');
      expect(profileUpdates.profile.clinic.role).to.equal('primary_care_physician');
    });
  });

  describe('Save Changes — empty name', () => {
    it('shows validation error, disables Save Changes, and does not call mutation', async () => {
      renderWith(buildState(clinicianUser));

      const saveButton = screen.getByRole('button', { name: 'Save Changes' });
      expect(saveButton.disabled).to.be.false;

      fireEvent.change(screen.getByLabelText(/Name/), { target: { value: '' } });

      await screen.findByText('Please enter your full name');
      await waitFor(() => expect(saveButton.disabled).to.be.true);

      fireEvent.click(saveButton);
      expect(mockMutate.mock.calls).to.have.lengthOf(0);
    });
  });

  describe('Save Changes — personal user payload', () => {
    it('omits profile.clinic from the mutation payload', async () => {
      renderWith(buildState(personalUser));

      fireEvent.change(screen.getByLabelText(/Name/), {
        target: { value: 'Pat P. Personal' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => expect(mockMutate.mock.calls).to.have.lengthOf(1));
      const [profileUpdates] = mockMutate.mock.calls[0];
      expect(profileUpdates.profile.fullName).to.equal('Pat P. Personal');
      expect(profileUpdates.profile.clinic).to.be.undefined;
    });
  });

  describe('Cancel', () => {
    it('calls onClose and does not call mutation', () => {
      const { onClose } = renderWith(buildState(clinicianUser));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onClose.calledOnce).to.be.true;
      expect(mockMutate.mock.calls).to.have.lengthOf(0);
    });
  });
});
