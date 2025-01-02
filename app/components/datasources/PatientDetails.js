import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Text, FlexProps } from 'theme-ui';

import { Body0, Body1 } from '../elements/FontStyles';

import i18next from '../../core/language';

const t = i18next.t.bind(i18next);

export const PatientDetails = (props) => {
  const {
    patient,
    ...themeProps
  } = props;

  return (
    <Flex
      id="data-connections-patient-details"
      py="10px"
      px={3}
      sx={{
        bg: 'blueGreyDark',
        borderRadius: 'input',
        columnGap: 3,
        rowGap: 1,
        justifyContent: ['center', 'space-between'],
        alignItems: 'center',
        whiteSpace: 'nowrap',
        width:['100%', '100%', 'auto'],
        flexWrap: 'wrap',
      }}
      {...themeProps}
    >
      <Flex sx={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        <Body1 id="patient-details-fullName" sx={{ color: 'white', fontWeight: 'bold' }}>{patient.fullName}</Body1>
      </Flex>

      <Flex sx={{ flexWrap: 'wrap', columnGap: 3, flexGrow: 1, justifyContent: 'space-evenly' }}>
        <Body0 id="patient-details-birthDate" sx={{ color: 'white', fontWeight: 'medium' }}>{t('DOB: {{birthDate}}', patient)}</Body0>
        <Body0 id="patient-details-mrn" sx={{ color: 'white', fontWeight: 'medium' }}>{t('MRN: {{mrn}}', { mrn: patient.mrn || '-' })}</Body0>
      </Flex>
    </Flex>
  );
};

PatientDetails.propTypes = {
  ...FlexProps,
  patient: PropTypes.object.isRequired,
};

export default PatientDetails;
