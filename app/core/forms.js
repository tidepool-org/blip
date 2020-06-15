import includes from 'lodash/includes';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import keys from 'lodash/keys';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isArray from 'lodash/isArray';

/**
 * Helper function to provide field meta data for all formik fields defined within a yup schema
 *
 * @param {Object} schema created by the yup validation library
 * @param {Function} getFieldMeta handler provided by the useFormikContext hook
 * @returns {Object} keyed meta data from formik.getFieldMeta, plus valid state
 */
export const getFieldsMeta = (schema, getFieldMeta) => {
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
      result[field] = {
        ...fieldMeta,
        valid: (!isEmpty(fieldMeta.value) || fieldMeta.touched) && !fieldMeta.error,
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
 * @returns error string or null
 */
export const getFieldError = (fieldMeta, index, key) => {
  if (isArray(fieldMeta.error)) {
    return get(fieldMeta.error, `${index}.${key}`, null);
  }

  return fieldMeta.touched && fieldMeta.error ? fieldMeta.error : null;
};

/**
 * Convert longhand version of units to a condensed version, such as Units/hour => U/h
 * @param {String} units
 * @returns {String} condensed version of units
 */
export const getCondensedUnits = units => map(units.split('/'), part => part[0]).join('/');
