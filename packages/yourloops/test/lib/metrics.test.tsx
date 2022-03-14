/**
 * Copyright (c) 2021, Diabeloop
 * metrics tests
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

import { expect } from "chai";

import config from "../../lib/config";
import metrics from "../../lib/metrics";
import { loggedInUsers } from "../common/index";

describe("Metrics", () => {
  after(() => {
    delete window._paq;
    config.METRICS_SERVICE = "disabled";
  });
  beforeEach(() => {
    config.METRICS_SERVICE = "matomo";
    window._paq = [];
  });

  it("should do nothing if metrics is not available", () => {
    delete window._paq;
    metrics.send("metrics", "enabled");
    expect(window._paq).to.be.undefined;
  });

  it("should disable the metrics", () => {
    metrics.send("metrics", "disabled");
    metrics.send("test", "you should not see me");
    expect(window._paq).to.be.deep.equals([
      ["forgetConsentGiven"],
      ["setDoNotTrack", true],
    ]);
  });

  it("should enable the metrics", () => {
    metrics.send("metrics", "enabled");
    metrics.send("test", "you should see me");
    expect(window._paq).to.be.an("array");
    if (window._paq) { // Make typescript happy
      // eslint-disable-next-line no-magic-numbers
      expect(window._paq.length).to.be.equals(7);
    }
  });

  it("should update matomo page URL", () => {
    metrics.send("metrics", "setCustomUrl", location.pathname);
    expect(window._paq).to.be.an("array");
    if (window._paq) { // Make typescript happy
      expect(window._paq.length).to.be.equals(1);
      expect(window._paq[0].length).to.be.equals(2);
      expect(window._paq[0][0]).to.be.equals("setCustomUrl");
      expect(window._paq[0][1]).to.be.a("string");
    }
  });

  it("should set trackPageView", () => {
    metrics.send("metrics", "trackPageView");
    expect(window._paq.length).to.be.equals(1);
    expect(window._paq[0].length).to.be.equals(1);
    expect(window._paq[0][0]).to.be.equals("trackPageView");
  });

  it("trackSiteSearch should have a specific call", () => {
    metrics.send("trackSiteSearch", "action", "value", 2);
    expect(window._paq.length).to.be.equals(1);
    expect(window._paq[0].length).to.be.equals(4);
    expect(window._paq[0][0]).to.be.equals("trackSiteSearch");
    expect(window._paq[0][1]).to.be.equals("action");
    expect(window._paq[0][2]).to.be.equals("value");
    expect(window._paq[0][3]).to.be.equals(2);
  });

  it("should set the userId", () => {
    const user = loggedInUsers.caregiver;
    metrics.setUser(user);
    expect(window._paq, JSON.stringify(window._paq)).to.be.deep.equals([
      ["setUserId", user.userid],
      ["setCustomVariable", 1, "UserRole", user.role, "page"],
      ["trackEvent", "registration", "login", user.role],
    ]);
  });

  it("should reset the userId", () => {
    metrics.resetUser();
    expect(window._paq, JSON.stringify(window._paq)).to.be.deep.equals([
      ["trackEvent", "registration", "logout"],
      ["deleteCustomVariable", 1, "page"],
      ["resetUserId"],
      ["deleteCookies"],
    ]);
  });

  it("should set the setDocumentTitle", () => {
    metrics.send("metrics", "setDocumentTitle", "title");
    expect(window._paq).to.be.deep.equals([["setDocumentTitle", "title"]]);
  });

  it("should set the properties to a default value", () => {
    metrics.send("test_category", "test_action", "test_name", 2);
    expect(window._paq).to.be.deep.equals([["trackEvent", "test_category", "test_action", "test_name", 2]]);
  });

  it("should set the global language var", () => {
    metrics.setLanguage("de");
    expect(window._paq).to.be.deep.equals([["setCustomVariable", 1, "UserLang", "de", "visit"]]);
  });

  it("should measure performance with the timer functions", () => {
    metrics.startTimer("test");
    metrics.endTimer("test");
    expect(window._paq.length).to.be.equals(1);
    expect(window._paq[0].length).to.be.equals(5);
    expect(window._paq[0][0]).to.be.equals("trackEvent");
    expect(window._paq[0][1]).to.be.equals("performance");
    expect(window._paq[0][2]).to.be.equals("test");
    expect(window._paq[0][3]).to.be.a("string").matches(/\/.*/);
    expect(window._paq[0][4]).to.be.greaterThanOrEqual(0);
  });
});

