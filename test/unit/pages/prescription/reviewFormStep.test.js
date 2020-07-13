import _ from 'lodash';

import reviewFormStep from '../../../../app/pages/prescription/reviewFormStep';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

const expect = chai.expect;

const meta = {
  training: { value: true },
  initialSettings: {
    suspendThreshold: { value: { value: true } },
    insulinModel: { value: true },
    basalRateMaximum: { value: { value: true } },
    bolusAmountMaximum: { value: { value: true } },
    bloodGlucoseTargetSchedule: { value: true },
    basalRateSchedule: { value: true },
    carbohydrateRatioSchedule: { value: true },
    insulinSensitivitySchedule: { value: true },
  },
  therapySettingsReviewed: { valid: true, value: true }
};

const handlers = {
  activeStepUpdate: sinon.stub(),
};

const invalidateMeta = fieldPath => _.set({ ...meta }, fieldPath, { valid: false });

describe.only('reviewFormStep', function() {
  afterEach(() => {
    handlers.activeStepUpdate.resetHistory();
  });

  it('should export a reviewFormStep function', function() {
    expect(reviewFormStep).to.be.a('function');
  });

  it('should include the step label', () => {
    expect(reviewFormStep().label).to.equal('Review and Send Prescription');
  });

  it('should include the custom next button text', () => {
    expect(reviewFormStep().completeText).to.equal('Send Prescription');
  });

  it('should include panel content with meta and handlers passed along', () => {
    const step = reviewFormStep(meta, handlers);
    expect(step.panelContent.type).to.be.a('function');
    expect(step.panelContent.props.meta).to.eql(meta);
    expect(step.panelContent.props.handlers).to.eql(handlers);
  });

  it('should disable the complete button if the `therapySettingsReviewed` field is invalid', () => {
    expect(reviewFormStep(meta).disableComplete).to.be.false;
    expect(reviewFormStep(invalidateMeta('therapySettingsReviewed')).disableComplete).to.be.true;
  });

  it('should not hide the back button', () => {
    expect(reviewFormStep().hideBack).to.be.undefined;
  });
});
