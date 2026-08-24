import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import FilterBySummaryPeriod from '@app/pages/clinicworkspace/TideDashboardV2/FilterBySummaryPeriod';
import { setSummaryPeriodFilter } from '@app/pages/clinicworkspace/TideDashboardV2/tideDashboardFiltersSlice';
import { setOffset } from '@app/pages/clinicworkspace/TideDashboardV2/tideDashboardSlice';

const mockStore = configureStore([thunk]);

describe('FilterBySummaryPeriod', () => {
  let store;

  const renderComponent = () => render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace/tide-dashboard']}>
        <FilterBySummaryPeriod />
      </MemoryRouter>
    </Provider>
  );

  it('dispatches the summary period filter and an offset reset when a summary period is applied', async () => {
    store = mockStore({
      blip: {
        selectedClinicId: 'clinic123',
        tideDashboardFilters: {
          lastData: 7,
          patientTags: [],
          clinicSites: [],
          summaryPeriod: '14d' },
      },
    });

    renderComponent();

    // Open the dropdown
    expect(screen.queryByTestId('summary-period-filter-dropdown')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Summarizing 14 days of data/ }));

    expect(screen.getByTestId('summary-period-filter-dropdown')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /24 hours/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /7 days/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /14 days/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /30 days/ })).toBeInTheDocument();

    // Selecting a period
    await userEvent.click(screen.getByRole('radio', { name: /30 days/ }));
    expect(store.getActions()).toStrictEqual([]);

    // Applying the filter dispatches the new period and resets the page offset
    await userEvent.click(screen.getByRole('button', { name: /Apply/ }));
    expect(store.getActions()).toStrictEqual([
      setSummaryPeriodFilter('30d'),
      setOffset(0),
    ]);
  });
});
