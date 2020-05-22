import includes from 'lodash/includes';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import keys from 'lodash/keys';
import isEmpty from 'lodash/isEmpty';

export const getFieldsMeta = (schema, getFieldMeta) => {
  const fields = keys(schema.fields);

  return reduce(fields, (result, field) => {
    const fieldMeta = getFieldMeta(field);
    result[field] = {
      ...fieldMeta,
      valid: (!isEmpty(fieldMeta.value) || fieldMeta.touched) && !fieldMeta.error,
    };
    return result;
  }, {});
};

export const fieldsAreValid = (fieldNames, fieldsMeta) => !includes(map(fieldNames, fieldName => fieldsMeta[fieldName].valid), false);
