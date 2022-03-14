/**
 * Copyright (c) 2021, Diabeloop
 * zendesk tests
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
import * as sinon from "sinon";

import { isZendeskActive, zendeskLogin, zendeskLogout, zendeskAllowCookies } from "../../lib/zendesk";

describe("Zendesk", () => {

  beforeEach(() => {
    delete window.zE;
    zendeskAllowCookies(false);
  });

  after(() => {
    delete window.zE;
  });

  it("should see zendesk as inactive if window.zE function is missing", () => {
    expect(isZendeskActive()).to.be.false;
  });

  it("should see zendesk as active if window.zE function is present", () => {
    window.zE = sinon.spy();
    expect(isZendeskActive()).to.be.true;
  });

  it("should completely logout the zendesk user on logout", () => {
    const s = sinon.spy();
    window.zE = s;
    zendeskLogout();
    expect(s.callCount, "callCount").to.be.equals(3);
    expect(s.getCall(0).args, "call 1").to.be.deep.equals(["webWidget", "logout"]);
    expect(s.getCall(1).args, "call 2").to.be.deep.equals(["webWidget", "clear"]);
    expect(s.getCall(2).args, "call 3").to.be.deep.equals(["webWidget", "reset"]);
  });

  it("should not ask zendesk to login if cookies are not accepted", () => {
    const s = sinon.spy();
    window.zE = s;
    zendeskLogin();
    expect(s.callCount, "callCount").to.be.equals(0);
  });

  it("should ask zendesk login if cookies are accepted", () => {
    zendeskAllowCookies(true);
    const s = sinon.spy();
    window.zE = s;
    zendeskLogin();
    expect(s.callCount, "callCount").to.be.equals(1);
    expect(s.getCall(0).args).to.be.deep.equals(["webWidget", "helpCenter:reauthenticate"]);
  });

  it("should notice zendesk about the cookies policy: accept", () => {
    const s = sinon.spy();
    window.zE = s;
    zendeskAllowCookies(true);
    expect(s.callCount, "callCount").to.be.equals(1);
    expect(s.getCall(0).args).to.be.deep.equals(["webWidget", "updateSettings", { cookies: true }]);
  });

  it("should notice zendesk about the cookies policy: decline", () => {
    const s = sinon.spy();
    window.zE = s;
    zendeskAllowCookies(false);
    expect(s.callCount, "callCount").to.be.equals(4);
    expect(s.getCall(0).args, "updateSettings").to.be.deep.equals(["webWidget", "updateSettings", { cookies: false }]);
    expect(s.getCall(1).args, "logout call 1").to.be.deep.equals(["webWidget", "logout"]);
    expect(s.getCall(2).args, "logout call 2").to.be.deep.equals(["webWidget", "clear"]);
    expect(s.getCall(3).args, "logout call 3").to.be.deep.equals(["webWidget", "reset"]);
  });
});

