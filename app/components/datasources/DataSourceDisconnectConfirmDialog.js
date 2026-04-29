import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Text } from 'theme-ui';

import Button from '../elements/Button';
import { Body1, MediumTitle } from '../elements/FontStyles';
import { providers } from './DataConnections';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../elements/Dialog';

export const DataSourceDisconnectConfirmDialog = (props) => {
  const { t, onClose, onConfirm, open, patient, providerName } = props;
  const { disconnectingDataSource } = useSelector((state) => state.blip.working);
  const providerDisplayName = providers[providerName]?.displayName;

  return (
    <Dialog
      id="dataSourceDisconnectConfirm"
      aria-labelledby="dialog-title"
      open={open}
      onClose={onClose}
    >
      <DialogTitle onClose={onClose}>
        <MediumTitle id="dialog-title">{t('Disconnect {{providerDisplayName}}?', { providerDisplayName })}</MediumTitle>
      </DialogTitle>
      <DialogContent>
        <Body1>
          <Trans>
            <Text>
              Are you sure you want to disconnect <Text as='span' fontWeight='bold'>{{provider: providerDisplayName}}</Text> from <Text as='span' fontWeight='bold'>{{patientName: patient?.fullName || patient?.email}}</Text>{"'"}s account?
            </Text>
          </Trans>
          <Text mt={2} sx={{ display: 'block' }}>
            {t('Disconnecting will stop the data flow and you will no longer receive new data from this device. To reconnect, a new invite must be sent.')}
          </Text>
        </Body1>
      </DialogContent>
      <DialogActions>
        <Button variant="secondary" onClick={onClose}>
          {t('Cancel')}
        </Button>
        <Button
          className="clinician-disconnect-data-source"
          variant="danger"
          processing={disconnectingDataSource?.inProgress}
          onClick={onConfirm}
        >
          {t('Yes, Disconnect')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DataSourceDisconnectConfirmDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  open: PropTypes.bool,
  patient: PropTypes.object,
  providerName: PropTypes.string,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(DataSourceDisconnectConfirmDialog);
