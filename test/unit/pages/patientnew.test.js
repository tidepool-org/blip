import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import noop from 'lodash/noop';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import PatientNew from '../../../app/pages/patientnew';

/* global chai */
/* global sinon */
/* global context */
/* global describe */
/* global it */
/* global beforeEach */
/* global before */
/* global after */
/* global afterEach */

var expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('PatientNew', function () {
  // let mount;
  const mount = createMount();
  let wrapper;

  // before(() => {
  //   mount = createMount();
  // });

  // after(() => {
  //   mount.cleanUp();
  // });

  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      invitation: {
        send: sinon.stub(),
      },
      patient: {
        post: sinon.stub().callsArgWith(1, null, { createdPatient: { profile: 'new profile'} }),
      },
    },
  };

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const defaultState = {
    blip: {
      allUsersMap: {
        a1b2c3: {
          userid: 'a1b2c3',
        },
      },
      loggedInUserId: 'a1b2c3',
      working: {
        settingUpDataStorage: defaultWorkingState,
      },
    },
  };

  let store = mockStore(defaultState);

  const createWrapper = (providedStore = store) => {
    store = providedStore;

    return mount(
      <Provider store={providedStore}>
        <ToastProvider>
          <PatientNew {...defaultProps} />
        </ToastProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    wrapper = createWrapper();
  });

  afterEach(() => {
    defaultProps.api.invitation.send.resetHistory();
    defaultProps.api.patient.post.resetHistory();
  });

  it('should allow creating a personal patient account profile', done => {
    const profile = {
      fullName: 'Johnny Patient',
      patient: {
        birthday: 'Jan 1, 1990',
        diagnosisDate: 'Feb 2, 1995',
        diagnosisType: 'type1',
      },
    };

    // Next button is initially disabled
    const nextButton = () => wrapper.find('button#submit');
    expect(nextButton()).to.have.lengthOf(1);
    expect(nextButton().prop('disabled')).to.be.true;

    // Add name for account profile
    const firstNameInput = () => wrapper.find('input#firstName');
    expect(firstNameInput()).to.have.lengthOf(1);
    expect(firstNameInput().prop('value')).to.equal('');

    firstNameInput().simulate('change', { persist: noop, target: { name: 'firstName', value: profile.fullName.split(' ')[0] } });
    expect(firstNameInput().prop('value')).to.equal('Johnny');

    const lastNameInput = () => wrapper.find('input#lastName');
    expect(lastNameInput()).to.have.lengthOf(1);
    expect(lastNameInput().prop('value')).to.equal('');

    lastNameInput().simulate('change', { persist: noop, target: { name: 'lastName', value: profile.fullName.split(' ')[1] } });
    expect(lastNameInput().prop('value')).to.equal('Patient');

    // Next button still disabled until we choose accountType
    expect(nextButton().prop('disabled')).to.be.true;

    const personalAccountTypeInput = () => wrapper.find('input#accountType-0');
    expect(personalAccountTypeInput()).to.have.lengthOf(1);
    expect(personalAccountTypeInput().prop('checked')).to.be.false;

    personalAccountTypeInput().simulate('change', { persist: noop, target: { name: 'accountType', value: 'personal' } });
    expect(personalAccountTypeInput().prop('value')).to.equal('personal');

    // Next button should now be enabled
    expect(nextButton().prop('disabled')).to.be.false;

    // Proceed to step 2 of flowFrom:
    nextButton().simulate('click');

    // Should be a back button, and a disabled 'Next' button
    const backButton = wrapper.find('button#back');
    expect(backButton).to.have.lengthOf(1);
    expect(nextButton().prop('disabled')).to.be.true;

    // Fill in birthday, diagnosisDate, and diagnosisType
    const birthdayInput = () => wrapper.find('input#birthday');
    expect(birthdayInput()).to.have.lengthOf(1);
    expect(birthdayInput().prop('value')).to.equal('');

    birthdayInput().simulate('change', { persist: noop, target: { name: 'birthday', value: profile.patient.birthday } });
    expect(birthdayInput().prop('value')).to.equal('Jan 1, 1990');

    const diagnosisDateInput = () => wrapper.find('input#diagnosisDate');
    expect(diagnosisDateInput()).to.have.lengthOf(1);
    expect(diagnosisDateInput().prop('value')).to.equal('');

    diagnosisDateInput().simulate('change', { persist: noop, target: { name: 'diagnosisDate', value: profile.patient.diagnosisDate } });
    expect(diagnosisDateInput().prop('value')).to.equal('Feb 2, 1995');

    const diagnosisTypeSelect = () => wrapper.find('select#diagnosisType');
    expect(diagnosisTypeSelect()).to.have.lengthOf(1);
    expect(diagnosisTypeSelect().prop('value')).to.equal('');

    diagnosisTypeSelect().simulate('change', { persist: noop, target: { name: 'diagnosisType', value: profile.patient.diagnosisType } });
    expect(diagnosisTypeSelect().prop('value')).to.equal('type1');

    // Required fields all filled. Next button should now be enabled
    expect(nextButton().prop('disabled')).to.be.false;

    // Share anonymized data fields should also be present for caregiver profiles
    const dataDonateCheckbox = () => wrapper.find('input#dataDonate');
    expect(dataDonateCheckbox()).to.have.lengthOf(1);
    expect(dataDonateCheckbox().prop('checked')).to.equal(false);
    expect(dataDonateCheckbox().prop('disabled')).to.equal(false);

    // const dataDonateDestination = () => wrapper.find('div#dataDonateDestination input#react-select-2-input');
    const dataDonateDestination = () => wrapper.find('MultiSelect input');
    expect(dataDonateDestination()).to.have.lengthOf(1);
    expect(dataDonateDestination().prop('value')).to.equal('');
    expect(dataDonateDestination().prop('disabled')).to.equal(true);

    // Check the donate checkbox to enable the donation destination multi-select
    dataDonateCheckbox().simulate('change', { persist: noop, target: { name: 'dataDonate', checked: true, value: true } });
    expect(dataDonateCheckbox().prop('checked')).to.equal(true);
    expect(dataDonateDestination().prop('disabled')).to.equal(false);

    // Set donate destinations
    dataDonateDestination().simulate('change', { persist: noop, target: { name: 'dataDonateDestination', value: 'ADCES' } });
    dataDonateDestination().simulate('keyDown', { keyCode: 40, key: 'Tab' }); // Tab away
    dataDonateDestination().simulate('keyUp', { keyCode: 40, key: 'Tab' }); // Tab away

    // Once options are chosen, data donate checkbox is disabled
    expect(dataDonateCheckbox().prop('disabled')).to.equal(true);

    // Submit the form
    nextButton().simulate('click');

    setTimeout(() => {
      expect(defaultProps.api.patient.post.callCount).to.equal(1);

      sinon.assert.calledWith(
        defaultProps.api.patient.post,
        { profile: {
          ...profile,
          patient: {
            ...profile.patient,
            birthday: '1990-01-01',
            diagnosisDate: '1995-02-02',
          },
        } },
      );

      sinon.assert.calledWith(
        defaultProps.api.invitation.send,
        'bigdata@tidepool.org',
      );

      sinon.assert.calledWith(
        defaultProps.api.invitation.send,
        'bigdata+ADCES@tidepool.org',
      );

      done();
    });
  });

  it('should allow creating a caregiver patient account profile', done => {
    const profile = {
      fullName: 'Jimmy Caregiver',
      patient: {
        fullName: 'Johnny Patient',
        birthday: 'Jan 1, 1990',
        diagnosisDate: 'Feb 2, 1995',
        diagnosisType: 'type1',
        isOtherPerson: true,
      },
    };

    // Next button is initially disabled
    const nextButton = () => wrapper.find('button#submit');
    expect(nextButton()).to.have.lengthOf(1);
    expect(nextButton().prop('disabled')).to.be.true;

    // Add name for account profile
    const firstNameInput = () => wrapper.find('input#firstName');
    expect(firstNameInput()).to.have.lengthOf(1);
    expect(firstNameInput().prop('value')).to.equal('');

    firstNameInput().simulate('change', { persist: noop, target: { name: 'firstName', value: profile.fullName.split(' ')[0] } });
    expect(firstNameInput().prop('value')).to.equal('Jimmy');

    const lastNameInput = () => wrapper.find('input#lastName');
    expect(lastNameInput()).to.have.lengthOf(1);
    expect(lastNameInput().prop('value')).to.equal('');

    lastNameInput().simulate('change', { persist: noop, target: { name: 'lastName', value: profile.fullName.split(' ')[1] } });
    expect(lastNameInput().prop('value')).to.equal('Caregiver');

    // Next button still disabled until we choose accountType and patient first/last names
    expect(nextButton().prop('disabled')).to.be.true;

    const personalAccountTypeInput = () => wrapper.find('input#accountType-1');
    expect(personalAccountTypeInput()).to.have.lengthOf(1);
    expect(personalAccountTypeInput().prop('checked')).to.be.false;

    personalAccountTypeInput().simulate('change', { persist: noop, target: { name: 'accountType', value: 'caregiver' } });
    expect(personalAccountTypeInput().prop('value')).to.equal('caregiver');

    // Add name for patient profile
    const patientFirstNameInput = () => wrapper.find('input#patientFirstName');
    expect(patientFirstNameInput()).to.have.lengthOf(1);
    expect(patientFirstNameInput().prop('value')).to.equal('');

    patientFirstNameInput().simulate('change', { persist: noop, target: { name: 'patientFirstName', value: profile.patient.fullName.split(' ')[0] } });
    expect(patientFirstNameInput().prop('value')).to.equal('Johnny');

    const patientLastNameInput = () => wrapper.find('input#patientLastName');
    expect(patientLastNameInput()).to.have.lengthOf(1);
    expect(patientLastNameInput().prop('value')).to.equal('');

    patientLastNameInput().simulate('change', { persist: noop, target: { name: 'patientLastName', value: profile.patient.fullName.split(' ')[1] } });
    expect(patientLastNameInput().prop('value')).to.equal('Patient');

    // Next button should now be enabled
    expect(nextButton().prop('disabled')).to.be.false;

    // Proceed to step 2 of flowFrom:
    nextButton().simulate('click');

    // Should be a back button, and a disabled 'Next' button
    const backButton = wrapper.find('button#back');
    expect(backButton).to.have.lengthOf(1);
    expect(nextButton().prop('disabled')).to.be.true;

    // Fill in birthday, diagnosisDate, and diagnosisType
    const birthdayInput = () => wrapper.find('input#birthday');
    expect(birthdayInput()).to.have.lengthOf(1);
    expect(birthdayInput().prop('value')).to.equal('');

    birthdayInput().simulate('change', { persist: noop, target: { name: 'birthday', value: profile.patient.birthday } });
    expect(birthdayInput().prop('value')).to.equal('Jan 1, 1990');

    const diagnosisDateInput = () => wrapper.find('input#diagnosisDate');
    expect(diagnosisDateInput()).to.have.lengthOf(1);
    expect(diagnosisDateInput().prop('value')).to.equal('');

    diagnosisDateInput().simulate('change', { persist: noop, target: { name: 'diagnosisDate', value: profile.patient.diagnosisDate } });
    expect(diagnosisDateInput().prop('value')).to.equal('Feb 2, 1995');

    const diagnosisTypeSelect = () => wrapper.find('select#diagnosisType');
    expect(diagnosisTypeSelect()).to.have.lengthOf(1);
    expect(diagnosisTypeSelect().prop('value')).to.equal('');

    diagnosisTypeSelect().simulate('change', { persist: noop, target: { name: 'diagnosisType', value: profile.patient.diagnosisType } });
    expect(diagnosisTypeSelect().prop('value')).to.equal('type1');

    // Required fields all filled. Next button should now be enabled
    expect(nextButton().prop('disabled')).to.be.false;

    // // Share anonymized data
    const dataDonateCheckbox = () => wrapper.find('input#dataDonate');
    expect(dataDonateCheckbox()).to.have.lengthOf(1);
    expect(dataDonateCheckbox().prop('checked')).to.equal(false);
    expect(dataDonateCheckbox().prop('disabled')).to.equal(false);

    const dataDonateDestination = () => wrapper.find('MultiSelect input').hostNodes();
    expect(dataDonateDestination()).to.have.lengthOf(1);
    expect(dataDonateDestination().prop('value')).to.equal('');
    expect(dataDonateDestination().prop('disabled')).to.equal(true);

    // Check the donate checkbox to enable the donation destination multi-select
    dataDonateCheckbox().simulate('change', { persist: noop, target: { name: 'dataDonate', checked: true, value: true } });
    expect(dataDonateCheckbox().prop('checked')).to.equal(true);
    expect(dataDonateDestination().prop('disabled')).to.equal(false);

    // Set donate destinations
    dataDonateDestination().simulate('change', { persist: noop, target: { name: 'dataDonateDestination', value: 'ADCES' } });
    dataDonateDestination().simulate('keyDown', { keyCode: 40, key: 'Tab' }); // Tab away
    dataDonateDestination().simulate('keyUp', { keyCode: 40, key: 'Tab' }); // Tab away

    // Once options are chosen, data donate checkbox is disabled
    expect(dataDonateCheckbox().prop('disabled')).to.equal(true);

    // Submit the form
    nextButton().simulate('click');

    setTimeout(() => {
      expect(defaultProps.api.patient.post.callCount).to.equal(1);

      sinon.assert.calledWith(
        defaultProps.api.patient.post,
        { profile: {
          ...profile,
          patient: {
            ...profile.patient,
            birthday: '1990-01-01',
            diagnosisDate: '1995-02-02',
          },
        } },
      );

      sinon.assert.calledWith(
        defaultProps.api.invitation.send,
        'bigdata@tidepool.org',
      );

      sinon.assert.calledWith(
        defaultProps.api.invitation.send,
        'bigdata+ADCES@tidepool.org',
      );

      done();
    });
  });

  it('should allow creating a view-only account profile', done => {
    const profile = {
      fullName: 'Kathy Viewonly',
      patient: {},
    };

    // Next button is initially disabled
    const nextButton = () => wrapper.find('button#submit');
    expect(nextButton()).to.have.lengthOf(1);
    expect(nextButton().prop('disabled')).to.be.true;

    // Add name for account profile
    const firstNameInput = () => wrapper.find('input#firstName');
    expect(firstNameInput()).to.have.lengthOf(1);
    expect(firstNameInput().prop('value')).to.equal('');

    firstNameInput().simulate('change', { persist: noop, target: { name: 'firstName', value: profile.fullName.split(' ')[0] } });
    expect(firstNameInput().prop('value')).to.equal('Kathy');

    const lastNameInput = () => wrapper.find('input#lastName');
    expect(lastNameInput()).to.have.lengthOf(1);
    expect(lastNameInput().prop('value')).to.equal('');

    lastNameInput().simulate('change', { persist: noop, target: { name: 'lastName', value: profile.fullName.split(' ')[1] } });
    expect(lastNameInput().prop('value')).to.equal('Viewonly');

    // Next button still disabled until we choose accountType and patient first/last names
    expect(nextButton().prop('disabled')).to.be.true;

    const personalAccountTypeInput = () => wrapper.find('input#accountType-2');
    expect(personalAccountTypeInput()).to.have.lengthOf(1);
    expect(personalAccountTypeInput().prop('checked')).to.be.false;

    personalAccountTypeInput().simulate('change', { persist: noop, target: { name: 'accountType', value: 'viewOnly' } });
    expect(personalAccountTypeInput().prop('value')).to.equal('viewOnly');

    // Next button should now be enabled
    expect(nextButton().prop('disabled')).to.be.false;

    // Submit the form
    nextButton().simulate('click');

    setTimeout(() => {
      expect(defaultProps.api.patient.post.callCount).to.equal(1);

      sinon.assert.calledWith(
        defaultProps.api.patient.post,
        { profile },
      );

      done();
    });
  });
});
