import _ from 'lodash';

import { deviceIdMap, getFormSteps } from '../../../../app/pages/prescription/prescriptionFormConstants';

/* global chai */
/* global describe */
/* global it */
/* global sinon */

const expect = chai.expect;

const defaultValues = {
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
  clearCalculator: sinon.stub(),
};

const devices = {
  cgms: [{ id: deviceIdMap.dexcomG6 }],
  pumps: [{ id: deviceIdMap.palmtree }],
};

const schema = { validateSyncAt };
const settingsCalculatorFormSteps = (values = defaultValues, options = defaultOptions) => _.find(getFormSteps(schema, devices, values, handlers, options), { key: 'calculator' });
const invalidateValue = fieldPath => _.set({ ...defaultValues }, fieldPath, 'badField');

describe('settingsCalculatorFormSteps', function() {
  it('should include the step label', () => {
    expect(settingsCalculatorFormSteps().label).to.equal('Therapy Settings Calculator');
  });

  it('should set the onSkip handler', () => {
    expect(settingsCalculatorFormSteps().onSkip).to.equal(handlers.clearCalculator);
  });

  it('should include the step subSteps', () => {
    const subSteps = settingsCalculatorFormSteps().subSteps;
    expect(subSteps).to.be.an('array').and.have.lengthOf(2);
  });

  it('should disable the complete button for any invalid fields within a subStep', () => {
    const subSteps = settingsCalculatorFormSteps().subSteps;
    expect(subSteps[0].disableComplete).to.be.false;
    expect(subSteps[1].disableComplete).to.be.false;

    expect(settingsCalculatorFormSteps(invalidateValue('calculator.method')).subSteps[0].disableComplete).to.be.true;
    expect(settingsCalculatorFormSteps(invalidateValue('calculator.totalDailyDose')).subSteps[1].disableComplete).to.be.true;
    expect(settingsCalculatorFormSteps(invalidateValue('calculator.totalDailyDoseScaleFactor')).subSteps[1].disableComplete).to.be.true;
    expect(settingsCalculatorFormSteps(invalidateValue('calculator.weight')).subSteps[1].disableComplete).to.be.true;
    expect(settingsCalculatorFormSteps(invalidateValue('calculator.weightUnits')).subSteps[1].disableComplete).to.be.true;
    expect(settingsCalculatorFormSteps(invalidateValue('calculator.recommendedBasalRate')).subSteps[1].disableComplete).to.be.true;
    expect(settingsCalculatorFormSteps(invalidateValue('calculator.recommendedInsulinSensitivity')).subSteps[1].disableComplete).to.be.true;
    expect(settingsCalculatorFormSteps(invalidateValue('calculator.recommendedCarbohydrateRatio')).subSteps[1].disableComplete).to.be.true;
  });

  it('should not hide the back button for the any subSteps', () => {
    expect(settingsCalculatorFormSteps().subSteps[0].hideBack).to.be.undefined;
    expect(settingsCalculatorFormSteps().subSteps[1].hideBack).to.be.undefined;
  });
});
