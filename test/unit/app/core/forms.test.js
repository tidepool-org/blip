import * as formUtils from '../../../../app/core/forms';
import get from 'lodash/get';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */

const expect = chai.expect;

describe('forms', function() {
  const touchedAndError = {
    touched: true,
    error: 'error!',
  };

  const touchedAndNoError = {
    touched: true,
    error: null,
  };

  const notTouchedAndError = {
    touched: false,
    error: 'error!',
  };

  const notTouchedAndNoError = {
    touched: false,
    error: null,
  };

  const errorArray = {
    touched: true,
    error: [
      { foo: null },
      { bar: 'error!' },
    ],
  };

  const fieldsMeta = {
    firstName: { ...touchedAndError, value: 'foo' },
    phoneNumber: {
      countryCode: { ...notTouchedAndError, value: 'bar' },
      number: { ...touchedAndNoError, value: 'baz' },
      ext: { ...touchedAndNoError, value: 123 },
      isCellNumber: { ...notTouchedAndNoError, value: true },
    },
    other: {
      deeply: {
        nestedField: { ...notTouchedAndNoError, value: 'blip' },
      },
    },
  };

  const getFieldMeta = sinon.stub().callsFake(fieldName => get(fieldsMeta, fieldName));

  const schema = {
    fields: {
      firstName: {},
      phoneNumber: {
        fields: {
          countryCode: {},
          number: {},
          ext: {},
          isCellNumber: {},
        },
      },
      other: {
        fields: {
          deeply: {
            fields: {
              nestedField: {},
            },
          },
        },
      },
    },
  };

  beforeEach(() => {
    getFieldMeta.resetHistory();
  });

  describe('getFieldsMeta', () => {
    it('should return an object of field metadata keyed by provided `schema.fields`', () => {
      expect(formUtils.getFieldsMeta(schema, getFieldMeta).firstName).to.eql({
        ...touchedAndError,
        value: 'foo',
        valid: false,
      });
    });

    it('should key metadata of nested fields within of `schema.fields` in appropriate format', () => {
      expect(formUtils.getFieldsMeta(schema, getFieldMeta).phoneNumber.countryCode).to.eql({
        ...notTouchedAndError,
        value: 'bar',
        valid: false,
      });

      expect(formUtils.getFieldsMeta(schema, getFieldMeta).phoneNumber.number).to.eql({
        ...touchedAndNoError,
        value: 'baz',
        valid: true,
      });

      expect(formUtils.getFieldsMeta(schema, getFieldMeta).phoneNumber.ext).to.eql({
        ...touchedAndNoError,
        value: 123,
        valid: true,
      });

      expect(formUtils.getFieldsMeta(schema, getFieldMeta).phoneNumber.isCellNumber).to.eql({
        ...notTouchedAndNoError,
        value: true,
        valid: true,
      });

      expect(formUtils.getFieldsMeta(schema, getFieldMeta).other.deeply.nestedField).to.eql({
        ...notTouchedAndNoError,
        value: 'blip',
        valid: true,
      });
    });
  });

  describe('fieldsAreValid', () => {
    const fieldsMeta = formUtils.getFieldsMeta(schema, getFieldMeta);

    it('should return `true` when all provided fields are valid', () => {
      expect(formUtils.fieldsAreValid(['phoneNumber.number', 'other.deeply.nestedField'], fieldsMeta)).to.be.true;
    });

    it('should return `false` when at least one of the provided fields are not valid', () => {
      expect(formUtils.fieldsAreValid(['phoneNumber.number', 'phoneNumber.countryCode'], fieldsMeta)).to.be.false;
    });
  });

  describe('getFieldError', () => {
    it('should return `null` when field has not been touched and is not in an error state', () => {
      expect(formUtils.getFieldError(notTouchedAndNoError)).to.be.null;
    });

    it('should return `null` when field has not been touched and is in an error state', () => {
      expect(formUtils.getFieldError(notTouchedAndError)).to.be.null;
    });

    it('should return `null` when field has been touched and is not in an error state', () => {
      expect(formUtils.getFieldError(touchedAndNoError)).to.be.null;
    });

    it('should return an error string when field has been touched and is in an error state', () => {
      expect(formUtils.getFieldError(touchedAndError)).to.equal('error!');
    });

    it('should return `null` when error is an array and specified key and index do not contain an error string', () => {
      expect(formUtils.getFieldError(errorArray, 0, 'foo')).to.be.null;
    });

    it('should return an error string when error is an array and specified key and index contains an error', () => {
      expect(formUtils.getFieldError(errorArray, 1, 'bar')).to.equal('error!');
    });
  });

  describe('getThresholdWarning', () => {
    const threshold = {
      low: { value: 10, message: 'Too low!' },
      high: { value: 50, message: 'Too high!' },
    };

    it('should return the low threshold message if provided value is <= the low threshold', () => {
      expect(formUtils.getThresholdWarning(9, threshold)).to.equal('Too low!');
      expect(formUtils.getThresholdWarning(10, threshold)).to.equal('Too low!');
    });

    it('should return the high threshold message if provided value is >= the high threshold', () => {
      expect(formUtils.getThresholdWarning(50, threshold)).to.equal('Too high!');
      expect(formUtils.getThresholdWarning(51, threshold)).to.equal('Too high!');
    });

    it('should return `null` if provided value is not outside the thresholds', () => {
      expect(formUtils.getThresholdWarning(11, threshold)).to.equal(null);
      expect(formUtils.getThresholdWarning(49, threshold)).to.equal(null);
    });

    it('should return `null` if non-numeric value is passed in', () => {
      expect(formUtils.getThresholdWarning('', threshold)).to.equal(null);
      expect(formUtils.getThresholdWarning('6', threshold)).to.equal(null);
    });
  });
});
