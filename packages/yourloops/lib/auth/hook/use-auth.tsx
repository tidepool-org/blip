/**
 * Copyright (c) 2021, Diabeloop
 * Hook for auth API
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */
import * as React from "react";
import { User } from "models/shoreline";
import AuthApiClient from "../api";

interface IAuthContext {
  user: User | null,
  login(username: string , password: string): Promise<User>,
  logout(): void,
  signup(username: string , password: string): void,
  isLoggedIn(): boolean,
  sendPasswordResetEmail(username: string): Promise<boolean>,
}

export const AuthContext = React.createContext({} as IAuthContext);

// Hook for child components to get the auth object
// and re-render when it changes.
export function useAuth() : IAuthContext {
  return React.useContext(AuthContext);
}

// Provider component that wraps your app and makes auth object
// available to any child component that calls useAuth().
// eslint-disable-next-line react/prop-types
export const AuthProvider: React.FC<React.ReactNode> = ({ children }) => {
  const auth = useProvideAuth();
  return (
    <AuthContext.Provider value={ auth }>
      { children }
    </AuthContext.Provider>
  );
};

// Provider hook that creates auth object and handles state
function useProvideAuth() {
  const [user, setUser] = React.useState<User | null>(AuthApiClient.whoami);

  // Wrap any methods we want to use making sure
  // to save the user to state.
  const login = async (username: string, password: string): Promise<User> => {
    const user = await AuthApiClient.login(username, password);
    setUser(user);
    return user;
  };

  const signup = (username: string, password: string): void => {
    console.log('test signup', username, password);
  };

  const logout = (): void => AuthApiClient.logout();

  const isLoggedIn = () : boolean => AuthApiClient.isLoggedIn;

  const sendPasswordResetEmail = (username: string) : Promise<boolean> => {
    console.log("send password reset email ",username);
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
