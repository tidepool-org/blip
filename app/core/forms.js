import includes from 'lodash/includes';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import keys from 'lodash/keys';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import isArray from 'lodash/isArray';

/**
 * Helper function to provide field meta data for all formik fields defined within a yup schema
 *
 * @param {Object} schema created by the yup validation library
 * @param {Function} getFieldMeta handler provided by the useFormikContext hook
 * @param {Object} values form values provided by the useFormikContext hook
 * @returns {Object} keyed meta data from formik.getFieldMeta, plus valid state
 */
export const getFieldsMeta = (schema, getFieldMeta, values) => {
  const fieldKeys = keys(schema.fields);

  const reduceFields = (_fieldKeys, prefix = '') => reduce(_fieldKeys, (result, field) => {
    const fieldKey = `${prefix}${field}`;
    const nestedFields = get(schema.fields, `${fieldKey.split('.').join('.fields.')}.fields`);

    if (nestedFields) {
      // Recurse for nested field keys
      result[field] = reduceFields(keys(nestedFields), `${fieldKey}.`);
    } else {
      const fieldKey = `${prefix}${field}`;
      const fieldMeta = getFieldMeta(fieldKey);

      let valid = true;
      try {
        schema.validateSyncAt(fieldKey, values);
      } catch (e) {
        valid = false
      }

      result[field] = {
        ...fieldMeta,
        valid
      };
    }

    return result;
  }, {});

  return reduceFields(fieldKeys);
};

/**
 * Checks array of field names and returns whether or not all are valid
 * @param {Array} fieldNames
 * @param {Object} fieldsMeta provided by forms.getFieldsMeta util
 * @returns {Boolean}
 */
export const fieldsAreValid = (fieldNames, fieldsMeta) => !includes(map(fieldNames, fieldName => get(fieldsMeta, `${fieldName}.valid`)), false);

/**
 * Returns the error state of a field in a way that's sensible for our components
 * @param {Object} fieldMeta metadata for a field provided by formik's getFieldMeta
 * @param {Number} index checks for errors for array fields at given index
 * @param {String} key checks for errors for array fields at given key
 * @returns error string or null
 */
export const getFieldError = (fieldMeta, index, key) => {
  if (isArray(fieldMeta.error)) {
    const fieldError = get(fieldMeta, `error.${index}.${key}`);
    return fieldMeta.touched && fieldError ? fieldError : null;
  }

  return (fieldMeta.touched || fieldMeta.initialValue) && fieldMeta.error ? fieldMeta.error : null;
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
