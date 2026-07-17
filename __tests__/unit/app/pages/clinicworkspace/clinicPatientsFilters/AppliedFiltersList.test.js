import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'theme-ui';

import theme from '@app/themes/baseTheme';
import AppliedFiltersList from '@app/pages/clinicworkspace/clinicPatientsFilters/AppliedFiltersList';
import { defaultFilterState, SPECIAL_FILTER_STATES } from '@app/pages/clinicworkspace/useClinicPatientsFilters';

const mockStore = configureStore([thunk]);

const FULLY_ACTIVE_FILTERS = {
  ...defaultFilterState,
  lastData: 14,
  lastDataType: 'cgm',
  timeInRange: ['timeInTargetPercent', 'timeInVeryLowPercent'],
  patientTags: ['tag1', 'tag2'],
  clinicSites: ['site1', 'site2'],
};

const buildState = ({
  fetchedPatientCount = 5,
  patientListSearchTextInput = '',
} = {}) => ({
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
    patientListFilters: { patientListSearchTextInput },
  },
});

const renderList = ({
  activeFilters = defaultFilterState,
  setActiveFilters = jest.fn(),
  onClearSearch = jest.fn(),
  onResetFilters = jest.fn(),
  state = buildState(),
} = {}) => {
  const store = mockStore(state);

  const utils = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AppliedFiltersList
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          onClearSearch={onClearSearch}
          onResetFilters={onResetFilters}
        />
      </ThemeProvider>
    </Provider>
  );

  return { ...utils, setActiveFilters, onClearSearch, onResetFilters };
};

describe('AppliedFiltersList', () => {
  // The adapter derives the patient-query state from the active filters + search text and renders the
  // matching ClearFilterButtons controls, wiring each to the onClearSearch / onResetFilters callbacks.
  describe('clear/reset controls', () => {
    it('shows a "Reset Filters" control that fires onResetFilters when only filters are active', async () => {
      const { onResetFilters, onClearSearch } = renderList({
        activeFilters: { ...defaultFilterState, timeInRange: ['timeInTargetPercent'] },
      });

      await userEvent.click(screen.getByRole('button', { name: 'Reset All Filters' }));

      expect(onResetFilters).toHaveBeenCalledTimes(1);
      expect(onClearSearch).not.toHaveBeenCalled();
    });

    it('shows a "Clear Search" control that fires onClearSearch when only a search is active', async () => {
      const { onClearSearch, onResetFilters } = renderList({
        activeFilters: defaultFilterState,
        state: buildState({ patientListSearchTextInput: 'john' }),
      });

      await userEvent.click(screen.getByRole('button', { name: 'Clear Search' }));

      expect(onClearSearch).toHaveBeenCalledTimes(1);
      expect(onResetFilters).not.toHaveBeenCalled();
    });

    it('shows both controls, each wired to its own callback, when a filter and a search are both active', async () => {
      const { onClearSearch, onResetFilters } = renderList({
        activeFilters: { ...defaultFilterState, timeInRange: ['timeInTargetPercent'] },
        state: buildState({ patientListSearchTextInput: 'john' }),
      });

      await userEvent.click(screen.getByRole('button', { name: 'Reset All Filters' }));
      await userEvent.click(screen.getByRole('button', { name: 'Clear Search' }));

      expect(onResetFilters).toHaveBeenCalledTimes(1);
      expect(onClearSearch).toHaveBeenCalledTimes(1);
    });
  });

  // The core adapter contract: a chip's remove action must call the `setActiveFilters` prop with a
  // new filter object that removes exactly the clicked filter and leaves every other filter intact.
  describe('removing filters fires setActiveFilters correctly', () => {
    it('resets lastData and lastDataType to their defaults when the data-recency chip is removed', async () => {
      const { setActiveFilters } = renderList({ activeFilters: FULLY_ACTIVE_FILTERS });

      await userEvent.click(screen.getByLabelText('Remove CGM data within 14 days filter'));

      expect(setActiveFilters).toHaveBeenCalledTimes(1);
      expect(setActiveFilters).toHaveBeenCalledWith({
        ...FULLY_ACTIVE_FILTERS,
        lastData: defaultFilterState.lastData,
        lastDataType: defaultFilterState.lastDataType,
      });
    });

    it('removes only the clicked time-in-range value, preserving the others', async () => {
      const { setActiveFilters } = renderList({ activeFilters: FULLY_ACTIVE_FILTERS });

      await userEvent.click(screen.getByLabelText('Remove %TIR = Meeting Targets filter'));

      expect(setActiveFilters).toHaveBeenCalledTimes(1);
      expect(setActiveFilters).toHaveBeenCalledWith({
        ...FULLY_ACTIVE_FILTERS,
        timeInRange: ['timeInVeryLowPercent'],
      });
    });

    it('removes only the clicked patient tag, preserving the others', async () => {
      const { setActiveFilters } = renderList({ activeFilters: FULLY_ACTIVE_FILTERS });

      await userEvent.click(screen.getByLabelText('Remove Tag One filter'));

      expect(setActiveFilters).toHaveBeenCalledTimes(1);
      expect(setActiveFilters).toHaveBeenCalledWith({
        ...FULLY_ACTIVE_FILTERS,
        patientTags: ['tag2'],
      });
    });

    it('removes only the clicked clinic site, preserving the others', async () => {
      const { setActiveFilters } = renderList({ activeFilters: FULLY_ACTIVE_FILTERS });

      await userEvent.click(screen.getByLabelText('Remove Site Alpha filter'));

      expect(setActiveFilters).toHaveBeenCalledTimes(1);
      expect(setActiveFilters).toHaveBeenCalledWith({
        ...FULLY_ACTIVE_FILTERS,
        clinicSites: ['site2'],
      });
    });
  });
});
