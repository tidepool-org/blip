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
import sendMetrics from "../../lib/metrics";

function testMetrics(): void {
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
    sendMetrics("metrics", { enabled: true });
    expect(window._paq).to.be.undefined;
  });

  it("should disable the metrics", () => {
    sendMetrics("metrics", { enabled: false });
    sendMetrics("test", { value: "you should not see me" });
    expect(window._paq).to.be.deep.equals([
      ["forgetConsentGiven"],
      ["setDoNotTrack", true],
    ]);
  });

  it("should enable the metrics", () => {
    sendMetrics("metrics", { enabled: true });
    sendMetrics("test", { value: "you should see me" });
    expect(window._paq.length).to.be.equals(4);
  });

  it("should update matomo page URL", () => {
    sendMetrics("setCustomUrl", location.pathname);
    expect(window._paq.length).to.be.equals(1);
    expect(window._paq[0][0]).to.be.equals("setCustomUrl");
    expect(window._paq[0][1]).to.be.a("string");
  });

  it("should set the userId", () => {
    sendMetrics("setUserId", "abcdef");
    expect(window._paq).to.be.deep.equals([["setUserId", "abcdef"]]);
  });

  it("should reset the userId", () => {
    sendMetrics("resetUserId");
    expect(window._paq).to.be.deep.equals([["resetUserId"]]);
  });

  it("should set the setDocumentTitle", () => {
    sendMetrics("setDocumentTitle", "title");
    expect(window._paq).to.be.deep.equals([["setDocumentTitle", "title"]]);
  });

  it("should set the properties to a default value", () => {
    sendMetrics("test");
    expect(window._paq).to.be.deep.equals([["trackEvent", "test", "n/a"]]);
  });
}

export default testMetrics;
