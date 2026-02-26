import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
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
      user: {
        put: sinon.stub(),
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
        updatingUser: defaultWorkingState,
      },
    },
  };

  let store = mockStore(defaultState);

  const renderPage = (providedStore = store) => {
    store = providedStore;

    return render(
      <Provider store={providedStore}>
        <ToastProvider>
          <PatientNew {...defaultProps} />
        </ToastProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    renderPage();
  });

  afterEach(() => {
    defaultProps.api.invitation.send.resetHistory();
    defaultProps.api.patient.post.resetHistory();
  });

  it('should allow creating a personal patient account profile', async () => {
    const profile = {
      fullName: 'Johnny Patient',
      patient: {
        birthday: 'Jan 1, 1990',
        diagnosisDate: 'Feb 2, 1995',
        diagnosisType: 'type1',
      },
    };

    // Next button is initially disabled
    const nextButton = () => document.querySelector('button#submit');
    expect(nextButton()).to.exist;
    expect(nextButton().disabled).to.be.true;

    // Add name for account profile
    const firstNameInput = () => document.querySelector('input#firstName');
    expect(firstNameInput()).to.exist;
    expect(firstNameInput().value).to.equal('');

    fireEvent.change(firstNameInput(), { target: { name: 'firstName', value: profile.fullName.split(' ')[0] } });
    expect(firstNameInput().value).to.equal('Johnny');

    const lastNameInput = () => document.querySelector('input#lastName');
    expect(lastNameInput()).to.exist;
    expect(lastNameInput().value).to.equal('');

    fireEvent.change(lastNameInput(), { target: { name: 'lastName', value: profile.fullName.split(' ')[1] } });
    expect(lastNameInput().value).to.equal('Patient');

    // Next button still disabled until we choose accountType
    expect(nextButton().disabled).to.be.true;

    const personalAccountTypeInput = () => document.querySelector('input#accountType-0');
    expect(personalAccountTypeInput()).to.exist;
    expect(personalAccountTypeInput().checked).to.be.false;

    fireEvent.click(personalAccountTypeInput());
    expect(personalAccountTypeInput().value).to.equal('personal');

    // Next button should now be enabled
    expect(nextButton().disabled).to.be.false;

    // Proceed to step 2 of flowFrom:
    fireEvent.click(nextButton());

    // Should be a back button, and a disabled 'Next' button
    const backButton = document.querySelector('button#back');
    expect(backButton).to.exist;
    expect(nextButton().disabled).to.be.true;

    // Fill in birthday, diagnosisDate, and diagnosisType
    const birthdayInput = () => document.querySelector('input#birthday');
    expect(birthdayInput()).to.exist;
    expect(birthdayInput().value).to.equal('');

    fireEvent.change(birthdayInput(), { target: { name: 'birthday', value: profile.patient.birthday } });
    expect(birthdayInput().value).to.equal('Jan 1, 1990');

    const diagnosisDateInput = () => document.querySelector('input#diagnosisDate');
    expect(diagnosisDateInput()).to.exist;
    expect(diagnosisDateInput().value).to.equal('');

    fireEvent.change(diagnosisDateInput(), { target: { name: 'diagnosisDate', value: profile.patient.diagnosisDate } });
    expect(diagnosisDateInput().value).to.equal('Feb 2, 1995');

    const diagnosisTypeSelect = () => document.querySelector('select#diagnosisType');
    expect(diagnosisTypeSelect()).to.exist;
    expect(diagnosisTypeSelect().value).to.equal('');

    fireEvent.change(diagnosisTypeSelect(), { target: { name: 'diagnosisType', value: profile.patient.diagnosisType } });
    expect(diagnosisTypeSelect().value).to.equal('type1');

    // Required fields all filled. Next button should now be enabled
    expect(nextButton().disabled).to.be.false;

    // Submit the form
    fireEvent.click(nextButton());

    await waitFor(() => {
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
    });
  });

  it('should allow creating a caregiver patient account profile', async () => {
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
    const nextButton = () => document.querySelector('button#submit');
    expect(nextButton()).to.exist;
    expect(nextButton().disabled).to.be.true;

    // Add name for account profile
    const firstNameInput = () => document.querySelector('input#firstName');
    expect(firstNameInput()).to.exist;
    expect(firstNameInput().value).to.equal('');

    fireEvent.change(firstNameInput(), { target: { name: 'firstName', value: profile.fullName.split(' ')[0] } });
    expect(firstNameInput().value).to.equal('Jimmy');

    const lastNameInput = () => document.querySelector('input#lastName');
    expect(lastNameInput()).to.exist;
    expect(lastNameInput().value).to.equal('');

    fireEvent.change(lastNameInput(), { target: { name: 'lastName', value: profile.fullName.split(' ')[1] } });
    expect(lastNameInput().value).to.equal('Caregiver');

    // Next button still disabled until we choose accountType and patient first/last names
    expect(nextButton().disabled).to.be.true;

    const caregiverAccountTypeInput = () => document.querySelector('input#accountType-1');
    expect(caregiverAccountTypeInput()).to.exist;
    expect(caregiverAccountTypeInput().checked).to.be.false;

    fireEvent.click(caregiverAccountTypeInput());
    expect(caregiverAccountTypeInput().value).to.equal('caregiver');

    // Add name for patient profile
    const patientFirstNameInput = () => document.querySelector('input#patientFirstName');
    await waitFor(() => {
      expect(patientFirstNameInput()).to.exist;
    });
    expect(patientFirstNameInput().value).to.equal('');

    fireEvent.change(patientFirstNameInput(), { target: { name: 'patientFirstName', value: profile.patient.fullName.split(' ')[0] } });
    expect(patientFirstNameInput().value).to.equal('Johnny');

    const patientLastNameInput = () => document.querySelector('input#patientLastName');
    expect(patientLastNameInput()).to.exist;
    expect(patientLastNameInput().value).to.equal('');

    fireEvent.change(patientLastNameInput(), { target: { name: 'patientLastName', value: profile.patient.fullName.split(' ')[1] } });
    expect(patientLastNameInput().value).to.equal('Patient');

    // Next button should now be enabled
    expect(nextButton().disabled).to.be.false;

    // Proceed to step 2 of flowFrom:
    fireEvent.click(nextButton());

    // Should be a back button, and a disabled 'Next' button
    const backButton = document.querySelector('button#back');
    expect(backButton).to.exist;
    expect(nextButton().disabled).to.be.true;

    // Fill in birthday, diagnosisDate, and diagnosisType
    const birthdayInput = () => document.querySelector('input#birthday');
    expect(birthdayInput()).to.exist;
    expect(birthdayInput().value).to.equal('');

    fireEvent.change(birthdayInput(), { target: { name: 'birthday', value: profile.patient.birthday } });
    expect(birthdayInput().value).to.equal('Jan 1, 1990');

    const diagnosisDateInput = () => document.querySelector('input#diagnosisDate');
    expect(diagnosisDateInput()).to.exist;
    expect(diagnosisDateInput().value).to.equal('');

    fireEvent.change(diagnosisDateInput(), { target: { name: 'diagnosisDate', value: profile.patient.diagnosisDate } });
    expect(diagnosisDateInput().value).to.equal('Feb 2, 1995');

    const diagnosisTypeSelect = () => document.querySelector('select#diagnosisType');
    expect(diagnosisTypeSelect()).to.exist;
    expect(diagnosisTypeSelect().value).to.equal('');

    fireEvent.change(diagnosisTypeSelect(), { target: { name: 'diagnosisType', value: profile.patient.diagnosisType } });
    expect(diagnosisTypeSelect().value).to.equal('type1');

    // Required fields all filled. Next button should now be enabled
    expect(nextButton().disabled).to.be.false;

    // Submit the form
    fireEvent.click(nextButton());

    await waitFor(() => {
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
    });
  });

  it('should allow creating a view-only account profile', async () => {
    const profile = {
      fullName: 'Kathy Viewonly',
      patient: {},
    };

    // Next button is initially disabled
    const nextButton = () => document.querySelector('button#submit');
    expect(nextButton()).to.exist;
    expect(nextButton().disabled).to.be.true;

    // Add name for account profile
    const firstNameInput = () => document.querySelector('input#firstName');
    expect(firstNameInput()).to.exist;
    expect(firstNameInput().value).to.equal('');

    fireEvent.change(firstNameInput(), { target: { name: 'firstName', value: profile.fullName.split(' ')[0] } });
    expect(firstNameInput().value).to.equal('Kathy');

    const lastNameInput = () => document.querySelector('input#lastName');
    expect(lastNameInput()).to.exist;
    expect(lastNameInput().value).to.equal('');

    fireEvent.change(lastNameInput(), { target: { name: 'lastName', value: profile.fullName.split(' ')[1] } });
    expect(lastNameInput().value).to.equal('Viewonly');

    // Next button still disabled until we choose accountType and patient first/last names
    expect(nextButton().disabled).to.be.true;

    const viewOnlyAccountTypeInput = () => document.querySelector('input#accountType-2');
    expect(viewOnlyAccountTypeInput()).to.exist;
    expect(viewOnlyAccountTypeInput().checked).to.be.false;

    fireEvent.click(viewOnlyAccountTypeInput());
    expect(viewOnlyAccountTypeInput().value).to.equal('viewOnly');

    // Next button should now be enabled
    expect(nextButton().disabled).to.be.false;

    // Submit the form
    fireEvent.click(nextButton());

    await waitFor(() => {
      expect(defaultProps.api.user.put.callCount).to.equal(1);
      sinon.assert.calledWith(
        defaultProps.api.user.put,
        { preferences: {}, profile: { fullName: 'Kathy Viewonly' }, userid: 'a1b2c3' },
      );
    });
  });
});
