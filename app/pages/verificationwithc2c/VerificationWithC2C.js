import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Box } from 'theme-ui';
import Button from '../../components/elements/Button';
import { providers } from '../../components/datasources/DataConnections';
import * as actions from '../../redux/actions';
import { usePrevious } from '../../core/hooks';
import { colors as vizColors } from '@tidepool/viz';

import PersonalBannerImage from './../../components/elements/Container/PersonalBanner.png'
import { useTranslation } from 'react-i18next';

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

const useRedirectOnC2CConnectSuccess = () => {
  const REDIRECT_PATH = '/verification-with-login';

  const history = useHistory();
  const { search } = useLocation();

  const justConnectedDataSourceProviderName = useSelector(state => state.blip.justConnectedDataSourceProviderName);
  const previousJustConnectedDataSourceProviderName = usePrevious(justConnectedDataSourceProviderName);

  useEffect(() => {
    if (justConnectedDataSourceProviderName && !previousJustConnectedDataSourceProviderName) {
      history.push(`${REDIRECT_PATH}${search}`);
    }
  }, [justConnectedDataSourceProviderName, previousJustConnectedDataSourceProviderName, history, search]);
};

const VerificationWithC2C = ({ api }) => {
  const dispatch = useDispatch();
  const { search } = useLocation();
  const { t } = useTranslation();

  // Listen for a successful C2C connection. If there is one, redirect to next login step.
  useRedirectOnC2CConnectSuccess();

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
      border: `1px solid ${vizColors.gray10}`,
      borderRadius: '8px',
      overflow: 'hidden',
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

      <Box
        sx={{
          fontSize: 3,
          display: 'flex',
          justifyContent: 'center',
          margin: 4,
          color: vizColors.blue50,
        }}
      >
        {t('Welcome!')}
      </Box>

      <Box
        sx={{
          fontSize: 2,
          display: 'flex',
          justifyContent: 'center',
          margin: 4,
          color: vizColors.blue50,
        }}
      >
        {t("First, choose which Diabetes Device you'd like to connect")}
      </Box>

      <Box px={4}>
        <Box>
          {
            Object.entries(providers).map(([providerName, provider]) => {
              const { logoImage } = provider;

              return (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: 2,
                    backgroundColor: vizColors.blue00,
                  }}
                  my={2}
                >
                  {/* TODO: Fix Image */}
                  <img src={logoImage} alt={providerName} style={{ objectFit: 'contain' }}/>

                  <Button
                    onClick={() => handleClickProvider(providerName)}
                    role="button"
                    variant="textPrimary"
                    sx={{ backgroundColor: vizColors.white }}
                    px={4}
                    py={2}
                  >
                    {t('Connect')}
                  </Button>
                </Box>
              );
            })
          }
        </Box>

        <Box mb={4}>
          <Button
            onClick={() => {}}
            role="button"
            sx={{
              backgroundColor: vizColors.white,
              border: `1px solid ${vizColors.blueGray30}`,
              width: '100%',
              color: vizColors.blue50,
            }}
            px={4}
            py={2}
          >
            {t('I have a different device')}
          </Button>
        </Box>

        <Box sx={{ color: vizColors.blue50, fontSize: 1 }}>
          {t('When you connect an account, data can flow into Tidepool without any extra effort. This helps your care team provide you with the best care. Only available in the US at this time. ')}
        </Box>
      </Box>
    </Box>

  );
};

export default VerificationWithC2C;
