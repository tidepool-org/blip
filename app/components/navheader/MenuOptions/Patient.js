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
      <Box>
        <Button
          id="patientDataHeader_viewDataButton"
          onClick={onViewData}
          icon={BarChartIcon}
          iconLabel="Settings" // TODO: Verify
          {...getButtonStyleProps(finalSlug === '/data')}
        >
          {t("View")}
        </Button>
      </Box>
      <Box>
        <Button
          id="patientDataHeader_profileButton"
          onClick={onViewProfile}
          icon={PersonOutlineIcon}
          iconLabel="Settings" // TODO: Verify
          {...getButtonStyleProps(finalSlug === '/profile')}
        >
          {t("Profile")}
        </Button>
      </Box>
      <Box>
        <Button
          id="patientDataHeader_shareButton"
          onClick={onShare}
          icon={ShareIcon}
          iconLabel="Profile" // TODO: Verify
          {...getButtonStyleProps(finalSlug === '/share')}
        >
          {t("Share")}
        </Button>
      </Box>
      <Box>
        <Button
          id="patientDataHeader_uploadButton"
          onClick={onUpload}
          icon={PublishIcon}
          iconLabel="Upload" // TODO: Verify
          {...getButtonStyleProps(false)}
        >
          {t("Upload Data")}
        </Button>
      </Box>
    </Flex>
  );
};

export default withTranslation()(PatientMenuOptions);