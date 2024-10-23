import debounce from 'lodash/debounce';
import each from 'lodash/each';
import includes from 'lodash/includes';
import map from 'lodash/map';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import trim from 'lodash/trim';

import i18next from './language';

const t = i18next.t.bind(i18next);

/**
 * Checks array of field names and returns whether or not all are valid
 * @param {Array} fieldNames array of field paths in dot notation
 * @param {Object} schema created by the yup validation library
 * @param {Object} values provided by useFormikContext()
 * @returns {Boolean}
 */
export const fieldsAreValid = (fieldNames, schema, values) =>
  !includes(map(fieldNames, fieldKey => {
    let valid = true;

    try {
      schema.validateSyncAt(fieldKey, values);
    } catch (e) {
      valid = false;
    }

    return valid;
  }), false);

/**
 * Returns the error state of a field in a way that's sensible for our components
 * @param {String} fieldPath path to the field in dot notation
 * @param {Object} formikContext context provided by useFormikContext()
 * @param {Boolean} forceTouchedIfFilled treat field as touched to force showing error prior to user interaction if it has a value within it
 * @returns error string or null
 */
export const getFieldError = (fieldPath, formikContext, forceTouchedIfFilled = true) => {
  const { errors, touched, initialValues, values } = formikContext;
  const value = get(values, fieldPath);

  const forceTouched = forceTouchedIfFilled && (
    (isFinite(value) && parseFloat(value) >= 0) ||
    ((isString(value) || isPlainObject(value)) && !isEmpty(value))
  );

  return (get(touched, fieldPath, forceTouched) || get(initialValues, fieldPath)) && get(errors, fieldPath)
    ? get(errors, fieldPath)
    : null;
};

/**
 * Returns the warning message for a value outside of the given threshold
 * @param {Number} value number to check
 * @param {Object} threshold containing low and/or high keys each with value and message
 * @returns warning string or null
 */
export const getThresholdWarning = (value, threshold) => {
  if (isNumber(value)) {
    if (value < get(threshold, 'low.value')) return get(threshold, 'low.message');
    if (value > get(threshold, 'high.value')) return get(threshold, 'high.message');
  }
  return null;
};

/**
 * Get props commonly used for Formik fields
 * @param {String} fieldPath path to the field in dot notation
 * @param {Object} formikContext context provided by useFormikContext()
 * @param {String} valueProp prop name to use for field value
 * @returns {Object}
 */
export const getCommonFormikFieldProps = (fieldpath, formikContext, valueProp = 'value', trimStrings = true) => ({
  id: fieldpath,
  name: fieldpath,
  onChange: e => {
    formikContext.handleChange(e);

    if (valueProp === 'checked') {
      formikContext.setFieldValue(fieldpath, !!e.target[valueProp], true);
    }
  },
  onBlur: e => {
    formikContext.handleBlur(e);

    if (trimStrings && isString(e?.target?.[valueProp])) {
      formikContext.setFieldTouched(fieldpath, true);
      formikContext.setFieldValue(fieldpath, trim(e.target[valueProp]));
    }
  },
  error: getFieldError(fieldpath, formikContext),
  [valueProp]: formikContext.values[fieldpath],
});

/**
 * Add an empty option to a list of select or radio options
 * @param {Array} options Array of options
 * @param {String} label Display text to use for empty option
 * @param {*} value - Default empty value
 * @returns a new options array
 */
export const addEmptyOption = (options = [], label = t('Select one'), value = '') => ([
  { value, label },
  ...options,
]);

/**
 * Formik Field onChange handler for fields that require validation of other fields when changing values
 * @param {Array} dependantFields Array of dependant field paths
 * @param {Object} formikContext Context provided by useFormikContext()
 * @returns {Function} onChange handler function
 */
export const onChangeWithDependantFields = (parentFieldPath, dependantFields, formikContext, setDependantsTouched = true, debounceValidateMs = 250) => async e => {
  formikContext.handleChange(e);
  await formikContext.setFieldTouched(parentFieldPath, true, true);
  await formikContext.validateField(parentFieldPath);

  const debouncedValidate = () => debounce(async fieldPath => {
    if (setDependantsTouched) {
      await formikContext.setFieldTouched(fieldPath, true, true);
      await formikContext.validateField(fieldPath);
    }
  }, debounceValidateMs);

  each(dependantFields, dependantField => {
    const scheduleIndexPlaceholder = dependantField.indexOf('.$.');

    if (scheduleIndexPlaceholder > 0) {
      const fieldParts = dependantField.split('.$.');
      const fieldArrayValues = get(formikContext.values, fieldParts[0]);

      each(fieldArrayValues, (fieldArrayValue, index) => {
        debouncedValidate()(`${fieldParts[0]}.${index}.${fieldParts[1]}`);
      });
    } else {
      debouncedValidate()(dependantField);
    }
  });
};
