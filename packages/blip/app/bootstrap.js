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

import _ from 'lodash';
import React from 'react';
import { render as reactDOMRender } from 'react-dom';
import bows from 'bows';

import i18n, { i18nOptions } from './core/language';
import blipCreateStore from './redux/store';
import AppRoot from './redux/containers/Root';

import { getRoutes } from './routes';

import config from './config';
import api from './core/api';
import { CONFIG as BrandConfig } from './core/constants';
import personUtils from './core/personutils';
import detectTouchScreen from './core/notouch';

class Bootstrap {
  constructor() {
    this.log = bows('App');
    this.api = api;
    this.personUtils = personUtils;
    this.DEBUG = _.get(window, 'localStorage.debug', false) === 'true';
    this.config = config;
    this.store = null;
    this.routing = null;
    this.trackMetric = this.trackMetric.bind(this);
  }

  get props() {
    return {
      DEBUG: this.DEBUG,
      api,
      config,
      log: this.log,
      trackMetric: this.trackMetric,
    };
  }

  trackMetric(eventName, properties, cb) {
    api.metrics.track(eventName, properties, cb);
  }

  /**
   * i18next callback
   * @param {string} language
   */
  onLanguageChanged(language) {
    let lang = language;
    if (_.isString(lang) && lang.indexOf('-') > 0) {
      const s = language.split('-');
      lang = s[0];
    }

    this.log.info('Update URL language to', lang);

    try {
      const assetsURL = new URL(config.ASSETS_URL + '/');

      const pathname = assetsURL.pathname.replace(/\/\//g, '/');
      let url = new URL(pathname + `data-privacy.${lang}.pdf`, assetsURL);
      BrandConfig.diabeloop.dataPrivacyURL = url.toString();

      url = new URL(pathname + `intended-use.${lang}.pdf`, assetsURL);
      BrandConfig.diabeloop.intendedUseURL = url.toString();

      url = new URL(pathname + `terms.${lang}.pdf`, assetsURL);
      BrandConfig.diabeloop.termsURL = url.toString();

    } catch (err) {
      this.log.error('Invalid assets URL', config.ASSETS_URL);
      this.log.error(err);
    }
  }

  async init() {
    detectTouchScreen();

    document.title = BrandConfig[config.BRANDING].name;

    if (config.BRANDING === 'diabeloop') {
      this.onLanguageChanged(i18nOptions.lng);
      i18n.on('languageChanged', this.onLanguageChanged.bind(this));
    }

    await new Promise((resolve) => {
      this.api.init(resolve);
    });
  }

  render() {
    reactDOMRender(<AppRoot store={this.store} routing={this.routing} />, document.getElementById('app'));
  }

  async start() {
    this.log('Starting app...');
    await this.init();
    this.store = blipCreateStore(this.api);
    this.routing = getRoutes(this, this.store);
    this.render();
    this.log('App started');
  }
}

export default Bootstrap;
