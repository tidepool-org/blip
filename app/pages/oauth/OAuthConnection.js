import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { withTranslation, Trans } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import includes from 'lodash/includes';
import map from 'lodash/map';
import { Box, Flex, Divider, Image } from 'theme-ui';
import { components as vizComponents } from '@tidepool/viz';
import utils from '../../core/utils';

import Banner from '../../components/elements/Banner';
import Button from '../../components/elements/Button';
import { Title, Subheading, Body1 } from '../../components/elements/FontStyles';
import { availableProviders, providers } from '../../components/datasources/DataConnections';
import consentDataImage from './images/consent_data.png';

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
  const [acceptProcessing, setAcceptProcessing] = useState(false);
  const isAcceptStatus = authStatus?.status === 'accept';
  const isErrorStatus = authStatus?.status === 'error';

  const statusContent = {
    accept: {
      status: 'accept',
      title: t('Your Body, Your Data'),
      subheading: t('Your ŌURA data may contain information about your reproductive health'),
      message: [
        t('As part of using Tidepool Apps and Services or as part of certain initiatives, we may collect reproductive health data that you provide to us or that you authorize a 3rd Party to provide to us on your behalf. This data may be used and disclosed in accordance with Tidepool’s Privacy Policy and applicable law. You can stop sharing reproductive health data at any point by accessing your Devices page and disconnecting 3rd Party devices, which share these data to Tidepool. You may also request your data be deleted at any time. Please see 1.2.4 Export, Delete, or Change Your Information and 1.2.5 Cancel Your Account in our Privacy Policy.'),
        t('By linking your Oura account, you acknowledge that Tidepool may collect, use, and disclose data derived from your device, including reproductive health data. Please consider the laws governing reproductive health in your jurisdiction before providing Tidepool with such data.'),
      ],
      image: consentDataImage,
    },
    authorized: {
      status: 'authorized',
      title: t('Connection Authorized'),
      subheading: t('Thank you for connecting with Tidepool!'),
      message: [t('We hope you enjoy your Tidepool experience.')],
      banner: {
        message: t('You have successfully connected your {{displayName}} data to Tidepool.', { displayName }),
        variant: 'success',
      },
    },
    declined: {
      status: 'declined',
      title: t('Connection Declined'),
      subheading: t('You can always decide to connect at a later time.'),
      message: [t('We hope you enjoy your Tidepool experience.')],
      banner: {
        message: t('You have declined connecting your {{displayName}} data to Tidepool.', { displayName }),
        variant: 'info',
      },
    },
    error: {
      status: 'error',
      title: t('Connection Error'),
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

    if (includes(availableProviders, providerName) && statusContent[status]) {
      setAuthStatus(statusContent[status]);
    } else {
      setAuthStatus(statusContent.error)
    }

    trackMetric('Oauth - Connection', { providerName, status, custodialSignup });
  }, []);

  const handleAccept = () => {
    // Return to the authorization flow after accepting. The backend may enforce (or not) any
    // actual acceptance requirements for the connection (e.g. formal consent) and, if not met,
    // reroute back to this accept step until resolved. In the basic case, the backend does not
    // impose actual acceptance requirements other than just adding the accepted query param.
    trackMetric('Oauth - Connection - Accept', { providerName, status });
    setAcceptProcessing(true);
    window.location.href = queryParams.get('return_url');
  }

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
      {authStatus.banner &&
        <Banner id={`banner-oauth-${authStatus.status}`} {...authStatus.banner} dismissable={false} />
      }

      <Box
        variant="containers.smallBordered"
        bg="white"
        mt={[0,4,5,6]}
        py={4}
        sx={{
          textAlign: 'center'
        }}
      >
        {/* Header */}
        <Box px={4}>
          <Title id="oauth-heading" mb={2} sx={{ fontWeight: 'medium' }}>
            {authStatus.title}
          </Title>
        </Box>

        {isAcceptStatus && <Divider my={4} variant='styles.dividerDark' />}

        {/* Content */}
        {isAcceptStatus ? (
          <Box px={4} sx={{ textAlign: 'left' }}>
            <Flex sx={{
              flexDirection: ['column', 'row'],
              alignItems: 'center',
              gap: 3,
              textAlign: ['center', 'left'],
              mb: 4
            }}>
              <Image
                src={authStatus.image}
                alt=""
                sx={{ maxWidth: '120px', flexShrink: 0 }}
              />
              <Flex sx={{ alignItems: 'center', flex: 1 }}>
                <Subheading id="oauth-subheading">
                  {authStatus.subheading}
                </Subheading>
              </Flex>
            </Flex>
            {map(authStatus.message, (message, index) => (
              <Body1 id="oauth-message" key={index} mb={3}>{message}</Body1>
            ))}
          </Box>
        ) : (
          <Box px={4}>
            <Subheading id="oauth-subheading" mb={4}>
              {authStatus.subheading}
            </Subheading>
            {map(authStatus.message, (message, index) => (
              <Body1 id="oauth-message" key={index} mb={3}>{message}</Body1>
            ))}
          </Box>
        )}

        {isAcceptStatus && <Divider my={4} variant='styles.dividerDark' />}

        {/* Footer */}
        {isAcceptStatus && (
          <Flex px={4} sx={{ justifyContent: 'flex-end' }}>
            <Button
              id="oauth-redirect-home-button"
              variant="primary"
              onClick={handleAccept}
              processing={acceptProcessing}
            >
              {t('I understand')}
            </Button>
          </Flex>
        )}

        {isErrorStatus && (
          <Box px={4}>
            <Trans i18nKey="html.oauth-support-message">
              <Body1 mb={3}>
                If this problem persists, please contact our support team at <a href="mailto:support@tidepool.org?Subject=Tidepool%20connection%20error" target="_blank" rel="noreferrer noopener">support@tidepool.org</a>.
              </Body1>
            </Trans>
          </Box>
        )}

        {isCustodial && !isAcceptStatus && !isErrorStatus && (
          <Box px={4}>
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
          <Box px={4}>
            <Button
              id="oauth-redirect-home-button"
              variant="primary"
              onClick={handleRedirectToTidepool}
              mx="auto"
              mt={4}
            >
              {t('Back to Tidepool')}
            </Button>
          </Box>
        }
      </Box>
    </>
  ) : <Loader />;
};

OAuthConnection.propTypes = {
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(OAuthConnection);
