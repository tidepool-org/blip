import React from 'react';
import HoverButton from '../../../../components/elements/HoverButton';
import { useResendInviteMutation } from './lastContactApi';
import { useSelector } from 'react-redux';
import { useToasts } from '../../../../providers/ToastProvider';
import { useTranslation } from 'react-i18next';
import { getActiveDeviceIssue, getDaysAgo } from '../helpers';
import { Text } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';

const LastContact = ({ patient }) => {
  const { t } = useTranslation();
  const { set: setToast } = useToasts();
  const category = useSelector(state => state.blip.connectionIssues.category);
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);

  const [resendInvite, { isLoading: isResendingInvite }] = useResendInviteMutation();

  const deviceIssue = getActiveDeviceIssue(patient, category);
  const providerName = deviceIssue?.providerId;

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

  // If the clinic has already re-invited at least once, render a different copy to indicate it
  const lastInvitedAt = patient?.connectionRequests?.[deviceIssue.providerId]?.[0]?.createdTime;
  const hasActionedBefore = lastInvitedAt > deviceIssue.effectiveTime;

  const buttonLabel = (() => {
    const daysAgo = getDaysAgo(lastInvitedAt);

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
      <Text sx={{ color: vizColors.gold50, fontWeight: 'medium' }}>
        {buttonLabel}
      </Text>
    </HoverButton>
  );
};

export default LastContact;
