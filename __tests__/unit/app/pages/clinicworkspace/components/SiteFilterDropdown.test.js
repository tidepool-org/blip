import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import * as actions from '@app/redux/actions';
import SiteFilterDropdown from '@app/pages/clinicworkspace/components/SiteFilterDropdown';
import { trackMetric as mockTrackMetric } from '../../../../../app/core/metricUtils';
import useIsClinicAdmin from '@app/pages/clinicworkspace/useIsClinicAdmin';
import { SPECIAL_FILTER_STATES } from '@app/pages/clinicworkspace/useClinicPatientsFilters';

jest.mock('@app/pages/clinicworkspace/useIsClinicAdmin');

const mockStore = configureStore([thunk]);

describe('SiteFilterDropdown', () => {
  let store;
  let wrapper;

  const selectedClinicId = 'clinic123';

  const clinicSiteDefs = [
    { id: 'site1', name: 'North Site' },
    { id: 'site2', name: 'South Site' },
    { id: 'site3', name: 'East Site' },
    { id: 'site4', name: 'Downtown Clinic' },
  ];

  const setActiveFilters = jest.fn();
  const setShowClinicPatientTagsDialog = jest.fn();

  let onChange = jest.fn();
  let onClickEditSites = jest.fn();
  let clinicSites = [];

  useIsClinicAdmin.mockReturnValue(true);

  const ui = (props = {}) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace']}>
        <SiteFilterDropdown
          onChange={onChange}
          onClickEditSites={onClickEditSites}
          clinicSites={clinicSites}
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
        clinics: { [selectedClinicId]: { id: selectedClinicId, sites: clinicSiteDefs } },
      },
    });

    onChange.mockClear();
    onClickEditSites.mockClear();
    mockTrackMetric.mockClear();
  });

  describe('filtering for sites', () => {
    it('applies sites based on checkboxes selected', async () => {
      renderComponent({ clinicSites: ['site1', 'site3'] });

      // Dropdown closed initially
      expect(screen.queryByTestId('site-filter-dropdown')).not.toBeInTheDocument();

      // Open the dropdown
      await userEvent.click(screen.getByRole('button', { name: /Clinic Sites/ }));
      expect(screen.getByTestId('site-filter-dropdown')).toBeInTheDocument();

      expect(screen.getByRole('checkbox', { name: /North Site/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /South Site/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /East Site/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Downtown Clinic/ })).not.toBeChecked();

      // Typing into the box should search down the options
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.paste(' site');
      expect(screen.getByRole('checkbox', { name: /North Site/ })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /South Site/ })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /East Site/ })).toBeInTheDocument();
      expect(screen.queryByRole('checkbox', { name: /Downtown Clinic/ })).not.toBeInTheDocument();

      // Applying a checkbox filter sets the filter
      await userEvent.click(screen.getByRole('checkbox', { name: /North Site/ })); // unselect
      await userEvent.click(screen.getByRole('checkbox', { name: /South Site/ })); // select
      await userEvent.click(screen.getByRole('button', { name: /Apply/ }));
      expect(onChange).toHaveBeenCalledWith(['site3', 'site2']);
      expect(mockTrackMetric).toHaveBeenCalledWith('Clinic - Clinic sites filter apply', { clinicId: 'clinic123', pageName: 'Population Health' })

      // Dropdown should automatically close
      expect(screen.queryByTestId('site-filter-dropdown')).not.toBeInTheDocument();
    });

    it('applies a special state for patients without sites', async () => {
      renderComponent({ clinicSites: ['site1', 'site3'] });

      await userEvent.click(screen.getByRole('button', { name: /Clinic Sites/ }));
      expect(screen.getByRole('checkbox', { name: /North Site/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /South Site/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /East Site/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Downtown Clinic/ })).not.toBeChecked();

      // Clicking the Patients without any sites checkbox should uncheck all
      await userEvent.click(screen.getByRole('checkbox', { name: /Patients without any sites/ }));
      expect(screen.getByRole('checkbox', { name: /North Site/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /South Site/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /East Site/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Downtown Clinic/ })).not.toBeChecked();

      await userEvent.click(screen.getByRole('button', { name: /Apply/ }));
      expect(onChange).toHaveBeenCalledWith(SPECIAL_FILTER_STATES.ZERO_SITES);
    });

    it('clears the filter', async () => {
      renderComponent({ clinicSites: ['site1', 'site3'] });

      await userEvent.click(screen.getByRole('button', { name: /Clinic Sites/ }));
      expect(screen.getByRole('checkbox', { name: /North Site/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /South Site/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /East Site/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Downtown Clinic/ })).not.toBeChecked();

      await userEvent.click(screen.getByRole('button', { name: /Clear/ }));
      expect(onChange).toHaveBeenCalledWith([]);
      expect(mockTrackMetric).toHaveBeenCalledWith('Clinic - Clinic site filter clear', { clinicId: 'clinic123', pageName: 'Population Health' })
      expect(screen.queryByTestId('site-filter-dropdown')).not.toBeInTheDocument();
    });
  });

  describe('edit sites', () => {
    it('conditionally renders a button to edit sites', async () => {
      // Should be hidden if no passed callback fn
      useIsClinicAdmin.mockReturnValue(true);
      const { rerender } = renderComponent({ onClickEditSites: null });
      await userEvent.click(screen.getByRole('button', { name: /Clinic Sites/ }));

      expect(screen.queryByLabelText(/Edit Sites/)).not.toBeInTheDocument();

      // Should be hidden if not Clinic Admin
      useIsClinicAdmin.mockReturnValue(false);
      rerender(ui());
      expect(screen.queryByLabelText(/Edit Sites/)).not.toBeInTheDocument();

      // Visible if Clinic Admin and passed callback fn
      useIsClinicAdmin.mockReturnValue(true);
      rerender(ui());

      await userEvent.click(screen.getByLabelText(/Edit Sites/));
      expect(onClickEditSites).toHaveBeenCalled();
    });
  });
});
