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
import { defaultFilterState, SPECIAL_FILTER_STATES } from '@app/pages/clinicworkspace/useClinicPatientsFilters';

const mockStore = configureStore([thunk]);

const buildState = ({ fetchedPatientCount = 5 } = {}) => ({
  blip: {
    selectedClinicId: 'clinic123',
    clinics: {
      'clinic123': {
        id: 'clinic123',
        fetchedPatientCount,
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
  hasSearchActive = false,
  onRemoveFilter = jest.fn(),
  state = buildState(),
} = {}) => {
  const store = mockStore(state);

  const utils = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ActiveFiltersTray
          filters={filters}
          hasSearchActive={hasSearchActive}
          onRemoveFilter={onRemoveFilter}
        />
      </ThemeProvider>
    </Provider>
  );

  return { ...utils, onRemoveFilter };
};

describe('ActiveFiltersTray', () => {
  describe('patient count header', () => {
    it('renders the fetched patient count', () => {
      renderTray({ state: buildState({ fetchedPatientCount: 5 }) });

      expect(screen.getByText('Showing 5 patients')).toBeInTheDocument();
    });

    it('notes the count reflects the search when a search is active', () => {
      renderTray({ hasSearchActive: true, state: buildState({ fetchedPatientCount: 5 }) });

      expect(screen.getByText('Showing 5 patients that match your search')).toBeInTheDocument();
    });
  });

  describe('primary filter chips', () => {
    it('renders a time-in-range filter under the "with" prefix using its expected label', () => {
      renderTray({ filters: { ...defaultFilterState, timeInRange: ['timeInTargetPercent'] } });

      expect(screen.getByText('with')).toBeInTheDocument();
      expect(screen.getByText('%TIR = Meeting Targets')).toBeInTheDocument();
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
