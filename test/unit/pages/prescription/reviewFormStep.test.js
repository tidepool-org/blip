import _ from 'lodash';

import { deviceIdMap, getFormSteps } from '../../../../app/pages/prescription/prescriptionFormConstants';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

const expect = chai.expect;

const defaultValues = {
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
    pumpId: deviceIdMap.palmtree,
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

const handlers = {
  activeStepUpdate: sinon.stub(),
};

const devices = {
  cgms: [{ id: deviceIdMap.dexcomG6 }],
  pumps: [{ id: deviceIdMap.palmtree }],
};

const schema = { validateSyncAt };
const reviewFormStep = (values = defaultValues, options = defaultOptions) => _.find(getFormSteps(schema, devices, values, handlers, options), { key: 'review' });
const invalidateValue = fieldPath => _.set({ ...defaultValues }, fieldPath, 'badField');

describe('reviewFormStep', function() {
  afterEach(() => {
    handlers.activeStepUpdate.resetHistory();
  });

  it('should include the step label for a clinician with prescriber permissions', () => {
    expect(reviewFormStep().label).to.equal('Review and Send Prescription');
  });

  it('should include the step label for a clinician without prescriber permissions', () => {
    expect(reviewFormStep(defaultValues, { ...defaultOptions, isPrescriber: false }).label).to.equal('Review and Save Prescription');
  });

  it('should include the custom next button text for a clinician with prescriber permissions', () => {
    expect(reviewFormStep().subSteps[0].completeText).to.equal('Send Final Prescription');
  });

  it('should include the custom next button text for a clinician without prescriber permissions', () => {
    expect(reviewFormStep(defaultValues, { ...defaultOptions, isPrescriber: false }).subSteps[0].completeText).to.equal('Save Pending Prescription');
  });

  it('should include panel content with pump and handlers passed along as props', () => {
    const subSteps = reviewFormStep().subSteps;

    expect(subSteps).to.be.an('array').and.have.lengthOf(1);
    expect(subSteps[0].panelContent.type).to.be.a('function');
    expect(subSteps[0].panelContent.props.pump).to.eql(devices.pumps[0]);
    expect(subSteps[0].panelContent.props.handlers).to.eql(handlers);
  });

  it('should disable the complete button if the any of the prescriptions fields are invalid', () => {
    expect(reviewFormStep().subSteps[0].disableComplete).to.be.false;
    expect(reviewFormStep(invalidateValue('accountType')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('firstName')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('lastName')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('birthday')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('caregiverFirstName')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('caregiverLastName')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('email')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('emailConfirm')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('phoneNumber.number')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('mrn')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('sex')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('calculator.method')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('calculator.totalDailyDose')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('calculator.totalDailyDoseScaleFactor')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('calculator.weight')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('calculator.weightUnits')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('calculator.recommendedBasalRate')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('calculator.recommendedInsulinSensitivity')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('calculator.recommendedCarbohydrateRatio')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('training')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('initialSettings.pumpId')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('initialSettings.cgmId')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('initialSettings.glucoseSafetyLimit')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('initialSettings.insulinModel')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('initialSettings.basalRateMaximum')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('initialSettings.bolusAmountMaximum')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('initialSettings.bloodGlucoseTargetSchedule')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('initialSettings.bloodGlucoseTargetPhysicalActivity')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('initialSettings.bloodGlucoseTargetPreprandial')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('initialSettings.basalRateSchedule')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('initialSettings.carbohydrateRatioSchedule')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('initialSettings.insulinSensitivitySchedule')).subSteps[0].disableComplete).to.be.true;
    expect(reviewFormStep(invalidateValue('therapySettingsReviewed')).subSteps[0].disableComplete).to.be.true;
  });

  it('should not hide the back button', () => {
    expect(reviewFormStep().subSteps[0].hideBack).to.be.undefined;
  });
});
