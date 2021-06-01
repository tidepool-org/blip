import React from 'react';
import { translate } from 'react-i18next';
import { useFormikContext } from 'formik';
import { Box, BoxProps } from 'rebass/styled-components';

import { Paragraph1 } from '../../components/elements/FontStyles';
import { hasCalculatorResults } from './prescriptionFormConstants';

const SettingsCalculatorResults = props => {
  const { t } = props;
  const formikContext = useFormikContext();

  const {
    values,
  } = formikContext;

  const bgUnits = values.initialSettings.bloodGlucoseUnits;

  return hasCalculatorResults(values) ? (
    <Box
      sx={{ borderLeft: '3px solid', borderLeftColor: 'purpleMedium' }}
      bg="purpleLight"
      p={3}
      {...props}
    >
      <Paragraph1>
        <strong>{t('Basal Rate: ')}</strong>{values.calculator.recommendedBasalRate} U/hr
      </Paragraph1>
      <Paragraph1>
        <strong>{t('Insulin Sensitivity: ')}</strong>{values.calculator.recommendedInsulinSensitivity} {`${bgUnits}/U`}
      </Paragraph1>
      <Paragraph1>
        <strong>{t('Carbohydrate Ratio: ')}</strong>{values.calculator.recommendedCarbohydrateRatio} g/U
      </Paragraph1>
    </Box>
  ) : null;
};

SettingsCalculatorResults.propTypes = BoxProps;

export default translate()(SettingsCalculatorResults);
