import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { withTranslation, Trans } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import capitalize from 'lodash/capitalize';
import includes from 'lodash/includes';
import { Box, Flex } from 'theme-ui';
import { components as vizComponents } from '@tidepool/viz';
import utils from '../../core/utils';

import Banner from '../../components/elements/Banner';
import Button from '../../components/elements/Button';
import { Title, Subheading, Body1 } from '../../components/elements/FontStyles';
import { activeProviders, providers } from '../../components/datasources/DataConnections';

const { Loader } = vizComponents;

export const OAuthConnection = (props) => {
  const { t, trackMetric } = props;
  const { providerName, status } = useParams();
  const { displayName } = providers[providerName] || {};
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const dispatch = useDispatch();
  const [isCustodial, setIsCustodial] = useState();
  const [authStatus, setAuthStatus] = useState();


  const statusContent = {
    authorized: {
      status: 'authorized',
      subheading: t('Thank you for connecting with Tidepool!'),
      message: t('We hope you enjoy your Tidepool experience.'),
      banner: {
        message: t('You have successfully connected your {{displayName}} data to Tidepool.', { displayName }),
        variant: 'success',
      },
    },
    declined: {
      status: 'declined',
      subheading: t('You can always decide to connect at a later time.'),
      message: t('We hope you enjoy your Tidepool experience.'),
      banner: {
        message: t('You have declined connecting your {{displayName}} data to Tidepool.', { displayName }),
        variant: 'info',
      },
    },
    error: {
      status: 'error',
      subheading: t('Hmm... That didn\'t work. Please try again.'),
      banner: {
        message: t('We were unable to determine your {{displayName}} connection status.', { displayName }),
        variant: 'danger',
      },
    },
  };

  useEffect(() => {
    const custodialSignup = queryParams.has('signupEmail') && queryParams.has('signupKey');
    setIsCustodial(custodialSignup);

    if (includes(activeProviders, providerName) && statusContent[status]) {
      setAuthStatus(statusContent[status]);
    } else {
      setAuthStatus(statusContent.error)
    }

    trackMetric('Oauth - Connection', { providerName, status, custodialSignup });
  }, []);

  const handleClickClaimAccount = () => {
    trackMetric('Oauth - Connection - Claim Account', { providerName, status });
    dispatch(push(`/login?${queryParams.toString()}`));
  };

  const handleRedirectToTidepool = () => {
    // After the connection, we want to get back to the /data view but we don't have access to the
    // patientId after the OAuth callback. We'll redirect back to '/patients' which does have
    // access to the patientId, with a flag to open the DataConnections modal back up on load.
    trackMetric('Oauth - Connection - Redirect back to Tidepool App', { providerName, status });

    let path = '/patients?justLoggedIn=true'
             + `&dataConnectionStatus=${status}`
             + `&dataConnectionProviderName=${providerName}`;

    dispatch(push(path));

    return;
  };

  return authStatus ? (
    <>
      <Banner id={`banner-oauth-${authStatus.status}`} {...authStatus.banner} dismissable={false} />

      <Box
        variant="containers.smallBordered"
        bg="white"
        mt={[0,4,5,6]}
        p={4}
        sx={{
          textAlign: 'center'
        }}
      >
        <Title id="oauth-heading" mb={2}>
          {t('Connection {{status}}', {status: capitalize(authStatus.status)})}
        </Title>

        <Subheading id="oauth-subheading" mb={3}>
          {authStatus.subheading}
        </Subheading>

        {authStatus.message && (
          <Body1 id="oauth-message" mb={3}>
            {authStatus.message}
          </Body1>
        )}

        {authStatus.status === 'error' && (
          <Trans i18nKey="html.oauth-support-message">
            <Body1 mb={3}>
              If this problem persists, please contact our support team at <a href="mailto:support@tidepool.org?Subject=Tidepool%20connection%20error" target="_blank" rel="noreferrer noopener">support@tidepool.org</a>.
            </Body1>
          </Trans>
        )}

        {isCustodial && authStatus.status !== 'error' && (
          <Box>
            <Body1 mb={3}>
              {t('If you\'d like to take ownership of your free account to view and upload data from home, please click the button below.')}
            </Body1>

            <Body1 mb={4}>
              {t('Your care provider will still have access to your account once you claim it.')}
            </Body1>

            <Flex sx={{ justifyContent: 'center' }}>
              <Button
                id="oauth-claim-account-button"
                variant="primary"
                onClick={handleClickClaimAccount}
              >
                {t('Claim My Account')}
              </Button>
            </Flex>
          </Box>
        )}

        {!isCustodial && utils.isMobile() && // on desktop, non-custodial users can just close the pop-up
          <Button
            id="oauth-redirect-home-button"
            variant="primary"
            onClick={handleRedirectToTidepool}
            mx="auto"
            mt={4}
          >
            {t('Back to Tidepool')}
          </Button>
        }
      </Box>
    </>
  ) : <Loader />;
};

OAuthConnection.propTypes = {
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(OAuthConnection);
