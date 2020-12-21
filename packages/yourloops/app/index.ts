/**
 * Copyright (c) 2020, Diabeloop
 * Main App file
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

import App from './app';

// TODO: window.onerror

const app = new App();

app
  .init()
  .then(() => {
    app.render();
    console.log("Application started");
  }).catch((reason: unknown) => {
    console.error("Failed to start the application", reason);
  });
