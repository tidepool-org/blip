import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { trackMetric } from '../../../core/metricUtils';

import keys from 'lodash/keys';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';
import { fieldsAreValid } from '../../../core/forms';
import { patientSchema as validationSchema } from '../../../core/clinicUtils';

import Button from '../../../components/elements/Button';
import { Dialog, DialogContent, DialogTitle, DialogActions } from '../../../components/elements/Dialog';
import { MediumTitle } from '../../../components/elements/FontStyles';
import PatientForm from '../../../components/clinic/PatientForm';

const SEARCH_DEBOUNCE_MS = 1000;

const EditPatientDialog = ({
  api,
  patient,
  onClose = noop,
}) => {
  const { t } = useTranslation();
  const updatingClinicPatient = useSelector(state => state.blip.working.updatingClinicPatient);
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);

  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const mrnSettings = clinic?.mrnSettings ?? {};

  const clinicMRNsForPatientFormValidation = useSelector(state => state.blip.clinicMRNsForPatientFormValidation);
  // Patient's pre-existing MRN will already exist in clinic, so it needs to not trip the validator
  const existingMRNs = clinicMRNsForPatientFormValidation?.filter(mrn => mrn !== patient?.mrn) || [];

  const [formContext, setFormContext] = useState(null);

  const handleFormChange = (formikContext) => setFormContext({ ...formikContext });

  const handleClose = () => onClose();

  const handleConfirm = () => {
    trackMetric('Clinic - Edit patient confirmed', { clinicId: selectedClinicId });
    const updatedTags = [...(formContext?.values?.tags || [])];
    const existingTags = [...(patient?.tags || [])];

    if (!isEqual(updatedTags.sort(), existingTags.sort())) {
      trackMetric('Clinic - Population Health - Edit patient tags confirm', { clinicId: selectedClinicId });
    }

    formContext?.handleSubmit();
  };

  return (
    <Dialog
      id="editPatient"
      aria-labelledby="dialog-title"
      open={true}
      onClose={handleClose}
    >
      <DialogTitle onClose={() => {
        trackMetric('Clinic - Edit patient close', { clinicId: selectedClinicId });
        handleClose()
      }}>
        <MediumTitle id="dialog-title">{t('Edit Patient Details')}</MediumTitle>
      </DialogTitle>

      <DialogContent>
        <PatientForm
          api={api}
          trackMetric={trackMetric}
          onFormChange={handleFormChange}
          patient={patient}
          searchDebounceMs={SEARCH_DEBOUNCE_MS}
          action="edit"
        />
      </DialogContent>

      <DialogActions>
        <Button id="editPatientCancel" variant="secondary" onClick={() => {
          trackMetric('Clinic - Edit patient cancel', { clinicId: selectedClinicId, source: 'Patients list' });
          handleClose()
        }}>
          {t('Cancel')}
        </Button>

        <Button
          id="editPatientConfirm"
          variant="primary"
          onClick={handleConfirm}
          processing={updatingClinicPatient.inProgress}
          disabled={!fieldsAreValid(keys(formContext?.values), validationSchema({mrnSettings, existingMRNs}), formContext?.values)}
        >
          {t('Save Changes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditPatientDialog;
