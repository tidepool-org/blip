/**
 * Copyright (c) 2021, Diabeloop
 * Yourloops API client: Cookie manager
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

import _ from "lodash";
import bows from "bows";

import config from "./config";
import metrics from "./metrics";
import { zendeskAllowCookies, zendeskTrackWidgetOpen } from "./zendesk";

const log = bows("Cookies");

function acceptCookiesListener(choices: CookiesComplete): void {
  log.info("User choices:", choices);

  if (choices.matomo === true) {
    metrics.send("metrics", "enabled");
  } else {
    metrics.send("metrics", "disabled");
  }
  if (choices.stonly === true && typeof window.loadStonlyWidget === "function") {
    window.loadStonlyWidget();
  }
  if (choices.zendesk === true) {
    zendeskAllowCookies(true);
  } else {
    zendeskAllowCookies(false);
  }

  if (choices.matomo === true && choices.zendesk === true) {
    zendeskTrackWidgetOpen();
  }
}

function initCookiesConcentListener(): void {
  // eslint-disable-next-line no-underscore-dangle
  const axeptioCb = window._axcb;
  log.debug("Waiting for acceptation");
  if (config.COOKIE_BANNER_CLIENT_ID === "disabled") {
    acceptCookiesListener({ matomo: true, stonly: true, zendesk: true });
  } else if (_.isObject(axeptioCb) && _.isFunction(_.get(axeptioCb, "push"))) {
    axeptioCb.push((axeptio: AxeptIO) => {
      axeptio.on("cookies:complete", acceptCookiesListener);
    });
  } else {
    log.error("axept.io configured, but unavailable");
  }
}

export default initCookiesConcentListener;
