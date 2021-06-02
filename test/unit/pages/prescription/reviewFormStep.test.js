import _ from 'lodash';

import reviewFormStep from '../../../../app/pages/prescription/reviewFormStep';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

const expect = chai.expect;

const values = {
  accountType: 'goodField',
  firstName: 'goodField',
  lastName: 'goodField',
  birthday: 'goodField',
  caregiverFirstName: 'goodField',
  caregiverLastName: 'goodField',
  email: 'goodField',
  emailConfirm: 'goodField',
  phoneNumber: {
    number: 'goodField',
  },
  mrn: 'goodField',
  sex: 'goodField',
  training: 'goodField',
  calculator: {
    method: 'goodField',
    totalDailyDose: 'goodField',
    totalDailyDoseScaleFactor: 'goodField',
    weight: 'goodField',
    weightUnits: 'goodField',
    recommendedBasalRate: 'goodField',
    recommendedInsulinSensitivity: 'goodField',
    recommendedCarbohydrateRatio: 'goodField',
  },
  initialSettings: {
    pumpId: 'goodField',
    cgmId: 'goodField',
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
  therapySettingsReviewed: 'goodField',
};

const validateSyncAt = sinon.stub().callsFake((fieldKey, values) => {
  if (_.get(values, fieldKey) === 'badField') {
    throw('error');
  }
});

const schema = { validateSyncAt };

const invalidateValue = fieldPath => _.set({ ...values }, fieldPath, 'badField');

const pump = { id: 'myPump' };

const handlers = {
  activeStepUpdate: sinon.stub(),
};

describe('reviewFormStep', function() {
  afterEach(() => {
    handlers.activeStepUpdate.resetHistory();
  });

  it('should export a reviewFormStep function', function() {
    expect(reviewFormStep).to.be.a('function');
  });

  it('should include the step label', () => {
    expect(reviewFormStep().label).to.equal('Review and Save Prescription');
  });

  it('should include the custom next button text', () => {
    expect(reviewFormStep().completeText).to.equal('Save Prescription');
  });

  it('should include panel content with pump and handlers passed along as props', () => {
    const step = reviewFormStep(schema, pump, handlers, values);
    expect(step.panelContent.type).to.be.a('function');
    expect(step.panelContent.props.pump).to.eql(pump);
    expect(step.panelContent.props.handlers).to.eql(handlers);
  });

  it('should disable the complete button if the any of the prescriptions fields are invalid', () => {
    expect(reviewFormStep(schema, pump, handlers, values).disableComplete).to.be.false;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('accountType')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('firstName')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('lastName')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('birthday')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('caregiverFirstName')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('caregiverLastName')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('email')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('emailConfirm')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('phoneNumber.number')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('mrn')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('sex')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('calculator.method')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('calculator.totalDailyDose')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('calculator.totalDailyDoseScaleFactor')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('calculator.weight')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('calculator.weightUnits')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('calculator.recommendedBasalRate')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('calculator.recommendedInsulinSensitivity')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('calculator.recommendedCarbohydrateRatio')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('training')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('initialSettings.pumpId')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('initialSettings.cgmId')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('initialSettings.glucoseSafetyLimit')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('initialSettings.insulinModel')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('initialSettings.basalRateMaximum')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('initialSettings.bolusAmountMaximum')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('initialSettings.bloodGlucoseTargetSchedule')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('initialSettings.bloodGlucoseTargetPhysicalActivity')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('initialSettings.bloodGlucoseTargetPreprandial')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('initialSettings.basalRateSchedule')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('initialSettings.carbohydrateRatioSchedule')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('initialSettings.insulinSensitivitySchedule')).disableComplete).to.be.true;
    expect(reviewFormStep(schema, pump, handlers, invalidateValue('therapySettingsReviewed')).disableComplete).to.be.true;
  });

  it('should not hide the back button', () => {
    expect(reviewFormStep().hideBack).to.be.undefined;
  });
});
