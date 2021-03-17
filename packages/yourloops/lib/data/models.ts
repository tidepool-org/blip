/**
 * Copyright (c) 2021, Diabeloop
 * Data API Models
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

/**
 * Options to pass to the fetch data API
 */
export interface GetPatientDataOptions {
  /** Start of the wanted period (ISO 8601 datetime) */
  startDate?: string;
  /** End of the wanted period (ISO 8601 datetime) */
  endDate?: string;
  /** Does the result should include the latest pumpSettings ? */
  withPumpSettings?: boolean;
}

/**
 * Options for the API v0
 */
export interface GetPatientDataOptionsV0 {
  /** Type of data to search for - can be a list of types separated by commas */
  types?: string[];
  /** Start of the wanted period (ISO 8601 datetime) */
  startDate?: string;
  /** End of the wanted period (ISO 8601 datetime) */
  endDate?: string;
  /** To return only the most recent results for each `type` matching the results filtered by the other query parameters */
  latest?: boolean;
}
