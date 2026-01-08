import React from 'react';
import { useDispatch } from 'react-redux';
import { Box } from 'theme-ui';
import { providers } from '../../components/datasources/DataConnections';
import * as actions from '../../redux/actions';
import { useLocation } from 'react-router-dom';

const createOAuthUrl = (api, providerName, restrictedToken) => {
  let finalUrl;

  api.user.createOAuthProviderAuthorization(providerName, restrictedToken, (err, url) => {
    if (err) {

    } else {
      finalUrl = url;
    }
  });

  return finalUrl;
};

const VerificationWithC2C = ({ api }) => {
  const dispatch = useDispatch();
  const { search } = useLocation();

  const handleClickProvider = (providerName) => {
    const queryParams = new URLSearchParams(search);
    const restrictedToken = queryParams.get('restrictedToken');

    const url = createOAuthUrl(api, providerName, restrictedToken);
    const providerId = providers[providerName]?.id;

    if (!providerId) return;

    dispatch(actions.sync.connectDataSourceSuccess(providerId, url));
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
