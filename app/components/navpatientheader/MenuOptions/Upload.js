import React, { useState } from 'react';
import { withTranslation } from 'react-i18next';
import { Box } from 'theme-ui';
import { useLocation } from 'react-router-dom';
const UploadLaunchOverlay = require('../../../components/uploadlaunchoverlay');

import { getButtonStyleProps, getFinalSlug } from './menuOptionHelpers';

import Button from '../../elements/Button';
import uploadIcon from '../../../core/icons/uploadIcon.svg'
import { useAppContext } from '../../../core/hooks';
import { getPermissions } from '../navPatientHeaderHelpers';
import { useSelector } from 'react-redux';
import { mapStateToProps } from '../../../pages/app/app';

const Upload = withTranslation()(({ t }) => {
  const { trackMetric } = useAppContext();
  const { patient, permsOfLoggedInUser } = useSelector(mapStateToProps);
  const [isUploadOverlayOpen, setIsUploadOverlayOpen] = useState(false);
  const { canUpload } = getPermissions(patient, permsOfLoggedInUser);

  if (!canUpload) return null;

  const handleUpload = () => {
    trackMetric('Clicked Navbar Upload Data');
    setIsUploadOverlayOpen(true);
  }
  
  return (
    <>
    <Box>
      <Button
        id="navPatientHeader_uploadButton"
        onClick={handleUpload}
        iconSrc={uploadIcon}
        iconLabel="Upload"
        {...getButtonStyleProps(false)}
      >
        {t('Upload Data')}
      </Button>
    </Box>

    { isUploadOverlayOpen &&
      <UploadLaunchOverlay modalDismissHandler={() => setIsUploadOverlayOpen(false)} /> 
    }

    </>
  )
});

export default Upload;