import { Box } from 'theme-ui';
import { withTranslation } from 'react-i18next';
import SettingsIcon from '@material-ui/icons/Settings';
import PublishIcon from '@material-ui/icons/Publish';
import ShareIcon from '@material-ui/icons/Share';

import Button from '../../../../components/elements/Button';

const buttonStyleProps = {
  variant: 'textSecondary',
  iconPosition: 'left',
  iconFontSize: '1.25em',
  sx: { fontSize: 1 },
  pl: 0
}

const PatientMenuOptions = ({ t, onShare, onUpload, onProfile }) => {
  return (
    <>
      <Box>
        <Button
          id="patientDataHeader_shareButton"
          onClick={onShare}
          icon={ShareIcon}
          iconLabel="Profile" // TODO: Verify
          {...buttonStyleProps}
        >
          {t("Share")}
        </Button>
      </Box>
      <Box>
        <Button
          id="patientDataHeader_profileButton"
          onClick={onProfile}
          icon={SettingsIcon}
          iconLabel="Settings" // TODO: Verify
          {...buttonStyleProps}
        >
          {t("Account Settings")}
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
    </>
  );
};

export default withTranslation()(PatientMenuOptions);