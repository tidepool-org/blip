import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import * as actions from '@app/redux/actions';
import TagFilterDropdown from '@app/pages/clinicworkspace/components/TagFilterDropdown';
import { trackMetric as mockTrackMetric } from '../../../../../app/core/metricUtils';
import useIsClinicAdmin from '@app/pages/clinicworkspace/useIsClinicAdmin';
import { SPECIAL_FILTER_STATES } from '@app/pages/clinicworkspace/useClinicPatientsFilters';

jest.mock('@app/pages/clinicworkspace/useIsClinicAdmin');

const mockStore = configureStore([thunk]);

describe('TagFilterDropdown', () => {
  let store;
  let wrapper;

  const selectedClinicId = 'clinic123';

  const patientTagDefs = [
    { id: 'tag1', name: 'Week 1' },
    { id: 'tag2', name: 'Week 2' },
    { id: 'tag3', name: 'Week 3' },
    { id: 'tag4', name: 'Pregnancy' },
  ];

  const setActiveFilters = jest.fn();
  const setShowClinicPatientTagsDialog = jest.fn();

  let onChange = jest.fn();
  let onClickEditTags = jest.fn();
  let patientTags = [];

  useIsClinicAdmin.mockReturnValue(true);

  const ui = (props = {}) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace']}>
        <TagFilterDropdown
          onChange={onChange}
          onClickEditTags={onClickEditTags}
          patientTags={patientTags}
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

    onChange.mockClear();
    onClickEditTags.mockClear();
    mockTrackMetric.mockClear();
  });

  describe('filtering for tags', () => {
    it('applies tags based on checkboxes selected', async () => {
      renderComponent({ patientTags: ['tag1', 'tag3'] });

      // Dropdown closed initially
      expect(screen.queryByTestId('tag-filter-dropdown')).not.toBeInTheDocument();

      // Open the dropdown
      await userEvent.click(screen.getByRole('button', { name: /Tags/ }));
      expect(screen.getByTestId('tag-filter-dropdown')).toBeInTheDocument();

      expect(screen.getByRole('checkbox', { name: /Week 1/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Week 2/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Week 3/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Pregnancy/ })).not.toBeChecked();

      // Typing into the box should search down the options
      await userEvent.click(screen.getByRole('textbox'));
      await userEvent.paste(' wee');
      expect(screen.getByRole('checkbox', { name: /Week 1/ })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /Week 2/ })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /Week 3/ })).toBeInTheDocument();
      expect(screen.queryByRole('checkbox', { name: /Pregnancy/ })).not.toBeInTheDocument();

      // Applying a checkbox filter sets the filter
      await userEvent.click(screen.getByRole('checkbox', { name: /Week 1/ })); // unselect
      await userEvent.click(screen.getByRole('checkbox', { name: /Week 2/ })); // select
      await userEvent.click(screen.getByRole('button', { name: /Apply/ }));
      expect(onChange).toHaveBeenCalledWith(['tag3', 'tag2']);
      expect(mockTrackMetric).toHaveBeenCalledWith('Clinic - Patient tag filter apply', { clinicId: 'clinic123', pageName: 'Population Health' })

      // Dropdown should automatically close
      expect(screen.queryByTestId('tag-filter-dropdown')).not.toBeInTheDocument();
    });

    it('applies a special state for patients without tags', async () => {
      renderComponent({ patientTags: ['tag1', 'tag3'] });

      await userEvent.click(screen.getByRole('button', { name: /Tags/ }));
      expect(screen.getByRole('checkbox', { name: /Week 1/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Week 2/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Week 3/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Pregnancy/ })).not.toBeChecked();

      // Clicking the Patients without any tags checkbox should uncheck all
      await userEvent.click(screen.getByRole('checkbox', { name: /Patients without any tags/ }));
      expect(screen.getByRole('checkbox', { name: /Week 1/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Week 2/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Week 3/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Pregnancy/ })).not.toBeChecked();

      await userEvent.click(screen.getByRole('button', { name: /Apply/ }));
      expect(onChange).toHaveBeenCalledWith(SPECIAL_FILTER_STATES.ZERO_TAGS);
    });

    it('clears the filter', async () => {
      renderComponent({ patientTags: ['tag1', 'tag3'] });

      await userEvent.click(screen.getByRole('button', { name: /Tags/ }));
      expect(screen.getByRole('checkbox', { name: /Week 1/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Week 2/ })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Week 3/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Pregnancy/ })).not.toBeChecked();

      await userEvent.click(screen.getByRole('button', { name: /Clear/ }));
      expect(onChange).toHaveBeenCalledWith([]);
      expect(mockTrackMetric).toHaveBeenCalledWith('Clinic - Patient tag filter clear', { clinicId: 'clinic123', pageName: 'Population Health' });
      expect(screen.queryByTestId('tag-filter-dropdown')).not.toBeInTheDocument();
    });
  });

  describe('edit tags', () => {
    it('conditionally renders a button to edit tags', async () => {
      // Should be hidden if no passed callback fn
      useIsClinicAdmin.mockReturnValue(true);
      const { rerender } = renderComponent({ onClickEditTags: null });
      await userEvent.click(screen.getByRole('button', { name: /Tags/ }));

      expect(screen.queryByLabelText(/Edit Tags/)).not.toBeInTheDocument();

      // Should be hidden if not Clinic Admin
      useIsClinicAdmin.mockReturnValue(false);
      rerender(ui());
      expect(screen.queryByLabelText(/Edit Tags/)).not.toBeInTheDocument();

      // Visible if Clinic Admin and passed callback fn
      useIsClinicAdmin.mockReturnValue(true);
      rerender(ui());

      await userEvent.click(screen.getByLabelText(/Edit Tags/));
      expect(onClickEditTags).toHaveBeenCalled();
    });
  });
});
