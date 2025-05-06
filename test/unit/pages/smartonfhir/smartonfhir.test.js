/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */
/* global expect */

import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import SmartOnFhir from '../../../../app/pages/smartonfhir/smartonfhir';

const mockStore = configureStore([thunk]);

describe('SmartOnFhir', () => {
  let wrapper;
  let store;
  let mockSessionStorage;
  let mockApi;

  beforeEach(() => {
    mockSessionStorage = {
      getItem: sinon.stub().returns('correlation-123'),
      setItem: sinon.stub(),
    };

    mockApi = {
      patient: {
        getAll: sinon.stub().callsArgWith(1, null, [{ patient: { id: 'user1' }, clinic: { id: 'clinic1' } }]),
      },
    };

    store = mockStore({
      blip: {
        smartOnFhirData: {
          patients: {
            'correlation-123': {
              mrn: '12345',
            },
          },
        },
        smartCorrelationId: null,
        working: {
          fetchingPatients: {
            inProgress: false,
            notification: null
          },
        },
      }
    });

    store.dispatch = sinon.spy(store.dispatch);

    wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
          />
        </MemoryRouter>
      </Provider>
    );
  });

  afterEach(() => {
    mockSessionStorage.getItem.reset();
    mockSessionStorage.setItem.reset();
    store.clearActions();
  });

  it('should render loading message initially', () => {
    expect(wrapper.text()).to.include('Loading patient data');
  });

  it('should dispatch fetchPatients action with MRN from Smart on FHIR data', () => {
    const actions = store.getActions();
    const fetchPatientsAction = actions.find(action =>
      action.type === 'FETCH_PATIENTS_REQUEST'
    );

    expect(fetchPatientsAction).to.exist;
  });

  it('should dispatch push action to navigate when patient is found', () => {
    const actions = store.getActions();
    const pushAction = actions.find(action =>
      action.type === '@@router/CALL_HISTORY_METHOD' &&
      action.payload.method === 'push'
    );

    expect(pushAction).to.exist;
    expect(pushAction.payload.args[0]).to.equal('/patients/user1/data');
  });

  it('should dispatch setSmartCorrelationId action with ID from sessionStorage', () => {
    const actions = store.getActions();
    const setCorrelationIdAction = actions.find(action =>
      action.type === 'SET_SMART_CORRELATION_ID'
    );

    expect(setCorrelationIdAction).to.exist;
    expect(setCorrelationIdAction.payload.correlationId).to.equal('correlation-123');
  });

  it('should show error when correlation ID is missing', () => {
    mockSessionStorage.getItem.reset();
    mockSessionStorage.getItem.returns(null);

    const newStore = mockStore({
      blip: {
        smartOnFhirData: {
          patients: {},
        },
        smartCorrelationId: null,
        working: {
          fetchingPatients: {
            inProgress: false,
          },
        },
      }
    });

    const newWrapper = mount(
      <Provider store={newStore}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(newWrapper.text()).to.include('Missing correlation ID');
  });

  it('should show error when patient information is not found', () => {
    const newStore = mockStore({
      blip: {
        smartOnFhirData: {
          patients: {},
        },
        smartCorrelationId: 'correlation-123',
        working: {
          fetchingPatients: {
            inProgress: false,
          },
        },
      }
    });

    const newWrapper = mount(
      <Provider store={newStore}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(newWrapper.text()).to.include('Patient information not found');
  });

  it('should show error when MRN is missing', () => {
    const newStore = mockStore({
      blip: {
        smartOnFhirData: {
          patients: {
            'correlation-123': {

            },
          },
        },
        smartCorrelationId: 'correlation-123',
        working: {
          fetchingPatients: {
            inProgress: false,
          },
        },
      }
    });

    const newWrapper = mount(
      <Provider store={newStore}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(newWrapper.text()).to.include('MRN not found');
  });

  it('should use correlation ID from Redux when available', () => {
    const newStore = mockStore({
      blip: {
        smartOnFhirData: {
          patients: {
            'correlation-123': {
              mrn: '12345',
            },
          },
        },
        smartCorrelationId: 'correlation-123',
        working: {
          fetchingPatients: {
            inProgress: false,
          },
        },
      }
    });

    mockSessionStorage.getItem.reset();

    const newWrapper = mount(
      <Provider store={newStore}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(mockSessionStorage.getItem.callCount).to.equal(0);

    const actions = newStore.getActions();
    const fetchPatientsAction = actions.find(action =>
      action.type === 'FETCH_PATIENTS_REQUEST'
    );
    expect(fetchPatientsAction).to.exist;
  });
});
