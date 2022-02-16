/**
 * Copyright (c) 2022, Diabeloop
 * Http service to make requests
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

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import httpStatus from "../lib/http-status-codes";
import { t } from "../lib/language";

export default class HttpService {
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await axios.get<T>(url, { ...config });
    } catch (error: any) {
      throw HttpService.handleError(error);
    }
  }

  static async post<T>(url: string, payload?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await axios.post<T>(url, payload, { ...config });
    } catch (error: any) {
      throw HttpService.handleError(error);
    }
  }

  static async put<T>(url: string, payload?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await axios.put<T>(url, payload, { ...config });
    } catch (error: any) {
      throw HttpService.handleError(error);
    }
  }

  static async delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    try {
      return await axios.delete(url, { ...config });
    } catch (error: any) {
      throw HttpService.handleError(error);
    }
  }

  private static handleError(error: AxiosError): Error {
    if (error.response) {
      if (error.response.status >= 400 && error.response.status <= 550) {
        switch (error.response.status) {
        case httpStatus.StatusInternalServerError:
          throw Error(t("error-http-500"));
        default:
          throw Error(t("error-http-40x"));
        }
      }
    }
    return error;
  }
}
