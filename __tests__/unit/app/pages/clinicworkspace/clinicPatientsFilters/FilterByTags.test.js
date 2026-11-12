import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import * as actions from '@app/redux/actions';
import FilterByTags from '@app/pages/clinicworkspace/clinicPatientsFilters/FilterByTags';
import { trackMetric as mockTrackMetric } from '../../../../../app/core/metricUtils';
import useIsClinicAdmin from '@app/pages/clinicworkspace/useIsClinicAdmin';

jest.mock('@app/pages/clinicworkspace/useIsClinicAdmin');

jest.mock('@app/redux/actions', () => ({
  async: {
    fetchClinicPatientTags: jest.fn().mockReturnValue({ type: 'FETCH_CLINIC_PATIENT_TAGS' }),
  },
}));

const mockStore = configureStore([thunk]);

describe('FilterByTags', () => {
  let store;
  let wrapper;

  const api = { some: 'api' };
  const selectedClinicId = 'clinic123';

  const patientTagDefs = [
    { id: 'tag1', name: 'Tag One' },
    { id: 'tag2', name: 'Tag Two' },
  ];

  const setActiveFilters = jest.fn();
  const setShowClinicPatientTagsDialog = jest.fn();

  useIsClinicAdmin.mockReturnValue(true);

  const ui = (props = {}) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace']}>
        <FilterByTags
          api={api}
          setActiveFilters={setActiveFilters}
          setShowClinicPatientTagsDialog={setShowClinicPatientTagsDialog}
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
        clinics: { [selectedClinicId]: { id: selectedClinicId, patientTags: patientTagDefs } },
      },
    });

    setActiveFilters.mockClear();
    setShowClinicPatientTagsDialog.mockClear();
  });

  describe('handleChange', () => {
    it('calls setActiveFilters with the applied tags merged into the existing activeFilters', async () => {
      wrapper = renderComponent({ activeFilters: { patientTags: [], clinicSites: ['siteX'] } });

      await userEvent.click(screen.getByRole('button', { name: /^Tags/ }));
      await screen.findByTestId('tag-filter-option-checkbox-tag1');

      await userEvent.click(screen.getByTestId('tag-filter-option-checkbox-tag1'));
      await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

      expect(setActiveFilters).toHaveBeenCalledTimes(1);
      expect(setActiveFilters).toHaveBeenCalledWith({
        patientTags: ['tag1'],
        clinicSites: ['siteX'],
      });
    });
  });

  describe('onClickEditTags visibility', () => {
    it('offers the edit-tags control to clinic admins only', async () => {
      // Hidden if not admin
      useIsClinicAdmin.mockReturnValue(false);
      const { rerender } = renderComponent();

      expect(screen.queryByRole('button', { name: 'Edit Tags' })).not.toBeInTheDocument();

      // Visible if not admin
      useIsClinicAdmin.mockReturnValue(true);
      rerender(ui());

      await userEvent.click(screen.getByRole('button', { name: /^Tags/ }));
      await screen.findByTestId('tag-filter-option-checkbox-tag1');

      const editButton = screen.getByRole('button', { name: 'Edit Tags' });
      expect(editButton).toBeInTheDocument();

      await userEvent.click(editButton);

      expect(actions.async.fetchClinicPatientTags).toHaveBeenCalledWith(api, selectedClinicId);
      expect(setShowClinicPatientTagsDialog).toHaveBeenCalledWith(true);
      expect(mockTrackMetric).toHaveBeenCalledWith(
        'Clinic - Edit clinic tags open',
        expect.objectContaining({ clinicId: selectedClinicId, source: 'Filter menu', pageName: 'Population Health' })
      );
    });
  });

  describe('patientTags passthrough', () => {
    it('reflects the active patient tags in the filter count', () => {
      wrapper = renderComponent({ activeFilters: { patientTags: ['tag1', 'tag2'] } });

      expect(screen.getByLabelText('filter count')).toHaveTextContent('2');
    });
  });
});
