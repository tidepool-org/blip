import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Flex } from 'theme-ui';
import _ from 'lodash';

import Back from './Back';
import Name from './Name';
import DemographicInfo from './DemographicInfo';
import PatientMenuOptions from './MenuOptions/Patient';
import ClinicianMenuOptions from './MenuOptions/Clinician';
import { isClinicianAccount } from '../../core/personutils';
import { getPermissions, getPatientListLink } from './navPatientHeaderHelpers';

const UploadLaunchOverlay = require('../../components/uploadlaunchoverlay');

const HeaderContainer = ({ children }) => (
  <Box variant="containers.largeBordered" mb={0} mx={[0, 0]} sx={{ width: ['100%', '100%'] }}>
    <Flex id="navPatientHeader" px={4} py={3} 
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

const NavPatientHeader = ({ 
  patient, 
  user, 
  permsOfLoggedInUser,
  trackMetric,
  clinicFlowActive, 
  selectedClinicId, 
  query, 
  currentPage
}) => {
  const history = useHistory();
  const [isUploadOverlayOpen, setIsUploadOverlayOpen] = useState(false);

  if (!patient?.profile) return null;

  const { 
    isDashboardView,
    showPatientListLink, 
    patientListLink,
  } = getPatientListLink(clinicFlowActive, selectedClinicId, user, query, currentPage);

  const { canUpload, canShare } = getPermissions(patient, permsOfLoggedInUser);

  const handleBack = () => {
    if (!showPatientListLink) return;

    trackMetric('Clinic - View patient list', {
      clinicId: selectedClinicId,
      source: isDashboardView ? 'Dashboard' : 'Patient data',
    });
    
    history.push(patientListLink);
  }

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
    <div className="nav-patient-header">
      <HeaderContainer>
        { isClinicianAccount(user)
          ? <>
              <Back isRendered={showPatientListLink} onClick={handleBack} />
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