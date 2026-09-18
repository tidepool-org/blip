import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import { useFlags } from 'launchdarkly-react-client-sdk';
import FilterByTimeInRange from '@app/pages/clinicworkspace/clinicPatientsFilters/FilterByTimeInRange';

jest.mock('launchdarkly-react-client-sdk');

const mockStore = configureStore([thunk]);

describe('FilterByTimeInRange', () => {
  let store;

  const selectedClinicId = 'clinic123';

  const setActiveFilters = jest.fn();

  useFlags.mockReturnValue({ showExtremeHigh: false });

  const ui = (props = {}) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace']}>
        <FilterByTimeInRange
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
    it('calls setActiveFilters with the applied time in range filters merged into the existing activeFilters', async () => {
      renderComponent({ activeFilters: { timeInRange: [], patientTags: ['tag1'] } });

      await userEvent.click(screen.getByRole('button', { name: /Time in Range/ }));
      await screen.findByRole('checkbox', { name: /Very High/ });

      await userEvent.click(screen.getByRole('checkbox', { name: /Very High/ }));
      await userEvent.click(screen.getByRole('checkbox', { name: /Very Low/ }));
      await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

      expect(setActiveFilters).toHaveBeenCalledTimes(1);
      expect(setActiveFilters).toHaveBeenCalledWith({
        timeInRange: ['timeInVeryHighPercent', 'timeInVeryLowPercent'],
        patientTags: ['tag1'],
      });
    });
  });

  describe('timeInRange passthrough', () => {
    it('pre-selects the checkboxes matching the active filters', async () => {
      renderComponent({ activeFilters: { timeInRange: ['timeInVeryLowPercent'] } });

      await userEvent.click(screen.getByRole('button', { name: /Time in Range/ }));
      await screen.findByRole('checkbox', { name: /Very Low/ });

      expect(screen.getByRole('checkbox', { name: /Very Low/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Very High/ })).not.toBeChecked();
    });
  });
});
