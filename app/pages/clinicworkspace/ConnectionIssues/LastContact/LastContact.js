import React from 'react';
import HoverButton from '../../../../components/elements/HoverButton';
import { useResendInviteMutation } from './lastContactApi';
import { useSelector } from 'react-redux';
import { useToasts } from '../../../../providers/ToastProvider';
import { useTranslation } from 'react-i18next';
import Icon from '../../../../components/elements/Icon';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import { getDaysAgo } from '../helpers';
import { Text } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';
import moment from 'moment-timezone';
import { ISSUE_TYPE } from '../connectionIssuesApi';
import { getCurrentDataSourceForProvider } from '../../../../components/datasources/DataConnections';

const { STALE_INVITE, EXPIRED_INVITE, STALE_DATA, DISCONNECTED, ERROR } = ISSUE_TYPE;

const getHasActionedBefore = (patient, providerConnectionRequests) => {
  const { connectionIssueSource, connectionIssue: { cause } } = patient;

  // Invite Issues
  const isInviteIssue = (cause === STALE_INVITE || cause === EXPIRED_INVITE);

  if (isInviteIssue) {
    return providerConnectionRequests.length > 1;
  }

  // Data Source Issues
  const lastInvitedAt = providerConnectionRequests[0]?.createdTime;
  const dataSource = getCurrentDataSourceForProvider(patient, connectionIssueSource);

  if (!lastInvitedAt) return false;

  const effectiveTime = (() => {
    switch(cause) {
      case STALE_DATA: return dataSource?.latestDataTime;
      case DISCONNECTED: return dataSource?.modifiedTime;
      case ERROR: return dataSource?.modifiedTime;
    }
  })();

  return moment.utc(lastInvitedAt).isAfter(moment.utc(effectiveTime));
};

const LastContact = ({ patient }) => {
  const { t } = useTranslation();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);

  const [resendInvite, { isLoading: isResendingInvite }] = useResendInviteMutation();

  const { connectionIssueSource: providerName } = patient;

  const handleClick = () => {
    resendInvite({ clinicId: selectedClinicId, patientId: patient.id, providerName })
      .unwrap()
      .then(() => {
        setToast({
          message: t('Invite Resent'),
          variant: 'success',
        });
      });
  };

  if (!providerName) return null;

  // If the clinic has already taken action at least once, render a different copy to indicate it
  const providerConnectionRequests = patient?.connectionRequests?.[providerName] || [];
  const lastInvitedAt = providerConnectionRequests[0]?.createdTime;
  const hasActionedBefore = getHasActionedBefore(patient, providerConnectionRequests);

  const daysAgo = getDaysAgo(lastInvitedAt);
  const isLastActionedToday = daysAgo === 0;

  const cellText = (() => {
    switch(daysAgo) {
      case null: return '-';
      case 0: return t('Today');
      default: return t('{{daysAgo}} days ago', { daysAgo });
    }
  })();

  return (
    <HoverButton
      buttonText={hasActionedBefore ? t('Send Follow-Up') : t('Resend Invite')}
      buttonProps={{
        onClick: handleClick,
        variant: 'quickActionCondensed',
        processing: isResendingInvite,
      }}
      hideChildrenOnHover={true}
    >
      <Text sx={{
        color: isLastActionedToday ? vizColors.green50 : vizColors.gold50,
        fontWeight: 'medium',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}>
        {isLastActionedToday && <Icon variant="static" icon={CheckRoundedIcon} />}
        {cellText}
      </Text>
    </HoverButton>
  );
};

export default LastContact;
