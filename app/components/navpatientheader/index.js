import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Flex } from 'theme-ui';
import _ from 'lodash';

import Name from './Name';
import DemographicInfo from './DemographicInfo';
import PatientMenuOptions from './MenuOptions/Patient';
import ClinicianMenuOptions from './MenuOptions/Clinician';
import { isClinicianAccount } from '../../core/personutils';

const UploadLaunchOverlay = require('../../components/uploadlaunchoverlay');

const HeaderContainer = ({ children }) => (
  <Box variant="containers.largeBordered" mb={0} mx={[0, 0]} sx={{ width: ['100%', '100%'] }}>
    <Flex id="patientDataHeader" px={4} py={3} 
      sx={{
        columnGap: 5,
        flexWrap: 'wrap',
        justifyContent: ['center', 'space-between'],
        alignItems: 'center',
        rowGap: 2,
      }}
    >
      {children}
    </Flex>
  </Box>
);

const NavPatientHeader = ({ patient, user, trackMetric, permsOfLoggedInUser }) => {
  const history = useHistory();
  const [isUploadOverlayOpen, setIsUploadOverlayOpen] = useState(false);

  if (!patient?.profile) return null;

  const permissions = patient.permissions;
  const canUpload = _.isEmpty(permissions) === false && permissions.root || _.has(permsOfLoggedInUser, 'upload');
  const canShare = _.isEmpty(permissions) === false && permissions.root;

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
      <HeaderContainer>
        { isClinicianAccount(user)
          ? <>
              <Name patient={patient} />
              <DemographicInfo patient={patient} />
              <ClinicianMenuOptions 
                onViewData={handleViewData}
                onViewProfile={handleViewProfile}
                onUpload={canUpload ? handleUpload : null}
              /> 
            </>
          : <>
              <Name patient={patient} />
              <PatientMenuOptions 
                onViewData={handleViewData}
                onViewProfile={handleViewProfile}
                onUpload={canUpload ? handleUpload : null}
                onShare={canShare ? handleShare : null}
              /> 
            </>
        }
      </HeaderContainer>
      { isUploadOverlayOpen &&
        <UploadLaunchOverlay modalDismissHandler={() => setIsUploadOverlayOpen(false)} /> 
      }
    </div>
  );
}

export default NavPatientHeader;