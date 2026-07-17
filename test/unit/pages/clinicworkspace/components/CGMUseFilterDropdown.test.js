import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';

import CGMUseFilterDropdown from '@app/pages/clinicworkspace/components/CGMUseFilterDropdown';

const mockStore = configureStore([thunk]);

describe('CGMUseFilterDropdown', () => {
  let store;

  const selectedClinicId = 'clinic123';

  let onChange = jest.fn();

  const ui = (props = {}) => (
    <Provider store={store}>
      <CGMUseFilterDropdown
        onChange={onChange}
        timeCGMUsePercent={null}
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

    onChange.mockClear();
  });

  describe('filtering for cgm use', () => {
    it('applies the cgm use filter based on the radio selected', async () => {
      renderComponent({ timeCGMUsePercent: null });

      // Dropdown closed initially
      expect(screen.queryByTestId('cgm-use-filter-dropdown')).not.toBeInTheDocument();

      // Open the dropdown
      await userEvent.click(screen.getByRole('button', { name: /CGM Use/ }));
      expect(screen.getByTestId('cgm-use-filter-dropdown')).toBeInTheDocument();

      // Nothing selected initially
      expect(screen.getByRole('radio', { name: /Less than 70%/ })).not.toBeChecked();
      expect(screen.getByRole('radio', { name: /70% or more/ })).not.toBeChecked();

      // Selecting an option and applying sets the filter
      await userEvent.click(screen.getByRole('radio', { name: /Less than 70%/ }));
      await userEvent.click(screen.getByRole('button', { name: /Apply/ }));
      expect(onChange).toHaveBeenCalledWith('<0.7');

      // Dropdown should automatically close
      expect(screen.queryByTestId('cgm-use-filter-dropdown')).not.toBeInTheDocument();
    });

    it('disables the Apply button until an option is selected', async () => {
      renderComponent({ timeCGMUsePercent: null });

      await userEvent.click(screen.getByRole('button', { name: /CGM Use/ }));

      // Disabled with nothing selected
      expect(screen.getByRole('button', { name: /Apply/ })).toBeDisabled();

      // Enabled once an option is selected
      await userEvent.click(screen.getByRole('radio', { name: /70% or more/ }));
      expect(screen.getByRole('button', { name: /Apply/ })).toBeEnabled();
    });

    it('pre-selects the radio matching the active filter', async () => {
      renderComponent({ timeCGMUsePercent: '>=0.7' });

      await userEvent.click(screen.getByRole('button', { name: /CGM Use/ }));

      expect(screen.getByRole('radio', { name: /70% or more/ })).toBeChecked();
      expect(screen.getByRole('radio', { name: /Less than 70%/ })).not.toBeChecked();
    });

    it('clears the filter', async () => {
      renderComponent({ timeCGMUsePercent: '<0.7' });

      await userEvent.click(screen.getByRole('button', { name: /CGM Use/ }));
      expect(screen.getByRole('radio', { name: /Less than 70%/ })).toBeChecked();

      await userEvent.click(screen.getByRole('button', { name: /Clear/ }));
      expect(onChange).toHaveBeenCalledWith(null);
      expect(screen.queryByTestId('cgm-use-filter-dropdown')).not.toBeInTheDocument();
    });
  });
});
