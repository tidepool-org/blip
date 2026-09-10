import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Box, Flex, Image, Link } from 'theme-ui';

import { Paragraph1 } from '../elements/FontStyles';
import utils from '../../core/utils';

import AppStoreBadge from './images/appstore-badge.svg';
import GooglePlayBadge from './images/google-play-badge.png';

export const APP_STORE_URL = 'https://apps.apple.com/us/app/tidepool-mobile/id1026395200';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=io.tidepool.urchin';

// A custom scheme for now. The nicer alternative, an iOS universal link, is postponed to post-MVP
// because it needs real infrastructure: a dedicated link host (iOS refuses to open universal links
// pointing at the host of the page they're tapped on) and an associated-domains entitlement in the
// app, i.e. a mobile release. A verified, working implementation is parked on the
// universal-link-prototype branch. This link only foregrounds the app — it carries no parameters
// and the app does no routing on it.
export const IOS_APP_URL = 'org.tidepool.mobile://signup-complete';

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
    appUrl: IOS_APP_URL,
    storeUrl: APP_STORE_URL,
    badgeImage: AppStoreBadge,
    badgeMetric: 'Clicked App Store Badge',
  },
  android: {
    appUrl: ANDROID_APP_URL,
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

  const { appUrl, storeUrl, badgeImage, badgeMetric } = platformConfig[platform];

  return (
    <Flex
      id="mobile-app-link"
      mb={4}
      sx={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
    >
      {/* A single anchor styled as a primary button — a real <Button> nested inside the Link is
          invalid HTML (interactive inside interactive), and it broke iOS Safari's long-press
          menu on the link. The variant assumes flex centering for its lineHeight: 0, hence the
          overrides. */}
      <Link
        id="mobile-app-link-open"
        href={appUrl}
        onClick={() => trackMetric('Clicked Open Tidepool Mobile App', { platform })}
        sx={{
          variant: 'buttons.primary',
          display: 'inline-block',
          lineHeight: 'normal',
          fontSize: 2,
          textDecoration: 'none',
        }}
      >
        {t('Open the Tidepool Mobile app')}
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
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(MobileAppLink);
