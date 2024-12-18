import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import keyBy from 'lodash/keyBy';
import omitBy from 'lodash/omitBy';
import { useFormik } from 'formik';
import { Box, BoxProps } from 'theme-ui';
import compact from 'lodash/compact';
import map from 'lodash/map';
import noop from 'lodash/noop';
import reject from 'lodash/reject';

import * as actions from '../../redux/actions';
import Banner from './../../components/elements/Banner';
import Button from './../../components/elements/Button';
import { getCommonFormikFieldProps } from '../../core/forms';
import { useInitialFocusedInput } from '../../core/hooks';
import { patientSchema as validationSchema } from '../../core/clinicUtils';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '../../components/elements/Dialog';

import { MediumTitle } from '../../components/elements/FontStyles';
import TextInput from '../../components/elements/TextInput';
import { emptyValuesFilter, getFormValues } from '../../components/clinic/PatientForm';
import api from '../../core/api';
import i18next from '../../core/language';

const t = i18next.t.bind(i18next);

export const PatientEmailModal = (props) => {
  const {
    open,
    onClose,
    onFormChange,
    onSubmit,
    processing,
    patient,
    trackMetric,
  } = props;

  const dispatch = useDispatch();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const mrnSettings = clinic?.mrnSettings ?? {};
  const existingMRNs = useMemo(
    () => compact(map(reject(clinic?.patients, { id: patient?.id }), 'mrn')),
    [clinic?.patients, patient?.id]
  );
  const clinicPatientTags = useMemo(() => keyBy(clinic?.patientTags, 'id'), [clinic?.patientTags]);
  const initialFocusedInputRef = useInitialFocusedInput();
  const action = patient?.email ? 'edit' : 'add';

  const formikContext = useFormik({
    initialValues: getFormValues(patient, clinicPatientTags),
    onSubmit: (values) => {
      trackMetric(`Data Connections - patient email ${action === 'edit' ? 'updated' : 'added'}`);
      dispatch(actions.async.updateClinicPatient(api, selectedClinicId, patient.id, omitBy({ ...patient, ...getFormValues(values, clinicPatientTags) }, emptyValuesFilter)));
    },
    validationSchema: validationSchema({mrnSettings, existingMRNs}),
  });

  const {
    values,
    isValid,
  } = formikContext;

  const UI = {
    add: {
      title: t('Add a Patient Email'),
      submitText: t('Send Invite'),
      banner: {
        message: t('We will send an invitation to this email address. Please note that the recipient will be given the opportunity to claim this Tidepool account.'),
        title: t('Please set the email address for this patient account.'),
        variant: 'info',
      },
    },
    edit: {
      title: t('Edit Patient Email'),
      submitText: t('Save'),
      banner: {
        message: t('The recipient of this email will have the opportunity to claim this Tidepool account.'),
        title: t('Changing this email will update the email associated with the account.'),
        variant: 'warning',
      },
    },
  };

  useEffect(() => {
    onFormChange(formikContext);
  }, [values]);

  return (
    <Dialog
      id="patient-email-modal"
      aria-labelledby="dialog-title"
      maxWidth="sm"
      open={open}
      onClose={onClose}
    >
      <DialogTitle onClose={onClose}>
        <MediumTitle id="data-connections-title">{UI[action].title}</MediumTitle>
      </DialogTitle>

      <DialogContent>
        <Box mb={4}>
          <TextInput
            {...getCommonFormikFieldProps('email', formikContext)}
            innerRef={initialFocusedInputRef}
            label={t('Patient Email Address')}
            placeholder={t('Email Address')}
            variant="condensed"
            sx={{ width: '100%' }}
            disabled={patient?.id && !patient?.permissions?.custodian}
            />
        </Box>

        <Box>
          <Banner dismissable={false} {...UI[action].banner} />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          id="patient-email-modal-close"
          variant="secondary"
          onClick={onClose}
        >
          {t('Cancel')}
        </Button>

        <Button
          id="patient-email-modal-submit"
          variant="primary"
          onClick={onSubmit}
          processing={processing}
          disabled={!isValid || !values.email}
        >
          {UI[action].submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PatientEmailModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onFormChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  open: PropTypes.bool,
  patient: PropTypes.object.isRequired,
  processing: PropTypes.bool,
  trackMetric: PropTypes.func.isRequired,
};

PatientEmailModal.defaultProps = {
  onClose: noop,
  onComplete: noop,
  trackMetric: noop,
};


export default PatientEmailModal;
