import React from 'react';
import { withTranslation } from 'react-i18next';
import { CONNECTION_STATUS } from './index';
import Button from '../../elements/Button';

const Actions = withTranslation()(({ t, status, onCopy, onResendEmail }) => {
  if (status === CONNECTION_STATUS.CONNECTED) return null;

  return (
    <>
      <Button onClick={onCopy}>
        {t('Copy')}
      </Button>
      <Button onClick={onResendEmail}>
        {t('Resend Email')}
      </Button>
    </>
  );
});

export default Actions;