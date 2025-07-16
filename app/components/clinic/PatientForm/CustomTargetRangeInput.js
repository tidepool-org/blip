import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Flex, Text } from 'theme-ui';
import { Field } from 'formik';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../core/constants';

import mapValues from 'lodash/mapValues';
import range from 'lodash/range';

const INPUT_CONSTRAINTS = {
  [MGDL_UNITS]: {
    veryLowThreshold: { default: 54, step: 1, min: 50, max: 54 },
    lowThreshold: { default: 69, step: 5, min: 60, max: 295 },
    highThreshold: { default: 181, step: 5, min: 65, max: 300 },
    veryHighThreshold: { default: 250, step: 5, min: 185, max: 395 },
  },
  [MMOLL_UNITS]: { // TODO: Fix values
    veryLowThreshold: { default: 54, step: 1, min: 50, max: 54 },
    lowThreshold: { default: 69, step: 5, min: 60, max: 295 },
    highThreshold: { default: 181, step: 5, min: 65, max: 300 },
    veryHighThreshold: { default: 250, step: 5, min: 185, max: 395 },
  },
};

export const buildValidationSchema = (preferredBgUnits) => {
  // The constraints for each field, e.g. { default: 69, step: 5, min: 60, max: 295 }
  const { veryLowThreshold, lowThreshold, highThreshold, veryHighThreshold } = INPUT_CONSTRAINTS[preferredBgUnits];

  // For each field, generate an array of allowed values based on min, max, and step
  // e.g. If min = 60, max = 295, and step = 5, we generate [60, 65, 70, 75 ... 295]
  const allowedVeryLows = (({ min, max, step }) => range(min, max + step, step))(veryLowThreshold);
  const allowedLows = (({ min, max, step }) => range(min, max + step, step))(lowThreshold);
  const allowedHighs = (({ min, max, step }) => range(min, max + step, step))(highThreshold);
  const allowedVeryHighs = (({ min, max, step }) => range(min, max + step, step))(veryHighThreshold);

  // Default values are often not part of the array, so we should add them to the allowed list
  allowedVeryLows.push(veryLowThreshold.default);
  allowedLows.push(lowThreshold.default);
  allowedHighs.push(highThreshold.default);
  allowedVeryHighs.push(veryHighThreshold.default);

  return yup.object().shape({
    veryLowThreshold: yup.number()
      .oneOf(allowedVeryLows),

    lowThreshold: yup.number()
      .oneOf(allowedLows)
      .test('>veryLow', 'Low threshold must be greater than very low threshold', function(value) {
        return value > this.parent.veryLowThreshold;
      }),

    highThreshold: yup.number()
      .oneOf(allowedHighs)
      .test('>low', 'High threshold must be greater than low threshold', function(value) {
        return value > this.parent.lowThreshold;
      }),

    veryHighThreshold: yup.number()
      .oneOf(allowedVeryHighs)
      .test('>high', 'Very high threshold must be greater than high threshold', function(value) {
        // Empty input allowed for veryHigh
        return value ? value > this.parent.highThreshold : true;
      }),
  });
};

const getInitialValues = (preferredBgUnits) => mapValues(INPUT_CONSTRAINTS[preferredBgUnits], 'default');

const customRangeInputFormStyles = {
  marginTop: 3,
  marginBottom: 3,
  fontSize: 1,
  alignItems: 'center',
  'label': { marginRight: 1, marginLeft: 3 },
  'input': { width: '80px', padding: 2 },
};

const CustomTargetRangeInput = () => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const clinicBgUnits = clinic?.preferredBgUnits || MGDL_UNITS;

  const constraints = INPUT_CONSTRAINTS[clinicBgUnits];

  const validationSchema = useMemo(() => buildValidationSchema(clinicBgUnits), [clinicBgUnits]);

  const formik = useFormik({
    initialValues: getInitialValues(clinicBgUnits),
    validationSchema: validationSchema,
  });

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

        <label htmlFor="lowThreshold">{t('Low')}</label>
        <input
          {...formik.getFieldProps('lowThreshold')}
          type="number"
          name="lowThreshold"
          step={constraints['lowThreshold'].step}
          min={constraints['lowThreshold'].min}
          max={constraints['lowThreshold'].max}
        />

        <label htmlFor="highThreshold">{t('High')}</label>
        <input
          {...formik.getFieldProps('highThreshold')}
          type="number"
          name="highThreshold"
          step={constraints['highThreshold'].step}
          min={constraints['highThreshold'].min}
          max={constraints['highThreshold'].max}
        />

        <label htmlFor="veryHighThreshold">{t('Very High')}</label>
        <input
          {...formik.getFieldProps('veryHighThreshold')}
          type="number"
          name="veryHighThreshold"
          step={constraints['veryHighThreshold'].step}
          min={constraints['veryHighThreshold'].min}
          max={constraints['veryHighThreshold'].max}
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
