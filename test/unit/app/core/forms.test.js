import * as formUtils from '../../../../app/core/forms';
import get from 'lodash/get';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

const expect = chai.expect;

describe('forms', function() {
  const errors = {
    touchedAndError: 'error!',
    touchedAndNoError: undefined,
    notTouchedAndError: 'error!',
    notTouchedAndErrorAndFilled: 'error!',
    notTouchedAndErrorAndNonEmptyObject: 'error!',
    notTouchedAndNoError: undefined,
    initiallySetAndError: 'error!',
    notInitiallySetAndError: 'error!',
  };

  const touched = {
    touchedAndError: true,
    touchedAndNoError: true,
    notTouchedAndError: undefined,
    notTouchedAndErrorAndFilled: undefined,
    notTouchedAndErrorAndNonEmptyObject: undefined,
    notTouchedAndNoError: undefined,
    initiallySetAndError: undefined,
    notInitiallySetAndError: undefined,
  };

  const initialValues = {
    touchedAndError: undefined,
    touchedAndNoError: undefined,
    notTouchedAndError: undefined,
    notTouchedAndErrorAndFilled: 'filled',
    notTouchedAndErrorAndNonEmptyObject: { path: 'filled' },
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

    it('should return `null` when an empty field has not been touched and is in an error state, and the forceTouchedIfFilled argument is `true`', () => {
      expect(formUtils.getFieldError('notTouchedAndError', formikContext, true)).to.be.null;
    });

    it('should return an error when a filled field has not been touched and is in an error state, and the forceTouchedIfFilled argument is `true`', () => {
      expect(formUtils.getFieldError('notTouchedAndErrorAndFilled', formikContext, true)).to.equal('error!');
    });

    it('should return an error when a non-empty object field has not been touched and is in an error state, and the forceTouchedIfFilled argument is `true`', () => {
      expect(formUtils.getFieldError('notTouchedAndErrorAndNonEmptyObject', formikContext, true)).to.equal('error!');
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

      const props = formUtils.getCommonFormikFieldProps(fieldpath, formikContext);
      props.onBlur();
      sinon.assert.calledOnce(formikContext.handleBlur);

      props.onChange();
      sinon.assert.calledOnce(formikContext.handleChange);

      expect(props).to.deep.include({
        id: 'user.name',
        name: 'user.name',
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

      const props = formUtils.getCommonFormikFieldProps(fieldpath, formikContext, 'myValue');
      props.onBlur();
      sinon.assert.calledOnce(formikContext.handleBlur);

      props.onChange();
      sinon.assert.calledOnce(formikContext.handleChange);

      expect(props).to.deep.include({
        id: 'user.name',
        name: 'user.name',
        error: 'name is silly',
        myValue: 'Fooey McBear',
      })
    });
  });

  describe('addEmptyOption', () => {
    it('should prepend an empty option value with default label', () => {
      const options = [{ label: 'One', value: '1' }];
      expect(formUtils.addEmptyOption(options)).to.eql([
        { label: 'Select one', value: '' },
        { label: 'One', value: '1' },
      ]);
    });

    it('should prepend an empty option value with custom label', () => {
      const options = [{ label: 'One', value: '1' }];
      expect(formUtils.addEmptyOption(options, 'Gotta pick one!')).to.eql([
        { label: 'Gotta pick one!', value: '' },
        { label: 'One', value: '1' },
      ]);
    });

    it('should prepend an empty option value with custom value', () => {
      const options = [{ label: 'One', value: '1' }];
      expect(formUtils.addEmptyOption(options, undefined, null)).to.eql([
        { label: 'Select one', value: null },
        { label: 'One', value: '1' },
      ]);
    });
  });

  describe('onChangeWithDependantFields', () => {
    const parentFieldPath = 'parentField';

    const dependantFields = [
      'dependantField',
      'nested.dependantField',
      'nested.dependantFieldArray.$.value',
    ];

    const formikContext = {
      handleChange: sinon.stub(),
      setFieldTouched: sinon.stub().resolves(),
      validateField: sinon.stub().resolves(),
      values: {
        parentField: 'parentFieldValue',
        dependantField: 'dependantFieldValue',
        nested: {
          dependantField: 'nestedDependantFieldValue',
          dependantFieldArray: [
            { value: 'arrayValue1' },
            { value: 'arrayValue2' },
          ]
        },
      },
    };

    afterEach(() => {
      formikContext.handleChange.resetHistory();
      formikContext.setFieldTouched.resetHistory();
      formikContext.validateField.resetHistory();
    });

    it('return a function that sets parent field as touched and validate it, and do the same for child fields after a delay', done => {
      const setDependantsTouched = true;
      const debounceValidateMs = 1;

      const changeHandler = formUtils.onChangeWithDependantFields(parentFieldPath, dependantFields, formikContext, setDependantsTouched, debounceValidateMs);
      expect(changeHandler).to.be.a('function');

      const event = 'changeEvent';
      changeHandler(event);

      setTimeout(() => {
        sinon.assert.calledWith(formikContext.handleChange, 'changeEvent');
        sinon.assert.calledWith(formikContext.setFieldTouched, 'parentField', true, true);
        sinon.assert.calledWith(formikContext.validateField, 'parentField');

        // because the dependant fields are debounced by 1ms, these should not yet be touched or validated
        sinon.assert.neverCalledWith(formikContext.setFieldTouched, 'dependantField');
        sinon.assert.neverCalledWith(formikContext.validateField, 'dependantField');

        sinon.assert.neverCalledWith(formikContext.setFieldTouched, 'nested.dependantField');
        sinon.assert.neverCalledWith(formikContext.validateField, 'nested.dependantField');

        sinon.assert.neverCalledWith(formikContext.setFieldTouched, 'nested.dependantFieldArray.0.value');
        sinon.assert.neverCalledWith(formikContext.validateField, 'nested.dependantFieldArray.0.value');

        sinon.assert.neverCalledWith(formikContext.setFieldTouched, 'nested.dependantFieldArray.1.value');
        sinon.assert.neverCalledWith(formikContext.validateField, 'nested.dependantFieldArray.1.value');

        setTimeout(() => {
          // after the requeste 1ms debounce, all the dependant fields are now touched and validated
          sinon.assert.calledWith(formikContext.setFieldTouched, 'dependantField', true, true);
          sinon.assert.calledWith(formikContext.validateField, 'dependantField');

          sinon.assert.calledWith(formikContext.setFieldTouched, 'nested.dependantField', true, true);
          sinon.assert.calledWith(formikContext.validateField, 'nested.dependantField');

          sinon.assert.calledWith(formikContext.setFieldTouched, 'nested.dependantFieldArray.0.value', true, true);
          sinon.assert.calledWith(formikContext.validateField, 'nested.dependantFieldArray.0.value');

          sinon.assert.calledWith(formikContext.setFieldTouched, 'nested.dependantFieldArray.1.value', true, true);
          sinon.assert.calledWith(formikContext.validateField, 'nested.dependantFieldArray.1.value');

          done();
        }, debounceValidateMs);
      }, 0)
    });

    it('return not touch dependant fields if `setDependantsTouched` arg is false', done => {
      const setDependantsTouched = false;
      const debounceValidateMs = 1;

      const changeHandler = formUtils.onChangeWithDependantFields(parentFieldPath, dependantFields, formikContext, setDependantsTouched, debounceValidateMs);
      expect(changeHandler).to.be.a('function');

      const event = 'changeEvent';
      changeHandler(event);

      setTimeout(() => {
        sinon.assert.calledWith(formikContext.handleChange, 'changeEvent');
        sinon.assert.calledWith(formikContext.setFieldTouched, 'parentField', true, true);
        sinon.assert.calledWith(formikContext.validateField, 'parentField');

        // because the dependant fields are debounced by 1ms, these should not yet be touched or validated
        sinon.assert.neverCalledWith(formikContext.setFieldTouched, 'dependantField');
        sinon.assert.neverCalledWith(formikContext.validateField, 'dependantField');

        sinon.assert.neverCalledWith(formikContext.setFieldTouched, 'nested.dependantField');
        sinon.assert.neverCalledWith(formikContext.validateField, 'nested.dependantField');

        sinon.assert.neverCalledWith(formikContext.setFieldTouched, 'nested.dependantFieldArray.0.value');
        sinon.assert.neverCalledWith(formikContext.validateField, 'nested.dependantFieldArray.0.value');

        sinon.assert.neverCalledWith(formikContext.setFieldTouched, 'nested.dependantFieldArray.1.value');
        sinon.assert.neverCalledWith(formikContext.validateField, 'nested.dependantFieldArray.1.value');

        setTimeout(() => {
          // even after the requeste 1ms debounce, all the dependant fields are still not touched or validated
        sinon.assert.neverCalledWith(formikContext.setFieldTouched, 'dependantField');
        sinon.assert.neverCalledWith(formikContext.validateField, 'dependantField');

        sinon.assert.neverCalledWith(formikContext.setFieldTouched, 'nested.dependantField');
        sinon.assert.neverCalledWith(formikContext.validateField, 'nested.dependantField');

        sinon.assert.neverCalledWith(formikContext.setFieldTouched, 'nested.dependantFieldArray.0.value');
        sinon.assert.neverCalledWith(formikContext.validateField, 'nested.dependantFieldArray.0.value');

        sinon.assert.neverCalledWith(formikContext.setFieldTouched, 'nested.dependantFieldArray.1.value');
        sinon.assert.neverCalledWith(formikContext.validateField, 'nested.dependantFieldArray.1.value');

          done();
        }, debounceValidateMs);
      }, 0)
    });

  });
});
