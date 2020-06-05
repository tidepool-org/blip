/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */

import * as formUtils from '../../../../app/core/forms';
import get from 'lodash/get';

const expect = chai.expect;

describe.only('forms', function() {
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

  const fieldsMeta = {
    firstName: { ...touchedAndError, value: 'foo' },
    phoneNumber: {
      countryCode: { ...notTouchedAndError, value: 'bar' },
      number: { ...touchedAndNoError, value: 'baz' },
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
  });
});
