/* global chai */
/* global describe */
/* global it */
import _ from 'lodash';

import profileFormSteps from '../../../../app/pages/prescription/profileFormSteps';

const expect = chai.expect;

const meta = {
  phoneNumber: {
    number: { valid: false },
  },
  mrn: { valid: true },
  sex: { valid: false },
  initialSettings: {
    pumpType: { valid: true },
    cgmType: { valid: false },
  },
};

describe('prescriptionSchema', function() {
  it('should export an profileFormSteps function', function() {
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
    expect(subSteps[0].disableComplete).to.be.true; // phoneNumber.number is invalid
    expect(subSteps[1].disableComplete).to.be.false; // mrn is valid
    expect(subSteps[2].disableComplete).to.be.true; // sex is invalid
    expect(subSteps[3].disableComplete).to.be.true; // pumpType is valid cgmType is invalid
  });

  it('should not hide the back button for the any subSteps', () => {
    expect(profileFormSteps().subSteps[0].hideBack).to.be.undefined;
    expect(profileFormSteps().subSteps[1].hideBack).to.be.undefined;
    expect(profileFormSteps().subSteps[2].hideBack).to.be.undefined;
    expect(profileFormSteps().subSteps[3].hideBack).to.be.undefined;
  });
});
