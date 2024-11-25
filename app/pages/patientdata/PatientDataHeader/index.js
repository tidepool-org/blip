import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Flex } from 'theme-ui';

import Name from './Name';
import DemographicInfo from './DemographicInfo';
import PatientMenuOptions from './MenuOptions/Patient';
import ClinicianMenuOptions from './MenuOptions/Clinician';

const UploadLaunchOverlay = require('../../../components/uploadlaunchoverlay');

const innerContainerStyleProps = {
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

const PatientDataHeader = ({ patient, isUserPatient }) => {
  const history = useHistory();
  const [isUploadOverlayOpen, setIsUploadOverlayOpen] = useState(false);

  if (!patient.profile) return null; // not available immediately on component mount

  const handleUpload  = () => setIsUploadOverlayOpen(true);
  const handleProfile = () => history.push(`/patients/${patient.userid}/profile`);
  const handleShare   = () => history.push(`/patients/${patient.userid}/share`);

  return (
    <div className="patient-data-header">
      <Box variant="containers.largeBordered" mb={0} mx={[0, 0]} sx={{ width: ['100%', '100%']}}>
        <Flex id="patientDataHeader" { ...innerContainerStyleProps }>

          <Name patient={patient} />

          { !isUserPatient && <DemographicInfo patient={patient} /> }

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
      </Box>
      { isUploadOverlayOpen &&
        <UploadLaunchOverlay modalDismissHandler={() => setIsUploadOverlayOpen(false)} /> 
      }
    </div>
  );
}

export default PatientDataHeader;