/**
 * Copyright (c) 2021, Diabeloop
 * User class tests
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

import { UserRoles } from "../../../models/shoreline";
import config from "../../../lib/config";
import User from "../../../lib/auth/user";


describe("User", () => {

  before(() => {
    config.LATEST_TERMS = "2021-01-01";
  });

  it("should create the user", () => {
    const user = new User({ userid: "abcd", username: "text@example.com", role: UserRoles.unverified });
    expect(user.userid).to.be.equals("abcd");
    expect(user.username).to.be.equals("text@example.com");
    expect(user.latestConsentChangeDate).to.be.instanceOf(Date);
    expect(user.latestConsentChangeDate.toISOString()).to.be.equals("2021-01-01T00:00:00.000Z");
  });

  it("getFirstName", () => {
    const user = new User({ userid: "abcd", username: "text@example.com", role: UserRoles.unverified });
    expect(user.firstName).to.be.equals("");
    user.profile = {
      fullName: "Hello",
      firstName: "Test",
      lastName: "Example",
    };
    expect(user.firstName).to.be.equals("Test");
  });


  it("getLastName", () => {
    const user = new User({ userid: "abcd", username: "text@example.com", role: UserRoles.unverified });
    expect(user.lastName).to.be.equals("text@example.com");
    user.profile = {
      fullName: "Hello World",
      firstName: "Test",
    };
    expect(user.lastName).to.be.equals("Hello World");
    user.profile = {
      fullName: "Hello World",
      firstName: "Test",
      lastName: "Example",
    };
    expect(user.lastName).to.be.equals("Example");
  });

  it("shouldAcceptConsent", () => {
    const user = new User({ userid: "abcd", username: "text@example.com", role: UserRoles.unverified });
    expect(user.shouldAcceptConsent(), "no profile").to.be.true;
    user.profile = {
      fullName: "Test Example",
      termsOfUse: {},
    };
    expect(user.shouldAcceptConsent(), "termsOfUse empty").to.be.true;
    user.profile.termsOfUse.isAccepted = false;
    expect(user.shouldAcceptConsent(), "termsOfUse false").to.be.true;
    user.profile.termsOfUse.isAccepted = true;
    expect(user.shouldAcceptConsent(), "privacyPolicy missing").to.be.true;
    user.profile.privacyPolicy = {};
    expect(user.shouldAcceptConsent(), "privacyPolicy empty").to.be.true;
    user.profile.privacyPolicy.isAccepted = false;
    expect(user.shouldAcceptConsent(), "privacyPolicy false").to.be.true;
    user.profile.privacyPolicy.isAccepted = true;
    expect(user.shouldAcceptConsent(), "termsOfUse true, isAccepted true").to.be.false;
  });

  it("shouldRenewConsent", () => {
    const user = new User({ userid: "abcd", username: "text@example.com", role: UserRoles.unverified });
    expect(user.shouldRenewConsent(), "no profile").to.be.true;
    user.profile = {
      fullName: "Test Example",
    };
    expect(user.shouldRenewConsent(), "no consent").to.be.true;
    user.profile.termsOfUse = null;
    expect(user.shouldRenewConsent(), "termsOfUse null").to.be.true;
    user.profile.termsOfUse = {};
    expect(user.shouldRenewConsent(), "no privacyPolicy").to.be.true;
    user.profile.privacyPolicy = null;
    expect(user.shouldRenewConsent(), "privacyPolicy null").to.be.true;
    user.profile.privacyPolicy = {};
    expect(user.shouldRenewConsent(), "termsOfUse empty / privacyPolicy empty").to.be.true;
    user.profile.termsOfUse.acceptanceTimestamp = "an invalid string date";
    expect(user.shouldRenewConsent(), "termsOfUse invalid / privacyPolicy empty").to.be.true;
    user.profile.termsOfUse.acceptanceTimestamp = "2020-12-01";
    expect(user.shouldRenewConsent(), "termsOfUse before / privacyPolicy empty").to.be.true;
    user.profile.termsOfUse.acceptanceTimestamp = "2021-01-02";
    user.profile.privacyPolicy.acceptanceTimestamp = "2020-12-01";
    expect(user.shouldRenewConsent(), "termsOfUse after / privacyPolicy before").to.be.true;
    user.profile.privacyPolicy.acceptanceTimestamp = "2021-01-02";
    expect(user.shouldRenewConsent(), "termsOfUse after / privacyPolicy after").to.be.false;
  });

  it("getHomePage", () => {
    const user = new User({ userid: "abcd", username: "text@example.com", role: UserRoles.unverified });
    expect(user.getHomePage(), "/").to.be.equals("/");
    expect(user.getHomePage("/suffix"), "/suffix").to.be.equals("/suffix");
    user.role = UserRoles.caregiver;
    expect(user.getHomePage(), "/caregiver").to.be.equals("/caregiver");
    expect(user.getHomePage("/suffix"), "/caregiver/suffix").to.be.equals("/caregiver/suffix");
    user.role = UserRoles.hcp;
    expect(user.getHomePage(), "/professional").to.be.equals("/professional");
    expect(user.getHomePage("suffix"), "/professional/suffix").to.be.equals("/professional/suffix");
    user.role = UserRoles.patient;
    expect(user.getHomePage(), "/patient/abcd").to.be.equals("/patient/abcd");
    expect(user.getHomePage("//suffix"), "/patient/abcd/suffix").to.be.equals("/patient/abcd/suffix");
  });

  it("getParsedFrProId should return null when user frProId is null", () => {
    const user = new User({ frProId: null } as User);
    const res = user.getParsedFrProId();
    expect(res).to.be.null;
  });

  it("getParsedFrProId should return correct result when user frProId is not null", () => {
    const expectedRes = "value";
    const frProId = `key:uid:${expectedRes}`;
    const user = new User({ frProId } as User);
    const actualRes = user.getParsedFrProId();
    expect(actualRes).to.be.equal(expectedRes);
  });
});

