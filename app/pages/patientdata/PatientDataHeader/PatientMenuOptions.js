import { withTranslation } from 'react-i18next';
import { Box, Flex, Text, Link, BoxProps } from 'theme-ui';

import Button from '../../../components/elements/Button';

const PatientMenuOptions = () => (
  <>
    <Box>
      <Button
        id="profileNavigationButton"
        variant="textSecondary"
        // onClick={handleNavigationAction}
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
        // onClick={handleNavigationAction}
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
        // onClick={handleNavigationAction}
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

export default PatientMenuOptions;