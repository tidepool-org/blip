import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text } from 'theme-ui';
import { Body1, Paragraph1, Title } from '../../components/elements/FontStyles';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import Icon from '../../components/elements/Icon';
import baseTheme, { fontWeights, fonts } from '../../themes/baseTheme';

export const NoPatientMatch = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ color: 'text.primary', p: 4 }}>
      <Title sx={{ mb: 3, textAlign: 'center' }}>
        {t('No Patient Match')}
      </Title>
      <Box
        sx={{
          mb: 4,
          p: 3,
          backgroundColor: 'banner.warning.bg',
          borderRadius: 'default',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Icon
          className="icon"
          theme={baseTheme}
          variant="static"
          icon={WarningRoundedIcon}
          label="warning"
          sx={{
            color: 'banner.warning.icon',
            flexShrink: 0,
            mr: 1,
            fontSize: 3,
          }}
        />
        <Body1 sx={{ fontWeight: fontWeights.medium }}>
          {t('There is no patient with that MRN and date of birth in your Tidepool workspace.')}
        </Body1>
      </Box>

      <Body1 sx={{ mb: 2 }}>
        {t('To add this patient to Tidepool:')}
      </Body1>

      <Box as="ol" sx={{ pl: 4, mb: 2 , fontFamily: fonts.default}}>
        <Box as="li" sx={{ mb: 2 }}>
          <Body1>{t('Log into Tidepool (app.tidepool.org) in a new browser')}</Body1>
        </Box>
        <Box as="li" sx={{ mb: 2 }}>
          <Body1>{t('Click “Add New Patient” in your Clinic Workspace')}</Body1>
        </Box>
        <Box as="li" sx={{  }}>
          <Body1>
            {t('Enter the required information, making sure the MRN and birthdate match the EHR')}
          </Body1>
        </Box>
      </Box>
      <Box sx={{ mb: 2 }}>
          <Body1>
            {t('After this, you’ll be able to open their Tidepool account from your EHR system.')}
          </Body1>
        </Box>

      <Paragraph1 sx={{ mt: 2 }}>
        {t('Need help? Contact ')}
        <Text as="a" href="mailto:support@tidepool.org" sx={{ color: 'text.link', '&:hover': { textDecoration: 'underline' } }}>
          support@tidepool.org
        </Text>
        {t('.')}
      </Paragraph1>

    </Box>
  );
};

export default NoPatientMatch;
