import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, Flex, Text } from 'theme-ui';
import _ from 'lodash';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { Dialog, DialogTitle, DialogContent, DialogActions } from '../../components/elements/Dialog';
import TextInput from '../../components/elements/TextInput';
import Select from '../../components/elements/Select';
import Button from '../../components/elements/Button';
import { MediumTitle } from '../../components/elements/FontStyles';
import { useToasts } from '../../providers/ToastProvider';
import { usePrevious } from '../../core/hooks';
import { getCommonFormikFieldProps, addEmptyOption, fieldsAreValid } from '../../core/forms';
import personUtils from '../../core/personutils';
import { roles as clinicRoles } from '../../core/clinicUtils';
import * as actions from '../../redux/actions';

export function EditPersonalDetailsDialog({ open, onClose, api, trackMetric }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();

  const user = useSelector((state) => {
    const allUsersMap = state.blip?.allUsersMap;
    const loggedInUserId = state.blip?.loggedInUserId;
    return allUsersMap && loggedInUserId ? allUsersMap[loggedInUserId] : null;
  });
  const working = useSelector((state) => state.blip?.working?.updatingUser);
  const previousWorking = usePrevious(working);

  const isClinician = personUtils.isClinicianAccount(user);
  const isSSO = personUtils.isSSOAccount(user);
  const email = user?.username || _.get(user, 'emails.0', '');

  const schema = yup.object().shape({
    fullName: yup.string().trim().required(t('Please enter your full name')),
    role: yup.string().oneOf([...clinicRoles.map((r) => r.value), '']),
  });

  const formikContext = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: _.get(user, 'profile.fullName', ''),
      role: _.get(user, 'profile.clinic.role', ''),
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const profileUpdates = { profile: { fullName: values.fullName.trim() } };
      if (isClinician) {
        profileUpdates.profile.clinic = { role: values.role || '' };
      }
      dispatch(actions.async.updateUser(api, profileUpdates));
    },
  });

  useEffect(() => {
    if (!working) return;
    const { inProgress, completed, notification } = working;
    const prevInProgress = previousWorking?.inProgress;

    if (!inProgress && completed !== null && prevInProgress) {
      formikContext.setSubmitting(false);
      if (completed === true) {
        setToast({ message: t('Personal details updated.'), variant: 'success' });
        onClose();
      } else if (notification) {
        setToast({ message: notification.message, variant: 'danger' });
      }
    }
  }, [working]);

  const handleUpdateEmail = () => {
    trackMetric('Clicked Update Email in Account');
  };

  return (
    <Dialog
      id="edit-personal-details"
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="edit-personal-details-title"
    >
      <DialogTitle onClose={onClose}>
        <MediumTitle id="edit-personal-details-title">
          {t('Edit Personal Details')}
        </MediumTitle>
      </DialogTitle>

      <DialogContent>
        <Flex sx={{ flexDirection: 'column', gap: 4 }}>
          <TextInput
            {...getCommonFormikFieldProps('fullName', formikContext)}
            label={t('Name')}
            variant="condensed"
            width="100%"
          />

          <Box>
            <Box variant="containers.well" p={3}>
              <Flex
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 3,
                }}
              >
                <Box>
                  <Text
                    as="div"
                    sx={{ fontSize: 1, fontWeight: 'medium', color: 'blueGreyDark' }}
                  >
                    {t('Email')}
                  </Text>
                  <Text
                    as="div"
                    sx={{ fontSize: 1, color: 'blueGreyMedium', wordBreak: 'break-all' }}
                  >
                    {email}
                  </Text>
                </Box>
                {!isSSO && (
                  <Button
                    variant="secondary"
                    onClick={handleUpdateEmail}
                  >
                    {t('Update Email')}
                  </Button>
                )}
              </Flex>
            </Box>
            {isSSO && (
              <Text
                as="div"
                variant="paragraph0"
                sx={{ color: 'mediumGrey', mt: 1 }}
              >
                {t("Your email is managed via your organization's SSO. To edit or update your email please contact your IT team.")}
              </Text>
            )}
          </Box>

          {isClinician && (
            <Select
              {...getCommonFormikFieldProps('role', formikContext)}
              label={t('Job title (optional)')}
              options={addEmptyOption(clinicRoles, t('Select a job title'))}
              variant="condensed"
              themeProps={{ width: '100%' }}
            />
          )}
        </Flex>
      </DialogContent>

      <DialogActions>
        <Button variant="secondary" onClick={onClose}>
          {t('Cancel')}
        </Button>
        <Button
          variant="primary"
          processing={working?.inProgress}
          disabled={!fieldsAreValid(['fullName'], schema, formikContext.values)}
          onClick={formikContext.handleSubmit}
        >
          {t('Save Changes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EditPersonalDetailsDialog.defaultProps = {
  trackMetric: _.noop,
};

EditPersonalDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default EditPersonalDetailsDialog;
