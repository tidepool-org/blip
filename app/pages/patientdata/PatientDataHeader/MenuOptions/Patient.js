import { Box, Flex, Text, Link, BoxProps } from 'theme-ui';

import Button from '../../../../components/elements/Button';

const PatientMenuOptions = ({ onShare, onUpload, onProfile }) => {
  return (
    <>
      <Box>
        <Button
          id="profileNavigationButton"
          variant="textSecondary"
          onClick={onShare}
          // icon={navigationAction.icon}
          iconPosition='left'
          iconFontSize="1.25em"
          // iconLabel={navigationAction.label}
          sx={{ fontSize: 1 }}
          pl={0}
        >
          {"Share"}
        </Button>
      </Box>
      <Box>
        <Button
          id="accountSettingsButton"
          variant="textSecondary"
          onClick={onProfile}
          // icon={navigationAction.icon}
          iconPosition='left'
          iconFontSize="1.25em"
          // iconLabel={navigationAction.label}
          sx={{ fontSize: 1 }}
          pl={0}
        >
          {"Account Settings"}
        </Button>
      </Box>
      <Box>
        <Button
          id="uploadDataButton"
          variant="textSecondary"
          onClick={onUpload}
          // icon={navigationAction.icon}
          iconPosition='left'
          iconFontSize="1.25em"
          // iconLabel={navigationAction.label}
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