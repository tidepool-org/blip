import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text } from 'theme-ui';
import { Body1, Paragraph1, Title } from '../../components/elements/FontStyles';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import Icon from '../../components/elements/Icon';
import baseTheme, { fontWeights, fonts } from '../../themes/baseTheme';

export const MultiplePatientError = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ color: 'text.primary', p: 4 }}>
      <Title sx={{ mb: 3, textAlign: 'center' }}>
        {t('Multiple Patient Matches')}
      </Title>
      <Box
        role="alert"
        aria-live="assertive"
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
          {t('There are multiple patient records in Tidepool with identical MRN and date of birth to this patient.')}
        </Body1>
      </Box>

      <Body1 sx={{ mb: 2 }}>
        {t('To resolve this issue:')}
      </Body1>

      <Box as="ol" sx={{ pl: 4, mb: 3, fontFamily: fonts.default }}>
        <Box as="li" sx={{ mb: 2 }}>
          <Body1>{t('Log into Tidepool (app.tidepool.org) in a new browser')}</Body1>
        </Box>
        <Box as="li" sx={{ mb: 2 }}>
          <Body1>{t('Search for this patient\'s MRN in the Patient List')}</Body1>
        </Box>
        <Box as="li" sx={{ mb: 2 }}>
          <Body1>
            {t('Review duplicate accounts and either remove duplicates if appropriate or update MRNs to ensure each patient has a unique identifier')}
          </Body1>
        </Box>
        <Box as="li" sx={{ mb: 2 }}>
          <Body1>{t('Once resolved, return to the EHR and try again')}</Body1>
        </Box>
      </Box>

      <Paragraph1 sx={{ mt: 3 }}>
        {t('Need help? Contact ')}
        <Text as="a" href="mailto:support@tidepool.org" sx={{ color: 'text.link', '&:hover': { textDecoration: 'underline' } }}>
          support@tidepool.org
        </Text>
        {t('.')}
      </Paragraph1>

    </Box>
  );
};

export default MultiplePatientError;
