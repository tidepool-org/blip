/**
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, Flex, Link, Text } from 'theme-ui';
import _ from 'lodash';
import noop from 'lodash/noop';
import moment from 'moment';
import ChevronLeftRoundedIcon from '@material-ui/icons/ChevronLeftRounded';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import ReportProblemRoundedIcon from '@material-ui/icons/ReportProblemRounded';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import Button from '../../components/elements/Button';
import Icon from '../../components/elements/Icon';
import PopoverLabel from '../../components/elements/PopoverLabel';
import personUtils from '../../core/personutils';
import { useGetMfaStatusQuery } from '../../redux/features/mfaStatus/mfaStatusApi';
import { selectUser } from '../../core/selectors';
import { roles as clinicRoles } from '../../core/clinicUtils';
import { URL_SUPPORT_ACCOUNT_SETTINGS, URL_SUPPORT_RECOVERY_CODES } from '../../core/constants';
import baseTheme from '../../themes/baseTheme';
import { redirectToKeycloakAction } from '../../keycloak';
import { useToasts } from '../../providers/ToastProvider';
import { usePrevious } from '../../core/hooks';
import EditPersonalDetailsDialog from './EditPersonalDetailsDialog';
import SetupTwoFactorInstructionsDialog from './SetupTwoFactorInstructionsDialog';
import DisableTwoFactorConfirmDialog from './DisableTwoFactorConfirmDialog';
import RegenerateRecoveryCodesConfirmDialog from './RegenerateRecoveryCodesConfirmDialog';

const TRACK_METRICS = {
  back: 'Clicked Back in Account',
  editPersonalDetails: 'Clicked Edit Personal Details in Account',
  updatePassword: 'Clicked Update Password in Account',
  setUp2fa: 'Clicked Set Up 2FA in Account',
  disable2fa: 'Clicked Disable 2FA in Account',
  regenerateCodes: 'Clicked Regenerate Recovery Codes in Account',
};

const RECOVERY_CODES_WARNING_THRESHOLD = 3;
const RECOVERY_CODES_TOTAL = 12;

// Disabled baseline used while the MFA status query is loading or errored, so the
// security rows always receive a fully-shaped object (matches the query's mapped shape).
const MFA_STATUS_DEFAULT = {
  enabled: false,
  enabledTime: null,
  device: { id: null, name: null, registeredTime: null },
  recoveryCodes: { used: 0, total: 12, generatedTime: null },
};

const formatDate = (ts) => (ts ? moment(ts).format('MMM D, YYYY') : null);
const formatDateTime = (ts) => (ts ? moment(ts).format('MMM D, YYYY (h:mma)') : null);

function StatusPill({ label, dotColor, bg, color }) {
  return (
    <Flex
      as="span"
      sx={{
        bg,
        borderRadius: 'input',
        px: 2,
        py: '2px',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        as="span"
        sx={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          bg: dotColor,
          flexShrink: 0,
        }}
      />
      <Text
        as="span"
        sx={{
          fontFamily: 'default',
          fontSize: 0,
          lineHeight: 1,
          fontWeight: 'medium',
          color,
        }}
      >
        {label}
      </Text>
    </Flex>
  );
}

StatusPill.propTypes = {
  label: PropTypes.string.isRequired,
  dotColor: PropTypes.string.isRequired,
  bg: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

function ProfileSection({ user, isClinician, t, onEdit }) {
  const fullName = _.get(user, 'profile.fullName');
  const email = user?.username || _.get(user, 'emails.0');
  const jobTitleValue = _.get(user, 'profile.clinic.role');
  const jobTitle = _.get(_.find(clinicRoles, { value: jobTitleValue }), 'label', jobTitleValue);
  const lastUpdated = _.get(user, 'profile.updatedAt') || _.get(user, 'updatedAt');

  return (
    <Box variant="containers.well" p={4}>
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
          justifyContent: 'space-between',
          alignItems: ['stretch', 'flex-start'],
          gap: 3,
        }}
      >
        <Box>
          <Text
            as="div"
            sx={{
              fontFamily: 'default',
              fontWeight: 'bold',
              fontSize: 2,
              lineHeight: 3,
              color: 'black',
              mb: 2,
            }}
          >
            {fullName}
          </Text>
          <Text as="div" sx={{ fontFamily: 'default', fontSize: 0, lineHeight: 1, color: 'darkGrey', mb: 1 }}>
            <Text as="span" sx={{ fontWeight: 'medium' }}>{t('Email address:')}</Text>{' '}
            <Text as="span" sx={{ fontWeight: 'bold' }}>{email}</Text>
          </Text>
          {isClinician && jobTitle && (
            <Text as="div" sx={{ fontFamily: 'default', fontSize: 0, lineHeight: 1, color: 'darkGrey', mb: 1 }}>
              <Text as="span" sx={{ fontWeight: 'medium' }}>{t('Job title:')}</Text>{' '}
              <Text as="span" sx={{ fontWeight: 'bold' }}>{jobTitle}</Text>
            </Text>
          )}
          {lastUpdated && (
            <Text
              as="div"
              sx={{
                fontFamily: 'default',
                fontSize: '9px',
                lineHeight: 1,
                fontWeight: 'bold',
                color: 'mediumGrey',
                mt: 2,
              }}
            >
              {t('Last updated {{date}}', { date: formatDateTime(lastUpdated) })}
            </Text>
          )}
        </Box>
        <Button
          variant="secondary"
          sx={{ width: ['100%', 'auto'], flexShrink: 0 }}
          onClick={onEdit}
        >
          {t('Edit Personal Details')}
        </Button>
      </Flex>
    </Box>
  );
}

ProfileSection.propTypes = {
  user: PropTypes.object,
  isClinician: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

const securityRowSx = {
  border: '1px solid',
  borderColor: 'gray10',
  borderRadius: 'default',
  backgroundColor: 'white',
  p: 4,
};

function SecuritySSONotice({ t }) {
  return (
    <Box sx={securityRowSx}>
      <Text as="p" sx={{ m: 0, fontSize: 1, lineHeight: 3 }}>
        {t(
          'Your account security settings are managed by your organization\'s IT team. Please contact your IT team for help updating your password or two-factor authentication settings.'
        )}
      </Text>
    </Box>
  );
}

SecuritySSONotice.propTypes = { t: PropTypes.func.isRequired };

function ManagePasswordRow({ t, trackMetric, passwordLastUpdated }) {
  const handleUpdatePassword = () => {
    trackMetric(TRACK_METRICS.updatePassword);
    redirectToKeycloakAction('UPDATE_PASSWORD', `${window.location.origin}/profile`);
  };

  return (
    <Box sx={securityRowSx}>
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
          justifyContent: 'space-between',
          alignItems: ['stretch', 'center'],
          gap: 3,
        }}
      >
        <Box>
          <Text
            as="div"
            sx={{
              fontFamily: 'default',
              fontWeight: 'bold',
              fontSize: 2,
              lineHeight: 3,
              color: 'black',
            }}
          >
            {t('Manage password')}
          </Text>
          {passwordLastUpdated && (
            <Text
              as="div"
              sx={{
                fontFamily: 'default',
                fontSize: '9px',
                lineHeight: 1,
                fontWeight: 'bold',
                color: 'mediumGrey',
                mt: 2,
              }}
            >
              {t('Last updated {{date}}', { date: formatDateTime(passwordLastUpdated) })}
            </Text>
          )}
        </Box>
        <Button
          variant="secondary"
          sx={{ width: ['100%', 'auto'], flexShrink: 0 }}
          onClick={handleUpdatePassword}
        >
          {t('Update Password')}
        </Button>
      </Flex>
    </Box>
  );
}

ManagePasswordRow.propTypes = {
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
  passwordLastUpdated: PropTypes.string,
};

// Cell shape inside the gray inset panel used by both the 2FA and Recovery Codes
function InsetCell({ label, children, sx }) {
  return (
    <Box sx={sx}>
      <Text
        as="div"
        sx={{
          fontFamily: 'default',
          fontSize: '10px',
          lineHeight: 1,
          fontWeight: 'medium',
          color: 'mediumGrey',
          mb: 1,
        }}
      >
        {label}
      </Text>
      <Text
        as="div"
        sx={{
          fontFamily: 'default',
          fontSize: 1,
          lineHeight: 2,
          color: 'black',
        }}
      >
        {children}
      </Text>
    </Box>
  );
}

InsetCell.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
  sx: PropTypes.object,
};

function TwoFactorRow({ t, trackMetric, mfaStatus, onSetup2fa, onDisable2fa, onRegenerateCodes, loading, error, onRetry }) {
  const enabled = !!mfaStatus.enabled;
  const deviceName = _.get(mfaStatus, 'device.name');
  const deviceRegisteredTime = _.get(mfaStatus, 'device.registeredTime');

  const headingRow = (
    <Flex sx={{ alignItems: 'center', gap: 2, mb: enabled ? 3 : 2, flexWrap: 'wrap' }}>
      <Text
        as="div"
        sx={{
          fontFamily: 'default',
          fontWeight: 'bold',
          fontSize: 2,
          lineHeight: 3,
          color: 'black',
        }}
      >
        {t('Two-factor authentication (2FA)')}
      </Text>
      {loading ? (
        <StatusPill
          label={t('Loading')}
          dotColor="blueGray30"
          bg="blue00"
          color="blueGreyDark"
        />
      ) : error ? (
        <StatusPill
          label={t('Failed to load')}
          dotColor="feedback.danger"
          bg="blue00"
          color="blueGreyDark"
        />
      ) : enabled ? (
        <StatusPill
          label={t('2FA Enabled')}
          dotColor="feedback.success"
          bg="#DAF9E4"
          color="blueGreyDark"
        />
      ) : (
        <StatusPill
          label={t('Disabled')}
          dotColor="blueGray30"
          bg="blue00"
          color="blueGreyDark"
        />
      )}
    </Flex>
  );

  if (enabled) {
    return (
      <Box sx={securityRowSx}>
        {headingRow}
        <Flex
          sx={{
            bg: 'lightestGrey',
            borderRadius: 'default',
            p: 3,
            gap: 3,
            flexDirection: ['column', 'row'],
            alignItems: ['stretch', 'center'],
            justifyContent: 'space-between',
          }}
        >
          <InsetCell label={t('Personal device name')} sx={{ flex: ['unset', 1], minWidth: 0 }}>
            {deviceName || '—'}
          </InsetCell>
          <InsetCell label={t('Created')} sx={{ flex: ['unset', 1], minWidth: 0 }}>
            {formatDateTime(deviceRegisteredTime) || '—'}
          </InsetCell>
          <Button
            variant="danger"
            sx={{ width: ['100%', 'auto'], flexShrink: 0 }}
            onClick={onDisable2fa}
          >
            {t('Disable 2FA')}
          </Button>
        </Flex>
        <Box mt={4}>
          <RecoveryCodesRow
            t={t}
            trackMetric={trackMetric}
            mfaStatus={mfaStatus}
            onRegenerateCodes={onRegenerateCodes}
          />
        </Box>
      </Box>
    );
  }

  // loading / error / disabled — keep the heading-+-paragraph / button-on-right shape.
  return (
    <Box sx={securityRowSx}>
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
          justifyContent: 'space-between',
          alignItems: ['stretch', 'flex-start'],
          gap: 3,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {headingRow}
          <Text
            as="p"
            sx={{
              fontFamily: 'default',
              fontSize: 0,
              lineHeight: 1,
              color: 'blueGreyLight',
              m: 0,
            }}
          >
            {t(
              'Protect your Tidepool account with an extra layer of security. Two-factor authentication (2FA) helps keep your account secure, even if your password is compromised.'
            )}
          </Text>
        </Box>
        {loading ? (
          <Button
            variant="primary"
            sx={{ width: ['100%', 'auto'], flexShrink: 0 }}
            processing
            disabled
          >
            {t('Fetching 2FA Status')}
          </Button>
        ) : error ? (
          <Button
            variant="primary"
            sx={{ width: ['100%', 'auto'], flexShrink: 0 }}
            onClick={onRetry}
          >
            {t('Re-fetch 2FA Status')}
          </Button>
        ) : (
          <Button
            variant="primary"
            sx={{ width: ['100%', 'auto'], flexShrink: 0 }}
            onClick={onSetup2fa}
          >
            {t('Set up 2FA')}
          </Button>
        )}
      </Flex>
    </Box>
  );
}

TwoFactorRow.propTypes = {
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
  mfaStatus: PropTypes.object.isRequired,
  onSetup2fa: PropTypes.func.isRequired,
  onDisable2fa: PropTypes.func.isRequired,
  onRegenerateCodes: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.bool.isRequired,
  onRetry: PropTypes.func.isRequired,
};

function RecoveryCodesInfoContent({ t }) {
  return (
    <Box sx={{ maxWidth: ['90vw', '24em'] }}>
      <Icon
        variant="static"
        theme={baseTheme}
        icon={InfoOutlinedIcon}
        label={t('Recovery codes information')}
        sx={{ color: 'mediumGrey', fontSize: '20px', mb: 2 }}
      />
      <Text as="p" sx={{ m: 0, mb: 3, fontFamily: 'default', fontSize: 1, lineHeight: 2, color: 'text.primary' }}>
        {t('Recovery codes are a backup option if you cannot access your authenticator app.')}
      </Text>
      <Text as="p" sx={{ m: 0, mb: 3, fontFamily: 'default', fontSize: 1, lineHeight: 2, color: 'text.primary' }}>
        {t('You’ll receive 12 single-use codes. Each code works once and then expires. Generating a new set will deactivate previous codes.')}
      </Text>
      <Text as="p" sx={{ m: 0, fontFamily: 'default', fontSize: 1, lineHeight: 2, color: 'text.primary' }}>
        {t('Keep them stored securely for future use.')}{' '}
        <Link
          href={URL_SUPPORT_RECOVERY_CODES}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'indigo30', textDecoration: 'underline' }}
        >
          {t('Refer to Tidepool’s recommended methods for safely storing your recovery codes.')}
        </Link>
      </Text>
    </Box>
  );
}

RecoveryCodesInfoContent.propTypes = {
  t: PropTypes.func.isRequired,
};

function RecoveryCodesRow({ t, trackMetric, mfaStatus, onRegenerateCodes }) {
  const used = _.get(mfaStatus, 'recoveryCodes.used', 0);
  const total = _.get(mfaStatus, 'recoveryCodes.total', RECOVERY_CODES_TOTAL);
  const generatedTime = _.get(mfaStatus, 'recoveryCodes.generatedTime');
  const lowCodes = used >= RECOVERY_CODES_WARNING_THRESHOLD;

  return (
    <Box>
      <Flex sx={{ alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Text
          as="div"
          sx={{
            fontFamily: 'default',
            fontWeight: 'bold',
            fontSize: 2,
            lineHeight: 3,
            color: 'black',
          }}
        >
          {t('Recovery Codes')}
        </Text>
        <PopoverLabel
          id="recovery-codes-info-popover"
          icon={InfoOutlinedIcon}
          iconLabel={t('About recovery codes')}
          iconProps={{ sx: { color: 'mediumGrey', fontSize: '20px' } }}
          popoverContent={<RecoveryCodesInfoContent t={t} />}
          popoverProps={{
            anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
            transformOrigin: { vertical: 'top', horizontal: 'center' },
            padding: '20px',
            sx: { width: 'auto' },
          }}
          triggerOnHover
        />
      </Flex>
      <Flex
        sx={{
          bg: 'lightestGrey',
          borderRadius: 'default',
          p: 3,
          gap: 3,
          flexDirection: ['column', 'row'],
          alignItems: ['stretch', 'center'],
          justifyContent: 'space-between',
        }}
      >
        <InsetCell label={t('Recovery codes used')} sx={{ flex: ['unset', 1], minWidth: 0 }}>
          {t('{{used}}/{{total}} used', { used, total })}
        </InsetCell>
        <InsetCell label={t('Created')} sx={{ flex: ['unset', 1], minWidth: 0 }}>
          {formatDateTime(generatedTime) || '—'}
        </InsetCell>
        <Button
          variant="secondary"
          sx={{ width: ['100%', 'auto'], flexShrink: 0 }}
          onClick={onRegenerateCodes}
        >
          {t('Regenerate Codes')}
        </Button>
      </Flex>
      {lowCodes && (
        <Flex sx={{ alignItems: 'center', gap: 2, mt: 3, color: 'feedback.danger' }}>
          <Icon
            variant="static"
            theme={baseTheme}
            icon={ReportProblemRoundedIcon}
            label="low-recovery-codes-warning"
            sx={{ color: 'feedback.danger', fontSize: '1.25em' }}
          />
          <Text as="span" sx={{ color: 'feedback.danger', fontFamily: 'default', fontSize: 0, lineHeight: 1 }}>
            {t('You are running low on recovery codes. Regenerate to receive a new set.')}
          </Text>
        </Flex>
      )}
    </Box>
  );
}

RecoveryCodesRow.propTypes = {
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
  mfaStatus: PropTypes.object.isRequired,
  onRegenerateCodes: PropTypes.func.isRequired,
};

export function UserProfile({ trackMetric, history, api, location }) {
  const { t } = useTranslation();
  const { set: setToast } = useToasts();
  const user = useSelector(selectUser);
  const { data: mfaData, isLoading, isFetching, isError, refetch } = useGetMfaStatusQuery();
  const mfaStatus = mfaData ?? MFA_STATUS_DEFAULT;
  const mfaLoading = isLoading || isFetching;
  const mfaFailed = isError;
  const previousMfaFailed = usePrevious(isError);

  const isClinician = personUtils.isClinicianAccount(user);
  const isSSO = personUtils.isSSOAccount(user);
  const passwordLastUpdated = _.get(user, 'passwordLastUpdated');

  const [editOpen, setEditOpen] = useState(false);
  const [setup2faOpen, setSetup2faOpen] = useState(false);
  const [disable2faOpen, setDisable2faOpen] = useState(false);
  const [regenerate2faCodesOpen, setRegenerate2faCodesOpen] = useState(false);

  useEffect(() => {
    trackMetric('Viewed Account Settings');
  }, [trackMetric]);

  useEffect(() => {
    // The 2FA banner deep-links here with this flag. Location state is dropped on the next
    // navigation, so a refresh or keycloak round-trip won't re-open the dialog.
    if (location?.state?.openMfaSetup && isClinician && !isSSO) {
      setSetup2faOpen(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.state?.openMfaSetup]);

  useEffect(() => {
    if (isError && !previousMfaFailed) {
      setToast({
        message: t('We couldn’t load your two-factor authentication status. Please try again.'),
        variant: 'danger',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  const handleRetryMfaStatus = () => {
    refetch();
  };

  useEffect(() => {
    // Keycloak's AIA flow returns kc_action_status in the URL fragment
    // (response_mode=fragment is the default for application-initiated actions).
    // Toast is per-action: UPDATE_PASSWORD, CONFIGURE_TOTP, delete_credential, and
    // CONFIGURE_RECOVERY_AUTHN_CODES fire on all statuses, UPDATE_EMAIL fires only
    // on cancelled/error (success stays silent since the user is logged out in
    // that flow). Variant is per-status: cancelled -> info (a benign user cancel),
    // error -> danger, success -> success.
    const hashStr = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    const params = new URLSearchParams(hashStr);
    const action = params.get('kc_action');
    const status = params.get('kc_action_status');
    let toast = null;
    if (action === 'UPDATE_PASSWORD') {
      if (status === 'cancelled') {
        toast = { message: t('Password reset {{status}}.', { status }), variant: 'info' };
      } else if (status === 'error') {
        toast = { message: t('Password reset {{status}}.', { status }), variant: 'danger' };
      } else if (status === 'success') {
        toast = {
          message: t('Password reset successful. You can now log in using your new password.'),
          variant: 'success',
        };
      }
    } else if (action === 'UPDATE_EMAIL') {
      if (status === 'cancelled') {
        toast = { message: t('Email update {{status}}.', { status }), variant: 'info' };
      } else if (status === 'error') {
        toast = { message: t('Email update {{status}}.', { status }), variant: 'danger' };
      }
    } else if (action === 'CONFIGURE_TOTP') {
      if (status === 'cancelled') {
        toast = { message: t('Two-factor authentication setup {{status}}.', { status }), variant: 'info' };
      } else if (status === 'error') {
        toast = {
          message: t('We couldn’t complete set up. Your account security hasn’t changed, please try again.'),
          variant: 'danger',
        };
      } else if (status === 'success') {
        toast = {
          message: t('Two-factor authentication (2FA) is now enabled. You’ll be asked for a verification code the next time you log in.'),
          variant: 'success',
        };
      }
    } else if (action === 'delete_credential' || action?.startsWith('delete_credential:')) {
      if (status === 'cancelled') {
        toast = { message: t('Disabling 2FA {{status}}.', { status }), variant: 'info' };
      } else if (status === 'error') {
        toast = {
          message: t('We couldn’t disable two-factor authentication (2FA). Your security settings haven’t changed, please try again.'),
          variant: 'danger',
        };
      } else if (status === 'success') {
        toast = {
          message: t('Two-factor authentication (2FA) has been disabled. You will now log in using only your email and password.'),
          variant: 'success',
        };
      }
    } else if (action === 'CONFIGURE_RECOVERY_AUTHN_CODES') {
      if (status === 'cancelled') {
        toast = { message: t('Recovery code regeneration {{status}}.', { status }), variant: 'info' };
      } else if (status === 'error') {
        toast = {
          message: t('Recovery code regeneration failed. Please try again.'),
          variant: 'danger',
        };
      } else if (status === 'success') {
        toast = {
          message: t('You have successfully generated a new set of recovery codes.'),
          variant: 'success',
        };
      }
    } else {
      return;
    }
    if (toast) setToast(toast);
    params.delete('kc_action_status');
    params.delete('kc_action');
    const remaining = params.toString();
    const newHash = remaining ? `#${remaining}` : '';
    window.history.replaceState(null, '', window.location.pathname + window.location.search + newHash);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditPersonalDetails = () => {
    trackMetric(TRACK_METRICS.editPersonalDetails);
    setEditOpen(true);
  };

  const handleSetup2fa = () => {
    trackMetric(TRACK_METRICS.setUp2fa);
    setSetup2faOpen(true);
  };

  const handleDisable2fa = () => {
    trackMetric(TRACK_METRICS.disable2fa);
    setDisable2faOpen(true);
  };

  const handleRegenerateCodes = () => {
    trackMetric(TRACK_METRICS.regenerateCodes);
    setRegenerate2faCodesOpen(true);
  };

  const handleBack = (e) => {
    e.preventDefault();
    trackMetric(TRACK_METRICS.back);
    if (history?.goBack) history.goBack();
  };

  return (
    <Box className="profile">
      <Box variant="containers.largeBordered" mb={4}>
        <Flex
          px={4}
          py="12px"
          sx={{
            alignItems: 'center',
            justifyContent: ['center', 'space-between'],
            flexWrap: ['wrap', null, 'nowrap'],
            gap: 3,
          }}
        >
          <Flex sx={{ alignItems: 'center', gap: 3 }}>
            <Button
              id="account-settings-back"
              onClick={handleBack}
              icon={ChevronLeftRoundedIcon}
              iconLabel={t('Back')}
              iconPosition="left"
              iconFontSize="1em"
              variant="textSecondary"
              sx={{ fontSize: 0, color: 'blueGreyDark' }}
              pl={0}
            >
              {t('Back')}
            </Button>
            <Box sx={{ borderLeft: '1px solid', borderColor: 'gray10', alignSelf: 'stretch', mx: 1 }} />
            <Text
              as="span"
              sx={{
                fontFamily: 'default',
                fontSize: '18px',
                lineHeight: '32px',
                fontWeight: 'medium',
                color: 'blueGreyDark',
              }}
            >
              {t('Account Settings')}
            </Text>
          </Flex>
          <Link
            href={URL_SUPPORT_ACCOUNT_SETTINGS}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              fontFamily: 'default',
              fontSize: 0,
              fontWeight: 'medium',
              color: 'purpleMedium',
              textDecoration: 'underline',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            <Icon
              variant="static"
              theme={baseTheme}
              icon={OpenInNewRoundedIcon}
              label="external-link"
              sx={{ fontSize: 1, color: 'purpleMedium' }}
            />
            {t('Get support managing your account')}
          </Link>
        </Flex>
      </Box>

      <Box variant="containers.largeBordered" mb={8}>
        <Flex
          px={4}
          py={2}
          sx={{ borderBottom: baseTheme.borders.thick, alignItems: 'center' }}
        >
          <Text
            as="span"
            sx={{
              fontFamily: 'default',
              fontSize: '18px',
              lineHeight: '32px',
              fontWeight: 'medium',
              color: 'blueGreyDark',
            }}
          >
            {t('Profile & Security Settings')}
          </Text>
        </Flex>

        <Box mx={4} py={4}>
          <Flex sx={{ flexDirection: 'column', gap: 4 }}>
            <ProfileSection
              user={user}
              isClinician={isClinician}
              t={t}
              onEdit={handleEditPersonalDetails}
            />

            <Box sx={{ borderTop: '1px solid', borderColor: 'gray10' }} />

            <Text
              as="div"
              sx={{
                fontFamily: 'default',
                fontSize: '18px',
                lineHeight: '32px',
                fontWeight: 'medium',
                color: 'blueGreyDark',
              }}
            >
              {t('Security')}
            </Text>

            {isSSO ? (
              <SecuritySSONotice t={t} />
            ) : (
              <Flex sx={{ flexDirection: 'column', gap: 4 }}>
                <ManagePasswordRow
                  t={t}
                  trackMetric={trackMetric}
                  passwordLastUpdated={passwordLastUpdated}
                />
                {isClinician && (
                  <TwoFactorRow
                    t={t}
                    trackMetric={trackMetric}
                    mfaStatus={mfaStatus}
                    onSetup2fa={handleSetup2fa}
                    onDisable2fa={handleDisable2fa}
                    onRegenerateCodes={handleRegenerateCodes}
                    loading={mfaLoading}
                    error={mfaFailed}
                    onRetry={handleRetryMfaStatus}
                  />
                )}
              </Flex>
            )}
          </Flex>
        </Box>
      </Box>

      <EditPersonalDetailsDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        trackMetric={trackMetric}
      />

      <SetupTwoFactorInstructionsDialog
        open={setup2faOpen}
        onClose={() => setSetup2faOpen(false)}
      />

      <DisableTwoFactorConfirmDialog
        open={disable2faOpen}
        onClose={() => setDisable2faOpen(false)}
        credentialId={mfaStatus.device.id}
      />

      <RegenerateRecoveryCodesConfirmDialog
        open={regenerate2faCodesOpen}
        onClose={() => setRegenerate2faCodesOpen(false)}
      />
    </Box>
  );
}

UserProfile.propTypes = {
  trackMetric: PropTypes.func.isRequired,
  history: PropTypes.object,
  api: PropTypes.object.isRequired,
  location: PropTypes.object,
};

UserProfile.defaultProps = {
  trackMetric: noop,
};

export default UserProfile;
