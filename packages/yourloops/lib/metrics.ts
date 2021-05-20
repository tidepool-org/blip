/**
 * Copyright (c) 2021, Diabeloop
 * Yourloops API client: Metrics
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

const log = bows("Metrics");
let metricsEnabled = false;

const logDisabledMetricsConfiguration = _.once(() => {
  log.info("Metrics service is disabled by configuration");
});

const logUnknownMetricsConfiguration = _.once(() => {
  log.error("Unknown metrics service", config.METRICS_SERVICE);
});

const logWrongMetricsConfiguration = _.once(() => {
  log.error("Matomo do not seems to be available, wrong configuration");
});

/**
 * Record something for the tracking metrics
 * @param {string} eventName the text to send
 * @param {any=} properties optional parameter
 */
function sendMetrics(eventName: string, properties?: unknown): void {
  let matomoPaq: unknown[] | null = null;
  log.info(eventName, properties);

  if (eventName === "metrics") {
    metricsEnabled = config.METRICS_FORCED || _.get(properties, "enabled", false) as boolean;
  } else if (!metricsEnabled) {
    return;
  }

  switch (config.METRICS_SERVICE) {
  case "matomo":
    matomoPaq = window._paq;
    if (!_.isObject(matomoPaq)) {
      logWrongMetricsConfiguration();
      return;
    }
    if (eventName === "metrics") {
      if (metricsEnabled) {
        matomoPaq.push(["setConsentGiven"]);
        // Do it another time, since only one time seems to not be always enough:
        matomoPaq.push(["setConsentGiven"]);
        // Clear the do not track default check
        matomoPaq.push(['setDoNotTrack', false]);
      } else {
        window._paq.push(['forgetConsentGiven']);
        matomoPaq.push(['setDoNotTrack', true]);
      }
    } else if (eventName === "setCustomUrl") {
      matomoPaq.push(["setCustomUrl", properties]);
    } else if (eventName === "setUserId") {
      matomoPaq.push(["setUserId", properties]);
    } else if (eventName === "resetUserId") {
      matomoPaq.push(["resetUserId"]);
    } else if (eventName === "setDocumentTitle" && typeof properties === "string") {
      matomoPaq.push(["setDocumentTitle", properties]);
    } else if (typeof properties === "undefined") {
      matomoPaq.push(["trackEvent", eventName, "n/a"]);
    } else {
      matomoPaq.push(["trackEvent", eventName, JSON.stringify(properties)]);
    }
    break;
  case "disabled":
    logDisabledMetricsConfiguration();
    break;
  default:
    logUnknownMetricsConfiguration();
  }
}

export default sendMetrics;
