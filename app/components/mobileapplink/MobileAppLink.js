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

export const IOS_LINK_STORAGE_KEY = 'mobileAppLink.iosLink';
export const IOS_LINK_HOST_STORAGE_KEY = 'mobileAppLink.linkHost';

// localStorage can throw (private browsing, storage disabled); a failed read/write just means the
// override doesn't stick, which only degrades the test workflow, never the shipped behaviour.
const storage = {
  get: (key) => { try { return window.localStorage.getItem(key); } catch (e) { return null; } },
  set: (key, value) => { try { window.localStorage.setItem(key, value); } catch (e) { /* noop */ } },
  remove: (key) => { try { window.localStorage.removeItem(key); } catch (e) { /* noop */ } },
};

/**
 * Resolve the iOS link strategy for the current page load.
 *
 * ?iosLink=universal|scheme  selects the link form
 * ?linkHost=same             points the universal link at the current origin, to verify that iOS
 *                            really does suppress same-host universal links
 * ?iosLink=reset             clears a persisted override
 *
 * A query-string override is persisted on the device and keeps applying on later visits until it
 * is replaced or reset — editing query params by hand on a phone keyboard is painful, so the URL
 * only ever needs to be typed (or a prepared link tapped) once per mode. Each iosLink visit
 * re-persists linkHost according to its presence, so the stored state always mirrors the last
 * override URL used. An on-page indicator shows when an override is active.
 *
 * linkHost only accepts 'same' rather than an arbitrary host: this renders into an href, and
 * honouring a caller-supplied domain would let a crafted URL repoint the button off-site.
 */
export const resolveIosLinkStrategy = (search = '') => {
  const params = new URLSearchParams(search);
  const override = params.get('iosLink');

  if (override === 'reset') {
    storage.remove(IOS_LINK_STORAGE_KEY);
    storage.remove(IOS_LINK_HOST_STORAGE_KEY);
  } else if (['scheme', 'universal'].includes(override)) {
    storage.set(IOS_LINK_STORAGE_KEY, override);

    if (params.get('linkHost') === 'same') {
      storage.set(IOS_LINK_HOST_STORAGE_KEY, 'same');
    } else {
      storage.remove(IOS_LINK_HOST_STORAGE_KEY);
    }
  }

  const stored = storage.get(IOS_LINK_STORAGE_KEY);
  const isOverride = ['scheme', 'universal'].includes(stored);
  const strategy = isOverride ? stored : IOS_LINK_STRATEGY;

  return {
    strategy,
    sameHost: strategy === 'universal' && storage.get(IOS_LINK_HOST_STORAGE_KEY) === 'same',
    isOverride,
  };
};

export const getIosAppUrl = (search = '', origin = '') => {
  const { strategy, sameHost } = resolveIosLinkStrategy(search);

  if (strategy !== 'universal') return IOS_APP_URL;

  return sameHost && origin
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
  const iosLink = platform === 'ios' ? resolveIosLinkStrategy(window.location.search) : null;

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

      {/* Test scaffolding, so deliberately untranslated: visible only while a persisted
          ?iosLink override is active, so the device's current mode is never a mystery. */}
      {iosLink?.isOverride && (
        <Paragraph1 id="mobile-app-link-override" mt={2} sx={{ fontSize: 0, color: '#66788A' }}>
          {`Link override active: ${iosLink.strategy}${iosLink.sameHost ? ' (same host)' : ''} — ?iosLink=reset clears it`}
        </Paragraph1>
      )}

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
