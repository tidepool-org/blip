import _ from 'lodash';

import { deviceIdMap, getFormSteps } from '../../../../app/pages/prescription/prescriptionFormConstants';

/* global chai */
/* global describe */
/* global it */
/* global sinon */

const expect = chai.expect;

const defaultValues = {
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
    pumpId: deviceIdMap.palmtree,
  },
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
const therapySettingsFormStep = (values = defaultValues, options = defaultOptions) => _.find(getFormSteps(schema, devices, values, handlers, options), { key: 'therapySettings' });
const invalidateValue = fieldPath => _.set({ ...defaultValues }, fieldPath, 'badField');

describe('therapySettingsFormStep', function() {
  it('should include the step label', () => {
    expect(therapySettingsFormStep().label).to.equal('Enter Therapy Settings');
  });

  it('should include panel content with pump passed along', () => {
    const subSteps = therapySettingsFormStep().subSteps;

    expect(subSteps).to.be.an('array').and.have.lengthOf(1);
    expect(subSteps[0].panelContent.type).to.be.a('function');
    expect(subSteps[0].panelContent.props.pump).to.eql(devices.pumps[0]);
  });

  it('should disable the complete button for any invalid fields', () => {
    expect(therapySettingsFormStep().subSteps[0].disableComplete).to.be.false;
    expect(therapySettingsFormStep(invalidateValue('training')).subSteps[0].disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.glucoseSafetyLimit')).subSteps[0].disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.insulinModel')).subSteps[0].disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.basalRateMaximum.value')).subSteps[0].disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.bolusAmountMaximum.value')).subSteps[0].disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.bloodGlucoseTargetSchedule')).subSteps[0].disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.bloodGlucoseTargetPhysicalActivity')).subSteps[0].disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.bloodGlucoseTargetPreprandial')).subSteps[0].disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.basalRateSchedule')).subSteps[0].disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.carbohydrateRatioSchedule')).subSteps[0].disableComplete).to.be.true;
    expect(therapySettingsFormStep(invalidateValue('initialSettings.insulinSensitivitySchedule')).subSteps[0].disableComplete).to.be.true;
  });

  it('should not hide the back button', () => {
    expect(therapySettingsFormStep().subSteps[0].hideBack).to.be.undefined;
  });
});
