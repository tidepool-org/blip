import React from 'react';
import { translate } from 'react-i18next';
import { Box, Flex } from 'rebass/styled-components';
import { keycloak } from '../../keycloak';

import Button from '../../components/elements/Button';
import { Paragraph1, Paragraph2 } from '../../components/elements/FontStyles';
import logoSrc from '../../components/navbar/images/tidepool-logo-408x46.png';
let win = window;

export const LoggedOut = (props) => {
  const { t } = props;

  const handleClickLogin = () => {
    keycloak.login({
      redirectUri: win.location.origin,
    });
  };

  return (
    <Box
      variant="containers.smallBordered"
      bg="white"
      mt={[0, 4, 5, 6]}
      p={6}
      pt={5}
    >
      <Flex flexDirection={'row'} justifyContent={'center'} mb={5}>
        <img src={logoSrc} width={227} />
      </Flex>

      <hr color="lightgrey" />

      <Paragraph2 mt={5} color="text.primary">
        {t('You have been signed out of your session.')}
      </Paragraph2>

      <Paragraph1 color="mediumGrey">
        {t(
          "For security reasons, we automatically sign you out after a certain period of inactivity, or if you've signed out from another browser tab."
        )}
      </Paragraph1>

      <Paragraph1 color="mediumGrey">
        {t('Please sign in again to continue.')}
      </Paragraph1>

      <Button onClick={handleClickLogin} width={'100%'}>
        {t('Return to Login')}
      </Button>
    </Box>
  );
};

LoggedOut.propTypes = {};

export default translate()(LoggedOut);
