import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Flex, Button } from 'theme-ui';
import { Body1, Body2, Paragraph1 } from '../../components/elements/FontStyles';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import Icon from '../../components/elements/Icon';
import baseTheme from '../../themes/baseTheme';

export const MultiplePatientError = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ color: 'text.primary', p: 4, maxWidth: '450px' }}>
      <Box
        sx={{
          mb: 3,
          p: 3,
          backgroundColor: 'banner.warning.bg',
          borderRadius: 'default',
          display: 'flex',
          alignItems: 'flex-start',
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
            mt: '2px'
          }}
        />
        <Body2>
          {t('There are multiple patient records in Tidepool with identical MRN and date of birth to this patient.')}
        </Body2>
      </Box>

      <Body2 sx={{ fontWeight: 'medium', mb: 2 }}>
        {t('To resolve this issue:')}
      </Body2>

      <Box as="ol" sx={{ pl: 4, mb: 3 }}>
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

      <Paragraph1 sx={{ mt: 3, color: 'text.primarySubdued' }}>
        {t('Need help? Contact ')}
        <Text as="a" href="mailto:support@tidepool.org" sx={{ color: 'text.link', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          support@tidepool.org
        </Text>
        {t('.')}
      </Paragraph1>

      <Flex sx={{ justifyContent: 'flex-end', mt: 4 }}>
        <Button onClick={onClose} variant="primary">
          {t('Close')}
        </Button>
      </Flex>
    </Box>
  );
};

export default MultiplePatientError;
