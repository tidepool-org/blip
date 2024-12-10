import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { Divider, Link } from 'theme-ui';

import Button from './../../components/elements/Button';
import DataConnections from './DataConnections';
import PatientDetails from './PatientDetails';
import { clinicPatientFromAccountInfo } from '../../core/personutils';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '../../components/elements/Dialog';

import { Body1, MediumTitle, Subheading } from '../../components/elements/FontStyles';
import api from '../../core/api';
import i18next from '../../core/language';
import { URL_TIDEPOOL_EXTERNAL_DATA_CONNECTIONS, URL_UPLOADER_DOWNLOAD_PAGE } from '../../core/constants';

const t = i18next.t.bind(i18next);

export const DataConnectionsModal = (props) => {
  const {
    open,
    onClose,
    onBack,
    patient,
    trackMetric,
  } = props;

  const patientData = (patient?.profile) ? clinicPatientFromAccountInfo(patient) : patient;

  return (
    <Dialog
      id="data-connections"
      aria-labelledby="dialog-title"
      maxWidth="md"
      open={open}
      onClose={onClose}
    >
      <DialogTitle onBack={onBack} onClose={onClose}>
        <MediumTitle id="data-connections-title">{t('Bring Data into Tidepool')}</MediumTitle>
      </DialogTitle>

      <DialogContent>
        <PatientDetails mb={3} patient={patientData} />
        <Subheading sx={{ fontWeight: 'bold'}}>{t('Connect a Device Account')}</Subheading>

        <Body1 mb={3} sx={{ fontWeight: 'medium'}}>
          {t('Invite patients to authorize syncing from these accounts. Only available in the US at this time.')}&nbsp;
          <Link
            id="data-connections-restrictions-link"
            href={URL_TIDEPOOL_EXTERNAL_DATA_CONNECTIONS}
            target="_blank"
            rel="noreferrer noopener"
            sx={{
              fontSize: 1,
              fontWeight: 'medium',
            }}
          >{t('Learn more.')}</Link>
        </Body1>

        <DataConnections mb={4} api={api} patient={patientData} trackMetric={trackMetric} />
        <Divider mb={3} />

        <Body1 sx={{ fontWeight: 'medium'}}>
          {t('Have other devices with data to view? Tidepool supports over 85 devices. To add data from a device directly, search for this patient in')}&nbsp;
          <Link
            id="data-connections-restrictions-link"
            href={URL_UPLOADER_DOWNLOAD_PAGE}
            target="_blank"
            rel="noreferrer noopener"
            sx={{
              fontSize: 1,
              fontWeight: 'medium',
            }}
          >{t('Tidepool Uploader')}</Link>,&nbsp;
          {t('select the devices, and upload.')}&nbsp;
        </Body1>

      </DialogContent>

      <DialogActions>
        <Button
          id="data-connections-close"
          variant="primary"
          onClick={onClose}
        >
          {t('Done')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DataConnectionsModal.propTypes = {
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
  patient: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

DataConnectionsModal.defaultProps = {
  onClose: noop,
  trackMetric: noop,
};


export default DataConnectionsModal;
