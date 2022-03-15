/**
 * Copyright (c) 2022, Diabeloop
 * Axios Instance configuration
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

import axios, { AxiosRequestConfig } from "axios";
import { v4 as uuidv4 } from "uuid";

import { HttpHeaderKeys } from "../models/api";
import appConfig from "./config";
import { getFromSessionStorage } from "./utils";
import { STORAGE_KEY_SESSION_TOKEN } from "./auth/models";

export const onFulfilled = (config: AxiosRequestConfig): AxiosRequestConfig => {
  if (config.params?.noHeader) {
    delete config.params.noHeader;
  } else {
    config = {
      ...config,
      headers: {
        [HttpHeaderKeys.sessionToken]: getFromSessionStorage(STORAGE_KEY_SESSION_TOKEN),
        [HttpHeaderKeys.traceToken]: uuidv4(),
      },
    };
  }
  return config;
};

function initAxios() {
  axios.defaults.baseURL = appConfig.API_HOST;
  /**
   * We use axios request interceptor to set the access token into headers each request the app send
   */
  axios.interceptors.request.use(onFulfilled);
}

export default initAxios;
