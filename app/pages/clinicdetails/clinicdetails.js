import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';
import { useParams, useLocation, Link as RouterLink } from 'react-router-dom';
import * as yup from 'yup';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import map from 'lodash/map';
import noop from 'lodash/noop';
import pick from 'lodash/pick';
import values from 'lodash/values';
import { useFormik } from 'formik';
import { Box, Flex, Text, Link } from 'theme-ui';
import countries from 'i18n-iso-countries';

import { Body1, MediumTitle, Paragraph1 } from '../../components/elements/FontStyles';
import TextInput from '../../components/elements/TextInput';
import Select from '../../components/elements/Select';
import Checkbox from '../../components/elements/Checkbox';
import Button from '../../components/elements/Button';
import NotificationIcon from '../../components/elements/NotificationIcon';
import Container from '../../components/elements/Container';
import ClinicProfileFields from '../../components/clinic/ClinicProfileFields';
import * as actions from '../../redux/actions';
import i18next from '../../core/language';
import { usePrevious } from '../../core/hooks';
import { getCommonFormikFieldProps, fieldsAreValid } from '../../core/forms';
import { useToasts } from '../../providers/ToastProvider';
import { push } from 'connected-react-router';
import { components as vizComponents } from '@tidepool/viz';
import { clinicValuesFromClinic, roles, clinicSchema as clinicValidationSchema } from '../../core/clinicUtils';
import personUtils from '../../core/personutils';
import { addEmptyOption } from '../../core/forms';
import { fontWeights } from '../../themes/baseTheme';

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
  firstName: yup.string().required(t('First Name is required')),
  lastName: yup.string().required(t('Last Name is required')),
  role: yup.string().oneOf([...map(roles, 'value'), '']).required(t('Job Title is required')),
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
  const [populateProfileFields, setPopulateProfileFields] = useState(includes(['new', 'profile'], action));
  const working = useSelector((state) => state.blip.working);
  const previousWorking = usePrevious(working);
  const [submitting, setSubmitting] = useState(false);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [clinicInvite, setClinicInvite] = useState();
  const [formikReady, setFormikReady] = useState(false);
  const location = useLocation();
  const referrer = location.state?.referrer;
  const isUploadLaunch = referrer === 'upload-launch';

  let schema = displayClinicForm ? 'clinic' : 'clinician';
  if (displayClinicForm && displayClinicianForm) schema = 'combined';

  const formText = {
    new: {
      title: t('Create your Clinic Workspace'),
      subtitle: null,
      submitText: t('Create Workspace'),
    },
    profile: {
      title: t('Welcome'),
      subtitle: t('Tell us more about yourself'),
      submitText: t('Next'),
    },
    migrate: {
      title: t('Create your Clinic Workspace'),
      subtitle: t('Tell us more about yourself and your clinic'),
      submitText: t('Create Workspace'),
    },
  };

  const clinicValues = () => {
    const { firstName, lastName } = personUtils.splitNamesFromFullname(user?.profile?.fullName);

    return {
      firstName: populateProfileFields ? firstName : '',
      lastName: populateProfileFields ? lastName : '',
      role: populateProfileFields ? user?.profile?.clinic?.role || '' : '',
      ...clinicValuesFromClinic(action === 'new' ? undefined : clinic),
    };
  };

  function redirectBack() {
    if (referrer) dispatch(push(referrer));
  }

  const redirectToWorkspace = useCallback(() => {
    const redirectPath = isEmpty(pendingReceivedClinicianInvites) && keys(clinics).length === 1
      ? '/clinic-workspace'
      : '/workspaces';

    const isWorkspaceRedirect = redirectPath === '/clinic-workspace';

    const redirectState = { selectedClinicId: isWorkspaceRedirect && keys(clinics).length === 1
      ? values(clinics)[0].id
      : null,
    };

    dispatch(push(redirectPath, redirectState));
  }, [
    dispatch,
    pendingReceivedClinicianInvites,
    clinics,
  ]);

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
          if (action !== 'new') {
            // If there is no reason for the user to be here, we redirect them appropriately
            redirectToWorkspace();
          }
        }
      }
    }
  }, [
    action,
    clinic,
    submitting,
    userHasClinicProfile,
    redirectToWorkspace,
  ]);

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
          action: actions.async.getClinicsForClinician.bind(null, api, loggedInUserId, { limit: 1000, offset: 0 }),
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

        if (isUploadLaunch) {
          dispatch(
            push({
              pathname: '/upload-redirect',
              state: { referrer: 'profile' },
            })
          );
        } else {
          // Redirect to new clinic setup form
          dispatch(push('/clinic-details/new', { referrer: location.pathname }));
        }
      }
    }
  }, [working.updatingUser]);

  useEffect(() => {
    let clinicAction = action === 'new' ? 'creatingClinic' : 'updatingClinic';

    const {
      inProgress,
      completed,
      notification,
      clinicId,
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
            message: t('"{{name}}" clinic created', clinics[clinicId]),
            variant: 'success',
          });

          redirectToWorkspace();
        }
      }
    }
  }, [
    working,
    previousWorking,
    action,
    clinic,
    clinics,
    redirectToWorkspace,
    setToast,
    t,
  ]);

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

  const formikContext = useFormik({
    initialValues: clinicValues(),
    validationSchema: schemas[schema],
    onSubmit: values => {
      setSubmitting(true);

      if (displayClinicianForm) {
        const profileUpdates = {
          // replace legacy 'clinic' role, if present, with 'clinician'
          roles: map(user?.roles || [], role => role === 'clinic' ? 'clinician' : role),
          profile: {
            fullName: personUtils.fullnameFromSplitNames(values.firstName, values.lastName),
            clinic: {},
          },
        };

        if (values.role) {
          profileUpdates.profile.clinic.role = values.role;
        }

        dispatch(actions.async.updateUser(api, profileUpdates));

        if (action === 'profile') {
          trackMetric('Web - Clinician Details Setup');
          if (clinicInvite) redirectToWorkspace();
        }
      }

      if (displayClinicForm) {
        trackMetric('Clinic - Account created');
        const clinicValues = pick(values, keys(clinicValuesFromClinic()));

        if (clinic?.id && action !== 'new') {
          dispatch(actions.async.updateClinic(api, clinic.id, clinicValues));
        } else {
          dispatch(actions.async.createClinic(api, clinicValues, loggedInUserId));
        }
      }
    },
  });

  useEffect(() => {
    if (populateProfileFields) {
      formikContext.setValues(clinicValues())
    }
  }, [populateProfileFields]);

  useEffect(() => {
      formikContext.resetForm();
  }, [action]);

  const formActions = [{
    id: 'submit',
    children: formText[action].submitText,
    processing: submitting,
    disabled: !fieldsAreValid(
      keys(schemas[schema].fields),
      schemas[schema],
      formikContext?.values
    ),
    onClick: () => formikContext.submitForm(),
  }];

  if (action === 'new' && referrer) formActions.unshift({
    id: 'back',
    variant: 'secondary',
    children: t('Back'),
    onClick: () => redirectBack(),
  })

  return (
    <Container
      title={formText[action].title}
      subtitle={formText[action].subtitle}
      variant="mediumBordered"
      actions={formActions}
      p={4}
      pt={3}
    >
      {formikReady ? (
        <>
          {!displayClinicForm && clinicInvite && (
            <Body1 id="clinic-invite-details" mb={2}>
              <Flex sx={{ alignItems: 'center' }}>
                <NotificationIcon ml={0} mr={2} sx={{ flexShrink: 0 }} />
                <Trans>
                  You have been invited to become a clinic team member at&nbsp;

                  <Text as='span' fontWeight='bold'>
                    {{ clinicName: clinicInvite?.creator?.clinicName }}
                  </Text>.
                </Trans>
              </Flex>
            </Body1>
          )}

          <Box id="clinic-profile">
            {displayClinicianForm && (
              <Flex id="clinician-profile-form" sx={{ flexWrap: 'wrap', flexDirection: ['column', 'row'], alignItems: [null, 'flex-start'] }}>
                <Box pr={[0,1]} mb={[2, 4]} sx={{ flexBasis: ['100%', '50%'] }}>
                  <TextInput
                    {...getCommonFormikFieldProps('firstName', formikContext)}
                    label={t('Your full name')}
                    placeholder={t('First name')}
                    variant="condensed"
                    width="100%"
                  />
                </Box>

                <Box pr={[0,0]} mb={4} sx={{ flexBasis: ['100%', '50%'] }}>
                  <TextInput
                    {...getCommonFormikFieldProps('lastName', formikContext)}
                    label={t('Last name')}
                    hideLabel
                    placeholder={t('Last name')}
                    variant="condensed"
                    width="100%"
                  />
                </Box>

                <Box sx={{ flexBasis: '100%' }}>
                  <Select
                    {...getCommonFormikFieldProps('role', formikContext)}
                    options={addEmptyOption(roles, t('Role or job title'))}
                    label={t('Role or job title')}
                    variant="condensed"
                    themeProps={{
                      width: '100%',
                    }}
                  />
                </Box>
              </Flex>
            )}

            {displayClinicForm && (
              <Box id="clinic-profile-form">
                <Box variant="containers.wellBordered" mt={action === 'migrate' ? 4 : 0} mb={4}>
                  <Paragraph1 fontWeight={fontWeights.medium}>
                    {t('The information below will be displayed along with your name when you invite patients to connect and share their data remotely. Please ensure you have the correct clinic information for their verification.')}
                  </Paragraph1>

                  <Paragraph1 fontWeight={fontWeights.medium}>
                    <Trans i18nKey="html.skip-workspace-setup">
                      If you're waiting to be invited to someone else's clinic workspace, you can <Link as={RouterLink} className="skip-to-workspace-link" to="/workspaces">skip this step for now</Link>.
                    </Trans>
                  </Paragraph1>
                </Box>

                <ClinicProfileFields formikContext={formikContext} />

                <Checkbox
                  {...getCommonFormikFieldProps('adminAcknowledge', formikContext, 'checked')}
                  themeProps={{ sx: { 'span': { lineHeight: 2 } } }}
                  label={t(
                    'By creating this clinic, your Tidepool account will become the default administrator. You can invite other healthcare professionals to join the clinic and add or remove privileges for these accounts at any time.'
                  )}
                />
              </Box>
            )}
          </Box>

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
    </Container>
  );
};

ClinicDetails.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(ClinicDetails);
