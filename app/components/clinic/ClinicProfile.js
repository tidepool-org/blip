import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import get from 'lodash/get'
import includes from 'lodash/includes'
import keys from 'lodash/keys';
import { useFormik } from 'formik';
import { Box, Flex, BoxProps } from 'rebass/styled-components';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import FileCopyRoundedIcon from '@material-ui/icons/FileCopyRounded';
import GroupRoundedIcon from '@material-ui/icons/GroupRounded';
import { components as vizComponents } from '@tidepool/viz';

import {
  Caption,
  Title,
} from '../../components/elements/FontStyles';

import * as actions from '../../redux/actions';
import Button from '../../components/elements/Button';
import Icon from '../../components/elements/Icon';
import baseTheme from '../../themes/baseTheme';
import { fieldsAreValid } from '../../core/forms';
import { useIsFirstRender } from '../../core/hooks';
import { clinicValuesFromClinic, clinicSchema as validationSchema } from '../../core/clinicUtils';
import { useToasts } from '../../providers/ToastProvider';
import ClinicProfileFields from './ClinicProfileFields';

const { ClipboardButton } = vizComponents;

export const ClinicProfile = (props) => {
  const { t, api, trackMetric, ...boxProps } = props;
  const isFirstRender = useIsFirstRender();
  const { set: setToast } = useToasts();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const clinics = useSelector((state) => state.blip.clinics);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const { updatingClinic } = useSelector((state) => state.blip.working);
  const clinic = get(clinics, selectedClinicId);
  const isClinicAdmin = includes(get(clinic, ['clinicians', loggedInUserId, 'roles'], []), 'CLINIC_ADMIN');
  const isWorkspacePath = pathname.indexOf('/clinic-workspace') === 0;
  const [editing, setEditing] = useState(false);
  const buttonText = useMemo(() =>
    <Icon
      variant="static"
      icon={FileCopyRoundedIcon}
      label={t('Copy Share Code')}
      title={t('Copy Share Code')}
    />, [t]
  );
  const buttonSuccessText = useMemo(() => <span className="success">{t('✓')}</span>, [t]);

  const navigationAction = {
    label: isWorkspacePath ? t('View Clinic Members'): t('View Patient List'),
    action: () => dispatch(push(isWorkspacePath ? '/clinic-admin' : '/clinic-workspace')),
    metric: isWorkspacePath ? 'Clinic - View clinic members' : 'Clinic - View patient list',
  };

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
    resetForm,
    setSubmitting,
    setValues,
    values,
  } = formikContext;

  useEffect(() => {
    if (clinic) {
      setValues(clinicValuesFromClinic(clinic))
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

        closeClinicEdit()
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }
    }
  }, [updatingClinic]);

  const getButtonText = useCallback(() => clinic?.shareCode, [clinic?.shareCode]);
  const buttonOnClick = useCallback(() => {
    trackMetric('Clinic - Copy clinic share code', {
      clinicId: selectedClinicId,
    });
  }, [selectedClinicId]);

  function handleNavigationAction() {
    const source = isWorkspacePath ? undefined : 'Clinic members';
    trackMetric(navigationAction.metric, { clinicId: selectedClinicId, source });
    navigationAction.action();
  }

  function openClinicEdit() {
    trackMetric('Clinic - Edit clinic profile', { clinicId: selectedClinicId });
    setEditing(true);
  }

  function closeClinicEdit() {
    setEditing(false);
    setSubmitting(false);
    resetForm(clinicValuesFromClinic(clinic));
  }

  if (!clinic) return null;

  return (
    <Box
      variant="containers.largeBordered"
      mb={4}
      {...boxProps}
    >
      {!editing && (
        <Flex id="clinicProfileDetails" px={4} py={3} justifyContent="space-between" alignItems="center">
          <Flex>
            <Box mr={6}>
              <Caption color="grays.4">{t('Clinic Name')}</Caption>
              <Title>{clinic.name}</Title>
            </Box>
            <Box>
              <Caption color="grays.4">{t('Clinic Share Code')}</Caption>
              <Flex
                alignContent="center"
                sx={{
                  button: {
                    border: 'none',
                    color: 'text.primary',
                    paddingTop: '.125em',
                    fontSize: 2,
                    '&:hover,&:active': {
                      border: 'none',
                      color: 'text.primary',
                      backgroundColor: 'transparent',
                    },
                  },
                  '.success': {
                    padding: '.175em 0 0',
                    display: 'block',
                    textAlign: 'center',
                    lineHeight: '1.125em',
                  },
                }}
              >
                <Title>{clinic.shareCode}</Title>
                <ClipboardButton
                  buttonTitle={t('Copy Share Code')}
                  buttonText={buttonText}
                  successText={buttonSuccessText}
                  onClick={buttonOnClick}
                  getText={getButtonText}
                />
              </Flex>
            </Box>
          </Flex>

          <Flex alignItems="center">
            {isClinicAdmin && (
              <Box>
                <Button
                  id="profileEditButton"
                  variant="textSecondary"
                  onClick={openClinicEdit}
                  icon={EditRoundedIcon}
                  iconPosition='left'
                  iconFontSize="1.25em"
                  iconLabel={t('Edit Clinic Profile')}
                  fontSize={1}
                >
                  {t('Edit Clinic Profile')}
                </Button>
              </Box>
            )}

            <Box>
              <Button
                ml={3}
                id="profileNavigationButton"
                variant="textSecondary"
                onClick={handleNavigationAction}
                icon={GroupRoundedIcon}
                iconPosition='left'
                iconLabel={navigationAction.label}
                iconFontSize="1.25em"
              >
                {navigationAction.label}
              </Button>
            </Box>
          </Flex>
        </Flex>
      )}

      {editing && (
        <>
          <Flex
            id="clinic-profile-header"
            sx={{ borderBottom: baseTheme.borders.default }}
            alignItems={'center'}
          >
            <Title p={4} pr={4} flexGrow={1}>
              {t('Clinic Profile')}
            </Title>
          </Flex>
          <Box
            as="form"
            id="clinic-profile-update"
            onSubmit={handleSubmit}
          >
            <ClinicProfileFields p={4} formikContext={formikContext} />

            <Flex
              justifyContent={['center', 'flex-end']}
              id="clinic-profile-footer"
              sx={{ borderTop: baseTheme.borders.default }}
              alignItems={'center'}
              py={4}
            >
              <Button id="cancel" variant="secondary" onClick={closeClinicEdit}>
                {t('Cancel')}
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
        </>
      )}
    </Box>
  );
};

ClinicProfile.propTypes = {
  ...BoxProps,
  api: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(ClinicProfile);
