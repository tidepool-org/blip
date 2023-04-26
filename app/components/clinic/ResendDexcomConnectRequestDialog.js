import React from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Text } from 'rebass/styled-components';
import sundial from 'sundial';

import Button from '../../components/elements/Button';
import { Body1, MediumTitle } from '../../components/elements/FontStyles';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

export const ResendDexcomConnectRequestDialog = (props) => {
  const { t, onClose, onConfirm, open, patient } = props;
  const timePrefs = useSelector((state) => state.blip.timePrefs);
  const { sendingPatientDexcomConnectRequest } = useSelector((state) => state.blip.working);

  const formattedLastRequestedDexcomConnectDate =
    patient?.lastRequestedDexcomConnectTime &&
    sundial.formatInTimezone(
      patient?.lastRequestedDexcomConnectTime,
      timePrefs?.timezoneName ||
        new Intl.DateTimeFormat().resolvedOptions().timeZone,
      'MM/DD/YYYY [at] h:mm a'
    );

  return (
    <Dialog
      id="resendDexcomConnectRequest"
      aria-labelledby="dialog-title"
      open={open}
      onClose={onClose}
    >
      <DialogTitle onClose={onClose}>
        <MediumTitle id="dialog-title">{t('Confirm Resending Connection Request')}</MediumTitle>
      </DialogTitle>
      <DialogContent>
        <Body1>
          {formattedLastRequestedDexcomConnectDate && (
            <Trans>
              <Text>
                You requested <Text as='span' fontWeight='bold'>{{patient: patient?.fullName || patient?.email}}</Text> to connect to <Text as='span' fontWeight='bold'>Dexcom</Text> on <Text as='span' fontWeight='bold'>{{requestDate: formattedLastRequestedDexcomConnectDate}}</Text>.
              </Text>
            </Trans>
          )}
          <Text>
            {t('Are you sure you want to resend this connection request?')}
          </Text>
        </Body1>
      </DialogContent>
      <DialogActions>
        <Button variant="secondary" onClick={onClose}>
          {t('Cancel')}
        </Button>
        <Button
          className="resend-dexcom-connect-request"
          variant="primary"
          processing={sendingPatientDexcomConnectRequest.inProgress}
          onClick={onConfirm}
        >
          {t('Resend Request')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ResendDexcomConnectRequestDialog.propTypes = {
  api: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  open: PropTypes.bool,
  patient: PropTypes.object,
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(ResendDexcomConnectRequestDialog);
