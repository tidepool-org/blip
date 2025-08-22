import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPatient, selectUser } from '../../core/selectors';
import mapValues from 'lodash/mapValues';
import { utils as vizUtils, colors as vizColors, constants as vizConstants } from '@tidepool/viz';
const {
  GLYCEMIC_RANGE,
  ADA_OLDER_HIGH_RISK_BG_BOUNDS,
  ADA_PREGNANCY_T1_BG_BOUNDS,
  ADA_GESTATIONAL_T2_BG_BOUNDS,
} = vizUtils.constants;
import personUtils from '../../core/personutils';
import { Box, Flex } from 'theme-ui';
import { useTranslation } from 'react-i18next';
import Button from '../../components/elements/Button';
import * as actions from '../../redux/actions';
import moment from 'moment';

import pickBy from 'lodash/pickBy';
import { MGDL_UNITS } from '../../core/constants';

import { getDismissedAltRangeNotificationKey, isRangeWithNonStandardTarget } from '../../providers/AppBanner/appBannerHelpers';

const getRenderedTargetRange = (glycemicRanges, bgUnits) => {
  switch(glycemicRanges) {
    case GLYCEMIC_RANGE.ADA_PREGNANCY_T1:    return ADA_PREGNANCY_T1_BG_BOUNDS[bgUnits];
    case GLYCEMIC_RANGE.ADA_GESTATIONAL_T2:  return ADA_GESTATIONAL_T2_BG_BOUNDS[bgUnits];
    default:                                 return null;
  }
};

const Notification = ({ clinicId, onDismiss }) => {
  const { t } = useTranslation();
  const clinic = useSelector(state => state.blip.clinics?.[clinicId]) || {};
  const currentPatientInViewId = useSelector(state => state.blip.currentPatientInViewId);
  const updatingPreferences = useSelector(state => state.blip.working?.updatingPreferences);

  const { name, preferredBgUnits: clinicBgUnits = MGDL_UNITS } = clinic;
  const { glycemicRanges } = clinic.patients?.[currentPatientInViewId];

  if (!glycemicRanges) return null;

  const { targetLowerBound, targetUpperBound } = getRenderedTargetRange(glycemicRanges, clinicBgUnits) || {};

  return (
    <Box sx={{ background: vizColors.white, borderRadius: 8 }} py={2} px={4} mb={3}>
      <Flex sx={{ justifyContent: 'space-between', gap: 4 }}>
        <Box>
          <Box sx={{ color: vizColors.blue50, fontWeight: 'medium' }}>
            {t('Adjusted Target Range')}
          </Box>
          <Box sx={{ color: vizColors.blue50 }}>
            {
              t('{{ name }} is using a non-standard target range of {{targetLowerBound}}-{{targetUpperBound}} {{clinicBgUnits}} to view your data.',
              { name, targetLowerBound, targetUpperBound, clinicBgUnits })
            }
          </Box>
        </Box>
        <Button
          variant='secondaryCondensed'
          sx={{ border: 'none' }}
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
  const loggedInUser = useSelector(state => state.blip.allUsersMap[loggedInUserId]);
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

    const isNonStandardTarget = isRangeWithNonStandardTarget(glycemicRanges);
    const isDismissed = !!preferences?.[getDismissedAltRangeNotificationKey(clinic.id)];

    return isNonStandardTarget && !isDismissed;
  });

  return (
    <Box>
      { Object.keys(clinicsWithNotifications).map(clinicId => (
          <Notification
            key={clinicId}
            clinicId={clinicId}
            onDismiss={() => handleDismiss(clinicId)}
          />
        ))
      }
    </Box>
  );
};

export default ClinicsUsingAltRangeNotifications;
