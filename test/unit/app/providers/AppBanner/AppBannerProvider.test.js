import React, { useContext } from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import sinon from 'sinon';

/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

import ABP, { AppBannerProvider, AppBannerContext } from '../../../../../app/providers/AppBanner/AppBannerProvider';
import { ToastProvider } from '../../../../../app/providers/ToastProvider';
import { DATA_DONATION_NONPROFITS } from '../../../../../app/core/constants';
import { log } from 'async';
import { find, keys, pickBy } from 'lodash';
import { appBanners, pathRegexes } from '../../../../../app/providers/AppBanner/appBanners';
import { loggedInUserId } from '../../../../../app/redux/reducers/misc';

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
      dataDonationAccounts: [],
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
    ABP.__Rewire__('useDispatch', () => dispatchStub);
    ABP.__Rewire__('providers', providersStub);
    store = mockStore(initialState);
  });

  afterEach(() => {
    ABP.__ResetDependency__('useDispatch');
    ABP.__ResetDependency__('providers');
    sinon.restore();
  });

  it('should render children', () => {
    const wrapper = mount(
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
    expect(wrapper.find('[data-testid="child"]')).to.have.lengthOf(1);
    expect(wrapper.find('[data-testid="child"]').text()).to.equal('Child Content');
  });

  it('should provide expected context keys', () => {
    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());
    expect(contextData.keys).to.include.members([
      'banner',
      'bannerInteractedForPatient',
      'bannerShownForPatient',
      'processedBanners',
      'setBannerInteractedForPatient',
      'setBannerShownForPatient',
      'setFormikContext',
    ]);
    expect(contextData.hasBanner).to.be.false;
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
        dataDonationAccounts: [],
      },
    };

    store = mockStore(stateWithBanner);

    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());
    expect(contextData.hasBanner).to.be.true;
  });

  it('should show dataSourceJustConnected banner when a data source is just connected', () => {
    const dataSource = { state: 'connected', providerName: 'provider1', lastImportTime: null };

    const stateWithJustConnectedDataSource = {
      blip: {
        ...initialState.blip,
        dataSources: [dataSource],
      },
    };

    store = mockStore(stateWithJustConnectedDataSource);

    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());
    expect(contextData.hasBanner).to.be.true;
    expect(contextData.banner.id).to.equal('dataSourceJustConnected');
    expect(contextData.processedBanner.bannerArgs).to.eql(['provider1', dataSource]);
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

    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());

    expect(contextData.hasBanner).to.be.true;
    expect(contextData.banner.id).to.equal('dataSourceReconnect');
    expect(contextData.processedBanner.bannerArgs).to.eql([dispatchStub, 'provider1', dataSource]);
  });

  it('should show uploader banner when user is current patient and has a data source connection but no pump data', () => {
    const stateWithNoPumpData = {
      blip: {
        ...initialState.blip,
        dataSources: [{ state: 'connected' }],
      },
    };

    store = mockStore(stateWithNoPumpData);

    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());

    expect(contextData.hasBanner).to.be.true;
    expect(contextData.banner.id).to.equal('uploader');
    expect(contextData.processedBanner.bannerArgs).to.eql([]);
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

    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());

    expect(contextData.hasBanner).to.be.true;
    expect(contextData.banner.id).to.equal('shareData');
    expect(contextData.processedBanner.bannerArgs).to.eql([dispatchStub, 'user1']);
  });

  it('should show donate banner when user is current patient and has data but is not a donor', () => {
    const stateWithDonate = {
      blip: {
        ...initialState.blip,
        data: {
          metaData: { size: 1, devices: [] },
        },
      },
    };

    store = mockStore(stateWithDonate);

    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());

    expect(contextData.hasBanner).to.be.true;
    expect(contextData.banner.id).to.equal('donateYourData');
    expect(contextData.processedBanner.bannerArgs).to.eql([dispatchStub]);
  });

  it('should show shareProceeds banner when user is current patient, has data, is a donor, but not supporting a nonprofit', () => {
    const stateWithShareProceeds = {
      blip: {
        ...initialState.blip,
        data: {
          metaData: { size: 1, devices: [] },
        },
        dataDonationAccounts: [{ email: 'donor@example.com' }],
      },
    };

    store = mockStore(stateWithShareProceeds);

    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());

    expect(contextData.hasBanner).to.be.true;
    expect(contextData.banner.id).to.equal('shareProceeds');
    expect(contextData.processedBanner.bannerArgs).to.eql([dispatchStub, 'user1']);
  });

  it('should show updateType banner when user is current patient, has data, but no diabetes type', () => {
    const stateWithUpdateType = {
      blip: {
        ...initialState.blip,
        data: {
          metaData: { size: 1, devices: [] },
        },
        // addind a data donation account so that the higher-priority donate banner is not shown
        dataDonationAccounts: [{ email: `bigdata+${DATA_DONATION_NONPROFITS()[0].value}@tidepool.org` }], // eslint-disable-line new-cap
      },
    };

    store = mockStore(stateWithUpdateType);

    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());

    expect(contextData.hasBanner).to.be.true;
    expect(contextData.banner.id).to.equal('updateType');
    expect(contextData.processedBanner.bannerArgs).to.eql([dispatchStub, 'user1']);
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

    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());

    expect(contextData.hasBanner).to.be.true;
    expect(contextData.banner.id).to.equal('patientLimit');
    expect(contextData.processedBanner.bannerArgs).to.eql([stateWithPatientLimit.blip.clinics.clinic1]);
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

    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());

    expect(contextData.hasBanner).to.be.true;
    expect(contextData.banner.id).to.equal('dataSourceReconnectInvite');
    expect(contextData.processedBanner.bannerArgs).to.eql([dispatchStub, 'clinic1', stateWithDataSourceReconnectInvite.blip.clinics.clinic1.patients.user1, 'provider1']);
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

    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());

    expect(contextData.hasBanner).to.be.true;
    expect(contextData.banner.id).to.equal('addEmail');
    expect(contextData.processedBanner.bannerArgs).to.eql([{}, stateWithAddEmail.blip.clinics.clinic1.patients.user1]);
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

    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());

    expect(contextData.hasBanner).to.be.true;
    expect(contextData.banner.id).to.equal('sendVerification');
    expect(contextData.processedBanner.bannerArgs).to.eql([dispatchStub, stateWithSendVerification.blip.clinics.clinic1.patients.user1]);
  });

  it('should hide a banner when user interaction occurred after ignoreBannerInteractionsBeforeTime', () => {
    const createdTime = '2025-02-25T08:00:00.000Z';
    const modifiedTime = '2025-02-25T10:00:00.000Z';
    const interactionTime = '2025-02-25T11:00:00.000Z';

    ABP.__Rewire__('appBanners', [
      { ...find(appBanners, { id: 'dataSourceJustConnected' }), ignoreBannerInteractionsBeforeTime: modifiedTime },
    ]);

    const stateWithInteraction = {
      blip: {
        ...initialState.blip,
        loggedInUserId: 'user1',
        currentPatientInViewId: 'user1',
        dataSources: [{ state: 'connected', providerName: 'provider1', modifiedTime, createdTime, lastImportTime: null }],
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

    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());

    // Since the user interaction occurred after modifiedTime,
    // we expect the provider to show the banner.
    expect(contextData.hasBanner).to.be.false;
    ABP.__ResetDependency__('appBanners');
  });

  it('should show a banner when user interaction occurred before ignoreBannerInteractionsBeforeTime', () => {
    const createdTime = '2025-02-25T08:00:00.000Z';
    const modifiedTime = '2025-02-25T10:00:00.000Z';
    const interactionTime = '2025-02-25T09:00:00.000Z';

    ABP.__Rewire__('appBanners', [
      { ...find(appBanners, { id: 'dataSourceJustConnected' }), ignoreBannerInteractionsBeforeTime: modifiedTime },
    ]);

    const stateWithInteraction = {
      blip: {
        ...initialState.blip,
        loggedInUserId: 'user1',
        currentPatientInViewId: 'user1',
        dataSources: [{ state: 'connected', providerName: 'provider1', modifiedTime, createdTime, lastImportTime: null }],
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

    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());

    // Since the user interaction occurred before modifiedTime,
    // we expect the provider to show the banner.
    expect(contextData.hasBanner).to.be.true;
    expect(contextData.banner.id).to.equal('dataSourceJustConnected');
    ABP.__ResetDependency__('appBanners');
  });

  it('should show the banner with the lowest priority value when multiple banners are available', () => {
    ABP.__Rewire__('appBanners', [
      { ...find(appBanners, { id: 'dataSourceJustConnected' }), priority: 2 },
      { ...find(appBanners, { id: 'uploader' }), priority: 4 },
      { ...find(appBanners, { id: 'donateYourData' }), priority: 1 },
      { ...find(appBanners, { id: 'updateType' }), priority: 3 },
    ]);

    const stateWithMultipleBanners = {
      blip: {
        ...initialState.blip,
        dataSources: [{ state: 'connected', providerName: 'provider1', lastImportTime: null }],
        data: {
          metaData: { size: 1, devices: [] },
        },
      },
    };

    store = mockStore(stateWithMultipleBanners);

    const wrapper = mount(
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

    const contextData = JSON.parse(wrapper.find('[data-testid="context"]').text());
    const bannerCandidates = pickBy(contextData.processedBanners, { show: true });
    expect(keys(bannerCandidates)).to.have.lengthOf(4);
    expect(contextData.hasBanner).to.be.true;
    expect(contextData.banner.id).to.equal('donateYourData');
    ABP.__ResetDependency__('appBanners');
  });
});
