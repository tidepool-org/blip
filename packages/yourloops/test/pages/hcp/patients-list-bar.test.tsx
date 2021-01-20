/**
 * Copyright (c) 2021, Diabeloop
 * HCP patient list bar tests
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
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import AppBarPage, { PatientListBarProps } from "../../../pages/hcp/patients-list-bar";

function testAppBar(): void {
  const defaultProps: PatientListBarProps = {
    filter: "",
    filterType: "",
    teams: [],
    onFilter: sinon.spy(),
    onFilterType: sinon.spy(),
    onInvitePatient: sinon.spy(),
  };

  it("should be exported as a function", () => {
    expect(AppBarPage).to.be.a("function");
  });

  it("should be able to render", () => {
    const bar = shallow(<AppBarPage {...defaultProps} />);
    expect(bar.find("#patients-list-toolbar-item-left").length).to.be.equal(1);
  });
}

export default testAppBar;
