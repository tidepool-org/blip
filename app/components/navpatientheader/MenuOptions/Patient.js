import { Box, Flex } from 'theme-ui';
import { useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import BarChartIcon from '@material-ui/icons/BarChart';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import PublishIcon from '@material-ui/icons/Publish';
import ShareIcon from '@material-ui/icons/Share';

import Button from '../../../components/elements/Button';
import { getButtonStyleProps, getFinalSlug } from './menuOptionHelpers';

const PatientMenuOptions = ({ t, onShare, onUpload, onViewProfile, onViewData }) => {
  const { pathname } = useLocation();
  const finalSlug = getFinalSlug(pathname);

  return (
    <Flex sx={{ ml: 'auto', columnGap: 32 }}>
      {onViewData && 
        <Box>
          <Button
            id="patientDataHeader_viewDataButton"
            onClick={onViewData}
            icon={BarChartIcon}
            iconLabel="View"
            {...getButtonStyleProps(finalSlug === '/data')}
          >
            {t("View")}
          </Button>
        </Box>}
      {onViewProfile && 
        <Box>
          <Button
            id="patientDataHeader_profileButton"
            onClick={onViewProfile}
            icon={PersonOutlineIcon}
            iconLabel="Profile"
            {...getButtonStyleProps(finalSlug === '/profile')}
          >
            {t("Profile")}
          </Button>
        </Box>}
      {onShare && 
        <Box>
          <Button
            id="patientDataHeader_shareButton"
            onClick={onShare}
            icon={ShareIcon}
            iconLabel="Share"
            {...getButtonStyleProps(finalSlug === '/share')}
          >
            {t("Share")}
          </Button>
        </Box>}
      {onUpload && 
        <Box>
          <Button
            id="patientDataHeader_uploadButton"
            onClick={onUpload}
            icon={PublishIcon}
            iconLabel="Upload"
            {...getButtonStyleProps(false)}
          >
            {t("Upload Data")}
          </Button>
        </Box>}
    </Flex>
  );
};

export default withTranslation()(PatientMenuOptions);