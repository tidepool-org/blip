import React, { useContext } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux');
  return {
    ...actual,
    useDispatch: () => 'dispatchStub',
  };
});
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';

/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

import { AppBannerProvider, AppBannerContext } from '../../../../../app/providers/AppBanner/AppBannerProvider';

jest.mock('../../../../../app/components/datasources/DataConnections', () => ({
  providers: {
    provider1: {
      dataSourceFilter: {
        providerType: 'oauth',
        providerName: 'provider1',
      },
    },
  },
}));
import { ToastProvider } from '../../../../../app/providers/ToastProvider';
import { find, keys, pickBy } from 'lodash';
import { appBanners } from '../../../../../app/providers/AppBanner/appBanners';
import { DATA_DONATION_CONSENT_TYPE } from '../../../../../app/core/constants';

// Create a dummy child component that consumes the AppBannerContext
const DummyConsumer = () => {
  const context = useContext(AppBannerContext);
  return (
    <div data-testid="context">
      {JSON.stringify({
        banner: context.banner,
        processedBanner: context.processedBanners[context.banner?.id],
        processedBanners: context.processedBanners,
        hasBanner: context.banner !== null,
        keys: Object.keys(context),
      })}
    </div>
  );
};

describe('AppBannerProvider', () => {
  const mockStore = configureStore([]);
  const initialState = {
    blip: {
      selectedClinicId: 'clinic1',
      clinics: {
        clinic1: {
          name: 'Test Clinic',
          patients: {
            user1: {
              permissions: {},
              email: '',
            },
          },
          patientLimitEnforced: false,
          ui: {},
        },
      },
      loggedInUserId: 'user1',
      allUsersMap: {
        user1: {
          profile: { patient: {} },
          preferences: {},
        },
      },
      currentPatientInViewId: 'user1',
      data: {
        metaData: { size: 0, devices: [] },
      },
      dataSources: [],
      justConnectedDataSourceProviderName: null,
      consentRecords: {},
    },
  };

  let store, dispatchStub;

  const providersStub = {
    provider1: {
      dataSourceFilter: {
        providerType: 'oauth',
        providerName: 'provider1',
      },
    },
  };

  beforeEach(() => {
    dispatchStub = 'dispatchStub';

    
    store = mockStore(initialState);
  });

  afterEach(() => {
    
    
    jest.restoreAllMocks();
  });

  it('should render children', () => {
    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <div data-testid="child">Child Content</div>
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );
    expect(screen.queryByTestId('child')).toBeTruthy();
    expect(screen.queryByTestId('child')?.textContent).toEqual('Child Content');
  });

  it('should provide expected context keys', () => {
    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);
    expect(contextData.keys).toEqual(expect.arrayContaining([
      'banner',
      'bannerInteractedForPatient',
      'bannerShownForPatient',
      'processedBanners',
      'setBannerInteractedForPatient',
      'setBannerShownForPatient',
      'setFormikContext',
    ]));
    expect(contextData.hasBanner).toBe(false);
  });

  it('should update currentBanner when a matching banner is available', () => {
    const stateWithBanner = {
      blip: {
        selectedClinicId: 'clinic1',
        clinics: {
          clinic1: {
            name: 'Test Clinic',
            patients: {
              user1: {
                permissions: {},
                email: 'patient@example.com',
              },
            },
            patientLimitEnforced: false,
            ui: {},
          },
        },
        loggedInUserId: 'user1',
        allUsersMap: {
          user1: {
            profile: { patient: {} },
            preferences: {},
          },
          clinician1: {
            roles: ['clinic'],
          },
        },
        currentPatientInViewId: 'user1',
        data: {
          metaData: { size: 1, devices: [] },
        },
        dataSources: [{ state: 'active' }],
        consentRecords: {},
      },
    };

    store = mockStore(stateWithBanner);

    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);
    expect(contextData.hasBanner).toBe(true);
  });

  it('should show dataSourceJustConnected banner when a data source is just connected', () => {
    const dataSource = { state: 'connected', providerName: 'provider1', lastImportTime: null };

    const stateWithJustConnectedDataSource = {
      blip: {
        ...initialState.blip,
        dataSources: [dataSource],
        justConnectedDataSourceProviderName: 'provider1',
      },
    };

    store = mockStore(stateWithJustConnectedDataSource);

    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);
    expect(contextData.hasBanner).toBe(true);
    expect(contextData.banner.id).toEqual('dataSourceJustConnected');
    expect(contextData.processedBanner.bannerArgs).toEqual([providersStub.provider1, dataSource]);
  });

  it('should show dataSourceReconnect banner when a data source has an error', () => {
    const dataSource = { state: 'error', providerName: 'provider1' };

    const stateWithErroredDataSource = {
      blip: {
        ...initialState.blip,
        dataSources: [dataSource],
      },
    };

    store = mockStore(stateWithErroredDataSource);

    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);

    expect(contextData.hasBanner).toBe(true);
    expect(contextData.banner.id).toEqual('dataSourceReconnect');
    expect(contextData.processedBanner.bannerArgs).toEqual([dispatchStub, providersStub.provider1, dataSource]);
  });

  it('should show uploader banner when user is current patient and has a data source connection but no pump data', () => {
    const stateWithNoPumpData = {
      blip: {
        ...initialState.blip,
        dataSources: [{ state: 'connected' }],
      },
    };

    store = mockStore(stateWithNoPumpData);

    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);

    expect(contextData.hasBanner).toBe(true);
    expect(contextData.banner.id).toEqual('uploader');
    expect(contextData.processedBanner.bannerArgs).toEqual([]);
  });

  it('should show shareData banner when user is current patient and has data but no shared accounts', () => {
    const stateWithDataButNoShares = {
      blip: {
        ...initialState.blip,
        clinics: {
          clinic1: {
            name: 'Test Clinic',
            patients: {},
          },
        },
        data: {
          metaData: { size: 1, devices: [] },
        },
      },
    };

    store = mockStore(stateWithDataButNoShares);

    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);

    expect(contextData.hasBanner).toBe(true);
    expect(contextData.banner.id).toEqual('shareData');
    expect(contextData.processedBanner.bannerArgs).toEqual([dispatchStub, 'user1']);
  });

  it('should show donate banner when user is current patient and has data but is not a donor', () => {
    const stateWithDonate = {
      blip: {
        ...initialState.blip,
        data: {
          metaData: { size: 1, devices: [] },
        },
        consentRecords: {},
      },
    };

    store = mockStore(stateWithDonate);

    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);

    expect(contextData.hasBanner).toBe(true);
    expect(contextData.banner.id).toEqual('donateYourData');
    expect(contextData.processedBanner.bannerArgs).toEqual([dispatchStub, 'user1']);
  });

  it('should show shareProceeds banner when user is current patient, has data, is a donor, but not supporting a nonprofit', () => {
    const stateWithShareProceeds = {
      blip: {
        ...initialState.blip,
        data: {
          metaData: { size: 1, devices: [] },
        },
        consentRecords: {
          [DATA_DONATION_CONSENT_TYPE]: {
            status: 'active',
            metadata: { supportedOrganizations: [] },
          },
        },
      },
    };

    store = mockStore(stateWithShareProceeds);

    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);

    expect(contextData.hasBanner).toBe(true);
    expect(contextData.banner.id).toEqual('shareProceeds');
    expect(contextData.processedBanner.bannerArgs).toEqual([dispatchStub, 'user1']);
  });

  it('should show updateType banner when user is current patient, has data, but no diabetes type', () => {
    const stateWithUpdateType = {
      blip: {
        ...initialState.blip,
        data: {
          metaData: { size: 1, devices: [] },
        },
        // adding a data donation account so that the higher-priority donate banner is not shown
        consentRecords: {
          [DATA_DONATION_CONSENT_TYPE]: {
            status: 'active',
            metadata: { supportedOrganizations: ['foo'] },
          },
        },
      },
    };

    store = mockStore(stateWithUpdateType);

    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);

    expect(contextData.hasBanner).toBe(true);
    expect(contextData.banner.id).toEqual('updateType');
    expect(contextData.processedBanner.bannerArgs).toEqual([dispatchStub, 'user1']);
  });

  it('should show patientLimit banner when clinic patient limit is enforced and limit is reached', () => {
    const stateWithPatientLimit = {
      blip: {
        ...initialState.blip,
        currentPatientInViewId: null,
        loggedInUserId: 'clinician1',
        clinics: {
          clinic1: {
            name: 'Test Clinic',
            patients: {
              user1: {
                permissions: {},
                email: '',
              },
            },
            patientLimitEnforced: true,
            ui: {
              warnings: {
                limitReached: true,
              },
            },
          },
        },
      },
    };

    store = mockStore(stateWithPatientLimit);

    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/clinic-workspace']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);

    expect(contextData.hasBanner).toBe(true);
    expect(contextData.banner.id).toEqual('patientLimit');
    expect(contextData.processedBanner.bannerArgs).toEqual([stateWithPatientLimit.blip.clinics.clinic1]);
  });

  it('should show dataSourceReconnectInvite banner when a data source has an error and user is a clinic patient', () => {
    const stateWithDataSourceReconnectInvite = {
      blip: {
        ...initialState.blip,
        currentPatientInViewId: 'user1',
        loggedInUserId: 'clinician1',
        clinics: {
          clinic1: {
            name: 'Test Clinic',
            patients: {
              user1: {
                permissions: {},
                email: 'patient@example.com',
                dataSources: [{ state: 'error', providerName: 'provider1' }],
              },
            },
          },
        },
      },
    };

    store = mockStore(stateWithDataSourceReconnectInvite);

    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);

    expect(contextData.hasBanner).toBe(true);
    expect(contextData.banner.id).toEqual('dataSourceReconnectInvite');
    expect(contextData.processedBanner.bannerArgs).toEqual([dispatchStub, 'clinic1', stateWithDataSourceReconnectInvite.blip.clinics.clinic1.patients.user1, providersStub.provider1]);
  });

  it('should show addEmail banner when user is a custodial patient and has no email', () => {
    const stateWithAddEmail = {
      blip: {
        ...initialState.blip,
        currentPatientInViewId: 'user1',
        loggedInUserId: 'clinician1',
        clinics: {
          clinic1: {
            name: 'Test Clinic',
            patients: {
              user1: {
                permissions: { custodian: true },
                email: '',
              },
            },
          },
        },
      },
    };

    store = mockStore(stateWithAddEmail);

    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);

    expect(contextData.hasBanner).toBe(true);
    expect(contextData.banner.id).toEqual('addEmail');
    expect(contextData.processedBanner.bannerArgs).toEqual([{}, stateWithAddEmail.blip.clinics.clinic1.patients.user1]);
  });

  it('should show sendVerification banner when user is a custodial patient and has an email', () => {
    const stateWithSendVerification = {
      blip: {
        ...initialState.blip,
        currentPatientInViewId: 'user1',
        loggedInUserId: 'clinician1',
        clinics: {
          clinic1: {
            name: 'Test Clinic',
            patients: {
              user1: {
                permissions: { custodian: true },
                email: 'patient@example.com',
              },
            },
          },
        },
      },
    };

    store = mockStore(stateWithSendVerification);

    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);

    expect(contextData.hasBanner).toBe(true);
    expect(contextData.banner.id).toEqual('sendVerification');
    expect(contextData.processedBanner.bannerArgs).toEqual([dispatchStub, stateWithSendVerification.blip.clinics.clinic1.patients.user1]);
  });

  it('should hide a banner when user interaction occurred after ignoreBannerInteractionsBeforeTime', () => {
    const createdTime = '2025-02-25T08:00:00.000Z';
    const modifiedTime = '2025-02-25T10:00:00.000Z';
    const interactionTime = '2025-02-25T11:00:00.000Z';

    const originalBanners = [...appBanners];
    appBanners.length = 0;
    appBanners.push({ ...find(originalBanners, { id: 'dataSourceJustConnected' }), ignoreBannerInteractionsBeforeTime: modifiedTime });

    const stateWithInteraction = {
      blip: {
        ...initialState.blip,
        loggedInUserId: 'user1',
        currentPatientInViewId: 'user1',
        dataSources: [{ state: 'connected', providerName: 'provider1', modifiedTime, createdTime, lastImportTime: null }],
        justConnectedDataSourceProviderName: 'provider1',
        data: {
          metaData: { size: 1, devices: [] },
        },
        allUsersMap: {
          user1: {
            profile: { patient: {} },
            preferences: {
              // Simulate that the user has already interacted with the banner after modifiedTime
              dismissedProvider1DataSourceJustConnectedBannerTime: interactionTime,
            },
          },
        },
      },
    };

    store = mockStore(stateWithInteraction);

    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);

    // Since the user interaction occurred after modifiedTime,
    // we expect the provider to NOT show the banner.
    expect(contextData.hasBanner).toBe(false);
    appBanners.length = 0;
    appBanners.push(...originalBanners);
  });

  it('should show a banner when user interaction occurred before ignoreBannerInteractionsBeforeTime', () => {
    const createdTime = '2025-02-25T08:00:00.000Z';
    const modifiedTime = '2025-02-25T10:00:00.000Z';
    const interactionTime = '2025-02-25T09:00:00.000Z';

    const originalBanners = [...appBanners];
    appBanners.length = 0;
    appBanners.push({ ...find(originalBanners, { id: 'dataSourceJustConnected' }), ignoreBannerInteractionsBeforeTime: modifiedTime });

    const stateWithInteraction = {
      blip: {
        ...initialState.blip,
        loggedInUserId: 'user1',
        currentPatientInViewId: 'user1',
        dataSources: [{ state: 'connected', providerName: 'provider1', modifiedTime, createdTime, lastImportTime: null }],
        justConnectedDataSourceProviderName: 'provider1',
        data: {
          metaData: { size: 1, devices: [] },
        },
        allUsersMap: {
          user1: {
            profile: { patient: {} },
            preferences: {
              // Simulate that the user has already interacted with the banner before modifiedTime
              dismissedProvider1DataSourceJustConnectedBannerTime: interactionTime,
            },
          },
        },
      },
    };

    store = mockStore(stateWithInteraction);

    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);

    // Since the user interaction occurred before modifiedTime,
    // we expect the provider to show the banner.
    expect(contextData.hasBanner).toBe(true);
    expect(contextData.banner.id).toEqual('dataSourceJustConnected');
    appBanners.length = 0;
    appBanners.push(...originalBanners);
  });

  it('should show the banner with the lowest priority value when multiple banners are available', () => {
    const originalBanners = [...appBanners];
    appBanners.length = 0;
    appBanners.push(
      { ...find(originalBanners, { id: 'dataSourceJustConnected' }), priority: 2 },
      { ...find(originalBanners, { id: 'uploader' }), priority: 4 },
      { ...find(originalBanners, { id: 'donateYourData' }), priority: 1 },
      { ...find(originalBanners, { id: 'updateType' }), priority: 3 }
    );

    const stateWithMultipleBanners = {
      blip: {
        ...initialState.blip,
        dataSources: [{ state: 'connected', providerName: 'provider1', lastImportTime: null }],
        justConnectedDataSourceProviderName: 'provider1',
        data: {
          metaData: { size: 1, devices: [] },
        },
      },
    };

    store = mockStore(stateWithMultipleBanners);

    const { container, baseElement } = render(
      <Provider store={store}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/patients/user1/data']}>
            <AppBannerProvider>
              <DummyConsumer />
            </AppBannerProvider>
          </MemoryRouter>
        </ToastProvider>
      </Provider>
    );

    const contextData = JSON.parse(screen.getByTestId('context').textContent);
    const bannerCandidates = pickBy(contextData.processedBanners, { show: true });
    expect(keys(bannerCandidates)).toHaveLength(4);
    expect(contextData.hasBanner).toBe(true);
    expect(contextData.banner.id).toEqual('donateYourData');
    appBanners.length = 0;
    appBanners.push(...originalBanners);
  });
});
