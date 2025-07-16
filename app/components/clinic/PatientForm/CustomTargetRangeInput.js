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
    veryLowThreshold: { default: 54, step: 1, min: 60, max: 54 },
    lowThreshold: { default: 69, step: 5, min: 60, max: 295 },
    highThreshold: { default: 181, step: 5, min: 65, max: 300 },
    veryHighThreshold: { default: 250, step: 5, min: 185, max: 395 },
  },
  [MMOLL_UNITS]: { // TODO: Fix values
    veryLowThreshold: { default: 54, step: 1, min: 60, max: 54 },
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
    veryLowThreshold: yup.number().oneOf(allowedVeryLows),
    lowThreshold: yup.number().oneOf(allowedLows),
    highThreshold: yup.number().oneOf(allowedHighs),
    veryHighThreshold: yup.number().oneOf(allowedVeryHighs),
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
          type="number"
          name="veryLowThreshold"
          {...formik.getFieldProps('veryLowThreshold')}
          step="1"
          min="50"
          max="54"
        />

        <label htmlFor="lowThreshold">{t('Low')}</label>
        <input
          type="number"
          name="lowThreshold"
          {...formik.getFieldProps('lowThreshold')}
          step="5"
          min="60"
          max="295"
        />

        <label htmlFor="highThreshold">{t('High')}</label>
        <input
          type="number"
          name="highThreshold"
          {...formik.getFieldProps('highThreshold')}
          step="5"
          min="65"
          max="300"
        />

        <label htmlFor="veryHighThreshold">{t('Very High')}</label>
        <input
          type="number"
          name="veryHighThreshold"
          {...formik.getFieldProps('veryHighThreshold')}
          step="5"
          min="185"
          max="395" // TODO: remove fixed vals
        />

        <Text ml="auto" mr={3} >{
          // TODO: units of user
          t('mg/dL')
        }</Text>
      </Flex>
      <Box sx={{ fontSize: 0 }}>
        {t('Setting a non-standard range will be used when viewing patient data, but will not be available in the dashboard view')}
      </Box>
    </>
  );
};

export default CustomTargetRangeInput;
