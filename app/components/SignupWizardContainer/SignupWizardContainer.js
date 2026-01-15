import React from 'react';
import { Box } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';

import PersonalBannerImage from '../../components/elements/Container/PersonalBanner.png';

const SignupWizardContainer = ({ children }) => {

  return (
    <Box sx={{
      margin: '100px auto 0', // TODO: Fix static values
      width: '800px',
      border: `1px solid ${vizColors.gray10}`,
      borderRadius: '8px',
      backgroundColor: vizColors.white,
      paddingBottom: 4,
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

      <Box>
        {children}
      </Box>
    </Box>
  );
};

export default SignupWizardContainer;
