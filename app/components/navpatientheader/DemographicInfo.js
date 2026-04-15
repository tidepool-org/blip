import React from 'react';
import { withTranslation } from 'react-i18next';
import { Flex, Text } from 'theme-ui';
import moment from 'moment';
import { DIABETES_TYPES } from '../../core/constants';

const JS_DATE_FORMAT = 'YYYY-MM-DD';

const DemographicsContainer = ({ children }) => (
  <Flex sx={{
    color: 'text.primary',
    flexShrink: 0,
    gap: 4,
    fontSize: 1,
    height: '1.5rem',
    alignItems: 'center'
  }}>
    { children }
  </Flex>
)

const DemographicInfo = ({ t, birthday, mrn, diagnosisType }) => {
  const hasValidBirthday = moment(birthday, JS_DATE_FORMAT, true).isValid();

  const diabetesType = DIABETES_TYPES().find(type => type.value === diagnosisType)?.label; // eslint-disable-line new-cap

  return (
    <DemographicsContainer>
      <Flex sx={{ color: 'text.primary', flexShrink: 0, gap: 1, fontSize: 1, alignItems: 'flex-end' }}>
        <Text>{t('DOB:')}</Text>
        <Flex sx={{ columnGap: 2, alignItems: 'flex-start' }}>
          <Text as="span" sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>
            {hasValidBirthday ? moment(birthday).format(JS_DATE_FORMAT) : <>&mdash;</>}
          </Text>
        </Flex>
      </Flex>

      <Flex sx={{ color: 'text.primary', flexShrink: 0, gap: 1, fontSize: 1, alignItems: 'flex-end' }}>
        <Text>{t('MRN:')}</Text>
        <Flex sx={{ columnGap: 2, alignItems: 'flex-start' }}>
          <Text as="span" sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>
            {mrn || <>&mdash;</>}
          </Text>
        </Flex>
      </Flex>

      <Flex sx={{ color: 'text.primary', flexShrink: 0, gap: 1, fontSize: 1, alignItems: 'flex-end' }}>
        <Text>{t('Diabetes Type:')}</Text>
        <Flex sx={{ columnGap: 2, alignItems: 'flex-start' }}>
          <Text as="span" sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>
            {diabetesType || <>&mdash;</>}
          </Text>
        </Flex>
      </Flex>
    </DemographicsContainer>
  );
};

export default withTranslation()(DemographicInfo);
