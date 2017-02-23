/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import React, { PropTypes } from 'react';

require('./images/jdrf.png');
require('./images/jdrf_hover.png');

const FooterLinks = (props) => {
  const metricFnMkr = (link) => {
    return () => { props.trackMetric(`Clicked Footer ${link}`); };
  }
  return (
    <div className='footer-section footer-section-top'>
      <div className='footer-link social-media large-format-only'>
        <a
          className='footer-twitter'
          href="https://twitter.com/tidepool_org"
          id='twitter'
          onClick={metricFnMkr('Twitter')}
          target="_blank"
        >
          <svg viewBox="75.05 98.4 249.9 203.2">
            <path d="M153.6,301.6c94.3,0,145.9-78.2,145.9-145.9c0-2.2,0-4.4-0.1-6.6c10-7.2,18.7-16.3,25.6-26.6 c-9.2,4.1-19.1,6.8-29.5,8.1c10.6-6.3,18.7-16.4,22.6-28.4c-9.9,5.9-20.9,10.1-32.6,12.4c-9.4-10-22.7-16.2-37.4-16.2 c-28.3,0-51.3,23-51.3,51.3c0,4,0.5,7.9,1.3,11.7c-42.6-2.1-80.4-22.6-105.7-53.6c-4.4,7.6-6.9,16.4-6.9,25.8 c0,17.8,9.1,33.5,22.8,42.7c-8.4-0.3-16.3-2.6-23.2-6.4c0,0.2,0,0.4,0,0.7c0,24.8,17.7,45.6,41.1,50.3c-4.3,1.2-8.8,1.8-13.5,1.8 c-3.3,0-6.5-0.3-9.6-0.9c6.5,20.4,25.5,35.2,47.9,35.6c-17.6,13.8-39.7,22-63.7,22c-4.1,0-8.2-0.2-12.2-0.7 C97.7,293.1,124.7,301.6,153.6,301.6"/>
          </svg>
        </a>
        <a
          className='footer-facebook'
          href="https://www.facebook.com/TidepoolOrg"
          id='facebook'
          onClick={metricFnMkr('Facebook')}
          target="_blank"
        >
          <svg viewBox="0 0 32 32">
            <path d="M18,32V18h6l1-6h-7V9c0-2,1.002-3,3-3h3V0c-1,0-3.24,0-5,0c-5,0-7,3-7,8v4H6v6h6v14H18z" />
          </svg>
        </a>
      </div>
      <div className='footer-link large-format-only'>
        <a
          href="http://tidepool.org/products/blip-notes/"
          id='mobile'
          onClick={metricFnMkr('Mobile App')}
          target="_blank"
        >Get Mobile App</a>
      </div>
      <div className='footer-link large-format-only'>
        <a
          href="http://support.tidepool.org/"
          id='support'
          onClick={metricFnMkr('Support')}
          target="_blank">Get Support</a>
      </div>
      <div className='footer-link large-format-only'>
        <a
          href='http://tidepool.org/legal/'
          id='legal'
          onClick={metricFnMkr('PP and TOU')}
          target='_blank'>Privacy and Terms of Use</a>
      </div>
      <div className='footer-link footer-jdrf'>
        <a
          href='http://jdrf.org/'
          id='jdrf'
          onClick={metricFnMkr('JDRF')}
          target='_blank'>
          Made possible by
          <img />
        </a>
      </div>
    </div>
  );
};

FooterLinks.propTypes = {
  trackMetric: React.PropTypes.func.isRequired,
};

export default FooterLinks;
