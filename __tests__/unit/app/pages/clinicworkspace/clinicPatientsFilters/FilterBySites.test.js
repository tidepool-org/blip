import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import * as actions from '@app/redux/actions';
import FilterBySites from '@app/pages/clinicworkspace/clinicPatientsFilters/FilterBySites';
import { trackMetric as mockTrackMetric } from '../../../../../app/core/metricUtils';
import useIsClinicAdmin from '@app/pages/clinicworkspace/useIsClinicAdmin';

jest.mock('@app/pages/clinicworkspace/useIsClinicAdmin');

jest.mock('@app/redux/actions', () => ({
  async: { fetchClinicSites: jest.fn().mockReturnValue({ type: 'FETCH_CLINIC_SITES' }) },
}));

const mockStore = configureStore([thunk]);

describe('FilterBySites', () => {
  let store;
  let wrapper;

  const api = { some: 'api' };
  const selectedClinicId = 'clinic123';

  const clinicSiteDefs = [
    { id: 'site1', name: 'Site One' },
    { id: 'site2', name: 'Site Two' },
  ];

  const setActiveFilters = jest.fn();
  const setShowClinicSitesDialog = jest.fn();

  useIsClinicAdmin.mockReturnValue(true);

  const ui = (props = {}) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace']}>
        <FilterBySites
          api={api}
          setActiveFilters={setActiveFilters}
          setShowClinicSitesDialog={setShowClinicSitesDialog}
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

    setActiveFilters.mockClear();
    setShowClinicSitesDialog.mockClear();
  });

  describe('handleChange', () => {
    it('calls setActiveFilters with the applied sites merged into the existing activeFilters', async () => {
      wrapper = renderComponent({ activeFilters: { clinicSites: [], patientTags: ['tag1'] } });

      await userEvent.click(screen.getByRole('button', { name: /^Clinic Sites/ }));
      await screen.findByTestId('clinic-site-filter-option-checkbox-site1');

      await userEvent.click(screen.getByTestId('clinic-site-filter-option-checkbox-site1'));
      await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

      expect(setActiveFilters).toHaveBeenCalledTimes(1);
      expect(setActiveFilters).toHaveBeenCalledWith({
        clinicSites: ['site1'],
        patientTags: ['tag1'],
      });
    });
  });

  describe('onClickEditSites visibility', () => {
    it('offers the edit-sites control to clinic admins only', async () => {
      // Hidden if not admin
      useIsClinicAdmin.mockReturnValue(false);
      const { rerender } = renderComponent();

      expect(screen.queryByRole('button', { name: 'Edit Sites' })).not.toBeInTheDocument();

      // Visible if not admin
      useIsClinicAdmin.mockReturnValue(true);
      rerender(ui());

      await userEvent.click(screen.getByRole('button', { name: /^Clinic Sites/ }));
      await screen.findByTestId('clinic-site-filter-option-checkbox-site1');

      const editButton = screen.getByRole('button', { name: 'Edit Sites' });
      expect(editButton).toBeInTheDocument();

      await userEvent.click(editButton);

      expect(actions.async.fetchClinicSites).toHaveBeenCalledWith(api, selectedClinicId);
      expect(setShowClinicSitesDialog).toHaveBeenCalledWith(true);
      expect(mockTrackMetric).toHaveBeenCalledWith(
        'Clinic - Edit clinic sites open',
        expect.objectContaining({ clinicId: selectedClinicId, source: 'Filter menu', pageName: 'Population Health' })
      );
    });
  });

  describe('clinicSites passthrough', () => {
    it('reflects the active clinic sites in the filter count', () => {
      wrapper = renderComponent({ activeFilters: { clinicSites: ['site1', 'site2'] } });

      expect(screen.getByLabelText('clinic site count')).toHaveTextContent('2');
    });
  });
});
