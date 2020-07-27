import _ from 'lodash';

import therapySettingsFormStep from '../../../../app/pages/prescription/therapySettingsFormStep';

/* global chai */
/* global describe */
/* global it */

const expect = chai.expect;

const meta = {
  training: { valid: true },
  initialSettings: {
    suspendThreshold: { value: { valid: true } },
    // insulinModel: { valid: true },
    basalRateMaximum: { value: { valid: true } },
    bolusAmountMaximum: { value: { valid: true } },
    bloodGlucoseTargetSchedule: { valid: true },
    basalRateSchedule: { valid: true },
    carbohydrateRatioSchedule: { valid: true },
    insulinSensitivitySchedule: { valid: true },
  },
};

const invalidateMeta = fieldPath => _.set({ ...meta }, fieldPath, { valid: false });

describe('therapySettingsFormStep', function() {
  it('should export a therapySettingsFormStep function', function() {
    expect(therapySettingsFormStep).to.be.a('function');
  });

  it('should include the step label', () => {
    expect(therapySettingsFormStep().label).to.equal('Enter Therapy Settings');
  });

  it('should include panel content with meta passed along', () => {
    const step = therapySettingsFormStep(meta);
    expect(step.panelContent.type).to.be.a('function');
    expect(step.panelContent.props.meta).to.eql(meta);
  });

  it('should disable the complete button for any invalid fields', () => {
    expect(therapySettingsFormStep(meta).disableComplete).to.be.false;
    expect(therapySettingsFormStep(invalidateMeta('training')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateMeta('initialSettings.suspendThreshold.value')).disableComplete).to.be.true;
    // expect(therapySettingsFormStep(invalidateMeta('initialSettings.insulinModel')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateMeta('initialSettings.basalRateMaximum.value')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateMeta('initialSettings.bolusAmountMaximum.value')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateMeta('initialSettings.bloodGlucoseTargetSchedule')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateMeta('initialSettings.basalRateSchedule')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateMeta('initialSettings.carbohydrateRatioSchedule')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateMeta('initialSettings.insulinSensitivitySchedule')).disableComplete).to.be.true;
  });

  it('should not hide the back button', () => {
    expect(therapySettingsFormStep().hideBack).to.be.undefined;
  });
});
