import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import Table from '../../../app/components/elements/Table';
import Prescriptions from '../../../app/pages/prescription/Prescriptions';
import Popover from '../../../app/components/elements/Popover';
import { clinicUIDetails } from '../../../app/core/clinicUtils';
import LDClientMock from '../../fixtures/LDClientMock';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global after */
/* global afterEach */

const expect = chai.expect;
const assert = chai.assert;
const mockStore = configureStore([thunk]);

describe('Prescriptions', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    searchDebounceMs: 0,
    api: {
      prescription: {
        getAllForClinic: sinon.stub(),
        delete: sinon.stub(),
      },
      user: {
        getAssociatedAccounts: sinon.stub(),
      },
    },
  };

  before(() => {
    mount = createMount();
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.prescription.getAllForClinic.resetHistory();
    defaultProps.api.user.getAssociatedAccounts.resetHistory();
    Prescriptions.__Rewire__('useLDClient', sinon.stub().returns(new LDClientMock()));

    Prescriptions.__Rewire__('useFlags', sinon.stub().returns({
      showPrescriptions: true,
    }));
  });

  afterEach(() => {
    Prescriptions.__ResetDependency__('useLDClient');
    Prescriptions.__ResetDependency__('useFlags');
  });

  after(() => {
    mount.cleanUp();
  });

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const completedState = {
    ...defaultWorkingState,
    completed: true,
  };

  const loggedInUserId = 'clinicianUserId123';

  const clinicianUserId123 = {
    email: 'clinic@example.com',
    roles: ['CLINIC_ADMIN'],
    id: 'clinicianUserId123',
  };

  const defaultClinic = {
    clinicians:{
      clinicianUserId123,
    },
    patients: {},
    id: 'clinicID123',
    address: '2 Address Ln, City Zip',
    country: 'US',
    name: 'other_clinic_name',
    email: 'other_clinic_email_address@example.com',
    timezone: 'US/Eastern',
  };

  const initialState = {
    blip: {
      allUsersMap: {
        clinicianUserId123,
      },
      loggedInUserId,
      clinics: {
        clinicID123: {
          ...defaultClinic,
          ...clinicUIDetails(defaultClinic),
        },
      },
      selectedClinicId: 'clinicID123',
      working: {
        fetchingAssociatedAccounts: defaultWorkingState,
        fetchingClinicPrescriptions: defaultWorkingState,
        deletingPrescription: defaultWorkingState,
      },
    },
  };

  const noPrescriptionsState = merge({}, initialState, {
    blip: {
      ...initialState.blip,
      working: {
        fetchingAssociatedAccounts: completedState,
        fetchingClinicPrescriptions: completedState,
        deletingPrescription: defaultWorkingState,
      },
    },
  });

  let store = mockStore(noPrescriptionsState);

  const hasPrescriptionsState = merge({}, noPrescriptionsState, {
    blip: {
      ...noPrescriptionsState.blip,
      prescriptions: [
        {
          id: 'patient1RxId',
          clinicId: 'clinicID123',
          accessCode: 'access1',
          patientUserId: 'patient1Id',
          latestRevision: {
            attributes: {
              birthday: '1989-10-09',
              createdTime: '2024-02-02T12:00:00.000Z',
              email: 'patient1@test.ca',
              firstName: 'Patient',
              lastName: 'One',
              mrn: 'mrn1',
            },
          },
          state: 'submitted',
        },
        {
          id: 'patient2RxId',
          clinicId: 'clinicID123',
          accessCode: 'access2',
          latestRevision: {
            attributes: {
              birthday: '1989-10-10',
              createdTime: '2024-02-01T12:00:00.000Z',
              email: 'patient2@test.ca',
              firstName: 'Patient',
              lastName: 'Two',
              mrn: 'mrn2',
            },
          },
          state: 'draft',
        },
      ],
    },
  });

  context('on mount', () => {
    beforeEach(() => {
      store.clearActions();
    });

    it('should redirect back to the clinic workspace patients list if LD `showPrescriptions` flag is false', () => {
      store = mockStore(initialState);
      store.clearActions();

      Prescriptions.__Rewire__('useLDClient', sinon.stub().returns(new LDClientMock({ clinic : {
        tier: 'tier0300'
      }})));

      Prescriptions.__Rewire__('useFlags', sinon.stub().returns({
        showPrescriptions: false,
      }));

      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <Prescriptions {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

      expect(store.getActions()[0]).to.eql({
        payload: { args: ['/clinic-workspace/patients'], method: 'push' },
        type: '@@router/CALL_HISTORY_METHOD',
      });
    });

    it('should not fetch prescriptions or associated accounts for clinic if already in progress', () => {
      store = mockStore(
        merge({}, initialState, {
          blip: {
            working: {
              fetchingClinicPrescriptions: {
                inProgress: true,
              },
              fetchingAssociatedAccounts: {
                inProgress: true,
              },
            },
          },
        })
      );
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <Prescriptions {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
      expect(store.getActions()).to.eql([]);
    });

    it('should fetch prescriptions and associated accounts for clinic', () => {
      store = mockStore(initialState);

      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <Prescriptions {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
      const expectedActions = [
        { type: 'FETCH_ASSOCIATED_ACCOUNTS_REQUEST' },
        { type: 'FETCH_CLINIC_PRESCRIPTIONS_REQUEST' },
      ];
      expect(store.getActions()).to.eql(expectedActions);
    });
  });

  context('no prescriptions', () => {
    beforeEach(() => {
      store = mockStore(noPrescriptionsState);
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <Prescriptions {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should render an empty table', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(1); // header row only
      expect(wrapper.find('.table-empty-text').hostNodes().text()).includes('There are no prescriptions to show.');
    });
  });

  context('has prescriptions', () => {
    beforeEach(() => {
      store = mockStore(hasPrescriptionsState);
      defaultProps.trackMetric.resetHistory();
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <Prescriptions {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should render a list of prescriptions', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(3); // header row + 2 prescriptions

      expect(table.find('tr').at(1).text()).contains('Patient One');
      expect(table.find('tr').at(1).text()).contains('10/09/1989');
      expect(table.find('tr').at(1).text()).contains('mrn1');
      expect(table.find('tr').at(1).text()).contains('access1');
      expect(table.find('tr').at(1).text()).contains('Submitted');

      expect(table.find('tr').at(2).text()).contains('Patient Two');
      expect(table.find('tr').at(2).text()).contains('10/10/1989');
      expect(table.find('tr').at(2).text()).contains('mrn2');
      expect(table.find('tr').at(2).text()).not.contains('access2'); // draft should not show access code
      expect(table.find('tr').at(2).text()).contains('Draft');
    });

    it('should allow searching prescriptions', (done) => {
      const table = () => wrapper.find(Table);
      expect(table()).to.have.length(1);
      expect(table().find('tr')).to.have.length(3); // header row + 2 prescriptions
      expect(table().find('tr').at(1).text()).contains('Patient One');
      expect(table().find('tr').at(2).text()).contains('Patient Two');

      const searchInput = wrapper.find('input[name="search-prescriptions"]');
      expect(searchInput).to.have.lengthOf(1);

      // Clear the store actions
      store.clearActions();

      // Input partial match on name for patient two
      searchInput.simulate('change', { target: { name: 'search-prescriptions', value: 'Tw' } });

      setTimeout(() => {
        expect(table().find('tr')).to.have.length(2); // header row + 1 prescription
        expect(table().find('tr').at(1).text()).contains('Patient Two');
        done();
      }, 0);
    });

    it('should redirect to a prescription view when a prescription row is clicked', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(3); // header row + 2 prescriptions
      const firstPrescription = table.find('tr').at(1).hostNodes();
      expect(firstPrescription.text()).contains('Patient One');

      store.clearActions();
      firstPrescription.simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: { method: 'push', args: ['/prescriptions/patient1RxId']},
        },
      ]);
    });

    it('should display menu when "More" icon is clicked', () => {
      const moreMenuIcon = wrapper.find('PopoverMenu').find('Icon').at(0);
      expect(wrapper.find(Popover).at(1).props().open).to.be.false;
      moreMenuIcon.simulate('click');
      expect(wrapper.find(Popover).at(1).props().open).to.be.true;
    });

    it('should redirect to a prescription view when view action is clicked', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(3); // header row + 2 prescriptions
      const editButton = table.find('tr').at(1).find('Button[iconLabel="View Tidepool Loop Start Order"]');
      editButton.simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: { method: 'push', args: ['/prescriptions/patient1RxId']},
        },
      ]);
    });

    it('should redirect to a prescription view when edit action is clicked', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(3); // header row + 2 prescriptions
      const editButton = table.find('tr').at(2).find('Button[iconLabel="Update Tidepool Loop Start Order"]');
      editButton.simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: { method: 'push', args: ['/prescriptions/patient2RxId']},
        },
      ]);
    });

    it('should add a prescription', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(3); // header row + 2 prescriptions
      const addButton = wrapper.find('button#add-prescription');
      addButton.simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: { method: 'push', args: ['/prescriptions/new']},
        },
      ]);
    });

    it('should delete a prescription', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(3); // header row + 2 prescriptions
      const removeButton = table.find('tr').at(2).find('Button[iconLabel="Delete Tidepool Loop Start Order"]');

      expect(wrapper.find('Dialog#prescription-delete').props().open).to.be.false;
      removeButton.simulate('click');
      wrapper.update();
      expect(wrapper.find('Dialog#prescription-delete').props().open).to.be.true;

      expect(defaultProps.trackMetric.calledWith('Clinic - Delete prescription')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      const confirmRemoveButton = wrapper.find('Dialog#prescription-delete').find('Button#prescription-delete-confirm');
      expect(confirmRemoveButton.text()).to.equal('Delete Tidepool Loop Start Order');

      store.clearActions();

      confirmRemoveButton.simulate('click');
      expect(store.getActions()).to.eql([
        {
          payload: {
            prescriptionId: 'patient2RxId',
          },
          type: 'DELETE_PRESCRIPTION_REQUEST',
        },
      ]);

      sinon.assert.calledWith(defaultProps.api.prescription.delete, 'clinicID123', 'patient2RxId');

      expect(defaultProps.trackMetric.calledWith('Clinic - Delete prescription confirmed')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(2);
    });
  });
});
