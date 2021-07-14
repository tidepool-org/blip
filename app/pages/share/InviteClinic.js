import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from 'react-i18next';
import { push } from 'connected-react-router';
import { Box, Flex, Text } from 'rebass/styled-components';
import baseTheme from '../../themes/baseTheme';
import { useFormik } from 'formik';
import find from 'lodash/find';
import get from 'lodash/get';
import * as yup from 'yup';
import InputMask from 'react-input-mask';

import {
  Body1,
  Caption,
  Title,
} from '../../components/elements/FontStyles';

import { useToasts } from '../../providers/ToastProvider';
import Button from '../../components/elements/Button';
import TextInput from '../../components/elements/TextInput';
import Checkbox from '../../components/elements/Checkbox';
import * as actions from '../../redux/actions';
import { getCommonFormikFieldProps, fieldsAreValid } from '../../core/forms';
import { useIsFirstRender } from '../../core/hooks';

const InviteClinic = props => {
  const { t, api, trackMetric } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const clinics = useSelector((state) => state.blip.clinics);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const { sendingClinicInvite, fetchingClinic } = useSelector((state) => state.blip.working);
  const [clinic, setClinic] = useState(null);

  const shareCodeRegex = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/

  const validationSchema = yup.object().shape({
    shareCode: yup.string()
      .matches(shareCodeRegex, t('Please enter a valid share code'))
      .required(t('Please enter a share code')),
    uploadPermission: yup.boolean(),
  });

  const formikContext = useFormik({
    initialValues: {
      shareCode: '',
      uploadPermission: false,
    },
    onSubmit: (values, { setSubmitting }) => {
      if (clinic) {
        const permissions = {
          view: {},
          note: {}
        };

        if (values.uploadPermission) {
          trackMetric('clinic invitation with upload on');
          permissions.upload = {};
        } else {
          trackMetric('clinic invitation with upload off');
        }

        dispatch(
          actions.async.sendClinicInvite(api, values.shareCode, permissions, loggedInUserId)
        );

        trackMetric('Clicked Invite');
      } else {
        trackMetric('fetched clinic details with share code');

        dispatch(
          actions.async.fetchClinicByShareCode(api, values.shareCode)
        );
      }
    },
    validationSchema,
  });

  const {
    handleSubmit,
    isSubmitting,
    setSubmitting,
    values,
  } = formikContext;


  useEffect(() => {
    const { inProgress, completed, notification } = fetchingClinic;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        setClinic(find(clinics, { shareCode: values.shareCode }));
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }

      setSubmitting(false);
    }
  }, [fetchingClinic]);

  useEffect(() => {
    const { inProgress, completed, notification } = sendingClinicInvite;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        setToast({
          message: t('Share invitation to {{clinic}} has been sent.', {
            clinic: clinic.name,
          }),
          variant: 'success',
        });

        dispatch(push(`/patients/${loggedInUserId}/share`))
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

  const handleBack = () => {
    if (clinic) {
      setClinic(null);
    } else {
      dispatch(push(`/patients/${loggedInUserId}/share`))
    }
  };

  const backButtonText = clinic ? t('Cancel') : t('Back');
  const submitButtonText = clinic ? t('Send Invite') : t('Submit Code');

  return (
    <Box
      as="form"
      id="invite-clinic"
      onSubmit={handleSubmit}
      mx="auto"
      mt={2}
      mb={6}
      bg="white"
      width={[1, 0.85]}
      sx={{
        border: baseTheme.borders.default,
        borderLeft: ['none', baseTheme.borders.default],
        borderRight: ['none', baseTheme.borders.default],
        borderRadius: ['none', baseTheme.radii.default],
        maxWidth: '640px',
      }}
    >
      <Box
        px={[3, 4, 5]}
        py={3}
        sx={{ borderBottom: baseTheme.borders.default }}
      >
        <Title textAlign={['center', 'left']}>{t('Share with a Clinic')}</Title>
      </Box>

      <Box px={5} py={5}>

        {!clinic && (
          <>
            <Text as={Body1} mb={3}>
              {t('Please enter the 12 digit Clinic share code provided to you.')}
            </Text>
            <InputMask
              mask="****-****-****"
              {...getCommonFormikFieldProps('shareCode', formikContext)}
              defaultValue={values.shareCode}
              onChange={e => {
                formikContext.setFieldValue('shareCode', e.target.value.toUpperCase(), e.target.value.length === 14);
              }}
              onBlur={e => {
                formikContext.setFieldTouched('shareCode');
                formikContext.setFieldValue('shareCode', e.target.value.toUpperCase());
              }}
            >
              <TextInput
                placeholder={t('Enter share code')}
                variant="condensed"
                themeProps={{
                  mb: 5,
                  sx: {
                    input: {
                      textTransform: 'uppercase',
                      '&::placeholder': {
                        textTransform: 'none',
                      },
                    },
                  }
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
              disabled
              themeProps={{
                mb: 2,
              }}
            />

            <Text as={Caption} mb={5}>
              {t('If the Clinic Name is incorrect, please go back and check the 12 digit share code you entered.')}
            </Text>

            <Checkbox
              {...getCommonFormikFieldProps('uploadPermission', formikContext, 'checked')}
              label={t('Allow upload of data')}
              width="100%"
              themeProps={{
                fontSize: 1,
                mb: 5,
              }}
            />
          </>
        )}

        <Flex justifyContent={['center', 'flex-end']}>
          <Button id="cancel" variant="secondary" onClick={handleBack}>
            {backButtonText}
          </Button>

          <Button id="submit" type="submit" processing={isSubmitting} disabled={!fieldsAreValid(['shareCode'], validationSchema, values)} variant="primary" ml={3}>
            {submitButtonText}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

InviteClinic.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(InviteClinic);
