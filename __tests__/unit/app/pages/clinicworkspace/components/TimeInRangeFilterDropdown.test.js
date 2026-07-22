import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import { useFlags } from 'launchdarkly-react-client-sdk';
import TimeInRangeFilterDropdown from '@app/pages/clinicworkspace/components/TimeInRangeFilterDropdown';
import { MMOLL_UNITS } from '@app/core/constants';
import { trackMetric as mockTrackMetric } from '../../../../../app/core/metricUtils';

jest.mock('launchdarkly-react-client-sdk');

const mockStore = configureStore([thunk]);

describe('TimeInRangeFilterDropdown', () => {
  let store;

  const selectedClinicId = 'clinic123';

  let onChange = jest.fn();

  const ui = (props = {}) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace']}>
        <TimeInRangeFilterDropdown
          onChange={onChange}
          timeInRange={[]}
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

    useFlags.mockReturnValue({ showExtremeHigh: false });
    onChange.mockClear();
    mockTrackMetric.mockClear();
  });

  describe('filtering for time in range', () => {
    it('applies the time in range filters based on checkboxes selected', async () => {
      renderComponent({ timeInRange: [] });

      // Empty due to no TIR filters applied
      expect(screen.queryByLabelText('filter count')).not.toBeInTheDocument();

      // Dropdown closed initially
      expect(screen.queryByTestId('time-in-range-filter-dropdown')).not.toBeInTheDocument();

      // Open the dropdown
      await userEvent.click(screen.getByRole('button', { name: /Time in Range/ }));
      expect(screen.getByRole('checkbox', { name: /Very High/ })).toBeInTheDocument();

      // Nothing selected initially
      expect(screen.getByRole('checkbox', { name: /Very High/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /^High/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Not meeting TIR/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /^Low/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Very Low/ })).not.toBeChecked();

      // Selecting ranges and applying sets the filter
      await userEvent.click(screen.getByRole('checkbox', { name: /Very High/ }));
      await userEvent.click(screen.getByRole('checkbox', { name: /Very Low/ }));
      await userEvent.click(screen.getByRole('button', { name: /Apply/ }));
      expect(onChange).toHaveBeenCalledWith(['timeInVeryHighPercent', 'timeInVeryLowPercent']);

      // Dropdown should automatically close
      expect(screen.queryByTestId('time-in-range-filter-dropdown')).not.toBeInTheDocument();
    });

    it('clears the filter', async () => {
      renderComponent({ timeInRange: ['timeInVeryHighPercent', 'timeInVeryLowPercent'] });

      expect(screen.getByLabelText('filter count')).toHaveTextContent('2');

      await userEvent.click(screen.getByRole('button', { name: /Time in Range/ }));
      expect(screen.getByRole('checkbox', { name: /Very High/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /^High/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Not meeting TIR/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /^Low/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Very Low/ })).toBeChecked();

      await userEvent.click(screen.getByRole('button', { name: /Clear/ }));
      expect(onChange).toHaveBeenCalledWith([]);
      expect(screen.queryByRole('checkbox', { name: /Very High/ })).not.toBeInTheDocument();
    });

    it('shows the highest range option only when the showExtremeHigh flag is set', async () => {
      // Hidden when the flag is off
      const { rerender } = renderComponent();
      await userEvent.click(screen.getByRole('button', { name: /Time in Range/ }));
      expect(screen.queryByRole('checkbox', { name: /Highest/ })).not.toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /Very High/ })).toBeInTheDocument();

      // Visible when the flag is on
      useFlags.mockReturnValue({ showExtremeHigh: true });
      rerender(ui());
      expect(screen.getByRole('checkbox', { name: /Highest/ })).toBeInTheDocument();
    });

    it('removes a range when its checkbox is unchecked', async () => {
      renderComponent({ timeInRange: ['timeInVeryHighPercent', 'timeInVeryLowPercent'] });

      await userEvent.click(screen.getByRole('button', { name: /Time in Range/ }));
      expect(screen.getByRole('checkbox', { name: /Very High/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Very Low/ })).toBeChecked();

      // Unchecking a selected range removes it from the applied filter
      await userEvent.click(screen.getByRole('checkbox', { name: /Very High/ }));
      expect(screen.getByRole('checkbox', { name: /Very High/ })).not.toBeChecked();

      await userEvent.click(screen.getByRole('button', { name: /Apply/ }));
      expect(onChange).toHaveBeenCalledWith(['timeInVeryLowPercent']);
    });

    it('applies the "Not meeting TIR" (target) range', async () => {
      renderComponent({ timeInRange: [] });

      await userEvent.click(screen.getByRole('button', { name: /Time in Range/ }));

      // This is the only option using a "Less than" threshold (the rest use "Greater than")
      expect(screen.getByText(/Less than 70%/)).toBeInTheDocument();

      await userEvent.click(screen.getByRole('checkbox', { name: /Not meeting TIR/ }));
      await userEvent.click(screen.getByRole('button', { name: /Apply/ }));
      expect(onChange).toHaveBeenCalledWith(['timeInTargetPercent']);
    });

    it('renders the range definitions in mg/dL units', async () => {
      renderComponent({ timeInRange: [] });
      await userEvent.click(screen.getByRole('button', { name: /Time in Range/ }));

      expect(screen.getByText('Greater than 1% Time <54 mg/dL')).toBeInTheDocument(); // Very Low
      expect(screen.getByText('Greater than 4% Time <70 mg/dL')).toBeInTheDocument(); // Low
      expect(screen.getByText('Less than 70% Time between 70-180 mg/dL')).toBeInTheDocument(); // Not meeting TIR
      expect(screen.getByText('Greater than 25% Time >180 mg/dL')).toBeInTheDocument(); // High
      expect(screen.getByText('Greater than 5% Time >250 mg/dL')).toBeInTheDocument(); // Very High
    });

    it('renders the range definitions in mmol/L units', async () => {
      store = mockStore({
        blip: {
          selectedClinicId,
          clinics: { [selectedClinicId]: { id: selectedClinicId, preferredBgUnits: MMOLL_UNITS } },
        },
      });

      renderComponent({ timeInRange: [] });
      await userEvent.click(screen.getByRole('button', { name: /Time in Range/ }));

      expect(screen.getByText('Greater than 1% Time <3.0 mmol/L')).toBeInTheDocument(); // Very Low
      expect(screen.getByText('Greater than 4% Time <3.9 mmol/L')).toBeInTheDocument(); // Low
      expect(screen.getByText('Less than 70% Time between 3.9-10.0 mmol/L')).toBeInTheDocument(); // Not meeting TIR
      expect(screen.getByText('Greater than 25% Time >10.0 mmol/L')).toBeInTheDocument(); // High
      expect(screen.getByText('Greater than 5% Time >13.9 mmol/L')).toBeInTheDocument(); // Very High
    });
  });
});
