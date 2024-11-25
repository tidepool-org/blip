import { Box } from 'theme-ui';
import SettingsIcon from '@material-ui/icons/Settings';
import PublishIcon from '@material-ui/icons/Publish';
import ShareIcon from '@material-ui/icons/Share';

import Button from '../../../../components/elements/Button';

const PatientMenuOptions = ({ onShare, onUpload, onProfile }) => {
  return (
    <>
      <Box>
        <Button
          id="patientDataHeader_shareButton"
          variant="textSecondary"
          onClick={onShare}
          icon={ShareIcon}
          iconPosition='left'
          iconFontSize="1.25em"          
          iconLabel="Profile" // TODO: Verify
          sx={{ fontSize: 1 }}
          pl={0}
        >
          {"Share"}
        </Button>
      </Box>
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
          {"Account Settings"}
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
          {"Upload Data"}
        </Button>
      </Box>
    </>
  );
};

export default PatientMenuOptions;