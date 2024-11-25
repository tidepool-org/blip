import { withTranslation } from 'react-i18next';
import { Flex, Text } from 'theme-ui';
import moment from 'moment';

const DemographicInfo = ({ t, patient }) => {
  const { birthday, mrn } = patient.profile.patient; // TODO: pass through helper

  const hasValidBirthday = moment(birthday, 'YYYY-MM-DD', true).isValid();
  const hasMrn = !!mrn

  return (
    <Flex sx={{ color: 'text.primary', flexShrink: 0, gap: 2, fontSize: 1, alignItems: 'flex-start', ml: 24 }}>

      { hasValidBirthday && <>
        <Text>{t('DOB:')}</Text>
        <Flex sx={{ columnGap: 2, alignItems: 'flex-start' }}>
          <Text as="span" sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>
            {moment(birthday).format('MMMM D, YYYY')}
          </Text>
        </Flex>
      </>}

      { hasMrn && <>
        <Text>{t('MRN:')}</Text>
        <Flex sx={{ columnGap: 2, alignItems: 'flex-start' }}>
          <Text as="span" sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>
            {mrn}
          </Text>
        </Flex>
      </>}
    </Flex>
  )
}

export default withTranslation()(DemographicInfo);