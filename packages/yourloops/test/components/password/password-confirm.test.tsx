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
import { render, unmountComponentAtNode } from "react-dom";
import { expect } from "chai";
import * as sinon from "sinon";

import { act } from "@testing-library/react-hooks/dom";

import { PasswordConfirm } from "../../../components/password/password-confirm";
import PasswordLeakService from "../../../services/password-leak";
import { Simulate, SyntheticEventData } from "react-dom/test-utils";

describe("Confirm password", () => {

  let container: HTMLElement | null = null;
  const onErrorStub = sinon.stub();
  const onSuccessStub = sinon.stub();
  let passwordLeakService: sinon.SinonStub;
  const securedPassword = "ThisPasswordIsSecured:)";

  const mountComponent = async (): Promise<void> => {
    await act(() => {
      return new Promise((resolve) => {
        render(
          <PasswordConfirm
            onError={() => onErrorStub()}
            onSuccess={(passwordToUse) => onSuccessStub(passwordToUse)}
          />
          , container, resolve);
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

  function setPasswords(password: string, confirmPassword: string) {
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement;
    Simulate.change(passwordInput, { target: { value: password } } as unknown as SyntheticEventData);
    Simulate.change(confirmPasswordInput, { target: { value: confirmPassword } } as unknown as SyntheticEventData);
  }

  it("should call onErrorStub when password is too weak", async () => {
    await mountComponent();
    const weakPassword = "IAMWEEK";
    setPasswords(weakPassword, weakPassword);
    expect(onErrorStub.called).to.be.true;
    expect(onSuccessStub.called).to.be.false;
  });

  it("should call onErrorStub when passwords don't match", async () => {
    await mountComponent();
    setPasswords(securedPassword, `${securedPassword}?`);
    expect(onErrorStub.called).to.be.true;
    expect(onSuccessStub.called).to.be.false;
  });

  it("should call onErrorStub when password has leaked", async () => {
    await mountComponent();
    passwordLeakService = sinon.stub(PasswordLeakService, "verifyPassword").resolves({
      hasLeaked: true,
    });
    setPasswords(securedPassword, securedPassword);
    await Promise.resolve();
    expect(onErrorStub.called).to.be.true;
    expect(onSuccessStub.called).to.be.false;
    expect(passwordLeakService.called).to.be.true;
    passwordLeakService.restore();
  });

  it("should call onSuccess when passwords are the same and secured but cannot make sure that is has been leaked", async () => {
    await mountComponent();
    passwordLeakService = sinon.stub(PasswordLeakService, "verifyPassword").resolves({ hasLeaked: undefined });
    setPasswords(securedPassword, securedPassword);
    await Promise.resolve();
    expect(onSuccessStub.called).to.be.true;
    expect(passwordLeakService.calledWith(securedPassword)).to.be.true;
    passwordLeakService.restore();
  });

  it("should call onSuccess when passwords are the same and secured", async () => {
    await mountComponent();
    passwordLeakService = sinon.stub(PasswordLeakService, "verifyPassword").resolves({
      hasLeaked: false,
    });
    setPasswords(securedPassword, securedPassword);
    await Promise.resolve();
    expect(onSuccessStub.called).to.be.true;
    expect(passwordLeakService.calledWith(securedPassword)).to.be.true;
    passwordLeakService.restore();
  });
});
