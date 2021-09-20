import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from 'react-i18next';
import * as yup from 'yup';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import map from 'lodash/map';
import pick from 'lodash/pick';
import { Formik, Form, FastField } from 'formik';
import { Box, Flex } from 'rebass/styled-components';
import countries from 'i18n-iso-countries';
import { Body1, Headline } from '../../components/elements/FontStyles';
import TextInput from '../../components/elements/TextInput';
import Select from '../../components/elements/Select';
import Checkbox from '../../components/elements/Checkbox';
import Button from '../../components/elements/Button';
import ClinicProfileFields from '../../components/clinic/ClinicProfileFields';
import * as actions from '../../redux/actions';
import i18next from '../../core/language';
import config from '../../config';
import { usePrevious } from '../../core/hooks';
import { getCommonFormikFieldProps, fieldsAreValid } from '../../core/forms';
import { useToasts } from '../../providers/ToastProvider';
import { push } from 'connected-react-router';
import { components as vizComponents } from '@tidepool/viz';
import { clinicValuesFromClinic, roles, validationSchema } from '../../core/clinicUtils';
import { addEmptyOption } from '../../core/forms';

const { Loader } = vizComponents;
const t = i18next.t.bind(i18next);
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

const clinicianSchema = yup.object().shape({
  firstName: yup.string().required(t('First name is required')),
  lastName: yup.string().required(t('Last name is required')),
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
  const clinic = get(clinics, selectedClinicId);

  // TODO: do we need to find a different way of deciding whether or not to show the full or partial form?
  // For instance, if a clinic admin goes back to the page, they get the simple profile form.
  // Perhaps -- if selectedClinic is set and the user is an admin, we show the full form
  // Although -- it's strange to show the profile editing in 2 places.  I suppose the real issue is that we
  // use the same form for a new clinician account with a pending invite, and the initial clinic profile
  // creation
  const displayFullForm = config.CLINICS_ENABLED && isEmpty(pendingReceivedClinicianInvites)
  const schema = displayFullForm ? clinicSchema : clinicianSchema;
  const working = useSelector((state) => state.blip.working);
  const previousWorking = usePrevious(working);

  const clinicValues = () => ({
    firstName: '',
    lastName: '',
    role: '',
    npi: '',
    ...clinicValuesFromClinic(clinic),
  });

  function redirectToWorkspace() {
    const redirectPath = displayFullForm ? '/clinic-workspace' : '/workspaces';
    dispatch(push(redirectPath));
  }

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

    if (!displayFullForm && !inProgress && completed && prevInProgress) {
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

    if (!inProgress && completed && prevInProgress) {
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      } else {
        setToast({
          message: t('Clinic Profile updated'),
          variant: 'success',
        });

        // If the account is flagged for migration, we trigger that now.
        // Otherwise redirect to the clinic workspaces tab.
        if (clinic.canMigrate) {
          dispatch(actions.async.triggerInitialClinicMigration(api, clinic.id));
        } else {
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

    const prevInProgress = get(
      previousWorking,
      'triggeringInitialClinicMigration.inProgress'
    );

    if (!inProgress && completed && prevInProgress) {
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      } else {
        setToast({
          message: t('Clinic setup completed'),
          variant: 'success',
        });

        redirectToWorkspace();
      }
    }
  }, [working.triggeringInitialClinicMigration]);

  return (
    <Box
      variant="containers.mediumBordered"
      p={4}
    >
      {working.fetchingClinicianInvites.completed ? (
        <>
          <Headline mb={2}>{t('Update your account')}</Headline>
          <Body1 mb={4}>
            {t('Before accessing your clinic workspace, please provide the additional account information requested below.')}
          </Body1>

          <Formik
            initialValues={clinicValues()}
            validationSchema={schema}
            onSubmit={(values) => {
              const profileUpdates = {
                profile: {
                  fullName: `${values.firstName} ${values.lastName}`,
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
                      {...getCommonFormikFieldProps('firstName', formikContext)}
                      label={t('First Name')}
                      placeholder={t('First Name')}
                      variant="condensed"
                      width="100%"
                    />
                  </Box>

                  <Box pl={[0,3]} mb={4} flexBasis={['100%', '50%']}>
                    <TextInput
                      {...getCommonFormikFieldProps('lastName', formikContext)}
                      label={t('Last Name')}
                      placeholder={t('Last Name')}
                      variant="condensed"
                      width="100%"
                    />
                  </Box>

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

                <Flex justifyContent={['center', 'flex-end']}>
                  <Button
                    id="submit"
                    type="submit"
                    mt={3}
                    processing={formikContext.isSubmitting}
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
