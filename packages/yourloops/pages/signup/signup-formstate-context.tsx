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

import * as React from "react";
import _ from "lodash";

import { UserRoles } from "../../models/shoreline";
import { getCurrentLang } from "../../lib/language";
import { SignupUser as IFormValues } from "../../lib/auth";

export type FormValuesType = keyof IFormValues;

/*
 * Signup Form type
 */
export interface SignUpFormState {
  formValues: IFormValues;
}

interface ISignUpFormStateContext {
  state: SignUpFormState;
  dispatch: React.Dispatch<ISignUpDispatch>;
}

interface IProvider {
  children?: JSX.Element | JSX.Element[];
}

export interface ISignUpDispatch {
  type: string;
  key?: FormValuesType;
  value?: boolean | string;
}

export const initialState: SignUpFormState = {
  formValues: {
    accountUsername: "",
    accountPassword: "",
    accountRole: UserRoles.caregiver,
    profileFirstname: "",
    profileLastname: "",
    profileCountry: "", // how to do better ?
    profilePhone: "",
    // profileJob: "",
    preferencesLanguage: getCurrentLang(),
    terms: false,
    privacyPolicy: false,
  },
};

export function signupReducer(state: SignUpFormState, action: ISignUpDispatch): SignUpFormState {
  switch (action.type) {
  case "EDIT_FORMVALUE": {
    if (_.isNil(action.value) || _.isNil(action.key)) {
      throw new Error(`Invalid parameter: ${JSON.stringify(action)}`);
    }
    // clone input state in order to avoid initialstate mutation
    const clone = _.cloneDeep(state);
    _.set(clone.formValues, action.key, action.value);
    // clone.formValues[action.key] = action.value;
    return clone;
  }
  case "RESET_FORMVALUES":
    return initialState;
  default:
  }
  return state;
}

/*
 * Create the context for the Signup Form state
 */
const SignUpFormStateContext = React.createContext<ISignUpFormStateContext>({ state: initialState, dispatch: _.noop });

/*
 * Provide a signup form state context
 */
export const SignUpFormStateProvider = ({ children }: IProvider): JSX.Element => {
  // Attach the Signup reducer and assign initial state
  const [state, dispatch] = React.useReducer(signupReducer, initialState);
  const value = { state, dispatch };
  return (
    <SignUpFormStateContext.Provider value={value}>
      {children}
    </SignUpFormStateContext.Provider>
  );
};

/**
 Returns the current SignupForm State and a dispatcher to update it
 */
export const useSignUpFormState = (): ISignUpFormStateContext => React.useContext(SignUpFormStateContext);
