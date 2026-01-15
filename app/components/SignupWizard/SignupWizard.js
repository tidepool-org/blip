import React from 'react';
import { Box, Flex } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';

import PersonalBannerImage from '../../components/elements/Container/PersonalBanner.png';

export const SignupWizardContainer = ({ children }) => {

  return (
    <Box sx={{
      margin: '100px auto 0', // TODO: Fix static values
      width: '800px',
      border: `1px solid ${vizColors.gray10}`,
      borderRadius: '8px',
      backgroundColor: vizColors.white,
    }}>
      <Box
        sx={{
          height: '100px', // TODO: Fix static values
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: `1px solid ${vizColors.gray10}`,
        }}
      >
        {/* TODO: Fix Image */}
        <img src={PersonalBannerImage} width="100%" height="100%" />
      </Box>

      <Box>{children}</Box>
    </Box>
  );
};

export const SignupWizardContents = ({ children }) => {
  return <Box px={4} py={4}>{ children }</Box>;
};

export const SignupWizardActions = ({ children }) => {
  return (
    <Flex
      sx={{
        py: 4,
        px: 4,
        borderTop: `1px solid ${vizColors.gray10}`,
        justifyContent: 'flex-end',
      }}
    >
        { children }
    </Flex>
  );
};

export default {
  SignupWizardContainer,
  SignupWizardContents,
};
