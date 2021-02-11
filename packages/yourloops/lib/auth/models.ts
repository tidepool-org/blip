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

import { User, Preferences, Profile, Settings } from "../../models/shoreline";

/** Hook internal usage */
export interface Session {
  user: User;
  sessionToken: string;
  traceToken: string;
}

export interface AuthAPI {
  login: (username: string, password: string, traceToken: string) => Promise<Session>;
  updateProfile: (auth: Readonly<Session>) => Promise<Profile>;
  updatePreferences: (auth: Readonly<Session>) => Promise<Preferences>;
  updateSettings: (auth: Readonly<Session>) => Promise<Settings>;
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
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  updateProfile: (user: Readonly<User>) => Promise<Profile>;
  updatePreferences: (user: Readonly<User>) => Promise<Preferences>;
  updateSettings: (user: Readonly<User>) => Promise<Settings>;
  signup: (username: string, password: string) => void;
  isLoggedIn: () => boolean;
  sendPasswordResetEmail: (username: string) => Promise<boolean>;
  /** Flag or un-flag one patient */
  flagPatient: (userId: string) => Promise<void>;
  /** Set the flagged patient */
  setFlagPatients: (userIds: string[]) => Promise<void>;
  getFlagPatients: () => string[];
}

export interface AuthProvider {
  children: React.ReactNode;
  /** Used to test the hook */
  api?: AuthAPI;
  /** Used for test components which need this hook */
  value?: AuthContext;
}
