import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from 'react-i18next';
import { push } from 'connected-react-router';
import { Box, Flex, Text } from 'rebass/styled-components';
import baseTheme from '../../themes/baseTheme';
import { useFormik } from 'formik';
import get from 'lodash/get';
import * as yup from 'yup';

import {
  Title,
  Body1,
} from '../../components/elements/FontStyles';

import { useToasts } from '../../providers/ToastProvider';
import Button from '../../components/elements/Button';
import TextInput from '../../components/elements/TextInput';
import Checkbox from '../../components/elements/Checkbox';
import * as actions from '../../redux/actions';
import { getCommonFormikFieldProps, fieldsAreValid } from '../../core/forms';
import { useIsFirstRender } from '../../core/hooks';

const InviteMember = props => {
  const { t, api, trackMetric } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const { sendingInvite } = useSelector((state) => state.blip.working);

  const validationSchema = yup.object().shape({
    email: yup.string()
      .email(t('Please enter a valid email address'))
      .required(t('Email address is required')),
    uploadPermission: yup.boolean(),
  });

  const formikContext = useFormik({
    initialValues: {
      email: '',
      uploadPermission: false,
    },
    onSubmit: values => {
      const permissions = {
        view: {},
        note: {}
      };

      if (values.uploadPermission) {
        trackMetric('invitation with upload on');
        permissions.upload = {};
      } else {
        trackMetric('invitation with upload off');
      }

      dispatch(
        actions.async.sendInvite(api, values.email, permissions)
      );

      trackMetric('Clicked Invite');
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
    const { inProgress, completed, notification } = sendingInvite;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        setToast({
          message: t('Share invitation to {{email}} has been sent.', {
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

  const handleSwitchToShareCodeInvite = () => {
    dispatch(push(`/patients/${loggedInUserId}/share/clinic`));
  };

  return (
    <Box
      as="form"
      id="invite-member"
      onSubmit={handleSubmit}
      variant="containers.smallBordered"
    >
      <Box
        px={[3, 4, 5]}
        py={3}
        sx={{ borderBottom: baseTheme.borders.default }}
      >
        <Title textAlign={['center', 'left']}>{t('Share with a Member')}</Title>
      </Box>

      <Box px={5} py={5}>
        <Text as={Body1} mb={3}>
          {t('To share your data, please enter the email address of the new member.')}
        </Text>

        <TextInput
          {...getCommonFormikFieldProps('email', formikContext)}
          placeholder={t('Enter email address')}
          variant="condensed"
          themeProps={{
            mb: 3
          }}
        />

        <Checkbox
          {...getCommonFormikFieldProps('uploadPermission', formikContext, 'checked')}
          label={t('Allow upload of data')}
          width="100%"
          themeProps={{
            fontSize: 1,
            mb: 5,
          }}
        />

        <Button
          variant='textTertiary'
          mb={5}
          px={0}
          py={2}
          fontSize={0}
          onClick={handleSwitchToShareCodeInvite}
        >
          {t('Want to share data with a new clinic? Invite via clinic share code')}
        </Button>

        <Flex justifyContent={['center', 'flex-end']}>
          <Button id="cancel" variant="secondary" onClick={() => dispatch(push(`/patients/${loggedInUserId}/share`))}>
            {t('Cancel')}
          </Button>

          <Button id="submit" type="submit" processing={isSubmitting} disabled={!fieldsAreValid(['email'], validationSchema, values)} variant="primary" ml={3}>
            {t('Invite Member')}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

InviteMember.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(InviteMember);
