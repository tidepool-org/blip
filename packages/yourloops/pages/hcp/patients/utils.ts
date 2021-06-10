/**
 * Copyright (c) 2021, Diabeloop
 * Patient list utilities for HCPs
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

import moment from "moment-timezone"; // TODO: Change moment-timezone lib with something else
import { TFunction } from "i18next";

import { SortFields } from "../../../models/generic";
import { MedicalData } from "../../../models/device-data";
import { MedicalTableValues } from "./models";

export const getMedicalValues = (medicalData: MedicalData | null | undefined, na = "N/A"): MedicalTableValues => {
  let tir = "-";
  let tbr = "-";
  let lastUpload = "-";
  let tirNumber = Number.NaN;
  let tbrNumber = Number.NaN;
  let lastUploadEpoch = Number.NaN;

  if (medicalData === null) {
    tir = na;
    tbr = na;
    lastUpload = na;
  } else if (medicalData) {
    if (medicalData.range?.endDate) {
      const browserTimezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
      const mLastUpload = moment.tz(medicalData.range.endDate, browserTimezone);
      if (mLastUpload.isValid()) {
        lastUploadEpoch = mLastUpload.valueOf();
        lastUpload = mLastUpload.format("llll");
      }
    }
    if (medicalData.computedTir?.count) {
      const { high, low, target, veryHigh, veryLow } = medicalData.computedTir.count;
      const total = high + low + target + veryHigh + veryLow;
      tirNumber = Math.round((100 * target) / total);
      tir = tirNumber.toString(10);
      tbrNumber = Math.round((100 * (low + veryLow)) / total);
      tbr = tbrNumber.toString(10);
    } else {
      tir = na;
      tbr = na;
    }
  }

  return {
    tir,
    tbr,
    lastUpload,
    tirNumber,
    tbrNumber,
    lastUploadEpoch,
  };
};

export const translateSortField = (t: TFunction, field: SortFields): string => {
  let trOrderBy: string;
  switch (field) {
  case SortFields.firstname:
    trOrderBy = t("firstname");
    break;
  case SortFields.lastname:
    trOrderBy = t("lastname");
    break;
  case SortFields.tir:
    trOrderBy = t("list-patient-tir");
    break;
  case SortFields.tbr:
    trOrderBy = t("list-patient-tbr");
    break;
  case SortFields.upload:
    trOrderBy = t("list-patient-upload");
    break;
  case SortFields.email:
    trOrderBy = t("email");
    break;
  }
  return trOrderBy;
};
