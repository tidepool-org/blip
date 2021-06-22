import * as formUtils from '../../../../app/core/forms';
import get from 'lodash/get';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */

const expect = chai.expect;

describe('forms', function() {
  const errors = {
    touchedAndError: 'error!',
    touchedAndNoError: undefined,
    notTouchedAndError: 'error!',
    notTouchedAndNoError: undefined,
    initiallySetAndError: 'error!',
    notInitiallySetAndError: 'error!',
  };

  const touched = {
    touchedAndError: true,
    touchedAndNoError: true,
    notTouchedAndError: undefined,
    notTouchedAndNoError: undefined,
    initiallySetAndError: undefined,
    notInitiallySetAndError: undefined,
  };

  const initialValues = {
    touchedAndError: undefined,
    touchedAndNoError: undefined,
    notTouchedAndError: undefined,
    notTouchedAndNoError: undefined,
    initiallySetAndError: 'foo',
    notInitiallySetAndError: undefined,
  };

  let formikContext = {
    errors,
    touched,
    initialValues,
  };


  const validateSyncAt = sinon.stub();
  validateSyncAt
    .withArgs('goodField')
    .returns(true);

  validateSyncAt
    .withArgs('great.field')
    .returns(true);

  validateSyncAt
    .withArgs('badField')
    .throws();

  const schema = { validateSyncAt };

  beforeEach(() => {
    schema.validateSyncAt.resetHistory();
  });

  describe('fieldsAreValid', () => {
    it('should return `true` when all provided fields are valid', () => {
      expect(formUtils.fieldsAreValid(['goodField', 'great.field'], schema, {})).to.be.true;
    });

    it('should return `false` when at least one of the provided fields are not valid', () => {
      expect(formUtils.fieldsAreValid(['goodField', 'badField'], schema, {})).to.be.false;
    });
  });

  describe('getFieldError', () => {
    it('should return `null` when field has not been touched and is not in an error state', () => {
      expect(formUtils.getFieldError('notTouchedAndNoError', formikContext)).to.be.null;
    });

    it('should return `null` when field has not been touched and is in an error state', () => {
      expect(formUtils.getFieldError('notTouchedAndError', formikContext)).to.be.null;
    });

    it('should return an error when field has not been touched and is in an error state, and the forceTouched argument is `true`', () => {
      expect(formUtils.getFieldError('notTouchedAndError', formikContext, true)).to.equal('error!');
    });

    it('should return `null` when field has been touched and is not in an error state', () => {
      expect(formUtils.getFieldError('touchedAndNoError', formikContext)).to.be.null;
    });

    it('should return an error string when field has been touched and is in an error state', () => {
      expect(formUtils.getFieldError('touchedAndError', formikContext)).to.equal('error!');
    });

    it('should return an error string when field has been initially set and is in an error state', () => {
      expect(formUtils.getFieldError('initiallySetAndError', formikContext)).to.equal('error!');
    });

    it('should return `null` when field has not been initially set and is in an error state', () => {
      expect(formUtils.getFieldError('notInitiallySetAndError', formikContext)).to.be.null;
    });
  });

  describe('getThresholdWarning', () => {
    const threshold = {
      low: { value: 10, message: 'Too low!' },
      high: { value: 50, message: 'Too high!' },
    };

    it('should return the low threshold message if provided value is < the low threshold', () => {
      expect(formUtils.getThresholdWarning(9, threshold)).to.equal('Too low!');
    });

    it('should return the high threshold message if provided value is > the high threshold', () => {
      expect(formUtils.getThresholdWarning(51, threshold)).to.equal('Too high!');
    });

    it('should return `null` if provided value is not outside the thresholds', () => {
      expect(formUtils.getThresholdWarning(10, threshold)).to.equal(null);
      expect(formUtils.getThresholdWarning(50, threshold)).to.equal(null);
    });

    it('should return `null` if non-numeric value is passed in', () => {
      expect(formUtils.getThresholdWarning('', threshold)).to.equal(null);
      expect(formUtils.getThresholdWarning('6', threshold)).to.equal(null);
    });
  });

  describe('getCommonFormikFieldProps', () => {
    it('should return appropriate props for a given fieldpath from formikContext', () => {
      const fieldpath = 'user.name';
      formikContext = {
        handleChange: sinon.stub(),
        handleBlur: sinon.stub(),
        errors: { [fieldpath]: 'name is silly'},
        touched: { [fieldpath]: true },
        values: { [fieldpath]: 'Fooey McBear' },
      };

      expect (formUtils.getCommonFormikFieldProps(fieldpath, formikContext)).to.eql({
        id: 'user.name',
        name: 'user.name',
        onChange: formikContext.handleChange,
        onBlur: formikContext.handleBlur,
        error: 'name is silly',
        value: 'Fooey McBear',
      })
    });

    it('should allow setting a custom value prop', () => {
      const fieldpath = 'user.name';
      formikContext = {
        handleChange: sinon.stub(),
        handleBlur: sinon.stub(),
        errors: { [fieldpath]: 'name is silly'},
        touched: { [fieldpath]: true },
        values: { [fieldpath]: 'Fooey McBear' },
      };

      expect (formUtils.getCommonFormikFieldProps(fieldpath, formikContext, 'myValue')).to.eql({
        id: 'user.name',
        name: 'user.name',
        onChange: formikContext.handleChange,
        onBlur: formikContext.handleBlur,
        error: 'name is silly',
        myValue: 'Fooey McBear',
      })
    });
  });
});
