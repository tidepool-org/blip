/* global jest, test, expect, describe */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Switch, Route } from 'react-router-dom'; // for useParams
import configureStore from 'redux-mock-store'; // for mockStore
import thunk from 'redux-thunk';

import api from '../../../../../app/core/api';

// Mock the actions
jest.mock('../../../../../app/redux/actions', () => ({
  sync: {
    setPatientListSearchTextInput: jest.fn().mockReturnValue({ type: 'MOCK_ACTION' }),
    setIsPatientListVisible: jest.fn().mockReturnValue({ type: 'MOCK_ACTION' }),
  },
  async: {
    selectClinic: jest.fn().mockReturnValue({ type: 'MOCK_ACTION' }),
  },
}));

import WorkspaceSwitcher from '../../../../../app/components/clinic/WorkspaceSwitcher';
import { Provider } from 'react-redux';

describe('WorkspaceSwitcher', ()  => {
  const mockUserId = '51263e09-799c-4be8-b03e-16c79dee76c7';
  const storeFixture = {
    blip: {
      loggedInUserId: mockUserId,
      membershipInOtherCareTeams: [],
      selectedClinicId: '4b68d', // Second Clinic
      clinics: {
        '521cf': {
          'id': '521cf',
          'name': 'First Clinic',
          'clinicians': {
            [mockUserId]: { 'id': mockUserId, 'name': 'Henry Liang' },
          },
        },
        '4b68d': {
          'id': '4b68d',
          'name': 'Second Clinic',
          'clinicians': {
            [mockUserId]: { 'id': mockUserId, 'name': 'Henry Liang' },
          },
        },
      },
    },
  };

  const mockStore = configureStore([thunk]);
  let store = mockStore(storeFixture);

  const trackMetric = jest.fn();

  test('Displays the name of the selected clinic', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <Switch>
            <Route path='/'>
              <WorkspaceSwitcher trackMetric={trackMetric} api={api} />
            </Route>
          </Switch>
        </MemoryRouter>
      </Provider>
    );

    // Workspace switcher should be labelled with currently selected clinic name
    const dropdownButton = screen.getByRole('button', { id: 'workspace-switcher-button' });
    expect(dropdownButton.textContent).toBe('Second Clinic Workspace');

    // Open the dropdown
    fireEvent.click(dropdownButton);
    const firstClinicButton = screen.getByText('First Clinic Workspace').closest('button');

    // Select a different workspace option
    fireEvent.click(firstClinicButton);

    // Trackmetric is called with the correct arguments
    expect(trackMetric).toHaveBeenCalledWith(
      'Clinic - Workspace Switcher - Go to clinic workspace',
      { clinicId: '521cf' }
    );
  });
});

