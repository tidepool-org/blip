/**
 * Copyright (c) 2021, Diabeloop
 * Data fetch summaries helper
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

import bows from "bows";
import _ from "lodash";

import { MS_IN_DAY } from "../../models/generic";
import { MedicalData } from "../../models/device-data";
import { IUser, UserRoles } from "../../models/shoreline";
import { numberPrecision } from "../utils";
import metrics from "../metrics";
import { Session } from "../auth";

import {
  getPatientsDataSummary,
  getPatientDataRange,
} from "./api";

const log = bows("FetchSummaries");

interface ITimerAvgMetrics {
  duration: number;
  result: "range-error" | "tir-error" | "OK";
}

const avgMetrics: ITimerAvgMetrics[] = [];
/** Send a metrics on average fetch tir every 30s */
const sendTimerMetrics = _.throttle(() => {
  const nMetrics = avgMetrics.length;
  let totalTime = 0;
  for (let i=0; i<nMetrics; i++) {
    const m = avgMetrics[i];
    totalTime += m.duration;
  }
  metrics.send("performance", "fetch_summaries", "/professional/patients", numberPrecision(totalTime / (nMetrics * 1000)));
  avgMetrics.splice(0);
}, 30000, { trailing: true, leading: false }); // eslint-disable-line no-magic-numbers

function addMetric(metric: ITimerAvgMetrics): void {
  avgMetrics.push(metric);
  sendTimerMetrics();
}

async function fetchSummary(session: Session, patient: IUser): Promise<MedicalData | null> {
  let range: string[] | null = null;
  const startTime = Date.now();

  try {
    range = await getPatientDataRange(session, patient);
  } catch (reason) {
    log.info("fetchSummary:getPatientDataRange", patient.userid, { reason });
    addMetric({ result: "range-error", duration: Date.now() - startTime });
  }

  if (range === null) {
    return null;
  }

  const medicalData: MedicalData = {
    range: {
      startDate: range[0],
      endDate: range[1],
    },
  };
  const endDate = range[1];
  const startDate = new Date(Date.parse(range[1]) - MS_IN_DAY).toISOString();

  try {
    const tir = await getPatientsDataSummary(session, patient.userid, { startDate, endDate });
    medicalData.computedTir = tir;
    addMetric({ result: "OK", duration: Date.now() - startTime });
  } catch (reason) {
    log.info("fetchSummary:getPatientsDataSummary", patient.userid, { reason });
    addMetric({ result: "tir-error", duration: Date.now() - startTime });
  }

  return medicalData;
}

// ******
// Summary fetch: Done in sequence for only the displayed rows
//
// Use the IntersectionObserver API to know of a row is displayed on screen
// If so call a promise which may resolve with the wanted value, or cancelled
// when if row is no longer displayed.
// If a fetch is in progress, it can't be cancelled,
// The result can be discarded in that case.
// ******

type PendingSummaryFetchPromiseFuncs = {
  resolve: (data: MedicalData | null | undefined) => void;
  reject: (reason: Error) => void;
};
interface PendingSummaryFetch {
  /** To know the patient we need data */
  patient: IUser;
  /** Our sessions infos for the API call */
  session: Session;
  /** To know if we are processing this patient -> API call in progress */
  inProgress: boolean;
  /**
   * Array of promise callbacks, normally one should be enough, but if the users do lots
   * of quick scrolling back & forth, we may ends up with more than one entry here.
   */
  promisesCallbacks: PendingSummaryFetchPromiseFuncs[];
}

/** Map of wanted data summary (TIR, last upload) we need to fetch */
const mapPendingFetch = new Map<string, PendingSummaryFetch>();
/**
 * We want do to them in sequence, to not mobilize too much the server.
 *
 * This boolean is used here as a lock.
 */
let fetchingSummaries = false;
function startFetchSummary() {
  if (fetchingSummaries) {
    return;
  }
  fetchingSummaries = true;

  const values = mapPendingFetch.values();
  const { done, value } = values.next();
  if (done === false && value !== undefined) {
    const psf = value as PendingSummaryFetch;
    psf.inProgress = true;
    fetchSummary(psf.session, psf.patient)
      .then((result: MedicalData | null) => {
        psf.promisesCallbacks.forEach((promiseCallback) => {
          promiseCallback.resolve(result);
        });
      })
      .catch((reason: Error) => {
        psf.promisesCallbacks.forEach((promiseCallback) => {
          promiseCallback.reject(reason);
        });
      })
      .finally(() => {
        mapPendingFetch.delete(psf.patient.userid);
        fetchingSummaries = false;
        setTimeout(startFetchSummary, 1);
      });
  } else {
    fetchingSummaries = false;
  }
}

/**
 * Promise to get the medical summary data.
 * May be resolved early with undefined if cancelled.
 * @param session Auth session
 * @param patient Patient infos
 * @returns The medical data (TIR/last upload data), or null if theses infos are not available, or undefined, if cancelled
 */
function addPendingFetch(session: Session, patient: IUser): Promise<MedicalData | null | undefined> {
  if (patient.role !== UserRoles.patient) {
    return Promise.reject(new Error("invalid-user"));
  }
  if (patient.medicalData) {
    return Promise.resolve(patient.medicalData);
  }

  return new Promise((resolve: (data: MedicalData | null | undefined) => void, reject: (reason: Error) => void) => {
    const psf = mapPendingFetch.get(patient.userid);
    if (psf) {
      psf.promisesCallbacks.push({ resolve, reject });
    } else {
      mapPendingFetch.set(patient.userid, {
        patient,
        session,
        inProgress: false,
        promisesCallbacks: [{ resolve, reject }],
      });
    }
    setTimeout(startFetchSummary, 1);
  });
}

/**
 * Cancel a pending summary fetch
 * @param patient Patient infos
 */
function removePendingFetch(patient: IUser): void {
  const psf = mapPendingFetch.get(patient.userid);
  if (psf !== undefined && psf.inProgress === false) {
    mapPendingFetch.delete(patient.userid);
    psf.promisesCallbacks.forEach((pc) => {
      pc.resolve(undefined);
    });
  }
}

export { addPendingFetch, removePendingFetch };
