import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import noop from 'lodash/noop';
import { Box, Divider, Link } from 'theme-ui';
import EditIcon from '@material-ui/icons/EditRounded';

import * as actions from '../../redux/actions';
import Button from './../../components/elements/Button';
import DataConnections from './DataConnections';
import PatientDetails from './PatientDetails';
import { clinicPatientFromAccountInfo } from '../../core/personutils';
import { useToasts } from './../../providers/ToastProvider';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '../../components/elements/Dialog';

import { Body1, MediumTitle, Subheading } from '../../components/elements/FontStyles';
import api from '../../core/api';
import { useIsFirstRender, usePrevious } from '../../core/hooks';
import i18next from '../../core/language';
import { URL_TIDEPOOL_EXTERNAL_DATA_CONNECTIONS, URL_UPLOADER_DOWNLOAD_PAGE } from '../../core/constants';
import PatientEmailModal from './PatientEmailModal';

const t = i18next.t.bind(i18next);

export const DataConnectionsModal = (props) => {
  const {
    open,
    onClose,
    onBack,
    patient,
    trackMetric,
  } = props;

  const isFirstRender = useIsFirstRender();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const { updatingClinicPatient } = useSelector((state) => state.blip.working);
  const previousUpdatingClinicPatient = usePrevious(updatingClinicPatient);
  const patientData = (patient?.profile) ? clinicPatientFromAccountInfo(patient) : patient;
  const [showPatientEmailModal, setShowPatientEmailModal] = useState(false);
  const [processingEmailUpdate, setProcessingEmailUpdate] = useState(false);
  const [patientEmailFormContext, setPatientEmailFormContext] = useState();
  const dispatch = useDispatch();

  const fetchPatientDetails = useCallback(() => {
    dispatch(actions.async.fetchPatientFromClinic(api, selectedClinicId, patient.id));
  }, [dispatch, patient.id, selectedClinicId])

  // Pull the patient on load to ensure the most recent dexcom connection state is made available
  useEffect(() => {
    if (selectedClinicId && patient?.id) fetchPatientDetails();
  }, []);

  const handleEditPatientEmailOpen = () => {
    trackMetric('Data Connections - edit patient email', { selectedClinicId });
    setShowPatientEmailModal(true);
  };

  const handleEditPatientEmailClose = () => {
    setShowPatientEmailModal(false);
  };

  function handleEditPatientEmailFormChange(formikContext) {
    setPatientEmailFormContext({ ...formikContext });
  }

  const handleEditPatientEmailConfirm = () => {
    trackMetric('Data Connections - edit patient email confirmed', { selectedClinicId });
    patientEmailFormContext?.handleSubmit();
    setProcessingEmailUpdate(true);
  };

  const handleEditPatientEmailComplete = useCallback(() => {
    fetchPatientDetails();
    setShowPatientEmailModal(false);
  }, [fetchPatientDetails, setShowPatientEmailModal]);

  useEffect(() => {
    const { inProgress, completed, notification } = updatingClinicPatient;
    const prevInProgress = previousUpdatingClinicPatient?.inProgress;

    if (!isFirstRender && !inProgress && prevInProgress !== false) {
      if (completed) {
        handleEditPatientEmailComplete();

        setToast({
          message: t('You have successfully updated the patient email address.'),
          variant: 'success',
        });
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }

      setProcessingEmailUpdate(false);
    }
  }, [
    handleEditPatientEmailComplete,
    isFirstRender,
    updatingClinicPatient,
    previousUpdatingClinicPatient?.inProgress,
    setToast,
  ]);

  return (
    <>
      <Dialog
        id="data-connections"
        aria-labelledby="dialog-title"
        maxWidth="md"
        disablePortal
        open={open}
        onClose={onClose}
      >
        <DialogTitle onBack={onBack} onClose={onClose}>
          <MediumTitle id="data-connections-title">{t('Bring Data into Tidepool')}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <PatientDetails mb={3} patient={patientData} />
          <Subheading sx={{ fontWeight: 'bold'}}>{t('Connect a Device Account')}</Subheading>

          <Box mb={3}>
            <Body1 sx={{ fontWeight: 'medium'}}>
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

            {patientData?.email && patient?.permissions?.custodian && (
              <Body1 sx={{ fontWeight: 'medium'}}>
                {t('Email:')}
                <Button
                  variant="textPrimaryLink"
                  onClick={handleEditPatientEmailOpen}
                  icon={EditIcon}
                  iconFontSize={2}
                  iconLabel={t('Edit Icon')}
                  iconPosition="right"
                >
                  {patientData.email}
                </Button>
              </Body1>
            )}
          </Box>

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

          {showPatientEmailModal && <PatientEmailModal
            action="edit"
            open
            onClose={handleEditPatientEmailClose}
            onFormChange={handleEditPatientEmailFormChange}
            onSubmit={handleEditPatientEmailConfirm}
            patient={patientData}
            processing={processingEmailUpdate}
            trackMetric={trackMetric}
          />}
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
    </>
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
