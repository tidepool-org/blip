import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Text } from 'theme-ui';
import sundial from 'sundial';

import Button from '../elements/Button';
import { Body1, MediumTitle } from '../elements/FontStyles';
import { providers } from '../datasources/DataConnections';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../elements/Dialog';

export const ResendDataSourceConnectRequestDialog = (props) => {
  const { t, onClose, onConfirm, open, patient, providerName } = props;
  const timePrefs = useSelector((state) => state.blip.timePrefs);
  const { sendingPatientDataProviderConnectRequest } = useSelector((state) => state.blip.working);
  const providerDisplayName = providers[providerName]?.displayName;

  const formattedLastRequestedDataSourceConnectDate =
    patient?.connectionRequests?.[providerName]?.[0]?.createdTime &&
    sundial.formatInTimezone(
      patient.connectionRequests[providerName][0].createdTime,
      timePrefs?.timezoneName ||
        new Intl.DateTimeFormat().resolvedOptions().timeZone,
      'MM/DD/YYYY [at] h:mm a'
    );

  return (
    <Dialog
      id="resendDataSourceConnectRequest"
      aria-labelledby="dialog-title"
      open={open}
      onClose={onClose}
    >
      <DialogTitle onClose={onClose}>
        <MediumTitle id="dialog-title">{t('Confirm Resending Connection Request')}</MediumTitle>
      </DialogTitle>
      <DialogContent>
        <Body1>
          {formattedLastRequestedDataSourceConnectDate && (
            <Trans>
              <Text>
                You requested <Text as='span' fontWeight='bold'>{{patient: patient?.fullName || patient?.email}}</Text> to connect to <Text as='span' fontWeight='bold'>{{provider: providerDisplayName}}</Text> on <Text as='span' fontWeight='bold'>{{requestDate: formattedLastRequestedDataSourceConnectDate}}</Text>.
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
          className="resend-data-source-connect-request"
          variant="primary"
          processing={sendingPatientDataProviderConnectRequest.inProgress}
          onClick={onConfirm}
        >
          {t('Resend Request')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ResendDataSourceConnectRequestDialog.propTypes = {
  api: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  open: PropTypes.bool,
  patient: PropTypes.object,
  providerName: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(ResendDataSourceConnectRequestDialog);
