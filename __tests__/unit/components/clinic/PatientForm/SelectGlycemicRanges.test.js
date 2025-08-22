/* global jest, beforeEach, afterEach, test, expect, describe, it */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import thunk from 'redux-thunk';
import mockLocalStorage from '../../../../utils/mockLocalStorage';

import { utils as vizUtils } from '@tidepool/viz';
const { GLYCEMIC_RANGE } = vizUtils.constants;

import SelectGlycemicRanges from '@app/components/clinic/PatientForm/SelectGlycemicRanges';

describe('SelectGlycemicRanges', ()  => {
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
      value: GLYCEMIC_RANGE.ADA_STANDARD,
      onChange: jest.fn(),
    };

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/clinic-workspace']}>
          <Switch>
            <Route path='/clinic-workspace'>
              <SelectGlycemicRanges {...testProps} />
            </Route>
          </Switch>
        </MemoryRouter>
      </Provider>
    );

    // Selected glycemic ranges should be in the combobox
    expect(screen.getByText('Standard (Type 1 and 2): 70-180 mg/dL')).toBeInTheDocument();

    expect(screen.queryByText('Older/High Risk (Type 1 and 2): 70-180 mg/dL')).not.toBeInTheDocument();
    expect(screen.queryByText('Pregnancy (Type 1): 63-140 mg/dL')).not.toBeInTheDocument();
    expect(screen.queryByText('Pregnancy (Gestational and Type 2): 63-140 mg/dL')).not.toBeInTheDocument();

    // Open the dropdown. Options are now visible
    await userEvent.click(screen.getByRole('combobox'));

    expect(screen.getByText('Older/High Risk (Type 1 and 2): 70-180 mg/dL')).toBeInTheDocument();
    expect(screen.getByText('Pregnancy (Type 1): 63-140 mg/dL')).toBeInTheDocument();
    expect(screen.getByText('Pregnancy (Gestational and Type 2): 63-140 mg/dL')).toBeInTheDocument();

    // Clicking an option fires the onChange handler with the clicked option's value
    await userEvent.click(screen.getByText('Pregnancy (Type 1): 63-140 mg/dL'));
    expect(testProps.onChange).toHaveBeenCalledWith(GLYCEMIC_RANGE.ADA_PREGNANCY_T1);
  });
});
