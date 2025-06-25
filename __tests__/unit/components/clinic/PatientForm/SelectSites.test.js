/* global jest, beforeEach, afterEach, test, expect, describe, it */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import thunk from 'redux-thunk';
import mockLocalStorage from '../../../../utils/mockLocalStorage';

import SelectSites, { buildSelectOptions } from '@app/components/clinic/PatientForm/SelectSites';

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

    // Current sites of patient should be shown, Site options in dropdown should be hidden
    expect(screen.getByText('Site Hotel')).toBeInTheDocument();

    expect(screen.queryByText('Site Echo')).not.toBeInTheDocument();
    expect(screen.queryByText('Site Foxtrot')).not.toBeInTheDocument();
    expect(screen.queryByText('Site Golf')).not.toBeInTheDocument();

    // Open the dropdown to see the suggested sites
    const selectInput = screen.getByRole('combobox');
    await userEvent.click(selectInput);

    // Sites options are now visible
    expect(screen.getByText('Site Echo')).toBeInTheDocument();
    expect(screen.getByText('Site Foxtrot')).toBeInTheDocument();
    expect(screen.getByText('Site Golf')).toBeInTheDocument();
    expect(screen.getByText('Site Hotel')).toBeInTheDocument();

    // Suggested sites should be shown before non-suggesteds. Suggested sites are the ones in active filters.
    // Order should be Echo, Golf, Foxtrot
    const suggestedHeader = screen.getByText('Suggested - based on current dashboard filters');
    const siteEcho = screen.getByText('Site Echo');
    const siteFoxtrot = screen.getByText('Site Foxtrot');
    const siteGolf = screen.getByText('Site Golf');

    expect(suggestedHeader.compareDocumentPosition(siteEcho)).toEqual(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(siteEcho.compareDocumentPosition(siteGolf)).toEqual(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(siteGolf.compareDocumentPosition(siteFoxtrot)).toEqual(Node.DOCUMENT_POSITION_FOLLOWING);

    // Clicking on a Site fires the onChange handler with the clicked site
    await userEvent.click(screen.getByText('Site Foxtrot'));
    expect(testProps.onChange).toHaveBeenCalledWith([
      { id: 'id-for-hotel', name: 'Site Hotel' }, // Patient's current sites
      { id: 'id-for-foxtrot', name: 'Site Foxtrot' },, // New site that has been selected
    ]);
  });

  describe('buildSelectOptions', ()  => {
    const tMock = jest.fn().mockImplementation(string => string);

    const clinicSitesMock = [
      { name: 'Hotel', id: 'id-for-hotel' },
      { name: 'Golf', id: 'id-for-golf' },
      { name: 'Foxtrot', id: 'id-for-foxtrot' },
      { name: 'Echo', id: 'id-for-echo' },
    ];

    const activeFiltersMock = {
      clinicSites: ['id-for-golf', 'id-for-echo'], // should suggest based on these
    };

    describe('When sites are suggested', () => {
      it('Should output arrays of suggested and non-suggested groups sorted alphabetically', () => {
        const result = buildSelectOptions(tMock, clinicSitesMock, activeFiltersMock, true);

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

    describe('When sites are not suggested', () => {
      it('Should output a singly array sorted alphabetically', () => {
        const result = buildSelectOptions(tMock, clinicSitesMock, activeFiltersMock, false);

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
