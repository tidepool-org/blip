import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPatient, selectUser } from '../../core/selectors';
import mapValues from 'lodash/mapValues';
import { utils as vizUtils, colors as vizColors } from '@tidepool/viz';
const { GLYCEMIC_RANGE } = vizUtils.constants;
import personUtils from '../../core/personutils';
import { Box, Flex } from 'theme-ui';
import { useTranslation } from 'react-i18next';
import Button from '../../components/elements/Button';
import * as actions from '../../redux/actions';
import moment from 'moment';

import cloneDeep from 'lodash/cloneDeep';
import pickBy from 'lodash/pickBy';

const Notification = ({ clinicId, glycemicRanges, onDismiss }) => {
  const { t } = useTranslation();
  const name = useSelector(state => state.blip.clinics?.[clinicId]?.name) || '';

  return (
    <Box sx={{ background: vizColors.white, borderRadius: 8 }} py={2} px={4} mb={3}>
      <Flex sx={{ justifyContent: 'space-between', gap: 4 }}>
        <Box>
          <Box sx={{ color: vizColors.blue50, fontWeight: 'medium' }}>
            {t('Adjusted Target Range')}
          </Box>
          <Box sx={{ color: vizColors.blue50 }}>
            {t('{{ name }} is using a non-standard target range of {{glycemicRanges}} [UNITS] to view your data.', { name, glycemicRanges })}
          </Box>
        </Box>
        <Button onClick={onDismiss} variant='secondaryCondensed' sx={{ border: 'none' }}>
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
  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);
  const loggedInUser = useSelector(state => state.blip.allUsersMap[loggedInUserId]);
  const preferences = loggedInUser?.preferences || {};

  const handleDismiss = (clinicId, glycemicRanges) => {
    const updatedPrefs = cloneDeep(preferences);
    const dismissedAt = moment.utc().toISOString();

    updatedPrefs.alternateGlycemicRangeNotification ||= {};
    updatedPrefs.alternateGlycemicRangeNotification[clinicId] = { glycemicRanges, dismissedAt };

    dispatch(actions.async.updatePreferences(api, loggedInUserId, updatedPrefs));
  };

  const isUserPatient = personUtils.isSame(user, patient);

  // TODO: fetch in case clinics object is empty

  if (!isUserPatient) return null;

  const clinicsWithNotificatons = pickBy(clinics, clinic => {
    const glycemicRanges = clinic?.patients?.[patient.userid]?.glycemicRanges;

    const isNonStandardRange = !!glycemicRanges && glycemicRanges !== GLYCEMIC_RANGE.ADA_STANDARD;
    const lastDismissedValue = preferences.alternateGlycemicRangeNotification?.[clinic.id]?.glycemicRanges;
    const hasUpdatedValue = !lastDismissedValue || lastDismissedValue !== glycemicRanges;

    return isNonStandardRange && hasUpdatedValue;
  });

  const notifications = mapValues(clinicsWithNotificatons, clinic => clinic.patients[patient.userid].glycemicRanges);

  return (
    <Box>
      { Object.entries(notifications)
              .map(([clinicId, glycemicRanges]) => (
                <Notification
                  key={clinicId}
                  clinicId={clinicId}
                  glycemicRanges={glycemicRanges}
                  onDismiss={() => handleDismiss(clinicId, glycemicRanges)}
                />
              ))
      }
    </Box>
  );
};

export default ClinicsUsingAltRangeNotifications;
