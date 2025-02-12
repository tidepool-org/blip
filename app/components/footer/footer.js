import PropTypes from 'prop-types';
import React from 'react';
import i18next from '../../core/language';
import _ from 'lodash';
import Version from '../version';
import { Flex } from 'theme-ui';

const t = i18next.t.bind(i18next);

const Footer = ({ version, location, trackMetric }) => {
  const metricFnMkr = (link) => {
    return () => { trackMetric(`Clicked Footer ${link}`); };
  };

  const shouldDisplayFooterLinks = !_.includes(
    [
      '/signup',
      '/signup/personal',
      '/signup/clinician',
      '/email-verification',
      '/request-password-reset',
      '/terms',
      '/patients/new',
    ],
    location
  );

  return (
    <Flex
      className='container-nav-outer footer'
      sx={{ justifyContent: 'space-around', margin: 'auto auto 24px' }}
    >
      {shouldDisplayFooterLinks &&
        <div className='footer-section'>
          <div className='footer-link social-media large-format-only'>
            <a
              href="https://x.com/tidepool_org"
              id='twitter'
              onClick={metricFnMkr('Twitter')}
              target="_blank"
              rel="noreferrer noopener"
            >
              <svg viewBox="0 0 1200 1227" width="26px" height="26px" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/TidepoolOrg"
              id='facebook'
              onClick={metricFnMkr('Facebook')}
              target="_blank"
              rel="noreferrer noopener"
            >
              <svg viewBox="0 0 32 32" width="26px" height="26px">
                <path d="M18,32V18h6l1-6h-7V9c0-2,1.002-3,3-3h3V0c-1,0-3.24,0-5,0c-5,0-7,3-7,8v4H6v6h6v14H18z" />
              </svg>
            </a>
          </div>
        </div>
      }
      {shouldDisplayFooterLinks &&
        <div className='footer-section'>
          <div className='footer-link secondary large-format-only'>
            <a
              href="http://support.tidepool.org/"
              id='support'
              onClick={metricFnMkr('Support')}
              target="_blank"
              rel="noreferrer noopener">{t('Get Support')}</a>
            <a
              href='http://tidepool.org/legal/'
              id='legal'
              onClick={metricFnMkr('PP and TOU')}
              target='_blank'
              rel="noreferrer noopener">{t('Privacy and Terms of Use')}</a>
          </div>
        </div>
      }
      <div className='footer-section'>
        {version && <Version version={version} />}
      </div>
    </Flex>
  );
};

Footer.propTypes = {
  version: PropTypes.string,
  trackMetric: PropTypes.func.isRequired,
};

export default Footer;
