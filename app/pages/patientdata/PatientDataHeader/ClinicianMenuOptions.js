import { withTranslation } from 'react-i18next';
import { Box, Flex, Text, Link, BoxProps } from 'theme-ui';

import Button from '../../../components/elements/Button';

const ClinicianMenuOptions = () => (
  <>
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
        {"Patient Account Settings"}
      </Button>
    </Box>
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
        {"Upload Data"}
      </Button>
    </Box>
  </>
);

export default ClinicianMenuOptions;