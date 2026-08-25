import React from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react-hooks/dom';
import { thunk } from 'redux-thunk';
import configureStore from 'redux-mock-store';

import usePruneInvalidFilters from '@app/pages/clinicworkspace/TideDashboardV2/usePruneInvalidFilters';
import { SPECIAL_FILTER_STATES } from '@app/pages/clinicworkspace/useClinicPatientsFilters';

const mockStore = configureStore([thunk]);

describe('usePruneInvalidFilters', () => {
  let store;

  const clinic = {
    id: 'clinic123',
    patientTags: [
      { id: 'tag1', name: 'Week 1' },
      { id: 'tag2', name: 'Week 2' },
      // tag3 is deleted
    ],
    sites: [
      { id: 'site1', name: 'Site Alpha' },
      { id: 'site2', name: 'Site Bravo' },
      // site3 is deleted
    ],
  };

  const renderPruneHook = ({ filterOverrides = {}, clinics = { clinic123: clinic } } = {}) => {
    store = mockStore({
      blip: {
        selectedClinicId: 'clinic123',
        clinics,
        tideDashboardFilters: {
          lastData: 7,
          patientTags: [],
          clinicSites: [],
          summaryPeriod: '14d',
          ...filterOverrides,
        },
      },
    });

    renderHook(() => usePruneInvalidFilters(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
  };

  it('prunes filtered tag ids that no longer exist in the clinic', () => {
    renderPruneHook({ filterOverrides: { patientTags: ['tag1', 'tag3'] } });

    expect(store.getActions()).toStrictEqual([
      { type: 'tideDashboardFilters/setPatientTagsFilter', payload: ['tag1'] },
    ]);
  });

  it('prunes filtered site ids that no longer exist in the clinic', () => {
    renderPruneHook({ filterOverrides: { clinicSites: ['site3', 'site2'] } });

    expect(store.getActions()).toStrictEqual([
      { type: 'tideDashboardFilters/setClinicSitesFilter', payload: ['site2'] },
    ]);
  });

  it('prunes invalid tags and sites in the same mount', () => {
    renderPruneHook({
      filterOverrides: {
        patientTags: ['tag3', 'tag1'],
        clinicSites: ['site3', 'site2'],
      },
    });

    expect(store.getActions()).toStrictEqual([
      { type: 'tideDashboardFilters/setPatientTagsFilter', payload: ['tag1'] },
      { type: 'tideDashboardFilters/setClinicSitesFilter', payload: ['site2'] },
    ]);
  });

  it('dispatches nothing when all filtered tags and sites still exist in the clinic', () => {
    renderPruneHook({
      filterOverrides: {
        patientTags: ['tag1', 'tag2'],
        clinicSites: ['site1', 'site2'],
      },
    });

    expect(store.getActions()).toStrictEqual([]);
  });

  it('dispatches nothing when no tag or site filters are set', () => {
    renderPruneHook();

    expect(store.getActions()).toStrictEqual([]);
  });

  it('preserves the special zero-tags and zero-sites filter states', () => {
    renderPruneHook({
      filterOverrides: {
        patientTags: SPECIAL_FILTER_STATES.ZERO_TAGS,
        clinicSites: SPECIAL_FILTER_STATES.ZERO_SITES,
      },
    });

    expect(store.getActions()).toStrictEqual([]);
  });
});
