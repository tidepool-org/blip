/**
 * Copyright (c) 2021, Diabeloop
 * API utils for ../components/patient-data.js
 * This code used to be directly in patient-data.js
 * But the scope of it feet better in a wrapper
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
 * @typedef { import("../index").PatientData } PatientData
 * @typedef { import("../index").BlipApi } BlipApi
 * @typedef { import("../index").User } User
 * @typedef { import("../index").GetPatientDataOptions } GetPatientDataOptions
 * @typedef { import("../index").GetPatientDataOptionsV0 } GetPatientDataOptionsV0
 * @typedef { import("./lib/partial-data-load").DateRange } DateRange
 */

import bows from "bows";
import moment from "moment-timezone";

import PartialDataLoad from "./lib/partial-data-load";

class ApiUtils {
  /**
   *
   * @param {BlipApi} api For the actual API calls
   * @param {User} patient The current patient
   */
  constructor(api, patient) {
    this.api = api;
    this.patient = patient;
    /** @type {Console} */
    this.log = bows("ApiUtils");

    /** @type {PartialDataLoad} */
    this.partialDataLoad = null;
  }

  get dateRange() {
    return this.partialDataLoad.range;
  }

  /**
   * Refresh the data -> discard the previous loading information
   * @returns {Promise<PatientData>} The patient data
   */
  refresh() {
    this.partialDataLoad = null;

    return this.refreshV1();
  }

  /**
   * @returns {Promise<PatientData>} The patient data
   * @private
   */
  async refreshV1() {
    const range = await this.api.getPatientDataRange(this.patient);
    if (range === null) {
      this.log.info("Range is empty - no data available");
      return [];
    }

    const start = moment.utc(range[0]).startOf("day");
    const end = moment.utc(range[1]).startOf("day");

    this.log.info("Available data range:",
      range[0], range[1],
      "updated to", start.toISOString(), end.toISOString()
    );

    // Get the initial range of data to load:
    // 3 weeks (for basics view) -> start/end of week
    // subtract one day to be sure to have all the data we need
    // since the timezone is generally not UTC
    const initialLoadingDates = [
      end.clone().startOf("week").subtract(2, "weeks").subtract(1, "day"),
      end,
    ];

    /** @type {GetPatientDataOptions} */
    const loadingOptions = {
      startDate: initialLoadingDates[0].toISOString(),
      withPumpSettings: true,
    };

    // Get the data from the API
    const [patientData, messagesNotes] = await Promise.all([
      this.api.getPatientData(this.patient, loadingOptions),
      this.api.getMessages(this.patient, loadingOptions),
    ]);

    this.partialDataLoad = new PartialDataLoad(
      { start, end },
      { start: initialLoadingDates[0], end: initialLoadingDates[1] }
    );

    return patientData.concat(messagesNotes);
  }

  /**
   * Fetch earlier data
   * @param {DateRange} dateRange Dates (epoch/number) range to load data
   * @returns {Promise<PatientData>} The patient data
   */
  fetchDataRange(dateRange) {
    const rangesToLoad = this.partialDataLoad.getMissingRanges(dateRange);
    this.log.info("partialDataLoad updated", this.partialDataLoad.toDebug());

    const promises = [];
    for (const rangeToLoad of rangesToLoad) {
      /** @type {GetPatientDataOptions|GetPatientDataOptionsV0} */
      const loadingOptions = {
        startDate: rangeToLoad.start.toISOString(),
        endDate: rangeToLoad.end.toISOString(),
      };
      promises.push(this.fetchDataRangeV1(loadingOptions));
    }

    return Promise.all(promises).then((values) => {
      let r = [];
      for (const value of values) {
        r = r.concat(value);
      }
      return r;
    });
  }

  /**
   * @param {GetPatientDataOptions} loadingOptions ISO dates range
   * @returns {Promise<PatientData>} The patient data
   * @private
   */
  async fetchDataRangeV1(loadingOptions) {
    /** @type {[PatientData, PatientData]} */
    const [patientData, messagesNotes] = await Promise.all([
      this.api.getPatientData(this.patient, loadingOptions),
      this.api.getMessages(this.patient, loadingOptions),
    ]);
    return patientData.concat(messagesNotes);
  }
}

export default ApiUtils;
