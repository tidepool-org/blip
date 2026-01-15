import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { usePrevious } from '../../core/hooks';
import { colors as vizColors } from '@tidepool/viz';
import * as actions from '../../redux/actions';

import { providers } from '../../components/datasources/DataConnections';
import { Box } from 'theme-ui';
import Button from '../../components/elements/Button';
import SignupWizardContainer from '../../components/SignupWizardContainer';

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

const useVerificationWithLoginLink = () => {
  const REDIRECT_PATH = '/verification-with-password';
  const { search } = useLocation();

  const nextStepPath = `${REDIRECT_PATH}${search}`;

  return { nextStepPath };
};

const useRedirectOnC2CConnectSuccess = ({ nextStepPath }) => {
  const history = useHistory();

  const justConnectedDataSourceProviderName = useSelector(state => state.blip.justConnectedDataSourceProviderName);
  const previousJustConnectedDataSourceProviderName = usePrevious(justConnectedDataSourceProviderName);

  useEffect(() => {
    if (justConnectedDataSourceProviderName && !previousJustConnectedDataSourceProviderName) {
      history.push(nextStepPath);
    }
  }, [justConnectedDataSourceProviderName, previousJustConnectedDataSourceProviderName, history]);
};

const VerificationWithC2C = ({ api }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { search } = useLocation();
  const history = useHistory();
  const { nextStepPath } = useVerificationWithLoginLink();

  // Listen for a successful C2C connection. If there is one, redirect to next login step.
  useRedirectOnC2CConnectSuccess({ nextStepPath });

  const handleClickProvider = (providerName) => {
    const queryParams = new URLSearchParams(search);
    const restrictedToken = queryParams.get('restrictedToken');

    const url = createOAuthUrl(api, providerName, restrictedToken);
    const providerId = providers[providerName]?.id;

    if (!providerId) return;

    dispatch(actions.sync.connectDataSourceSuccess(providerId, url));
  };

  return (
    <SignupWizardContainer>
      <Box
        sx={{
          fontSize: 3,
          display: 'flex',
          justifyContent: 'center',
          color: vizColors.blue50,
        }}
        my={2}
      >
        {t('Welcome!')}
      </Box>

      <Box
        sx={{
          fontSize: 2,
          display: 'flex',
          justifyContent: 'center',
          color: vizColors.blue50,
        }}
        my={4}
      >
        {t('Choose how you manage your diabetes')}
      </Box>

      <Box>
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
            onClick={() => history.push(nextStepPath)}
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
    </SignupWizardContainer>
  );
};

export default VerificationWithC2C;
