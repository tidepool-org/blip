/**
 * Copyright (c) 2014, Tidepool Project
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
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import i18n, { i18nOptions } from '../../core/language';

function LoginNav(props) {
  const { page, hideLinks, trackMetric } = props;
  const t = i18n.t.bind(i18n);
  const [ isLangMenuOpened, setLangMenuOpened ] = useState(false);

  let link = null;
  if (!hideLinks) {
    let href = '/signup/clinician';
    let className = 'js-signup-link';
    let icon = 'icon-add';
    let text = t('Sign up');
    let handleClick = () => {
      trackMetric('Clicked Sign Up Link');
    };

    if (page === 'signup') {
      href = '/login';
      className = 'js-login-link';
      icon = 'icon-login';
      text = t('Log in');
      handleClick = () => {
        trackMetric('Clicked Log In Link');
      };
    }

    link = (
      <Link to={href} onClick={handleClick} className={className}>
        <i className={icon}></i>{' ' + text}
      </Link>
    );
  }

  const langs = [];
  for (const lang in i18nOptions.resources) {
    if (lang === i18n.language) {
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(i18nOptions.resources, lang)) {
      const language = i18nOptions.resources[lang].name;
      const handleClick = () => {
        i18n.changeLanguage(lang);
      };

      const handleChange = (/** @type {React.KeyboardEvent<HTMLSpanElement>} */ e) => {
        switch (e.key) {
        case 'Enter':
        case ' ':
          i18n.changeLanguage(lang);
          setLangMenuOpened(false);
          break;
        case 'Escape':
          setLangMenuOpened(false);
          break;
        }
      };
      langs.push(<span key={lang} role="button" tabIndex={0} onClick={handleClick} onKeyUp={handleChange}>{language}</span>);
    }
  }

  // Manage click outside the menu, close it
  useEffect(() => {
    /**
     * @param {MouseEvent} e click event
     */
    function handleClickOutside(e) {
      if (isLangMenuOpened) {
        e.preventDefault();
        setLangMenuOpened(false);
      }
    }

    if (isLangMenuOpened) {
      const body = document.querySelector('body');
      body.addEventListener('click', handleClickOutside);

      return function cleanup() {
        body.removeEventListener('click', handleClickOutside);
      };
    }
    return undefined;
  });

  const handleClickShowLangs = () => {
    setLangMenuOpened(!isLangMenuOpened);
  };
  const handleKeyShowLangs = (/** @type {React.KeyboardEvent<HTMLSpanElement>} */ e) => {
    switch (e.key) {
    case 'Enter':
    case ' ':
      setLangMenuOpened(!isLangMenuOpened);
      break;
    case 'ArrowDown':
      setLangMenuOpened(true);
      break;
    case 'ArrowUp':
    case 'Escape':
      setLangMenuOpened(false);
      break;
    }
  };

  const langMenuClass = `lang-selector-menu ${isLangMenuOpened ? '' : 'menu-hidden'}`;

  return (
    <div className="container-nav-outer login-nav">
      <div className="lang-selector-dropdown">
        <div className="lang-selector-nav" role="button" tabIndex={0} onClick={handleClickShowLangs} onKeyUp={handleKeyShowLangs}>
          {i18nOptions.resources[i18n.language].name}<i className="icon-arrow-down" />
        </div>
        <div className={langMenuClass}>
          {langs}
        </div>
      </div>
      {link}
    </div>
  );
}

LoginNav.propTypes = {
  page: PropTypes.string,
  hideLinks: PropTypes.bool,
  trackMetric: PropTypes.func.isRequired
};

LoginNav.defaultProps = {
  page: '',
  hideLinks: false,
};

export default LoginNav;
