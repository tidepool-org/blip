import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import { withTranslation } from 'react-i18next';
import { push } from 'connected-react-router';
import get from 'lodash/get';
import map from 'lodash/map';
import includes from 'lodash/includes';
import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import indexOf from 'lodash/indexOf';
import isUndefined from 'lodash/isUndefined';
import * as yup from 'yup';
import { Box, Flex, Text } from 'theme-ui';
import { components as vizComponents } from '@tidepool/viz';
import { useFlags } from 'launchdarkly-react-client-sdk';

import {
  Title,
  MediumTitle,
  Body1,
} from '../../components/elements/FontStyles';
import RadioGroup from '../../components/elements/RadioGroup';
import Button from '../../components/elements/Button';
import ClinicianPermissionsDialog from '../../components/clinic/ClinicianPermissionsDialog';
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
import config from '../../config';

const { Loader } = vizComponents;

export const ClinicianEdit = (props) => {
  const { t, api, trackMetric } = props;
  const { showPrescriptions } = useFlags();
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const location = useLocation();
  const selectedClinicianId = get(location, 'state.clinicianId', false);
  const { updatingClinician, fetchingCliniciansFromClinic } = useSelector((state) => state.blip.working);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const selectedClinic = get(location, 'state.clinicId', false);
  const clinicians = useSelector((state) =>
    get(state, ['blip', 'clinics', selectedClinic, 'clinicians'])
  );
  const selectedClinician = get(clinicians, selectedClinicianId);

  const selectedClinicianRoles = selectedClinician?.roles;
  const clinicianName = selectedClinician?.name;
  const activeAdmins = filter(
    clinicians,
    (clinician) =>
      indexOf(clinician.roles, 'CLINIC_ADMIN') !== -1 &&
      isUndefined(clinician.inviteId)
  );
  const adminCount = activeAdmins.length;
  const userId = useSelector((state) => state.blip.loggedInUserId);
  const isOnlyClinicAdmin = adminCount === 1 && userId === selectedClinicianId;
  let deleteSubmitText,
    deleteCancelText = t('Cancel');
  let deleteTitle = t('Remove {{clinicianName}}', { clinicianName });
  let deleteBody = t(
    '{{clinicianName}} will lose all access to this clinic workspace and its patient list. Are you sure you want to remove this user?',
    { clinicianName }
  );

  if (isOnlyClinicAdmin) {
    deleteTitle = t('Unable to remove yourself');
    deleteBody = t('Before you remove yourself from this Clinic account, please assign Admin permissions to at least one other Clinic member.');
    deleteCancelText = t('OK');
  } else {
    deleteSubmitText = t('Remove User');
  }

  const clinicAdminDesc = (
    <>
      <Title mt="-0.25em">{t('Clinic Admin')}</Title>
      <Body1>
        {t('Clinic admins have complete access to a workspace and can manage patients, clinicians and the clinic profile.')}
        {isOnlyClinicAdmin && <><br/>{t('You cannot remove your admin permissions if you are the only clinic admin.')}</>}
      </Body1>
    </>
  );

  const clinicMemberDesc = (
    <>
      <Title mt="-0.25em">{t('Clinic Member')}</Title>
      <Body1>
        {t('Clinic members have limited access to a workspace and can only manage patients.')}
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

  const clinicianValues = () => (selectedClinician ? {
      clinicianType: includes(selectedClinicianRoles, 'CLINIC_ADMIN') ? 'CLINIC_ADMIN' : 'CLINIC_MEMBER',
      prescriberPermission: includes(selectedClinicianRoles, 'PRESCRIBER'),
    } : {
      clinicianType: null,
      prescriberPermission: false,
    }
  );

  const formikContext = useFormik({
    initialValues: clinicianValues(),
    onSubmit: (values) => {
      const {
        clinicianType,
        prescriberPermission,
      } = values;

      const updatedClinician = cloneDeep(selectedClinician);
      const updatedRoles = [clinicianType];
      let metricProperties = { clinicId: selectedClinicId, role: clinicianType };

      if (prescriberPermission) {
        updatedRoles.push('PRESCRIBER');
        metricProperties.access = 'PRESCRIBER';
      }

      updatedClinician.roles = updatedRoles;
      trackMetric('Clinic - Update clinic team member', metricProperties);

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
    setValues,
    values,
  } = formikContext;

  useEffect(() => {
    if (selectedClinician) {
      setValues(clinicianValues())
    }
  }, [selectedClinician])

  if (!selectedClinic || !selectedClinicianId) {
    dispatch(push('/clinic-admin'));
  }

  if (selectedClinicianId && !selectedClinician) {
    if (
      !fetchingCliniciansFromClinic.inProgress &&
      !fetchingCliniciansFromClinic.completed &&
      !fetchingCliniciansFromClinic.notification
    ) {
      dispatch(actions.async.fetchCliniciansFromClinic(api, selectedClinic, { limit: 1000, offset: 0 }));
    }
  }

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
    trackMetric('Clinic - Remove clinic team member', { clinicId: selectedClinicId });
    setDeleteDialogOpen(true);
  }

  function handleBack() {
    if (dirty) {
      setConfirmDialogOpen(true);
    } else {
      trackMetric('Clinic - Update clinic team member back out', { clinicId: selectedClinicId });
      dispatch(push('/clinic-admin'));
    }
  }

  function handleCloseDeleteDialog() {
    setDeleteDialogOpen(false);
  }

  function handleConfirmDeleteDialog() {
    trackMetric('Clinic - Remove clinic team member confirmed', { clinicId: selectedClinicId });

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
    trackMetric('Clinic - Update clinic team member back out', { clinicId: selectedClinicId });
    dispatch(push('/clinic-admin'));
  }

  function handleClosePermissionsDialog() {
    setPermissionsDialogOpen(false);
  }

  return (
    <Box
      variant="containers.mediumBordered"
      bg="white"
    >
      {selectedClinician ? (
        <>
          <Flex
            sx={{ borderBottom: baseTheme.borders.default, alignItems: 'center' }}
            p={4}
            mb={4}
            px={6}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Text sx={{ display: 'block', fontWeight: 'medium' }}>{clinicianName}</Text>
              <Text sx={{ display: 'block' }}>{selectedClinician.email}</Text>
            </Box>
            <Text
              id="remove-team-member"
              sx={{ color: 'feedback.danger', cursor: 'pointer' }}
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
              disabled={isOnlyClinicAdmin}
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
                    '&:last-child': {
                      borderRadius: showPrescriptions
                        ? 0
                        : `0 0 ${baseTheme.radii.default}px ${baseTheme.radii.default}px`,
                    },
                  },
                },
              }}
            />

            {showPrescriptions && (
              <Box
                p={4}
                mb={3}
                bg="lightestGrey"
                sx={{
                  border: baseTheme.borders.default,
                  borderTop: 'none',
                  borderRadius: `0 0 ${baseTheme.radii.default}px ${baseTheme.radii.default}px`,
                }}
              >
                <Checkbox
                  {...getCommonFormikFieldProps('prescriberPermission', formikContext, 'checked')}
                  label={t('Tidepool Loop Start Orders Finalization Permission')}
                  themeProps={{ bg: 'lightestGrey' }}
                />
              </Box>
            )}

            <Button mt={3} variant="textPrimary" onClick={() => setPermissionsDialogOpen(true)}>
              Learn more about clinician roles and permissions
            </Button>

            <Flex p={4} sx={{ justifyContent: 'flex-end' }}>
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
            aria-labelledby="dialog-title"
            open={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
          >
            <DialogTitle onClose={handleCloseDeleteDialog}>
              <MediumTitle id="dialog-title">{deleteTitle}</MediumTitle>
            </DialogTitle>

            <DialogContent>
              <Body1>
                {deleteBody}
              </Body1>
            </DialogContent>

            <DialogActions>
              <Button
                id="deleteDialogCancel"
                variant="secondary"
                onClick={handleCloseDeleteDialog}
              >
                {deleteCancelText}
              </Button>
              {deleteSubmitText && (
                <Button
                  id="deleteDialogRemove"
                  variant="danger"
                  onClick={handleConfirmDeleteDialog}
                >
                  {deleteSubmitText}
                </Button>
              )}
            </DialogActions>
          </Dialog>

          <Dialog
            id="confirmDialog"
            aria-labelledby="dialog-title"
            open={confirmDialogOpen}
            onClose={handleCloseConfirmDialog}
          >
            <DialogTitle onClose={handleCloseConfirmDialog}>
              <MediumTitle id="dialog-title">{t('Unsaved changes')}</MediumTitle>
            </DialogTitle>

            <DialogContent>
              <Body1>
                {t('There are unsaved changes to this clinician’s permissions which will be lost if you navigate away. Are you sure you want to discard these changes?')}
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
                {t('Discard Changes')}
              </Button>
            </DialogActions>
          </Dialog>

          <ClinicianPermissionsDialog open={permissionsDialogOpen} onClose={handleClosePermissionsDialog} />
        </>
      ) : <Loader />}
    </Box>
  )
};

ClinicianEdit.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(ClinicianEdit);
