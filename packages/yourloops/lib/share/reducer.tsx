/**
 * Copyright (c) 2021, Diabeloop
 * Direct patient / caregivers share reducer
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
// import bows from "bows";

// import { UserInvitationStatus } from "../../models/generic";
import { ShareUser } from "./models";
import { Session } from "../auth";
import API from "./api";

export interface SharedUsersContext {
  sharedUsers: ShareUser[] | null;
  session: Session | null;
  errorMessage: string | null;
}

export type SharedUsersActions =
  | { type: "reset"; }
  | { type: "set-users"; sharedUsers: ShareUser[]; }
  | { type: "set-session"; session: Session; }
  | { type: "set-error"; message: string | null; }
  | { type: "add"; email: string; }
  | { type: "remove"; userId: string; };

export type SharedUserReducer = (state: SharedUsersContext, action: SharedUsersActions) => SharedUsersContext;
type SharedUserContext = [SharedUsersContext, React.Dispatch<SharedUsersActions>];
export interface SharedUsersProvider {
  value: SharedUserContext;
  children: React.ReactNode;
}


export const sharedUserInitialState: SharedUsersContext = {
  sharedUsers: null,
  session: null,
  errorMessage: null,
};
export const SharedUsersReactContext = React.createContext<SharedUserContext>([sharedUserInitialState, () => sharedUserInitialState] as SharedUserContext);

export const sharedUserReducer: SharedUserReducer = (state: SharedUsersContext, action: SharedUsersActions): SharedUsersContext => {
  switch (action.type) {
  case "reset":
    return sharedUserInitialState;
  case "set-users":
    return { ...state, sharedUsers: action.sharedUsers };
  case "set-session":
    return { ...state, session: action.session };
  case "set-error":
    return { ...state, errorMessage: action.message };
  case "add":
    if (state.session === null || state.sharedUsers === null) {
      return { ...state, errorMessage: "not-initialized" };
    }
    API.addDirectShare(state.session, action.email);
    return sharedUserInitialState;
  case "remove":
    if (state.session === null || state.sharedUsers === null) {
      return { ...state, errorMessage: "not-initialized" };
    }
    API.removeDirectShare(state.session, action.userId);
    return sharedUserInitialState;
  }

  return state;
};

export const useSharedUser = (): SharedUserContext => React.useContext(SharedUsersReactContext);

export function SharedUserContextProvider(props: SharedUsersProvider): JSX.Element {
  const { value, children } = props;
  return (
    <SharedUsersReactContext.Provider value={value}>
      {children}
    </SharedUsersReactContext.Provider>
  );
}
