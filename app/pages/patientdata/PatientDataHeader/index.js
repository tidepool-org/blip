import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Box, Flex } from 'theme-ui';

import NameField from './NameField';
import PatientMenuOptions from './MenuOptions/Patient';
import ClinicianMenuOptions from './MenuOptions/Clinician';

const UploadLaunchOverlay = require('../../../components/uploadlaunchoverlay');

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

const PatientDataHeader = ({ t, patient, isUserPatient }) => {
  const history = useHistory();
  const [isUploadOverlayOpen, setIsUploadOverlayOpen] = useState(false);

  if (!patient.profile) return null; // not available immediately on component mount

  const handleUpload  = () => setIsUploadOverlayOpen(true);
  const handleProfile = () => history.push(`/patients/${patient.userid}/profile`);
  const handleShare   = () => history.push(`/patients/${patient.userid}/share`);

  return (
    <Box variant="containers.largeBordered" mb={4}>
      <Flex id="patientDataHeader" { ...innerContainerStyles }>
        <NameField patient={patient} />

        { isUserPatient 
          ? <PatientMenuOptions 
              onUpload={handleUpload}
              onProfile={handleProfile}
              onShare={handleShare}
            /> 
          : <ClinicianMenuOptions 
              onUpload={handleUpload}
              onProfile={handleProfile}
            /> 
        }
      </Flex>

      { isUploadOverlayOpen &&
        <UploadLaunchOverlay modalDismissHandler={() => setIsUploadOverlayOpen(false)} /> 
      }
    </Box>
  );
}

export default withTranslation()(PatientDataHeader);