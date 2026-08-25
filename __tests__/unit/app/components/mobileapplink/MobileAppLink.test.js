/* global jest */
/* global expect */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MobileAppLink, {
  ANDROID_APP_URL,
  APP_STORE_URL,
  IOS_APP_URL,
  PLAY_STORE_URL,
} from '@app/components/mobileapplink/MobileAppLink';
import utils from '@app/core/utils';

const OPEN_APP_LABEL = 'Open the Tidepool Mobile app';
const STORE_BADGE_LABEL = 'Download Tidepool Mobile';

describe('MobileAppLink', () => {
  let getMobilePlatform;
  let trackMetric;

  beforeEach(() => {
    getMobilePlatform = jest.spyOn(utils, 'getMobilePlatform');
    trackMetric = jest.fn();
  });

  afterEach(() => {
    getMobilePlatform.mockRestore();
  });

  describe('on a desktop user agent', () => {
    it('should render nothing, since the link cannot work there', () => {
      getMobilePlatform.mockReturnValue(null);
      const { container } = render(<MobileAppLink trackMetric={trackMetric} />);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('on iOS', () => {
    beforeEach(() => {
      getMobilePlatform.mockReturnValue('ios');
    });

    it('should link to the app with the plain custom scheme', () => {
      render(<MobileAppLink trackMetric={trackMetric} />);

      expect(screen.getByRole('link', { name: OPEN_APP_LABEL }))
        .toHaveAttribute('href', IOS_APP_URL);
      expect(IOS_APP_URL).toBe('org.tidepool.mobile://signup-complete');
    });

    it('should fall back to the App Store listing', () => {
      render(<MobileAppLink trackMetric={trackMetric} />);

      expect(screen.getByRole('link', { name: STORE_BADGE_LABEL }))
        .toHaveAttribute('href', APP_STORE_URL);
    });

    it('should track a metric when the app link is clicked', async () => {
      render(<MobileAppLink trackMetric={trackMetric} />);
      await userEvent.click(screen.getByRole('link', { name: OPEN_APP_LABEL }));

      expect(trackMetric).toHaveBeenCalledWith('Clicked Open Tidepool Mobile App', { platform: 'ios' });
    });
  });

  describe('on Android', () => {
    beforeEach(() => {
      getMobilePlatform.mockReturnValue('android');
    });

    it('should link to the app with the intent:// scheme, so a missing app falls through to the Play Store', () => {
      render(<MobileAppLink trackMetric={trackMetric} />);

      expect(screen.getByRole('link', { name: OPEN_APP_LABEL }))
        .toHaveAttribute('href', ANDROID_APP_URL);
      expect(ANDROID_APP_URL).toBe('intent://signup-complete#Intent;scheme=org.tidepool.mobile;package=io.tidepool.urchin;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dio.tidepool.urchin;end');
    });

    it('should fall back to the Play Store listing', () => {
      render(<MobileAppLink trackMetric={trackMetric} />);

      expect(screen.getByRole('link', { name: STORE_BADGE_LABEL }))
        .toHaveAttribute('href', PLAY_STORE_URL);
    });

    // The visible target is a Button nested inside the anchor, so a real tap lands on the button
    // and relies on the click bubbling up to trigger the link.
    it('should trigger the app link when the button itself is tapped', async () => {
      render(<MobileAppLink trackMetric={trackMetric} />);
      await userEvent.click(screen.getByRole('button', { name: OPEN_APP_LABEL }));

      expect(trackMetric).toHaveBeenCalledWith('Clicked Open Tidepool Mobile App', { platform: 'android' });
    });

    it('should track a metric when the app link is clicked', async () => {
      render(<MobileAppLink trackMetric={trackMetric} />);
      await userEvent.click(screen.getByRole('link', { name: OPEN_APP_LABEL }));

      expect(trackMetric).toHaveBeenCalledWith('Clicked Open Tidepool Mobile App', { platform: 'android' });
    });
  });
});
