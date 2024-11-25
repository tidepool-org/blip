import { withTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import { Box, Flex, Text, Link, BoxProps } from 'theme-ui';

import Button from '../../../components/elements/Button';

var UploadLaunchOverlay = require('../../../components/uploadlaunchoverlay');

const PatientMenuOptions = ({ userid }) => {
  const history = useHistory();
  
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);

  const profilePath = `/patients/${userid}/profile`;
  const sharePath   = `/patients/${userid}/share`;

  return (
    <>
      {showUploadOverlay && (
        <UploadLaunchOverlay modalDismissHandler={() => setShowUploadOverlay(false)} />
      )}
      <Box>
        <Button
          id="profileNavigationButton"
          variant="textSecondary"
          onClick={() => history.push(sharePath)}
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
          onClick={() => history.push(profilePath)}
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
          onClick={() => setShowUploadOverlay(true)}
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