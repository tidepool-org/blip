import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as actions from '../../redux/actions';
import moment from 'moment';
import { selectPatient, selectUser } from '../../core/selectors';
import { MGDL_UNITS } from '../../core/constants';
import { utils as vizUtils, colors as vizColors } from '@tidepool/viz';
const { GLYCEMIC_RANGES_PRESET, ADA_PREGNANCY_T1_BG_BOUNDS, ADA_GESTATIONAL_T2_BG_BOUNDS } = vizUtils.constants;
import { Box, Flex } from 'theme-ui';
import personUtils from '../../core/personutils';
import baseTheme from '../../themes/baseTheme';

import Button from '../../components/elements/Button';
import Icon from '../../components/elements/Icon';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';

import pickBy from 'lodash/pickBy';

import { getDismissedAltRangeNotificationKey, isRangeWithNonStandardTarget } from '../../providers/AppBanner/appBannerHelpers';
import { getGlycemicRangesPreset } from '../../core/glycemicRangesUtils';

const getRenderedTargetRange = (glycemicRangesPreset, bgUnits) => {
  switch(glycemicRangesPreset) {
    case GLYCEMIC_RANGES_PRESET.ADA_PREGNANCY_T1:    return ADA_PREGNANCY_T1_BG_BOUNDS[bgUnits];
    case GLYCEMIC_RANGES_PRESET.ADA_GESTATIONAL_T2:  return ADA_GESTATIONAL_T2_BG_BOUNDS[bgUnits];
    default:                                         return null;
  }
};

const Notification = ({ clinicId, onDismiss }) => {
  const { t } = useTranslation();
  const clinic = useSelector(state => state.blip.clinics?.[clinicId]) || {};
  const currentPatientInViewId = useSelector(state => state.blip.currentPatientInViewId);
  const updatingPreferences = useSelector(state => state.blip.working?.updatingPreferences);

  const { name, preferredBgUnits: clinicBgUnits = MGDL_UNITS } = clinic;
  const { glycemicRanges } = clinic.patients?.[currentPatientInViewId] || {};

  if (!glycemicRanges) return null;

  const glycemicRangesPreset = getGlycemicRangesPreset(glycemicRanges);

  const { targetLowerBound, targetUpperBound } = getRenderedTargetRange(glycemicRangesPreset, clinicBgUnits) || {};

  return (
    <Box sx={{ background: vizColors.blue00, borderRadius: 8, width: '100%' }} py={2} px={3} mb={3}>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Icon
          className="icon"
          theme={baseTheme}
          variant="static"
          label="info"
          icon={InfoRoundedIcon}
          sx={{ color: vizColors.blue30, fontSize: 4 }}
        />
        <Box>
          <Box sx={{ color: vizColors.blue50, fontWeight: 'medium' }}>
            {t('Non-Standard Target Range')}
          </Box>
          <Box sx={{ color: vizColors.blue50, marginRight: 3 }}>
            {
              t('{{ name }} is using a non-standard target range of {{targetLowerBound}}-{{targetUpperBound}} {{clinicBgUnits}} to view your data',
              { name, targetLowerBound, targetUpperBound, clinicBgUnits })
            }
          </Box>
        </Box>
        <Button
          variant='secondaryCondensed'
          sx={{ border: 'none', marginLeft: 'auto', height: '32px' }}
          onClick={onDismiss}
          disabled={updatingPreferences?.inProgress}
        >
          {t('Dismiss')}
        </Button>
      </Flex>
    </Box>
  );
};

const ClinicsUsingAltRangeNotifications = ({ api }) => {
  const dispatch = useDispatch();
  const clinics = useSelector(state => state.blip.clinics) || {};
  const patient = useSelector(state => selectPatient(state));
  const user = useSelector(state => selectUser(state));
  const fetchingClinicsForPatient = useSelector(state => state.blip.working.fetchingClinicsForPatient);
  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);
  const loggedInUser = useSelector(state => state.blip.allUsersMap?.[loggedInUserId]);
  const preferences = loggedInUser?.preferences || {};

  const isUserPatient = personUtils.isSame(user, patient);

  useEffect(() => {
    if (!fetchingClinicsForPatient?.completed) {
      dispatch(actions.async.fetchClinicsForPatient(api, loggedInUserId));
    }
  }, []);

  if (!isUserPatient) return null;

  const handleDismiss = (clinicId) => {
    const dismissedAt = moment.utc().toISOString();
    const prefUpdate = { [getDismissedAltRangeNotificationKey(clinicId)]: dismissedAt };

    dispatch(actions.async.updatePreferences(api, loggedInUserId, prefUpdate));
  };

  const clinicsWithNotifications = pickBy(clinics, clinic => {
    const glycemicRanges = clinic?.patients?.[patient.userid]?.glycemicRanges;
    const glycemicRangesPreset = getGlycemicRangesPreset(glycemicRanges);
    const isNonStandardTarget = isRangeWithNonStandardTarget(glycemicRangesPreset);

    // Each notification is clinic-specific and individually dismissable, so we need to check
    // if the notification for each particular clinic has been dismissed
    const isDismissed = !!preferences?.[getDismissedAltRangeNotificationKey(clinic.id)];

    return isNonStandardTarget && !isDismissed;
  });

  return (
    <>
      { Object.keys(clinicsWithNotifications).map(clinicId => (
          <Notification
            key={clinicId}
            clinicId={clinicId}
            onDismiss={() => handleDismiss(clinicId)}
          />
        ))
      }
    </>
  );
};

export default ClinicsUsingAltRangeNotifications;
