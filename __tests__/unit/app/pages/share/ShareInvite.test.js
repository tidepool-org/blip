/* global jest, expect, describe, it, beforeAll, beforeEach, afterAll, afterEach, Promise */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import '@app/core/language';
import ShareInvite from '@app/pages/share/ShareInvite';
import blipReducer from '@app/redux/reducers';
import initialState from '@app/redux/reducers/initialState';
import { ToastProvider } from '@app/providers/ToastProvider';
import { setupStore } from '@tests/utils/setupStore';

const loggedInUserId = 'patient123';

// The code the patient types: it belonged to a workspace that has since been
// merged away, so the API resolves it to a clinic with a different share code.
const mergedShareCode = 'ABCD-EFGH-JKLM';

const survivingClinic = {
  id: 'clinic123',
  name: 'Surviving Clinic',
  shareCode: 'NPQR-STUV-WXY2',
  address: '1 Address Ln, City Zip',
};

// A second clinic, for the lookup that follows Back with a different code.
const otherShareCode = 'PQRS-TUVW-XYZ2';

const otherClinic = {
  id: 'clinic456',
  name: 'Other Clinic',
  shareCode: otherShareCode,
  address: '2 Address Ln, City Zip',
};

const completed = { inProgress: false, completed: true, notification: null };

const blipState = {
  ...initialState,
  loggedInUserId,
  working: {
    ...initialState.working,
    fetchingAssociatedAccounts: completed,
    fetchingClinicsForPatient: completed,
    fetchingPatient: completed,
    fetchingPendingSentInvites: completed,
  },
  clinics: {
    clinicIDNotMember: {
      clinicians: {},
      patients: {},
      shareCode: '2222-2222-2222',
      id: 'clinicIDNotMember',
      name: 'other_clinic_name',
    },
    clinicIDNotMemberButPending: {
      clinicians: {},
      patients: {},
      shareCode: '4444-4444-4444',
      id: 'clinicIDNotMemberButPending',
      name: 'pending_clinic_name',
    },
    clinicIDAmMember: {
      clinicians: {},
      patients: {
        [loggedInUserId]: {
          email: 'patient@example.com',
          id: loggedInUserId,
          permissions: { view: {}, upload: {} },
        },
      },
      shareCode: '3333-3333-3333',
      id: 'clinicIDAmMember',
      name: 'new_clinic_name',
    },
  },
  allUsersMap: {
    otherPatient123: {
      emails: ['existingShare@example.com'],
      userid: 'otherPatient123',
    },
  },
  membersOfTargetCareTeam: ['otherPatient123'],
  permissionsOfMembersInTargetCareTeam: {
    otherPatient123: { view: {}, upload: {} },
  },
  pendingSentInvites: [
    {
      clinicId: 'clinicIDNotMemberButPending',
      key: '123',
      context: { view: {} },
      status: 'pending',
      type: 'careteam_invitation',
    },
    {
      email: 'pendingShare@example.com',
      key: '789',
      context: { view: {}, upload: {} },
      status: 'pending',
      type: 'careteam_invitation',
    },
  ],
};

const shareCodeUrl = 'http://app.tidepool.test/v1/clinics/share_code/:shareCode';

// Holds a lookup response open until released, so the in-flight render can be
// asserted while the request is still outstanding.
const deferredResponse = () => {
  let release;
  const released = new Promise((resolve) => { release = resolve; });

  return { released, release };
};

const server = setupServer();

describe('ShareInvite', () => {
  let api;
  let trackMetric;
  let requestedCodes;

  const shareCodeField = () => screen.queryByPlaceholderText('Enter share code');
  const emailField = () => screen.getByPlaceholderText('Enter email address');
  const clinicNameField = () => screen.queryByLabelText('Clinic Name');
  const uploadCheckboxes = () => screen.getAllByLabelText('Allow upload of data');
  const submitButton = () => screen.getByRole('button', { name: /Submit Code|Send Invite|Invite Member/ });
  const backButton = () => screen.getByRole('button', { name: /^(Back|Cancel)$/ });
  const toastCloseButton = () => screen.getByRole('button', { name: 'close message' });

  const renderShareInvite = () => {
    const store = setupStore({ blip: blipState }, { blip: blipReducer });

    return render(
      <Provider store={store}>
        <ToastProvider>
          <ShareInvite api={api} trackMetric={trackMetric} />
        </ToastProvider>
      </Provider>
    );
  };

  // Types a share code and submits, leaving the form in whatever state the
  // lookup produces.
  const submitShareCode = async (code) => {
    fireEvent.change(shareCodeField(), { target: { value: code } });
    await waitFor(() => expect(submitButton()).toBeEnabled());
    fireEvent.submit(submitButton());
  };

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  beforeEach(() => {
    requestedCodes = [];

    server.use(
      http.get(shareCodeUrl, ({ params }) => {
        requestedCodes.push(params.shareCode);

        return HttpResponse.json(survivingClinic);
      })
    );

    api = {
      clinics: {
        inviteClinic: jest.fn((shareCode, permissions, patientId, cb) => cb(null, {})),
      },
      invitation: {
        send: jest.fn((email, permissions, cb) => cb(null, {})),
      },
    };

    trackMetric = jest.fn();
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  describe('clinic invite', () => {
    it('shows the clinic the API resolved the code to, even when its canonical share code differs', async () => {
      renderShareInvite();

      expect(clinicNameField()).toBeNull();

      await submitShareCode(mergedShareCode);

      await waitFor(() => expect(clinicNameField()).not.toBeNull());

      expect(requestedCodes).toEqual([mergedShareCode]);
      expect(clinicNameField()).toHaveValue(survivingClinic.name);
      expect(clinicNameField()).toBeDisabled();
      expect(shareCodeField()).toBeNull();
    });

    it('sends the invite addressed by the canonical share code, not the entered one', async () => {
      renderShareInvite();

      await submitShareCode(mergedShareCode);
      await waitFor(() => expect(clinicNameField()).not.toBeNull());

      fireEvent.submit(submitButton());

      await waitFor(() => expect(api.clinics.inviteClinic).toHaveBeenCalled());

      expect(api.clinics.inviteClinic).toHaveBeenCalledWith(
        survivingClinic.shareCode,
        { view: {}, note: {}, upload: {} },
        loggedInUserId,
        expect.any(Function)
      );
    });

    it('omits upload from the invite permissions when the upload checkbox is unchecked', async () => {
      renderShareInvite();

      await submitShareCode(mergedShareCode);
      await waitFor(() => expect(clinicNameField()).not.toBeNull());

      fireEvent.click(uploadCheckboxes()[0]);
      await waitFor(() => expect(uploadCheckboxes()[0]).not.toBeChecked());

      fireEvent.submit(submitButton());

      await waitFor(() => expect(api.clinics.inviteClinic).toHaveBeenCalled());

      expect(api.clinics.inviteClinic).toHaveBeenCalledWith(
        survivingClinic.shareCode,
        { view: {}, note: {} },
        loggedInUserId,
        expect.any(Function)
      );
    });

    it('shows a danger toast and stays on code entry when the lookup fails', async () => {
      server.use(http.get(shareCodeUrl, ({ params }) => {
        requestedCodes.push(params.shareCode);

        return new HttpResponse(null, { status: 404 });
      }));

      renderShareInvite();

      await submitShareCode(mergedShareCode);

      expect(
        await screen.findByText('We were unable to find a clinic with that share code.')
      ).toBeInTheDocument();

      expect(clinicNameField()).toBeNull();
      expect(shareCodeField()).not.toBeNull();

      // A single request: the endpoint's retryCondition excludes 404 from the
      // base query's retries.
      expect(requestedCodes).toEqual([mergedShareCode]);
    });

    // Edge case. Guards the setSubmittedShareCode(null) reset in the fetch-error effect:
    // without it the resubmit sets identical state, so no arg change reaches
    // the query and the second attempt gives the patient no feedback.
    it('re-fetches when the same failing code is resubmitted, rather than silently no-oping', async () => {
      server.use(http.get(shareCodeUrl, ({ params }) => {
        requestedCodes.push(params.shareCode);

        return new HttpResponse(null, { status: 404 });
      }));

      renderShareInvite();

      await submitShareCode(mergedShareCode);
      await screen.findByText('We were unable to find a clinic with that share code.');

      // Dismiss the first toast, so the one asserted after the resubmit can
      // only be a newly raised one.
      fireEvent.click(toastCloseButton());

      await waitFor(() => expect(
        screen.queryByText('We were unable to find a clinic with that share code.')
      ).not.toBeInTheDocument());

      fireEvent.submit(submitButton());

      await waitFor(() => expect(requestedCodes).toEqual([mergedShareCode, mergedShareCode]));

      expect(
        await screen.findByText('We were unable to find a clinic with that share code.')
      ).toBeInTheDocument();
    });

    it('returns to code entry with no stale clinic when Back is clicked', async () => {
      renderShareInvite();

      await submitShareCode(mergedShareCode);
      await waitFor(() => expect(clinicNameField()).not.toBeNull());

      fireEvent.click(backButton());

      await waitFor(() => expect(clinicNameField()).toBeNull());

      expect(shareCodeField()).not.toBeNull();
    });

    it('shows no stale clinic while a different code submitted after Back is in flight', async () => {
      const { released, release } = deferredResponse();

      renderShareInvite();

      await submitShareCode(mergedShareCode);
      await waitFor(() => expect(clinicNameField()).not.toBeNull());

      fireEvent.click(backButton());
      await waitFor(() => expect(clinicNameField()).toBeNull());

      server.use(http.get(shareCodeUrl, async ({ params }) => {
        requestedCodes.push(params.shareCode);
        await released;

        return HttpResponse.json(otherClinic);
      }));

      await submitShareCode(otherShareCode);

      // The observed request confirms the second lookup is outstanding and
      // still gated: the clinic field must stay absent rather than fall back
      // to the first lookup's result.
      await waitFor(() => expect(requestedCodes).toEqual([mergedShareCode, otherShareCode]));

      expect(clinicNameField()).toBeNull();

      release();

      await waitFor(() => expect(clinicNameField()).toHaveValue(otherClinic.name));
    });

    it('shows the submit button as processing while the lookup is in flight, then re-enables it', async () => {
      const { released, release } = deferredResponse();

      server.use(http.get(shareCodeUrl, async ({ params }) => {
        requestedCodes.push(params.shareCode);
        await released;

        return HttpResponse.json(survivingClinic);
      }));

      renderShareInvite();

      await submitShareCode(mergedShareCode);

      await waitFor(() => expect(submitButton()).toHaveClass('processing'));

      expect(submitButton()).toBeDisabled();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      release();

      await waitFor(() => expect(clinicNameField()).not.toBeNull());

      expect(submitButton()).toBeEnabled();
      expect(submitButton()).not.toHaveClass('processing');
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('blocks a share code already shared with or pending', async () => {
      renderShareInvite();

      fireEvent.change(shareCodeField(), { target: { value: '3333-3333-3333' } });
      await waitFor(() => expect(submitButton()).toBeDisabled());

      fireEvent.change(shareCodeField(), { target: { value: '4444-4444-4444' } });
      await waitFor(() => expect(submitButton()).toBeDisabled());

      fireEvent.blur(shareCodeField());

      expect(
        await screen.findByText('You are already sharing with this clinic. Please enter a new share code.')
      ).toBeInTheDocument();

      fireEvent.change(shareCodeField(), { target: { value: '2222-2222-2222' } });
      await waitFor(() => expect(submitButton()).toBeEnabled());
    });
  });

  describe('member invite', () => {
    const selectMemberType = () => {
      fireEvent.click(screen.getByRole('radio', { name: 'Share with a Care Team Member' }));
    };

    it('sends a member invite and shows the success toast', async () => {
      renderShareInvite();
      selectMemberType();

      fireEvent.change(emailField(), { target: { value: 'clint@foo.com' } });
      await waitFor(() => expect(submitButton()).toBeEnabled());

      fireEvent.submit(submitButton());

      await waitFor(() => expect(api.invitation.send).toHaveBeenCalledWith(
        'clint@foo.com',
        { view: {}, note: {}, upload: {} },
        expect.any(Function)
      ));

      expect(
        await screen.findByText('Share invite to clint@foo.com has been sent.')
      ).toBeInTheDocument();
    });

    it('blocks an email already shared with or pending', async () => {
      renderShareInvite();
      selectMemberType();

      fireEvent.change(emailField(), { target: { value: 'pendingShare@example.com' } });
      await waitFor(() => expect(submitButton()).toBeDisabled());

      fireEvent.change(emailField(), { target: { value: 'existingShare@example.com' } });
      await waitFor(() => expect(submitButton()).toBeDisabled());

      fireEvent.blur(emailField());

      expect(
        await screen.findByText('You are already sharing with this care team member. Please enter a new email.')
      ).toBeInTheDocument();

      fireEvent.change(emailField(), { target: { value: 'clint@foo.com' } });
      await waitFor(() => expect(submitButton()).toBeEnabled());
    });
  });
});
