import { Box, Flex, Text, Link, BoxProps } from 'theme-ui';
import SettingsIcon from '@material-ui/icons/Settings';
import PublishIcon from '@material-ui/icons/Publish';

import Button from '../../../../components/elements/Button';

const ClinicianMenuOptions = ({ onProfile, onUpload }) => {
  return (
    <>
      <Box>
        <Button
          id="accountSettingsButton"
          variant="textSecondary"
          onClick={onProfile}
          icon={SettingsIcon}
          iconPosition='left'
          iconFontSize="1.25em"
          iconLabel="Settings" // TODO: Verify
          sx={{ fontSize: 1 }}
          pl={0}
        >
          {"Patient Account Settings"}
        </Button>
      </Box>
      <Box>
        <Button
          id="profileNavigationButton"
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

export default ClinicianMenuOptions;