import includes from 'lodash/includes';
import map from 'lodash/map';
import get from 'lodash/get';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
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
      valid = false
    }

    return valid;
  }), false);

/**
 * Returns the error state of a field in a way that's sensible for our components
 * @param {String} fieldPath path to the field in dot notation
 * @param {Object} formikContext context provided by useFormikContext()
 * @param {Boolean} forceTouched treat field as touched to force showing error prior to user interaction
 * @returns error string or null
 */
export const getFieldError = (fieldPath, { errors, touched, initialValues }, forceTouched) =>
  (get(touched, fieldPath, forceTouched) || get(initialValues, fieldPath)) && get(errors, fieldPath)
    ? get(errors, fieldPath)
    : null;

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
  onChange: formikContext.handleChange,
  onBlur: e => {
    formikContext.handleBlur(e);

    if (trimStrings && isString(e?.target?.value)) {
        formikContext.setFieldTouched(fieldpath, true);
        formikContext.setFieldValue(fieldpath, trim(e.target.value));
    }
  },
  error: getFieldError(fieldpath, formikContext),
  [valueProp]: formikContext.values[fieldpath],
});

/**
 * Add an empty option to a list of select or radio options
 * @param {Array} options - Array of options
 * @param {String} label - Display text to use for empty option
 * @param {*} value - Default empty value
 * @returns a new options array
 */
export const addEmptyOption = (options = [], label = t('Select one'), value = '') => ([
  { value, label },
  ...options,
]);
