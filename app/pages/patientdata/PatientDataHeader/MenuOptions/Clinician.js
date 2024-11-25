import { Box } from 'theme-ui';
import { withTranslation } from 'react-i18next';
import SettingsIcon from '@material-ui/icons/Settings';
import PublishIcon from '@material-ui/icons/Publish';

import Button from '../../../../components/elements/Button';

const ClinicianMenuOptions = ({ onProfile, onUpload }) => {
  return (
    <>
      <Box>
        <Button
          id="patientDataHeader_profileButton"
          variant="textSecondary"
          onClick={onProfile}
          icon={SettingsIcon}
          iconPosition='left'
          iconFontSize="1.25em"
          iconLabel="Settings" // TODO: Verify
          sx={{ fontSize: 1 }}
          pl={0}
        >
          {t("Patient Account Settings")}
        </Button>
      </Box>
      <Box>
        <Button
          id="patientDataHeader_uploadButton"
          variant="textSecondary"
          onClick={onUpload}
          icon={PublishIcon}
          iconPosition='left'
          iconFontSize="1.25em"
          iconLabel="Upload" // TODO: Verify
          sx={{ fontSize: 1 }}
          pl={0}
        >
          {t("Upload Data")}
        </Button>
      </Box>
    </>
  );
};

export default withTranslation()(ClinicianMenuOptions);