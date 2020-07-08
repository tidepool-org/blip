import _ from 'lodash';

import profileFormSteps from '../../../../app/pages/prescription/profileFormSteps';

/* global chai */
/* global describe */
/* global it */

const expect = chai.expect;

const meta = {
  phoneNumber: {
    number: { valid: true },
  },
  mrn: { valid: true },
  sex: { valid: true },
  initialSettings: {
    pumpId: { valid: true },
    cgmId: { valid: true },
  },
};

const invalidateMeta = fieldPath => _.set({ ...meta }, fieldPath, { valid: false });

describe('profileFormSteps', function() {
  it('should export a profileFormSteps function', function() {
    expect(profileFormSteps).to.be.a('function');
  });

  it('should include the step label', () => {
    expect(profileFormSteps().label).to.equal('Complete Patient Profile');
  });

  it('should include the step subSteps with meta passed along', () => {
    const subSteps = profileFormSteps(meta).subSteps;

    expect(subSteps).to.be.an('array').and.have.lengthOf(4);

    _.each(subSteps, subStep => {
      expect(subStep.panelContent.type).to.be.a('function');
      expect(subStep.panelContent.props.meta).to.eql(meta);
    });
  });

  it('should disable the complete button for any invalid fields within a subStep', () => {
    const subSteps = profileFormSteps(meta).subSteps;
    expect(subSteps[0].disableComplete).to.be.false;
    expect(subSteps[1].disableComplete).to.be.false;
    expect(subSteps[2].disableComplete).to.be.false;
    expect(subSteps[3].disableComplete).to.be.false;

    expect(profileFormSteps(invalidateMeta('phoneNumber.number')).subSteps[0].disableComplete).to.be.true;
    expect(profileFormSteps(invalidateMeta('mrn')).subSteps[1].disableComplete).to.be.true;
    expect(profileFormSteps(invalidateMeta('sex')).subSteps[2].disableComplete).to.be.true;
    expect(profileFormSteps(invalidateMeta('initialSettings.pumpId')).subSteps[3].disableComplete).to.be.true;
    expect(profileFormSteps(invalidateMeta('initialSettings.cgmId')).subSteps[3].disableComplete).to.be.true;
  });

  it('should not hide the back button for the any subSteps', () => {
    expect(profileFormSteps().subSteps[0].hideBack).to.be.undefined;
    expect(profileFormSteps().subSteps[1].hideBack).to.be.undefined;
    expect(profileFormSteps().subSteps[2].hideBack).to.be.undefined;
    expect(profileFormSteps().subSteps[3].hideBack).to.be.undefined;
  });
});
