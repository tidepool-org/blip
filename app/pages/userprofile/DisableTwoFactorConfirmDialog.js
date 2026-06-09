import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Box, Flex, Text } from 'theme-ui';
import PhoneIphoneRoundedIcon from '@material-ui/icons/PhoneIphoneRounded';
import ChatBubbleRoundedIcon from '@material-ui/icons/ChatBubbleRounded';
import SecurityRoundedIcon from '@material-ui/icons/SecurityRounded';
import ReportProblemRoundedIcon from '@material-ui/icons/ReportProblemRounded';

import { Dialog, DialogTitle, DialogContent, DialogActions } from '../../components/elements/Dialog';
import Button from '../../components/elements/Button';
import Icon from '../../components/elements/Icon';
import { MediumTitle } from '../../components/elements/FontStyles';
import baseTheme from '../../themes/baseTheme';
import { redirectToKeycloakAction } from '../../keycloak';

function Advisory({ icon, label, heading, body, bullets }) {
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
        {bullets && bullets.length > 0 && (
          <Box
            as="ul"
            sx={{
              fontFamily: 'default',
              fontSize: 0,
              lineHeight: 2,
              color: 'blueGreyDark',
              pl: 3,
              m: 0,
              mt: 1,
            }}
          >
            {bullets.map((bullet, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Box as="li" key={i}>{bullet}</Box>
            ))}
          </Box>
        )}
      </Box>
    </Flex>
  );
}

Advisory.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  bullets: PropTypes.arrayOf(PropTypes.string),
};

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
        <Flex sx={{ flexDirection: 'column', gap: 4 }}>
          <Advisory
            icon={PhoneIphoneRoundedIcon}
            label="disable-2fa-device-removal-advisory"
            heading={t('Your current personal device (authenticator app) will be removed')}
            body={t('You won’t be able to use your authenticator app on this device to log in.')}
          />
          <Advisory
            icon={ChatBubbleRoundedIcon}
            label="disable-2fa-turned-off-advisory"
            heading={t('Two-factor authentication (2FA) will be turned off')}
            body={t('If you continue to disable 2FA')}
            bullets={[
              t('2FA will be turned off'),
              t('Your current personal device will be removed'),
              t('You’ll log in with only your email and password until you set up 2FA again.'),
            ]}
          />
          <Advisory
            icon={SecurityRoundedIcon}
            label="disable-2fa-recovery-codes-advisory"
            heading={t('Recovery codes will be deleted')}
            body={t('Removing your 2FA device will also delete associated recovery codes. These codes will no longer be available for account recovery once the device is removed.')}
            bullets={[
              t('You will no longer be able to use existing recovery codes.'),
              t('You’ll need to set up 2FA again to generate new recovery codes.'),
            ]}
          />
        </Flex>
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
