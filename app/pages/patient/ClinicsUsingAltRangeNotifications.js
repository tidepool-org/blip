import React from 'react';
import { useSelector } from 'react-redux';
import { selectPatient, selectUser } from '../../core/selectors';
import mapValues from 'lodash/mapValues';
import { utils as vizUtils, colors as vizColors } from '@tidepool/viz';
const { GLYCEMIC_RANGE } = vizUtils.constants;
import personUtils from '../../core/personutils';
import { Box, Flex } from 'theme-ui';
import { useTranslation } from 'react-i18next';
import Button from '../../components/elements/Button';

const Notification = ({ clinicId, glycemicRanges }) => {
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
        <Button variant='secondaryCondensed' sx={{ border: 'none' }}>{t('Dismiss')}</Button>
      </Flex>
    </Box>
  );
};

const ClinicsUsingAltRangeNotifications = () => {
  const clinics = useSelector(state => state.blip.clinics);
  const patient = useSelector(state => selectPatient(state));
  const user = useSelector(state => selectUser(state));

  const isUserPatient = personUtils.isSame(user, patient);

  // TODO: fetch in case clinics object is empty

  if (!isUserPatient) return null;

  // TODO: filter out those that are standard
  const altRanges = mapValues(clinics || {}, clinic => clinic?.patients?.[patient.userid]?.glycemicRanges);

  return (
    <Box>
      { Object.entries(altRanges)
              .map(([clinicId, glycemicRanges]) => (
                <Notification clinicId={clinicId} glycemicRanges={glycemicRanges} />
              ))
      }
    </Box>
  );
};

export default ClinicsUsingAltRangeNotifications;
