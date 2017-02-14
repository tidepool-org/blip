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

const twitter = require('./images/twitter.png');
const facebook = require('./images/facebook.png');
const jdrf = require('./images/jdrf.png');

const FooterLinks = (props) => {
  const metricFnMkr = (link) => {
    return () => { props.trackMetric(`Clicked Footer ${link}`); };
  }
  return (
    <div className='footer-section footer-section-top'>
      <div className='footer-link'>
        <a
          className='footer-twitter'
          href="https://twitter.com/tidepool_org"
          id='twitter'
          onClick={metricFnMkr('Twitter')}
          target="_blank"
        >
          <img src={twitter}/>
        </a>
        <a
          className='footer-facebook'
          href="https://www.facebook.com/TidepoolOrg"
          id='facebook'
          onClick={metricFnMkr('Facebook')}
          target="_blank"
        >
          <img src={facebook}/>
        </a>
      </div>
      <div className='footer-link'>
        <a
          href="http://tidepool.org/products/blip-notes/"
          id='mobile'
          onClick={metricFnMkr('Mobile App')}
          target="_blank"
        >Get Mobile App</a>
      </div>
      <div className='footer-link'>
        <a
          href="http://support.tidepool.org/"
          id='support'
          onClick={metricFnMkr('Support')}
          target="_blank">Get Support</a>
      </div>
      <div className='footer-link'>
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
          <img src={jdrf}/>
        </a>
      </div>
    </div>
  );
};

FooterLinks.propTypes = {
  trackMetric: React.PropTypes.func.isRequired,
};

export default FooterLinks;
