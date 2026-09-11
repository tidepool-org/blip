import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Flex, Text } from 'theme-ui';
import ReportProblemRoundedIcon from '@material-ui/icons/ReportProblemRounded';

import { Dialog, DialogTitle, DialogContent, DialogActions } from '../../components/elements/Dialog';
import Button from '../../components/elements/Button';
import Icon from '../../components/elements/Icon';
import { MediumTitle } from '../../components/elements/FontStyles';
import baseTheme from '../../themes/baseTheme';
import { redirectToKeycloakAction } from '../../keycloak';

export function SetupTwoFactorInstructionsDialog({ open, onClose }) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    redirectToKeycloakAction('CONFIGURE_TOTP', `${window.location.origin}/profile`);
  };

  return (
    <Dialog
      id="setup-two-factor-instructions"
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="setup-two-factor-instructions-title"
    >
      <DialogTitle onClose={onClose}>
        <Flex sx={{ alignItems: 'center', gap: 2 }}>
          <Icon
            variant="static"
            theme={baseTheme}
            icon={ReportProblemRoundedIcon}
            label="setup-2fa-warning"
            sx={{ color: 'feedback.warning', fontSize: '1.5em' }}
          />
          <MediumTitle id="setup-two-factor-instructions-title">
            {t('Before setting up 2FA')}
          </MediumTitle>
        </Flex>
      </DialogTitle>

      <DialogContent>
        <Flex sx={{ flexDirection: 'column', gap: 3 }}>
          <Text as="p" sx={{ fontFamily: 'default', fontSize: 1, lineHeight: 2, color: 'text.primary', m: 0 }}>
            {t('Only set up two-factor authentication (2FA) on individual clinic accounts. Create separate accounts for each team member before continuing.')}
          </Text>
          <Text as="p" sx={{ fontFamily: 'default', fontSize: 1, lineHeight: 2, color: 'text.primary', m: 0 }}>
            {t('Verify there are at least two clinic admins in your clinic workspace. This helps ensure your clinic can recover access if an admin is ever locked out.')}
          </Text>
        </Flex>
      </DialogContent>

      <DialogActions>
        <Button variant="secondary" onClick={onClose}>
          {t('Cancel')}
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          {t('I understand')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SetupTwoFactorInstructionsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SetupTwoFactorInstructionsDialog;
