/**
 * Copyright (c) 2021, Diabeloop
 * Commons utilities for all tests
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

import { v4 as uuidv4 } from "uuid";
import jwtDecode from "jwt-decode";

import { JwtShorelinePayload } from "../../models/shoreline";
import { User } from "../../lib/auth";

// eslint-disable-next-line no-magic-numbers
const defaultTokenDuration = 60 * 60;

/**
 * Create valid JWT for the specified user
 * @param user The user
 * @param dur Token duration
 * @returns An unsigned JWT
 */
export const createSessionToken = (user: User, dur = defaultTokenDuration): string => {
  const header = {
    alg: "none",
    typ: "JWT",
  };
  const iat = Math.round(Date.now() / 1000);
  const payload = {
    svr: "no",
    role: user.role,
    usr: user.userid,
    email: user.username,
    dur,
    iat,
    exp: iat + dur,
    jti: uuidv4(),
  };
  const encoder = new TextEncoder();
  let utf8 = encoder.encode(JSON.stringify(header));
  const b64Header = btoa(String.fromCharCode.apply(null, utf8 as unknown as number[]));
  utf8 = encoder.encode(JSON.stringify(payload));
  const b64Payload = btoa(String.fromCharCode.apply(null, utf8 as unknown as number[]));
  return `${b64Header}.${b64Payload}.`;
};

export const refreshToken = (token: string): string => {
  const decoded = jwtDecode<JwtShorelinePayload>(token);
  const header = {
    alg: "none",
    typ: "JWT",
  };
  const dur = defaultTokenDuration;
  const iat = Math.round(Date.now() / 1000);
  const payload = {
    svr: "no",
    role: decoded.role,
    usr: decoded.usr,
    email: decoded.email,
    dur,
    iat,
    exp: iat + dur,
    jti: uuidv4(),
  };
  const encoder = new TextEncoder();
  let utf8 = encoder.encode(JSON.stringify(header));
  const b64Header = btoa(String.fromCharCode.apply(null, utf8 as unknown as number[]));
  utf8 = encoder.encode(JSON.stringify(payload));
  const b64Payload = btoa(String.fromCharCode.apply(null, utf8 as unknown as number[]));
  return `${b64Header}.${b64Payload}.`;
};
