import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Text } from 'theme-ui';

import { Dialog, DialogTitle, DialogContent, DialogActions } from '../../components/elements/Dialog';
import Button from '../../components/elements/Button';
import { MediumTitle } from '../../components/elements/FontStyles';
import { redirectToKeycloakAction } from '../../keycloak';

export function RegenerateRecoveryCodesConfirmDialog({ open, onClose }) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    redirectToKeycloakAction('CONFIGURE_RECOVERY_AUTHN_CODES', `${window.location.origin}/profile`);
  };

  return (
    <Dialog
      id="regenerate-recovery-codes-confirm"
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="regenerate-recovery-codes-confirm-title"
    >
      <DialogTitle onClose={onClose}>
        <MediumTitle id="regenerate-recovery-codes-confirm-title">
          {t('Generate New Recovery Codes')}
        </MediumTitle>
      </DialogTitle>

      <DialogContent>
        <Text as="p" sx={{ fontFamily: 'default', fontSize: 1, lineHeight: 2, color: 'text.primary', m: 0 }}>
          {t('This will permanently replace your existing recovery codes. Any unused codes you have left will stop working.')}
        </Text>
      </DialogContent>

      <DialogActions>
        <Button variant="secondary" onClick={onClose}>
          {t('Cancel')}
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          {t('Yes, generate new codes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

RegenerateRecoveryCodesConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RegenerateRecoveryCodesConfirmDialog;
