import { withTranslation } from 'react-i18next';
import { Box, Flex, Text, Link, BoxProps } from 'theme-ui';

import PatientMenuOptions from './PatientMenuOptions';
import ClinicianMenuOptions from './ClinicianMenuOptions'

const innerContainerStyles = {
  px: 4, 
  py: 3, 
  sx: {
    columnGap: 5,
    flexWrap: 'wrap',
    justifyContent: ['center', 'space-between'],
    alignItems: 'center',
    rowGap: 2,
  }
};

const NameField = ({ name }) => (
  <Box sx={{ flexShrink: 0, marginRight: 'auto' }}>
    <Text as="span" sx={{ color: 'text.primary', fontSize: [1, 2, '18px'], fontWeight: 'medium' }}>
      {name}
    </Text>
  </Box>
);

const PatientDataHeader = ({ t, patient, isUserPatient }) => {
  if (!patient.profile) return null;

  const { userid, profile: { fullName } } = patient;

  return (
    <Box variant="containers.largeBordered" mb={4}>
      <Flex id="patientDataHeader" { ...innerContainerStyles }>
        <NameField name={fullName} />

        { isUserPatient ? <PatientMenuOptions userid={userid}/> : <ClinicianMenuOptions /> }
      </Flex>
    </Box>
  );
}

export default withTranslation()(PatientDataHeader);