import { withTranslation } from 'react-i18next';
import { Flex, Text } from 'theme-ui';
import moment from 'moment';
import { colors } from '../../themes/baseTheme';

const JS_DATE_FORMAT = 'YYYY-MM-DD';

const containerStyleProps = {
    sx: {
      color: 'text.primary', 
      flexShrink: 0, 
      gap: 2, 
      fontSize: 1, 
      alignItems: 'flex-start', 
      pl: 24,
      borderLeft: `2px solid ${colors.lightGrey}`,
      height: '1.5rem',
      alignItems: 'center'
  }
};

const DemographicInfo = ({ t, patient }) => {
  const { birthday, mrn } = patient.profile.patient;

  const hasValidBirthday = moment(birthday, 'YYYY-MM-DD', true).isValid();
  const hasMrn = !!mrn

  return (
    <Flex {...containerStyleProps}>
      { hasValidBirthday && 
        <Flex sx={{ color: 'text.primary', flexShrink: 0, gap: 2, fontSize: 1, alignItems: 'flex-end' }}>
          <Text>{t('DOB:')}</Text>
          <Flex sx={{ columnGap: 2, alignItems: 'flex-start' }}>
            <Text as="span" sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>
              {moment(birthday).format(JS_DATE_FORMAT)}
            </Text>
          </Flex>
        </Flex>}

      { hasMrn && 
        <Flex sx={{ color: 'text.primary', flexShrink: 0, gap: 2, fontSize: 1, alignItems: 'flex-end' }}>
          <Text ml={24}>{t('MRN:')}</Text>
          <Flex sx={{ columnGap: 2, alignItems: 'flex-start' }}>
            <Text as="span" sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>
              {mrn}
            </Text>
          </Flex>
        </Flex>}
    </Flex>
  )
};

export default withTranslation()(DemographicInfo);