import React from 'react';
import { Box, Flex, Text } from 'theme-ui';
import { Field } from 'formik';
import { useFormikContext, Formik, Form } from 'formik';
import { useTranslation } from 'react-i18next';

const INITIAL_VALUES = {
  veryLowThreshold: 54,
  lowThreshold: 69,
  highThreshold: 181,
  veryHighThreshold: 250,
};

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

  return (
    <Formik initialValues={INITIAL_VALUES}>
      <>
        <Flex sx={customRangeInputFormStyles}>
          <label htmlFor="veryLowThreshold">{t('Very Low')}</label>
          <Field
            type="number"
            name="veryLowThreshold"
            step="1"
            min="50"
            max="54"
          />

          <label htmlFor="lowThreshold">{t('Low')}</label>
          <Field
            type="number"
            name="lowThreshold"
            step="5"
            min="60"
            max="295"
          />

          <label htmlFor="highThreshold">{t('High')}</label>
          <Field
            type="number"
            name="highThreshold"
            step="5"
            min="65"
            max="300"
          />

          <label htmlFor="veryHighThreshold">{t('Very High')}</label>
          <Field
            type="number"
            name="veryHighThreshold"
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
    </Formik>
  );
};

export default CustomTargetRangeInput;
