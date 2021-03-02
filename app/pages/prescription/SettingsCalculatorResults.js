import React from 'react';
import { translate } from 'react-i18next';
import { useFormikContext } from 'formik';
import { Box } from 'rebass/styled-components';
import get from 'lodash/get';

import { Paragraph1 } from '../../components/elements/FontStyles';

const SettingsCalculatorResults = props => {
  const { t } = props;
  const formikContext = useFormikContext();

  const {
    values,
  } = formikContext;

  const bgUnits = values.initialSettings.bloodGlucoseUnits;

  const hasResults = get(values, 'calculator.recommendedBasalRate')
    && get(values, 'calculator.recommendedInsulinSensitivity')
    && get(values, 'calculator.recommendedCarbohydrateRatio');

  return hasResults ? (
    <Box
      mt={4}
      sx={{ borderLeft: '3px solid', borderLeftColor: 'purpleMedium' }}
      bg="purpleLight"
      p={3}
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

export default translate()(SettingsCalculatorResults);
