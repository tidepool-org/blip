import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { colors as vizColors } from '@tidepool/viz';
import * as actions from '../../redux/actions';

import { providers } from '../../components/datasources/DataConnections';
import validateRestrictedToken from './validateRestrictedToken';
import { Box } from 'theme-ui';
import Button from '../../components/elements/Button';
import Container from '../../components/elements/Container';
import useRedirectOnC2CSuccess from './useRedirectOnC2CSuccess';
import { useToasts } from '../../providers/ToastProvider';

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
    borderRadius: 4,
  },
  providerConnectButton:{
    backgroundColor: vizColors.white,
    px: 4,
    py: 2,
    maxWidth: '108px',
    fontWeight: 'medium',
    borderRadius: 4,
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
  const { set: setToast } = useToasts();

  const queryParams = new URLSearchParams(search);
  const restrictedToken = queryParams.get('restrictedToken');

  const redirectToAccountSetup = () => {
    history.push({ pathname: '/verification-with-password', search: queryParams.toString() });
  };

  // Listen for a successful C2C connection. If there is one, redirect to next login step.
  useRedirectOnC2CSuccess({ onRedirect: redirectToAccountSetup });

  const handleClickProvider = async (providerName) => {
    const providerId = providers[providerName]?.id;
    const dataSourceFilter = providers[providerName]?.dataSourceFilter;

    if (!providerId || !dataSourceFilter) return;

    const { isValid } = await validateRestrictedToken(restrictedToken, providerName);

    if (!isValid) {
      redirectToAccountSetup();
      setToast({
        message: t('An error occurred. Your connection invite may be expired or already used. Create an account to check your connection status.'),
        variant: 'danger',
      });

      return;
    }

    dispatch(actions.async.connectDataSourceWithRestrictedToken(api, providerId, restrictedToken, dataSourceFilter));
  };

  return (
    <Box sx={{ paddingTop: ['72px', '72px', '86px', '86px'] }}>
      <Container
        title={t('Welcome!')}
        subtitle={t('Choose how you manage your diabetes')}
        variant="mediumBordered"
        p={4}
        pt={3}
      >
        <Box>
          <Box>
            { Object.entries(providers).map(([providerName, provider]) => {
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
            onClick={redirectToAccountSetup}
            sx={styleProps.skipStepButton}
          >
            {t('I have a different device')}
          </Button>

          <Box sx={styleProps.c2cInfoContainer}>
            {t('When you connect an account, data can flow into Tidepool without any extra effort. This helps your care team provide you with the best care. Only available in the US at this time. ')}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default VerificationWithC2C;
