/* global jest */
/* global expect */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import { render, screen } from '@testing-library/react';

import MobileApp from '@app/pages/mobileapp/MobileApp';
import { APP_STORE_URL, PLAY_STORE_URL } from '@app/components/mobileapplink/MobileAppLink';
import utils from '@app/core/utils';

const BADGE_LABEL = 'Download Tidepool Mobile';

describe('MobileApp', () => {
  let getMobilePlatform;

  beforeEach(() => {
    getMobilePlatform = jest.spyOn(utils, 'getMobilePlatform');
  });

  afterEach(() => {
    getMobilePlatform.mockRestore();
  });

  it('should show only the App Store badge on iOS', () => {
    getMobilePlatform.mockReturnValue('ios');
    render(<MobileApp />);

    const badges = screen.getAllByRole('link', { name: BADGE_LABEL });
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveAttribute('href', APP_STORE_URL);
  });

  it('should show only the Play Store badge on Android', () => {
    getMobilePlatform.mockReturnValue('android');
    render(<MobileApp />);

    const badges = screen.getAllByRole('link', { name: BADGE_LABEL });
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveAttribute('href', PLAY_STORE_URL);
  });

  // Unlike the Welcome page button, this page must still render on desktop — it is a real
  // destination that a universal link resolves to when the app isn't installed.
  it('should show both badges on desktop rather than rendering nothing', () => {
    getMobilePlatform.mockReturnValue(null);
    render(<MobileApp />);

    expect(screen.getAllByRole('link', { name: BADGE_LABEL })).toHaveLength(2);
  });

  it('should offer a manual scheme link on iOS as a retry path', () => {
    getMobilePlatform.mockReturnValue('ios');
    render(<MobileApp />);

    expect(screen.getByText('Open the Tidepool Mobile app')).toBeInTheDocument();
  });
});
