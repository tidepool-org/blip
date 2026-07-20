import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import SummaryPeriodFilterDropdown from '@app/pages/clinicworkspace/components/SummaryPeriodFilterDropdown';

const mockStore = configureStore([thunk]);

describe('SummaryPeriodFilterDropdown', () => {
  let store;
  let wrapper;

  const selectedClinicId = 'clinic123';

  let onChange = jest.fn();

  const ui = (props = {}) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace']}>
        <SummaryPeriodFilterDropdown
          onChange={onChange}
          activeSummaryPeriod="14d"
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

    onChange.mockClear();
  });

  describe('filtering for summary period', () => {
    it('applies the summary period based on the radio selected', async () => {
      renderComponent({ activeSummaryPeriod: '14d' });

      // Should have correct label
      expect(screen.getByRole('button', { name: /Summarizing 14 days of data/ })).toBeInTheDocument();

      // Dropdown closed initially
      expect(screen.queryByTestId('summary-period-filter-dropdown')).not.toBeInTheDocument();

      // Open the dropdown
      await userEvent.click(screen.getByRole('button', { name: /Filter by summary period duration/ }));
      expect(screen.getByRole('radio', { name: /24 hours/ })).toBeInTheDocument();

      // The active period is pre-selected
      expect(screen.getByRole('radio', { name: /14 days/ })).toBeChecked();
      expect(screen.getByRole('radio', { name: /30 days/ })).not.toBeChecked();

      // Selecting a different period and applying sets the filter
      await userEvent.click(screen.getByRole('radio', { name: /30 days/ }));
      await userEvent.click(screen.getByRole('button', { name: /Apply/ }));
      expect(onChange).toHaveBeenCalledWith('30d');

      // Dropdown should automatically close
      expect(screen.queryByTestId('summary-period-filter-dropdown')).not.toBeInTheDocument();
    });

    it('disables the Apply button until a different period is selected', async () => {
      renderComponent({ activeSummaryPeriod: '14d' });

      await userEvent.click(screen.getByRole('button', { name: /Filter by summary period duration/ }));

      // Disabled while the pending selection matches the active period
      expect(screen.getByRole('button', { name: /Apply/ })).toBeDisabled();

      // Enabled once a different period is selected
      await userEvent.click(screen.getByRole('radio', { name: /30 days/ }));
      expect(screen.getByRole('button', { name: /Apply/ })).toBeEnabled();

      // Disabled again when re-selecting the active period
      await userEvent.click(screen.getByRole('radio', { name: /14 days/ }));
      expect(screen.getByRole('button', { name: /Apply/ })).toBeDisabled();
    });

    it('cancels without applying and resets the pending selection', async () => {
      renderComponent({ activeSummaryPeriod: '14d' });

      await userEvent.click(screen.getByRole('button', { name: /Filter by summary period duration/ }));

      // Change the selection, then cancel
      await userEvent.click(screen.getByRole('radio', { name: /30 days/ }));
      await userEvent.click(screen.getByRole('button', { name: /Cancel/ }));

      // No change is applied and the dropdown closes
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.queryByTestId('summary-period-filter-dropdown')).not.toBeInTheDocument();

      // Re-opening shows the original active period still selected (pending was reset)
      await userEvent.click(screen.getByRole('button', { name: /Filter by summary period duration/ }));
      expect(screen.getByRole('radio', { name: /14 days/ })).toBeChecked();
      expect(screen.getByRole('radio', { name: /30 days/ })).not.toBeChecked();
    });
  });
});
