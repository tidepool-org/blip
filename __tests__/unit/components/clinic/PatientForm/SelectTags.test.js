/* global jest, beforeEach, afterEach, test, expect, describe, it */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import thunk from 'redux-thunk';
import mockLocalStorage from '../../../../utils/mockLocalStorage';

import SelectTags, { buildSelectOptions } from '@app/components/clinic/PatientForm/SelectTags';

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
          clinicSites: [],
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
        sites: [],
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

    // Current tags of patient should be shown, Tag options in dropdown should be hidden
    expect(screen.getByText('Delta')).toBeInTheDocument();

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

  describe('buildSelectOptions', ()  => {
    const tMock = jest.fn().mockImplementation(string => string);

    const clinicTagsMock = [
      { name: 'Hotel', id: 'id-for-hotel' },
      { name: 'Golf', id: 'id-for-golf' },
      { name: 'Foxtrot', id: 'id-for-foxtrot' },
      { name: 'Echo', id: 'id-for-echo' },
    ];

    const activeFiltersMock = {
      patientTags: ['id-for-golf', 'id-for-echo'], // should suggest based on these
    };

    describe('When tags are suggested', () => {
      it('Should output arrays of suggested and non-suggested groups sorted alphabetically', () => {
        const result = buildSelectOptions(tMock, clinicTagsMock, activeFiltersMock, true);

        const expected = [
          {
            label: 'Suggested - based on current dashboard filters',
            options: [
              { label: 'Echo', value: 'id-for-echo' },
              { label: 'Golf', value: 'id-for-golf' },
            ],
          },
          { label: '',
            options: [
              { label: 'Foxtrot', value: 'id-for-foxtrot' },
              { label: 'Hotel', value: 'id-for-hotel' },
            ],
          },
        ];

        expect(result).toStrictEqual(expected);
      });
    });

    describe('When tags are not suggested', () => {
      it('Should output a singly array sorted alphabetically', () => {
        const result = buildSelectOptions(tMock, clinicTagsMock, activeFiltersMock, false);

        const expected = [
          {
            label: '',
            options: [
              { label: 'Echo', value: 'id-for-echo' },
              { label: 'Foxtrot', value: 'id-for-foxtrot' },
              { label: 'Golf', value: 'id-for-golf' },
              { label: 'Hotel', value: 'id-for-hotel' },
            ],
          },
        ];

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
