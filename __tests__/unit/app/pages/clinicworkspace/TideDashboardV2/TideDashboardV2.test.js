import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import isEqual from 'lodash/isEqual';
import entries from 'lodash/entries';

import { setupStore } from '@tests/utils/setupStore';
import blipReducer from '@app/redux/reducers';
import { CATEGORY } from '@app/pages/clinicworkspace/TideDashboardV2/tideDashboardSlice';
import TideDashboardV2 from '@app/pages/clinicworkspace/TideDashboardV2/TideDashboardV2';

// Pin the data recency window to a stable [lastDataFrom, lastDataTo]
jest.mock('@app/pages/clinicworkspace/TideDashboardV2/useDerivedDataRecencyEndpoints', () => ({
  __esModule: true,
  default: () => [
    '2025-05-23T00:00:00.000Z', // lastDataFrom
    '2025-05-30T00:00:00.000Z', // lastDataTo
  ],
}));

jest.mock('@app/providers/ToastProvider', () => ({
  useToasts: jest.fn().mockReturnValue({
    set: jest.fn(),
  }),
}));

const { DEFAULT, VERY_LOW, ANY_LOW, DROP_IN_TIR, ANY_HIGH, VERY_HIGH, LOW_CGM_WEAR, TARGET } = CATEGORY;

const TEST_TIMEOUT_MS = 30_000;

const anticipatedQueries = {
  [DEFAULT]: {
    offset: '0',
    limit: '12',
    period: '14d',
    'cgm.lastDataFrom': '2025-05-23T00:00:00.000Z',
    'cgm.lastDataTo': '2025-05-30T00:00:00.000Z',
  },
  [VERY_LOW]: {
    offset: '0',
    limit: '12',
    period: '14d',
    'cgm.lastDataFrom': '2025-05-23T00:00:00.000Z',
    'cgm.lastDataTo': '2025-05-30T00:00:00.000Z',
    'cgm.timeInVeryLowPercent': '>=0.005',
  },
  [ANY_LOW]: {
    offset: '0',
    limit: '12',
    period: '14d',
    'cgm.lastDataFrom': '2025-05-23T00:00:00.000Z',
    'cgm.lastDataTo': '2025-05-30T00:00:00.000Z',
    'cgm.timeInVeryLowPercent': '<0.005',
    'cgm.timeInAnyLowPercent': '>=0.035',
  },
  [DROP_IN_TIR]: {
    offset: '0',
    limit: '12',
    period: '14d',
    'cgm.lastDataFrom': '2025-05-23T00:00:00.000Z',
    'cgm.lastDataTo': '2025-05-30T00:00:00.000Z',
    'cgm.timeInVeryLowPercent': '<0.005',
    'cgm.timeInAnyLowPercent': '<0.035',
    'cgm.timeInTargetPercentDelta': '<=-0.145',
  },
  [ANY_HIGH]: {
    offset: '0',
    limit: '12',
    period: '14d',
    'cgm.lastDataFrom': '2025-05-23T00:00:00.000Z',
    'cgm.lastDataTo': '2025-05-30T00:00:00.000Z',
    'cgm.timeInVeryLowPercent': '<0.005',
    'cgm.timeInAnyLowPercent': '<0.035',
    'cgm.timeInTargetPercentDelta': '>-0.145',
    'cgm.timeInAnyHighPercent': '>=0.245',
  },
  [VERY_HIGH]: {
    offset: '0',
    limit: '12',
    period: '14d',
    'cgm.lastDataFrom': '2025-05-23T00:00:00.000Z',
    'cgm.lastDataTo': '2025-05-30T00:00:00.000Z',
    'cgm.timeInVeryLowPercent': '<0.005',
    'cgm.timeInAnyLowPercent': '<0.035',
    'cgm.timeInTargetPercentDelta': '>-0.145',
    'cgm.timeInAnyHighPercent': '<0.245',
    'cgm.timeInVeryHighPercent': '>=0.045',
  },
  [LOW_CGM_WEAR]: {
    offset: '0',
    limit: '12',
    period: '14d',
    'cgm.lastDataFrom': '2025-05-23T00:00:00.000Z',
    'cgm.lastDataTo': '2025-05-30T00:00:00.000Z',
    'cgm.timeInVeryLowPercent': '<0.005',
    'cgm.timeInAnyLowPercent': '<0.035',
    'cgm.timeInTargetPercentDelta': '>-0.145',
    'cgm.timeInAnyHighPercent': '<0.245',
    'cgm.timeInVeryHighPercent': '<0.045',
    'cgm.timeCGMUsePercent': '<0.695',
  },
  [TARGET]: {
    offset: '0',
    limit: '12',
    period: '14d',
    'cgm.lastDataFrom': '2025-05-23T00:00:00.000Z',
    'cgm.lastDataTo': '2025-05-30T00:00:00.000Z',
    'cgm.timeInVeryLowPercent': '<0.005',
    'cgm.timeInAnyLowPercent': '<0.035',
    'cgm.timeInTargetPercentDelta': '>-0.145',
    'cgm.timeInAnyHighPercent': '<0.245',
    'cgm.timeInVeryHighPercent': '<0.045',
    'cgm.timeCGMUsePercent': '>=0.695',
  },
  'DEFAULT_WITH_FILTERS': {
    offset: '0',
    limit: '12',
    period: '30d',
    'cgm.lastDataFrom': '2025-05-23T00:00:00.000Z',
    'cgm.lastDataTo': '2025-05-30T00:00:00.000Z',
    tags: 'tag8',
    sites: 'site9',
  },
};

const datasets = {
  [DEFAULT]: [
    { id: 'default-1', fullName: 'Default Patient 1', birthDate: '2001-01-01' },
    { id: 'default-2', fullName: 'Default Patient 2', birthDate: '2002-02-02' },
  ],
  [VERY_LOW]: [
    { id: 'very-low-1', fullName: 'Very Low Patient 1', birthDate: '2003-03-03' },
    { id: 'very-low-2', fullName: 'Very Low Patient 2', birthDate: '2004-04-04' },
  ],
  [ANY_LOW]: [
    { id: 'any-low-1', fullName: 'Low Patient 1', birthDate: '2005-05-05' },
    { id: 'any-low-2', fullName: 'Low Patient 2', birthDate: '2006-06-06' },
  ],
  [DROP_IN_TIR]: [
    { id: 'drop-in-tir-1', fullName: 'Drop In TIR Patient 1', birthDate: '2007-07-07' },
    { id: 'drop-in-tir-2', fullName: 'Drop In TIR Patient 2', birthDate: '2008-08-08' },
  ],
  [ANY_HIGH]: [
    { id: 'any-high-1', fullName: 'High Patient 1', birthDate: '2009-09-09' },
    { id: 'any-high-2', fullName: 'High Patient 2', birthDate: '2010-10-10' },
  ],
  [VERY_HIGH]: [
    { id: 'very-high-1', fullName: 'Very High Patient 1', birthDate: '2011-11-11' },
    { id: 'very-high-2', fullName: 'Very High Patient 2', birthDate: '2012-12-12' },
  ],
  [LOW_CGM_WEAR]: [
    { id: 'low-cgm-wear-1', fullName: 'Low CGM Wear Patient 1', birthDate: '2013-01-13' },
    { id: 'low-cgm-wear-2', fullName: 'Low CGM Wear Patient 2', birthDate: '2014-02-14' },
  ],
  [TARGET]: [
    { id: 'target-1', fullName: 'Meeting Targets Patient 1', birthDate: '2015-03-15' },
    { id: 'target-2', fullName: 'Meeting Targets Patient 2', birthDate: '2016-04-16' },
  ],
  'DEFAULT_WITH_FILTERS': [
    { id: 'filtered-3', fullName: 'Filtered Patient 3', birthDate: '2001-01-01' },
  ],
};

const getCorrespondingDataForQuery = (searchParams) => {
  let matchedDatasetName;

  // Look over anticipated queries. If the query matches, return the dataset
  for (let [datasetName, anticipatedQuery] of entries(anticipatedQueries)) {
    if (isEqual(searchParams, anticipatedQuery)) {
      matchedDatasetName = datasetName;
      break;
    }
  }

  if (!matchedDatasetName) throw new Error('No data for this query found');

  return datasets[matchedDatasetName];
};

const server = setupServer(
  http.get('http://app.tidepool.test/v1/clinics/clinic123/patients', ({ request }) => {
    const searchParams = Object.fromEntries(new URL(request.url).searchParams);

    const patients = getCorrespondingDataForQuery(searchParams);

    return HttpResponse.json({ data: patients, meta: { count: patients.length } });
  }),

  http.get('http://app.tidepool.test/v1/clinics/clinic123/tide_report', () => HttpResponse.json({
    results: { noData: [{ patient: { id: 'no-data-1', fullName: 'No Data Patient 1', birthDate: '2006-01-01' } }] },
  }))
);

describe('TideDashboardV2', () => {
  let store;

  const renderComponent = () => render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace/tide-dashboard']}>
        <TideDashboardV2 />
      </MemoryRouter>
    </Provider>
  );

  beforeAll(() => server.listen());

  beforeEach(() => {
    store = setupStore({ blip: { selectedClinicId: 'clinic123' } }, { blip: blipReducer });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => server.close());

  it('fetches and renders each category of patients', async () => {
    renderComponent();

    const table = await screen.findByTestId('tideDashboardPatientsTable');

    // All Patients is the pre-selected category
    expect(await screen.findByText('Default Patient 1')).toBeInTheDocument();

    expect(screen.getByRole('radio', { name: /All Patients/ })).toBeChecked();
    expect(screen.getByText('Default Patient 2')).toBeInTheDocument();
    expect(screen.getByText('DOB: 2001-01-01')).toBeInTheDocument();

    expect(within(table).getAllByRole('columnheader')).toHaveLength(10);
    expect(within(table).getByRole('columnheader', { name: /Patient Details/ })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /Flag/ })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /Avg Glucose/ })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /Time in Range/ })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /% Change in TIR/ })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /GMI/ })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /CGM Use/ })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /Tags/ })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /Last Reviewed/ })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /More Options/ })).toBeInTheDocument();

    // Selecting Very Low fetches and shows the Very Low cohort
    await userEvent.click(screen.getByRole('radio', { name: /Very Low/ }));
    expect(await screen.findByText('Very Low Patient 1')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Very Low/ })).toBeChecked();
    expect(screen.getByText('Very Low Patient 2')).toBeInTheDocument();
    expect(screen.queryByText('Default Patient 1')).not.toBeInTheDocument();

    expect(screen.getAllByRole('columnheader')).toHaveLength(10);
    expect(screen.getByRole('columnheader', { name: /Patient Details/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Avg Glucose/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% Time < 54/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% Time < 70/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% TIR 70-180/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Time in Range/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% Change in TIR/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Tags/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Last Reviewed/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /More Options/ })).toBeInTheDocument();

    // Selecting Low fetches and shows the Low cohort
    await userEvent.click(screen.getByRole('radio', { name: /^Low$/ }));
    expect(await screen.findByText('Low Patient 1')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^Low$/ })).toBeChecked();
    expect(screen.getByText('Low Patient 2')).toBeInTheDocument();
    expect(screen.queryByText('Very Low Patient 1')).not.toBeInTheDocument();

    expect(screen.getAllByRole('columnheader')).toHaveLength(10);
    expect(screen.getByRole('columnheader', { name: /Patient Details/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Avg Glucose/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% Time < 54/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% Time < 70/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% TIR 70-180/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Time in Range/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% Change in TIR/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Tags/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Last Reviewed/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /More Options/ })).toBeInTheDocument();

    // Selecting Drop in TIR fetches and shows the Drop in TIR cohort
    await userEvent.click(screen.getByRole('radio', { name: /Drop in TIR/ }));
    expect(await screen.findByText('Drop In TIR Patient 1')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Drop in TIR/ })).toBeChecked();
    expect(screen.getByText('Drop In TIR Patient 2')).toBeInTheDocument();
    expect(screen.queryByText('Low Patient 1')).not.toBeInTheDocument();

    expect(screen.getAllByRole('columnheader')).toHaveLength(10);
    expect(screen.getByRole('columnheader', { name: /Patient Details/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Avg Glucose/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% TIR 70-180/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Time in Range/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% Change in TIR/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /GMI/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /CGM Use/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Tags/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Last Reviewed/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /More Options/ })).toBeInTheDocument();

    // Selecting High fetches and shows the High cohort
    await userEvent.click(screen.getByRole('radio', { name: /^High$/ }));
    expect(await screen.findByText('High Patient 1')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^High$/ })).toBeChecked();
    expect(screen.getByText('High Patient 2')).toBeInTheDocument();
    expect(screen.queryByText('Drop In TIR Patient 1')).not.toBeInTheDocument();

    expect(screen.getAllByRole('columnheader')).toHaveLength(10);
    expect(screen.getByRole('columnheader', { name: /Patient Details/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Avg Glucose/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% Time > 250/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% Time > 180/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% TIR 70-180/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Time in Range/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% Change in TIR/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Tags/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Last Reviewed/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /More Options/ })).toBeInTheDocument();

    // Selecting Very High fetches and shows the Very High cohort
    await userEvent.click(screen.getByRole('radio', { name: /Very High/ }));
    expect(await screen.findByText('Very High Patient 1')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Very High/ })).toBeChecked();
    expect(screen.getByText('Very High Patient 2')).toBeInTheDocument();
    expect(screen.queryByText('High Patient 1')).not.toBeInTheDocument();

    expect(screen.getAllByRole('columnheader')).toHaveLength(10);
    expect(screen.getByRole('columnheader', { name: /Patient Details/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Avg Glucose/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% Time > 250/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% Time > 180/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% TIR 70-180/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Time in Range/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% Change in TIR/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Tags/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Last Reviewed/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /More Options/ })).toBeInTheDocument();

    // Selecting Low CGM Wear fetches and shows the Low CGM Wear cohort
    await userEvent.click(screen.getByRole('radio', { name: /Low CGM Wear/ }));
    expect(await screen.findByText('Low CGM Wear Patient 1')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Low CGM Wear/ })).toBeChecked();
    expect(screen.getByText('Low CGM Wear Patient 2')).toBeInTheDocument();
    expect(screen.queryByText('Very High Patient 1')).not.toBeInTheDocument();

    expect(screen.getAllByRole('columnheader')).toHaveLength(10);
    expect(screen.getByRole('columnheader', { name: /Patient Details/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /CGM Use/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Avg Glucose/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% TIR 70-180/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Time in Range/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% Change in TIR/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /GMI/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Tags/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Last Reviewed/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /More Options/ })).toBeInTheDocument();

    // Selecting Meeting Targets fetches and shows the Meeting Targets cohort
    await userEvent.click(screen.getByRole('radio', { name: /Meeting Targets/ }));
    expect(await screen.findByText('Meeting Targets Patient 1')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Meeting Targets/ })).toBeChecked();
    expect(screen.getByText('Meeting Targets Patient 2')).toBeInTheDocument();
    expect(screen.queryByText('Low CGM Wear Patient 1')).not.toBeInTheDocument();

    expect(screen.getAllByRole('columnheader')).toHaveLength(9);
    expect(screen.getByRole('columnheader', { name: /Patient Details/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Avg Glucose/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Time in Range/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /% Change in TIR/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /GMI/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /CGM Use/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Tags/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Last Reviewed/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /More Options/ })).toBeInTheDocument();
  }, TEST_TIMEOUT_MS);

  it('fetches with filters', async () => {
    store = setupStore({
      blip: {
        selectedClinicId: 'clinic123',
        clinics: { clinic123: { id: 'clinic123', patientTags: [{ id: 'tag8', name: 'Tag 8' }], sites: [{ id: 'site9', name: 'Site 9' }] } },
        tideDashboardFilters: { lastData: 7, patientTags: ['tag8'], clinicSites: ['site9'], summaryPeriod: '30d' },
      },
    }, { blip: blipReducer });

    renderComponent();

    expect(await screen.findByText('Filtered Patient 3')).toBeInTheDocument();
  }, TEST_TIMEOUT_MS);

  it('renders the Data Issues section when the tide report returns patients with no data', async () => {
    renderComponent();

    expect(await screen.findByText('Device Issues (1)')).toBeInTheDocument();
    expect(await screen.findByText('No Data Patient 1')).toBeInTheDocument();
  }, TEST_TIMEOUT_MS);

  describe('empty content', () => {
    beforeEach(() => {
      let fetchCount = 0;

      server.use(
        http.get('http://app.tidepool.test/v1/clinics/clinic123/patients', () => {
          fetchCount += 1;

          return fetchCount <= 1
            // first fetch -> no patients
            ? HttpResponse.json({ data: [], meta: { count: 0 } })
            // refetch -> 1 patient
            : HttpResponse.json({ data: [{ id: 'default-1', fullName: 'Default Patient 1', birthDate: '2001-01-01' }], meta: { count: 1 } });
          }
        )
      );
    });

    it('shows Reset button when no patients match applied filters', async () => {
      // A tag filter is applied before the dashboard mounts
      store = setupStore({
        blip: {
          selectedClinicId: 'clinic123',
          clinics: { clinic123: { id: 'clinic123', patientTags: [{ id: 'tag1', name: 'Tag One' }] } },
          tideDashboardFilters: { lastData: 7, patientTags: ['tag1'], clinicSites: [], summaryPeriod: '14d' },
        },
      }, { blip: blipReducer });

      renderComponent();

      const emptyContent = await screen.findByTestId('tide-dashboard-empty-content');
      expect(within(emptyContent).getByText('There are no patients with the current filter(s)')).toBeInTheDocument();
      await userEvent.click(within(emptyContent).getByRole('button', { name: 'Reset All Filters' }));

      expect(await screen.findByText('Default Patient 1')).toBeInTheDocument();
    });

    it('shows an empty message without a reset button when there are no patients and no filters applied', async () => {
      renderComponent();

      const emptyContent = await screen.findByTestId('tide-dashboard-empty-content');
      expect(within(emptyContent).getByText('There are no results to show')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Reset All Filters' })).not.toBeInTheDocument(); // no filters = no button
    });
  });
});
