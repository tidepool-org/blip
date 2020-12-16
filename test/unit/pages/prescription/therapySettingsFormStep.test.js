import _ from 'lodash';

import therapySettingsFormStep from '../../../../app/pages/prescription/therapySettingsFormStep';

/* global chai */
/* global describe */
/* global it */
/* global sinon */

const expect = chai.expect;

const values = {
  training: 'goodField',
  initialSettings: {
    glucoseSafetyLimit: 'goodField',
    insulinModel: 'goodField',
    basalRateMaximum: { value: 'goodField' },
    bolusAmountMaximum: { value: 'goodField' },
    bloodGlucoseTargetSchedule: 'goodField',
    bloodGlucoseTargetPhysicalActivity: 'goodField',
    bloodGlucoseTargetPreprandial: 'goodField',
    basalRateSchedule: 'goodField',
    carbohydrateRatioSchedule: 'goodField',
    insulinSensitivitySchedule: 'goodField',
  },
};

const validateSyncAt = sinon.stub();
validateSyncAt
  .withArgs('goodField')
  .returns(true);

validateSyncAt
  .withArgs('badField')
  .throws();

const schema = { validateSyncAt };

const pump = { isPump: true };

const invalidateValue = fieldPath => _.set({ ...values }, fieldPath, 'badField');

describe('therapySettingsFormStep', function() {
  it('should export a therapySettingsFormStep function', function() {
    expect(therapySettingsFormStep).to.be.a('function');
  });

  it('should include the step label', () => {
    expect(therapySettingsFormStep().label).to.equal('Enter Therapy Settings');
  });

  it('should include panel content with pump passed along', () => {
    const step = therapySettingsFormStep(schema, pump, values);
    expect(step.panelContent.type).to.be.a('function');
    expect(step.panelContent.props.pump).to.eql(pump);
  });

  it('should disable the complete button for any invalid fields', () => {
    expect(therapySettingsFormStep(schema, pump, values).disableComplete).to.be.false;
    expect(therapySettingsFormStep(invalidateValue('training')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.glucoseSafetyLimit')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.insulinModel')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.basalRateMaximum.value')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.bolusAmountMaximum.value')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.bloodGlucoseTargetSchedule')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.bloodGlucoseTargetPhysicalActivity')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.bloodGlucoseTargetPreprandial')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.basalRateSchedule')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.carbohydrateRatioSchedule')).disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.insulinSensitivitySchedule')).disableComplete).to.be.true;
  });

  it('should not hide the back button', () => {
    expect(therapySettingsFormStep().hideBack).to.be.undefined;
  });
});
