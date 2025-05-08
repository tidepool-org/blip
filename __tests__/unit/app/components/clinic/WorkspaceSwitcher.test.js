/* global jest, it, test, expect, describe */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Switch, Route } from 'react-router-dom'; // for useParams
import configureStore from 'redux-mock-store'; // for mockStore
import thunk from 'redux-thunk';

import api from '../../../../../app/core/api';
import * as actions from '../../../../../app/redux/actions';

// Mock the actions
jest.mock('../../../../../app/redux/actions', () => ({
  sync: {
    setPatientListSearchTextInput: jest.fn(),
    setIsPatientListVisible: jest.fn(),
  },
  async: {
    selectClinic: jest.fn(),
  },
}));

import WorkspaceSwitcher from '../../../../../app/components/clinic/WorkspaceSwitcher';
import { Provider } from 'react-redux';

describe('WorkspaceSwitcher', ()  => {
  actions.sync.setPatientListSearchTextInput.mockReturnValue({ type: 'MOCK_ACTION' });
  actions.sync.setIsPatientListVisible.mockReturnValue({ type: 'MOCK_ACTION' });
  actions.async.selectClinic.mockReturnValue({ type: 'MOCK_ACTION' });

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

  it('Allows switching of workspace', async () => {
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
    expect(dropdownButton).toHaveTextContent('Second Clinic Workspace');

    // Open the dropdown
    await userEvent.click(dropdownButton);
    const firstClinicButton = screen.getByRole('button', { name: 'First Clinic Workspace' });

    // Select a different workspace option
    await userEvent.click(firstClinicButton);

    // It resets the filter status
    expect(actions.sync.setPatientListSearchTextInput).toHaveBeenCalledWith('');
    expect(actions.sync.setIsPatientListVisible).toHaveBeenCalledWith(false);

    // It calls the API to fetch data for the new clinic
    expect(actions.async.selectClinic).toHaveBeenCalledWith(api, '521cf');

    // Trackmetric is called with the correct arguments
    expect(trackMetric).toHaveBeenCalledWith(
      'Clinic - Workspace Switcher - Go to clinic workspace',
      { clinicId: '521cf' }
    );
  });
});

