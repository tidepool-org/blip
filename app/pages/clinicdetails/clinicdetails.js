import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { useParams } from 'react-router-dom';
import * as yup from 'yup';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import map from 'lodash/map';
import noop from 'lodash/noop';
import pick from 'lodash/pick';
import { Formik, Form, FastField } from 'formik';
import { Box, Flex, Text } from 'rebass/styled-components';
import countries from 'i18n-iso-countries';

import { Body1, Headline, MediumTitle } from '../../components/elements/FontStyles';
import TextInput from '../../components/elements/TextInput';
import Select from '../../components/elements/Select';
import Checkbox from '../../components/elements/Checkbox';
import Button from '../../components/elements/Button';
import NotificationIcon from '../../components/elements/NotificationIcon';
import ClinicProfileFields from '../../components/clinic/ClinicProfileFields';
import * as actions from '../../redux/actions';
import i18next from '../../core/language';
import { usePrevious } from '../../core/hooks';
import { getCommonFormikFieldProps, fieldsAreValid } from '../../core/forms';
import { useToasts } from '../../providers/ToastProvider';
import { push } from 'connected-react-router';
import { components as vizComponents } from '@tidepool/viz';
import { clinicValuesFromClinic, roles, clinicSchema as clinicValidationSchema } from '../../core/clinicUtils';
import { addEmptyOption } from '../../core/forms';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

const { Loader } = vizComponents;
const t = i18next.t.bind(i18next);
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

const clinicianSchema = yup.object().shape({
  fullName: yup.string().required(t('Name is required')),
  role: yup.string().oneOf([...map(roles, 'value'), '']),
  npi: yup
    .string()
    .test('npiFormat', t('NPI must be 10 digits'), npi => !npi || /^\d{10}$/.test(npi)),
});

const clinicSchema = clinicValidationSchema.concat(yup.object().shape({
  adminAcknowledge: yup.boolean()
    .test('isTrue', t('You must acknowledge admin role'), value => (value === true)),
}));

const schemas = {
  clinician: clinicianSchema,
  clinic: clinicSchema,
  combined: clinicianSchema.concat(clinicSchema),
}

export const ClinicDetails = (props) => {
  const { t, api, trackMetric } = props;
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const { action } = useParams();

  useEffect(() => {
    if (trackMetric) {
      trackMetric('Clinic - Clinic Details Setup');
    }
  }, []);

  const pendingReceivedClinicianInvites = useSelector((state) => state.blip.pendingReceivedClinicianInvites);
  const clinics = useSelector((state) => state.blip.clinics);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const allUsersMap = useSelector((state) => state.blip.allUsersMap);
  const user = get(allUsersMap, loggedInUserId);
  const userHasClinicProfile = !!get(user, ['profile', 'clinic'], false);
  const clinic = get(clinics, selectedClinicId);
  const displayClinicianForm = includes(['migrate', 'profile'], action);
  const displayClinicForm = includes(['migrate', 'new'], action);
  const [populateProfileFields, setPopulateProfileFields] = useState(action === 'profile');
  const working = useSelector((state) => state.blip.working);
  const previousWorking = usePrevious(working);
  const [submitting, setSubmitting] = useState(false);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [clinicInvite, setClinicInvite] = useState();
  const [formikReady, setFormikReady] = useState(false);

  let schema = displayClinicForm ? 'clinic' : 'clinician';
  if (displayClinicForm && displayClinicianForm) schema = 'combined';

  const clinicValues = () => ({
    fullName: populateProfileFields ? user?.profile?.fullName || '' : '',
    npi: populateProfileFields? user?.profile?.clinic?.npi || '' : '',
    role: populateProfileFields ? user?.profile?.clinic?.role || '' : '',
    ...clinicValuesFromClinic(clinic),
  });

  function redirectToWorkspace() {
    const redirectPath = isEmpty(pendingReceivedClinicianInvites) && keys(clinics).length === 1
      ? '/clinic-workspace'
      : '/workspaces';

    const redirectState = { selectedClinicId: clinics.length === 1 ? clinics[0].id : null };
    dispatch(push(redirectPath, redirectState));
  }

  useEffect(() => {
    if (pendingReceivedClinicianInvites.length) {
      setClinicInvite(pendingReceivedClinicianInvites?.[0]);
    }
  }, [pendingReceivedClinicianInvites]);

  useEffect(() => {
    if (clinic && !submitting) {
      // If the user reloads or returns this view after submitting the clinic details, but hasn't
      // yet migrated, we shouldn't require them to manually re-enter their clinician profile info.
      setPopulateProfileFields(action === 'migrate' && !isEmpty(clinic?.name));

      if (!isEmpty(clinic.name) && userHasClinicProfile) {
        if (action === 'migrate' && clinic?.canMigrate) {
          // If the user has already filled out their clinician profile and clinic details, and the
          // clinic patients have not been migrated, we open the prompt to complete the migration
          openMigrationConfirmationModal();
        } else {
          // If there is no reason for the user to be here, we redirect them appropriately
          redirectToWorkspace();
        }
      }
    }
  }, [clinic, submitting]);

  // Fetchers
  useEffect(() => {
    if (loggedInUserId) {
      forEach([
        {
          workingState: working.fetchingClinicianInvites,
          action: actions.async.fetchClinicianInvites.bind(null, api, loggedInUserId),
        },
        {
          workingState: working.fetchingClinicsForClinician,
          action: actions.async.getClinicsForClinician.bind(null, api, loggedInUserId, {}),
        },
      ], ({ workingState, action }) => {
        if (
          !workingState.inProgress &&
          !workingState.completed &&
          !workingState.notification
        ) {
          dispatch(action());
        }
      });
    }
  }, [loggedInUserId]);

  useEffect(() => {
    const {
      inProgress,
      completed,
      notification,
    } = working.updatingUser;

    const prevInProgress = get(
      previousWorking,
      'updatingUser.inProgress'
    );

    if (action === 'profile' && !inProgress && completed !== null && prevInProgress) {
      setSubmitting(false);

      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      } else {
        setToast({
          message: t('Profile updated'),
          variant: 'success',
        });

        redirectToWorkspace();
      }
    }
  }, [working.updatingUser]);

  useEffect(() => {
    let clinicAction = action === 'new' ? 'creatingClinic' : 'updatingClinic';

    const {
      inProgress,
      completed,
      notification,
    } = working[clinicAction];

    const prevInProgress = get(
      previousWorking,
      [clinicAction, 'inProgress']
    );

    if (!inProgress && completed !== null && prevInProgress) {
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      } else {
        // If the account is flagged for migration, we open the migration confirmation modal.
        // Otherwise redirect to the clinic workspaces tab.
        if (action === 'migrate' && clinic.canMigrate) {
          openMigrationConfirmationModal();
        } else if (action === 'new') {
          setSubmitting(false);

          setToast({
            message: t('"{{name}}" clinic created', clinic),
            variant: 'success',
          });
        }
      }
    }
  }, [working.updatingClinic, working.creatingClinic]);

  useEffect(() => {
    const {
      inProgress,
      completed,
      notification,
    } = working.triggeringInitialClinicMigration;

    let messageDelayTimer;

    const prevInProgress = get(
      previousWorking,
      'triggeringInitialClinicMigration.inProgress'
    );

    if (!inProgress && completed !== null && prevInProgress) {
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      } else {
        setLogoutPending(true);

        setToast({
          message: t('Clinic migration in progress. You will be automatically logged out.'),
          variant: 'success',
        });

        // We log the user since the backend invalidates all of the user's authentication tokens
        // as part of the migration process
        messageDelayTimer = setTimeout(() => dispatch(actions.async.logout(api)), 5000);
      }
    }

    return () => clearTimeout(messageDelayTimer);
  }, [working.triggeringInitialClinicMigration]);

  useEffect(() => {
    setFormikReady((working.fetchingClinicianInvites.completed && working.fetchingClinicsForClinician.completed))
  }, [working.fetchingClinicianInvites.completed, working.fetchingClinicsForClinician.completed])

  function openMigrationConfirmationModal() {
    setShowMigrationDialog(true);
  }

  function closeMigrationConfirmationModal() {
    setSubmitting(false);
    setShowMigrationDialog(false);
  }

  function handleConfirmClinicMigration() {
    setSubmitting(true);
    trackMetric('Clinic - Migration confirmed', { clinicId: selectedClinicId });
    dispatch(actions.async.triggerInitialClinicMigration(api, selectedClinicId));
  }

  return (
    <Box
      variant="containers.mediumBordered"
      p={4}
    >
      {formikReady ? (
        <>
          {displayClinicianForm && (
            <Headline id="clinician-form-header" mb={2}>{t('Update your account')}</Headline>
          )}

          {!displayClinicForm && clinicInvite && (
            <Body1 id="clinic-invite-details" mb={2}>
              <Flex alignItems="center">
                <NotificationIcon ml={0} mr={2} flexShrink={0} />
                <Trans>
                  You have been invited to become a clinic team member at&nbsp;

                  <Text as='span' fontWeight='bold'>
                    {{ clinicName: clinicInvite?.creator?.clinicName }}
                  </Text>.
                </Trans>
              </Flex>
            </Body1>
          )}

          {displayClinicianForm && (
            <Body1 id="clinician-form-info" mb={4}>
              {t('Before accessing your clinic workspace, please provide the additional account information requested below.')}
            </Body1>
          )}

          <Formik
            initialValues={clinicValues()}
            validationSchema={schemas[schema]}
            onSubmit={(values) => {
              setSubmitting(true);

              if (displayClinicianForm) {
                const profileUpdates = {
                  // replace legacy 'clinic' role, if present, with 'clinician'
                  roles: map(user?.roles || [], role => role === 'clinic' ? 'clinician' : role),
                  profile: {
                    fullName: values.fullName,
                    clinic: {},
                  },
                };

                if (values.role) {
                  profileUpdates.profile.clinic.role = values.role;
                }

                if (values.npi) {
                  profileUpdates.profile.clinic.npi = values.npi;
                }

                if (action === 'profile') trackMetric('Web - Clinician Details Setup');
                dispatch(actions.async.updateUser(api, profileUpdates));
              }

              if (displayClinicForm) {
                const clinicValues = pick(values, keys(clinicValuesFromClinic()));

                if (clinic?.id) {
                  trackMetric('Clinic - Account created');
                  dispatch(actions.async.updateClinic(api, clinic.id, clinicValues));
                } else {
                  dispatch(actions.async.createClinic(api, clinicValues, loggedInUserId));
                }
              }
            }}
          >
            {formikContext => (
              <Form id="clinic-profile">
                {displayClinicianForm && (
                  <Flex id="clinician-profile-form" mb={3} flexWrap="wrap" flexDirection={['column', 'row']}>
                    <Box pr={[0,3]} mb={4} flexBasis={['100%', '50%']}>
                      <TextInput
                        {...getCommonFormikFieldProps('fullName', formikContext)}
                        label={t('Name')}
                        placeholder={t('Name')}
                        variant="condensed"
                        width="100%"
                      />
                    </Box>

                    <Box flexBasis="100%" />{/* Flex row break */}

                    <Box pr={[0,3]} mb={4} flexBasis={['100%', '50%']}>
                      <Select
                        {...getCommonFormikFieldProps('role', formikContext)}
                        options={addEmptyOption(roles, t('Job Title'))}
                        label={t('Job Title (Optional)')}
                        variant="condensed"
                        themeProps={{
                          width: '100%',
                        }}
                      />
                    </Box>

                    <Box pl={[0,3]} mb={4} flexBasis={['100%', '50%']}>
                      <TextInput
                        {...getCommonFormikFieldProps('npi', formikContext)}
                        label={t('NPI (Optional)')}
                        placeholder={t('NPI')}
                        variant="condensed"
                        width="100%"
                      />
                    </Box>
                  </Flex>
                )}

                {displayClinicForm && (
                  <Box id="clinic-profile-form">
                    <Headline mb={2}>{t('More about your clinic')}</Headline>
                    <Body1 mb={4}>
                      {t('The information below will be displayed along with your name when you invite patients to connect and share their data remotely. Please ensure you have the correct clinic information for their verification.')}
                    </Body1>

                    <ClinicProfileFields formikContext={formikContext} />

                    <FastField
                      as={Checkbox}
                      id="adminAcknowledge"
                      name="adminAcknowledge"
                      label={t(
                        'By creating this clinic, your Tidepool account will become the default administrator. You can invite other healthcare professionals to join the clinic and add or remove privileges for these accounts at any time.'
                      )}
                      error={formikContext.touched.adminAcknowledge && formikContext.errors.adminAcknowledge}
                      checked={formikContext.values.adminAcknowledge}
                    />
                  </Box>
                )}

                <Flex
                  justifyContent={['center', 'flex-end']}
                  id="clinic-profile-footer"
                  alignItems={'center'}
                  py={3}
                >
                  <Button
                    id="submit"
                    type="submit"
                    processing={submitting}
                    disabled={!fieldsAreValid(
                      keys(schemas[schema].fields),
                      schemas[schema],
                      formikContext.values
                    )}
                  >
                    {t('Submit')}
                  </Button>
                </Flex>
              </Form>
            )}
          </Formik>
          <Dialog
            id="migrateClinic"
            aria-labelledby="dialog-title"
            open={showMigrationDialog}
            onClose={logoutPending ? noop : closeMigrationConfirmationModal}
          >
            <DialogTitle closeIcon={!logoutPending} onClose={closeMigrationConfirmationModal}>
              <MediumTitle id="dialog-title">{t('Confirm Clinic Migration')}</MediumTitle>
            </DialogTitle>
            <DialogContent>
              <Body1>
                {t('You will be logged out of the system upon confirming. You need to login again into your Tidepool account to continue to the new clinic workspace.')}
              </Body1>
            </DialogContent>
            <DialogActions>
              <Button variant="secondary" disabled={logoutPending} onClick={closeMigrationConfirmationModal}>
                {t('Cancel')}
              </Button>
              <Button
                className="confirm-clinic-migration"
                variant="primary"
                disabled={logoutPending}
                processing={working.triggeringInitialClinicMigration.inProgress}
                onClick={() => {
                  handleConfirmClinicMigration();
                }}
              >
                {t('Confirm')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : <Loader />}
    </Box>
  );
};

ClinicDetails.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(ClinicDetails);
