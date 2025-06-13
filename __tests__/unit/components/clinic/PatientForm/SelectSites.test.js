/* global jest, beforeEach, afterEach, test, expect, describe, it */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import thunk from 'redux-thunk';
import mockLocalStorage from '../../../../utils/mockLocalStorage';

import SelectSites from '@app/components/clinic/PatientForm/SelectSites';

describe('SelectSites', ()  => {
  const storeFixture = {
    blip: {
      loggedInUserId: 'abcd-1234',
      membershipInOtherCareTeams: [],
      selectedClinicId: '4b68d',
      clinics: {
        '4b68d': {
          id: '4b68d',
          name: 'Test Clinic',
          patientTags: [],
          sites: [
            { id: 'id-for-golf', name: 'Site Golf' },
            { id: 'id-for-hotel', name: 'Site Hotel' },
            { id: 'id-for-echo', name: 'Site Echo' },
            { id: 'id-for-foxtrot', name: 'Site Foxtrot' },
          ],
        },
      },
    },
  };

  const mockStore = configureStore([thunk]);
  let store = mockStore(storeFixture);

  it('Should fire the onChange handler with all of the selected sites', async () => {
    mockLocalStorage({
      'activePatientFilters/abcd-1234/4b68d': JSON.stringify({
        timeCGMUsePercent: null,
        lastData: null,
        lastDataType: null,
        timeInRange: [],
        meetsGlycemicTargets: true,
        patientTags: [],
        clinicSites: ['id-for-echo', 'id-for-golf'],
      }),
    });

    const testProps = {
      currentSites: [{ id: 'id-for-hotel', name: 'Site Hotel' }], // Patient is in Site Hotel
      onChange: jest.fn(),
    };

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/clinic-workspace']}>
          <Switch>
            <Route path='/clinic-workspace'>
              <SelectSites {...testProps} />
            </Route>
          </Switch>
        </MemoryRouter>
      </Provider>
    );

    // Current tags of patient should be shown, Tag options in dropdown should be hidden
    expect(screen.getByText('Site Hotel')).toBeInTheDocument();

    expect(screen.queryByText('Site Echo')).not.toBeInTheDocument();
    expect(screen.queryByText('Site Foxtrot')).not.toBeInTheDocument();
    expect(screen.queryByText('Site Golf')).not.toBeInTheDocument();

    // Open the dropdown to see the suggested tags
    const selectInput = screen.getByRole('combobox');
    await userEvent.click(selectInput);

    // Tags options are now visible
    expect(screen.getByText('Site Echo')).toBeInTheDocument();
    expect(screen.getByText('Site Foxtrot')).toBeInTheDocument();
    expect(screen.getByText('Site Golf')).toBeInTheDocument();
    expect(screen.getByText('Site Hotel')).toBeInTheDocument();

    // Suggested tags should be shown before non-suggesteds. Suggested tags are the ones in active filters.
    // Order should be Echo, Golf, Foxtrot
    const suggestedHeader = screen.getByText('Suggested - based on current dashboard filters');
    const tagEcho = screen.getByText('Site Echo');
    const tagFoxtrot = screen.getByText('Site Foxtrot');
    const tagGolf = screen.getByText('Site Golf');

    expect(suggestedHeader.compareDocumentPosition(tagEcho)).toEqual(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(tagEcho.compareDocumentPosition(tagGolf)).toEqual(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(tagGolf.compareDocumentPosition(tagFoxtrot)).toEqual(Node.DOCUMENT_POSITION_FOLLOWING);

    // Clicking on a Tag fires the onChange handler with the clicked tag
    await userEvent.click(screen.getByText('Site Foxtrot'));
    expect(testProps.onChange).toHaveBeenCalledWith([
      { id: 'id-for-hotel', name: 'Site Hotel' }, // Patient's current tags
      { id: 'id-for-foxtrot', name: 'Site Foxtrot' },, // New tag that has been selected
    ]);
  });
});
