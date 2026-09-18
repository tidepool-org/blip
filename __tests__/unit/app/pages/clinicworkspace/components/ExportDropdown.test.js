import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import ExportDropdown from '@app/pages/clinicworkspace/components/ExportDropdown';
import { ToastProvider } from '@app/providers/ToastProvider';
import { RTKQueryApi } from '@app/redux/api/baseApi';
import { trackMetric as mockTrackMetric } from '../../../../../app/core/metricUtils';

const EXPORT_URL = 'http://app.tidepool.test/v1/clinics/:clinicId/export/patients';

const server = setupServer();

describe('ExportDropdown', () => {
  let store;
  let onSelectRpmReport;
  let clickSpy;

  const makeStore = () => configureStore({
    reducer: {
      blip: (state = { selectedClinicId: 'clinic123' }) => state,
      [RTKQueryApi.reducerPath]: RTKQueryApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(RTKQueryApi.middleware),
  });

  const renderComponent = (props = {}) => render(
    <Provider store={store}>
      <ToastProvider>
        <ExportDropdown
          period="14d"
          showRpmReport
          showPatientListExport
          onSelectRpmReport={onSelectRpmReport}
          {...props}
        />
      </ToastProvider>
    </Provider>
  );

  const openMenu = async () => {
    await userEvent.click(screen.getByRole('button', { name: /Export/ }));
  };

  // The trigger carries aria-controls only while its popover is open.
  const isMenuOpen = () => document.querySelector('#export-dropdown-trigger').hasAttribute('aria-controls');

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  beforeEach(() => {
    store = makeStore();
    onSelectRpmReport = jest.fn();
    mockTrackMetric.mockClear();
    global.URL.createObjectURL = jest.fn(() => 'blob:patients');
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    server.resetHandlers();
    jest.restoreAllMocks();
  });

  afterAll(() => server.close());

  describe('menu items', () => {
    it('lists RPM Report above Patient List when both gates are true', async () => {
      renderComponent();
      await openMenu();

      const items = screen.getAllByRole('button').filter(button => button.classList.contains('action-list-item'));
      expect(items.map(item => item.textContent)).toEqual(['RPM Report', 'Patient List']);
    });

    it('marks the trigger selected only while the menu is open', async () => {
      renderComponent();
      const trigger = document.querySelector('#export-dropdown-trigger');
      expect(trigger).not.toHaveClass('selected');

      await openMenu();
      expect(trigger).toHaveClass('selected');

      await userEvent.click(screen.getByText('RPM Report'));
      await waitFor(() => expect(trigger).not.toHaveClass('selected'));
    });

    it('lists only Patient List when the RPM gate is false', async () => {
      renderComponent({ showRpmReport: false });
      await openMenu();

      expect(screen.getByText('Patient List')).toBeInTheDocument();
      expect(screen.queryByText('RPM Report')).not.toBeInTheDocument();
    });

    it('lists only RPM Report when the export gate is false', async () => {
      renderComponent({ showPatientListExport: false });
      await openMenu();

      expect(screen.getByText('RPM Report')).toBeInTheDocument();
      expect(screen.queryByText('Patient List')).not.toBeInTheDocument();
    });
  });

  describe('RPM Report item', () => {
    it('calls onSelectRpmReport once and closes the menu', async () => {
      renderComponent();
      await openMenu();

      // The menu renders in a portal, so it is reachable from the document, not the container.
      const item = document.querySelector('#open-rpm-report-config');
      expect(item).toBeInTheDocument();

      await userEvent.click(item);

      expect(onSelectRpmReport).toHaveBeenCalledTimes(1);
      expect(isMenuOpen()).toBe(false);
    });
  });

  describe('Patient List item', () => {
    const clickPatientList = async () => {
      await openMenu();
      await userEvent.click(screen.getByText('Patient List'));
    };

    it('closes the menu as soon as the export is triggered', async () => {
      server.use(http.get(EXPORT_URL, () => HttpResponse.text('name,mrn\n')));

      renderComponent();
      await openMenu();
      expect(isMenuOpen()).toBe(true);

      await userEvent.click(screen.getByText('Patient List'));
      expect(isMenuOpen()).toBe(false);
    });

    it('requests the export for the selected clinic and active period with session headers', async () => {
      let captured;

      server.use(http.get(EXPORT_URL, ({ request, params }) => {
        captured = {
          clinicId: params.clinicId,
          period: new URL(request.url).searchParams.get('period'),
          hasSessionToken: request.headers.has('x-tidepool-session-token'),
          hasTraceSession: request.headers.has('x-tidepool-trace-session'),
        };

        return HttpResponse.text('name,mrn\n');
      }));

      renderComponent();
      await clickPatientList();

      await waitFor(() => {
        expect(captured).toEqual({
          clinicId: 'clinic123',
          period: '14d',
          hasSessionToken: true,
          hasTraceSession: true,
        });
      });
    });

    it('holds the trigger disabled while the export is in flight', async () => {
      let release;
      const held = new Promise(resolve => { release = resolve; });
      let requested = false;

      server.use(http.get(EXPORT_URL, async () => {
        requested = true;
        await held;
        return HttpResponse.text('name,mrn\n');
      }));

      const { container } = renderComponent();
      await clickPatientList();

      await waitFor(() => expect(requested).toBe(true));

      const trigger = container.querySelector('#export-dropdown-trigger');
      await waitFor(() => expect(trigger).toBeDisabled());
      expect(trigger).toHaveClass('processing');

      release();

      await waitFor(() => expect(trigger).toBeEnabled());
    });

    it('downloads the CSV under the Content-Disposition filename and toasts success', async () => {
      server.use(http.get(EXPORT_URL, () => HttpResponse.text('name,mrn\nAlice,123\n', {
        headers: { 'Content-Disposition': 'attachment; filename=patients-42.csv' },
      })));

      renderComponent();
      await clickPatientList();

      expect(await screen.findByText('Your patient list will download shortly.')).toBeInTheDocument();

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(clickSpy.mock.instances[0].download).toBe('patients-42.csv');
      expect(mockTrackMetric).toHaveBeenCalledWith('Clinic - Export patient list', {
        clinicId: 'clinic123',
        period: '14d',
      });
    });

    it('falls back to patient-list.csv when the response carries no Content-Disposition', async () => {
      server.use(http.get(EXPORT_URL, () => HttpResponse.text('name,mrn\n')));

      renderComponent();
      await clickPatientList();

      await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
      expect(clickSpy.mock.instances[0].download).toBe('patient-list.csv');
    });

    it('toasts the failure and downloads nothing when the export errors', async () => {
      server.use(http.get(EXPORT_URL, () => new HttpResponse(null, { status: 500 })));

      const { container } = renderComponent();
      await clickPatientList();

      // The base query retries twice before the hook reports the error, so allow for the backoff.
      expect(await screen.findByText('We were unable to generate your report. Please try again.', {}, { timeout: 5000 })).toBeInTheDocument();
      expect(clickSpy).not.toHaveBeenCalled();
      await waitFor(() => expect(container.querySelector('#export-dropdown-trigger')).toBeEnabled());
    });
  });
});
