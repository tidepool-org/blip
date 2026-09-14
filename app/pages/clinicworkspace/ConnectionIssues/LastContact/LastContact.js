import React from 'react';
import HoverButton from '../../../../components/elements/HoverButton';
import { useResendInviteMutation } from './lastContactApi';
import { useSelector } from 'react-redux';
import { useToasts } from '../../../../providers/ToastProvider';
import { useTranslation } from 'react-i18next';

const LastContact = ({ patient }) => {
  const { t } = useTranslation();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);

  const [resendInvite, { isLoading: isResendingInvite }] = useResendInviteMutation();

  const providerName = 'dexcom'; // TODO: set to primaryProviderName

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

  const processing = false;

  return (
    <HoverButton
      buttonText={t('Resend Invite')}
      buttonProps={{
        onClick: handleClick,
        variant: 'quickActionCondensed',
        processing,
      }}
      hideChildrenOnHover={true}
      processing={isResendingInvite}
    >
      {'-'}
    </HoverButton>
  );
};

export default LastContact;
