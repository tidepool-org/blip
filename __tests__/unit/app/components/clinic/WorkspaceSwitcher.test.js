/* global expect, after, before, chai, describe, it, sinon, beforeEach, context */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Switch, Route } from 'react-router-dom'; // for useParams
import configureStore from 'redux-mock-store'; // for mockStore
import thunk from 'redux-thunk';

import api from '../../../../../app/core/api';
import * as actions from '../../../../../app/redux/actions';

const expect = chai.expect;

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

  const trackMetric = sinon.stub();

  sinon.stub(actions.sync, 'setPatientListSearchTextInput').returns({ type: 'MOCK_ACTION' });
  sinon.stub(actions.sync, 'setIsPatientListVisible').returns({ type: 'MOCK_ACTION' });
  sinon.stub(actions.async, 'selectClinic').returns({ type: 'MOCK_ACTION' });

  it('Displays the name ofthe selected clinic', async () => {
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
    expect(dropdownButton.textContent).to.equal('Second Clinic Workspace');

    // Open the dropdown
    fireEvent.click(dropdownButton);
    await screen.getByText('First Clinic Workspace').closest('button');

    // Select a different workspace option
    const targetButton = screen.getByText('First Clinic Workspace').closest('button');
    fireEvent.click(targetButton);

    // Trackmetric is called with the correct arguments
    expect(trackMetric.getCall(0).args).to.eql(
      ['Clinic - Workspace Switcher - Go to clinic workspace', { clinicId: '521cf' }]
    );
  });
});

