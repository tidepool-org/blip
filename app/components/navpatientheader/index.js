import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Box, Flex } from 'theme-ui';
import _ from 'lodash';
import launchCustomProtocol from 'custom-protocol-detection';

import Back from './Back';
import Name from './Name';
import DemographicInfo from './DemographicInfo';
import PatientMenuOptions from './MenuOptions/Patient';
import ClinicianMenuOptions from './MenuOptions/Clinician';
import { isClinicianAccount } from '../../core/personutils';
import { getPermissions, getPatientListLink } from './navPatientHeaderHelpers';
import UploadLaunchOverlay from '../../components/uploadlaunchoverlay';

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
}) => {
  const history = useHistory();
  const { search } = useLocation();
  const [initialSearchParams] = useState(new URLSearchParams(search));
  const [isUploadOverlayOpen, setIsUploadOverlayOpen] = useState(false);

  if (!patient?.profile) return null;

  const patientListLink = getPatientListLink(clinicFlowActive, selectedClinicId, initialSearchParams, patient.userid);
  const { canUpload, canShare } = getPermissions(patient, permsOfLoggedInUser);

  const handleBack = () => {
    trackMetric('Clinic - View patient list', { clinicId: selectedClinicId, source: 'Patient data' });
    history.push(patientListLink);
  };

  const handleUpload = () => {
    trackMetric('Clicked Navbar Upload Data');
    setIsUploadOverlayOpen(true);
    launchCustomProtocol('tidepoolupload://open');
  };

  const handleViewData = () => {
    trackMetric('Clicked Navbar View Data');
    history.push(`/patients/${patient.userid}/data`);
  };

  const handleViewProfile = () => {
    trackMetric('Clicked Navbar Name');
    history.push(`/patients/${patient.userid}/profile`);
  };
  
  const handleShare = () => {
    trackMetric('Clicked Navbar Share Data');
    history.push(`/patients/${patient.userid}/share`);
  };

  return (
    <div className="nav-patient-header">
      <HeaderContainer>
        { isClinicianAccount(user)
          ? <>
              <Back onClick={handleBack} />
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
};

export default NavPatientHeader;