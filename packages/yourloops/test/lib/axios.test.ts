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

import { expect } from "chai";

import { onFulfilled } from "../../lib/axios";
import { HttpHeaderKeys } from "../../models/api";

function testAxios(): void {

  describe("onFulfilled", () => {
    it("should return config without added headers", () => {
      //given
      const expected = { params: {} };
      const config = { params: { noHeader: true } };

      //when
      const actual = onFulfilled(config);

      //then
      expect(actual).to.deep.equal(expected);
    });

    it("should return config with header when no param is given", () => {
      //given
      //when
      const actual = onFulfilled({});

      //then
      expect(actual.headers).to.include.keys(HttpHeaderKeys.sessionToken);
      expect(actual.headers).to.include.keys(HttpHeaderKeys.traceToken);
    });

    it("should return config with added headers", () => {
      //given
      const config = { params: { fakeParam: true } };

      //when
      const actual = onFulfilled(config);

      //then
      expect(actual).to.deep.include(config);
      expect(actual.headers).to.include.keys(HttpHeaderKeys.sessionToken);
      expect(actual.headers).to.include.keys(HttpHeaderKeys.traceToken);
    });
  });
}

export default testAxios;
