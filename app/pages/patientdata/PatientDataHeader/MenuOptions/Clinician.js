import { Box, Flex } from 'theme-ui';
import { withTranslation } from 'react-i18next';
import BarChartIcon from '@material-ui/icons/BarChart';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import SettingsIcon from '@material-ui/icons/Settings';
import PublishIcon from '@material-ui/icons/Publish';

import Button from '../../../../components/elements/Button';

const buttonStyleProps = {
  variant: 'textSecondary',
  iconPosition: 'left',
  iconFontSize: '1.25em',
  sx: { fontSize: 1 },
  pl: 0
}

const ClinicianMenuOptions = ({ t, onProfile, onUpload, onViewData }) => {
  return (
    <Flex sx={{ ml: 'auto', columnGap: 32 }}>
      <Box>
        <Button
          id="patientDataHeader_viewDataButton"
          onClick={onViewData}
          icon={BarChartIcon}
          iconLabel="Settings" // TODO: Verify
          {...buttonStyleProps}
        >
          {t("View")}
        </Button>
      </Box>
      <Box>
        <Button
          id="patientDataHeader_profileButton"
          onClick={onProfile}
          icon={PersonOutlineIcon}
          iconLabel="Settings" // TODO: Verify
          {...buttonStyleProps}
        >
          {t("Patient Profile")}
        </Button>
      </Box>
      <Box>
        <Button
          id="patientDataHeader_uploadButton"
          onClick={onUpload}
          icon={PublishIcon}
          iconLabel="Upload" // TODO: Verify
          {...buttonStyleProps}
        >
          {t("Upload Data")}
        </Button>
      </Box>
    </Flex>
  );
};

export default withTranslation()(ClinicianMenuOptions);