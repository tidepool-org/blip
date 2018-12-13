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

import '../config.app'; // Initializes window.config
import onerror from './onerror';

import app from './bootstrap';
import AppRoot from './redux/containers/Root';
import i18n from 'i18next';

import { setConfig } from 'react-hot-loader'
setConfig({ logLevel: 'debug' });

window.onerror = onerror;

app.start(AppRoot);

// webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./bootstrap', () => {
    app.render(AppRoot);
    i18n.reloadResources();
  });
}
