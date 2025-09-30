import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Flex, Box, Text } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';
import { STATUS } from './useAgpCGM';

import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
import { NoPatientData, InsufficientData } from './Overview';
const { Loader } = vizComponents;

const StackedDaily = ({ patientId, agpCGMData }) => {
  const { t } = useTranslation();
  const { status } = agpCGMData;
  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const patient = clinic?.patients?.[patientId];

  if (status === STATUS.NO_PATIENT_DATA)   return <NoPatientData patientName={patient?.fullName}/>;
  if (status === STATUS.INSUFFICIENT_DATA) return <InsufficientData />;

  if (status !== STATUS.SVGS_GENERATED)    return <Loader show={true} overlay={false} />;

  return (
    <Box>
      <Flex mb={3} sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
        <Text sx={{ fontSize: 3, fontWeight: 'bold', color: vizColors.gray90 }}>{t('Stacked Daily')}</Text>
        <Text sx={{ fontSize: 3, fontWeight: 'bold', color: vizColors.gray90 }}>{patientId}</Text>
      </Flex>
    </Box>
  );
};

export default StackedDaily;
