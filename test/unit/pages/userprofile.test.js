import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { ToastProvider } from '../../../app/providers/ToastProvider';

const mockSelectMfaStatus = jest.fn();

jest.mock('../../../app/core/selectors', () => {
  const actual = jest.requireActual('../../../app/core/selectors');
  return {
    ...actual,
    selectMfaStatus: (state) => mockSelectMfaStatus(state),
  };
});

jest.mock('../../../app/keycloak', () => ({
  __esModule: true,
  redirectToKeycloakAction: jest.fn(),
}));

import { redirectToKeycloakAction } from '../../../app/keycloak';
import UserProfile from '../../../app/pages/userprofile';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

const disabledMfaStatus = {
  enabled: false,
  enabledTime: null,
  device: { name: null, registeredTime: null },
  recoveryCodes: { used: 0, total: 12, generatedTime: null },
};

const enabledMfaStatus = (overrides = {}) => ({
  enabled: true,
  enabledTime: '2026-04-01T00:00:00Z',
  device: { name: 'iPhone 17', registeredTime: '2026-04-01T00:00:00Z' },
  recoveryCodes: { used: 1, total: 12, generatedTime: '2026-04-01T00:00:00Z' },
  ...overrides,
});

const buildState = (user) => ({
  blip: {
    loggedInUserId: 'u1',
    allUsersMap: { u1: { userid: 'u1', ...user } },
  },
});

const renderWith = (state) => {
  const store = mockStore(state);
  const trackMetric = sinon.stub();
  const api = {};
  const utils = render(
    <Provider store={store}>
      <ToastProvider>
        <UserProfile trackMetric={trackMetric} api={api} />
      </ToastProvider>
    </Provider>
  );
  return { ...utils, trackMetric, api };
};

const clinicianUser = {
  roles: ['clinician'],
  username: 'sally@clinic.org',
  profile: {
    fullName: 'Dr. Sally Seastar',
    clinic: { role: 'endocrinologist' },
    updatedAt: '2025-03-22T11:34:00Z',
  },
};

const ssoClinicianUser = {
  ...clinicianUser,
  roles: ['clinician', 'brokered'],
};

const personalUser = {
  roles: [],
  username: 'pat@example.com',
  profile: {
    fullName: 'Pat Personal',
    updatedAt: '2025-03-22T11:34:00Z',
  },
};

describe('UserProfile', () => {
  beforeEach(() => {
    mockSelectMfaStatus.mockReturnValue(disabledMfaStatus);
    redirectToKeycloakAction.mockClear();
    window.history.pushState({}, '', '/profile');
  });

  afterEach(() => {
    mockSelectMfaStatus.mockReset();
    window.history.pushState({}, '', '/profile');
  });

  describe('non-SSO clinician, 2FA disabled', () => {
    beforeEach(() => {
      mockSelectMfaStatus.mockReturnValue(disabledMfaStatus);
    });

    it('renders the profile card with name, email, job title, and last-updated caption', () => {
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Dr. Sally Seastar')).to.exist;
      // EditPersonalDetailsDialog uses keepMounted=true (project Dialog default at
      // app/components/elements/Dialog.js:220), so the dialog's email card + role
      // options coexist in the DOM with the page's profile card. Relax to getAllByText.
      expect(screen.getAllByText(/sally@clinic\.org/).length).to.be.at.least(1);
      expect(screen.getAllByText(/Endocrinologist/).length).to.be.at.least(1);
      expect(screen.getByText(/Last updated/)).to.exist;
    });

    it('renders the Manage password row', () => {
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Manage password')).to.exist;
      expect(screen.getByRole('button', { name: 'Update Password' })).to.exist;
    });

    it('renders the 2FA row with Disabled pill and Set up 2FA button', () => {
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Two-factor authentication (2FA)')).to.exist;
      expect(screen.getByText('Disabled')).to.exist;
      expect(screen.getByRole('button', { name: 'Set up 2FA' })).to.exist;
    });

    it('does not render the Recovery codes section', () => {
      renderWith(buildState(clinicianUser));
      expect(screen.queryByText('Recovery codes')).to.be.null;
    });
  });

  describe('non-SSO clinician, 2FA enabled, low usage', () => {
    beforeEach(() => {
      mockSelectMfaStatus.mockReturnValue(enabledMfaStatus({
        recoveryCodes: { used: 1, total: 12, generatedTime: '2026-04-01T00:00:00Z' },
      }));
    });

    it('shows the Enabled pill, device details, and Disable 2FA button', () => {
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Enabled')).to.exist;
      expect(screen.getByText(/iPhone 17/)).to.exist;
      expect(screen.getByText(/Registered/)).to.exist;
      expect(screen.getByRole('button', { name: 'Disable 2FA' })).to.exist;
    });

    it('renders the Recovery codes row with x/total text and Regenerate button', () => {
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Recovery codes')).to.exist;
      expect(screen.getByText('1/12')).to.exist;
      expect(screen.getByText(/recovery codes used/)).to.exist;
      expect(screen.getByRole('button', { name: 'Regenerate Codes' })).to.exist;
    });

    it('does not show the low-recovery-codes warning', () => {
      renderWith(buildState(clinicianUser));
      expect(screen.queryByText(/running low on recovery codes/i)).to.be.null;
    });
  });

  describe('non-SSO clinician, 2FA enabled, at threshold', () => {
    beforeEach(() => {
      mockSelectMfaStatus.mockReturnValue(enabledMfaStatus({
        recoveryCodes: { used: 3, total: 12, generatedTime: '2026-04-01T00:00:00Z' },
      }));
    });

    it('renders the low-recovery-codes warning', () => {
      renderWith(buildState(clinicianUser));
      expect(screen.getByText(/running low on recovery codes/i)).to.exist;
    });
  });

  describe('SSO clinician', () => {
    beforeEach(() => {
      mockSelectMfaStatus.mockReturnValue(disabledMfaStatus);
    });

    it('renders the IT-team-managed notice', () => {
      renderWith(buildState(ssoClinicianUser));
      expect(screen.getByText(/managed by your organization's IT team/i)).to.exist;
    });

    it('does not render Update Password, Set up 2FA, Disable 2FA, or Regenerate Codes buttons', () => {
      renderWith(buildState(ssoClinicianUser));
      expect(screen.queryByRole('button', { name: 'Update Password' })).to.be.null;
      expect(screen.queryByRole('button', { name: 'Set up 2FA' })).to.be.null;
      expect(screen.queryByRole('button', { name: 'Disable 2FA' })).to.be.null;
      expect(screen.queryByRole('button', { name: 'Regenerate Codes' })).to.be.null;
    });

    it('still renders the Edit Personal Details button', () => {
      renderWith(buildState(ssoClinicianUser));
      expect(screen.getByRole('button', { name: 'Edit Personal Details' })).to.exist;
    });
  });

  describe('personal user', () => {
    beforeEach(() => {
      mockSelectMfaStatus.mockReturnValue(disabledMfaStatus);
    });

    it('renders the profile card without job title', () => {
      renderWith(buildState(personalUser));
      expect(screen.getByText('Pat Personal')).to.exist;
      expect(screen.queryByText(/Job title:/)).to.be.null;
    });

    it('renders the Manage password row', () => {
      renderWith(buildState(personalUser));
      expect(screen.getByRole('button', { name: 'Update Password' })).to.exist;
    });

    it('does not render the 2FA row or Recovery codes row', () => {
      renderWith(buildState(personalUser));
      expect(screen.queryByText('Two-factor authentication (2FA)')).to.be.null;
      expect(screen.queryByText('Recovery codes')).to.be.null;
    });
  });

  describe('button-stub behavior', () => {
    it('fires trackMetric with the documented event name for Edit Personal Details and opens the dialog', () => {
      mockSelectMfaStatus.mockReturnValue(disabledMfaStatus);
      const { trackMetric } = renderWith(buildState(clinicianUser));
      fireEvent.click(screen.getByRole('button', { name: 'Edit Personal Details' }));
      expect(trackMetric.calledWith('Clicked Edit Personal Details in Account')).to.be.true;
      // Heading (not the button) disambiguates: both share the accessible name
      // 'Edit Personal Details', but the heading only mounts when the dialog opens.
      expect(screen.getByRole('heading', { name: 'Edit Personal Details' })).to.exist;
    });

    it('fires trackMetric and redirects to Keycloak UPDATE_PASSWORD when Update Password is clicked', () => {
      mockSelectMfaStatus.mockReturnValue(disabledMfaStatus);
      const { trackMetric } = renderWith(buildState(clinicianUser));
      fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));
      expect(trackMetric.calledWith('Clicked Update Password in Account')).to.be.true;
      expect(redirectToKeycloakAction.mock.calls).to.have.lengthOf(1);
      expect(redirectToKeycloakAction.mock.calls[0]).to.deep.equal([
        'UPDATE_PASSWORD',
        `${window.location.origin}/profile`,
      ]);
      expect(screen.queryByRole('dialog')).to.be.null;
    });

    it('fires trackMetric for Set up 2FA', () => {
      mockSelectMfaStatus.mockReturnValue(disabledMfaStatus);
      const { trackMetric } = renderWith(buildState(clinicianUser));
      fireEvent.click(screen.getByRole('button', { name: 'Set up 2FA' }));
      expect(trackMetric.calledWith('Clicked Set Up 2FA in Account')).to.be.true;
      expect(screen.queryByRole('dialog')).to.be.null;
    });

    it('fires trackMetric for Disable 2FA', () => {
      mockSelectMfaStatus.mockReturnValue(enabledMfaStatus());
      const { trackMetric } = renderWith(buildState(clinicianUser));
      fireEvent.click(screen.getByRole('button', { name: 'Disable 2FA' }));
      expect(trackMetric.calledWith('Clicked Disable 2FA in Account')).to.be.true;
      expect(screen.queryByRole('dialog')).to.be.null;
    });

    it('fires trackMetric for Regenerate Codes', () => {
      mockSelectMfaStatus.mockReturnValue(enabledMfaStatus());
      const { trackMetric } = renderWith(buildState(clinicianUser));
      fireEvent.click(screen.getByRole('button', { name: 'Regenerate Codes' }));
      expect(trackMetric.calledWith('Clicked Regenerate Recovery Codes in Account')).to.be.true;
      expect(screen.queryByRole('dialog')).to.be.null;
    });
  });

  describe('kc_action_status on mount', () => {
    beforeEach(() => {
      mockSelectMfaStatus.mockReturnValue(disabledMfaStatus);
    });

    it('shows the cancel toast and strips the param when kc_action_status=cancelled', () => {
      window.history.pushState({}, '', '/profile#kc_action_status=cancelled');
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Password reset cancelled.')).to.exist;
      expect(window.location.hash).to.equal('');
      expect(window.location.pathname).to.equal('/profile');
    });

    it('shows the cancel toast and strips the param when kc_action_status=error', () => {
      window.history.pushState({}, '', '/profile#kc_action_status=error');
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Password reset error.')).to.exist;
      expect(window.location.hash).to.equal('');
    });

    it('shows the success toast and strips the param when kc_action_status=success', () => {
      // Per DEC-0018: /profile is the only page that fires the success toast (Keycloak does
      // not sign the user out in any tested flow). Full Figma copy used verbatim.
      window.history.pushState({}, '', '/profile#kc_action_status=success');
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Password reset successful. You can now log in using your new password.')).to.exist;
      expect(window.location.hash).to.equal('');
    });

    it('does not show any toast when kc_action_status is absent', () => {
      window.history.pushState({}, '', '/profile');
      renderWith(buildState(clinicianUser));
      expect(screen.queryByText('Password reset cancelled.')).to.be.null;
      expect(window.location.hash).to.equal('');
    });

    it('preserves unrelated query parameters when stripping kc_action_status from the hash', () => {
      window.history.pushState({}, '', '/profile?foo=bar#kc_action_status=cancelled');
      renderWith(buildState(clinicianUser));
      expect(window.location.search).to.equal('?foo=bar');
      expect(window.location.hash).to.equal('');
    });

    it('preserves OAuth params in the hash while stripping kc_action and kc_action_status', () => {
      // Realistic Keycloak return URL: kc_action* live alongside OAuth state/session_state/code in the hash.
      // Our reader must strip only the kc_action* keys; keycloak-js may still need the OAuth params.
      window.history.pushState(
        {},
        '',
        '/profile#state=abc&session_state=def&iss=https%3A%2F%2Fauth&kc_action=UPDATE_PASSWORD&kc_action_status=cancelled&code=xyz'
      );
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Password reset cancelled.')).to.exist;
      // Hash retains everything except kc_action and kc_action_status, in original order.
      expect(window.location.hash).to.equal('#state=abc&session_state=def&iss=https%3A%2F%2Fauth&code=xyz');
    });
  });
});
