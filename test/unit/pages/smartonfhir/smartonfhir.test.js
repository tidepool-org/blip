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

import { SmartOnFhir, mapStateToProps, mapDispatchToProps } from '../../../../app/pages/smartonfhir/smartonfhir';

const mockStore = configureStore([thunk]);

describe('SmartOnFhir', () => {
  let wrapper;
  let props;
  let store;

  beforeEach(() => {
    props = {
      api: {
        patient: {
          getAll: sinon.stub().callsArgWith(1, null, [{ patient: { id: 'user1' }, clinic: { id: 'clinic1' } }]),
        },
      },
      fetchPatients: sinon.stub().callsArgWith(2, null, [{patient: { id: 'user1' }, clinic: {id: 'clinic1'}}]),
      push: sinon.stub(),
      smartOnFhirData: {
        patients: {
          'correlation-123': {
            mrn: '12345',
          },
        },
      },
      working: {
        fetchingPatients: {
          inProgress: false,
          notification: null
        },
      },
      window: {
        sessionStorage: {
          getItem: sinon.stub().returns('correlation-123'),
          setItem: sinon.stub(),
        }
      }
    };

    store = mockStore({
      blip: {
        smartOnFhirData: props.smartOnFhirData,
        working: props.working,
      }
    });

    wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <SmartOnFhir {...props} />
        </MemoryRouter>
      </Provider>
    );
  });

  afterEach(() => {
    props.fetchPatients.reset();
    props.push.reset();
    props.window.sessionStorage.getItem.reset();
    props.window.sessionStorage.setItem.reset();
  });

  it('should render loading message initially', () => {
    expect(wrapper.find('.loading-message').text()).to.include('Loading patient data');
  });

  it('should fetch patient by MRN when Smart on FHIR data is available', () => {
    expect(props.fetchPatients.callCount).to.equal(1);
    expect(props.fetchPatients.calledWith(props.api, { mrn: '12345' })).to.be.true;
  });

  it('should redirect to patient data page when patient is found', () => {
    expect(props.push.callCount).to.equal(1);
    expect(props.push.calledWith('/patients/user1/data')).to.be.true;
  });

  it('should show error when correlation ID is missing', () => {
    props.window.sessionStorage.getItem.returns(null);

    const newProps = {
      ...props,
      smartOnFhirData: {
        patients: {},
      },
    };

    const newStore = mockStore({
      blip: {
        smartOnFhirData: newProps.smartOnFhirData,
        working: props.working,
      }
    });

    const newWrapper = mount(
      <Provider store={newStore}>
        <MemoryRouter>
          <SmartOnFhir {...newProps} />
        </MemoryRouter>
      </Provider>
    );

    expect(newWrapper.find('.error-message').text()).to.include('Missing correlation ID');
  });

  it('should show error when patient information is not found', () => {
    const newProps = {
      ...props,
      smartOnFhirData: {
        patients: {},
      },
    };

    const newStore = mockStore({
      blip: {
        smartOnFhirData: newProps.smartOnFhirData,
        working: props.working,
      }
    });

    const newWrapper = mount(
      <Provider store={newStore}>
        <MemoryRouter>
          <SmartOnFhir {...newProps} />
        </MemoryRouter>
      </Provider>
    );

    expect(newWrapper.find('.error-message').text()).to.include('Patient information not found');
  });

  it('should show error when MRN is missing', () => {
    const newProps = {
      ...props,
      smartOnFhirData: {
        patients: {
          'correlation-123': {
            // No MRN
          },
        },
      },
    };

    const newStore = mockStore({
      blip: {
        smartOnFhirData: newProps.smartOnFhirData,
        working: props.working,
      }
    });

    const newWrapper = mount(
      <Provider store={newStore}>
        <MemoryRouter>
          <SmartOnFhir {...newProps} />
        </MemoryRouter>
      </Provider>
    );

    expect(newWrapper.find('.error-message').text()).to.include('MRN not found');
  });

  it('should show error when API returns an error', () => {
    const apiError = new Error('API error');
    const newProps = {
      ...props,
      fetchPatients: sinon.stub().callsArgWith(2, apiError),
    };

    const newStore = mockStore({
      blip: {
        smartOnFhirData: props.smartOnFhirData,
        working: props.working,
      }
    });

    const newWrapper = mount(
      <Provider store={newStore}>
        <MemoryRouter>
          <SmartOnFhir {...newProps} />
        </MemoryRouter>
      </Provider>
    );

    expect(newWrapper.find('.error-message').text()).to.include('Error fetching patient');
  });

  it('should show error when no patients are found', () => {
    const newProps = {
      ...props,
      fetchPatients: sinon.stub().callsArgWith(2, null, []),
    };

    const newStore = mockStore({
      blip: {
        smartOnFhirData: props.smartOnFhirData,
        working: props.working,
      }
    });

    const newWrapper = mount(
      <Provider store={newStore}>
        <MemoryRouter>
          <SmartOnFhir {...newProps} />
        </MemoryRouter>
      </Provider>
    );

    expect(newWrapper.find('.error-message').text()).to.include('No patients found');
  });

  it('should show error when multiple patients are found', () => {
    const newProps = {
      ...props,
      fetchPatients: sinon.stub().callsArgWith(2, null, [{}, {}]),
    };

    const newStore = mockStore({
      blip: {
        smartOnFhirData: props.smartOnFhirData,
        working: props.working,
      }
    });

    const newWrapper = mount(
      <Provider store={newStore}>
        <MemoryRouter>
          <SmartOnFhir {...newProps} />
        </MemoryRouter>
      </Provider>
    );

    expect(newWrapper.find('.error-message').text()).to.include('Multiple patients found');
  });

  describe('mapStateToProps', () => {
    it('should map state to props correctly', () => {
      const state = {
        blip: {
          smartOnFhirData: { patients: {} },
          working: { fetchingPatients: { inProgress: false } },
        }
      };

      const expectedProps = {
        smartOnFhirData: { patients: {} },
        working: { fetchingPatients: { inProgress: false } },
      };

      expect(mapStateToProps(state)).to.deep.equal(expectedProps);
    });
  });

  describe('mapDispatchToProps', () => {
    it('should map dispatch to props correctly', () => {
      const dispatch = sinon.stub();
      const props = mapDispatchToProps(dispatch);

      expect(props.fetchPatients).to.be.a('function');
      expect(props.push).to.be.a('function');
    });
  });
});
