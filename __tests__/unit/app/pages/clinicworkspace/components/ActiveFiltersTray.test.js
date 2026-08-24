import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'theme-ui';
import '@app/core/language';

import theme from '@app/themes/baseTheme';
import ActiveFiltersTray from '@app/pages/clinicworkspace/components/ActiveFiltersTray';
import { defaultFilterState } from '@app/pages/clinicworkspace/useClinicPatientsFilters';

const mockStore = configureStore([thunk]);

const buildState = () => ({
  blip: {
    selectedClinicId: 'clinic123',
    clinics: {
      'clinic123': {
        id: 'clinic123',
        patientTags: [
          { id: 'tag1', name: 'Tag One' },
          { id: 'tag2', name: 'Tag Two' },
        ],
        sites: [
          { id: 'site1', name: 'Site Alpha' },
          { id: 'site2', name: 'Site Bravo' },
        ],
      },
    },
  },
});

const renderTray = ({
  filters = defaultFilterState,
  patientCount = 0,
  hasSearchActive = false,
  onRemoveFilter = jest.fn(),
  state = buildState(),
} = {}) => {
  const store = mockStore(state);

  const ui = (props = {}) => (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ActiveFiltersTray
          filters={filters}
          patientCount={patientCount}
          hasSearchActive={hasSearchActive}
          onRemoveFilter={onRemoveFilter}
          {...props}
        />
      </ThemeProvider>
    </Provider>
  );

  const utils = render(ui());

  return { ...utils, ui, onRemoveFilter };
};

describe('ActiveFiltersTray', () => {
  describe('patient count header', () => {
    it('renders the patient count', () => {
      renderTray({ patientCount: 5 });

      expect(screen.getByText('Showing 5 patients')).toBeInTheDocument();
    });

    it('notes the count reflects the search when a search is active', () => {
      renderTray({ hasSearchActive: true, patientCount: 5 });

      expect(screen.getByText('Showing 5 patients that match your search')).toBeInTheDocument();
    });
  });

  describe('primary filter chips', () => {
    it('renders a time-in-range filter under the "with" prefix using its expected label', () => {
      renderTray({ filters: { ...defaultFilterState, timeInRange: ['timeInTargetPercent'] } });

      expect(screen.getByText('with')).toBeInTheDocument();
      expect(screen.getByText('%TIR = Not in Range')).toBeInTheDocument();
    });

    it('renders a data-recency filter with its expected label', () => {
      renderTray({ filters: { ...defaultFilterState, lastData: 14, lastDataType: 'cgm' } });

      expect(screen.getByText('CGM data within 14 days')).toBeInTheDocument();
    });

    it('renders a CGM-use filter with its expected label', () => {
      renderTray({ filters: { ...defaultFilterState, timeCGMUsePercent: '>=0.7' } });

      expect(screen.getByText('≥ 70% CGM use')).toBeInTheDocument();
    });
  });

  describe('tag chips', () => {
    it('renders a "tagged" prefix and the tag name for an applied patient tag', () => {
      renderTray({ filters: { ...defaultFilterState, patientTags: ['tag1'] } });

      expect(screen.getByText('tagged')).toBeInTheDocument();
      expect(screen.getByText('Tag One')).toBeInTheDocument();
    });
  });

  describe('site chips', () => {
    it('renders a "visiting" prefix and the site name for an applied clinic site', () => {
      renderTray({ filters: { ...defaultFilterState, clinicSites: ['site1'] } });

      expect(screen.getByText('visiting')).toBeInTheDocument();
      expect(screen.getByText('Site Alpha')).toBeInTheDocument();
    });
  });

  describe('required filters', () => {
    it('renders a required filter without its remove icon', () => {
      const { ui, rerender } = renderTray({
        filters: { ...defaultFilterState, lastData: 14, lastDataType: 'cgm' },
      });

      // Removable by default: the chip renders with its remove icon
      expect(screen.getByLabelText('Remove CGM data within 14 days filter')).toBeInTheDocument();

      // Marking the filter required keeps the chip but drops the remove icon
      rerender(ui({ requiredFilters: { lastData: true } }));
      expect(screen.getByText('CGM data within 14 days')).toBeInTheDocument();
      expect(screen.queryByLabelText('Remove CGM data within 14 days filter')).not.toBeInTheDocument();
    });
  });

  describe('removing a chip', () => {
    it('fires onRemoveFilter with the chip type and value when its remove icon is clicked', async () => {
      const { onRemoveFilter } = renderTray({
        filters: { ...defaultFilterState, clinicSites: ['site1'] },
      });

      await userEvent.click(screen.getByLabelText('Remove Site Alpha filter'));

      expect(onRemoveFilter).toHaveBeenCalledTimes(1);
      expect(onRemoveFilter).toHaveBeenCalledWith('clinicSites', 'site1');
    });
  });
});
