/* global sinon */
/* global describe */
/* global it */
/* global expect */
/* global beforeEach */
/* global afterEach */
/* global jest */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

import SmartOnFhir from '@app/pages/smartonfhir/smartonfhir';

const mockStore = configureStore([thunk]);

describe('SmartOnFhir', () => {
  let store;
  let mockSessionStorage;
  let mockApi;
  let mockTrackMetric;

  beforeEach(() => {
    mockSessionStorage = {
      getItem: jest.fn().mockReturnValue('correlation-123'),
      setItem: jest.fn(),
    };

    mockApi = {
      clinics: {
        getClinicsForClinician: jest.fn().mockImplementation((clinicianId, options, callback) => {
          callback(null, [{ clinic: { id: 'clinic1' } }]);
        }),
        getEHRSettings: jest.fn().mockImplementation((clinicId, callback) => {
          callback(null, {});
        }),
        getMRNSettings: jest.fn().mockImplementation((clinicId, callback) => {
          callback(null, {});
        }),
      },
      patient: {
        getAll: jest.fn().mockImplementation((params, callback) => {
          callback(null, [{ patient: { id: 'user1' }, clinic: { id: 'clinic1' } }]);
        }),
      },
    };

    mockTrackMetric = jest.fn();

    store = mockStore({
      blip: {
        smartOnFhirData: {
          patients: {
            'correlation-123': {
              mrn: '12345',
              dob: '1990-01-01',
            },
          },
        },
        smartCorrelationId: null,
        loggedInUserId: 'clinician-123',
        working: {
          fetchingPatients: {
            inProgress: false,
            notification: null
          },
        },
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    store.clearActions();
  });

  it('should render loading message initially', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Loading patient data...')).toBeInTheDocument();
  });

  it('should track "Direct Connect Patient Lookup Success" when patient is found successfully', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(mockTrackMetric).toHaveBeenCalledWith('Direct Connect Patient Lookup Success');
    });
  });

  it('should dispatch fetchPatients action with MRN and DOB from Smart on FHIR data', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(mockApi.patient.getAll).toHaveBeenCalledWith(
        { mrn: '12345', birthDate: '1990-01-01' },
        expect.any(Function)
      );
    });
  });

  it('should dispatch push action to navigate when patient is found', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      const actions = store.getActions();
      const pushAction = actions.find(action =>
        action.type === '@@router/CALL_HISTORY_METHOD' &&
        action.payload.method === 'push'
      );
      expect(pushAction).toBeDefined();
    });

    const actions = store.getActions();
    const pushAction = actions.find(action =>
      action.type === '@@router/CALL_HISTORY_METHOD' &&
      action.payload.method === 'push'
    );
    expect(pushAction.payload.args[0]).toBe('/patients/user1/data');
  });

  it('should dispatch setSmartCorrelationId action with ID from sessionStorage', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      const actions = store.getActions();
      const setCorrelationIdAction = actions.find(action =>
        action.type === 'SET_SMART_CORRELATION_ID'
      );
      expect(setCorrelationIdAction).toBeDefined();
    });

    const actions = store.getActions();
    const setCorrelationIdAction = actions.find(action =>
      action.type === 'SET_SMART_CORRELATION_ID'
    );
    expect(setCorrelationIdAction.payload.correlationId).toBe('correlation-123');
  });

  it('should show error when correlation ID is missing', async () => {
    mockSessionStorage.getItem.mockReturnValue(null);

    const errorStore = mockStore({
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

    render(
      <Provider store={errorStore}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Missing correlation ID.')).toBeInTheDocument();
    });
  });

  it('should show error when patient information is not found', async () => {
    const errorStore = mockStore({
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

    render(
      <Provider store={errorStore}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Patient information not found in token.')).toBeInTheDocument();
    });
  });

  it('should show error when MRN is missing', async () => {
    const errorStore = mockStore({
      blip: {
        smartOnFhirData: {
          patients: {
            'correlation-123': {
              dob: '1990-01-01',
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

    render(
      <Provider store={errorStore}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: MRN not found in patient information.')).toBeInTheDocument();
    });
  });

  it('should show error when DOB is missing', async () => {
    const errorStore = mockStore({
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

    render(
      <Provider store={errorStore}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Date of birth information not found in patient data.')).toBeInTheDocument();
    });
  });

  it('should use correlation ID from Redux when available', async () => {
    const newStore = mockStore({
      blip: {
        smartOnFhirData: {
          patients: {
            'correlation-123': {
              mrn: '12345',
              dob: '1990-01-01',
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

    mockSessionStorage.getItem.mockClear();

    render(
      <Provider store={newStore}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(mockSessionStorage.getItem).not.toHaveBeenCalled();
    });

    const actions = newStore.getActions();
    const fetchPatientsAction = actions.find(action =>
      action.type === 'FETCH_PATIENTS_REQUEST'
    );
    expect(fetchPatientsAction).toBeDefined();
  });

  it('should hide Zendesk widget in Smart-on-FHIR mode', () => {
    // Setup mock Zendesk widget
    global.zE = jest.fn();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(global.zE).toHaveBeenCalledWith('webWidget', 'hide');

    // Cleanup
    delete global.zE;
  });

  it('should track "Direct Connect Patient Lookup Failure" when fetchPatients returns an error', async () => {
    mockApi.patient.getAll.mockImplementation((params, callback) => {
      callback(new Error('API Error'), null);
    });

    const errorStore = mockStore({
      blip: {
        smartOnFhirData: {
          patients: {
            'correlation-123': {
              mrn: '12345',
              dob: '1990-01-01',
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

    render(
      <Provider store={errorStore}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(mockTrackMetric).toHaveBeenCalledWith('Direct Connect Patient Lookup Failure');
    });
  });

  it('should track "Direct Connect Patient Not Found" when no patients are returned', async () => {
    mockApi.patient.getAll.mockImplementation((params, callback) => {
      callback(null, []);
    });

    const noPatientsStore = mockStore({
      blip: {
        smartOnFhirData: {
          patients: {
            'correlation-123': {
              mrn: '12345',
              dob: '1990-01-01',
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

    render(
      <Provider store={noPatientsStore}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(mockTrackMetric).toHaveBeenCalledWith('Direct Connect Patient Not Found');
    });
  });

  it('should track "Direct Connect Multiple Patients Found" when multiple patients are returned', async () => {
    mockApi.patient.getAll.mockImplementation((params, callback) => {
      callback(null, [
        { patient: { id: 'user1' }, clinic: { id: 'clinic1' } },
        { patient: { id: 'user2' }, clinic: { id: 'clinic2' } }
      ]);
    });

    const multiplePatientsStore = mockStore({
      blip: {
        smartOnFhirData: {
          patients: {
            'correlation-123': {
              mrn: '12345',
              dob: '1990-01-01',
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

    render(
      <Provider store={multiplePatientsStore}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(mockTrackMetric).toHaveBeenCalledWith('Direct Connect Multiple Patients Found');
    });
  });

  it('should track "Direct Connect Patient Lookup Failure" when patient data is invalid', async () => {
    mockApi.patient.getAll.mockImplementation((params, callback) => {
      callback(null, [{ patient: { id: null }, clinic: { id: 'clinic1' } }]);
    });

    const invalidPatientStore = mockStore({
      blip: {
        smartOnFhirData: {
          patients: {
            'correlation-123': {
              mrn: '12345',
              dob: '1990-01-01',
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

    render(
      <Provider store={invalidPatientStore}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(mockTrackMetric).toHaveBeenCalledWith('Direct Connect Patient Lookup Failure');
    });
  });

  it('should show NoClinicsError when clinician has no clinics', async () => {
    // Mock the getClinicsForClinician API to return empty array
    mockApi = {
      clinics: {
        getClinicsForClinician: jest.fn().mockImplementation((clinicianId, options, callback) => {
          callback(null, []);
        }),
      },
      patient: {
        getAll: jest.fn(),
      },
    };

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(mockTrackMetric).toHaveBeenCalledWith('Direct Connect Clinician No Clinics');
    });

    expect(screen.getByText('Account Set Up Required')).toBeInTheDocument();
    expect(screen.getByText('You don\'t appear to have a Tidepool account yet.')).toBeInTheDocument();
  });

  it('should show NoClinicsError when getClinicsForClinician fails', async () => {
    // Mock the getClinicsForClinician API to return an error
    mockApi = {
      clinics: {
        getClinicsForClinician: jest.fn().mockImplementation((clinicianId, options, callback) => {
          callback(new Error('API Error'), null);
        }),
      },
      patient: {
        getAll: jest.fn(),
      },
    };

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(mockTrackMetric).toHaveBeenCalledWith('Direct Connect Clinics Fetch Failure');
    });

    expect(screen.getByText('Account Set Up Required')).toBeInTheDocument();
    expect(screen.getByText('You don\'t appear to have a Tidepool account yet.')).toBeInTheDocument();
  });

  it('should proceed with patient lookup when clinician has clinics', async () => {
    // Mock the getClinicsForClinician API to return clinics
    mockApi = {
      clinics: {
        getClinicsForClinician: jest.fn().mockImplementation((clinicianId, options, callback) => {
          callback(null, [{ clinic: { id: 'clinic1' } }]);
        }),
        getEHRSettings: jest.fn().mockImplementation((clinicId, callback) => {
          callback(null, {});
        }),
        getMRNSettings: jest.fn().mockImplementation((clinicId, callback) => {
          callback(null, {});
        }),
      },
      patient: {
        getAll: jest.fn().mockImplementation((params, callback) => {
          callback(null, [{ patient: { id: 'user1' }, clinic: { id: 'clinic1' } }]);
        }),
      },
    };

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={{ sessionStorage: mockSessionStorage }}
            trackMetric={mockTrackMetric}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(mockTrackMetric).toHaveBeenCalledWith('Direct Connect Patient Lookup Success');
    });
  });
});
