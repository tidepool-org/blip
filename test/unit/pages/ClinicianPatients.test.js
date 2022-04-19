import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import Table from '../../../app/components/elements/Table';
import ClinicianPatients from '../../../app/pages/clinicworkspace/ClinicianPatients';
import Popover from '../../../app/components/elements/Popover';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global after */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('ClinicianPatients', () => {
  let mount;

  let wrapper;

  let patient1 = {
    userid: 'patient1',
    username: 'patient1@test.ca',
    profile: {
      fullName: 'Patient One',
      patient: {
        birthday: '1999-01-01' ,
      }
    }
  };

  let patient2 = {
    userid: 'patient2',
    username: 'patient2@test.ca',
    profile: {
      fullName: 'Patient Two',
      patient: {
        birthday: '1999-02-02',
        mrn: 'mrn123'
      }
    }
  };

  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    patients: [
      patient1,
      patient2,
    ],
    api: {
      patient: {
        put: sinon.stub().callsArgWith(1, null, { stubbedUpdates: 'foo' }),
      },
      user: {
        createCustodialAccount: sinon.stub().callsArgWith(1, null, { userid: 'stubbedId' }),
      },
      access: {
        leaveGroup: sinon.stub(),
      }
    },
  };

  let noPatientProps = {
    ...defaultProps,
    patients: [],
  };

  before(() => {
    mount = createMount();
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.access.leaveGroup.resetHistory();
    defaultProps.api.user.createCustodialAccount.resetHistory();
    defaultProps.api.patient.put.resetHistory();
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
    username: 'clinic@example.com',
    roles: ['CLINIC'],
    userid: 'clinicianUserId123',
  };

  const noPatientsState = {
    blip: {
      loggedInUserId,
      allUsersMap: { clinicianUserId123 },
      working: {
        fetchingAssociatedAccounts: completedState,
        removingMembershipInOtherCareTeam: defaultWorkingState,
        updatingPatient: defaultWorkingState,
        creatingVCACustodialAccount: defaultWorkingState,
      },
    },
  };

  let store;

  const hasPatientsState = merge({}, noPatientsState, {
    blip: {
      ...noPatientsState.blip,
      allUsersMap: {
        clinicianUserId123,
        patient1,
        patient2,
      },
    },
  });

  context('no patients', () => {
    beforeEach(() => {
      store = mockStore(noPatientsState);
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicianPatients {...noPatientProps} />
          </ToastProvider>
        </Provider>
      );

      wrapper.find('button#patients-view-toggle').simulate('click');
      defaultProps.trackMetric.resetHistory();
    });

    it('should render an empty table', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(1); // header row only
      expect(wrapper.find('.table-empty-text').hostNodes().text()).includes('There are no results to show.');
    });

    it('should open a modal for adding a new patient', done => {
      const addButton = wrapper.find('button#add-patient');
      expect(addButton.text()).to.equal('Add a New Patient');

      const dialog = () => wrapper.find('Dialog#addPatient');

      expect(dialog().props().open).to.be.false;
      addButton.simulate('click');
      wrapper.update();
      expect(dialog().props().open).to.be.true;

      expect(defaultProps.trackMetric.calledWith('Clinician - Add patient')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      const patientForm = () => dialog().find('form#clinic-patient-form');
      expect(patientForm()).to.have.lengthOf(1);

      expect(patientForm().find('input[name="fullName"]').prop('value')).to.equal('');
      patientForm().find('input[name="fullName"]').simulate('change', { persist: noop, target: { name: 'fullName', value: 'Patient Name' } });
      expect(patientForm().find('input[name="fullName"]').prop('value')).to.equal('Patient Name');

      expect(patientForm().find('input[name="birthDate"]').prop('value')).to.equal('');
      patientForm().find('input[name="birthDate"]').simulate('change', { persist: noop, target: { name: 'birthDate', value: '11/21/1999' } });
      expect(patientForm().find('input[name="birthDate"]').prop('value')).to.equal('11/21/1999');

      expect(patientForm().find('input[name="mrn"]').prop('value')).to.equal('');
      patientForm().find('input[name="mrn"]').simulate('change', { persist: noop, target: { name: 'mrn', value: '123456' } });
      expect(patientForm().find('input[name="mrn"]').prop('value')).to.equal('123456');

      expect(patientForm().find('input[name="email"]').prop('value')).to.equal('');
      patientForm().find('input[name="email"]').simulate('change', { persist: noop, target: { name: 'email', value: 'patient@test.ca' } });
      expect(patientForm().find('input[name="email"]').prop('value')).to.equal('patient@test.ca');

      expect(patientForm().find('input[name="attestationSubmitted"]').prop('checked')).to.be.false;
      patientForm().find('input[name="attestationSubmitted"]').simulate('change', { persist: noop, target: { name: 'attestationSubmitted', value: true } });
      expect(patientForm().find('input[name="attestationSubmitted"]').prop('checked')).to.be.true;

      store.clearActions();
      dialog().find('Button#addPatientConfirm').simulate('click');

      setTimeout(() => {
        expect(defaultProps.api.user.createCustodialAccount.callCount).to.equal(1);

        sinon.assert.calledWith(
          defaultProps.api.user.createCustodialAccount,
          {
            emails: ['patient@test.ca'],
            fullName: 'Patient Name',
            patient: { birthday: '1999-11-21', mrn: '123456' }
          }
        );

        expect(store.getActions()).to.eql([
          { type: 'CREATE_VCA_CUSTODIAL_ACCOUNT_REQUEST' },
          {
            type: 'CREATE_VCA_CUSTODIAL_ACCOUNT_SUCCESS',
            payload: {
              patientId: 'stubbedId',
              patient: { userid: 'stubbedId' },
            },
          },
        ]);

        done();
      }, 0);
    });
  });

  context('has patients', () => {
    beforeEach(() => {
      store = mockStore(hasPatientsState);
      defaultProps.trackMetric.resetHistory();
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicianPatients {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    describe('showNames', function () {
      it('should show a row of data for each person', function () {
        wrapper.find('button#patients-view-toggle').simulate('click');
        // 2 people plus one row for the header
        expect(wrapper.find('.MuiTableRow-root')).to.have.length(3);
      });

      it('should trigger a call to trackMetric', function () {
        wrapper.find('button#patients-view-toggle').simulate('click');
        expect(defaultProps.trackMetric.calledWith('Clicked Show All')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(1);
      });

      it('should not have instructions displayed', function () {
        wrapper.find('button#patients-view-toggle').simulate('click');
        expect(wrapper.find('.peopletable-instructions')).to.have.length(0);
      });
    });

    context('show names clicked', () => {
      beforeEach(() => {
        wrapper.find('button#patients-view-toggle').simulate('click');
        defaultProps.trackMetric.resetHistory();
      });

      it('should render a list of patients', () => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);
        expect(table.find('tr')).to.have.length(3); // header row + 2 invites
        expect(table.find('tr').at(1).text()).contains('Patient One');
        expect(table.find('tr').at(1).text()).contains('1999-01-01');
        expect(table.find('tr').at(2).text()).contains('Patient Two');
        expect(table.find('tr').at(2).text()).contains('1999-02-02');
        expect(table.find('tr').at(2).text()).contains('mrn123');
      });

      it('should allow searching patients', () => {
        const table = () => wrapper.find(Table);
        expect(table()).to.have.length(1);
        expect(table().find('tr')).to.have.length(3); // header row + 2 invites
        expect(table().find('tr').at(1).text()).contains('Patient One');
        expect(table().find('tr').at(2).text()).contains('Patient Two');

        const searchInput = wrapper.find('input[name="search-patients"]');
        expect(searchInput).to.have.lengthOf(1);

        // Input partial match on name for patient two
        searchInput.simulate('change', { target: { name: 'search-patients', value: 'Two' } });

        expect(table().find('tr')).to.have.length(2); // header row + 1 invites
        expect(table().find('tr').at(1).text()).contains('Patient Two');
      });

      it('should link to a patient data view when patient name is clicked', () => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);
        expect(table.find('tr')).to.have.length(3); // header row + 2 invites
        const firstPatientName = table.find('tr').at(1).find('th').find('div').at(1).hostNodes();
        expect(firstPatientName.text()).contains('Patient One');

        store.clearActions();
        firstPatientName.simulate('click');

        expect(store.getActions()).to.eql([
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: { method: 'push', args: ['/patients/patient1/data']}
          },
        ]);
      });

      it('should link to a patient data view when patient birthday is clicked', () => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);
        expect(table.find('tr')).to.have.length(3); // header row + 2 invites
        const firstPatientBirthday = table.find('tr').at(1).find('td').at(0).find('div').at(1).hostNodes();
        expect(firstPatientBirthday.text()).contains('1999-01-01');

        store.clearActions();
        firstPatientBirthday.simulate('click');

        expect(store.getActions()).to.eql([
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: { method: 'push', args: ['/patients/patient1/data']}
          },
        ]);
      });

      it('should display menu when "More" icon is clicked', () => {
        const moreMenuIcon = wrapper.find('PopoverMenu').find('Icon').at(0);
        expect(wrapper.find(Popover).at(0).props().open).to.be.false;
        moreMenuIcon.simulate('click');
        expect(wrapper.find(Popover).at(0).props().open).to.be.true;
      });

      it('should open a modal for patient editing when edit link is clicked', done => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);
        expect(table.find('tr')).to.have.length(3); // header row + 2 invites
        const editButton = table.find('tr').at(2).find('Button[iconLabel="Edit Patient Information"]');

        const dialog = () => wrapper.find('Dialog#editPatient');

        expect(dialog().props().open).to.be.false;
        editButton.simulate('click');
        wrapper.update();
        expect(dialog().props().open).to.be.true;

        expect(defaultProps.trackMetric.calledWith('Clinician - Edit patient')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(1);

        const patientForm = () => dialog().find('form#clinic-patient-form');
        expect(patientForm()).to.have.lengthOf(1);

        expect(patientForm().find('input[name="fullName"]').prop('value')).to.equal('Patient Two');
        patientForm().find('input[name="fullName"]').simulate('change', { persist: noop, target: { name: 'fullName', value: 'Patient 2' } });
        expect(patientForm().find('input[name="fullName"]').prop('value')).to.equal('Patient 2');

        expect(patientForm().find('input[name="birthDate"]').prop('value')).to.equal('02/02/1999');
        patientForm().find('input[name="birthDate"]').simulate('change', { persist: noop, target: { name: 'birthDate', value: '01/01/1999' } });
        expect(patientForm().find('input[name="birthDate"]').prop('value')).to.equal('01/01/1999');

        expect(patientForm().find('input[name="mrn"]').prop('value')).to.equal('mrn123');
        patientForm().find('input[name="mrn"]').simulate('change', { persist: noop, target: { name: 'mrn', value: 'mrn456' } });
        expect(patientForm().find('input[name="mrn"]').prop('value')).to.equal('mrn456');

        expect(patientForm().find('input[name="email"]').prop('value')).to.equal('patient2@test.ca');
        patientForm().find('input[name="email"]').simulate('change', { persist: noop, target: { name: 'email', value: 'patient-two@test.ca' } });
        expect(patientForm().find('input[name="email"]').prop('value')).to.equal('patient-two@test.ca');

        store.clearActions();
        dialog().find('Button#editPatientConfirm').simulate('click');

        setTimeout(() => {
          expect(defaultProps.api.patient.put.callCount).to.equal(1);

          sinon.assert.calledWith(
            defaultProps.api.patient.put,
            {
              emails: ['patient-two@test.ca'],
              permissions: undefined,
              profile: {
                emails: ['patient-two@test.ca'],
                fullName: 'Patient 2',
                patient: { birthday: '1999-01-01', mrn: 'mrn456' },
              },
              userid: 'patient2',
              username: 'patient-two@test.ca',
            }
          );

          expect(store.getActions()).to.eql([
            { type: 'UPDATE_PATIENT_REQUEST' },
            {
              type: 'UPDATE_PATIENT_SUCCESS',
              payload: {
                updatedPatient: { stubbedUpdates: 'foo' },
              },
            },
          ]);

          done();
        }, 0);
      });

      it('should remove a patient', () => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);
        expect(table.find('tr')).to.have.length(3); // header row + 2 invites
        const removeButton = table.find('tr').at(1).find('Button[iconLabel="Remove Patient"]');

        expect(wrapper.find('Dialog#deleteUser').props().open).to.be.false;
        removeButton.simulate('click');
        wrapper.update();
        expect(wrapper.find('Dialog#deleteUser').props().open).to.be.true;

        expect(defaultProps.trackMetric.calledWith('Clinician - Remove patient')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(1);

        const confirmRemoveButton = wrapper.find('Dialog#deleteUser').find('Button#patientRemoveConfirm');
        expect(confirmRemoveButton.text()).to.equal('Remove');

        store.clearActions();

        confirmRemoveButton.simulate('click');
        console.log('store.getActions()', store.getActions());
        expect(store.getActions()).to.eql([
          { type: 'REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_REQUEST' },
        ]);

        sinon.assert.calledWith(defaultProps.api.access.leaveGroup, 'patient1');

        expect(defaultProps.trackMetric.calledWith('Clinician - Remove patient confirmed')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(2);
      });
    });
  });
});
