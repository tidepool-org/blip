import _ from 'lodash';

import therapySettingsFormSteps from '../../../../app/pages/prescription/therapySettingsFormSteps';

/* global chai */
/* global describe */
/* global it */

const expect = chai.expect;

const meta = {
  training: { valid: true },
  initialSettings: {
    suspendThreshold: { value: { valid: true } },
    insulinType: { valid: true },
    basalRateMaximum: { value: { valid: true } },
    bolusAmountMaximum: { value: { valid: true } },
    bloodGlucoseTargetSchedule: { valid: true },
    basalRateSchedule: { valid: true },
    carbohydrateRatioSchedule: { valid: true },
    insulinSensitivitySchedule: { valid: true },
  },
};

const invalidateMeta = fieldPath => _.set({ ...meta }, fieldPath, { valid: false });

describe('therapySettingsFormSteps', function() {
  it('should export a therapySettingsFormSteps function', function() {
    expect(therapySettingsFormSteps).to.be.a('function');
  });

  it('should include the step label', () => {
    expect(therapySettingsFormSteps().label).to.equal('Enter Therapy Settings');
  });

  it('should include panel content with meta passed along', () => {
    const step = therapySettingsFormSteps(meta);
    expect(step.panelContent.type).to.be.a('function');
    expect(step.panelContent.props.meta).to.eql(meta);
  });

  it('should disable the complete button for any invalid fields', () => {
    expect(therapySettingsFormSteps(meta).disableComplete).to.be.false;
    expect(therapySettingsFormSteps(invalidateMeta('training')).disableComplete).to.be.true;
    expect(therapySettingsFormSteps(invalidateMeta('initialSettings.suspendThreshold.value')).disableComplete).to.be.true;
    expect(therapySettingsFormSteps(invalidateMeta('initialSettings.insulinType')).disableComplete).to.be.true;
    expect(therapySettingsFormSteps(invalidateMeta('initialSettings.basalRateMaximum.value')).disableComplete).to.be.true;
    expect(therapySettingsFormSteps(invalidateMeta('initialSettings.bolusAmountMaximum.value')).disableComplete).to.be.true;
    expect(therapySettingsFormSteps(invalidateMeta('initialSettings.bloodGlucoseTargetSchedule')).disableComplete).to.be.true;
    expect(therapySettingsFormSteps(invalidateMeta('initialSettings.basalRateSchedule')).disableComplete).to.be.true;
    expect(therapySettingsFormSteps(invalidateMeta('initialSettings.carbohydrateRatioSchedule')).disableComplete).to.be.true;
    expect(therapySettingsFormSteps(invalidateMeta('initialSettings.insulinSensitivitySchedule')).disableComplete).to.be.true;
  });

  it('should not hide the back button', () => {
    expect(therapySettingsFormSteps().hideBack).to.be.undefined;
  });
});
