import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { push } from 'connected-react-router';
import styled from '@emotion/styled';
import { Box, Flex, Text } from 'theme-ui';
import { Radio, Label } from 'theme-ui';
import baseTheme from '../../themes/baseTheme';
import { useFormik } from 'formik';
import filter from 'lodash/filter';
import find from 'lodash/find';
import forEach from 'lodash/forEach';
import get from 'lodash/get'
import has from 'lodash/has';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import reject from 'lodash/reject';
import _values from 'lodash/values';
import * as yup from 'yup';
import InputMask from 'react-input-mask';
import cx from 'classnames';

import { Body1, Caption, Title } from '../../components/elements/FontStyles';

import { useToasts } from '../../providers/ToastProvider';
import Button from '../../components/elements/Button';
import TextInput from '../../components/elements/TextInput';
import Checkbox from '../../components/elements/Checkbox';
import * as actions from '../../redux/actions';
import personUtils from '../../core/personutils';
import { getCommonFormikFieldProps, fieldsAreValid } from '../../core/forms';
import { useIsFirstRender } from '../../core/hooks';
import utils from '../../core/utils';

const StyledRadio = styled(Radio)`
  color: ${baseTheme.colors.border.default};
  width: 1.5em;
  height: 1.5em;
  margin-right: 0.5em;

  cursor: pointer;
  transition: ${baseTheme.transitions.easeOut};
  position: relative;

  &.checked {
    color: ${baseTheme.colors.purpleMedium};
  }
`;

const ShareInvite = (props) => {
  const { t, api, trackMetric } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const clinics = useSelector((state) => state.blip.clinics);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const allUsers = useSelector((state) => state.blip.allUsersMap);
  const dataDonationAccounts = useSelector((state) => state.blip.dataDonationAccounts);
  const membersOfTargetCareTeam = useSelector((state) => state.blip.membersOfTargetCareTeam);
  const [pendingClinicInvites, setPendingClinicInvites] = useState([]);
  const pendingSentInvites = useSelector((state) => state.blip.pendingSentInvites);
  const permissionsOfMembersInTargetCareTeam = useSelector((state) => state.blip.permissionsOfMembersInTargetCareTeam);
  const [sharedOrPendingClinicShareCodes, setSharedOrPendingClinicShareCodes] = useState([]);
  const [sharedOrPendingEmails, setSharedOrPendingEmails] = useState([]);

  const {
    fetchingAssociatedAccounts,
    fetchingClinic,
    fetchingClinicsByIds,
    fetchingClinicsForPatient,
    fetchingPatient,
    fetchingPendingSentInvites,
    sendingClinicInvite,
    sendingInvite,
  } = useSelector((state) => state.blip.working);

  // Fetchers
  useEffect(() => {
    if (loggedInUserId) {
      forEach([
        {
          workingState: fetchingPatient,
          action: actions.async.fetchPatient.bind(null, api, loggedInUserId),
        },
        {
          workingState: fetchingClinicsForPatient,
          action: actions.async.fetchClinicsForPatient.bind(null, api, loggedInUserId),
        },
        {
          workingState: fetchingPendingSentInvites,
          action: actions.async.fetchPendingSentInvites.bind(null, api, loggedInUserId),
        },
        {
          workingState: fetchingAssociatedAccounts,
          action: actions.async.fetchAssociatedAccounts.bind(null, api),
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

  // Fetcher for clinics with pending invites
  useEffect(() => {
    const clinicIds = map(filter(pendingClinicInvites, ({ clinicId }) => !clinics[clinicId]), 'clinicId');

    if (
      clinicIds.length &&
      !fetchingClinicsByIds.inProgress &&
      !fetchingClinicsByIds.completed &&
      !fetchingClinicsByIds.notification
    ) {
      dispatch(actions.async.fetchClinicsByIds(api, clinicIds));
    }
  }, [pendingClinicInvites]);

  useEffect(() => {
    const { inProgress, completed, notification } = fetchingClinicsByIds;

    if (!isFirstRender && !inProgress && completed === false) {
      setToast({
        message: get(notification, 'message'),
        variant: 'danger',
      });
    }
  }, [fetchingClinicsByIds]);

  useEffect(() => {
    const pendingInvites = reject(filter(pendingSentInvites, { status: 'pending' }), personUtils.isDataDonationAccount);
    const clinicInvites = filter(pendingInvites, ({ clinicId }) => !isEmpty(clinicId));
    const clinicIds = map(clinicInvites, 'clinicId');
    setPendingClinicInvites(clinicInvites);

    setSharedOrPendingClinicShareCodes([
      ...map(filter(_values(clinics), ({ patients, id }) => (has(patients, loggedInUserId)) || includes(clinicIds, id)), 'shareCode'),
    ]);

    setSharedOrPendingEmails([
      ...map(membersOfTargetCareTeam, memberId => allUsers?.[memberId]?.emails?.[0]),
      ...map(filter(pendingInvites, ({ email }) => !isEmpty(email)), 'email'),
    ]);
  }, [
    clinics,
    membersOfTargetCareTeam,
    pendingSentInvites,
    dataDonationAccounts,
    permissionsOfMembersInTargetCareTeam,
    allUsers,
    loggedInUserId
  ]);


  const [clinic, setClinic] = useState(null);
  const alreadySharedWithClinicMessage = t('You are already sharing with this clinic. Please enter a new share code.');
  const alreadySharedWithMemberMessage = t('You are already sharing with this care team member. Please enter a new email.');

  const shareCodeRegex =
    /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/;

  const validationSchema = yup.object().shape({
    type: yup.string().oneOf(['member', 'clinic']).required(),
    shareCode: yup.string().when('type', {
      is: 'clinic',
      then: (schema) =>
        schema
          .matches(shareCodeRegex, t('Please enter a valid share code'))
          .notOneOf(sharedOrPendingClinicShareCodes, alreadySharedWithClinicMessage)
          .required(t('Please enter a share code')),
      otherwise: (schema) => schema.notRequired(),
    }),
    email: yup.string().when('type', {
      is: 'member',
      then: (schema) =>
        schema
          .matches(utils.emailRegex, t('Please enter a valid email address'))
          .notOneOf(sharedOrPendingEmails, alreadySharedWithMemberMessage)
          .required(t('Email address is required')),
      otherwise: (schema) => schema.notRequired(),
    }),
    uploadPermission: yup.boolean(),
  });

  const formikContext = useFormik({
    initialValues: {
      type: 'clinic',
      email: '',
      shareCode: '',
      uploadPermission: true,
    },
    onSubmit: (values) => {
      if (values.type === 'clinic') {
        if (clinic) {
          const permissions = {
            view: {},
            note: {},
          };

          if (values.uploadPermission) {
            trackMetric('clinic invitation with upload on');
            permissions.upload = {};
          } else {
            trackMetric('clinic invitation with upload off');
          }

          dispatch(
            actions.async.sendClinicInvite(
              api,
              values.shareCode,
              permissions,
              loggedInUserId
            )
          );

          trackMetric('Clicked Invite');
        } else {
          trackMetric('fetched clinic details with share code');

          dispatch(actions.async.fetchClinicByShareCode(api, values.shareCode));
        }
      }
      if (values.type === 'member') {
        const permissions = {
          view: {},
          note: {},
        };

        if (values.uploadPermission) {
          trackMetric('invitation with upload on');
          permissions.upload = {};
        } else {
          trackMetric('invitation with upload off');
        }

        dispatch(actions.async.sendInvite(api, values.email, permissions));

        trackMetric('Clicked Invite');
      }
    },
    validationSchema,
  });

  const { handleSubmit, isSubmitting, setSubmitting, values } = formikContext;

  useEffect(() => {
    const { inProgress, completed } = fetchingClinic;

    if (!(isFirstRender || inProgress)) {
      if (completed) {
        setClinic(find(clinics, { shareCode: values.shareCode }));
      }

      if (completed === false) {
        setToast({
          message: t('We were unable to find a clinic with that share code.'),
          variant: 'danger',
        });
      }

      setSubmitting(false);
    }
  }, [fetchingClinic]);

  useEffect(() => {
    const { inProgress, completed, notification } = sendingClinicInvite;

    if (!(isFirstRender || inProgress)) {
      if (completed) {
        setToast({
          message: t('Share invite to {{clinic}} has been sent.', {
            clinic: clinic.name,
          }),
          variant: 'success',
        });

        dispatch(push(`/patients/${loggedInUserId}/share`));
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }

      setSubmitting(false);
    }
  }, [sendingClinicInvite]);

  useEffect(() => {
    const { inProgress, completed, notification } = sendingInvite;

    if (!(isFirstRender || inProgress)) {
      if (completed) {
        setToast({
          message: t('Share invite to {{email}} has been sent.', {
            email: values.email,
          }),
          variant: 'success',
        });

        dispatch(push(`/patients/${loggedInUserId}/share`));
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }

      setSubmitting(false);
    }
  }, [sendingInvite]);

  const handleBack = () => {
    if (clinic) {
      setClinic(null);
    } else {
      dispatch(push(`/patients/${loggedInUserId}/share`));
    }
  };

  const backButtonText =
    (values.type === 'clinic' && !!clinic) ? t('Back') : t('Cancel');
  const submitButtonText =
    values.type === 'clinic'
      ? clinic
        ? t('Send Invite')
        : t('Submit Code')
      : t('Invite Member');

  return (
    <Box
      as="form"
      id="invite"
      onSubmit={handleSubmit}
      variant="containers.smallBordered"
    >
      <Box
        px={[3, 4, 5]}
        py={3}
        sx={{ borderBottom: baseTheme.borders.default }}
      >
        <Title sx={{ textAlign: ['center', 'left'] }}>{t('Share your data')}</Title>
      </Box>

      <Box
        mx={[3, 3, 6]}
        mt={5}
        sx={{
          border: baseTheme.borders.default,
          borderRadius: baseTheme.radii.default,
        }}
      >
        <Box px={5} py={4} sx={{ borderBottom: baseTheme.borders.default }}>
          <Label mb={3} sx={{ lineHeight: '24px' }}>
            <StyledRadio
              {...getCommonFormikFieldProps('type', formikContext)}
              defaultChecked={true}
              value="clinic"
              className={cx({
                checked: values.type === 'clinic',
              })}
            />
            {t('Share with a Clinic')}
          </Label>
          {!clinic && (
            <>
              <Text as={Body1} mb={2}>
                {t('Enter the 12 digit Clinic share code provided to you')}
              </Text>
              <InputMask
                mask="****-****-****"
                {...getCommonFormikFieldProps('shareCode', formikContext)}
                defaultValue={values.shareCode}
                onChange={(e) => {
                  formikContext.setFieldValue(
                    'shareCode',
                    e.target.value.toUpperCase(),
                    e.target.value.length === 14
                  );
                }}
                onBlur={(e) => {
                  formikContext.setFieldTouched('shareCode');
                  formikContext.setFieldValue(
                    'shareCode',
                    e.target.value.toUpperCase()
                  );
                }}
              >
                <TextInput
                  placeholder={t('Enter share code')}
                  variant="condensed"
                  width="100%"
                  themeProps={{
                    sx: {
                      '> div:first-child': { width: ['100%', '75%', '50%'] },
                      input: {
                        textTransform: 'uppercase',
                        '&::placeholder': {
                          textTransform: 'none',
                        },
                      },
                    },
                  }}
                />
              </InputMask>
            </>
          )}

          {clinic && (
            <>
              <TextInput
                label={t('Clinic Name')}
                id="clinicName"
                name="clinicName"
                value={clinic.name}
                variant="condensed"
                disabled={true}
                themeProps={{
                  mb: 2,
                }}
              />

              <Text as={Caption} mb={2}>
                {t(
                  'If the Clinic Name is incorrect, please go back and check the 12 digit share code you entered.'
                )}
              </Text>

              <Checkbox
                {...getCommonFormikFieldProps(
                  'uploadPermission',
                  formikContext,
                  'checked'
                )}
                label={t('Allow upload of data')}
                width="100%"
                themeProps={{
                  fontSize: 1,
                }}
              />
            </>
          )}
        </Box>

        <Box px={5} py={4}>
          <Label mb={3} sx={{ lineHeight: '24px' }}>
            <StyledRadio
              {...getCommonFormikFieldProps('type', formikContext)}
              value="member"
              className={cx({
                checked: values.type === 'member',
              })}
            />
            <Box>{t('Share with a Care Team Member')}</Box>
          </Label>
          <Text as={Body1} mb={2}>
            {t('Enter the email address of the new care team member')}
          </Text>

          <TextInput
            {...getCommonFormikFieldProps('email', formikContext)}
            placeholder={t('Enter email address')}
            variant="condensed"
            width="100%"
            themeProps={{
              mb: 3,
              sx: {
                '> div:first-child': { width: ['100%', '75%', '50%'] },
              },
            }}
          />

          <Checkbox
            {...getCommonFormikFieldProps(
              'uploadPermission',
              formikContext,
              'checked'
            )}
            label={t('Allow upload of data')}
            width="100%"
            themeProps={{
              fontSize: 1,
            }}
          />
        </Box>
      </Box>

      <Box px={[3, 3, 5]} py={5}>
        <Flex sx={{ justifyContent: ['center', 'flex-end'] }}>
          <Button id="cancel" variant="secondary" onClick={handleBack}>
            {backButtonText}
          </Button>

          <Button
            id="submit"
            type="submit"
            processing={isSubmitting}
            disabled={
              values.type === 'clinic'
                ? !fieldsAreValid(['shareCode'], validationSchema, values)
                : !fieldsAreValid(['email'], validationSchema, values)
            }
            variant="primary"
            ml={3}
          >
            {submitButtonText}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

ShareInvite.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(ShareInvite);
