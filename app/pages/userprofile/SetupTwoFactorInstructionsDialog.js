import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Box, Flex, Text } from 'theme-ui';
import AccountTreeRoundedIcon from '@material-ui/icons/AccountTreeRounded';
import GroupRoundedIcon from '@material-ui/icons/GroupRounded';
import ReportProblemRoundedIcon from '@material-ui/icons/ReportProblemRounded';

import { Dialog, DialogTitle, DialogContent, DialogActions } from '../../components/elements/Dialog';
import Button from '../../components/elements/Button';
import Icon from '../../components/elements/Icon';
import { MediumTitle } from '../../components/elements/FontStyles';
import baseTheme from '../../themes/baseTheme';
import { redirectToKeycloakAction } from '../../keycloak';

function Advisory({ icon, label, heading, body }) {
  return (
    <Flex sx={{ gap: 3, alignItems: 'flex-start' }}>
      <Flex
        sx={{
          flexShrink: 0,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          bg: '#E1EAF9',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          variant="static"
          theme={baseTheme}
          icon={icon}
          label={label}
          sx={{ color: 'text.primary', fontSize: '1.25em' }}
        />
      </Flex>
      <Box>
        <Text
          as="div"
          sx={{ fontFamily: 'default', fontWeight: 'bold', fontSize: 1, lineHeight: 2, color: 'text.primary', mb: 1 }}
        >
          {heading}
        </Text>
        <Text
          as="div"
          sx={{ fontFamily: 'default', fontSize: 0, lineHeight: 2, color: 'blueGreyDark' }}
        >
          {body}
        </Text>
      </Box>
    </Flex>
  );
}

Advisory.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
};

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
        <Flex sx={{ flexDirection: 'column', gap: 4 }}>
          <Advisory
            icon={AccountTreeRoundedIcon}
            label="2fa-individual-accounts-advisory"
            heading={t('Use two-factor authentication (2FA) only on individual accounts')}
            body={t('Two-factor authentication is designed for personal logins. If this account is shared, other people may not be able to sign in once 2FA is enabled.')}
          />
          <Advisory
            icon={GroupRoundedIcon}
            label="2fa-clinic-workspaces-advisory"
            heading={t('Review your clinic workspaces')}
            body={t('If you are the only admin in this clinic workspace, add at least one other admin before enabling two-factor authentication (2FA). This helps ensure your clinic can recover access if an admin is ever locked out.')}
          />
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
