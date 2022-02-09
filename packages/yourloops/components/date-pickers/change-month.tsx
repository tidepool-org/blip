/**
 * Copyright (c) 2022, Diabeloop
 * A state to handle the changing month animation.
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
import { Dayjs } from "dayjs";

import {
  ChangeMonthDirection,
  CalendarChangeMonth,
  CalendarMode,
  TRANSITION_DURATION,
} from "./models";

interface ChangeMonthProps {
  mode: CalendarMode;
  currentMonth: Dayjs;
  setCurrentMonth: (month: Dayjs) => void;
  minDate: Dayjs;
  maxDate: Dayjs;
}

type ChangeMonthState = [
  CalendarChangeMonth | null,
  (() => void) | undefined,
  (() => void) | undefined,
];

/**
* Used to compare if month are before/after
* @param d The date
* @returns a number representing only year & month
*/
export function toYearMonth(d: Dayjs): number {
  return d.year() * 100 + d.month();
}

export function useChangeMonthState(props: ChangeMonthProps): ChangeMonthState {
  const { mode, currentMonth, minDate, maxDate, setCurrentMonth } = props;
  const [changingMonth, setChangingMonth] = React.useState<CalendarChangeMonth | null>(null);

  const prevMonth = currentMonth.subtract(1, "month");
  const minMonth = toYearMonth(minDate);
  const maxMonth = toYearMonth(maxDate);

  const changeCurrentMonth = (toMonth: Dayjs, direction: ChangeMonthDirection) => {
    const transitionTimeoutThreshold = 150;
    let timeoutTransition = 0;
    const onAnimationEnd = () => {
      if (timeoutTransition > 0) {
        window.clearTimeout(timeoutTransition);
        timeoutTransition = 0;
        setCurrentMonth(toMonth);
        setChangingMonth(null);
      }
    };
    timeoutTransition = window.setTimeout(onAnimationEnd, TRANSITION_DURATION + transitionTimeoutThreshold);
    setChangingMonth({
      direction,
      toMonth,
      onAnimationEnd,
    });
  };

  const canGoPrevMonth = minMonth < toYearMonth(mode === "range" ? prevMonth : currentMonth);
  const handlePrevMonth = canGoPrevMonth ? (): void => {
    changeCurrentMonth(prevMonth, "left");
  } : undefined;
  const canGoNextMonth = maxMonth > toYearMonth(currentMonth);
  const handleNextMonth = canGoNextMonth ? (): void => {
    changeCurrentMonth(currentMonth.add(1, "month"), "right");
  } : undefined;

  return [changingMonth, handlePrevMonth, handleNextMonth];
}
