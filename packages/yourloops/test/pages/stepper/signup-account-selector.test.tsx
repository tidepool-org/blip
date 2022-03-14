/**
 * Copyright (c) 2022, Diabeloop
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

import React from "react";
import { expect } from "chai";
import _ from "lodash";

import { SignUpFormStateProvider } from "../../../pages/signup/signup-formstate-context";
import SignupAccountSelector from "../../../pages/signup/signup-account-selector";
import { act } from "react-test-renderer";
import ReactDOM from "react-dom";

describe("Signup account selector", () => {

  let container: HTMLDivElement | null = null;

  function render() {
    return act(() => {
      return new Promise((resolve) => {
        ReactDOM.render(
          <SignUpFormStateProvider>
            <SignupAccountSelector handleBack={_.noop} handleNext={_.noop} />
          </SignUpFormStateProvider>, container, resolve);
      });
    });
  }

  beforeEach(async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    await render();
  });

  afterEach(() => {
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
      document.body.removeChild(container);
      container = null;
    }
  });

  const nextButtonDisabled = (disabled: boolean) => {
    const nextButton = document.getElementById("button-signup-steppers-next");
    if (disabled) {
      expect(nextButton.getAttribute("disabled")).to.be.not.null;
    } else {
      expect(nextButton.getAttribute("disabled")).to.be.null;
    }
  };

  it("should disable next button when nothing is selected", () => {
    nextButtonDisabled(true);
  });

  it("should disable next button when patient is selected", () => {
    document.getElementById("signup-account-selector-radio-patient").click();
    nextButtonDisabled(true);
  });

  it("should enable next button when hcp or caregiver is selected", () => {
    document.getElementById("signup-account-selector-radio-hcp").click();
    nextButtonDisabled(false);
    document.getElementById("signup-account-selector-radio-caregiver").click();
    nextButtonDisabled(false);
  });
});

