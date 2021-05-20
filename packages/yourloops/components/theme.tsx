/**
 * Copyright (c) 2021, Diabeloop
 * Material-UI Theming
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { createMuiTheme, Theme, darken, lighten } from "@material-ui/core/styles";
import { PaletteOptions } from "@material-ui/core/styles/createPalette";

const commonTheme: PaletteOptions = {
  type: "light",
  primary: {
    main: "#109182",
    light: "#F7F7F8",
  },
  secondary: {
    main: "#E5F0F0",
    light: "#F5F9F9",
    dark: "#D4E6E6",
  },
  error: {
    main: "#DE514B",
    light: "#DA3A1B",
  },
  text: {
    primary: "#000",
  },
};

// Not using var(): https://github.com/mui-org/material-ui/issues/12827
export const mainTheme = createMuiTheme({
  palette: {
    ...commonTheme,
    background: { default: "#FFFFFF" },
  },
});

export const externalTheme = createMuiTheme({
  palette: {
    ...commonTheme,
    background: { default: "#F7F7F8" },
  },
});

/**
 * For some reason, return makeStyle(...) here don't work with our theme
 * @param theme Main theme
 * @returns The styles for buttons
 */
export const makeButtonsStyles = (theme: Theme) => { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  // I disabled the eslint warning here, because it's too annoying doing the type
  const getColor = theme.palette.type === 'light' ? darken : lighten;
  const getBackgroundColor = theme.palette.type === 'light' ? lighten : darken;

  return {
    buttonCancel: {
      boxShadow: "none",
    },
    buttonOk: {
      boxShadow: "0px 2px 2px #0000003D",
    },
    buttonRedAction: {
      boxShadow: "0px 2px 2px #0000003D",
      color: getColor("#FFFFFF", 0.0), // eslint-disable-line no-magic-numbers
      backgroundColor: getBackgroundColor(theme.palette.error[theme.palette.type], 0.0), // eslint-disable-line no-magic-numbers
      "&:hover": {
        color: getColor("#FFFFFF", 0.1), // eslint-disable-line no-magic-numbers
        backgroundColor: getBackgroundColor(theme.palette.error[theme.palette.type], 0.1), // eslint-disable-line no-magic-numbers
      },
    },
  };
};
