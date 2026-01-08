import React from 'react';
import { Box } from 'theme-ui';

const TMP_RESTRICTED_TOKEN = 'passed-in-from-url';

const createOAuthUrl = (api, providerName) => {
  let finalUrl;

  api.user.createOAuthProviderAuthorization(providerName, TMP_RESTRICTED_TOKEN, (err, url) => {
    if (err) {

    } else {
      finalUrl = url;
    }
  });

  return finalUrl;
};

const VerificationWithC2C = ({ api }) => {

  const handleClickProvider = (providerName) => {
    const url = createOAuthUrl(api, providerName);
  };

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

      <button onClick={() => handleClickProvider('dexcom')}>
        Dexcom
      </button>
    </Box>
  );
};

export default VerificationWithC2C;
