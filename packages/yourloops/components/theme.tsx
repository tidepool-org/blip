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

import { createTheme, Theme } from "@material-ui/core/styles";
import { PaletteOptions } from "@material-ui/core/styles/createPalette";
import config from "../lib/config";

/** Set one and only one class for the branding in `<div id='app'>` */
export function initTheme() {
  const classList = document.getElementById("app")?.classList;
  classList?.remove(...BRANDING_LIST);
  classList?.add(config.BRANDING.replace("_","-"));

  const favIcon = document.getElementById("favicon") as HTMLAnchorElement;
  favIcon.href = `./branding_${config.BRANDING}_favicon.ico`;
}

function getCommonTheme(): PaletteOptions {
  const cssVar = (name: string): string => getComputedStyle(document.getElementById("app") as HTMLElement).getPropertyValue(name).trim();
  return {
    type: "light",
    primary: {
      main: cssVar("--color-primary-main"),
      light: cssVar("--color-primary-light"),
      dark: cssVar("--color-primary-dark"),
    },
    secondary: {
      main: cssVar("--color-secondary-main"),
      light: cssVar("--color-secondary-light"),
      dark: cssVar("--color-secondary-dark"),
    },
  };
}

export function getMainTheme() {
  return createTheme({
    overrides: {
      MuiButton: {
        root: {
          fontWeight: 600,
        },
      },
      MuiDialogActions: {
        spacing: {
          "padding": 16,
          "& > :last-child": {
            marginLeft: 16,
          },
        },
      },
    },
    palette: {
      ...getCommonTheme(),
      background: { default: "#FFFFFF" },
    },
  });
}

export function getExternalTheme() {
  return createTheme({
    palette: {
      ...getCommonTheme(),
      background: { default: "#F7F7F8" },
    },
  });
}

/**
 * For some reason, return makeStyle(...) here don't work with our theme
 * @param theme Main theme
 * @returns The styles for buttons
 */
export const makeButtonsStyles = (theme: Theme) => ({
  alertActionButton: {
    "color": theme.palette.common.white,
    "backgroundColor": theme.palette.error.main,
    "&:hover": {
      backgroundColor: theme.palette.error.dark,
    },
  },
});
