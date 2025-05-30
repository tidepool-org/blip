/* global jest, beforeEach, afterEach, test, expect, describe, it */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import thunk from 'redux-thunk';
import mockLocalStorage from '../../../../utils/mockLocalStorage';

// Import the mocked component
import SelectTags from '../../../../../app/components/clinic/PatientForm/SelectTags';

describe('SelectTags', ()  => {
  const storeFixture = {
    blip: {
      loggedInUserId: 'abcd-1234',
      membershipInOtherCareTeams: [],
      selectedClinicId: '4b68d',
      clinics: {
        '4b68d': {
          id: '4b68d',
          name: 'Test Clinic',
          patientTags: [
            { id: 'id-for-delta', name: 'Delta' },
            { id: 'id-for-charlie', name: 'Charlie' },
            { id: 'id-for-bravo', name: 'Bravo' },
            { id: 'id-for-alpha', name: 'Alpha' },
          ],
        },
      },
    },
  };

  const mockStore = configureStore([thunk]);
  let store = mockStore(storeFixture);

  it('Should fire the onChange handler with all of the selected tags', async () => {
    mockLocalStorage({
      'activePatientFilters/abcd-1234/4b68d': JSON.stringify({
        timeCGMUsePercent: null,
        lastData: null,
        lastDataType: null,
        timeInRange: [],
        meetsGlycemicTargets: true,
        patientTags: ['id-for-alpha', 'id-for-charlie'],
      }),
    });

    const testProps = {
      currentTagIds: ['id-for-delta'], // Patient currently has Delta tag
      onChange: jest.fn(),
    };

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/clinic-workspace']}>
          <Switch>
            <Route path='/clinic-workspace'>
              <SelectTags {...testProps} />
            </Route>
          </Switch>
        </MemoryRouter>
      </Provider>
    );

    // Current tags of patient should be shown
    expect(screen.getByText('Delta')).toBeInTheDocument();

    // Tag options should not be shown
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.queryByText('Bravo')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();

    // Open the dropdown to see the suggested tags
    const selectInput = screen.getByRole('combobox');
    await userEvent.click(selectInput);

    // Tags options are now visible
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Bravo')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Delta')).toBeInTheDocument();


    // Suggested tags should be shown before non-suggesteds. Suggested tags are the ones in active filters.
    // Order should be Alpha, Charlie, Bravo
    const suggestedHeader = screen.getByText('Suggested - based on current dashboard filters');
    const tagAlpha = screen.getByText('Alpha');
    const tagBravo = screen.getByText('Bravo');
    const tagCharlie = screen.getByText('Charlie');

    expect(suggestedHeader.compareDocumentPosition(tagAlpha)).toEqual(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(tagAlpha.compareDocumentPosition(tagCharlie)).toEqual(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(tagCharlie.compareDocumentPosition(tagBravo)).toEqual(Node.DOCUMENT_POSITION_FOLLOWING);

    // Clicking on a Tag fires the onChange handler with the clicked tag
    await userEvent.click(screen.getByText('Bravo'));
    expect(testProps.onChange).toHaveBeenCalledWith([
      'id-for-delta', // Patient's current tags
      'id-for-bravo', // New tag that has been selected
    ]);
  });
});
