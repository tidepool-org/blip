import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Box, Flex, Image, Link } from 'theme-ui';

import Button from '../elements/Button';
import { Paragraph1 } from '../elements/FontStyles';
import utils from '../../core/utils';

import AppStoreBadge from './images/appstore-badge.svg';
import GooglePlayBadge from './images/google-play-badge.png';

export const APP_STORE_URL = 'https://apps.apple.com/us/app/tidepool-mobile/id1026395200';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=io.tidepool.urchin';

// The link only foregrounds the app — it carries no parameters and the app does no routing on it.
export const IOS_APP_URL = 'org.tidepool.mobile://signup-complete';

export const IOS_UNIVERSAL_LINK_PATH = '/mobile-app';

// PROTOTYPE. Host serving /.well-known/apple-app-site-association. iOS is understood to suppress
// universal links that point at the current page's own host, opening them in Safari rather than the
// app, which is why this defaults to a host other than the one serving the page. That claim is the
// premise of the whole design, so ?linkHost=same exists to test it directly.
export const IOS_UNIVERSAL_LINK_HOST = 'qa2.development.tidepool.org';
export const IOS_UNIVERSAL_LINK_URL = `https://${IOS_UNIVERSAL_LINK_HOST}${IOS_UNIVERSAL_LINK_PATH}`;

// Which link form iOS gets. 'scheme' is the shipped behaviour; 'universal' is under evaluation as a
// way to avoid Safari's "address is invalid" alert when the app isn't installed. Override per-load
// with ?iosLink=universal|scheme so both can be compared on a single build.
export const IOS_LINK_STRATEGY = 'scheme';

/**
 * Build the iOS link for the current page load.
 *
 * ?iosLink=universal|scheme  selects the link form
 * ?linkHost=same             points the universal link at the current origin, to verify that iOS
 *                            really does suppress same-host universal links
 *
 * linkHost only accepts 'same' rather than an arbitrary host: this renders into an href, and
 * honouring a caller-supplied domain would let a crafted URL repoint the button off-site.
 */
export const getIosAppUrl = (search = '', origin = '') => {
  const params = new URLSearchParams(search);
  const override = params.get('iosLink');
  const strategy = ['scheme', 'universal'].includes(override) ? override : IOS_LINK_STRATEGY;

  if (strategy !== 'universal') return IOS_APP_URL;

  return params.get('linkHost') === 'same' && origin
    ? `${origin}${IOS_UNIVERSAL_LINK_PATH}`
    : IOS_UNIVERSAL_LINK_URL;
};

// Chrome's intent:// syntax, so that a missing app falls through to the Play Store listing instead
// of failing silently. iOS has no equivalent fallback — Safari shows an "address is invalid" alert —
// which is why the store badge sits directly below the button.
export const ANDROID_APP_URL = [
  'intent://signup-complete#Intent',
  'scheme=org.tidepool.mobile',
  'package=io.tidepool.urchin',
  `S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)}`,
  'end',
].join(';');

const platformConfig = {
  ios: {
    getAppUrl: getIosAppUrl,
    storeUrl: APP_STORE_URL,
    badgeImage: AppStoreBadge,
    badgeMetric: 'Clicked App Store Badge',
  },
  android: {
    getAppUrl: () => ANDROID_APP_URL,
    storeUrl: PLAY_STORE_URL,
    badgeImage: GooglePlayBadge,
    badgeMetric: 'Clicked Play Store Badge',
  },
};

/**
 * Renders a link back to the Tidepool Mobile app, for users who arrived on the web to complete
 * signup and would otherwise be stranded here. Renders nothing outside of iOS and Android, where
 * the link cannot work.
 */
export const MobileAppLink = (props) => {
  const { t, trackMetric } = props;
  const platform = utils.getMobilePlatform();

  if (!platform) return null;

  const { getAppUrl, storeUrl, badgeImage, badgeMetric } = platformConfig[platform];
  const appUrl = getAppUrl(window.location.search, window.location.origin);

  return (
    <Flex
      id="mobile-app-link"
      mb={4}
      sx={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
    >
      <Link
        id="mobile-app-link-open"
        href={appUrl}
        onClick={() => trackMetric('Clicked Open Tidepool Mobile App', { platform })}
        sx={{ textDecoration: 'none' }}
      >
        <Button variant="primary" sx={{ fontSize: 2 }}>
          {t('Open the Tidepool Mobile app')}
        </Button>
      </Link>

      <Paragraph1 mt={3} mb={2} sx={{ fontWeight: 'medium' }}>
        {t('Don\'t have the app yet?')}
      </Paragraph1>

      <Box>
        <Link
          id="mobile-app-link-store"
          href={storeUrl}
          target="_blank"
          rel="noreferrer noopener"
          onClick={() => trackMetric(badgeMetric, { platform })}
        >
          <Image
            src={badgeImage}
            alt={t('Download Tidepool Mobile')}
            sx={{ height: '40px' }}
          />
        </Link>
      </Box>
    </Flex>
  );
};

MobileAppLink.propTypes = {
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(MobileAppLink);
