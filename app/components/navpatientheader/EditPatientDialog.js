import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFirstRender, usePrevious } from '../../core/hooks';
import { useTranslation } from 'react-i18next';
import { selectClinicPatient } from '../../core/selectors';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '../elements/Dialog';
import { MediumTitle } from '../elements/FontStyles';
import Button from '../elements/Button';
import PatientForm from '../clinic/PatientForm';
import noop from 'lodash/noop';
import keys from 'lodash/keys';
import compact from 'lodash/compact';
import map from 'lodash/map';
import reject from 'lodash/reject';
import { fieldsAreValid } from '../../core/forms';
import { patientSchema as validationSchema } from '../../core/clinicUtils';
import * as actions from '../../redux/actions';

const useUpdatingClinicPatientWorkingState = ({ onUpdateSuccess = noop }) => {
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

const PATIENT_FORM_SEARCH_DEBOUNCE_MS = 1000;

const EditPatientDialog = ({
  api,
  trackMetric,
  isOpen,
  onClose = noop,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const currentPatientInViewId = useSelector(state => state.blip.currentPatientInViewId);
  const clinicPatient = useSelector(state => selectClinicPatient(state));
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const mrnSettings = useMemo(() => clinic?.mrnSettings ?? {}, [clinic?.mrnSettings]);
  const existingMRNs = useMemo(
    () => compact(map(reject(clinic?.patients, { id: currentPatientInViewId }), 'mrn')),
    [clinic?.patients, currentPatientInViewId]
  );

  const onUpdateSuccess = () => {
    if (isOpen) onClose();

    dispatch(actions.worker.dataWorkerRemoveDataRequest(null, currentPatientInViewId));
  };

  const updatingClinicPatient = useUpdatingClinicPatientWorkingState({ onUpdateSuccess });

  const [patientFormContext, setPatientFormContext] = useState();

  const handleEditPatientConfirm = () => {
    patientFormContext?.handleSubmit();
  };

  const handlePatientFormChange = (formikContext) => {
    setPatientFormContext({ ...formikContext });
  };

  return (
    <Dialog
      id="editPatient"
      aria-labelledby="dialog-title"
      open={isOpen}
      onClose={onClose}
    >
      <DialogTitle onClose={() => {
        trackMetric('Clinic - Edit patient close', { clinicId: selectedClinicId });
        onClose();
      }}>
        <MediumTitle id="dialog-title">{t('Edit Patient Details')}</MediumTitle>
      </DialogTitle>

      <DialogContent>
        <PatientForm
          api={api}
          trackMetric={trackMetric}
          onFormChange={handlePatientFormChange}
          patient={clinicPatient}
          searchDebounceMs={PATIENT_FORM_SEARCH_DEBOUNCE_MS}
          action="edit"
        />
      </DialogContent>

      <DialogActions>
        <Button id="editPatientCancel" variant="secondary" onClick={() => {
          trackMetric('Clinic - Edit patient cancel', { clinicId: selectedClinicId, source: 'Patients list' });
          onClose();
        }}>
          {t('Cancel')}
        </Button>

        <Button
          id="editPatientConfirm"
          variant="primary"
          onClick={handleEditPatientConfirm}
          processing={updatingClinicPatient.inProgress}
          disabled={!fieldsAreValid(keys(patientFormContext?.values), validationSchema({ mrnSettings, existingMRNs }), patientFormContext?.values)}
        >
          {t('Save Changes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPatientDialog;
