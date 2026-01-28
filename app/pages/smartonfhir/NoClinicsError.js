import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text } from 'theme-ui';
import { Body1, Paragraph1, Title } from '../../components/elements/FontStyles';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import Icon from '../../components/elements/Icon';
import baseTheme, { fontWeights } from '../../themes/baseTheme';

export const NoClinicsError = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ color: 'text.primary', p: 4 }}>
      <Title sx={{ mb: 3, textAlign: 'center' }}>
        {t('Account Set Up Required')}
      </Title>
      <Box
        role="alert"
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
          {t('You don\'t appear to have a Tidepool account yet.')}
        </Body1>
      </Box>

      <Paragraph1 sx={{ mt: 3 }}>
        {t('Please contact ')}
        <Text as="a" href="mailto:support@tidepool.org" sx={{ color: 'text.link', '&:hover': { textDecoration: 'underline' } }}>
          support@tidepool.org
        </Text>
        {t('. Our team will check on your account status and permissions to help you get appropriate access.')}
      </Paragraph1>

    </Box>
  );
};

export default NoClinicsError;
