import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from 'react-i18next';
import { Box, Flex } from 'rebass/styled-components';
import { useFormik } from 'formik';
import { push } from 'connected-react-router';
import { useLocation } from 'react-router-dom';
import get from 'lodash/get';
import map from 'lodash/map';
import * as yup from 'yup';

import {
  Title,
  MediumTitle,
  Body1,
} from '../../components/elements/FontStyles';

import RadioGroup from '../../components/elements/RadioGroup';
import TextInput from '../../components/elements/TextInput';
import Button from '../../components/elements/Button';
import ClinicianPermissionsDialog from '../../components/clinic/ClinicianPermissionsDialog';
import baseTheme from '../../themes/baseTheme';
import * as actions from '../../redux/actions';
import Checkbox from '../../components/elements/Checkbox';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import { useToasts } from '../../providers/ToastProvider';
import { useIsFirstRender } from '../../core/hooks';
import { getCommonFormikFieldProps, fieldsAreValid } from '../../core/forms';

export const ClinicInvite = (props) => {
  const { t, api, trackMetric } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const location = useLocation();
  const selectedClinic = get(location, 'state.clinicId', false);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const { sendingClinicianInvite } = useSelector((state) => state.blip.working);

  const clinicAdminDesc = (
    <>
      <Title mt="-0.25em">{t('Clinic Admin')}</Title>
      <Body1>
        {t('Clinic admins have complete access to a workspace and can manage patients, clinicians and the clinic profile.')}
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
    email: yup.string()
      .email(t('Please enter a valid email address'))
      .required(t('Email address is required')),
    prescriberPermission: yup.boolean(),
  });

  const formikContext = useFormik({
    initialValues: {
      clinicianType: null,
      email: '',
      prescriberPermission: false,
    },
    onSubmit: (values) => {
      const {
        clinicianType,
        prescriberPermission,
        email,
      } = values;

      const roles = [clinicianType];
      let metricProperties = { role: clinicianType };

      if (prescriberPermission) {
        roles.push('PRESCRIBER');
        metricProperties.access = 'PRESCRIBER';
      }

      dispatch(actions.async.sendClinicianInvite(api, selectedClinic, { email, roles }))
      trackMetric('Clinic - Invite clinician', metricProperties)
    },
    validationSchema,
  });

  const {
    handleSubmit,
    isSubmitting,
    setSubmitting,
    values,
  } = formikContext;

  if (!selectedClinic) {
    dispatch(push('/clinic-admin'));
  }

  useEffect(() => {
    if (trackMetric) {
      trackMetric('Clinic - Clinic Invite');
    }
  }, []);

  useEffect(() => {
    const { inProgress, completed, notification } = sendingClinicianInvite;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        setToast({
          message: t('Clinician invite sent.'),
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
  }, [sendingClinicianInvite]);

  function handleBack() {
    if (values.selectedType || values.prescriberPermission || values.email) {
      setDialogOpen(true);
    } else {
      dispatch(push('/clinic-admin'));
    }
  }

  function handleDialogClose() {
    setDialogOpen(false);
  }

  function handleDialogConfirm() {
    dispatch(push('/clinic-admin'));
  }

  function handleClosePermissionsDialog() {
    setPermissionsDialogOpen(false);
  }

  return (
    <Box
      variant="containers.mediumBordered"
    >
      <Flex
        sx={{ borderBottom: baseTheme.borders.default }}
        alignItems="center"
        p={4}
        px={6}
      >
        <Title flexGrow={1}>{t('Invite team members')}</Title>
      </Flex>

      <Box
        as="form"
        id="invite-member"
        onSubmit={handleSubmit}
        px={6}
      >
        <TextInput
          {...getCommonFormikFieldProps('email', formikContext)}
          placeholder={t('Enter email address')}
          variant="condensed"
          themeProps={{
            py: 3
          }}
        />

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

        <Button variant="textPrimary" onClick={() => setPermissionsDialogOpen(true)}>
          Learn more about clinician roles and permissions
        </Button>

        <Flex p={4} justifyContent="flex-end">
          <Button id="cancel" variant="secondary" onClick={handleBack}>
            {t('Back')}
          </Button>

          <Button id="submit" type="submit" processing={isSubmitting} disabled={!fieldsAreValid(['email', 'clinicianType'], validationSchema, values)} variant="primary" ml={3}>
            {t('Invite Member')}
          </Button>
        </Flex>
      </Box>

      <Dialog
        id="confirmDialog"
        aria-labelledBy="dialog-title"
        open={dialogOpen}
        onClose={handleDialogClose}
      >
        <DialogTitle onClose={handleDialogClose}>
          <MediumTitle id="dialog-title">{t('Unsaved invitation')}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <Body1>
            {t('You have a unsaved changes to this invitation which will be lost if you navigate away. Are you sure you wish to discard these changes?')}
          </Body1>
        </DialogContent>

        <DialogActions>
          <Button
            id="confirmDialogCancel"
            variant="secondary"
            onClick={handleDialogClose}
          >
            {t('Cancel')}
          </Button>

          <Button
            id="confirmDialogExit"
            variant="danger"
            onClick={handleDialogConfirm}
          >
            {t('Exit')}
          </Button>
        </DialogActions>
      </Dialog>

      <ClinicianPermissionsDialog open={permissionsDialogOpen} onClose={handleClosePermissionsDialog} />
    </Box>
  );
};

ClinicInvite.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(ClinicInvite);
