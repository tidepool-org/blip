import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import isEqual from 'lodash/isEqual';

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

const { DEFAULT, VERY_LOW, ANY_LOW, DROP_IN_TIR, ANY_HIGH, VERY_HIGH, LOW_CGM_WEAR, TARGET } = CATEGORY;

const TEST_TIMEOUT_MS = 30_000;

const baseQuery = {
  offset: '0',
  limit: '12',
  period: '14d',
  'cgm.lastDataFrom': '2025-05-23T00:00:00.000Z',
  'cgm.lastDataTo': '2025-05-30T00:00:00.000Z',
};

const anticipatedQueries = {
  [DEFAULT]: { ...baseQuery },
  [VERY_LOW]: {
    ...baseQuery,
    'cgm.timeInVeryLowPercent': '>=0.005',
  },
  [ANY_LOW]: {
    ...baseQuery,
    'cgm.timeInVeryLowPercent': '<0.005',
    'cgm.timeInAnyLowPercent': '>=0.035',
  },
  [DROP_IN_TIR]: {
    ...baseQuery,
    'cgm.timeInVeryLowPercent': '<0.005',
    'cgm.timeInAnyLowPercent': '<0.035',
    'cgm.timeInTargetPercentDelta': '<=-0.145',
  },
  [ANY_HIGH]: {
    ...baseQuery,
    'cgm.timeInVeryLowPercent': '<0.005',
    'cgm.timeInAnyLowPercent': '<0.035',
    'cgm.timeInTargetPercentDelta': '>-0.145',
    'cgm.timeInAnyHighPercent': '>=0.245',
  },
  [VERY_HIGH]: {
    ...baseQuery,
    'cgm.timeInVeryLowPercent': '<0.005',
    'cgm.timeInAnyLowPercent': '<0.035',
    'cgm.timeInTargetPercentDelta': '>-0.145',
    'cgm.timeInAnyHighPercent': '<0.245',
    'cgm.timeInVeryHighPercent': '>=0.045',
  },
  [LOW_CGM_WEAR]: {
    ...baseQuery,
    'cgm.timeInVeryLowPercent': '<0.005',
    'cgm.timeInAnyLowPercent': '<0.035',
    'cgm.timeInTargetPercentDelta': '>-0.145',
    'cgm.timeInAnyHighPercent': '<0.245',
    'cgm.timeInVeryHighPercent': '<0.045',
    'cgm.timeCGMUsePercent': '<0.695',
  },
  [TARGET]: {
    ...baseQuery,
    'cgm.timeInVeryLowPercent': '<0.005',
    'cgm.timeInAnyLowPercent': '<0.035',
    'cgm.timeInTargetPercentDelta': '>-0.145',
    'cgm.timeInAnyHighPercent': '<0.245',
    'cgm.timeInVeryHighPercent': '<0.045',
    'cgm.timeCGMUsePercent': '>=0.695',
  },
};

const patientsForCategory = {
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
};

// Patients are only returned when the request matches a category's anticipated
// query exactly; any other query yields an empty result set.
const server = setupServer(
  http.get('http://app.tidepool.test/v1/clinics/clinic123/patients', ({ request }) => {
    const searchParams = Object.fromEntries(new URL(request.url).searchParams);

    const matchedCategory = Object
      .keys(anticipatedQueries)
      .find(category => isEqual(searchParams, anticipatedQueries[category]));

    const patients = patientsForCategory[matchedCategory] || [];

    return HttpResponse.json({ data: patients, meta: { count: patients.length } });
  })
);

describe('TideDashboardV2', () => {
  let store;

  const renderComponent = () => render(
    <Provider store={store}>
      <TideDashboardV2 />
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

  it('fetches and renders the All Patients cohort on mount', async () => {
    renderComponent();

    // Nothing renders until the first page of patients resolves
    expect(screen.queryByText('Default Patient 1')).not.toBeInTheDocument();

    expect(await screen.findByText('Default Patient 1')).toBeInTheDocument();
    expect(screen.getByText('Default Patient 2')).toBeInTheDocument();
    expect(screen.getByText('DOB: 2001-01-01')).toBeInTheDocument();

    // All Patients is the pre-selected category
    expect(screen.getByRole('radio', { name: /All Patients/ })).toBeChecked();

    // No other cohort's patients leak in
    expect(screen.queryByText('Very Low Patient 1')).not.toBeInTheDocument();
  });

  it('refetches with each category\'s exclusion params and swaps in that cohort', async () => {
    renderComponent();

    expect(await screen.findByText('Default Patient 1')).toBeInTheDocument();

    // Selecting Very Low fetches and shows the Very Low cohort
    await userEvent.click(screen.getByRole('radio', { name: /Very Low/ }));
    expect(await screen.findByText('Very Low Patient 1')).toBeInTheDocument();
    expect(screen.getByText('Very Low Patient 2')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Very Low/ })).toBeChecked();
    expect(screen.queryByText('Default Patient 1')).not.toBeInTheDocument();

    // Selecting Low fetches and shows the Low cohort
    await userEvent.click(screen.getByRole('radio', { name: /^Low$/ }));
    expect(await screen.findByText('Low Patient 1')).toBeInTheDocument();
    expect(screen.getByText('Low Patient 2')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^Low$/ })).toBeChecked();
    expect(screen.queryByText('Very Low Patient 1')).not.toBeInTheDocument();

    // Selecting Drop in TIR fetches and shows the Drop in TIR cohort
    await userEvent.click(screen.getByRole('radio', { name: /Drop in TIR/ }));
    expect(await screen.findByText('Drop In TIR Patient 1')).toBeInTheDocument();
    expect(screen.getByText('Drop In TIR Patient 2')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Drop in TIR/ })).toBeChecked();
    expect(screen.queryByText('Low Patient 1')).not.toBeInTheDocument();

    // Selecting High fetches and shows the High cohort
    await userEvent.click(screen.getByRole('radio', { name: /^High$/ }));
    expect(await screen.findByText('High Patient 1')).toBeInTheDocument();
    expect(screen.getByText('High Patient 2')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^High$/ })).toBeChecked();
    expect(screen.queryByText('Drop In TIR Patient 1')).not.toBeInTheDocument();

    // Selecting Very High fetches and shows the Very High cohort
    await userEvent.click(screen.getByRole('radio', { name: /Very High/ }));
    expect(await screen.findByText('Very High Patient 1')).toBeInTheDocument();
    expect(screen.getByText('Very High Patient 2')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Very High/ })).toBeChecked();
    expect(screen.queryByText('High Patient 1')).not.toBeInTheDocument();

    // Selecting Low CGM Wear fetches and shows the Low CGM Wear cohort
    await userEvent.click(screen.getByRole('radio', { name: /Low CGM Wear/ }));
    expect(await screen.findByText('Low CGM Wear Patient 1')).toBeInTheDocument();
    expect(screen.getByText('Low CGM Wear Patient 2')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Low CGM Wear/ })).toBeChecked();
    expect(screen.queryByText('Very High Patient 1')).not.toBeInTheDocument();

    // Selecting Meeting Targets fetches and shows the Meeting Targets cohort
    await userEvent.click(screen.getByRole('radio', { name: /Meeting Targets/ }));
    expect(await screen.findByText('Meeting Targets Patient 1')).toBeInTheDocument();
    expect(screen.getByText('Meeting Targets Patient 2')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Meeting Targets/ })).toBeChecked();
    expect(screen.queryByText('Low CGM Wear Patient 1')).not.toBeInTheDocument();
  }, TEST_TIMEOUT_MS);
});
