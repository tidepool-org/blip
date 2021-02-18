import _ from 'lodash';

import accountFormSteps from '../../../../app/pages/prescription/accountFormSteps';

/* global chai */
/* global describe */
/* global it */
/* global sinon */

const expect = chai.expect;

const values = {
  accountType: 'goodField',
  firstName: 'goodField',
  lastName: 'goodField',
  caregiverFirstName: 'goodField',
  caregiverLastName: 'goodField',
  birthday: 'goodField',
  email: 'goodField',
  emailConfirm: 'goodField',
};

const validateSyncAt = sinon.stub().callsFake((fieldKey, values) => {
  if (_.get(values, fieldKey) === 'badField') {
    throw('error');
  }
});

const schema = { validateSyncAt };

const invalidateValue = fieldPath => _.set({ ...values }, fieldPath, 'badField');

describe('accountFormSteps', function() {
  it('should export an accountFormSteps function', function() {
    expect(accountFormSteps).to.be.a('function');
  });

  it('should include the step label', () => {
    expect(accountFormSteps().label).to.equal('Create Patient Account');
  });

  it('should include the step subSteps with initialFocusedInput passed to 2nd substep', () => {
    const subSteps = accountFormSteps(schema, 'myInput', values).subSteps;

    expect(subSteps).to.be.an('array').and.have.lengthOf(3);

    _.each(subSteps, (subStep, index) => {
      expect(subStep.panelContent.type).to.be.a('function');
      if (index === 1) expect(subStep.panelContent.props.initialFocusedInput).to.equal('myInput');
    });
  });

  it('should disable the complete button for any invalid fields within a subStep', () => {
    const subSteps = accountFormSteps(schema, null, values).subSteps;
    expect(subSteps[0].disableComplete).to.be.false;
    expect(subSteps[1].disableComplete).to.be.false;
    expect(subSteps[2].disableComplete).to.be.false;

    expect(accountFormSteps(schema, null, invalidateValue('accountType')).subSteps[0].disableComplete).to.be.true;
    expect(accountFormSteps(schema, null, invalidateValue('firstName')).subSteps[1].disableComplete).to.be.true;
    expect(accountFormSteps(schema, null, invalidateValue('lastName')).subSteps[1].disableComplete).to.be.true;
    expect(accountFormSteps(schema, null, invalidateValue('birthday')).subSteps[1].disableComplete).to.be.true;
    expect(accountFormSteps(schema, null, invalidateValue('caregiverFirstName')).subSteps[2].disableComplete).to.be.true;
    expect(accountFormSteps(schema, null, invalidateValue('caregiverLastName')).subSteps[2].disableComplete).to.be.true;
    expect(accountFormSteps(schema, null, invalidateValue('email')).subSteps[2].disableComplete).to.be.true;
    expect(accountFormSteps(schema, null, invalidateValue('emailConfirm')).subSteps[2].disableComplete).to.be.true;
  });

  it('should hide the back button for the first subStep', () => {
    expect(accountFormSteps().subSteps[0].hideBack).to.be.true;
    expect(accountFormSteps().subSteps[1].hideBack).to.be.undefined;
    expect(accountFormSteps().subSteps[2].hideBack).to.be.undefined;
  });
});
