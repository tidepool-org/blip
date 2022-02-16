/**
 * Copyright (c) 2021, Diabeloop
 * Yourloops API client type definition for shoreline
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

import { Units } from "./generic";
import { LanguageCodes } from "./locales";
import { MedicalData } from "./device-data";
import { HcpProfession } from "./hcp-profession";

enum UserRoles {
  hcp = "hcp",
  caregiver = "caregiver",
  patient = "patient",
  /** Used only for signup-account-selector */
  unset = "unset",
  /** When the account is created but not yet confirm */
  unverified = "unverified"
}

interface Consent {
  acceptanceTimestamp?: string;
  isAccepted?: boolean;
}

interface Patient {
  birthday?: string;
  diagnosisDate?: string;
  diagnosisType?: string;
}

interface Profile {
  fullName: string;
  firstName?: string;
  lastName?: string;
  patient?: Patient;
  termsOfUse?: Consent;
  privacyPolicy?: Consent;
  contactConsent?: Consent;
  hcpProfession?: HcpProfession;
}

interface Settings {
  units?: {
    bg?: Units;
  };
  country?: string;
  a1c?: {
    date: string;
    value: string;
  };
}

interface Preferences {
  displayLanguageCode?: LanguageCodes;
  patientsStarred?: string[];
}

interface IUser {
  emails?: string[];
  readonly emailVerified?: boolean;
  frProId?: string;
  /** Main role of the user */
  readonly role: UserRoles;
  roles?: UserRoles[];
  readonly userid: string;
  readonly username: string;
  profile?: Profile | null;
  settings?: Settings | null;
  preferences?: Preferences | null;
  /** Patient medical data. undefined means not fetched, null if the fetch failed */
  medicalData?: MedicalData | null;
}

export { IUser, Profile, Settings, Preferences, Consent, UserRoles };
