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

export function DisableTwoFactorConfirmDialog({ open, onClose, credentialId }) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    if (!credentialId) return;
    redirectToKeycloakAction(`delete_credential:${credentialId}`, `${window.location.origin}/profile`);
  };

  return (
    <Dialog
      id="disable-two-factor-confirm"
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="disable-two-factor-confirm-title"
    >
      <DialogTitle onClose={onClose}>
        <Flex sx={{ alignItems: 'center', gap: 2 }}>
          <Icon
            variant="static"
            theme={baseTheme}
            icon={ReportProblemRoundedIcon}
            label="disable-2fa-warning"
            sx={{ color: 'feedback.warning', fontSize: '1.5em' }}
          />
          <MediumTitle id="disable-two-factor-confirm-title">
            {t('You’re about to disable 2FA')}
          </MediumTitle>
        </Flex>
      </DialogTitle>

      <DialogContent>
        <Text as="p" sx={{ fontFamily: 'default', fontSize: 1, lineHeight: 2, color: 'text.primary', m: 0 }}>
          {t('Disabling 2FA will remove the extra security layer for your account completely. You can re-enable two-factor authentication at any time.')}
        </Text>
      </DialogContent>

      <DialogActions>
        <Button variant="secondary" onClick={onClose}>
          {t('Cancel')}
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={!credentialId}>
          {t('I understand')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

DisableTwoFactorConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  credentialId: PropTypes.string,
};

DisableTwoFactorConfirmDialog.defaultProps = {
  credentialId: null,
};

export default DisableTwoFactorConfirmDialog;
