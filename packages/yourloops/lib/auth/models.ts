/**
 * Copyright (c) 2021, Diabeloop
 * Hook for auth API - Interface declaration
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

import { ReactNode } from "react";
import User from "./user";
import { LanguageCodes } from "../../models/locales";
import { IUser, Preferences, Profile, Settings, UserRoles } from "../../models/shoreline";
import { HcpProfession } from "../../models/hcp-profession";
import { JwtPayload } from "jwt-decode";

/** Hook internal usage */
export interface Session {
  user: User;
  sessionToken: string;
  traceToken: string;
}

export interface JwtShorelinePayload extends JwtPayload {
  role: "hcp" | "patient" | "caregiver" | "clinic";
  /** username: an e-mail */
  name: string;
  email: string;
  /** userid */
  usr: string;
  /** yes for server token - we will never have that in Blip: always "no" */
  srv: "yes" | "no";
}

export const STORAGE_KEY_SESSION_TOKEN = "session-token";
export const STORAGE_KEY_TRACE_TOKEN = "trace-token";
export const STORAGE_KEY_USER = "logged-in-user";

export interface UpdateUser {
  roles?: UserRoles[];
  password?: string;
  currentPassword?: string;
}

export interface SignupUser {
  accountUsername: string;
  accountPassword: string;
  accountRole: UserRoles;
  feedback: boolean; // Consent to be contacted by Diabeloop
  hcpProfession: HcpProfession;
  preferencesLanguage: LanguageCodes;
  privacyPolicy: boolean;
  profileCountry: string;
  profileFirstname: string;
  profileLastname: string;
  profilePhone: string;
  terms: boolean;
}

export interface AuthAPI {
  accountConfirmed: (key: string, traceToken: string) => Promise<boolean>;
  certifyProfessionalAccount: () => Promise<IUser>;
  login: (username: string, password: string, traceToken: string) => Promise<Session>;
  logout: (session: Readonly<Session>) => Promise<void>;
  refreshToken: (session: Readonly<Session>) => Promise<string>;
  requestPasswordReset: (username: string, traceToken: string, language?: string) => Promise<void>;
  resendSignup: (username: string, traceToken: string, language?: string) => Promise<boolean>;
  resetPassword: (key: string, username: string, password: string, traceToken: string) => Promise<boolean>;
  sendAccountValidation: (session: Readonly<Session>, language?: string) => Promise<boolean>;
  signup: (username: string, password: string, role: UserRoles, traceToken: string) => Promise<Session>;
  updatePreferences: (session: Readonly<Session>) => Promise<Preferences>;
  updateProfile: (session: Readonly<Session>) => Promise<Profile>;
  updateSettings: (session: Readonly<Session>) => Promise<Settings>;
  updateUser: (session: Readonly<Session>, updates: UpdateUser) => Promise<void>;
}

/**
 * The auth provider hook return values.
 */
export interface AuthContext {
  certifyProfessionalAccount: () => Promise<void>;
  flagPatient: (userId: string) => Promise<void>; // Flag or un-flag one patient
  getFlagPatients: () => string[];
  isAuthHookInitialized: boolean;
  isAuthInProgress: boolean;
  isLoggedIn: boolean;
  login: (username: string, password: string, key: string | null) => Promise<User>;
  logout: (sessionExpired?: boolean) => Promise<void>; // sessionExpired True if the call is performed for a session expired mechanism
  redirectToProfessionalAccountLogin: () => void;
  resendSignup: (username: string) => Promise<boolean>;
  resetPassword: (key: string, username: string, password: string) => Promise<boolean>;
  sendPasswordResetEmail: (username: string, language: string) => Promise<void>;
  session: () => Session | null;
  sessionToken: string | null;
  setFlagPatients: (userIds: string[]) => Promise<void>; // Set the flagged patient
  setUser: (user: User) => void; // Change the hook user, and update the storage. No API change!
  signup: (signup: SignupUser) => Promise<void>;
  switchRoleToHCP: (feedbackConsent: boolean, hcpProfession: HcpProfession) => Promise<void>; // Switch user role from caregiver to hcp
  traceToken: string | null;
  updatePassword: (currentPassword: string, password: string) => Promise<void>;
  updatePreferences: (preferences: Preferences, refresh?: boolean) => Promise<Preferences>;
  updateProfile: (profile: Profile, refresh?: boolean) => Promise<Profile>;
  updateSettings: (settings: Settings, refresh?: boolean) => Promise<Settings>;
  user: Readonly<User> | null;
}

export interface AuthProvider {
  api?: AuthAPI; // Used to test the hook
  children: ReactNode;
  value?: AuthContext; // Used for test components which need this hook
}
