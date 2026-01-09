import React from 'react';
import { useDispatch } from 'react-redux';
import { Box } from 'theme-ui';
import { providers } from '../../components/datasources/DataConnections';
import * as actions from '../../redux/actions';
import { useLocation } from 'react-router-dom';

import PersonalBannerImage from './../../components/elements/Container/PersonalBanner.png'

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
      overflow: 'hidden',
    }}>
      <Box sx={{
        height: '100px', // TODO: Fix static values
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottom: '1px solid #888888',
      }}>
        {/* TODO: Fix Image */}
        <img src={PersonalBannerImage} width="100%" height="100%" />
      </Box>

      <Box sx={{ fontSize: 3, display: 'flex', justifyContent: 'center', margin: '24px' }}>
        Welcome!
      </Box>

      <Box sx={{ fontSize: 2, display: 'flex', justifyContent: 'center', margin: '24px' }}>
        First, choose which Diabetes Device you'd like to connect
      </Box>

      {
        Object.entries(providers).map(([providerName, provider]) => {
          const { logoImage } = provider;

          return (
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 2,
              margin: 2,
              border: '1px solid black',
            }}>
              {/* TODO: Fix Image */}
              <img src={logoImage} />

              <button onClick={() => handleClickProvider(providerName)}>
                Connect
              </button>
            </Box>
          );
        })
      }
    </Box>
  );
};

export default VerificationWithC2C;
