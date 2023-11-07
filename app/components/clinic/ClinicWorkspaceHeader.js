import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import get from 'lodash/get'
import includes from 'lodash/includes'
import { Box, Flex, BoxProps } from 'theme-ui';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import FileCopyRoundedIcon from '@material-ui/icons/FileCopyRounded';
import GroupRoundedIcon from '@material-ui/icons/GroupRounded';
import { components as vizComponents } from '@tidepool/viz';

import {
  Caption,
  Title,
} from '../elements/FontStyles';

import Button from '../elements/Button';
import Icon from '../elements/Icon';

const { ClipboardButton } = vizComponents;

export const ClinicWorkspaceHeader = (props) => {
  const { t, api, trackMetric, ...boxProps } = props;
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const clinics = useSelector((state) => state.blip.clinics);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinic = get(clinics, selectedClinicId);
  const isClinicAdmin = includes(get(clinic, ['clinicians', loggedInUserId, 'roles'], []), 'CLINIC_ADMIN');
  const isWorkspacePath = pathname.indexOf('/clinic-workspace') === 0;
  const isClinicProfilePath = pathname.indexOf('/clinic-profile') === 0;

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

  function handleClinicEdit() {
    trackMetric('Clinic - Edit clinic profile', { clinicId: selectedClinicId });
    dispatch(push('/clinic-profile'));
  }

  if (!clinic) return null;

  return (
    <Box
      variant="containers.largeBordered"
      mb={4}
      {...boxProps}
    >
      <Flex
        id="clinicProfileDetails"
        px={4}
        py={3}
        sx={{ gap: 2, flexWrap: 'wrap', justifyContent: ['center', 'space-between'], alignItems: 'center' }}
      >
        <Flex sx={{ justifyContent: 'flex-start', alignItems: 'flex-start' }} width={['100%', '100%', 'auto']}>
          <Box mr={6}>
            <Caption sx={{ color: 'grays.4' }}>{t('Clinic Name')}</Caption>
            <Title sx={{ fontSize: [1, 2, 3] }}>{clinic.name}</Title>
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <Caption sx={{ color: 'grays.4' }}>{t('Clinic Share Code')}</Caption>
            <Flex
              alignContent="center"
              sx={{
                button: {
                  border: 'none',
                  color: 'text.primary',
                  paddingTop: '.125em',
                  paddingRight: 0,
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
              <Title sx={{ fontSize: [1, 2, 3], whiteSpace: 'nowrap' }}>{clinic.shareCode}</Title>
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

        <Flex
          width={['100%', '100%', 'auto']}
          sx={{ gap: 3, justifyContent: ['flex-start', 'flex-start', 'flex-end'], alignItems: 'center' }}
        >
          {isClinicAdmin && !isClinicProfilePath && (
            <Box>
              <Button
                id="profileEditButton"
                variant="textSecondary"
                onClick={handleClinicEdit}
                icon={EditRoundedIcon}
                iconPosition='left'
                iconFontSize="1.25em"
                iconLabel={t('Edit Clinic Profile')}
                fontSize={1}
                pl={0}
              >
                {t('Edit Clinic Profile')}
              </Button>
            </Box>
          )}

          <Box>
            <Button
              id="profileNavigationButton"
              variant="textSecondary"
              onClick={handleNavigationAction}
              icon={GroupRoundedIcon}
              iconPosition='left'
              iconFontSize="1.25em"
              iconLabel={navigationAction.label}
              fontSize={1}
              pl={0}
            >
              {navigationAction.label}
            </Button>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

ClinicWorkspaceHeader.propTypes = {
  ...BoxProps,
  api: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(ClinicWorkspaceHeader);
