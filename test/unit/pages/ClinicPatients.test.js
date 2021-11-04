import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import Table from '../../../app/components/elements/Table';
import ClinicPatients from '../../../app/pages/clinicworkspace/ClinicPatients';
import { Dialog } from '../../../app/components/elements/Dialog';

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

describe('ClinicPatients', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    searchDebounceMs: 0,
    api: {
      clinics: {
        getPatientsForClinic: sinon.stub(),
        deletePatientFromClinic: sinon.stub(),
      },
    },
  };

  before(() => {
    mount = createMount();
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.clinics.getPatientsForClinic.resetHistory();
    defaultProps.api.clinics.deletePatientFromClinic.resetHistory();
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

  const noPatientsState = {
    blip: {
      loggedInUserId,
      clinics: {
        clinicID123: {
          clinicians:{
            clinicianUserId123,
          },
          patients: {},
          id: 'clinicID123',
          address: '2 Address Ln, City Zip',
          name: 'other_clinic_name',
          email: 'other_clinic_email_address@example.com',
          phoneNumbers: [
            {
              number: '(888) 444-4444',
              type: 'Office',
            },
          ],
        },
      },
      selectedClinicId: 'clinicID123',
      working: {
        fetchingPatientsForClinic: completedState,
        deletingPatientFromClinic: defaultWorkingState,
      },
    },
  };

  let store;

  const hasPatientsState = merge({}, noPatientsState, {
    blip: {
      allUsersMap: {
        clinicianUserId123,
      },
      clinics: {
        clinicID123: {
          clinicians:{
            clinicianUserId123,
          },
          patients: {
            patient1: {
              id: 'patient1',
              email: 'patient1@test.ca',
              fullName: 'Patient One',
              birthDate: '1999-01-01' ,
            },
            patient2: {
              id: 'patient2',
              email: 'patient2@test.ca',
              fullName: 'Patient Two',
              birthDate: '1999-02-02',
            },
          },
          id: 'clinicID123',
          address: '2 Address Ln, City Zip',
          name: 'other_clinic_name',
          email: 'other_clinic_email_address@example.com',
          phoneNumbers: [
            {
              number: '(888) 444-4444',
              type: 'Office',
            },
          ],
        },
      },
    },
  });

  const nonAdminPatientsState = {
    blip: {
      ...hasPatientsState.blip,
      clinics: {
        clinicID123: {
          ...hasPatientsState.blip.clinics.clinicID123,
          clinicians: {
            clinicianUserId123: {
              ...clinicianUserId123,
              roles: ['CLINIC_MEMBER'],
            },
          },
        },
      },
    },
  };

  context('no patients', () => {
    beforeEach(() => {
      store = mockStore(noPatientsState);
      defaultProps.trackMetric.resetHistory();
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicPatients {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

      wrapper.find('button#patients-view-toggle').simulate('click');
    });

    it('should render an empty table', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(1); // header row only
      expect(wrapper.find('.table-empty-text').hostNodes().text()).includes('There are no results to show.');
    });
  });

  context('has patients', () => {
    beforeEach(() => {
      store = mockStore(hasPatientsState);
      defaultProps.trackMetric.resetHistory();
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicPatients {...defaultProps} />
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
      });

      it('should render a list of patients', () => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);
        expect(table.find('tr')).to.have.length(3); // header row + 2 invites
        expect(table.find('tr').at(1).text()).contains('Patient One')
        expect(table.find('tr').at(1).text()).contains('1/1/1999')
        expect(table.find('tr').at(2).text()).contains('Patient Two')
        expect(table.find('tr').at(2).text()).contains('2/2/1999')
      });

      it('should allow searching patients', (done) => {
        const table = () => wrapper.find(Table);
        expect(table()).to.have.length(1);
        expect(table().find('tr')).to.have.length(3); // header row + 2 invites
        expect(table().find('tr').at(1).text()).contains('Patient One')
        expect(table().find('tr').at(2).text()).contains('Patient Two')

        const searchInput = wrapper.find('input[name="search-patients"]');
        expect(searchInput).to.have.lengthOf(1);

        // Clear the store actions
        store.clearActions();

        // Input partial match on name for patient two
        searchInput.simulate('change', { target: { name: 'search-patients', value: 'Two' } });

        setTimeout(() => {
          expect(store.getActions()).to.eql([
            { type: 'FETCH_PATIENTS_FOR_CLINIC_REQUEST' },
          ]);

          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', { limit: 8, offset: 0, search: 'Two' });
          done();
        }, 100);
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
        expect(firstPatientBirthday.text()).contains('1/1/1999');

        store.clearActions();
        firstPatientBirthday.simulate('click');

        expect(store.getActions()).to.eql([
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: { method: 'push', args: ['/patients/patient1/data']}
          },
        ]);
      });

      it('should link to a patient profile view when edit link is clicked', () => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);
        expect(table.find('tr')).to.have.length(3); // header row + 2 invites
        const editButton = table.find('tr').at(1).find('.edit-clinic-patient').hostNodes();
        expect(editButton.props()['aria-label']).to.equal('Edit');

        store.clearActions();
        editButton.simulate('click');

        expect(store.getActions()).to.eql([
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: { method: 'push', args: ['/patients/patient1/profile#edit']}
          },
        ]);
      });

      it('should remove a patient', () => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);
        expect(table.find('tr')).to.have.length(3); // header row + 2 invites
        const removeButton = table.find('tr').at(1).find('.remove-clinic-patient').hostNodes();
        expect(removeButton.props()['aria-label']).to.equal('Remove');

        expect(wrapper.find(Dialog).props().open).to.be.false;
        removeButton.simulate('click');
        wrapper.update();
        expect(wrapper.find(Dialog).props().open).to.be.true;

        const confirmRemoveButton = wrapper.find(Dialog).find('Button#patientRemoveConfirm');
        expect(confirmRemoveButton.text()).to.equal('Remove');

        store.clearActions();

        confirmRemoveButton.simulate('click');
        expect(store.getActions()).to.eql([
          { type: 'DELETE_PATIENT_FROM_CLINIC_REQUEST' },
        ]);

        sinon.assert.calledWith(defaultProps.api.clinics.deletePatientFromClinic, 'clinicID123', 'patient1');
      });

      context('non-admin clinician', () => {
        beforeEach(() => {
          store = mockStore(nonAdminPatientsState);
          defaultProps.trackMetric.resetHistory();
          wrapper = mount(
            <Provider store={store}>
              <ToastProvider>
                <ClinicPatients {...defaultProps} />
              </ToastProvider>
            </Provider>
          );

          wrapper.find('button#patients-view-toggle').simulate('click');
        });

        it('should not render the remove button', () => {
          const table = wrapper.find(Table);
          expect(table).to.have.length(1);
          expect(table.find('tr')).to.have.length(3); // header row + 2 invites
          const removeButton = table.find('tr').at(1).find('.remove-clinic-patient');
          expect(removeButton).to.have.lengthOf(0);
        });
      });
    });
  });
});
