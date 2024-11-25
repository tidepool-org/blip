import { withTranslation } from 'react-i18next';
import { Flex, Text } from 'theme-ui';

const PatientInfo = ({ t, patient }) => {
  const { birthday, mrn } = patient.profile.patient; // TODO: pass through helper

  return (
    <Flex sx={{ color: 'text.primary', flexShrink: 0, gap: 2, fontSize: 1, alignItems: 'flex-start' }}>
      <Text>{t('DOB:')}</Text>
      <Flex sx={{ columnGap: 2, alignItems: 'flex-start' }}>
        <Text as="span" sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>
          {birthday}
        </Text>
      </Flex>

      { mrn && <>
        <Text>{t('MRN:')}</Text>
        <Flex sx={{ columnGap: 2, alignItems: 'flex-start' }}>
          <Text as="span" sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>
            {mrn}
          </Text>
        </Flex>
        </>
      }
    </Flex>
  )
}

export default withTranslation()(PatientInfo);