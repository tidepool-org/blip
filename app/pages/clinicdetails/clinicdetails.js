import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import * as yup from 'yup';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
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
import { clinicValuesFromClinic, roles, clinicSchema as validationSchema } from '../../core/clinicUtils';
import { addEmptyOption } from '../../core/forms';
import personUtils from '../../core/personutils';

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

const clinicSchema = clinicianSchema.concat(validationSchema).concat(yup.object().shape({
  adminAcknowledge: yup.boolean()
    .test('isTrue', t('You must acknowledge admin role'), value => (value === true)),
}));

export const ClinicDetails = (props) => {
  const { t, api, trackMetric } = props;
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();

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
  const [displayFullForm, setDisplayFullForm] = useState(false);
  const [populateProfileFields, setPopulateProfileFields] = useState(!isEmpty(clinic?.name));
  const schema = displayFullForm ? clinicSchema : clinicianSchema;
  const working = useSelector((state) => state.blip.working);
  const previousWorking = usePrevious(working);
  const [submitting, setSubmitting] = useState(false);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [clinicInvite, setClinicInvite] = useState();

  const clinicValues = () => ({
    fullName: populateProfileFields ? user?.profile?.fullName || '' : '',
    npi: populateProfileFields? user?.profile?.clinic?.npi || '' : '',
    role: populateProfileFields ? user?.profile?.clinic?.role || '' : '',
    ...clinicValuesFromClinic(clinic),
  });

  function redirectToWorkspace() {
    const redirectPath = isEmpty(pendingReceivedClinicianInvites) ? '/clinic-workspace' : '/workspaces';
    dispatch(push(redirectPath));
  }

  function redirectToClinicianDetails() {
    dispatch(push('/clinician-details'));
  }

  function redirectToPatients() {
    dispatch(push('/patients?justLoggedIn=true'));
  }

  useEffect(() => {
    if (pendingReceivedClinicianInvites.length) {
      setClinicInvite(pendingReceivedClinicianInvites?.[0]);
    }
  }, [pendingReceivedClinicianInvites]);

  useEffect(() => {
    if (clinic && !submitting) {
      // We don't update the form display state until the clinic is available or while submitting
      setDisplayFullForm(isEmpty(clinic?.name) || clinic?.canMigrate);
      setPopulateProfileFields(!isEmpty(clinic?.name));

      if (!isEmpty(clinic.name) && userHasClinicProfile) {
        if (clinic?.canMigrate) {
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

    if (submitting === 'partial' && !inProgress && completed !== null && prevInProgress) {
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
    const {
      inProgress,
      completed,
      notification,
    } = working.updatingClinic;

    const prevInProgress = get(
      previousWorking,
      'updatingClinic.inProgress'
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
        if (clinic.canMigrate) {
          openMigrationConfirmationModal();
        } else {
          setSubmitting(false);

          setToast({
            message: t('Clinic Profile updated'),
            variant: 'success',
          });

          redirectToWorkspace();
        }
      }
    }
  }, [working.updatingClinic]);

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
    const { inProgress, completed, notification } = working.dismissingClinicianInvite;

    const successMessage = t('Invite to {{name}} has been declined.', {
      name: clinicInvite?.creator?.clinicName,
    });

    if (!inProgress) {
      if (completed) {
        setShowDeclineDialog(false);

        setToast({
          message: successMessage,
          variant: 'success',
        });

        if (personUtils.isClinicianAccount(user) && !userHasClinicProfile) {
          // If the clinician is a newly created account, and thus has no clinician profile, we send
          // them to the clinician profile form.
          redirectToClinicianDetails();
        } else {
          // Otherwise, we redirect them to the patients view as would have been the login default
          redirectToPatients();
        }
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }
    }
  }, [working.dismissingClinicianInvite]);


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

  function handleDeclineInvite(workspace) {
    trackMetric('Clinic - Details Form - Ignore clinic invite', { clinicId: selectedClinicId });
    setShowDeclineDialog(true);
  }

  function handleConfirmDeclineInvite() {
    trackMetric('Clinic - Details Form - Ignore clinic invite confirmed', { clinicId: selectedClinicId });

    dispatch(
      actions.async.dismissClinicianInvite(
        api,
        loggedInUserId,
        clinicInvite.key
      )
    );
  }

  return (
    <Box
      variant="containers.mediumBordered"
      p={4}
    >
      {working.fetchingClinicianInvites.completed !== null ? (
        <>
          <Headline mb={2}>{t('Update your account')}</Headline>

          {!displayFullForm && (
            <Body1 mb={2}>
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

          <Body1 mb={4}>
            {t('Before accessing your clinic workspace, please provide the additional account information requested below.')}
          </Body1>

          <Formik
            initialValues={clinicValues()}
            validationSchema={schema}
            onSubmit={(values) => {
              setSubmitting(displayFullForm ? 'full' : 'partial');

              const profileUpdates = {
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

              dispatch(actions.async.updateUser(api, profileUpdates));

              if (displayFullForm) {
                trackMetric('Clinic - Account created');
                dispatch(actions.async.updateClinic(api, clinic.id, pick(values, keys(clinicValuesFromClinic()))));
              }
            }}
          >
            {formikContext => (
              <Form id="clinic-profile">
                <Flex mb={3} flexWrap="wrap" flexDirection={['column', 'row']}>
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

                {displayFullForm && (
                  <>
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
                  </>
                )}

                <Flex
                  justifyContent={['center', 'flex-end']}
                  id="clinic-profile-footer"
                  alignItems={'center'}
                  py={3}
                >
                  {!displayFullForm && (
                    <Button
                      variant="secondary"
                      className="decline-invite"
                      mr={2}
                      onClick={handleDeclineInvite}
                    >
                      Decline Invite
                    </Button>
                  )}

                  <Button
                    id="submit"
                    type="submit"
                    processing={!!submitting}
                    disabled={!fieldsAreValid(
                      keys(schema.fields),
                      schema,
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
            aria-labelledBy="dialog-title"
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

          <Dialog
            id="declineInvite"
            aria-labelledBy="dialog-title"
            open={showDeclineDialog}
            onClose={() => setShowDeclineDialog(false)}
          >
            <DialogTitle onClose={() => setShowDeclineDialog(false)}>
              <MediumTitle id="dialog-title">{t('Decline {{name}}', { name: clinicInvite?.creator?.clinicName })}</MediumTitle>
            </DialogTitle>
            <DialogContent>
              <Body1>
                {t('If you decline this invite, you will need to ask your Clinic Admin to send a new one. Are you sure you want to decline the invite to the {{name}} clinic workspace? ', { name: clinicInvite?.creator?.clinicName })}
              </Body1>
            </DialogContent>
            <DialogActions>
              <Button variant="secondary" onClick={() => setShowDeclineDialog(false)}>
                {t('Cancel')}
              </Button>
              <Button
                className="confirm-decline-invite"
                variant="danger"
                processing={working.dismissingClinicianInvite.inProgress}
                onClick={() => {
                  handleConfirmDeclineInvite();
                }}
              >
                {t('Decline Invite')}
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
