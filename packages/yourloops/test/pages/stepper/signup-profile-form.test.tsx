/**
 * Copyright (c) 2021, Diabeloop
 * password strength meter component tests
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
import { render, unmountComponentAtNode } from "react-dom";
import { expect } from "chai";
import { act } from "@testing-library/react-hooks/dom";
import _ from "lodash";

import { SignUpFormStateProvider, useSignUpFormState } from "../../../pages/signup/signup-formstate-context";
import SignUpProfileForm from "../../../pages/signup/signup-profile-form";


function FakeHcpSelector(): JSX.Element {
  const { state, dispatch } = useSignUpFormState();

  React.useEffect(() => {
    if (state.formValues.accountRole !== "hcp") {
      dispatch({
        type: "EDIT_FORMVALUE",
        key: "accountRole",
        value: "hcp",
      });
    }
  }, [dispatch, state.formValues.accountRole]);

  return null;
}

describe("Signup profile form", () => {
  let container: HTMLElement | null = null;

  const mountComponent = async (hcp: boolean): Promise<void> => {
    await act(() => {
      return new Promise((resolve) => {

        render(
          <SignUpFormStateProvider>
            {hcp &&
              <FakeHcpSelector />
            }
            <SignUpProfileForm handleBack={_.noop} handleNext={_.noop} />
          </SignUpFormStateProvider>, container, resolve);
      });
    });
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container) {
      unmountComponentAtNode(container);
      container.remove();
      container = null;
    }
  });

  it("should not render the drop down list when caregiver", async () => {
    await mountComponent(false);
    const dropDownList = document.querySelector("#hcp-profession-selector");
    expect(dropDownList).to.be.null;
  });

  it("should render the drop down list when HCP", async () => {
    await mountComponent(true);
    const dropDownList = document.querySelector("#hcp-profession-selector");
    expect(dropDownList).to.be.not.null;
  });
});

