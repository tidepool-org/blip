import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import baseTheme from '../app/themes/baseTheme';
import { SmartOnFhir } from '../app/pages/smartonfhir/smartonfhir';
import MultiplePatientError from '../app/pages/smartonfhir/MultiplePatientError';
import NoPatientMatch from '../app/pages/smartonfhir/NoPatientMatch';

const mockStore = configureStore([thunk]);

const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

const mockApi = {
  patient: {
    getAll: () => {},
  },
};

const mockWindow = {
  sessionStorage: {
    getItem: () => 'correlation-123',
    setItem: () => {},
  },
};

export default {
  title: 'Pages/SmartOnFhir',
  component: SmartOnFhir,
  decorators: [withTheme],
  parameters: {
    layout: 'fullscreen',
  },
};

export const Loading = {
  render: () => {
    const store = mockStore({
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
            inProgress: true,
          },
        },
      },
    });

    return (
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            fetchPatients={() => {}}
            push={() => {}}
            smartOnFhirData={{
              patients: {
                'correlation-123': {
                  mrn: '12345',
                  dob: '1990-01-01',
                },
              },
            }}
            smartCorrelationId="correlation-123"
            setSmartCorrelationId={() => {}}
            working={{
              fetchingPatients: {
                inProgress: true,
              },
            }}
            window={mockWindow}
          />
        </MemoryRouter>
      </Provider>
    );
  },
  name: 'Loading State',
};

export const Initializing = {
  render: () => {
    const store = mockStore({
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
      },
    });

    return (
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            fetchPatients={() => {}}
            push={() => {}}
            smartOnFhirData={{
              patients: {
                'correlation-123': {
                  mrn: '12345',
                  dob: '1990-01-01',
                },
              },
            }}
            smartCorrelationId="correlation-123"
            setSmartCorrelationId={() => {}}
            working={{
              fetchingPatients: {
                inProgress: false,
              },
            }}
            window={mockWindow}
          />
        </MemoryRouter>
      </Provider>
    );
  },
  name: 'Initializing State',
};

export const ErrorMissingCorrelationId = {
  render: () => {
    const store = mockStore({
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
      },
    });

    const mockWindowWithoutCorrelationId = {
      sessionStorage: {
        getItem: () => null,
        setItem: () => {},
      },
    };

    return (
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            fetchPatients={() => {}}
            push={() => {}}
            smartOnFhirData={{
              patients: {},
            }}
            smartCorrelationId={null}
            setSmartCorrelationId={() => {}}
            working={{
              fetchingPatients: {
                inProgress: false,
              },
            }}
            window={mockWindowWithoutCorrelationId}
          />
        </MemoryRouter>
      </Provider>
    );
  },
  name: 'Error - Missing Correlation ID',
};

export const ErrorPatientInfoNotFound = {
  render: () => {
    const store = mockStore({
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
      },
    });

    return (
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            fetchPatients={() => {}}
            push={() => {}}
            smartOnFhirData={{
              patients: {},
            }}
            smartCorrelationId="correlation-123"
            setSmartCorrelationId={() => {}}
            working={{
              fetchingPatients: {
                inProgress: false,
              },
            }}
            window={mockWindow}
          />
        </MemoryRouter>
      </Provider>
    );
  },
  name: 'Error - Patient Information Not Found',
};

export const ErrorMRNNotFound = {
  render: () => {
    const store = mockStore({
      blip: {
        smartOnFhirData: {
          patients: {
            'correlation-123': {
              // No MRN
            },
          },
        },
        smartCorrelationId: 'correlation-123',
        working: {
          fetchingPatients: {
            inProgress: false,
          },
        },
      },
    });

    return (
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            fetchPatients={() => {}}
            push={() => {}}
            smartOnFhirData={{
              patients: {
                'correlation-123': {
                  // No MRN
                },
              },
            }}
            smartCorrelationId="correlation-123"
            setSmartCorrelationId={() => {}}
            working={{
              fetchingPatients: {
                inProgress: false,
              },
            }}
            window={mockWindow}
          />
        </MemoryRouter>
      </Provider>
    );
  },
  name: 'Error - MRN Not Found',
};

export const ErrorNoPatientsFound = {
  render: () => {
    // This story should display the NoPatientMatch component
    // because the fetchPatients callback returns an empty array,
    // which triggers the ERR_SMARTONFHIR_NO_PATIENTS_FOUND error

    // Create a mock api that simulates a patient not found situation
    const noPatientFoundMockApi = {
      patient: {
        getAll: (params, callback) => {
          // Return an empty array to simulate no patient found
          callback(null, []);
        },
      },
    };

    const store = mockStore({
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
      },
    });

    return (
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={noPatientFoundMockApi}
            fetchPatients={(api, params, callback) => {
              // This simulates the action creator, calling the API method
              api.patient.getAll(params, callback);
            }}
            window={mockWindow}
          />
        </MemoryRouter>
      </Provider>
    );
  },
  name: 'Error - No Patients Found',
};

export const ErrorMultiplePatientsFound = {
  render: () => {
    // Create a store with the necessary state for the multiple patients error scenario
    const store = mockStore({
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
      },
    });

    // Create a mock API that will return multiple patients to trigger the error
    const multiplePatientsMockApi = {
      patient: {
        getAll: (params, callback) => {
          // Return an array with multiple patient objects
          callback(null, [
            { patient: { id: 'patient1', name: 'Patient One' } },
            { patient: { id: 'patient2', name: 'Patient Two' } }
          ]);
        },
      },
    };

    return (
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={multiplePatientsMockApi}
            fetchPatients={(api, params, callback) => {
              // This simulates the action creator, calling the API method
              api.patient.getAll(params, callback);
            }}
            push={() => {}}
            smartOnFhirData={{
              patients: {
                'correlation-123': {
                  mrn: '12345',
                  dob: '1990-01-01',
                },
              },
            }}
            smartCorrelationId="correlation-123"
            setSmartCorrelationId={() => {}}
            working={{
              fetchingPatients: {
                inProgress: false,
              },
            }}
            window={mockWindow}
          />
        </MemoryRouter>
      </Provider>
    );
  },
  name: 'Error - Multiple Patients Found',
};

export const ErrorDOBNotFound = {
  render: () => {
    const store = mockStore({
      blip: {
        smartOnFhirData: {
          patients: {
            'correlation-123': {
              mrn: '12345',
              // No DOB
            },
          },
        },
        smartCorrelationId: 'correlation-123',
        working: {
          fetchingPatients: {
            inProgress: false,
          },
        },
      },
    });

    return (
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            window={mockWindow}
          />
        </MemoryRouter>
      </Provider>
    );
  },
  name: 'Error - DOB Not Found',
};

export const ErrorInvalidPatientData = {
  render: () => {
    const store = mockStore({
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
      },
    });

    // Create a mock API that returns patient data without proper ID
    const invalidPatientDataMockApi = {
      patient: {
        getAll: (params, callback) => {
          // Return a patient object without proper structure
          callback(null, [{ patient: null }]);
        },
      },
    };

    return (
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={invalidPatientDataMockApi}
            window={mockWindow}
          />
        </MemoryRouter>
      </Provider>
    );
  },
  name: 'Error - Invalid Patient Data',
};

export const MultiplePatientErrorComponent = {
  render: () => (
    <MultiplePatientError onClose={() => {}} />
  ),
  name: 'Multiple Patient Error Component',
};

export const NoPatientMatchComponent = {
  render: () => (
    <NoPatientMatch onClose={() => {}} />
  ),
  name: 'No Patient Match Component',
};
