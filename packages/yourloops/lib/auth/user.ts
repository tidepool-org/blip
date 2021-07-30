/**
 * Copyright (c) 2021, Diabeloop
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

import { MedicalData } from "../../models/device-data";
import { IUser, Preferences, Profile, Settings, Consent, UserRoles } from "../../models/shoreline";
import config from "../config";

const urlPrefixFromUserRole = {
  patient: "/patient",
  hcp: "/professional",
  caregiver: "/caregiver",
};

class User implements IUser {
  userid: string;
  username: string;
  role!: UserRoles;
  emails?: string[];
  emailVerified?: boolean;
  profile?: Profile | null;
  settings?: Settings | null;
  preferences?: Preferences | null;
  medicalData?: MedicalData | null;
  latestConsentChangeDate: Date;

  constructor(id: string, name: string) {
    this.userid = id;
    this.username = name;
    this.latestConsentChangeDate = new Date(0);
    if (config.LATEST_TERMS !== undefined) {
      this.latestConsentChangeDate = new Date(config.LATEST_TERMS);
    }
  }

  /**
   * Return the user first name
   */
  getFirstName(): string {
    return this.profile?.firstName ?? "";
  }

  /**
   * Return the user last name
   */
  getLastName(): string {
    return this.profile?.lastName ?? this.profile?.fullName ?? this.username;
  }

  /**
   * Check If the user should accept is consent at a first login.
   * @description the first login is determined by null consents object
   */
  shouldAcceptConsent(): boolean {
    return !(this.profile?.termsOfUse?.isAccepted === true && this.profile.privacyPolicy?.isAccepted === true);
  }

  /**
   * Check If the user should renew is consent.
   */
  shouldRenewConsent(): boolean {
    if (this.profile?.termsOfUse === undefined || this.profile.termsOfUse === null) {
      return true;
    }

    if (this.profile.privacyPolicy === undefined || this.profile.privacyPolicy === null) {
      return true;
    }

    return (
      this.checkConsent(this.profile.termsOfUse) || this.checkConsent(this.profile.privacyPolicy)
    );
  }

  /**
   * Check the given consent against the lastest consent publication date
   * @param consent
   * @returns true if the lastest consent date is greater than the given consent
   */
  checkConsent(consent: Consent): boolean {
    if (typeof consent.acceptanceTimestamp === "string") {
      // A `null` is fine here, because `new Date(null).valueOf() === 0`
      const acceptDate = new Date(consent.acceptanceTimestamp);
      if (!Number.isFinite(acceptDate.getTime())) {
        // if acceptDate is not a valid formatted date string, get user to re-accept terms
        return true;
      }

      return this.latestConsentChangeDate >= acceptDate;
    }

    return true;
  }

  getHomePage(suffix?: string): string {
    let path = "/";
    switch (this.role) {
    case UserRoles.caregiver:
      path = urlPrefixFromUserRole.caregiver;
      break;
    case UserRoles.hcp:
      path = urlPrefixFromUserRole.hcp;
      break;
    case UserRoles.patient:
      path = `${urlPrefixFromUserRole.patient}/${this.userid}`;
      break;
    }
    if (suffix) {
      path = `/${path}/${suffix}`;
      path = path.replace(/\/+/g, "/");
    }
    return path;
  }
}

export default User;
