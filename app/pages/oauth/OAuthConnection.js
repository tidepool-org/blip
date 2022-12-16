import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { translate, Trans } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import capitalize from 'lodash/capitalize';
import includes from 'lodash/includes';
import { Box, Flex } from 'rebass/styled-components';
import { components as vizComponents } from '@tidepool/viz';

import Banner from '../../components/elements/Banner';
import Button from '../../components/elements/Button';
import { Title, Subheading, Body1 } from '../../components/elements/FontStyles';

const { Loader } = vizComponents;

export const OAuthConnection = (props) => {
  const { t, trackMetric } = props;
  const { providerName, status } = useParams();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search)
  const dispatch = useDispatch();
  const [isCustodial, setIsCustodial] = useState();
  const allowedProviderNames = ['dexcom'];
  const [authStatus, setAuthStatus] = useState();

  const statusContent = {
    authorized: {
      status: 'authorized',
      subheading: t('Thank you for connecting with Tidepool!'),
      message: t('We hope you enjoy your Tidepool experience.'),
      banner: {
        message: t('You have successfully connected your {{providerName}} account to Tidepool.', {
          providerName: capitalize(providerName),
        }),
        variant: 'success',
      },
    },
    declined: {
      status: 'declined',
      subheading: t('You can always decide connect at a later time.'),
      message: t('We hope you enjoy your Tidepool experience.'),
      banner: {
        message: t('You have declined connecting your {{providerName}} account to Tidepool.', {
          providerName: capitalize(providerName),
        }),
        variant: 'info',
      },
    },
    error: {
      status: 'error',
      subheading: t('Hmm... That didn\'t work. Please try again.'),
      banner: {
        message: t('We were unable to determine your {{providerName}} connection status.', {
          providerName: capitalize(providerName),
        }),
        variant: 'danger',
      },
    },
  };

  useEffect(() => {
    const custodialSignup = queryParams.has('signupEmail') && queryParams.has('signupKey');
    setIsCustodial(custodialSignup);

    if (includes(allowedProviderNames, providerName) && statusContent[status]) {
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

            <Flex justifyContent="center">
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
      </Box>
    </>
  ) : <Loader />;
};

OAuthConnection.propTypes = {
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(OAuthConnection);
