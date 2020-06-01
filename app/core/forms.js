import includes from 'lodash/includes';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import keys from 'lodash/keys';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

export const getFieldsMeta = (schema, getFieldMeta) => {
  const fieldKeys = keys(schema.fields);

  const reduceFields = (_fieldKeys, prefix = '') => reduce(_fieldKeys, (result, field) => {
    const nestedFields = get(schema.fields, `${field}.fields`);

    if (nestedFields) {
      // Recurse for nested field keys
      result[field] = reduceFields(keys(nestedFields), `${field}.`);
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

export const fieldsAreValid = (fieldNames, fieldsMeta) => !includes(map(fieldNames, fieldName => get(fieldsMeta, `${fieldName}.valid`)), false);
