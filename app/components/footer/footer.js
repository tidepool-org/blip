import PropTypes from 'prop-types';
import React, { useState } from 'react';
import i18next from '../../core/language';
import _ from 'lodash';
import { Flex } from 'theme-ui';
import { useSelector } from 'react-redux';
import { selectIsSmartOnFhirMode } from '../../core/selectors';
import AboutDialog from './AboutDialog';

const t = i18next.t.bind(i18next);

const Footer = ({ version, location, trackMetric }) => {
  const inSmartOnFhirMode = useSelector(state => selectIsSmartOnFhirMode(state));
  const [aboutOpen, setAboutOpen] = useState(false);

  const shouldDisplayFooterLinks = !inSmartOnFhirMode && !_.includes(
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

  const openAbout = () => {
    trackMetric('Clicked Footer About');
    setAboutOpen(true);
  };

  return (
    <Flex
      className='container-nav-outer footer'
      sx={{ justifyContent: 'center', alignItems: 'center', gap: 4, margin: 'auto auto 24px' }}
    >
      {shouldDisplayFooterLinks &&
        <div className='footer-link'>
          <a
            href="https://support.tidepool.org/"
            id='support'
            onClick={() => trackMetric('Clicked Footer Support')}
            target="_blank"
            rel="noreferrer noopener">{t('Get Support')}</a>
        </div>
      }
      <div className='footer-link'>
        <button type='button' id='about' onClick={openAbout}>{t('About')}</button>
      </div>
      <AboutDialog
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        version={version}
        trackMetric={trackMetric}
      />
    </Flex>
  );
};

Footer.propTypes = {
  version: PropTypes.string,
  location: PropTypes.string.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default Footer;
