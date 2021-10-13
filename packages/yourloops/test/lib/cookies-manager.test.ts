/**
 * Copyright (c) 2021, Diabeloop
 * cookies-manager tests
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

/* eslint-disable no-underscore-dangle */

import * as sinon from "sinon";
import { expect } from "chai";

import config from "../../lib/config";
import metrics from "../../lib/metrics";
import { isZendeskAllowCookies } from "../../lib/zendesk";
import initCookiesConcentListener from "../../lib/cookies-manager";

type AxceptIOCallback = (a: AxeptIO) => void;

function testCookiesManager(): void {
  let sendMetrics: sinon.SinonSpy;
  let loadStonlyWidget: sinon.SinonSpy;
  before(() => {
    sendMetrics = sinon.spy(metrics, "send");
    // For some reason, it do not work:
    // zendeskAllowCookies = sinon.spy(zendesk, "zendeskAllowCookies");
    loadStonlyWidget = sinon.spy();
    window.loadStonlyWidget = loadStonlyWidget;
  });
  after(() => {
    sinon.restore();
    delete window.loadStonlyWidget;
  });
  afterEach(() => {
    sinon.resetHistory();
  });

  it("should do nothing if axeptio is not available", () => {
    window._axcb = undefined;
    config.COOKIE_BANNER_CLIENT_ID = "ok";
    initCookiesConcentListener();
    expect(sendMetrics.called, "sendMetrics").to.be.false;
  });

  it("should accept all if axeptio is disabled", () => {
    config.COOKIE_BANNER_CLIENT_ID = "disabled";
    initCookiesConcentListener();
    expect((window.loadStonlyWidget as sinon.SinonSpy).calledOnce, "loadStonlyWidget").to.be.true;
    expect(sendMetrics.calledOnce, "sendMetrics.calledOnce").to.be.true;
    expect(sendMetrics.calledWith("metrics", "enabled"), "sendMetrics.calledWith").to.be.true;
    expect(isZendeskAllowCookies(), "zendeskAllowCookies").to.be.true;
  });

  it("should add the axeptio callback when configuration is set", () => {
    const pushSpy = sinon.spy();
    window._axcb = { push: pushSpy };
    config.COOKIE_BANNER_CLIENT_ID = "abcdef";
    initCookiesConcentListener();
    expect(pushSpy.calledOnce).to.be.true;
  });

  it("should perform the change on axeptio callback", () => {
    let callbackFn: AxceptIOCallback | null = null;
    const axeptIO: AxeptIO = {
      on: (event: string, callback: (c: CookiesComplete) => void) => {
        expect(event).to.be.equals("cookies:complete");
        callback({ matomo: false, stonly: false, zendesk: false });
      },
    };
    window._axcb = {
      push: (f: AxceptIOCallback) => {
        callbackFn = f;
      },
    };

    config.COOKIE_BANNER_CLIENT_ID = "abcdef";
    initCookiesConcentListener();
    expect(callbackFn).to.be.a("function");
    (callbackFn as unknown as AxceptIOCallback)(axeptIO);

    expect(sendMetrics.calledOnce, "sendMetrics.calledOnce").to.be.true;
    expect(sendMetrics.calledWith("metrics", "disabled"), "sendMetrics.calledWith").to.be.true;
    expect((window.loadStonlyWidget as sinon.SinonSpy).calledOnce, "loadStonlyWidget").to.be.false;
    expect(isZendeskAllowCookies(), "zendeskAllowCookies").to.be.false;
  });
}

export default testCookiesManager;
