/**
 * Copyright (c) 2021, Diabeloop
 * Yourloops API client type definition for patient-data
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

interface PatientDatum {
  id: string;
  /** Parent upload object id (type="upload") */
  uploadId: string;
  /** The user id */
  _userId: string;
  /** time ISO string */
  time: string;
  timezone?: string;
  /** Data type */
  type: string;
  /** others properties */
  [x: string]: unknown;
}

type PatientData = PatientDatum[];

interface ComputedTIR {
  count: {
    high: number;
    low: number;
    target: number;
    veryHigh: number;
    veryLow: number;
  },
  lastCbgTime: string;
  lastTime: {
    high: string | null;
    low: string | null;
    target: string | null;
    veryLow: string | null;
    veryHigh: string | null;
  },
  totalTime: {
    high: number;
    low: number;
    target: number;
    veryHigh: number;
    veryLow: number;
  },
  userId: string;
}

interface MedicalData {
  data?: PatientData;
  range?: {
    startDate: string;
    endDate: string;
  };
  computedTir?: ComputedTIR;
}


export { PatientDatum, PatientData, ComputedTIR, MedicalData };
