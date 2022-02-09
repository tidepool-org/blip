/**
 * Copyright (c) 2022, Diabeloop
 * Chart types definitions
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

import React from "react";

import { TidelineData } from "tideline";
import { Datum } from "tideline/js/tidelinedata";
import { utils as vizUtils } from "tidepool-viz";
import { IUser } from "../../../../yourloops/models/shoreline";
import ProfileDialog from "../../../../yourloops/components/dialogs/patient-profile";
import DialogDatePicker from "../../../../yourloops/components/date-pickers/dialog-date-picker";
import DialogRangeDatePicker from "../../../../yourloops/components/date-pickers/dialog-range-date-picker";

export type DataUtil = typeof vizUtils.data.DataUtil;
export type TrackMetrics = (category: string, action: string, name?: string | undefined, value?: number | undefined) => void;
export type OnLocationChange = (epoch: number, range: number) => Promise<void>;

export interface ActiveDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface ChartPrefs {
  trends: {
    extentSize: number;
    activeDays: ActiveDays;
  };
}

export type OnUpdateChartPrefs = (charPrefs: ChartPrefs, cb?: () => void) => void;

export type BgUnits = "mg/dL" | "mmol/L";
export interface BgBounds {
  veryHighThreshold: number;
  targetUpperBound: number;
  targetLowerBound: number;
  veryLowThreshold: number;
}
export interface BgPrefs {
  bgUnits: BgUnits;
  bgBounds: BgBounds;
}
export interface TimePrefs {
  timezoneAware: boolean;
  timezoneName: string;
}

export interface DailyDatePickerProps {
  DialogDatePicker: typeof DialogDatePicker;
  /** Date sent to the date picker */
  date: number | string;
  /** Displayed date for the user */
  displayedDate: string;
  /** Min date (earliest date we have data) */
  startDate: string;
  /** Max / latest date we have data for */
  endDate: string;
  inTransition: boolean;
  loading: boolean;
  onSelectedDateChange: (date: string) => void;
}

export interface TrendsDatePickerProps {
  dialogRangeDatePicker: typeof DialogRangeDatePicker;
  /** Displayed date for the user */
  displayedDate: string;
  /** Start selected date for the calendar */
  start: string;
  /** End selected date for the calendar*/
  end: string;
  /** Min selectionnable date for the calendar */
  minDate: string;
  /** Max selectionnable date for the calendar */
  maxDate: string;
  disabled: boolean;
  onResult: (start?: string, end?: string) => void;
}

export interface TrendsProps {
  epochLocation: number;
  msRange: number;
  loading: boolean;
  canPrint: boolean;
  tidelineData: TidelineData;
  chartPrefs: ChartPrefs;
  bgPrefs: BgPrefs;
  /** @deprecated */
  timePrefs: TimePrefs;
  patient: IUser;
  prefixURL?: string;
  /** Redux */
  trendsState: {
    [userId: string]: unknown;
  };
  dataUtil: DataUtil;
  dialogRangeDatePicker: typeof DialogRangeDatePicker;
  profileDialog?: typeof ProfileDialog | null;
  trackMetric: TrackMetrics;
  onDatetimeLocationChange: OnLocationChange;
  updateChartPrefs: OnUpdateChartPrefs;
  onClickRefresh: () => void;
  onSwitchToBasics: () => void;
  onSwitchToDaily: (date?: number | string | Date) => void;
  onSwitchToSettings: () => void;
}

export interface TrendsState {
  updatingDates: boolean;
  localDates: string[];
  atMostRecent: boolean;
  currentCbgData: Datum[];
}
