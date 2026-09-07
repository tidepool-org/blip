import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Box, Flex, Image, Link } from 'theme-ui';

import { Title, Paragraph1 } from '../../components/elements/FontStyles';
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
  IOS_APP_URL,
} from '../../components/mobileapplink/MobileAppLink';
import utils from '../../core/utils';

import AppStoreBadge from '../../components/mobileapplink/images/appstore-badge.svg';
import GooglePlayBadge from '../../components/mobileapplink/images/google-play-badge.png';

/**
 * Landing page for the universal link target (see static/.well-known/apple-app-site-association).
 *
 * When the app is installed, iOS intercepts the link and this page is never rendered. It is only
 * reached when the app is missing, or when the link is opened somewhere universal links don't
 * fire (desktop, some in-app browsers), so it exists purely to route the user to the right store.
 */
export const MobileApp = (props) => {
  const { t } = props;
  const platform = utils.getMobilePlatform();

  const badges = [
    { key: 'ios', storeUrl: APP_STORE_URL, image: AppStoreBadge },
    { key: 'android', storeUrl: PLAY_STORE_URL, image: GooglePlayBadge },
  ].filter(({ key }) => !platform || key === platform);

  return (
    <Flex
      id="mobile-app-landing"
      sx={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '75vh', justifyContent: 'center' }}
    >
      <Title mb={3}>{t('Get the Tidepool Mobile app')}</Title>

      <Paragraph1 mb={4} sx={{ fontWeight: 'medium', maxWidth: '420px' }}>
        {t('If you already have the Tidepool Mobile app installed, it should have opened automatically. Otherwise, download it below.')}
      </Paragraph1>

      {platform === 'ios' && (
        <Link
          id="mobile-app-landing-open"
          href={IOS_APP_URL}
          mb={4}
          sx={{ fontWeight: 'bold' }}
        >
          {t('Open the Tidepool Mobile app')}
        </Link>
      )}

      <Flex sx={{ gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
        {badges.map(({ key, storeUrl, image }) => (
          <Box key={key}>
            <Link href={storeUrl} target="_blank" rel="noreferrer noopener">
              <Image src={image} alt={t('Download Tidepool Mobile')} sx={{ height: '40px' }} />
            </Link>
          </Box>
        ))}
      </Flex>
    </Flex>
  );
};

MobileApp.propTypes = {
  t: PropTypes.func,
};

export default withTranslation()(MobileApp);
