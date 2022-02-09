/**
 * Copyright (c) 2021-2022, Diabeloop
 * Date picker common definitions
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

import { Dayjs } from "dayjs";
import { makeStyles } from "@material-ui/core/styles";

export type CalendarOrientation = "landscape" | "portrait";
export type CalendarPosition = "first" | "last";
export type CalendarMode = "single" | "range";
export type ChangeMonthDirection = "left" | "right";

export interface CalendarChangeMonth {
  toMonth: Dayjs;
  direction: ChangeMonthDirection;
  onAnimationEnd: () => void;
}
export interface DateRange {
  start: Dayjs;
  end: Dayjs;
}
export interface CalendarSelection {
  mode: CalendarMode;
  selected: Dayjs | DateRange;
}
export interface CalendarSelectionSingle extends CalendarSelection {
  mode: "single";
  selected: Dayjs;
}
export interface CalendarSelectionRange extends CalendarSelection {
  mode: "range";
  selected: DateRange;
  selectable?: DateRange,
  maxSelectableDays?: number;
}
// CalendarSelection could be extends to a more random mode, for example:
// Could be used to compare a few days for example
// export interface CalendarSelectionMany extends CalendarSelection {
//   mode: "many";
//   selected: Dayjs[];
// }

export const TRANSITION_DURATION = 300;
/** Inclusive */
export const MIN_YEAR = 1900;
/** Exclusive */
export const MAX_YEAR = 2100;

export const animationStyle = makeStyles(() => {
  const keyFrames = {
    "@keyframes calendar-translate-ltr": {
      from: {
        transform: "translateX(0%)",
      },
      to: {
        transform: "translateX(100%)",
      },
    },
    "@keyframes calendar-translate-rtl": {
      from: {
        transform: "translateX(0%)",
      },
      to: {
        transform: "translateX(-100%)",
      },
    },
  };
  return {
    ...keyFrames,
    animatedMonthLTR: {
      animationName: "$calendar-translate-ltr",
      animationDuration: `${TRANSITION_DURATION}ms`,
      animationTimingFunction: "ease-out",
      animationFillMode: "forwards",
      animationDelay: "50ms",
    },
    animatedMonthRTL: {
      animationName: "$calendar-translate-rtl",
      animationDuration: `${TRANSITION_DURATION}ms`,
      animationTimingFunction: "ease-out",
      animationFillMode: "forwards",
      animationDelay: "50ms",
    },
  };
}, { name: "date-pickers-calendar-animation" });
