import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Flex, Text } from 'theme-ui';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../core/constants';
import { utils as vizUtils } from '@tidepool/viz';

import noop from 'lodash/noop';
import isEmpty from 'lodash/isEmpty';
import { pick } from 'lodash';

const { DEFAULT_BG_BOUNDS } = vizUtils.constants;

const INPUT_CONSTRAINTS = {
  [MGDL_UNITS]: {
    veryLowThreshold: { step: 1, min: 30, max: 69 },
    targetLowerBound: { step: 1, min: 50, max: 180 },
    targetUpperBound: { step: 1, min: 70, max: 300 },
    veryHighThreshold: { step: 1, min: 180, max: 400 },
  },
  [MMOLL_UNITS]: {
    veryLowThreshold: { step: 0.1, min: 1.7, max: 3.8 },
    targetLowerBound: { step: 0.1, min: 2.8, max: 10.0 },
    targetUpperBound: { step: 0.1, min: 3.9, max: 16.7 },
    veryHighThreshold: { step: 0.1, min: 10.0, max: 22.2 },
  },
};

export const buildValidationSchema = (bgUnits, t) => {
  // The constraints for each field, e.g. { default: 69, step: 1, min: 60, max: 295 }
  const { veryLowThreshold, targetLowerBound, targetUpperBound, veryHighThreshold } = INPUT_CONSTRAINTS[bgUnits];

  // TODO: Implement Correct Error Messages

  return yup.object().shape({
    bgUnits: yup.string()
      .oneOf([MGDL_UNITS, MMOLL_UNITS])
      .required(),

    veryLowThreshold: yup.number()
      .min(veryLowThreshold.min)
      .max(veryLowThreshold.max),

    targetLowerBound: yup.number()
      .min(targetLowerBound.min)
      .max(targetLowerBound.max)
      .test('>veryLow', t('Low threshold must be greater than very low threshold'), function(value) {
        return value > this.parent.veryLowThreshold;
      }),

    targetUpperBound: yup.number()
      .min(targetUpperBound.min)
      .max(targetUpperBound.max)
      .test('>low', t('High threshold must be greater than low threshold'), function(value) {
        return value > this.parent.targetLowerBound;
      }),

    veryHighThreshold: yup.number()
      .min(veryHighThreshold.min)
      .max(veryHighThreshold.max)
      .nullable()
      .test('>high', t('Very high threshold must be greater than high threshold'), function(value) {
        // Empty input allowed for veryHigh
        return !!value ? value > this.parent.targetUpperBound : true;
      }),
  });
};

const getInitialValues = (bgUnits) => {
  const bgBounds = pick(
    DEFAULT_BG_BOUNDS[bgUnits],
    ['veryLowThreshold', 'targetLowerBound', 'targetUpperBound', 'veryHighThreshold']
  );

  return { bgUnits, ...bgBounds };
};

const customRangeInputFormStyles = {
  marginTop: 3,
  marginBottom: 3,
  fontSize: 1,
  alignItems: 'center',
  'label': { marginRight: 1, marginLeft: 3 },
  'input': { width: '80px', padding: 2 },
};

const CustomTargetRangeInput = ({ onChange = noop }) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const clinicBgUnits = clinic?.preferredBgUnits || MGDL_UNITS;

  const initialValues = getInitialValues(clinicBgUnits);
  const validationSchema = useMemo(() => buildValidationSchema(clinicBgUnits, t), [clinicBgUnits, t]);

  const formik = useFormik({ initialValues, validationSchema });

  useEffect(() => {
    // If inputted values are valid, pass them to parent, otherwise pass null
    formik.validateForm().then(errors => {
      onChange(isEmpty(errors) ? formik.values : null);
    });

    // On component dismount, set to null
    return () => onChange(null);
  }, [formik.values]);

  const constraints = INPUT_CONSTRAINTS[clinicBgUnits];

  return (
    <>
      <Flex sx={customRangeInputFormStyles}>
        <label htmlFor="veryLowThreshold">{t('Very Low')}</label>
        <input
          {...formik.getFieldProps('veryLowThreshold')}
          type="number"
          name="veryLowThreshold"
          step={constraints['veryLowThreshold'].step}
          min={constraints['veryLowThreshold'].min}
          max={constraints['veryLowThreshold'].max}
        />

        <label htmlFor="targetLowerBound">{t('Low')}</label>
        <input
          {...formik.getFieldProps('targetLowerBound')}
          type="number"
          name="targetLowerBound"
          step={constraints['targetLowerBound'].step}
          min={constraints['targetLowerBound'].min}
          max={constraints['targetLowerBound'].max}
        />

        <label htmlFor="targetUpperBound">{t('High')}</label>
        <input
          {...formik.getFieldProps('targetUpperBound')}
          type="number"
          name="targetUpperBound"
          step={constraints['targetUpperBound'].step}
          min={constraints['targetUpperBound'].min}
          max={constraints['targetUpperBound'].max}
        />

        <label htmlFor="veryHighThreshold">{t('Very High')}</label>
        <input
          {...formik.getFieldProps('veryHighThreshold')}
          type="number"
          name="veryHighThreshold"
          step={constraints['veryHighThreshold'].step}
          min={constraints['veryHighThreshold'].min}
          max={constraints['veryHighThreshold'].max}
          onChange={({ target }) => {
            const value = target.value === '' ? null : target.value; // allow empty
            formik.setFieldValue('veryHighThreshold', value);
          }}
        />

        <Text ml="auto" mr={3}>{clinicBgUnits}</Text>
      </Flex>
      <Box sx={{ fontSize: 0 }}>
        {t('Setting a non-standard range will be used when viewing patient data, but will not be available in the dashboard view')}
      </Box>

      { Object.keys(formik.errors).length > 0 &&
        <Box sx={{ fontSize: 0, color: 'red' }}>
          {Object.values(formik.errors).map(err => <p>{err}</p>)}
        </Box>
      }
    </>
  );
};

export default CustomTargetRangeInput;
