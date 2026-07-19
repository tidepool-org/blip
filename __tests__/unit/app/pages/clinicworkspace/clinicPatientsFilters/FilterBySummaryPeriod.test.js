import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import FilterBySummaryPeriod from '@app/pages/clinicworkspace/clinicPatientsFilters/FilterBySummaryPeriod';
import { trackMetric as mockTrackMetric } from '../../../../../app/core/metricUtils';

const mockStore = configureStore([thunk]);

describe('FilterBySummaryPeriod', () => {
  let store;
  let wrapper;

  const selectedClinicId = 'clinic123';

  const setActiveSummaryPeriod = jest.fn();

  const ui = (props = {}) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace']}>
        <FilterBySummaryPeriod
          setActiveSummaryPeriod={setActiveSummaryPeriod}
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

    setActiveSummaryPeriod.mockClear();
    mockTrackMetric.mockClear();
  });

  describe('handleChange', () => {
    it('calls setActiveSummaryPeriod with the newly selected period', async () => {
      wrapper = renderComponent({ activeSummaryPeriod: '14d' });

      // Open the dropdown via the trigger's icon label (its text label is the dynamic
      // "Summarizing ..." string that changes with the active period).
      await userEvent.click(screen.getByRole('button', { name: /Filter by summary period duration/ }));
      await screen.findByRole('radio', { name: /30 days/ });

      await userEvent.click(screen.getByRole('radio', { name: /30 days/ }));
      await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

      // The period value is passed straight through, not merged into an activeFilters object
      expect(setActiveSummaryPeriod).toHaveBeenCalledTimes(1);
      expect(setActiveSummaryPeriod).toHaveBeenCalledWith('30d');
    });
  });

  describe('activeSummaryPeriod passthrough', () => {
    it('reflects the active summary period in the trigger label and the pre-selected radio', async () => {
      wrapper = renderComponent({ activeSummaryPeriod: '7d' });

      // Trigger label reflects the active period
      expect(screen.getByRole('button', { name: /Summarizing 7 days of data/ })).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /Filter by summary period duration/ }));

      expect(screen.getByRole('radio', { name: /7 days/ })).toBeChecked();
      expect(screen.getByRole('radio', { name: /14 days/ })).not.toBeChecked();
      expect(screen.getByRole('radio', { name: /30 days/ })).not.toBeChecked();
    });
  });
});
