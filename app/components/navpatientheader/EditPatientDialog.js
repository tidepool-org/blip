import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFirstRender, usePrevious } from '../../core/hooks';
import { useTranslation } from 'react-i18next';
import { selectClinicPatient } from '../../core/selectors';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '../elements/Dialog';
import { MediumTitle } from '../elements/FontStyles';
import Button from '../elements/Button';
import PatientForm from '../clinic/PatientForm';
import noop from 'lodash/noop';
import * as actions from '../../redux/actions';

const useUpdateClinicPatient = ({ onUpdateSuccess = noop }) => {
  const updatingClinicPatient = useSelector((state) => state.blip.working.updatingClinicPatient);
  const { inProgress, completed } = updatingClinicPatient;
  const prevInProgress = usePrevious(inProgress);
  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    if (!isFirstRender && !inProgress && prevInProgress !== false && completed) {
      onUpdateSuccess();
    }
  }, [onUpdateSuccess, isFirstRender, inProgress, prevInProgress, completed]);

  return updatingClinicPatient;
};

const EditPatientDialog = ({
  api,
  trackMetric,
  isOpen,
  handleCloseOverlays = noop,
  searchDebounceMs = 1000,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const currentPatientInViewId = useSelector(state => state.blip.currentPatientInViewId);
  const clinicPatient = useSelector(state => selectClinicPatient(state));

  const onUpdateSuccess = () => {
    if (isOpen) handleCloseOverlays();
    dispatch(actions.worker.dataWorkerRemoveDataRequest(null, currentPatientInViewId));
  };

  const updatingClinicPatient = useUpdateClinicPatient({ onUpdateSuccess });

  const [patientFormContext, setPatientFormContext] = useState();

  const handleEditPatientConfirm = () => {
    patientFormContext?.handleSubmit();
  };

  const handlePatientFormChange = (formikContext) => {
    setPatientFormContext({ ...formikContext });
  };

  const isSubmitDisabled = false; // !fieldsAreValid(keys(patientFormContext?.values), validationSchema({mrnSettings, existingMRNs}), patientFormContext?.values)

  return (
    <Dialog
      id="editPatient"
      aria-labelledby="dialog-title"
      open={isOpen}
      onClose={handleCloseOverlays}
    >
      <DialogTitle onClose={() => {
        trackMetric('Clinic - Edit patient close', { clinicId: selectedClinicId });
        handleCloseOverlays();
      }}>
        <MediumTitle id="dialog-title">{t('Edit Patient Details')}</MediumTitle>
      </DialogTitle>

      <DialogContent>
        <PatientForm
          api={api}
          trackMetric={trackMetric}
          onFormChange={handlePatientFormChange}
          patient={clinicPatient}
          searchDebounceMs={searchDebounceMs}
          action="edit"
        />
      </DialogContent>

      <DialogActions>
        <Button id="editPatientCancel" variant="secondary" onClick={() => {
          trackMetric('Clinic - Edit patient cancel', { clinicId: selectedClinicId, source: 'Patients list' });
          handleCloseOverlays();
        }}>
          {t('Cancel')}
        </Button>

        <Button
          id="editPatientConfirm"
          variant="primary"
          onClick={handleEditPatientConfirm}
          processing={updatingClinicPatient.inProgress}
          disabled={isSubmitDisabled}
        >
          {t('Save Changes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPatientDialog;
