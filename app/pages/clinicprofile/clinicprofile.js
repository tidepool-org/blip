import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import get from 'lodash/get'
import includes from 'lodash/includes'
import keys from 'lodash/keys';
import { useFormik } from 'formik';
import { Box, Flex } from 'theme-ui';

import {
  Title,
} from '../../components/elements/FontStyles';

import * as actions from '../../redux/actions';
import Button from '../../components/elements/Button';
import baseTheme from '../../themes/baseTheme';
import { fieldsAreValid } from '../../core/forms';
import { useIsFirstRender } from '../../core/hooks';
import { clinicValuesFromClinic, clinicSchema as validationSchema } from '../../core/clinicUtils';
import { useToasts } from '../../providers/ToastProvider';
import ClinicProfileFields from '../../components/clinic/ClinicProfileFields';
import ClinicWorkspaceHeader from '../../components/clinic/ClinicWorkspaceHeader';

export const ClinicProfile = (props) => {
  const { t, api, trackMetric } = props;
  const isFirstRender = useIsFirstRender();
  const { set: setToast } = useToasts();
  const dispatch = useDispatch();
  const clinics = useSelector((state) => state.blip.clinics);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinic = get(clinics, selectedClinicId);
  const isClinicAdmin = includes(get(clinic, ['clinicians', loggedInUserId, 'roles'], []), 'CLINIC_ADMIN');
  const { updatingClinic } = useSelector((state) => state.blip.working);

  const formikContext = useFormik({
    initialValues: clinicValuesFromClinic(clinic),
    onSubmit: values => {
      trackMetric('Clinic - Edit clinic profile saved', { clinicId: selectedClinicId });
      dispatch(actions.async.updateClinic(api, clinic.id, values));
    },
    validationSchema,
  });

  const {
    handleSubmit,
    isSubmitting,
    setValues,
    values,
  } = formikContext;

  useEffect(() => {
    if (clinic) {
      if (isClinicAdmin) {
        setValues(clinicValuesFromClinic(clinic));
      } else {
        redirectToWorkspace();
      }
    }
  }, [clinic, setValues])

  useEffect(() => {
    const { inProgress, completed, notification } = updatingClinic;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        setToast({
          message: t('Clinic profile updated.'),
          variant: 'success',
        });

        redirectToWorkspace()
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }
    }
  }, [updatingClinic]);

  function redirectToWorkspace() {
    const redirectState = { selectedClinicId };
    dispatch(push('/clinic-workspace', redirectState));
  }

  return (
    <>
      <ClinicWorkspaceHeader api={api} trackMetric={trackMetric} />

      <Box mb={8}>
        <Box variant="containers.largeBordered" mb={4}>
          <Box
            px={4}
            py={2}
            sx={{ borderBottom: baseTheme.borders.default, alignItems: 'center' }}
          >
            <Title sx={{ flexGrow: 1 }}>
              {t('Clinic Profile')}
            </Title>
          </Box>

          <Box
            as="form"
            id="clinic-profile-update"
            onSubmit={handleSubmit}
          >
            <ClinicProfileFields p={4} formikContext={formikContext} />

            <Flex
              id="clinic-profile-footer"
              sx={{ borderTop: baseTheme.borders.default, justifyContent: ['center', 'flex-end'], alignItems: 'center' }}
              py={4}
            >
              <Button id="cancel" variant="secondary" onClick={redirectToWorkspace}>
                {t('Back To Workspace')}
              </Button>

              <Button
                id="submit"
                type="submit"
                variant="primary"
                ml={2}
                mr={[0, 4]}
                processing={isSubmitting}
                disabled={!fieldsAreValid(keys(clinicValuesFromClinic()), validationSchema, values)}
              >
                {t('Save Profile')}
              </Button>
            </Flex>
          </Box>
        </Box>
      </Box>
    </>
  );
};

ClinicProfile.propTypes = {
  api: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(ClinicProfile);
