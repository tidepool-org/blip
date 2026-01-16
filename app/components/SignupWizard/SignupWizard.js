import React from 'react';
import { Box } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';

import PersonalBannerImage from '../../components/elements/Container/PersonalBanner.png';

const styleProps = {
  outerContainer: {
    mx: 'auto',
    marginTop: [0, 0, '80px', '80px'],
    marginBottom: 0,
    width: [null, null, '800px'],
    border: `1px solid ${vizColors.gray10}`,
    borderRadius: '8px',
    backgroundColor: vizColors.white,
  },
  bannerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: `1px solid ${vizColors.gray10}`,
    maxHeight: '100px',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100px',
    objectFit: 'cover',
  },
};

export const SignupWizardContainer = ({ children }) => {

  return (
    <Box sx={styleProps.outerContainer}>
      <Box sx={styleProps.bannerContainer}>
        {/* TODO: Fix Image */}
        <img src={PersonalBannerImage} style={styleProps.bannerImage} />
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
    <Box sx={{ py: 4, px: 4, borderTop: `1px solid ${vizColors.gray10}` }}>
      { children }
    </Box>
  );
};

export default {
  SignupWizardContainer,
  SignupWizardContents,
};
