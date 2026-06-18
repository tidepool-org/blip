import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import { RTKQueryApi } from '../../../app/redux/api/baseApi';

// MFA status now flows through the RTK Query getMfaStatus endpoint, whose queryFn
// calls fetchKeycloakCredentials() then mapKeycloakCredentialsToMfaStatus(). We stub
// those two collaborators to control the component's MFA state per test; the real
// HTTP path is covered by the endpoint test (mfaStatusApi.test.js via MSW).
const mockFetchCreds = jest.fn();
const mockMapMfa = jest.fn();

jest.mock('../../../app/keycloak', () => ({
  __esModule: true,
  redirectToKeycloakAction: jest.fn(),
  fetchKeycloakCredentials: (...args) => mockFetchCreds(...args),
  mapKeycloakCredentialsToMfaStatus: (...args) => mockMapMfa(...args),
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

const disabledMfaStatus = {
  enabled: false,
  enabledTime: null,
  passwordUpdatedTime: null,
  device: { id: null, name: null, registeredTime: null },
  recoveryCodes: { used: 0, total: 12, generatedTime: null },
};

const enabledMfaStatus = (overrides = {}) => ({
  enabled: true,
  enabledTime: '2026-04-01T00:00:00Z',
  passwordUpdatedTime: null,
  device: { id: 'otp-1', name: 'iPhone 17', registeredTime: '2026-04-01T00:00:00Z' },
  recoveryCodes: { used: 1, total: 12, generatedTime: '2026-04-01T00:00:00Z' },
  ...overrides,
});

const makeStore = (blipState) => configureStore({
  reducer: {
    blip: (state = blipState) => state,
    [RTKQueryApi.reducerPath]: RTKQueryApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(RTKQueryApi.middleware),
});

const buildState = (user) => ({
  blip: {
    loggedInUserId: 'u1',
    allUsersMap: { u1: { userid: 'u1', ...user } },
  },
});

const renderWith = (state) => {
  const store = makeStore(state.blip);
  const trackMetric = sinon.stub();
  const api = {};
  const utils = render(
    <Provider store={store}>
      <ToastProvider>
        <UserProfile trackMetric={trackMetric} api={api} />
      </ToastProvider>
    </Provider>
  );
  return { ...utils, trackMetric, api, store };
};

const clinicianUser = {
  roles: ['clinician'],
  username: 'sally@clinic.org',
  profile: {
    fullName: 'Dr. Sally Seastar',
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
  profile: {
    fullName: 'Pat Personal',
  },
};

describe('UserProfile', () => {
  beforeEach(() => {
    // Default: a resolved, disabled MFA status.
    mockFetchCreds.mockReset();
    mockMapMfa.mockReset();
    mockFetchCreds.mockResolvedValue([]);
    mockMapMfa.mockReturnValue(disabledMfaStatus);
    redirectToKeycloakAction.mockClear();
    window.history.pushState({}, '', '/profile');
  });

  afterEach(() => {
    window.history.pushState({}, '', '/profile');
  });

  describe('non-SSO clinician, 2FA disabled', () => {
    it('renders the profile card with name, email, and job title', () => {
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Dr. Sally Seastar')).to.exist;
      // EditPersonalDetailsDialog uses keepMounted=true (project Dialog default at
      // app/components/elements/Dialog.js:220), so the dialog's email card + role
      // options coexist in the DOM with the page's profile card. Relax to getAllByText.
      expect(screen.getAllByText(/sally@clinic\.org/).length).to.be.at.least(1);
      expect(screen.getAllByText(/Endocrinologist/).length).to.be.at.least(1);
    });

    it('renders the Manage password row', () => {
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Manage password')).to.exist;
      expect(screen.getByRole('button', { name: 'Update Password' })).to.exist;
    });

    it('shows the Manage password "Last updated" line when mfaStatus.passwordUpdatedTime is set', async () => {
      mockMapMfa.mockReturnValue({ ...disabledMfaStatus, passwordUpdatedTime: 1779729776172 });
      renderWith(buildState(clinicianUser));
      // The Manage password row is the only "Last updated" caption on the page.
      expect(await screen.findByText(/Last updated/)).to.exist;
    });

    it('hides the Manage password "Last updated" line when passwordUpdatedTime is null', async () => {
      mockMapMfa.mockReturnValue({ ...disabledMfaStatus, passwordUpdatedTime: null });
      renderWith(buildState(clinicianUser));
      await screen.findByText('Manage password');
      expect(screen.queryByText(/Last updated/)).to.be.null;
    });

    it('renders the 2FA row with Disabled pill and Set up 2FA button', async () => {
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Two-factor authentication (2FA)')).to.exist;
      expect(await screen.findByText('Disabled')).to.exist;
      expect(await screen.findByRole('button', { name: 'Set up 2FA' })).to.exist;
    });

    it('does not render the Recovery codes section', async () => {
      renderWith(buildState(clinicianUser));
      await screen.findByText('Disabled');
      expect(screen.queryByText('Recovery Codes')).to.be.null;
    });
  });

  describe('non-SSO clinician, 2FA enabled, low usage', () => {
    beforeEach(() => {
      mockMapMfa.mockReturnValue(enabledMfaStatus({
        recoveryCodes: { used: 1, total: 12, generatedTime: '2026-04-01T00:00:00Z' },
      }));
    });

    it('shows the Enabled pill, device details, and Disable 2FA button', async () => {
      renderWith(buildState(clinicianUser));
      expect(await screen.findByText('2FA Enabled')).to.exist;
      expect(screen.getByText(/iPhone 17/)).to.exist;
      // 'Created' label appears in both the 2FA device panel and the Recovery codes panel.
      expect(screen.getAllByText(/Created/).length).to.be.at.least(1);
      expect(screen.getByRole('button', { name: 'Disable 2FA' })).to.exist;
    });

    it('renders the Recovery codes row with x/total text and Regenerate button', async () => {
      renderWith(buildState(clinicianUser));
      expect(await screen.findByText('Recovery Codes')).to.exist;
      expect(screen.getByText(/1\/12/)).to.exist;
      expect(screen.getByText(/Recovery codes used/)).to.exist;
      expect(screen.getByRole('button', { name: 'Regenerate Codes' })).to.exist;
    });

    it('does not show the low-recovery-codes warning', async () => {
      renderWith(buildState(clinicianUser));
      await screen.findByText('2FA Enabled');
      expect(screen.queryByText(/running low on recovery codes/i)).to.be.null;
    });
  });

  describe('non-SSO clinician, 2FA enabled, at threshold', () => {
    beforeEach(() => {
      mockMapMfa.mockReturnValue(enabledMfaStatus({
        recoveryCodes: { used: 3, total: 12, generatedTime: '2026-04-01T00:00:00Z' },
      }));
    });

    it('renders the low-recovery-codes warning', async () => {
      renderWith(buildState(clinicianUser));
      expect(await screen.findByText(/running low on recovery codes/i)).to.exist;
    });
  });

  describe('SSO clinician', () => {
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
      expect(screen.queryByText('Recovery Codes')).to.be.null;
    });
  });

  describe('button-stub behavior', () => {
    it('fires trackMetric with the documented event name for Edit Personal Details and opens the dialog', () => {
      const { trackMetric } = renderWith(buildState(clinicianUser));
      fireEvent.click(screen.getByRole('button', { name: 'Edit Personal Details' }));
      expect(trackMetric.calledWith('Clicked Edit Personal Details in Account')).to.be.true;
      // Heading (not the button) disambiguates: both share the accessible name
      // 'Edit Personal Details', but the heading only mounts when the dialog opens.
      expect(screen.getByRole('heading', { name: 'Edit Personal Details' })).to.exist;
    });

    it('fires trackMetric and redirects to Keycloak UPDATE_PASSWORD when Update Password is clicked', () => {
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

    it('fires trackMetric and opens the 2FA instructions dialog when Set up 2FA is clicked, without redirecting', async () => {
      const { trackMetric } = renderWith(buildState(clinicianUser));
      fireEvent.click(await screen.findByRole('button', { name: 'Set up 2FA' }));
      expect(trackMetric.calledWith('Clicked Set Up 2FA in Account')).to.be.true;
      // Heading mounts (becomes accessible) only when the dialog opens.
      expect(screen.getByRole('heading', { name: 'Before setting up 2FA' })).to.exist;
      expect(redirectToKeycloakAction.mock.calls).to.have.lengthOf(0);
    });

    it('renders the simplified body paragraphs and drops the advisory cards in the 2FA instructions dialog', async () => {
      renderWith(buildState(clinicianUser));
      fireEvent.click(await screen.findByRole('button', { name: 'Set up 2FA' }));
      expect(screen.getByText(/Only set up two-factor authentication \(2FA\) on individual clinic accounts/)).to.exist;
      expect(screen.getByText(/Verify there are at least two clinic admins in your clinic workspace/)).to.exist;
      expect(screen.queryByText('Use two-factor authentication (2FA) only on individual accounts')).to.be.null;
      expect(screen.queryByText('Review your clinic workspaces')).to.be.null;
    });

    it('redirects to Keycloak CONFIGURE_TOTP when "I understand" is clicked in the dialog', async () => {
      renderWith(buildState(clinicianUser));
      fireEvent.click(await screen.findByRole('button', { name: 'Set up 2FA' }));
      fireEvent.click(screen.getByRole('button', { name: 'I understand' }));
      expect(redirectToKeycloakAction.mock.calls).to.have.lengthOf(1);
      expect(redirectToKeycloakAction.mock.calls[0]).to.deep.equal([
        'CONFIGURE_TOTP',
        `${window.location.origin}/profile`,
      ]);
    });

    it('closes the 2FA dialog without redirecting when Cancel is clicked', async () => {
      renderWith(buildState(clinicianUser));
      fireEvent.click(await screen.findByRole('button', { name: 'Set up 2FA' }));
      expect(screen.getByRole('heading', { name: 'Before setting up 2FA' })).to.exist;
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(redirectToKeycloakAction.mock.calls).to.have.lengthOf(0);
      // keepMounted Dialog stays in the DOM; it becomes inaccessible after the exit transition.
      await waitFor(() =>
        expect(screen.queryByRole('heading', { name: 'Before setting up 2FA' })).to.be.null
      );
    });

    it('fires trackMetric and opens the disable-2FA confirm dialog when Disable 2FA is clicked, without redirecting', async () => {
      mockMapMfa.mockReturnValue(enabledMfaStatus());
      const { trackMetric } = renderWith(buildState(clinicianUser));
      fireEvent.click(await screen.findByRole('button', { name: 'Disable 2FA' }));
      expect(trackMetric.calledWith('Clicked Disable 2FA in Account')).to.be.true;
      expect(screen.getByRole('heading', { name: 'You’re about to disable 2FA' })).to.exist;
      expect(redirectToKeycloakAction.mock.calls).to.have.lengthOf(0);
    });

    it('renders the single body paragraph and drops the advisory cards in the disable-2FA dialog', async () => {
      mockMapMfa.mockReturnValue(enabledMfaStatus());
      renderWith(buildState(clinicianUser));
      fireEvent.click(await screen.findByRole('button', { name: 'Disable 2FA' }));
      expect(screen.getByText(/Disabling 2FA will remove the extra security layer for your account completely/)).to.exist;
      expect(screen.queryByText('Recovery codes will be deleted')).to.be.null;
      expect(screen.queryByText('Two-factor authentication (2FA) will be turned off')).to.be.null;
    });

    it('redirects to Keycloak delete_credential:<id> when "I understand" is clicked in the disable dialog', async () => {
      mockMapMfa.mockReturnValue(enabledMfaStatus());
      renderWith(buildState(clinicianUser));
      fireEvent.click(await screen.findByRole('button', { name: 'Disable 2FA' }));
      fireEvent.click(screen.getByRole('button', { name: 'I understand' }));
      expect(redirectToKeycloakAction.mock.calls).to.have.lengthOf(1);
      expect(redirectToKeycloakAction.mock.calls[0]).to.deep.equal([
        'delete_credential:otp-1',
        `${window.location.origin}/profile`,
      ]);
    });

    it('closes the disable-2FA dialog without redirecting when Cancel is clicked', async () => {
      mockMapMfa.mockReturnValue(enabledMfaStatus());
      renderWith(buildState(clinicianUser));
      fireEvent.click(await screen.findByRole('button', { name: 'Disable 2FA' }));
      expect(screen.getByRole('heading', { name: 'You’re about to disable 2FA' })).to.exist;
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(redirectToKeycloakAction.mock.calls).to.have.lengthOf(0);
      await waitFor(() =>
        expect(screen.queryByRole('heading', { name: 'You’re about to disable 2FA' })).to.be.null
      );
    });

    it('fires trackMetric and opens the regenerate-codes confirm dialog when Regenerate Codes is clicked, without redirecting', async () => {
      mockMapMfa.mockReturnValue(enabledMfaStatus());
      const { trackMetric } = renderWith(buildState(clinicianUser));
      fireEvent.click(await screen.findByRole('button', { name: 'Regenerate Codes' }));
      expect(trackMetric.calledWith('Clicked Regenerate Recovery Codes in Account')).to.be.true;
      expect(screen.getByRole('heading', { name: 'Generate New Recovery Codes'})).to.exist;
      expect(redirectToKeycloakAction.mock.calls).to.have.lengthOf(0);
    });

    it('renders the retitled dialog, single body paragraph, and relabeled confirm button for regenerate codes', async () => {
      mockMapMfa.mockReturnValue(enabledMfaStatus());
      renderWith(buildState(clinicianUser));
      fireEvent.click(await screen.findByRole('button', { name: 'Regenerate Codes' }));
      expect(screen.getByRole('heading', { name: 'Generate New Recovery Codes' })).to.exist;
      expect(screen.getByText(/This will permanently replace your existing recovery codes/)).to.exist;
      expect(screen.getByRole('button', { name: 'Yes, generate new codes' })).to.exist;
      expect(screen.queryByText('You’re downloading a new set of recovery codes')).to.be.null;
    });

    it('redirects to Keycloak CONFIGURE_RECOVERY_AUTHN_CODES when "Yes, generate new codes" is clicked in the regenerate dialog', async () => {
      mockMapMfa.mockReturnValue(enabledMfaStatus());
      renderWith(buildState(clinicianUser));
      fireEvent.click(await screen.findByRole('button', { name: 'Regenerate Codes' }));
      fireEvent.click(screen.getByRole('button', { name: 'Yes, generate new codes' }));
      expect(redirectToKeycloakAction.mock.calls).to.have.lengthOf(1);
      expect(redirectToKeycloakAction.mock.calls[0]).to.deep.equal([
        'CONFIGURE_RECOVERY_AUTHN_CODES',
        `${window.location.origin}/profile`,
      ]);
    });

    it('closes the regenerate-codes dialog without redirecting when Cancel is clicked', async () => {
      mockMapMfa.mockReturnValue(enabledMfaStatus());
      renderWith(buildState(clinicianUser));
      fireEvent.click(await screen.findByRole('button', { name: 'Regenerate Codes' }));
      expect(screen.getByRole('heading', { name: 'Generate New Recovery Codes'})).to.exist;
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(redirectToKeycloakAction.mock.calls).to.have.lengthOf(0);
      await waitFor(() =>
        expect(screen.queryByRole('heading', { name: 'Generate New Recovery Codes'})).to.be.null
      );
    });
  });

  describe('kc_action_status on mount', () => {
    it('shows the cancel toast (info variant) and strips the param when kc_action=UPDATE_PASSWORD&kc_action_status=cancelled', () => {
      window.history.pushState({}, '', '/profile#kc_action=UPDATE_PASSWORD&kc_action_status=cancelled');
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Password reset cancelled.')).to.exist;
      expect(screen.getByText('Password reset cancelled.').closest('.info')).to.exist;
      expect(window.location.hash).to.equal('');
      expect(window.location.pathname).to.equal('/profile');
    });

    it('shows the error toast (danger variant) and strips the param when kc_action=UPDATE_PASSWORD&kc_action_status=error', () => {
      window.history.pushState({}, '', '/profile#kc_action=UPDATE_PASSWORD&kc_action_status=error');
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Password reset error.')).to.exist;
      expect(screen.getByText('Password reset error.').closest('.danger')).to.exist;
      expect(window.location.hash).to.equal('');
    });

    it('shows the success toast and strips the param when kc_action=UPDATE_PASSWORD&kc_action_status=success', () => {
      // /profile is the only page that fires the success toast (Keycloak does
      // not sign the user out in any tested flow). Full Figma copy used verbatim.
      window.history.pushState({}, '', '/profile#kc_action=UPDATE_PASSWORD&kc_action_status=success');
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

    it('shows the email cancel toast (info variant) and strips the params when kc_action=UPDATE_EMAIL&kc_action_status=cancelled', () => {
      window.history.pushState({}, '', '/profile#kc_action=UPDATE_EMAIL&kc_action_status=cancelled');
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Email update cancelled.')).to.exist;
      expect(screen.getByText('Email update cancelled.').closest('.info')).to.exist;
      expect(screen.queryByText('Password reset cancelled.')).to.be.null;
      expect(window.location.hash).to.equal('');
    });

    it('shows the email error toast (danger variant) and strips the params when kc_action=UPDATE_EMAIL&kc_action_status=error', () => {
      window.history.pushState({}, '', '/profile#kc_action=UPDATE_EMAIL&kc_action_status=error');
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Email update error.')).to.exist;
      expect(screen.getByText('Email update error.').closest('.danger')).to.exist;
      expect(window.location.hash).to.equal('');
    });

    it('stays silent on email update success but still strips the params', () => {
      // Success is silent for UPDATE_EMAIL — Keycloak's own flow confirms; we just clean the URL.
      window.history.pushState({}, '', '/profile#kc_action=UPDATE_EMAIL&kc_action_status=success');
      renderWith(buildState(clinicianUser));
      expect(screen.queryByText('Email update success.')).to.be.null;
      expect(screen.queryByText('Password reset successful. You can now log in using your new password.')).to.be.null;
      expect(window.location.hash).to.equal('');
    });

    it('shows the 2FA success toast (success variant) and strips the param when kc_action=CONFIGURE_TOTP&kc_action_status=success', () => {
      window.history.pushState({}, '', '/profile#kc_action=CONFIGURE_TOTP&kc_action_status=success');
      renderWith(buildState(clinicianUser));
      const msg = 'Two-factor authentication (2FA) is now enabled. You’ll be asked for a verification code the next time you log in.';
      expect(screen.getByText(msg)).to.exist;
      expect(screen.getByText(msg).closest('.success')).to.exist;
      expect(window.location.hash).to.equal('');
    });

    it('shows the 2FA error toast (danger variant) and strips the param when kc_action=CONFIGURE_TOTP&kc_action_status=error', () => {
      window.history.pushState({}, '', '/profile#kc_action=CONFIGURE_TOTP&kc_action_status=error');
      renderWith(buildState(clinicianUser));
      const msg = 'We couldn’t complete set up. Your account security hasn’t changed, please try again.';
      expect(screen.getByText(msg)).to.exist;
      expect(screen.getByText(msg).closest('.danger')).to.exist;
      expect(window.location.hash).to.equal('');
    });

    it('shows the 2FA cancelled toast (info variant) and strips the param when kc_action=CONFIGURE_TOTP&kc_action_status=cancelled', () => {
      window.history.pushState({}, '', '/profile#kc_action=CONFIGURE_TOTP&kc_action_status=cancelled');
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Two-factor authentication setup cancelled.')).to.exist;
      expect(screen.getByText('Two-factor authentication setup cancelled.').closest('.info')).to.exist;
      expect(window.location.hash).to.equal('');
    });

    it('shows the disable-2FA success toast (success variant) and strips the param when kc_action=delete_credential&kc_action_status=success', () => {
      window.history.pushState({}, '', '/profile#kc_action=delete_credential&kc_action_status=success');
      renderWith(buildState(clinicianUser));
      const msg = 'Two-factor authentication (2FA) has been disabled. You will now log in using only your email and password.';
      expect(screen.getByText(msg)).to.exist;
      expect(screen.getByText(msg).closest('.success')).to.exist;
      expect(window.location.hash).to.equal('');
    });

    it('shows the disable-2FA error toast (danger variant) and strips the param when kc_action=delete_credential&kc_action_status=error', () => {
      window.history.pushState({}, '', '/profile#kc_action=delete_credential&kc_action_status=error');
      renderWith(buildState(clinicianUser));
      const msg = 'We couldn’t disable two-factor authentication (2FA). Your security settings haven’t changed, please try again.';
      expect(screen.getByText(msg)).to.exist;
      expect(screen.getByText(msg).closest('.danger')).to.exist;
      expect(window.location.hash).to.equal('');
    });

    it('shows the disable-2FA cancelled toast (info variant) and strips the param when kc_action=delete_credential&kc_action_status=cancelled', () => {
      window.history.pushState({}, '', '/profile#kc_action=delete_credential&kc_action_status=cancelled');
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Disabling 2FA cancelled.')).to.exist;
      expect(screen.getByText('Disabling 2FA cancelled.').closest('.info')).to.exist;
      expect(window.location.hash).to.equal('');
    });

    it('matches the suffixed delete_credential:<id> form too (Keycloak may echo the credential id)', () => {
      window.history.pushState({}, '', '/profile#kc_action=delete_credential%3Aotp-1&kc_action_status=success');
      renderWith(buildState(clinicianUser));
      const msg = 'Two-factor authentication (2FA) has been disabled. You will now log in using only your email and password.';
      expect(screen.getByText(msg)).to.exist;
      expect(window.location.hash).to.equal('');
    });

    it('shows the regen-codes success toast (success variant) and strips the param when kc_action=CONFIGURE_RECOVERY_AUTHN_CODES&kc_action_status=success', () => {
      window.history.pushState({}, '', '/profile#kc_action=CONFIGURE_RECOVERY_AUTHN_CODES&kc_action_status=success');
      renderWith(buildState(clinicianUser));
      const msg = 'You have successfully generated a new set of recovery codes.';
      expect(screen.getByText(msg)).to.exist;
      expect(screen.getByText(msg).closest('.success')).to.exist;
      expect(window.location.hash).to.equal('');
    });

    it('shows the regen-codes error toast (danger variant overriding the Figma info-style) and strips the param when kc_action=CONFIGURE_RECOVERY_AUTHN_CODES&kc_action_status=error', () => {
      window.history.pushState({}, '', '/profile#kc_action=CONFIGURE_RECOVERY_AUTHN_CODES&kc_action_status=error');
      renderWith(buildState(clinicianUser));
      const msg = 'Recovery code regeneration failed. Please try again.';
      expect(screen.getByText(msg)).to.exist;
      expect(screen.getByText(msg).closest('.danger')).to.exist;
      expect(window.location.hash).to.equal('');
    });

    it('shows the regen-codes cancelled toast (info variant) and strips the param when kc_action=CONFIGURE_RECOVERY_AUTHN_CODES&kc_action_status=cancelled', () => {
      window.history.pushState({}, '', '/profile#kc_action=CONFIGURE_RECOVERY_AUTHN_CODES&kc_action_status=cancelled');
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Recovery code regeneration cancelled.')).to.exist;
      expect(screen.getByText('Recovery code regeneration cancelled.').closest('.info')).to.exist;
      expect(window.location.hash).to.equal('');
    });

    it('leaves the hash untouched when kc_action is foreign (none of UPDATE_PASSWORD/UPDATE_EMAIL/CONFIGURE_TOTP/delete_credential/CONFIGURE_RECOVERY_AUTHN_CODES)', () => {
      // Foreign kc_action: no toast, no strip — leave the params for a future per-action handler.
      window.history.pushState({}, '', '/profile#kc_action=VERIFY_EMAIL&kc_action_status=cancelled');
      renderWith(buildState(clinicianUser));
      expect(screen.queryByText('Password reset cancelled.')).to.be.null;
      expect(screen.queryByText('Email update cancelled.')).to.be.null;
      expect(window.location.hash).to.equal('#kc_action=VERIFY_EMAIL&kc_action_status=cancelled');
    });

    it('does not show the password toast when kc_action is absent (kc_action_status orphaned)', () => {
      window.history.pushState({}, '', '/profile#kc_action_status=cancelled');
      renderWith(buildState(clinicianUser));
      expect(screen.queryByText('Password reset cancelled.')).to.be.null;
    });

    it('preserves unrelated query parameters when stripping kc_action_status from the hash', () => {
      window.history.pushState({}, '', '/profile?foo=bar#kc_action=UPDATE_PASSWORD&kc_action_status=cancelled');
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

  describe('mfa status fetch (RTK Query)', () => {
    it('fetches the MFA status on mount', async () => {
      renderWith(buildState(clinicianUser));
      await waitFor(() => expect(mockFetchCreds.mock.calls.length).to.be.at.least(1));
    });

    it('shows the Loading pill and a Fetching 2FA Status button while the fetch is in progress', () => {
      // Never-resolving fetch keeps the query in the fetching state.
      mockFetchCreds.mockImplementation(() => new Promise(() => {}));
      renderWith(buildState(clinicianUser));
      expect(screen.getByText('Loading')).to.exist;
      expect(screen.getByRole('button', { name: 'Fetching 2FA Status' })).to.exist;
      expect(screen.queryByRole('button', { name: 'Set up 2FA' })).to.be.null;
    });

    it('shows the Failed to load pill and a Re-fetch 2FA Status button on failure', async () => {
      mockFetchCreds.mockRejectedValue(Object.assign(new Error('nope'), { status: 500 }));
      renderWith(buildState(clinicianUser));
      expect(await screen.findByText('Failed to load')).to.exist;
      expect(screen.getByRole('button', { name: 'Re-fetch 2FA Status' })).to.exist;
      expect(screen.queryByRole('button', { name: 'Set up 2FA' })).to.be.null;
    });

    it('re-fetches the MFA status when Re-fetch 2FA Status is clicked', async () => {
      mockFetchCreds.mockRejectedValue(Object.assign(new Error('nope'), { status: 500 }));
      renderWith(buildState(clinicianUser));
      const retryButton = await screen.findByRole('button', { name: 'Re-fetch 2FA Status' });
      const before = mockFetchCreds.mock.calls.length;
      fireEvent.click(retryButton);
      await waitFor(() => expect(mockFetchCreds.mock.calls.length).to.be.at.least(before + 1));
    });

    it('fires a danger toast when the fetch fails', async () => {
      mockFetchCreds.mockRejectedValue(Object.assign(new Error('nope'), { status: 500 }));
      renderWith(buildState(clinicianUser));
      expect(await screen.findByText('We couldn’t load your two-factor authentication status. Please try again.')).to.exist;
    });
  });
});
