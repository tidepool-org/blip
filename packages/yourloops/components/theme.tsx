/**
 * Copyright (c) 2020, Diabeloop
 * Material-UI Theming
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

import { createMuiTheme } from '@material-ui/core/styles';

// Not using var(): https://github.com/mui-org/material-ui/issues/12827
export const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#109182",
    },
    secondary: {
      main: "#e5f0f0",
      light: "#f5f9f9",
      dark: "#b8d9dd",
    },
    error: {
      main: "#de514b",
    },
    text: {
      primary: "#000",
    },
  },
});
