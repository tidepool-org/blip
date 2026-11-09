import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import isEqual from 'lodash/isEqual';
import moment from 'moment';

import { setupStore } from '@tests/utils/setupStore';
import blipReducer from '@app/redux/reducers';
import DataIssues from '@app/pages/clinicworkspace/TideDashboardV2/DataIssues/DataIssues';

// Pin the data recency window to a stable [lastDataFrom, lastDataTo]
jest.mock('@app/pages/clinicworkspace/TideDashboardV2/useDerivedDataRecencyEndpoints', () => ({
  __esModule: true,
  default: () => [
    '2025-05-23T00:00:00.000Z', // lastDataFrom
    '2025-05-30T00:00:00.000Z', // lastDataTo
  ],
}));

jest.mock('@app/core/api', () => ({ clinics: { getPatientFromClinic: jest.fn() } }));

jest.mock('@app/providers/ToastProvider', () => ({
  useToasts: jest.fn().mockReturnValue({ set: jest.fn() }),
}));

const tideReportResponse = {
  results: {
    noData: [{
      patient: {
        id: 'patient-1',
        fullName: 'No Data Patient 1',
        email: 'patient-1@test.test',
        tags: ['tag8'],
        dataSources: [{ providerName: 'dexcom', state: 'error', modifiedTime: '2025-05-01T00:00:00.000Z' }],
      },
      lastData: moment.utc().subtract(3, 'days').toISOString(),
    },
    {
      patient: {
        id: 'patient-2',
        fullName: 'No Data Patient 2',
        email: 'patient-2@test.test',
      },
      lastData: moment.utc().subtract(12, 'days').toISOString(),
    }],
  },
};

const server = setupServer(
  http.get('http://app.tidepool.test/v1/clinics/clinic123/tide_report', ({ request }) => {
    const searchParams = Object.fromEntries(new URL(request.url).searchParams);

    const anticipatedQuery = {
      period: '30d',
      lastData: '14',
      tags: 'tag8',
      lastDataCutoff: '2025-05-23T00:00:00.000Z',
      categories: 'meetingTargets',
    };

    if (!isEqual(searchParams, anticipatedQuery)) throw new Error('Unexpected tide report query');

    return HttpResponse.json(tideReportResponse);
  }),
  http.get('http://app.tidepool.test/v1/clinics/clinic123/patients/patient-1', () => (
    HttpResponse.json(tideReportResponse.results.noData[0].patient)
  )),
);

describe('DataIssues', () => {
  let store;
  let history;

  const api = { clinics: { getPatientFromClinic: jest.fn() } };

  const renderComponent = () => render(
    <Provider store={store}>
      <Router history={history}>
        <DataIssues api={api} />
      </Router>
    </Provider>
  );

  beforeAll(() => server.listen());

  beforeEach(() => {
    history = createMemoryHistory({ initialEntries: ['/dashboard/tide'] });

    store = setupStore({
      blip: {
        selectedClinicId: 'clinic123',
        clinics: { clinic123: { id: 'clinic123', patientTags: [{ id: 'tag8', name: 'Tag 8' }] } },
        tideDashboardFilters: { lastData: 14, patientTags: ['tag8'], clinicSites: [], summaryPeriod: '30d' },
      },
    }, { blip: blipReducer });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => server.close());

  it('fetches the tide report with the applied filters and renders the patients from the noData group', async () => {
    renderComponent();

    // The section header shows the count of patients with data issues
    expect(await screen.findByText('Device Issues (2)')).toBeInTheDocument();

    expect(screen.getByRole('columnheader', { name: /Patient Details/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Dexcom Connection Status/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Days Since Last Data/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Tags/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Last Reviewed/ })).toBeInTheDocument();

    expect(screen.getByText('No Data Patient 1')).toBeInTheDocument();
    expect(screen.getByText('patient-1@test.test')).toBeInTheDocument();
    expect(screen.getByText('No Data Patient 2')).toBeInTheDocument();

    // The Dexcom connection status resolves from each patient's data sources
    expect(screen.getByText('Error Connecting')).toBeInTheDocument();
    expect(screen.getByText('No Pending Connections')).toBeInTheDocument();

    // Tags resolve against the clinic's patient tags
    expect(screen.getByText('Tag 8')).toBeInTheDocument();
  });

  it('opens the trends view when a patient row is clicked, but not when an action within the row is clicked', async () => {
    renderComponent();

    expect(await screen.findByText('No Data Patient 1')).toBeInTheDocument();

    // Opening the Data Connections modal from the Dexcom status does not navigate away
    await userEvent.click(within(screen.getByTestId('tideDashboardDataIssuesTable-row-0')).getByRole('button', { name: 'View' }));
    expect(history.location.pathname).toBe('/dashboard/tide');

    // Unlike the main table, rows always open trends rather than the patient drawer
    await userEvent.click(screen.getByTestId('tideDashboardDataIssuesTable-row-0-fullName'));
    expect(history.location.pathname).toBe('/patients/patient-1/data/trends');
    expect(history.location.search).toBe('?dashboard=tide');
  });
});
