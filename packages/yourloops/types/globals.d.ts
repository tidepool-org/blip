/**
 * Copyright (c) 2021, Diabeloop
 * Module declaration for global objects
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { AppConfig } from "../models/config";

declare global {
  interface CookiesComplete {
    zendesk?: boolean;
    matomo?: boolean;
    stonly?: boolean;
  }
  interface AxeptIO {
    on: (event: string, callback: (c: CookiesComplete) => void) => void;
  }

  // var window: Window & typeof globalThis & ExtendedWindow;
  interface Window {
    startLoadingTime?: number;
    _jipt: any; // Zendesk
    _paq?: (string|number)[][]; // Matomo
    process: any;
    config?: AppConfig;
    _axcb?: { // Axeptio
      push: (f: (a: AxeptIO) => void) => void;
    };
    /** Display the Axeptio cookie banner */
    openAxeptioCookies?: () => void;
    loadStonlyWidget?: () => void;
    zE: (...args: any) => void; // Zendesk API
    cleanBlipReduxStore?: () => void;
    /** If the application crash, stop the session timeout timers */
    clearSessionTimeout?: () => void;
  }
  interface Navigator {
    userLanguage?: string;
  }
  const BUILD_CONFIG: string;
  const BRANDING_LIST: string[];
}
