import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import { translate } from 'react-i18next';
import { push } from 'connected-react-router';
import get from 'lodash/get';
import map from 'lodash/map';
import includes from 'lodash/includes';
import cloneDeep from 'lodash/cloneDeep';
import * as yup from 'yup';
import { Box, Flex, Text } from 'rebass/styled-components';
import {
  Title,
  MediumTitle,
  Body1,
} from '../../components/elements/FontStyles';
import RadioGroup from '../../components/elements/RadioGroup';
import Button from '../../components/elements/Button';
import Checkbox from '../../components/elements/Checkbox';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';
import * as actions from '../../redux/actions';
import { useToasts } from '../../providers/ToastProvider';
import baseTheme from '../../themes/baseTheme';
import { useIsFirstRender } from '../../core/hooks';
import { getCommonFormikFieldProps, fieldsAreValid } from '../../core/forms';

export const ClinicianEdit = (props) => {
  const { t, api, trackMetric } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const location = useLocation();
  const selectedClinicianId = get(location, 'state.clinicianId', false);
  const { updatingClinician } = useSelector((state) => state.blip.working);
  const selectedClinic = get(location, 'state.clinicId', false);

  const selectedClinician = useSelector((state) =>
    get(state, [
      'blip',
      'clinics',
      selectedClinic,
      'clinicians',
      selectedClinicianId,
    ])
  );

  const selectedClinicianRoles = selectedClinician?.roles;
  const clinicianName = selectedClinician?.name;

  const clinicAdminDesc = (
    <>
      <Title mt="-0.25em">{t('Clinic Admin')}</Title>
      <Body1>
        {t('Clinic administrators have full read and edit access to access. Clinic administrators have full read and edit access to access')}
      </Body1>
    </>
  );

  const clinicMemberDesc = (
    <>
      <Title mt="-0.25em">{t('Clinic Member')}</Title>
      <Body1>
        {t('Clinic members have read access to access management. More details are described here.')}
      </Body1>
    </>
  );

  const typeOptions = [
    { value: 'CLINIC_ADMIN', label: clinicAdminDesc },
    { value: 'CLINIC_MEMBER', label: clinicMemberDesc },
  ];

  const validationSchema = yup.object().shape({
    clinicianType: yup.string()
      .oneOf(map(typeOptions, 'value'), t('Please select a valid option'))
      .required(t('Account type is required')),
    prescriberPermission: yup.boolean(),
  });

  const formikContext = useFormik({
    initialValues: {
      clinicianType: includes(selectedClinicianRoles, 'CLINIC_ADMIN') ? 'CLINIC_ADMIN' : 'CLINIC_MEMBER',
      prescriberPermission: includes(selectedClinicianRoles, 'PRESCRIBER'),
    },
    onSubmit: (values) => {
      const {
        clinicianType,
        prescriberPermission,
      } = values;

      const updatedClinician = cloneDeep(selectedClinician);
      const updatedRoles = [clinicianType];
      if (prescriberPermission) updatedRoles.push('PRESCRIBER');
      updatedClinician.roles = updatedRoles;
      trackMetric('Clinic - Edit clinician');

      dispatch(
        actions.async.updateClinician(
          api,
          selectedClinic,
          updatedClinician.id,
          updatedClinician
        )
      );
    },
    validationSchema,
  });

  const {
    dirty,
    handleSubmit,
    isSubmitting,
    setSubmitting,
    values,
  } = formikContext;

  console.log('formikContext', formikContext);

  if (!selectedClinicianId) {
    dispatch(push('/clinic-admin'));
  }

  useEffect(() => {
    if (trackMetric) {
      trackMetric('Clinic - Clinician Edit');
    }
  }, []);

  useEffect(() => {
    const { inProgress, completed, notification } = updatingClinician;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        setToast({
          message: t('You have successfully updated the clinician.'),
          variant: 'success',
        });

        dispatch(push('/clinic-admin'));
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }

      setSubmitting(false);
    }
  }, [updatingClinician]);

  function handleClickDelete() {
    setDeleteDialogOpen(true);
  }

  function handleBack() {
    if (dirty) {
      setConfirmDialogOpen(true);
    } else {
      dispatch(push('/clinic-admin'));
    }
  }

  function handleCloseDeleteDialog() {
    setDeleteDialogOpen(false);
  }

  function handleConfirmDeleteDialog() {
    dispatch(
      actions.async.deleteClinicianFromClinic(
        api,
        selectedClinic,
        selectedClinicianId
      )
    );
    dispatch(push('/clinic-admin'));
  }

  function handleCloseConfirmDialog() {
    setConfirmDialogOpen(false);
  }

  function handleExitConfirmDialog() {
    dispatch(push('/clinic-admin'));
  }

  return (
    <Box
      variant="containers.mediumBordered"
      bg="white"
    >
      <Flex
        sx={{ borderBottom: baseTheme.borders.default }}
        alignItems="center"
        p={4}
        mb={4}
        px={6}
      >
        <Box flexGrow={1}>
          <Text fontWeight="medium">{clinicianName}</Text>
          <Text>{selectedClinician?.email}</Text>
        </Box>
        <Text
          color="feedback.danger"
          sx={{ cursor: 'pointer' }}
          onClick={() => handleClickDelete()}
        >
          {t('Remove User')}
        </Text>
      </Flex>
      <Box
        as="form"
        id="edit-member"
        onSubmit={handleSubmit}
        px={6}
      >
        <RadioGroup
          id="clinician-type"
          options={typeOptions}
          {...getCommonFormikFieldProps('clinicianType', formikContext)}
          variant="verticalBordered"
          sx={{
            '&&': {
              label: {
                marginBottom: 0,
                '&:first-child': {
                  borderRadius: `${baseTheme.radii.default}px ${baseTheme.radii.default}px 0 0`,
                  borderBottom: 'none',
                },
              },
            },
          }}
        />

        <Box
          p={4}
          mb={4}
          bg="lightestGrey"
          sx={{
            border: baseTheme.borders.default,
            borderTop: 'none',
            borderRadius: `0 0 ${baseTheme.radii.default}px ${baseTheme.radii.default}px`,
          }}
        >
          <Checkbox
            {...getCommonFormikFieldProps('prescriberPermission', formikContext, 'checked')}
            label={t('Prescribing access')}
            themeProps={{ bg: 'lightestGrey' }}
          />
        </Box>

        <Flex p={4} justifyContent="flex-end">
          <Button id="cancel" variant="secondary" onClick={handleBack}>
            {t('Back')}
          </Button>

          <Button id="submit" type="submit" processing={isSubmitting} disabled={!fieldsAreValid(['clinicianType'], validationSchema, values)} variant="primary" ml={3}>
            {t('Update Member')}
          </Button>
        </Flex>
      </Box>

      <Dialog
        id="deleteDialog"
        aria-labelledBy="dialog-title"
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle onClose={handleCloseDeleteDialog}>
          <MediumTitle id="dialog-title">{t('Remove {{clinicianName}}', { clinicianName })}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <Body1>
            {t('{{clinicianName}} will lose all access to this clinic workspace and its patient list. Are you sure you want to remove this user?', { clinicianName })}
          </Body1>
        </DialogContent>

        <DialogActions>
          <Button
            id="deleteDialogCancel"
            variant="secondary"
            onClick={handleCloseDeleteDialog}
          >
            {t('Cancel')}
          </Button>

          <Button
            id="deleteDialogRemove"
            variant="danger"
            onClick={handleConfirmDeleteDialog}
          >
            {t('Remove User')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        id="confirmDialog"
        aria-labelledBy="dialog-title"
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
      >
        <DialogTitle onClose={handleCloseConfirmDialog}>
          <MediumTitle id="dialog-title">{t('Unsaved changes')}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <Body1>
            {t('You have a unsaved changes to this clinician which will be lost if you navigate away. Are you sure you wish to discard these changes?')}
          </Body1>
        </DialogContent>

        <DialogActions>
          <Button
            id="confirmDialogCancel"
            variant="secondary"
            onClick={handleCloseConfirmDialog}
          >
            {t('Cancel')}
          </Button>

          <Button
            id="confirmDialogExit"
            variant="danger"
            onClick={handleExitConfirmDialog}
          >
            {t('Exit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

ClinicianEdit.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(ClinicianEdit);
