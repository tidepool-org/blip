import React from 'react';
import HoverButton from '../../../../components/elements/HoverButton';
import { useResendInviteMutation } from './lastContactApi';
import { useSelector } from 'react-redux';
import { useToasts } from '../../../../providers/ToastProvider';
import { useTranslation } from 'react-i18next';
import { getActiveDeviceIssue } from '../helpers';

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

  return (
    <HoverButton
      buttonText={t('Resend Invite')}
      buttonProps={{
        onClick: handleClick,
        variant: 'quickActionCondensed',
        processing: isResendingInvite,
      }}
      hideChildrenOnHover={true}
    >
      {'-'}
    </HoverButton>
  );
};

export default LastContact;
