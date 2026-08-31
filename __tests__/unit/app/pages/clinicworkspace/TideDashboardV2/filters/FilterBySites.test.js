import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import FilterBySites from '@app/pages/clinicworkspace/TideDashboardV2/filters/FilterBySites';

const mockStore = configureStore([thunk]);

describe('FilterBySites', () => {
  let store;

  const renderComponent = () => render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace/tide-dashboard']}>
        <FilterBySites />
      </MemoryRouter>
    </Provider>
  );

  it('dispatches the clinic sites filter and an offset reset when a site filter is applied', async () => {
    store = mockStore({
      blip: {
        selectedClinicId: 'clinic123',
        clinics: {
          clinic123: {
            id: 'clinic123',
            sites: [{ id: 'site1', name: 'Site Alpha' }, { id: 'site2', name: 'Site Bravo' }],
          },
        },
        tideDashboardFilters: {
          lastData: 7,
          patientTags: [],
          clinicSites: ['site1'],
          summaryPeriod: '14d',
        },
      },
    });

    renderComponent();

    // Open the dropdown
    expect(screen.queryByTestId('site-filter-dropdown')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Clinic Sites/ }));
    expect(screen.getByTestId('site-filter-dropdown')).toBeInTheDocument();

    // Selecting a site
    await userEvent.click(screen.getByRole('checkbox', { name: /Site Bravo/ }));
    expect(store.getActions()).toStrictEqual([]);

    // Applying the filter dispatches the selected sites and resets the page offset
    await userEvent.click(screen.getByRole('button', { name: /Apply/ }));
    expect(store.getActions()).toStrictEqual([
      { type: 'tideDashboardFilters/setClinicSitesFilter', payload: ['site1', 'site2'] },
      { type: 'tideDashboard/setOffset', payload: 0 },
    ]);
  });
});
