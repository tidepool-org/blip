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
 */

import _ from "lodash";
import bows from "bows";
import moment from "moment-timezone";

import { DAILY_TYPES } from "tideline";

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

    /** @type {[moment.Moment, moment.Moment]} */
    this.dataRange = null;
    /** @type {PartialDataLoad} */
    this.partialDataLoad = null;

    this.logWarnNoAPIv1 = _.once((err) => this.log.warn("Data API v1 not available", err));
    this.haveAPIv1 = true;
  }

  /**
   * Refresh the data -> discard the previous loading information
   * @returns {Promise<PatientData>} The patient data
   */
  async refresh() {
    this.dataRange = null;
    this.partialDataLoad = null;

    try {
      return await this.refreshV1();
    } catch (err) {
      this.logWarnNoAPIv1(err);
      this.haveAPIv1 = false;
    }

    return this.refreshV0();
  }

  /**
   * @returns {Promise<PatientData>} The patient data
   * @private
   */
  async refreshV1() {
    const range = await this.api.getPatientDataRange(this.patient);
    this.log.info("Available data range:", range[0], range[1]);

    // Assume browser locale, will adjust after
    const timezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.dataRange = [moment.tz(range[0], timezone), moment.tz(range[1], timezone)];

    // Get the initial range of data to load:
    // 3 weeks (for basics view) -> start/end of week
    // substract one day to be sure to have all the data we need
    // since the timezone is generally not UTC
    const initialLoadingDates = [
      moment.utc(this.dataRange[1]).startOf("week").subtract(2, "weeks").subtract(1, "day"),
      moment.utc(this.dataRange[1]).endOf("day"),
    ];

    /** @type {GetPatientDataOptions} */
    const loadingOptions = {
      startDate: initialLoadingDates[0].toISOString(),
      withPumpSettings: true,
    };

    this.log.info("Initial loading options:", loadingOptions);

    // Get the data from the API
    const [patientData, messagesNotes] = await Promise.all([
      this.api.getPatientData(this.patient, loadingOptions),
      this.api.getMessages(this.patient, loadingOptions),
    ]);

    this.partialDataLoad = new PartialDataLoad(
      { start: this.dataRange[0].valueOf(), end: this.dataRange[1].valueOf() },
      { start: initialLoadingDates[0].valueOf(), end: initialLoadingDates[1].valueOf() }
    );

    return patientData.concat(messagesNotes);
  }

  /**
   * Try do do the same thing than the APIv1 but using the v0 API
   * @returns {Promise<PatientData>} The patient data
   * @private
   */
  async refreshV0() {
    // To get the data range we will start to fetch the upload data
    // Since everything needs it
    // The we will fetch the latest data of each types

    /** @type {[PatientData, PatientData]} */
    const [uploads, latest] = await Promise.all([
      await this.api.getPatientDataV0(this.patient, { types: ["upload"] }),
      await this.api.getPatientDataV0(this.patient, { latest: true }),
    ]);

    // Combine
    let combinedData = uploads.concat(latest);
    if (combinedData.length > 0) {
      // Sort (using a field that's will be stripped after by TidelineData)
      // Don't use epoch here because TidelineData use it to know if it
      // has already process it.
      combinedData.forEach((d) => {
        d.timeProcessing = Date.parse(d.time);
      });
      combinedData.sort((a, b) => a.timeProcessing - b.timeProcessing);

      this.log.debug("combinedData", combinedData);

      const timezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.dataRange = [
        moment.tz(combinedData[0].timeProcessing, timezone),
        moment.tz(_.findLast(combinedData, (d) => DAILY_TYPES.includes(d.type)).timeProcessing, timezone),
      ];

      this.log.info("Available data range:", this.dataRange[0].toISOString(), this.dataRange[1].toISOString());

      const initialLoadingDates = [
        moment.utc(this.dataRange[1]).startOf("week").subtract(2, "weeks").subtract(1, "day"),
        moment.utc(this.dataRange[1]).endOf("day"),
      ];

      /** @type {GetPatientDataOptionsV0} */
      const loadingOptions = {
        startDate: initialLoadingDates[0].toISOString(),
      };

      this.log.info("Initial loading options:", loadingOptions);

      // Get the initial data from the API
      /** @type {[PatientData, PatientData]} */
      const [patientData, messagesNotes] = await Promise.all([
        this.api.getPatientDataV0(this.patient, loadingOptions),
        this.api.getMessages(this.patient, loadingOptions),
      ]);

      this.partialDataLoad = new PartialDataLoad(
        { start: this.dataRange[0].valueOf(), end: this.dataRange[1].valueOf() },
        { start: initialLoadingDates[0].valueOf(), end: initialLoadingDates[1].valueOf() }
      );

      combinedData = combinedData.concat(patientData, messagesNotes);
    }

    return combinedData;
  }

  /**
   * Fetch earlier data
   * @param {DateRange} dateRange Dates (epoch/number) range to load data
   * @returns {Promise<PatientData>} The patient data
   */
  fetchDataRange(dateRange) {
    this.log.info("Fetching data using range", dateRange);
    const rangeToLoad = this.partialDataLoad.getRangeToLoad(dateRange);

    if (rangeToLoad === null) {
      this.log.warn("Empty range, we should not have ended in this situation");
      return [];
    }

    /** @type {GetPatientDataOptions|GetPatientDataOptionsV0} */
    const loadingOptions = {
      startDate: moment.utc(rangeToLoad.start).toISOString(),
      endDate: moment.utc(rangeToLoad.end).toISOString(),
    };
    this.partialDataLoad.setRangeLoaded(rangeToLoad);
    this.log.info("Update loading range:", loadingOptions);

    return this.haveAPIv1 ? this.fetchDataRangeV1(loadingOptions) : this.fetchDataRangeV0(loadingOptions);
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

  /**
   * @param {GetPatientDataOptionsV0} loadingOptions ISO dates range
   * @returns {Promise<PatientData>} The patient data
   * @private
   */
  async fetchDataRangeV0(loadingOptions) {
    /** @type {[PatientData, PatientData]} */
    const [patientData, messagesNotes] = await Promise.all([
      this.api.getPatientDataV0(this.patient, loadingOptions),
      this.api.getMessages(this.patient, loadingOptions),
    ]);
    return patientData.concat(messagesNotes);
  }
}

export default ApiUtils;
