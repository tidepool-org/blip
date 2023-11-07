import React from 'react';
import { withTranslation, Trans } from 'react-i18next';
import { Flex, Box, Text } from 'theme-ui';
import customProtocolCheck from 'custom-protocol-check';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'lodash';
import { Subheading, Title } from '../../components/elements/FontStyles';
import Button from '../../components/elements/Button';
import UAParser from 'ua-parser-js';
import { useIsFirstRender } from '../../core/hooks';
import personUtils from '../../core/personutils';

let launched = false;

const UploadRedirect = (props) => {
  const dispatch = useDispatch();
  const user = useSelector(
    (state) => state?.blip?.allUsersMap?.[state?.blip?.loggedInUserId]
  );
  const userHasFullName = !isEmpty(user?.profile?.fullName);
  const userHasClinicProfile = !isEmpty(user?.profile?.clinic);
  const isClinicianAccount = personUtils.isClinicianAccount(user);
  const { t } = props;
  const isFirstRender = useIsFirstRender();
  const fromProfile = props.location.state?.referrer === 'profile';
  const linkUrl = `tidepooluploader://localhost/keycloak-redirect${props.location.hash}`;
  const ua = new UAParser().getResult();
  let openText = 'Open Tidepool Uploader';
  switch (ua.browser.name) {
    case 'Firefox':
      openText = 'Open Link'
      break;
    case 'Edge':
      openText = 'Open'
      break;
    case 'Safari':
      openText = 'Allow'
    default:
      break;
  }

  if (!props.location.hash && !fromProfile) {
    return <Redirect to="/login" />;
  }

  if (!userHasFullName) {
    if (isClinicianAccount && !userHasClinicProfile) {
      dispatch(
        push({
          pathname: '/clinic-details/profile',
          state: { referrer: 'upload-launch' },
        })
      );
    } else {
      dispatch(
        push({ pathname: '/profile', state: { referrer: 'upload-launch' } })
      );
    }
    return null;
  }

  if (!launched && isFirstRender) {
    if (props.location.hash || fromProfile) {
      customProtocolCheck(
        linkUrl,
        () => {},
        () => {
          launched = true;
        },
        5000
      );
    }
  }

  return (
    <Flex sx={{ justifyContent: 'center', alignItems: 'center' }} height="75vh">
      <Box>
        <Text fontWeight="medium">
          <Box>
            <Flex sx={{ alignItems: 'center', flexDirection: 'column' }}>
              <Title mb="10px">
                {
                  fromProfile ? (
                    <Trans>
                      Thank you for completing your account registration. Click <Text as="span" fontWeight="bold">{openText}</Text> on the dialog shown by your browser and <Text as="span" fontWeight="bold">log in</Text> again.
                    </Trans>
                    ) : (
                    <Trans>
                      Click <Text as="span" fontWeight="bold">{openText}</Text> on the dialog shown by your browser
                    </Trans>
                  )
                }
              </Title>
              <Subheading mb="10px">
                <Trans>
                  If you don’t see a dialog, click <Text as="span" fontWeight="bold">Launch Uploader</Text> below
                </Trans>
              </Subheading>
              <Subheading mb="20px">
                <Trans>
                  Once Tidepool Uploader has launched, you can close this window.
                </Trans>
              </Subheading>
              <a id="launch_uploader" href={linkUrl}>
                <Button variant="primary" sx={{ fontSize: 3 }}>
                  {t('Launch Uploader')}
                </Button>
              </a>
            </Flex>
          </Box>
        </Text>
      </Box>
    </Flex>
  );
};

export default withTranslation()(UploadRedirect);
