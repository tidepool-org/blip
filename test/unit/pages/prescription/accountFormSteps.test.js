import _ from 'lodash';

import { deviceIdMap, getFormSteps } from '../../../../app/pages/prescription/prescriptionFormConstants';

/* global chai */
/* global describe */
/* global it */
/* global sinon */

const expect = chai.expect;

const defaultValues = {
  accountType: 'goodField',
  firstName: 'goodField',
  lastName: 'goodField',
  caregiverFirstName: 'goodField',
  caregiverLastName: 'goodField',
  birthday: 'goodField',
  email: 'goodField',
  emailConfirm: 'goodField',
};

const defaultOptions = {
  skippedFields: [],
  isEditable: true,
  isPrescriber: true,
  initialFocusedInput: 'myInput',
  isSingleStepEdit: false,
  stepAsyncState: null,
};

const validateSyncAt = sinon.stub().callsFake((fieldKey, values) => {
  if (_.get(values, fieldKey) === 'badField') {
    throw('error');
  }
});

const handlers = {};

const devices = {
  cgms: [{ id: deviceIdMap.dexcomG6 }],
  pumps: [{ id: deviceIdMap.palmtree }],
};

const schema = { validateSyncAt };
const accountFormSteps = (values = defaultValues, options = defaultOptions) => _.find(getFormSteps(schema, devices, values, handlers, options), { key: 'account' });
const invalidateValue = fieldPath => _.set({ ...defaultValues }, fieldPath, 'badField');

describe('accountFormSteps', function() {
  it('should include the step label', () => {
    expect(accountFormSteps().label).to.equal('Create Patient Account');
  });

  it('should include the step subSteps with initialFocusedInput passed to 2nd substep', () => {
    const subSteps = accountFormSteps().subSteps;

    expect(subSteps).to.be.an('array').and.have.lengthOf(3);

    _.each(subSteps, (subStep, index) => {
      expect(subStep.panelContent.type).to.be.a('function');
      if (index === 1) expect(subStep.panelContent.props.initialFocusedInput).to.equal('myInput');
    });
  });

  it('should disable the complete button for any invalid fields within a subStep', () => {
    const subSteps = accountFormSteps().subSteps;
    expect(subSteps[0].disableComplete).to.be.false;
    expect(subSteps[1].disableComplete).to.be.false;
    expect(subSteps[2].disableComplete).to.be.false;

    expect(accountFormSteps(invalidateValue('accountType')).subSteps[0].disableComplete).to.be.true;
    expect(accountFormSteps(invalidateValue('firstName')).subSteps[1].disableComplete).to.be.true;
    expect(accountFormSteps(invalidateValue('lastName')).subSteps[1].disableComplete).to.be.true;
    expect(accountFormSteps(invalidateValue('birthday')).subSteps[1].disableComplete).to.be.true;
    expect(accountFormSteps(invalidateValue('caregiverFirstName')).subSteps[2].disableComplete).to.be.true;
    expect(accountFormSteps(invalidateValue('caregiverLastName')).subSteps[2].disableComplete).to.be.true;
    expect(accountFormSteps(invalidateValue('email')).subSteps[2].disableComplete).to.be.true;
    expect(accountFormSteps(invalidateValue('emailConfirm')).subSteps[2].disableComplete).to.be.true;
  });

  it('should hide the back button for the first subStep', () => {
    expect(accountFormSteps().subSteps[0].hideBack).to.be.true;
    expect(accountFormSteps().subSteps[1].hideBack).to.be.undefined;
    expect(accountFormSteps().subSteps[2].hideBack).to.be.undefined;
  });
});
