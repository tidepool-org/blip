import React from 'react';
import { Box } from 'theme-ui';

const VerificationWithC2C = () => {

  return (
    <Box sx={{
      margin: '100px auto 0', // TODO: Fix static values
      width: '800px',
      height: '500px',
      border: '1px solid #888888',
      borderRadius: '8px',
    }}>
      <Box sx={{
        height: '100px', // TODO: Fix static values
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: '1px solid #888888',
      }}>
        HEADER
      </Box>

      <Box sx={{ fontSize: 3, display: 'flex', justifyContent: 'center', margin: '24px' }}>
        Welcome!
      </Box>

      <Box sx={{ fontSize: 2, display: 'flex', justifyContent: 'center', margin: '24px' }}>
        First, choose which Diabetes Device you'd like to connect
      </Box>


    </Box>
  );
};

export default VerificationWithC2C;
