import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import baseTheme from '../app/themes/baseTheme';
import { SmartOnFhir } from '../app/pages/smartonfhir/smartonfhir';
import MultiplePatientError from '../app/pages/smartonfhir/MultiplePatientError';

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

export const ErrorFetchingPatient = {
  render: () => {
    const store = mockStore({
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
      },
    });

    return (
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            fetchPatients={(api, params, callback) => {
              callback(new Error('API error'), null);
            }}
            push={() => {}}
            smartOnFhirData={{
              patients: {
                'correlation-123': {
                  mrn: '12345',
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
  name: 'Error - Fetching Patient',
};

export const ErrorNoPatientsFound = {
  render: () => {
    const store = mockStore({
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
      },
    });

    return (
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            fetchPatients={(api, params, callback) => {
              callback(null, []);
            }}
            push={() => {}}
            smartOnFhirData={{
              patients: {
                'correlation-123': {
                  mrn: '12345',
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
  name: 'Error - No Patients Found',
};

export const ErrorMultiplePatientsFound = {
  render: () => {
    const store = mockStore({
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
      },
    });

    return (
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            fetchPatients={(api, params, callback) => {
              callback(null, [{}, {}]);
            }}
            push={() => {}}
            smartOnFhirData={{
              patients: {
                'correlation-123': {
                  mrn: '12345',
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

export const RetrieveFromSessionStorage = {
  render: () => {
    const setSmartCorrelationIdStub = () => console.log('setSmartCorrelationId called');

    const store = mockStore({
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
          },
        },
      },
    });

    return (
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir
            api={mockApi}
            fetchPatients={(api, params, callback) => {
              callback(null, [{ patient: { id: 'user1' } }]);
            }}
            push={() => {}}
            smartOnFhirData={{
              patients: {
                'correlation-123': {
                  mrn: '12345',
                },
              },
            }}
            smartCorrelationId={null}
            setSmartCorrelationId={setSmartCorrelationIdStub}
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
  name: 'Retrieve From SessionStorage',
};

export const MultiplePatientErrorComponent = {
  render: () => (
    <MultiplePatientError onClose={() => {}} />
  ),
  name: 'Multiple Patient Error Component',
};
