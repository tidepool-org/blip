import { Box, Flex } from 'theme-ui';
import { useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import BarChartIcon from '@material-ui/icons/BarChart';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import PublishIcon from '@material-ui/icons/Publish';
import { getButtonStyleProps, getFinalSlug } from './menuOptionHelpers';

import Button from '../../elements/Button';

const ClinicianMenuOptions = ({ 
  t, 
  onViewProfile, 
  onViewData,
  onUpload = null,
}) => {
  const { pathname } = useLocation();
  const finalSlug = getFinalSlug(pathname);

  return (
    <Flex sx={{ ml: 'auto', columnGap: 32 }}>
      {onViewData && 
        <Box>
          <Button
            id="navPatientHeader_viewDataButton"
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
            id="navPatientHeader_profileButton"
            onClick={onViewProfile}
            icon={PersonOutlineIcon}
            iconLabel="Profile"
            {...getButtonStyleProps(finalSlug === '/profile')}
          >
            {t("Patient Profile")}
          </Button>
        </Box>}
      {onUpload && 
        <Box>
          <Button
            id="navPatientHeader_uploadButton"
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

export default withTranslation()(ClinicianMenuOptions);