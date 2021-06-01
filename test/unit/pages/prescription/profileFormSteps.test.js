import _ from 'lodash';

import profileFormSteps from '../../../../app/pages/prescription/profileFormSteps';

/* global chai */
/* global describe */
/* global it */
/* global sinon */

const expect = chai.expect;

const values = {
  phoneNumber: {
    number: 'goodField',
  },
  mrn: 'goodField',
  sex: 'goodField',
  initialSettings: {
    pumpId: 'goodField',
    cgmId: 'goodField',
  },
};

const validateSyncAt = sinon.stub().callsFake((fieldKey, values) => {
  if (_.get(values, fieldKey) === 'badField') {
    throw('error');
  }
});

const schema = { validateSyncAt };

const invalidateValue = fieldPath => _.set({ ...values }, fieldPath, 'badField');

describe('profileFormSteps', function() {
  it('should export a profileFormSteps function', function() {
    expect(profileFormSteps).to.be.a('function');
  });

  it('should include the step label', () => {
    expect(profileFormSteps().label).to.equal('Complete Patient Profile');
  });

  it('should include the step subSteps with devices passed to 4th substep', () => {
    const subSteps = profileFormSteps(schema, 'myDevices', values).subSteps;

    expect(subSteps).to.be.an('array').and.have.lengthOf(4);

    _.each(subSteps, (subStep, index) => {
      expect(subStep.panelContent.type).to.be.a('function');
      if (index === 3) expect(subStep.panelContent.props.devices).to.equal('myDevices');
    });
  });

  it('should disable the complete button for any invalid fields within a subStep', () => {
    const subSteps = profileFormSteps(schema, null, values).subSteps;
    expect(subSteps[0].disableComplete).to.be.false;
    expect(subSteps[1].disableComplete).to.be.false;
    expect(subSteps[2].disableComplete).to.be.false;
    expect(subSteps[3].disableComplete).to.be.false;

    expect(profileFormSteps(schema, null, invalidateValue('phoneNumber.number')).subSteps[0].disableComplete).to.be.true;
    expect(profileFormSteps(schema, null, invalidateValue('mrn')).subSteps[1].disableComplete).to.be.true;
    expect(profileFormSteps(schema, null, invalidateValue('sex')).subSteps[2].disableComplete).to.be.true;
    expect(profileFormSteps(schema, null, invalidateValue('initialSettings.pumpId')).subSteps[3].disableComplete).to.be.true;
    expect(profileFormSteps(schema, null, invalidateValue('initialSettings.cgmId')).subSteps[3].disableComplete).to.be.true;
  });

  it('should not hide the back button for the any subSteps', () => {
    expect(profileFormSteps().subSteps[0].hideBack).to.be.undefined;
    expect(profileFormSteps().subSteps[1].hideBack).to.be.undefined;
    expect(profileFormSteps().subSteps[2].hideBack).to.be.undefined;
    expect(profileFormSteps().subSteps[3].hideBack).to.be.undefined;
  });
});
