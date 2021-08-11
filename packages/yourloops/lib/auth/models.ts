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

import User from "./user";
import { LanguageCodes } from "../../models/locales";
import { Preferences, Profile, Settings, UserRoles } from "../../models/shoreline";

/** Hook internal usage */
export interface Session {
  user: User;
  sessionToken: string;
  traceToken: string;
}

export interface UpdateUser {
  roles?: UserRoles[];
  password?: string;
  currentPassword?: string;
}

export interface SignupUser {
  accountUsername: string;
  accountPassword: string;
  accountRole: UserRoles;
  profileFirstname: string;
  profileLastname: string;
  profileCountry: string;
  profilePhone: string;
  preferencesLanguage: LanguageCodes;
  terms: boolean;
  privacyPolicy: boolean;
}

export interface AuthAPI {
  login: (username: string, password: string, traceToken: string) => Promise<Session>;
  requestPasswordReset: (username: string, traceToken: string, language?: string, info?: boolean) => Promise<void>;
  resetPassword: (key: string, username: string, password: string, traceToken: string) => Promise<boolean>;
  signup: (username: string, password: string, role: UserRoles, traceToken: string) => Promise<Session>;
  sendAccountValidation: (session: Readonly<Session>, language?: string) => Promise<boolean>;
  accountConfirmed: (key: string, traceToken: string) => Promise<boolean>;
  updateProfile: (session: Readonly<Session>) => Promise<Profile>;
  updatePreferences: (session: Readonly<Session>) => Promise<Preferences>;
  updateSettings: (session: Readonly<Session>) => Promise<Settings>;
  updateUser: (session: Readonly<Session>, updates: UpdateUser) => Promise<void>;
  refreshToken: (session: Readonly<Session>) => Promise<string>;
  logout: (session: Readonly<Session>) => Promise<void>;
}

/**
 * The auth provider hook return values.
 */
export interface AuthContext {
  user: Readonly<User> | null;
  sessionToken: string | null;
  traceToken: string | null;
  initialized: () => boolean;
  session: () => Session | null;
  /** Change the hook user, and update the storage. No API change! */
  setUser: (user: User) => void;
  login: (username: string, password: string, key: string | null) => Promise<User>;
  logout: () => Promise<void>;
  /** Update current user preferences */
  updatePreferences: (preferences: Preferences, refresh?: boolean) => Promise<Preferences>;
  /** Update current user profile */
  updateProfile: (profile: Profile, refresh?: boolean) => Promise<Profile>;
  /** Update current user settings */
  updateSettings: (settings: Settings, refresh?: boolean) => Promise<Settings>;
  /** Update current user password */
  updatePassword: (currentPassword: string, password: string) => Promise<void>;
  signup: (signup: SignupUser) => Promise<void>;
  isLoggedIn: () => boolean;
  sendPasswordResetEmail: (username: string, language: string) => Promise<void>;
  resetPassword: (key: string, username: string, password: string) => Promise<boolean>;
  /** Flag or un-flag one patient */
  flagPatient: (userId: string) => Promise<void>;
  /** Set the flagged patient */
  setFlagPatients: (userIds: string[]) => Promise<void>;
  getFlagPatients: () => string[];
  /** Switch user role from caregiver to hcp */
  switchRoleToHCP: () => Promise<void>;
}

export interface AuthProvider {
  children: React.ReactNode;
  /** Used to test the hook */
  api?: AuthAPI;
  /** Used for test components which need this hook */
  value?: AuthContext;
}
