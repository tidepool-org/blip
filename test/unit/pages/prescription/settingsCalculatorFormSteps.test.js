import _ from 'lodash';

import settingsCalculatorFormSteps from '../../../../app/pages/prescription/settingsCalculatorFormSteps';

/* global chai */
/* global describe */
/* global it */
/* global sinon */

const expect = chai.expect;

const values = {
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

const validateSyncAt = sinon.stub().callsFake((fieldKey, values) => {
  if (_.get(values, fieldKey) === 'badField') {
    throw('error');
  }
});

const schema = { validateSyncAt };

const handlers = {
  clearCalculator: sinon.stub(),
};

const invalidateValue = fieldPath => _.set({ ...values }, fieldPath, 'badField');

describe('settingsCalculatorFormSteps', function() {
  it('should export a settingsCalculatorFormSteps function', function() {
    expect(settingsCalculatorFormSteps).to.be.a('function');
  });

  it('should include the step label', () => {
    expect(settingsCalculatorFormSteps(schema, handlers, values).label).to.equal('Therapy Settings Calculator');
  });

  it('should set the onSkip handler', () => {
    expect(settingsCalculatorFormSteps(schema, handlers, values).onSkip).to.equal(handlers.clearCalculator);
  });

  it('should include the step subSteps', () => {
    const subSteps = settingsCalculatorFormSteps(schema, handlers, values).subSteps;
    expect(subSteps).to.be.an('array').and.have.lengthOf(2);
  });

  it('should disable the complete button for any invalid fields within a subStep', () => {
    const subSteps = settingsCalculatorFormSteps(schema, handlers, values).subSteps;
    expect(subSteps[0].disableComplete).to.be.false;
    expect(subSteps[1].disableComplete).to.be.false;

    expect(settingsCalculatorFormSteps(schema, handlers, invalidateValue('calculator.method')).subSteps[0].disableComplete).to.be.true;
    expect(settingsCalculatorFormSteps(schema, handlers, invalidateValue('calculator.totalDailyDose')).subSteps[1].disableComplete).to.be.true;
    expect(settingsCalculatorFormSteps(schema, handlers, invalidateValue('calculator.totalDailyDoseScaleFactor')).subSteps[1].disableComplete).to.be.true;
    expect(settingsCalculatorFormSteps(schema, handlers, invalidateValue('calculator.weight')).subSteps[1].disableComplete).to.be.true;
    expect(settingsCalculatorFormSteps(schema, handlers, invalidateValue('calculator.weightUnits')).subSteps[1].disableComplete).to.be.true;
    expect(settingsCalculatorFormSteps(schema, handlers, invalidateValue('calculator.recommendedBasalRate')).subSteps[1].disableComplete).to.be.true;
    expect(settingsCalculatorFormSteps(schema, handlers, invalidateValue('calculator.recommendedInsulinSensitivity')).subSteps[1].disableComplete).to.be.true;
    expect(settingsCalculatorFormSteps(schema, handlers, invalidateValue('calculator.recommendedCarbohydrateRatio')).subSteps[1].disableComplete).to.be.true;
  });

  it('should not hide the back button for the any subSteps', () => {
    expect(settingsCalculatorFormSteps(schema, handlers, values).subSteps[0].hideBack).to.be.undefined;
    expect(settingsCalculatorFormSteps(schema, handlers, values).subSteps[1].hideBack).to.be.undefined;
  });
});
