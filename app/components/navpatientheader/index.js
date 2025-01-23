import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Flex } from 'theme-ui';
import _ from 'lodash';
import launchCustomProtocol from 'custom-protocol-detection';

import Back from './Back';
import Name from './Name';
import DemographicInfo from './DemographicInfo';
import PatientMenuOptions from './MenuOptions/Patient';
import ClinicianMenuOptions from './MenuOptions/Clinician';
import { isClinicianAccount } from '../../core/personutils';
import { getPermissions, getPatientListLink, getDemographicInfo } from './navPatientHeaderHelpers';
import UploadLaunchOverlay from '../../components/uploadlaunchoverlay';
import { breakpoints } from '../../themes/baseTheme';

const HeaderContainer = ({ children }) => (
  <Box variant="containers.largeBordered" mb={0} mx={[0, 0]} sx={{ width: ['100%', '100%'] }}>
    <Flex id="navPatientHeader" px={4} py="12px"
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
  clinicPatient,
  user,
  permsOfLoggedInUser,
  trackMetric,
  clinicFlowActive,
  selectedClinicId,
  query,
}) => {
  const history = useHistory();
  const [isUploadOverlayOpen, setIsUploadOverlayOpen] = useState(false);

  if (!patient?.profile?.patient) return null;

  const { patientListLink } = getPatientListLink(clinicFlowActive, selectedClinicId, query, patient.userid);
  const { canUpload, canShare } = getPermissions(patient, permsOfLoggedInUser);
  const { mrn, birthday, name } = getDemographicInfo(patient, clinicPatient);

  const handleBack = () => {
    trackMetric('Clinic - View patient list', { clinicId: selectedClinicId, source: 'Patient data' });
    history.push(patientListLink);
  }

  const handleUpload = () => {
    trackMetric('Clicked Navbar Upload Data');
    setIsUploadOverlayOpen(true);
    launchCustomProtocol('tidepoolupload://open');
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
    <Box
      className="nav-patient-header"
      mb={3}
      mx={[0, 4, null, null, 'auto']}
      sx={{
        width: ['auto', null, null, 'calc(100% - 48px)'],
        maxWidth: breakpoints[3],
      }}
    >
      <HeaderContainer>
        { isClinicianAccount(user)
          ? <>
              <Back onClick={handleBack} />
              <Name name={name} />
              <DemographicInfo birthday={birthday} mrn={mrn} />
              <ClinicianMenuOptions
                onViewData={handleViewData}
                onViewProfile={handleViewProfile}
                onUpload={canUpload ? handleUpload : null}
              />
            </>
          : <>
              <Name name={name} />
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
    </Box>
  );
}

export default NavPatientHeader;
