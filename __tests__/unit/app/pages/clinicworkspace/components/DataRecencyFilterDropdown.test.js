import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import * as actions from '@app/redux/actions';
import DataRecencyFilterDropdown from '@app/pages/clinicworkspace/components/DataRecencyFilterDropdown';
import { trackMetric as mockTrackMetric } from '../../../../../app/core/metricUtils';

const mockStore = configureStore([thunk]);

describe('DataRecencyFilterDropdown', () => {
  let store;
  let wrapper;

  const selectedClinicId = 'clinic123';

  const filterOptions = [
    { value: 1, label: 'Today' },
    { value: 2, label: 'Within 2 days' },
    { value: 14, label: 'Within 14 days' },
    { value: 30, label: 'Within 30 days' },
  ];

  let onChange = jest.fn();

  const ui = (props = {}) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace']}>
        <DataRecencyFilterDropdown
          onChange={onChange}
          filterOptions={filterOptions}
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
    mockTrackMetric.mockClear();
  });

  describe('filtering for data recency', () => {
    it('applies the device type and data recency based on radios selected', async () => {
      renderComponent();

      // Dropdown closed initially
      expect(screen.queryByTestId('data-recency-filter-dropdown')).not.toBeInTheDocument();

      // Open the dropdown
      await userEvent.click(screen.getByRole('button', { name: /Data Recency/ }));
      expect(screen.getByTestId('data-recency-filter-dropdown')).toBeInTheDocument();

      // Nothing selected initially
      expect(screen.getByRole('radio', { name: /CGM/ })).not.toBeChecked();
      expect(screen.getByRole('radio', { name: /BGM/ })).not.toBeChecked();
      expect(screen.getByRole('radio', { name: /Within 14 days/ })).not.toBeChecked();

      // Select a device type and a data recency window
      await userEvent.click(screen.getByRole('radio', { name: /CGM/ }));
      await userEvent.click(screen.getByRole('radio', { name: /Within 14 days/ }));

      // Applying the filter sets it
      await userEvent.click(screen.getByRole('button', { name: /Apply/ }));
      expect(onChange).toHaveBeenCalledWith({ lastData: 14, lastDataType: 'cgm' });
      expect(mockTrackMetric).toHaveBeenCalledWith('Clinic - Last upload apply filter', { clinicId: 'clinic123', dateRange: '14 days', type: 'cgm' });

      // Dropdown should automatically close
      expect(screen.queryByTestId('data-recency-filter-dropdown')).not.toBeInTheDocument();
    });

    it('disables the Apply button until both a device type and data recency are selected', async () => {
      renderComponent();

      await userEvent.click(screen.getByRole('button', { name: /Data Recency/ }));

      // Disabled with nothing selected
      expect(screen.getByRole('button', { name: /Apply/ })).toBeDisabled();

      // Still disabled with only a device type selected
      await userEvent.click(screen.getByRole('radio', { name: /BGM/ }));
      expect(screen.getByRole('button', { name: /Apply/ })).toBeDisabled();

      // Enabled once a data recency window is also selected
      await userEvent.click(screen.getByRole('radio', { name: /Within 2 days/ }));
      expect(screen.getByRole('button', { name: /Apply/ })).toBeEnabled();
    });

    it('pre-selects the radios matching the active filters', async () => {
      renderComponent({ lastData: 30, lastDataType: 'cgm' });

      await userEvent.click(screen.getByRole('button', { name: /Data Recency/ }));

      expect(screen.getByRole('radio', { name: /CGM/ })).toBeChecked();
      expect(screen.getByRole('radio', { name: /BGM/ })).not.toBeChecked();
      expect(screen.getByRole('radio', { name: /Within 30 days/ })).toBeChecked();
    });

    it('clears the filter', async () => {
      renderComponent({ lastData: 14, lastDataType: 'cgm' });

      await userEvent.click(screen.getByRole('button', { name: /Data Recency/ }));
      expect(screen.getByRole('radio', { name: /CGM/ })).toBeChecked();
      expect(screen.getByRole('radio', { name: /Within 14 days/ })).toBeChecked();

      await userEvent.click(screen.getByRole('button', { name: /Clear/ }));
      expect(onChange).toHaveBeenCalledWith({ lastData: null, lastDataType: null });
      expect(mockTrackMetric).toHaveBeenCalledWith('Clinic - Last upload clear filter', { clinicId: 'clinic123', pageName: 'Population Health' });
      expect(screen.queryByTestId('data-recency-filter-dropdown')).not.toBeInTheDocument();
    });
  });
});
