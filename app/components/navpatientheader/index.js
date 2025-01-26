import React, { useState } from 'react';
import { useNavigation } from '../../core/navutils';
import { Box, Flex } from 'theme-ui';
import _ from 'lodash';

import Back from './Back';
import Name from './Name';
import DemographicInfo from './DemographicInfo';
import PatientMenuOptions from './MenuOptions/Patient';
import ClinicianMenuOptions from './MenuOptions/Clinician';
import { isClinicianAccount } from '../../core/personutils';
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

const NavPatientHeader = ({ api, trackMetric }) => {
  const {
    patientBirthday,
    patientMrn,
    patientName,
    patient,
    user,
    canUpload,
    canShare,
    handleBack,
    handleLaunchUploader,
    handleViewData,
    handleViewProfile,
    handleShare,
  } = useNavigation(api, trackMetric);

  const [isUploadOverlayOpen, setIsUploadOverlayOpen] = useState(false);

  if (!patient?.profile?.patient) return null;

  const handleOpenUploader = () => {
    handleLaunchUploader();
    setIsUploadOverlayOpen(true);
  };

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
              <Name name={patientName} />
              <DemographicInfo birthday={patientBirthday} mrn={patientMrn} />
              <ClinicianMenuOptions
                onViewData={handleViewData}
                onViewProfile={handleViewProfile}
                onUpload={canUpload ? handleOpenUploader : null}
              />
            </>
          : <>
              <Name name={patientName} />
              <PatientMenuOptions
                onViewData={handleViewData}
                onViewProfile={handleViewProfile}
                onUpload={canUpload ? handleOpenUploader : null}
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
};

export default NavPatientHeader;
