import _ from 'lodash';

import accountFormSteps from '../../../../app/pages/prescription/accountFormSteps';

/* global chai */
/* global describe */
/* global it */

const expect = chai.expect;

const meta = {
  // type: { valid: true },
  firstName: { valid: true },
  lastName: { valid: true },
  birthday: { valid: true },
  email: { valid: true },
  emailConfirm: { valid: true },
};

const invalidateMeta = fieldPath => _.set({ ...meta }, fieldPath, { valid: false });

describe('accountFormSteps', function() {
  it('should export an accountFormSteps function', function() {
    expect(accountFormSteps).to.be.a('function');
  });

  it('should include the step label', () => {
    expect(accountFormSteps().label).to.equal('Create Patient Account');
  });

  it('should include the step subSteps with meta passed along', () => {
    const subSteps = accountFormSteps(meta).subSteps;

    expect(subSteps).to.be.an('array').and.have.lengthOf(2);

    _.each(subSteps, subStep => {
      expect(subStep.panelContent.type).to.be.a('function');
      expect(subStep.panelContent.props.meta).to.eql(meta);
    });
  });

  it('should disable the complete button for any invalid fields within a subStep', () => {
    const subSteps = accountFormSteps(meta).subSteps;
    expect(subSteps[0].disableComplete).to.be.false;
    expect(subSteps[1].disableComplete).to.be.false;
    // expect(subSteps[2].disableComplete).to.be.false;

    // expect(accountFormSteps(invalidateMeta('type')).subSteps[0].disableComplete).to.be.true;
    expect(accountFormSteps(invalidateMeta('firstName')).subSteps[0].disableComplete).to.be.true;
    expect(accountFormSteps(invalidateMeta('lastName')).subSteps[0].disableComplete).to.be.true;
    expect(accountFormSteps(invalidateMeta('birthday')).subSteps[0].disableComplete).to.be.true;
    expect(accountFormSteps(invalidateMeta('email')).subSteps[1].disableComplete).to.be.true;
    expect(accountFormSteps(invalidateMeta('emailConfirm')).subSteps[1].disableComplete).to.be.true;
  });

  it('should hide the back button for the first subStep', () => {
    expect(accountFormSteps().subSteps[0].hideBack).to.be.true;
    expect(accountFormSteps().subSteps[1].hideBack).to.be.undefined;
    // expect(accountFormSteps().subSteps[2].hideBack).to.be.undefined;
  });
});
