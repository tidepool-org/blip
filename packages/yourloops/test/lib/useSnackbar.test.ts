/**
 * Copyright (c) 2021, Diabeloop
 * useSnackbar hook tests
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

import { expect } from "chai";

import { renderHook } from "@testing-library/react-hooks/dom";

import { AlertSeverity, ApiAlert, useSnackbar } from "../../lib/useSnackbar";

const apiAlert = (id = "0"): ApiAlert => ({ id, message: "message", severity: AlertSeverity.warning });

function testUseSnackbar(): void {
  it("renders without crashing", () => {
    const { result } = renderHook(() => useSnackbar());

    expect(result).to.exist;
  });

  it("return a function and an object containing an object and a function", () => {
    const { result } = renderHook(() => useSnackbar());

    result.current.openSnackbar(apiAlert());

    expect(result.current.openSnackbar).to.be.a("function");
    expect(result.current.snackbarParams).to.be.a("object");
    expect(result.current.snackbarParams.apiAlert).to.be.a("object");
    expect(result.current.snackbarParams.removeAlert).to.be.a("function");
  });

  it("update the apiAlert and return the given value", () => {
    const { result } = renderHook(() => useSnackbar());

    result.current.openSnackbar(apiAlert());

    expect(result.current.snackbarParams.apiAlert).to.eql(apiAlert());
  });

  it("return undefined as there is no alert", () => {
    const { result } = renderHook(() => useSnackbar());

    expect(result.current.snackbarParams.apiAlert).to.be.undefined;
  });

  it("return the second alert after the first one has been removed", () => {
    const { result } = renderHook(() => useSnackbar());

    result.current.openSnackbar(apiAlert());
    result.current.openSnackbar(apiAlert("1"));

    expect(result.current.snackbarParams.apiAlert).to.eql(apiAlert());

    result.current.snackbarParams.removeAlert("0");

    expect(result.current.snackbarParams.apiAlert).to.eql(apiAlert("1"));
  });
}

export default testUseSnackbar;
