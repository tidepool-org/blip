import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';

import FilterByCGMUse from '@app/pages/clinicworkspace/clinicPatientsFilters/FilterByCGMUse';
import useClinicMetricsPageName from '@app/pages/clinicworkspace/useClinicMetricsPageName';

jest.mock('@app/pages/clinicworkspace/useClinicMetricsPageName');

useClinicMetricsPageName.mockReturnValue('Population Health');

const mockStore = configureStore([thunk]);

describe('FilterByCGMUse', () => {
  let store;

  const selectedClinicId = 'clinic123';

  const setActiveFilters = jest.fn();

  const ui = (props = {}) => (
    <Provider store={store}>
      <FilterByCGMUse
        setActiveFilters={setActiveFilters}
        {...props}
      />
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
    it('calls setActiveFilters with the applied cgm use merged into the existing activeFilters', async () => {
      renderComponent({ activeFilters: { timeCGMUsePercent: null, patientTags: ['tag1'] } });

      await userEvent.click(screen.getByRole('button', { name: /CGM Use/ }));
      await screen.findByTestId('cgm-use-filter-dropdown');

      await userEvent.click(screen.getByRole('radio', { name: /Less than 70%/ }));
      await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

      expect(setActiveFilters).toHaveBeenCalledTimes(1);
      expect(setActiveFilters).toHaveBeenCalledWith({
        timeCGMUsePercent: '<0.7',
        patientTags: ['tag1'],
      });
    });
  });

  describe('activeFilters passthrough', () => {
    it('reflects the active cgm use in the pre-selected radio', async () => {
      renderComponent({ activeFilters: { timeCGMUsePercent: '>=0.7' } });

      await userEvent.click(screen.getByRole('button', { name: /CGM Use/ }));
      await screen.findByTestId('cgm-use-filter-dropdown');

      expect(screen.getByRole('radio', { name: /70% or more/ })).toBeChecked();
      expect(screen.getByRole('radio', { name: /Less than 70%/ })).not.toBeChecked();
    });
  });
});
