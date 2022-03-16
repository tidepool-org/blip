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
import { ThemeProvider } from "@material-ui/styles";
import { createTheme, hexToRgb } from "@material-ui/core/styles";
import { PasswordStrengthMeter } from "../../../components/password/password-strength-meter";

describe("Password strength meter", () => {

  let container: HTMLElement | null = null;
  const mainTheme = createTheme({
    palette: {
      primary: {
        main: "#000000",
        light: "#555555",
        dark: "#ffffff",
      },
      secondary: {
        main: "#000000",
        light: "#555555",
        dark: "#ffffff",
      },
      background: { default: "#FFFFFF" },
    },
  });

  const mountComponent = async (force: number, error: boolean): Promise<void> => {
    await act(() => {
      return new Promise((resolve) => {
        render(
          <ThemeProvider theme={mainTheme}>
            <PasswordStrengthMeter force={force} error={error} helperText={"password-too-short"} />
          </ThemeProvider>, container, resolve);
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

  it("should render one gauge with error color and error message when force is equal to 1", async () => {
    await mountComponent(1, true);
    const gauges = document.querySelectorAll("#password-strength-meter div[class*=\"makeStyles-weakBgColor-\"]");

    expect(gauges.length).to.be.equal(1);
    expect(getComputedStyle(gauges[0]).backgroundColor).to.be.equal(hexToRgb(mainTheme.palette.error.main));
  });

  it("should render two gauges with warning color when force is equal to 2", async () => {
    await mountComponent(2, true);
    const gauges = document.querySelectorAll("#password-strength-meter div[class*=\"makeStyles-mediumBgColor-\"]");

    expect(gauges.length).to.be.equal(2);
    expect(getComputedStyle(gauges[0]).backgroundColor).to.be.equal(hexToRgb(mainTheme.palette.warning.dark));
  });

  it("should render three gauges with success color when force is equal to 3", async () => {
    await mountComponent(3, false);
    const gauges = document.querySelectorAll("#password-strength-meter div[class*=\"makeStyles-strongBgColor-\"]");

    expect(gauges.length).to.be.equal(3);
    expect(getComputedStyle(gauges[0]).backgroundColor).to.be.equal(hexToRgb(mainTheme.palette.success.main));
  });
});
