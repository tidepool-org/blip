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
import User from "./auth/user";

type VariableScope = "page" | "visit";

const log = bows("Metrics");
const customVariables = {
  page: new Map<string, number>(),
  visit: new Map<string, number>(),
};
let metricsEnabled = false;
let currentMetricsURL = "/";

const logDisabledMetricsConfiguration = _.once(() => {
  log.info("Metrics service is disabled by configuration");
});

const logUnknownMetricsConfiguration = _.once(() => {
  log.error("Unknown metrics service", config.METRICS_SERVICE);
});

const logWrongMetricsConfiguration = _.once(() => {
  log.error("Matomo do not seems to be available, wrong configuration");
});

function getVariableId(name: string, scope: VariableScope): {id: number, found: boolean } {
  let id = 1;
  let found = false;
  if (customVariables[scope].has(name)) {
    id = customVariables[scope].get(name) as number;
    found = true;
  } else {
    const ids = Array.from(customVariables[scope].values());
    while (ids.includes(id)) id++;
  }
  return { id, found };
}

/**
 * Verification to be sure we don't crash, since we will have
 * this method called on the Javascript part too
 */
function checkParameters(category: string, action: string, name?: string, value?: number): boolean {
  if (_.isString(category) && _.isString(action)) {
    if ((_.isUndefined(name) || _.isString(name)) && (_.isUndefined(value) || _.isFinite(value))) {
      return true;
    }
  }
  log.error("Invalid parameters");
  return false;
}

function sendMatomoMetrics(category: string, action: string, name?: string, value?: number): void {
  const matomoPaq: unknown[] | undefined = window._paq;
  if (!_.isObject(matomoPaq)) {
    logWrongMetricsConfiguration();
    return;
  }

  if (category === "metrics") {
    switch (action) {
    case "enabled":
      matomoPaq.push(["setConsentGiven"]);
      // Do it another time, since only one time seems to not be always enough:
      matomoPaq.push(["setConsentGiven"]);
      // Clear the do not track default check
      matomoPaq.push(["setDoNotTrack", false]);
      matomoPaq.push(["setDomains", config.DOMAIN_NAME ?? window.location.hostname]);
      matomoPaq.push(["trackAllContentImpressions"]);
      matomoPaq.push(["enableLinkTracking"]);
      break;
    case "disabled":
      matomoPaq.push(["forgetConsentGiven"]);
      matomoPaq.push(["setDoNotTrack", true]);
      break;
    case "setCustomUrl":
      if (_.isString(name)) {
        matomoPaq.push(["setCustomUrl", name]);
        currentMetricsURL = name;
      } else {
        log.error("setCustomUrl: Missing URL");
      }
      break;
    case "setDocumentTitle":
      if (_.isString(name)) {
        matomoPaq.push(["setDocumentTitle", name]);
      } else {
        log.error("setDocumentTitle: Missing title");
      }
      break;
    case "trackPageView":
      matomoPaq.push(["trackPageView"]);
      break;
    default:
      log.error("Invalid action", action);
      break;
    }
    return;
  }

  if (category === "trackSiteSearch") {
    matomoPaq.push(["trackSiteSearch", action, name, value]);
    return;
  }

  if (!checkParameters(category, action, name, value)) {
    return;
  }

  const trackEvent: (string|number)[] = ["trackEvent", category, action];
  if (_.isString(name)) {
    trackEvent.push(name);
    if (_.isNumber(value) && _.isFinite(value)) {
      // isFinite() should be enough, but typescript don't recognize it (yet?)
      trackEvent.push(value);
    }
  }
  matomoPaq.push(trackEvent);
}

const timers = new Map<string, number>();
const metrics = {
  /**
   * Record something for the tracking metrics
   * @param {string} category Event category
   * @param {string} action Event action
   * @param {string} name Event name
   * @param {number} value optional value
   */
  send: (category: string, action: string, name?: string, value?: number): void => {
    log.info({ category, action, name, value });

    if (category === "metrics" && (action === "enabled" || action === "disabled")) {
      metricsEnabled = action === "enabled";
      log.info("metricsEnabled", metricsEnabled);
    } else if (!metricsEnabled) {
      return;
    }

    switch (config.METRICS_SERVICE) {
    case "matomo":
      sendMatomoMetrics(category, action, name as string, value);
      break;
    case "disabled":
      logDisabledMetricsConfiguration();
      break;
    default:
      logUnknownMetricsConfiguration();
    }
  },
  setVariable: (name: string, value: string, scope: VariableScope = "page"): void => {
    const matomoPaq: unknown[] | undefined = window._paq;
    const { id, found } = getVariableId(name, scope);
    if (!found) {
      customVariables[scope].set(name, id);
    }
    if (config.METRICS_SERVICE === "matomo" && _.isObject(matomoPaq)) {
      matomoPaq.push(["setCustomVariable", id, name, value, scope]);
    }
  },
  deleteVariable: (name: string, scope: VariableScope = "page"): void => {
    const matomoPaq: unknown[] | undefined = window._paq;
    const { id, found } = getVariableId(name, scope);
    if (!found) {
      log.warn(`Variable ${name} / ${scope} do not exists`);
      return;
    }
    customVariables[scope].delete(name);
    if (config.METRICS_SERVICE === "matomo" && _.isObject(matomoPaq)) {
      matomoPaq.push(["deleteCustomVariable", id, scope]);
    }
  },
  setUser: (user: User): void => {
    const matomoPaq: unknown[] | undefined = window._paq;
    if (config.METRICS_SERVICE === "matomo" && _.isObject(matomoPaq)) {
      matomoPaq.push(["setUserId", user.userid]);
      metrics.setVariable("UserRole", user.role);
      matomoPaq.push(["trackEvent", "registration", "login", user.role]);
    }
  },
  resetUser: (): void => {
    const matomoPaq: unknown[] | undefined = window._paq;
    if (config.METRICS_SERVICE === "matomo" && _.isObject(matomoPaq)) {
      matomoPaq.push(["trackEvent", "registration", "logout"]);
      metrics.deleteVariable("UserRole");
      matomoPaq.push(["resetUserId"]);
      matomoPaq.push(["deleteCookies"]); // Reset visitor id
    }
  },
  setLanguage: (language: string): void => {
    const matomoPaq: unknown[] | undefined = window._paq;
    if (config.METRICS_SERVICE === "matomo" && _.isObject(matomoPaq)) {
      metrics.setVariable("UserLang", language, "visit");
    }
  },
  startTimer: (name: string): void => {
    timers.set(name, Date.now());
  },
  endTimer: (name: string): void => {
    const startTime = timers.get(name);
    if (_.isNumber(startTime)) {
      timers.delete(name);
      const duration = Date.now() - startTime;
      metrics.send("performance", name, currentMetricsURL, Math.round(duration / 100) / 10);
    }
  },
};

export default metrics;
