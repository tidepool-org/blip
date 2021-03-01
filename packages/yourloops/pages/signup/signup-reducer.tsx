/* eslint-disable indent */
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

import _ from "lodash";
import { SignUpFormState } from "./signup-formstate-context";

export const initialState: SignUpFormState = {
  formValues: {
    accountUsername: "",
    accountPassword: "",
    accountRole: "",
    profileFirstname: "",
    profileLastname: "",
    profileCountry: "", // how to do better ?
    profilePhone: "",
    profileJob: "",
    preferencesLanguage: "",
    terms: false,
    privacyPolicy: false,
  },
};

export function SignupReducer(
  state: SignUpFormState,
  action: any
): SignUpFormState {
  switch (action.type) {
    case "EDIT_FORMVALUE": {
      // clone input state in order to avoid initialstate mutation
      const clone = _.cloneDeep(state);
      clone.formValues[action.key] = action.value;
      return clone;
    }
    case "RESET_FORMVALUES":
      return initialState;
    default:
  }
  return state;
}
