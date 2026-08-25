import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import FilterByDataRecency from '@app/pages/clinicworkspace/TideDashboardV2/FilterByDataRecency';

const mockStore = configureStore([thunk]);

describe('FilterByDataRecency', () => {
  let store;

  const renderComponent = () => render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace/tide-dashboard']}>
        <FilterByDataRecency />
      </MemoryRouter>
    </Provider>
  );

  it('dispatches the lastData filter and offset reset when data recency filter is applied', async () => {
    store = mockStore({
      blip: {
        selectedClinicId: 'clinic123',
        tideDashboardFilters: {
          lastData: 7,
          patientTags: [],
          clinicSites: [],
          summaryPeriod: '14d',
        },
      },
    });

    renderComponent();

    // Open the dropdown
    expect(screen.queryByTestId('data-recency-filter-dropdown')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Data Recency/ }));
    expect(screen.getByTestId('data-recency-filter-dropdown')).toBeInTheDocument();

    expect(screen.queryByRole('radio', { name: /CGM/ })).not.toBeInTheDocument(); // not selectable in TIDE
    expect(screen.queryByRole('radio', { name: /BGM/ })).not.toBeInTheDocument(); // not selectable in TIDE

    expect(screen.getByRole('radio', { name: /Today/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Within 2 days/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Within 7 days/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Within 14 days/ })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /Within 30 days/ })).not.toBeInTheDocument();

    // Select an option
    await userEvent.click(screen.getByRole('radio', { name: /Within 2 days/ }));
    expect(store.getActions()).toStrictEqual([]);

    // Applying the filter dispatches the new filter value and resets the page offset
    await userEvent.click(screen.getByRole('button', { name: /Apply/ }));
    expect(store.getActions()).toStrictEqual([
      { type: 'tideDashboardFilters/setLastDataFilter', payload: 2 },
      { type: 'tideDashboard/setOffset', payload: 0 },
    ]);
  });
});
