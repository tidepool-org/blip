/* global jest, expect, describe, it, beforeAll, beforeEach, afterAll, afterEach */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import Workspaces from '@app/pages/workspaces';
import blipReducer from '@app/redux/reducers';
import initialState from '@app/redux/reducers/initialState';
import { ToastProvider } from '@app/providers/ToastProvider';
import utils from '@app/core/utils';
import { setupStore } from '@tests/utils/setupStore';

const mockUseFlags = jest.fn();
jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: () => mockUseFlags(),
}));

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const loggedInUserId = 'clinician123';
const refreshedCounts = { demo: 1, plan: 5, total: 6 };
const server = setupServer();

const clinic = (id, name, role, extra = {}) => ({
  id,
  name,
  clinicians: {
    [loggedInUserId]: { id: loggedInUserId, roles: [role] },
    otherAdmin: { id: 'otherAdmin', roles: ['CLINIC_ADMIN'] },
  },
  ...extra,
});

const adminClinics = {
  alpha: clinic('alpha', 'Alpha Clinic', 'CLINIC_ADMIN', {
    patientTags: [{ id: 'tag1', name: 'Imported' }],
    patientCounts: { demo: 1, plan: 1, total: 2 },
  }),
  beta: clinic('beta', 'Beta Clinic', 'CLINIC_ADMIN'),
};

describe('Workspaces', () => {
  let api;
  let trackMetric;
  let store;
  let requests;

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  beforeEach(() => {
    requests = [];
    trackMetric = jest.fn();
    api = {
      clinics: {
        getClinicsForClinician: jest.fn((clinicianId, options, cb) => cb(null, [])),
        getClinicPatientCount: jest.fn((clinicId, cb) => cb(null, refreshedCounts)),
        getCliniciansFromClinic: jest.fn(),
      },
    };
    mockUseFlags.mockReturnValue({ showWorkspaceMerge: true });
    jest.spyOn(utils, 'downloadBlob').mockImplementation(() => {});
  });

  afterEach(() => {
    server.resetHandlers();
    utils.downloadBlob.mockRestore();
  });

  afterAll(() => server.close());

  const renderPage = (blipOverrides = {}) => {
    store = setupStore({
      blip: {
        ...initialState,
        loggedInUserId,
        working: {
          ...initialState.working,
          fetchingClinicianInvites: { inProgress: false, completed: true, notification: null },
        },
        clinics: adminClinics,
        ...blipOverrides,
      },
    }, { blip: blipReducer });

    render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter>
            <Workspaces api={api} trackMetric={trackMetric} />
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );
  };

  const recordRequests = (path, respond) => server.use(
    http.post(`http://app.tidepool.test/v1/${path}`, async ({ request, params }) => {
      requests.push({ clinicId: params.clinicId, body: await request.json() });
      return respond();
    })
  );

  describe('merging workspaces', () => {
    const mergeLink = () => screen.queryByRole('button', { name: 'Merge Workspaces' });
    // An open modal marks the rest of the page aria-hidden, so role queries opt in to hidden nodes.
    const mergeDialog = () => within(screen.getByRole('dialog', { name: 'Merge Workspaces', hidden: true }));
    const confirmDialog = () => within(screen.getByRole('dialog', { name: 'Confirm Merge', hidden: true }));
    const reportButton = () => screen.getByRole('button', { name: 'Download Merge Report', hidden: true });
    const confirmButton = () => confirmDialog().getByRole('button', { name: 'Merge', hidden: true });

    // The MUI dialog stays mounted while closed, marked aria-hidden or hidden by style.
    const dialogOpen = (id) => {
      const dialog = document.getElementById(id);
      return dialog.getAttribute('aria-hidden') !== 'true' && dialog.style.visibility !== 'hidden';
    };

    const choose = (label, name) => userEvent.type(screen.getByLabelText(label), `${name}{Enter}`);

    const openDialog = async ({ source = true } = {}) => {
      await userEvent.click(mergeLink());
      if (source) await choose('Merge from', 'Beta');
      await choose('Merge into', 'Alpha');
    };

    const confirmMerge = async () => {
      await userEvent.click(mergeDialog().getByRole('button', { name: 'Merge', hidden: true }));
      await userEvent.click(confirmDialog().getByRole('checkbox', { hidden: true }));
      await userEvent.click(confirmButton());
    };

    it('should offer no merge link or dialog when the flag is off', () => {
      mockUseFlags.mockReturnValue({});
      renderPage();

      expect(mergeLink()).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog', { name: 'Merge Workspaces', hidden: true })).not.toBeInTheDocument();
    });

    it('should offer no merge link when the user administers no clinic', () => {
      renderPage({ clinics: { alpha: clinic('alpha', 'Alpha Clinic', 'CLINIC_MEMBER') } });

      expect(mergeLink()).not.toBeInTheDocument();
    });

    it('should open the merge dialog from the header link', async () => {
      renderPage();
      expect(dialogOpen('mergeWorkspacesDialog')).toBe(false);

      await userEvent.click(mergeLink());

      expect(dialogOpen('mergeWorkspacesDialog')).toBe(true);
      expect(trackMetric).toHaveBeenCalledWith('Clinic - Workspaces - Merge workspaces opened');
    });

    describe('merge report', () => {
      const reportUrl = 'clinics/:clinicId/reports/merge';

      it('should request a report for both workspaces, download it under the server filename and keep the dialog open', async () => {
        recordRequests(reportUrl, () => new HttpResponse('xlsx-bytes', {
          headers: { 'content-type': XLSX_TYPE, 'content-disposition': 'attachment; filename=merge-report-123.xlsx' },
        }));
        renderPage();
        await openDialog();
        await userEvent.click(reportButton());

        await screen.findByText('Your merge report will download shortly.');
        expect(requests).toEqual([{ clinicId: 'alpha', body: { sourceId: 'beta' } }]);
        const [blob, filename] = utils.downloadBlob.mock.calls[0];
        expect(await blob.text()).toBe('xlsx-bytes');
        expect(filename).toBe('merge-report-123.xlsx');
        expect(trackMetric).toHaveBeenCalledWith('Clinic - Workspaces - Merge report', { sourceId: 'beta', targetId: 'alpha' });
        expect(dialogOpen('mergeWorkspacesDialog')).toBe(true);
      });

      it('should request a single-workspace report with an empty body and fall back to a default filename', async () => {
        recordRequests(reportUrl, () => new HttpResponse('xlsx-bytes', { headers: { 'content-type': XLSX_TYPE } }));
        renderPage();
        await openDialog({ source: false });
        await userEvent.click(reportButton());

        await screen.findByText('Your merge report will download shortly.');
        expect(requests).toEqual([{ clinicId: 'alpha', body: {} }]);
        expect(utils.downloadBlob.mock.calls[0][1]).toBe('Merge Report.xlsx');
        expect(trackMetric).toHaveBeenCalledWith('Clinic - Workspaces - Merge report', { targetId: 'alpha' });
      });

      it('should show the Clinic Success toast without retrying when the report is refused', async () => {
        recordRequests(reportUrl, () => new HttpResponse(null, { status: 403 }));
        renderPage();
        await openDialog();
        await userEvent.click(reportButton());

        await screen.findByText('Contact Clinic Success to review your merge report');
        expect(requests).toHaveLength(1);
        expect(utils.downloadBlob).not.toHaveBeenCalled();
      });
    });

    describe('merge', () => {
      const mergeUrl = 'clinics/:clinicId/merge';

      it('should send the confirmed merge, close both dialogs, drop the source workspace and refresh the target', async () => {
        recordRequests(mergeUrl, () => new HttpResponse(null, { status: 200 }));
        renderPage();
        await openDialog();
        await choose('Tag', 'Imported');
        await confirmMerge();

        await screen.findByText('Merge successful');
        expect(requests).toEqual([{
          clinicId: 'alpha',
          body: { sourceId: 'beta', sourcePatientTag: 'Imported', confirmed: true },
        }]);
        expect(trackMetric).toHaveBeenCalledWith('Clinic - Workspaces - Merge confirmed', { sourceId: 'beta', targetId: 'alpha' });

        // A dialog reads as closed once its exit transition ends.
        await waitFor(() => expect(dialogOpen('mergeWorkspacesDialog')).toBe(false));
        await waitFor(() => expect(dialogOpen('mergeWorkspacesConfirmDialog')).toBe(false));

        const { clinics } = store.getState().blip;
        expect(clinics.beta).toBeUndefined();
        expect(clinics.alpha.patientCounts).toEqual(refreshedCounts);
        expect(api.clinics.getClinicsForClinician).toHaveBeenCalledWith(loggedInUserId, { limit: 1000, offset: 0 }, expect.any(Function));
      });

      it('should clear the selected clinic when it was the merged source', async () => {
        recordRequests(mergeUrl, () => new HttpResponse(null, { status: 200 }));
        renderPage({ selectedClinicId: 'beta' });
        await openDialog();
        await confirmMerge();

        await screen.findByText('Merge successful');
        expect(store.getState().blip.selectedClinicId).toBeNull();
      });

      it('should send the merge once, show the Clinic Success toast and keep both dialogs open when it fails', async () => {
        recordRequests(mergeUrl, () => new HttpResponse(null, { status: 502 }));
        renderPage();
        await openDialog();
        await confirmMerge();

        await screen.findByText('Contact Clinic Success to review your merge report');
        expect(requests).toHaveLength(1);
        expect(dialogOpen('mergeWorkspacesDialog')).toBe(true);
        expect(dialogOpen('mergeWorkspacesConfirmDialog')).toBe(true);
        expect(confirmButton()).toBeEnabled();
        expect(store.getState().blip.clinics.beta).toBeDefined();
        expect(api.clinics.getClinicsForClinician).not.toHaveBeenCalled();
      });
    });
  });
});
