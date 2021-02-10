/**
 * Copyright (c) 2021, Diabeloop
 * Hook for auth API
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

import * as React from "react";
import { User } from "models/shoreline";
import AuthApiClient from "../api";

/**
 * The auth provider hook return values.
 */
export interface IAuthContext {
  user: User | null;
  login(username: string, password: string): Promise<User>;
  logout(): void;
  signup(username: string, password: string): void;
  isLoggedIn(): boolean;
  sendPasswordResetEmail(username: string): Promise<boolean>;
}

export interface IAuthProvider {
  children?: React.ReactNode;
  provider: () => IAuthContext;
}

export const AuthContext = React.createContext({} as IAuthContext);

// Hook for child components to get the auth object
// and re-render when it changes.
export function useAuth(): IAuthContext {
  return React.useContext(AuthContext);
}

/**
 * Provider hook that creates auth object and handles state
 */
export function DefaultAuthProvider(): IAuthContext {
  const [user, setUser] = React.useState<User | null>(AuthApiClient.whoami);

  // Wrap any methods we want to use making sure
  // to save the user to state.
  const login = async (username: string, password: string): Promise<User> => {
    const user = await AuthApiClient.login(username, password);
    setUser(user);
    return user;
  };

  const signup = (username: string, password: string): void => {
    console.log("test signup", username, password);
  };

  const logout = (): void => AuthApiClient.logout();

  const isLoggedIn = (): boolean => AuthApiClient.isLoggedIn;

  const sendPasswordResetEmail = (username: string): Promise<boolean> => {
    console.log("send password reset email ", username);
    return Promise.resolve(true);
  };

  // Keep this as we don't know if we are going to need it.
  // Subscribe to user on mount
  // Because this sets state in the callback it will cause any
  // component that utilizes this hook to re-render with the
  // latest auth object.
  // useEffect(() => {
  //   const unsubscribe = firebase.auth().onAuthStateChanged(user => {
  //     if (user) {
  //       setUser(user);
  //     } else {
  //       setUser(null);
  //     }
  //   });
  //   // Cleanup subscription on unmount
  //   return () => unsubscribe();
  // }, []);

  // Return the user object and auth methods
  return {
    user,
    login,
    logout,
    signup,
    isLoggedIn,
    sendPasswordResetEmail,
  };
}

/**
 * Provider component that wraps your app and makes auth object available to any child component that calls useAuth().
 * @param props for auth provider & children
 */
export function CustomAuthProvider(props: IAuthProvider): JSX.Element {
  const { provider, children } = props;
  const auth = provider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export default CustomAuthProvider;
