import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import get from 'lodash/get'
import { Box, Flex, Text, Link, BoxProps } from 'theme-ui';
import FileCopyRoundedIcon from '@material-ui/icons/FileCopyRounded';
import GroupRoundedIcon from '@material-ui/icons/GroupRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import { components as vizComponents } from '@tidepool/viz';

import Button from '../elements/Button';
import Icon from '../elements/Icon';
import Pill from '../elements/Pill';
import { URL_TIDEPOOL_PLUS_PLANS } from '../../core/constants';

const { ClipboardButton } = vizComponents;

export const ClinicWorkspaceHeader = (props) => {
  const { t, api, trackMetric, ...boxProps } = props;
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const clinics = useSelector((state) => state.blip.clinics);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = get(clinics, selectedClinicId);
  const isWorkspacePath = pathname.indexOf('/clinic-workspace') === 0;

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
    label: isWorkspacePath ? t('Workspace Settings'): t('View Patient List'),
    icon: isWorkspacePath ? SettingsRoundedIcon : GroupRoundedIcon,
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
        sx={{
          columnGap: 5,
          flexWrap: 'wrap',
          justifyContent: ['center', 'space-between'],
          alignItems: 'center',
          rowGap: 2,
        }}
      >
        <Flex
          sx={{
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
            width:['100%', '100%', 'auto'],
            flexWrap: 'wrap',
            columnGap: 5,
            rowGap: 2,
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <Text as="span" sx={{ color: 'text.primary', fontSize: [1, 2, '18px'], fontWeight: 'medium' }}>{clinic.name}</Text>
          </Box>
          <Flex sx={{ color: 'text.primary', flexShrink: 0, gap: 2, fontSize: 1, alignItems: 'flex-end' }}>
            <Text>{t('Share Code:')}</Text>
            <Flex
              sx={{
                columnGap: 2,
                alignItems: 'flex-start',
                button: {
                  border: 'none',
                  color: 'text.primary',
                  top: '1px',
                  p: 0,
                  m: 0,
                  position: 'relative',
                  '&:hover,&:active': {
                    border: 'none',
                    color: 'text.primary',
                    backgroundColor: 'transparent',
                  },
                },
                '.success': {
                  position: 'relative',
                  display: 'block',
                  top: '2px',
                },
              }}
            >
              <Text as="span" sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>{clinic.shareCode}</Text>
              <ClipboardButton
                buttonTitle={t('Copy Share Code')}
                buttonText={buttonText}
                successText={buttonSuccessText}
                onClick={buttonOnClick}
                getText={getButtonText}
              />
            </Flex>
          </Flex>

          {clinic?.ui?.display?.planName && (
            <Flex sx={{ color: 'text.primary', flexShrink: 0, gap: 2, fontSize: 1, alignItems: 'flex-end' }}>
              <Text>{t('Plan:')}</Text>
              <Box>
                <Pill
                  id="clinicProfilePlan"
                  text={clinic?.ui.text.planDisplayName}
                  label={t('plan name')}
                  colorPalette="primaryText"
                  condensed
                />
              </Box>
            </Flex>
          )}

          {clinic?.ui && (
            <Flex sx={{ color: 'text.primary', flexShrink: 0, gap: 2, fontSize: 1, alignItems: 'flex-end' }}>
              <Text>{t('Patient Accounts:')}</Text>
              <Box>
                {clinic?.ui.display.patientCount && (
                  <Pill
                    id="clinicPatientLimits"
                    sx={{ fontSize: 1 }}
                    px={1}
                    pt="2px"
                    pb={0}
                    text={`${clinic.patientCount}${clinic.ui.display?.patientLimit ? ' / ' + clinic.patientCountSettings?.hardLimit?.patientCount : '' }`}
                    icon={clinic?.ui.warnings.limitReached ? WarningRoundedIcon : null}
                    label={t('Patient Count')}
                    colorPalette={clinic?.ui.warnings.limitReached || clinic?.ui.warnings.limitApproaching ? 'warning' : 'transparent'}
                  />
                )}

                {clinic?.ui.display.patientLimit && !clinic?.ui.warnings.limitReached && (
                  <Box sx={{ position: 'relative', top: clinic?.ui.warnings.limitApproaching ? '1px' : '-3px' }}>
                    <Box
                      sx={{
                        width: '100%',
                        height: '2px',
                        bg: 'grays.1',
                        position: 'absolute',
                        zIndex: 0,
                        borderRadius: 'full',
                      }}
                    />

                    <Box
                      sx={{
                        width: `${clinic.patientCount / clinic.patientCountSettings?.hardLimit?.patientCount * 100}%`,
                        minWidth: '3px',
                        height: '2px',
                        bg: clinic?.ui.warnings.limitApproaching ? 'feedback.warning' : 'purpleMedium',
                        position: 'absolute',
                        zIndex: 1,
                        borderRadius: 'full',
                      }}
                    />
                  </Box>
                )}
              </Box>

              {(clinic?.ui?.warnings?.limitApproaching || clinic?.ui?.warnings?.limitReached) && (
                <Link
                  id="clinicProfileUnlockPlansLink"
                  href={URL_TIDEPOOL_PLUS_PLANS}
                  target="_blank"
                  rel="noreferrer noopener"
                  sx={{
                    fontSize: 1,
                    fontWeight: 'medium',
                  }}
                >
                  {t('Unlock Plans')}
                </Link>
              )}
            </Flex>
          )}
        </Flex>

        <Flex
          width={['100%', '100%', 'auto']}
          sx={{ gap: 3, justifyContent: ['flex-start', 'flex-start', 'flex-end'], alignItems: 'center' }}
        >
          <Box>
            <Button
              id="profileNavigationButton"
              variant="textSecondary"
              onClick={handleNavigationAction}
              icon={navigationAction.icon}
              iconPosition='left'
              iconFontSize="1.25em"
              iconLabel={navigationAction.label}
              sx={{ fontSize: 1 }}
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
