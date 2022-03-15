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

import metrics from "../lib/metrics";
import EncoderService from "./encoder";
import HttpService from "./http";

export interface PasswordLeakResponse {
  hasLeaked?: boolean
}

export default class PasswordLeakService {

  static async verifyPassword(password: string): Promise<PasswordLeakResponse> {
    const hashedPassword = await EncoderService.encodeSHA1(password);
    const hashedPasswordPrefix = hashedPassword.substring(0, 5);
    const hashedPasswordSuffix = hashedPassword.substring(5);
    const config = { params: { noHeader: true } };
    try {
      const response = await HttpService.get<string>({
        url: `https://api.pwnedpasswords.com/range/${hashedPasswordPrefix}`,
        config,
      });
      const hasLeaked = response.data.includes(hashedPasswordSuffix);
      return {
        hasLeaked,
      };
    } catch (error) {
      //if the service is unavailable, we do not want to block the user from creating an account
      metrics.send("error", "password_leak", "The password leak API is unavailable");
      console.error("Could not check whether entered password has been leaked");
      return { hasLeaked: undefined };
    }
  }
}
