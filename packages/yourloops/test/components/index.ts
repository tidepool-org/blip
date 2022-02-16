/**
 * Copyright (c) 2021, Diabeloop
 * Components tests
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

import testDatePickers from "./date-pickers";
import testSnackbar from "./utils/snackbar.test";
import testFooterLink from "./footer-links.test";
import testPasswordStrengthMeter from "./password-strength-meter.test";
import testSwitchRole from "./switch-role";
import testDropdowns from "./dropdown";
import testButtons from "./buttons";

function testComponents(): void {
  describe("Buttons", testButtons);
  describe("DatePickers", testDatePickers);
  describe("Footer", testFooterLink);
  describe("Snackbar", testSnackbar);
  describe("Footer", testFooterLink);
  describe("Password strength meter", testPasswordStrengthMeter);
  describe("SwitchRole", testSwitchRole);
  describe("Dropdowns", testDropdowns);
}

export default testComponents;
