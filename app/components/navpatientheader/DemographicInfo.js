import React from 'react';
import { useSelector } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Flex, Text } from 'theme-ui';
import { selectPatient } from '../../core/selectors/selectPatient';
import moment from 'moment';

const JS_DATE_FORMAT = 'YYYY-MM-DD';

const DemographicsContainer = ({ children }) => (
  <Flex sx={{
    color: 'text.primary', 
    flexShrink: 0, 
    gap: 5, 
    fontSize: 1, 
    alignItems: 'flex-start', 
    height: '1.5rem',
    alignItems: 'center'
  }}>
    { children }
  </Flex>
)

const DemographicInfo = ({ t }) => {
  const { patient } = useSelector(selectPatient);
  const { birthday, mrn } = patient.profile.patient;

  const hasValidBirthday = moment(birthday, 'YYYY-MM-DD', true).isValid();

  return (
    <DemographicsContainer>
      <Flex sx={{ color: 'text.primary', flexShrink: 0, gap: 2, fontSize: 1, alignItems: 'flex-end' }}>
        <Text>{t('DOB:')}</Text>
        <Flex sx={{ columnGap: 2, alignItems: 'flex-start' }}>
          <Text as="span" sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>
            {hasValidBirthday ? moment(birthday).format(JS_DATE_FORMAT) : <>&mdash;</>}
          </Text>
        </Flex>
      </Flex>

      <Flex sx={{ color: 'text.primary', flexShrink: 0, gap: 2, fontSize: 1, alignItems: 'flex-end' }}>
        <Text>{t('MRN:')}</Text>
        <Flex sx={{ columnGap: 2, alignItems: 'flex-start' }}>
          <Text as="span" sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>
            {mrn || <>&mdash;</>}
          </Text>
        </Flex>
      </Flex>
    </DemographicsContainer>
  )
};

export default withTranslation()(DemographicInfo);