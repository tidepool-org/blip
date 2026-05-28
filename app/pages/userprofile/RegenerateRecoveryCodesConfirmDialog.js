import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Box, Flex, Text } from 'theme-ui';
import SecurityRoundedIcon from '@material-ui/icons/SecurityRounded';
import LockRoundedIcon from '@material-ui/icons/LockRounded';
import GetAppRoundedIcon from '@material-ui/icons/GetAppRounded';
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
        <Flex sx={{ alignItems: 'center', gap: 2 }}>
          <Icon
            variant="static"
            theme={baseTheme}
            icon={ReportProblemRoundedIcon}
            label="regenerate-recovery-codes-warning"
            sx={{ color: 'feedback.warning', fontSize: '1.5em' }}
          />
          <MediumTitle id="regenerate-recovery-codes-confirm-title">
            {t('You’re about to regenerate your recovery codes')}
          </MediumTitle>
        </Flex>
      </DialogTitle>

      <DialogContent>
        <Flex sx={{ flexDirection: 'column', gap: 4 }}>
          <Advisory
            icon={SecurityRoundedIcon}
            label="regenerate-recovery-codes-invalidation-advisory"
            heading={t('Your current recovery codes will stop working')}
            body={t('Once new codes are generated, your existing recovery codes will be invalidated and can no longer be used to access your account.')}
          />
          <Advisory
            icon={LockRoundedIcon}
            label="regenerate-recovery-codes-identity-advisory"
            heading={t('We’ll verify your identity before issuing new codes')}
            body={t('Before generating new codes, you’ll be asked to:')}
            bullets={[
              t('Re-enter your account password'),
              t('Provide a code from your authenticator app'),
            ]}
          />
          <Advisory
            icon={GetAppRoundedIcon}
            label="regenerate-recovery-codes-save-advisory"
            heading={t('Save your new codes immediately')}
            body={t('You’ll receive 12 new single-use recovery codes. After regeneration:')}
            bullets={[
              t('You won’t be able to view these codes again from Account Settings'),
              t('Each code can be used once before expiring'),
              t('Store them somewhere safe (a password manager or secure note)'),
            ]}
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

RegenerateRecoveryCodesConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RegenerateRecoveryCodesConfirmDialog;
