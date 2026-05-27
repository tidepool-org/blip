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

import Button from '../../components/elements/Button';
import Icon from '../../components/elements/Icon';
import personUtils from '../../core/personutils';
import { selectMfaStatus } from '../../core/selectors';
import { roles as clinicRoles } from '../../core/clinicUtils';
import { URL_SUPPORT_ACCOUNT_SETTINGS } from '../../core/constants';
import baseTheme from '../../themes/baseTheme';
import { redirectToKeycloakAction } from '../../keycloak';
import { useToasts } from '../../providers/ToastProvider';
import EditPersonalDetailsDialog from './EditPersonalDetailsDialog';
import SetupTwoFactorInstructionsDialog from './SetupTwoFactorInstructionsDialog';

const TRACK_METRICS = {
  back: 'Clicked Back in Account',
  editPersonalDetails: 'Clicked Edit Personal Details in Account',
  updatePassword: 'Clicked Update Password in Account',
  setUp2fa: 'Clicked Set Up 2FA in Account',
  disable2fa: 'Clicked Disable 2FA in Account',
  regenerateCodes: 'Clicked Regenerate Recovery Codes in Account',
};

const RECOVERY_CODES_WARNING_THRESHOLD = 3;

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
              color: 'text.primary',
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
              color: 'text.primary',
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

function TwoFactorRow({ t, trackMetric, mfaStatus, onSetup2fa }) {
  const enabled = !!mfaStatus.enabled;
  const deviceName = _.get(mfaStatus, 'device.name');
  const deviceRegisteredTime = _.get(mfaStatus, 'device.registeredTime');

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
          <Flex sx={{ alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Text
              as="div"
              sx={{
                fontFamily: 'default',
                fontWeight: 'bold',
                fontSize: 2,
                lineHeight: 3,
                color: 'text.primary',
              }}
            >
              {t('Two-factor authentication (2FA)')}
            </Text>
            {enabled ? (
              <StatusPill
                label={t('Enabled')}
                dotColor="feedback.success"
                bg="#DAF9E4"
                color="feedback.success"
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
          {enabled ? (
            <Box>
              {deviceName && (
                <Text as="div" sx={{ fontFamily: 'default', fontSize: 0, lineHeight: 1, color: 'darkGrey', mb: 1 }}>
                  <Text as="span" sx={{ fontWeight: 'medium' }}>{t('Device:')}</Text>{' '}
                  <Text as="span" sx={{ fontWeight: 'bold' }}>{deviceName}</Text>
                </Text>
              )}
              {deviceRegisteredTime && (
                <Text as="div" sx={{ fontFamily: 'default', fontSize: 0, lineHeight: 1, color: 'darkGrey' }}>
                  {t('Registered {{date}}', { date: formatDate(deviceRegisteredTime) })}
                </Text>
              )}
            </Box>
          ) : (
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
          )}
        </Box>
        {enabled ? (
          <Button
            variant="secondary"
            sx={{ width: ['100%', 'auto'], flexShrink: 0 }}
            onClick={() => trackMetric(TRACK_METRICS.disable2fa)}
          >
            {t('Disable 2FA')}
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
};

function RecoveryCodesRow({ t, trackMetric, mfaStatus }) {
  const used = _.get(mfaStatus, 'recoveryCodes.used', 0);
  const total = _.get(mfaStatus, 'recoveryCodes.total', 0);
  const generatedTime = _.get(mfaStatus, 'recoveryCodes.generatedTime');
  const lowCodes = used >= RECOVERY_CODES_WARNING_THRESHOLD;

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
        <Box>
          <Text
            as="div"
            sx={{
              fontFamily: 'default',
              fontWeight: 'bold',
              fontSize: 2,
              lineHeight: 3,
              color: 'text.primary',
              mb: 1,
            }}
          >
            {t('Recovery codes')}
          </Text>
          <Text as="div" sx={{ fontFamily: 'default', fontSize: 0, lineHeight: 1, color: 'darkGrey', mb: 1 }}>
            <Text as="span" sx={{ fontWeight: 'bold' }}>{t('{{used}}/{{total}}', { used, total })}</Text>{' '}
            {t('recovery codes used')}
          </Text>
          {generatedTime && (
            <Text as="div" sx={{ fontFamily: 'default', fontSize: '9px', lineHeight: 1, fontWeight: 'bold', color: 'mediumGrey', mt: 2 }}>
              {t('Generated {{date}}', { date: formatDate(generatedTime) })}
            </Text>
          )}
          {lowCodes && (
            <Flex
              sx={{
                alignItems: 'center',
                gap: 2,
                mt: 3,
                color: 'feedback.danger',
              }}
            >
              <Icon
                variant="static"
                theme={baseTheme}
                icon={ReportProblemRoundedIcon}
                label="low-recovery-codes-warning"
                sx={{ color: 'feedback.danger', fontSize: '1.25em' }}
              />
              <Text as="span" sx={{ color: 'feedback.danger', fontFamily: 'default', fontSize: 0, lineHeight: 1 }}>
                {t(
                  'You are running low on recovery codes. Regenerate to receive a new set.'
                )}
              </Text>
            </Flex>
          )}
        </Box>
        <Button
          variant="secondary"
          sx={{ width: ['100%', 'auto'], flexShrink: 0 }}
          onClick={() => trackMetric(TRACK_METRICS.regenerateCodes)}
        >
          {t('Regenerate Codes')}
        </Button>
      </Flex>
    </Box>
  );
}

RecoveryCodesRow.propTypes = {
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
  mfaStatus: PropTypes.object.isRequired,
};

export function UserProfile({ trackMetric, history, api }) {
  const { t } = useTranslation();
  const { set: setToast } = useToasts();
  const user = useSelector((state) => {
    const allUsersMap = state.blip?.allUsersMap;
    const loggedInUserId = state.blip?.loggedInUserId;
    return allUsersMap && loggedInUserId ? allUsersMap[loggedInUserId] : null;
  });
  const mfaStatus = useSelector(selectMfaStatus);

  const isClinician = personUtils.isClinicianAccount(user);
  const isSSO = personUtils.isSSOAccount(user);
  const passwordLastUpdated = _.get(user, 'passwordLastUpdated');

  const [editOpen, setEditOpen] = useState(false);
  const [setup2faOpen, setSetup2faOpen] = useState(false);

  useEffect(() => {
    trackMetric('Viewed Account Settings');
  }, [trackMetric]);

  useEffect(() => {
    // Keycloak's AIA flow returns kc_action_status in the URL fragment
    // (response_mode=fragment is the default for application-initiated actions).
    // Toast is per-action: UPDATE_PASSWORD and CONFIGURE_TOTP fire on all statuses,
    // UPDATE_EMAIL fires only on cancelled/error (success stays silent since the user
    // is logged out in that flow). Variant is per-status: cancelled -> info (a benign
    // user cancel), error -> danger, success -> success.
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
                  />
                )}
                {isClinician && mfaStatus.enabled && (
                  <RecoveryCodesRow
                    t={t}
                    trackMetric={trackMetric}
                    mfaStatus={mfaStatus}
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
        api={api}
        trackMetric={trackMetric}
      />

      <SetupTwoFactorInstructionsDialog
        open={setup2faOpen}
        onClose={() => setSetup2faOpen(false)}
      />
    </Box>
  );
}

UserProfile.propTypes = {
  trackMetric: PropTypes.func.isRequired,
  history: PropTypes.object,
  api: PropTypes.object.isRequired,
};

UserProfile.defaultProps = {
  trackMetric: noop,
};

export default UserProfile;
