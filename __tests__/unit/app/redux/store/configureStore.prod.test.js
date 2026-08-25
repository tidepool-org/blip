/* global jest */
/* global describe */
/* global it */
/* global expect */
/* global beforeEach */
/* global afterEach */

import configureStore from '@app/redux/store/configureStore.prod';
import { setTideDashboardFilters } from '@app/pages/clinicworkspace/TideDashboardV2/tideDashboardFiltersSlice';

describe('configureStore.prod', () => {
  const api = {
    metrics: { track: jest.fn() },
    errors: { log: jest.fn() },
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  it('should persist select items to localStorage, scoped to the logged-in user and selected clinic', () => {
    // Log in and select a clinic
    const store = configureStore(api);
    store.dispatch({ type: 'FETCH_USER_SUCCESS', payload: { user: { userid: 'user456' } } });
    store.dispatch({ type: 'SELECT_CLINIC_SUCCESS', payload: { clinicId: 'clinic123' } });
    store.dispatch(setTideDashboardFilters({ patientTags: ['tag1'], summaryPeriod: '7d' }));

    jest.advanceTimersByTime(1200); // subscriber is throttled to 1 second

    expect(JSON.parse(localStorage.getItem('blipState'))).toStrictEqual({ selectedClinicId: 'clinic123' });
    expect(JSON.parse(localStorage.getItem('tideDashboardFilters/user456/clinic123'))).toStrictEqual({ patientTags: ['tag1'], summaryPeriod: '7d' });
  });

  it('should not persist items no clinic is selected', () => {
    const store = configureStore(api);
    store.dispatch({ type: 'FETCH_USER_SUCCESS', payload: { user: { userid: 'user456' } } });

    jest.advanceTimersByTime(1200); // subscriber is throttled to 1 second

    expect(JSON.parse(localStorage.getItem('blipState'))).toStrictEqual({ selectedClinicId: null });
    expect(JSON.parse(localStorage.getItem('tideDashboardFilters/user456/clinic123'))).toStrictEqual(null);
  });
});
