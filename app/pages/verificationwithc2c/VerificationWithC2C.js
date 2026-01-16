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
import { SignupWizardContainer, SignupWizardContents } from '../../components/SignupWizard';

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

const useC2CSuccessListener = ({ onConnectSuccess }) => {
  const justConnectedDataSourceProviderName = useSelector(state => state.blip.justConnectedDataSourceProviderName);
  const previousJustConnectedDataSourceProviderName = usePrevious(justConnectedDataSourceProviderName);

  useEffect(() => {
    if (justConnectedDataSourceProviderName && justConnectedDataSourceProviderName !== previousJustConnectedDataSourceProviderName) {
      onConnectSuccess();
    }
  }, [justConnectedDataSourceProviderName, previousJustConnectedDataSourceProviderName]);
};

const styleProps = {
  titleContainer: {
    fontSize: 3,
    display: 'flex',
    justifyContent: 'center',
    color: vizColors.blue50,
    my: 2,
  },
  subtitleContainer: {
    fontSize: 2,
    display: 'flex',
    justifyContent: 'center',
    color: vizColors.blue50,
    my: 4,
  },
  providerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: vizColors.blue00,
    padding: 2,
    my: 2,
  },
  providerConnectButton:{
    backgroundColor: vizColors.white,
    px: 4,
    py: 2,
  },
  skipStepButton: {
    backgroundColor: vizColors.white,
    border: `1px solid ${vizColors.blueGray30}`,
    width: '100%',
    color: vizColors.blue50,
    px: 4,
    py: 2,
    marginBottom: 4,
  },
  c2cInfoContainer: {
    color: vizColors.blue50,
    fontSize: 1,
  },
};

const VerificationWithC2C = ({ api }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { search } = useLocation();
  const history = useHistory();

  const redirectToAccountSetup = () => {
    const REDIRECT_PATH = '/verification-with-password';
    const nextStepPath = `${REDIRECT_PATH}${search}`;

    history.push(nextStepPath);
  };

  // Listen for a successful C2C connection. If there is one, redirect to next login step.
  useC2CSuccessListener({ onConnectSuccess: () => redirectToAccountSetup() });

  const handleClickProvider = (providerName) => {
    const queryParams = new URLSearchParams(search);
    const restrictedToken = queryParams.get('restrictedToken');

    const providerId = providers[providerName]?.id;
    const dataSourceFilter = providers[providerName]?.dataSourceFilter;

    if (!providerId || !dataSourceFilter) return;

    dispatch(actions.async.connectDataSourceWithRestrictedToken(api, providerId, restrictedToken, dataSourceFilter));
  };

  return (
    <SignupWizardContainer>
      <SignupWizardContents>
        <Box sx={styleProps.titleContainer}>
          {t('Welcome!')}
        </Box>

        <Box sx={styleProps.subtitleContainer}>
          {t('Choose how you manage your diabetes')}
        </Box>

        <Box>
          <Box>
            {
              Object.entries(providers).map(([providerName, provider]) => {
                const { logoImage } = provider;

                return (
                  <Box sx={styleProps.providerContainer}>
                    {/* TODO: Fix Image */}
                    <img src={logoImage} alt={providerName} style={{ objectFit: 'contain' }}/>

                    <Button
                      onClick={() => handleClickProvider(providerName)}
                      variant="textPrimary"
                      sx={styleProps.providerConnectButton}
                    >
                      {t('Connect')}
                    </Button>
                  </Box>
                );
              })
            }
          </Box>

          <Button
            onClick={() => redirectToAccountSetup()}
            sx={styleProps.skipStepButton}
          >
            {t('I have a different device')}
          </Button>

          <Box sx={styleProps.c2cInfoContainer}>
            {t('When you connect an account, data can flow into Tidepool without any extra effort. This helps your care team provide you with the best care. Only available in the US at this time. ')}
          </Box>
        </Box>
      </SignupWizardContents>
    </SignupWizardContainer>
  );
};

export default VerificationWithC2C;
