import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import FilterByDataRecency from '@app/pages/clinicworkspace/clinicPatientsFilters/FilterByDataRecency';

const mockStore = configureStore([thunk]);

describe('FilterByDataRecency', () => {
  let store;
  let wrapper;

  const selectedClinicId = 'clinic123';

  const setActiveFilters = jest.fn();

  const ui = (props = {}) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace']}>
        <FilterByDataRecency
          setActiveFilters={setActiveFilters}
          {...props}
        />
      </MemoryRouter>
    </Provider>
  );

  const renderComponent = (props = {}) => render(ui(props));

  beforeEach(() => {
    store = mockStore({
      blip: {
        selectedClinicId,
        clinics: { [selectedClinicId]: { id: selectedClinicId } },
      },
    });

    setActiveFilters.mockClear();
  });

  describe('handleChange', () => {
    it('calls setActiveFilters with the applied data recency merged into the existing activeFilters', async () => {
      wrapper = renderComponent({ activeFilters: { lastData: null, lastDataType: null, patientTags: ['tag1'] } });

      await userEvent.click(screen.getByRole('button', { name: /^Data Recency/ }));
      await screen.findByTestId('data-recency-filter-dropdown');

      // Correct options exist
      expect(screen.getByRole('radio', { name: /Today/ })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Within 2 days/ })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Within 14 days/ })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Within 30 days/ })).toBeInTheDocument();
      expect(screen.queryByRole('radio', { name: /Within 7 days/ })).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('radio', { name: /CGM/ }));
      await userEvent.click(screen.getByRole('radio', { name: /Within 14 days/ }));
      await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

      expect(setActiveFilters).toHaveBeenCalledTimes(1);
      expect(setActiveFilters).toHaveBeenCalledWith({
        lastData: 14,
        lastDataType: 'cgm',
        patientTags: ['tag1'],
      });
    });
  });

  describe('activeFilters passthrough', () => {
    it('reflects the active data recency in the pre-selected radios', async () => {
      wrapper = renderComponent({ activeFilters: { lastData: 30, lastDataType: 'bgm' } });

      await userEvent.click(screen.getByRole('button', { name: /^Data Recency/ }));
      await screen.findByTestId('data-recency-filter-dropdown');

      expect(screen.getByRole('radio', { name: /BGM/ })).toBeChecked();
      expect(screen.getByRole('radio', { name: /CGM/ })).not.toBeChecked();
      expect(screen.getByRole('radio', { name: /Within 30 days/ })).toBeChecked();
    });
  });
});
