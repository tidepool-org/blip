import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Flex } from 'theme-ui';

import Name from './Name';
import DemographicInfo from './DemographicInfo';
import PatientMenuOptions from './MenuOptions/Patient';
import ClinicianMenuOptions from './MenuOptions/Clinician';

const UploadLaunchOverlay = require('../../components/uploadlaunchoverlay');

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

const NavHeader = ({ patient, isUserPatient, trackMetric }) => {
  const history = useHistory();
  const [isUploadOverlayOpen, setIsUploadOverlayOpen] = useState(false);

  if (!patient?.profile) return null; // not available immediately on component mount

  const handleUpload = () => {
    trackMetric('Clicked Navbar Upload Data');
    setIsUploadOverlayOpen(true);
  }

  const handleViewData = () => {
    trackMetric('Clicked Navbar View Data');
    history.push(`/patients/${patient.userid}/data`);
  }

  const handleViewProfile = () => {
    trackMetric('Clicked Navbar Name');
    history.push(`/patients/${patient.userid}/profile`);
  }
  
  const handleShare = () => {
    trackMetric('Clicked Navbar Share Data');
    history.push(`/patients/${patient.userid}/share`);
  }

  return (
    <div className="patient-data-header">
      <Box variant="containers.largeBordered" mb={0} mx={[0, 0]} sx={{ width: ['100%', '100%']}}>
        <Flex id="patientDataHeader" { ...innerContainerStyleProps }>

          <Name patient={patient} />

          { !isUserPatient && <DemographicInfo patient={patient} /> }

          { isUserPatient 
            ? <PatientMenuOptions 
                onViewData={handleViewData}
                onViewProfile={handleViewProfile}
                onUpload={handleUpload}
                onShare={handleShare}
              /> 
            : <ClinicianMenuOptions 
                onViewData={handleViewData}
                onProfile={handleViewProfile}
                onUpload={handleUpload}
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

export default NavHeader;