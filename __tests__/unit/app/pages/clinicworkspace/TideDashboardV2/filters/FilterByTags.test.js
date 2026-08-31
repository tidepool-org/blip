import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import FilterByTags from '@app/pages/clinicworkspace/TideDashboardV2/filters/FilterByTags';

const mockStore = configureStore([thunk]);

describe('FilterByTags', () => {
  let store;

  const renderComponent = () => render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace/tide-dashboard']}>
        <FilterByTags />
      </MemoryRouter>
    </Provider>
  );

  it('dispatches the patient tags filter and an offset reset when a tag filter is applied', async () => {
    store = mockStore({
      blip: {
        selectedClinicId: 'clinic123',
        clinics: {
          clinic123: {
            id: 'clinic123',
            patientTags: [
              { id: 'tag1', name: 'Week 1' },
              { id: 'tag2', name: 'Week 2' },
            ],
          },
        },
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
    expect(screen.queryByTestId('tag-filter-dropdown')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Tags/ }));
    expect(screen.getByTestId('tag-filter-dropdown')).toBeInTheDocument();

    // Selecting a tag
    await userEvent.click(screen.getByRole('checkbox', { name: /Week 2/ }));
    expect(store.getActions()).toStrictEqual([]);

    // Applying the filter dispatches the selected tags and resets the page offset
    await userEvent.click(screen.getByRole('button', { name: /Apply/ }));
    expect(store.getActions()).toStrictEqual([
      { type: 'tideDashboardFilters/setPatientTagsFilter', payload: ['tag2'] },
      { type: 'tideDashboard/setOffset', payload: 0 },
    ]);
  });
});
