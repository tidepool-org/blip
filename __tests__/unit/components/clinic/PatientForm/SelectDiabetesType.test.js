/* global jest, beforeEach, afterEach, test, expect, describe, it */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import thunk from 'redux-thunk';
import mockLocalStorage from '../../../../utils/mockLocalStorage';

import SelectDiabetesType from '@app/components/clinic/PatientForm/SelectDiabetesType';

describe('SelectDiabetesType', ()  => {
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
          patientTags: [],
        },
      },
    },
  };

  const mockStore = configureStore([thunk]);
  let store = mockStore(storeFixture);

  it('Should fire the onChange handler with the selected diabetes type', async () => {
    mockLocalStorage({
      'activePatientFilters/abcd-1234/4b68d': JSON.stringify({
        timeCGMUsePercent: null,
        lastData: null,
        lastDataType: null,
        timeInRange: [],
        meetsGlycemicTargets: true,
        patientTags: [],
        sites: [],
      }),
    });

    const testProps = {
      value: 'type3c',
      onChange: jest.fn(),
    };

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/clinic-workspace']}>
          <Switch>
            <Route path='/clinic-workspace'>
              <SelectDiabetesType {...testProps} />
            </Route>
          </Switch>
        </MemoryRouter>
      </Provider>
    );

    // Current diabetes type of patient should be shown; options in dropdown should be hidden
    expect(screen.getByText('Type 3c')).toBeInTheDocument();

    expect(screen.queryByText('Type 1')).not.toBeInTheDocument();
    expect(screen.queryByText('MODY/Monogenic')).not.toBeInTheDocument();

    // Open the dropdown. Options are now visible
    await userEvent.click(screen.getByRole('combobox'));

    expect(screen.getByText('Type 1')).toBeInTheDocument();
    expect(screen.getByText('MODY/Monogenic')).toBeInTheDocument();

    // Clicking an option fires the onChange handler with the clicked option's value
    await userEvent.click(screen.getByText('Gestational'));
    expect(testProps.onChange).toHaveBeenCalledWith('gestational');
  });
});
