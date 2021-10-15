/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015 Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import i18next from "i18next";
import _ from "lodash";
import React from "react";

import { AUTOMATED_BASAL_LABELS } from "../../../../js/data/util/constants";

import {
  SITE_CHANGE_BY_MANUFACTURER,
  DEFAULT_MANUFACTURER,
  SITE_CHANGE_RESERVOIR,
  SITE_CHANGE_CANNULA,
  SITE_CHANGE_TUBING,
} from "./constants";
import CalendarContainer from "../components/CalendarContainer";
import SummaryGroup from "../components/misc/SummaryGroup";
import SiteChangeSelector from "../components/sitechange/Selector";
import WrapCount from "../components/chart/WrapCount";
import SiteChange from "../components/chart/SiteChange";
import InfusionHoverDisplay from "../components/day/hover/InfusionHoverDisplay";
import togglableState from "../TogglableState";

function basicsState(source, manufacturer) {
  const t = i18next.t.bind(i18next);
  const automatedLabel = _.get(AUTOMATED_BASAL_LABELS, source, AUTOMATED_BASAL_LABELS.default);
  const siteChangesTitle = _.get(
    _.get(SITE_CHANGE_BY_MANUFACTURER, manufacturer, SITE_CHANGE_BY_MANUFACTURER[DEFAULT_MANUFACTURER]),
    "label"
  );

  const summaryGroup = React.createFactory(SummaryGroup);
  return {
    sections: {
      basals: {
        active: true,
        chart: React.createFactory(WrapCount),
        column: "right",
        container: CalendarContainer,
        hasHover: true,
        id: "basals",
        index: 4,
        togglable: togglableState.off,
        selector: summaryGroup,
        selectorOptions: {
          primary: { key: "total", label: t("Basal Events") },
          rows:
            source === "Diabeloop"
              ? [
                  [
                    // { key: 'temp', label: t('Temp Basals') },
                    { key: "automatedStart", label: automatedLabel },
                    { key: "automatedStop", label: t("{{automatedLabel}} Exited", { automatedLabel }) },
                  ],
                ]
              : [
                  [
                    { key: "temp", label: t("Temp Basals") },
                    { key: "suspend", label: t("Suspends") },
                    { key: "automatedStop", label: t("{{automatedLabel}} Exited", { automatedLabel }) },
                  ],
                ],
        },
        settingsTogglable: togglableState.off,
        title: t("Basals"),
        type: "basal",
      },
      boluses: {
        active: true,
        chart: React.createFactory(WrapCount),
        column: "right",
        container: CalendarContainer,
        hasHover: true,
        id: "boluses",
        index: 2,
        togglable: togglableState.off,
        selector: summaryGroup,
        selectorOptions: {
          primary: { key: "total", label: t("Avg per day"), average: true },
          rows:
            source === "Diabeloop"
              ? [
                  [
                    { key: "wizard", label: t("Calculator"), percentage: true },
                    { key: "manual", label: t("micro-bolus"), percentage: true },
                    { key: "interrupted", label: t("Interrupted"), percentage: true },
                  ],
                ]
              : [
                  [
                    { key: "wizard", label: t("Calculator"), percentage: true },
                    { key: "correction", label: t("Correction"), percentage: true },
                    { key: "override", label: t("Override"), percentage: true },
                  ],
                  [
                    { key: "extended", label: t("Extended"), percentage: true },
                    { key: "interrupted", label: t("Interrupted"), percentage: true },
                    { key: "underride", label: t("Underride"), percentage: true },
                  ],
                ],
        },
        settingsTogglable: togglableState.off,
        title: t("Bolusing"),
        type: "bolus",
      },
      siteChanges: {
        active: true,
        chart: React.createFactory(SiteChange),
        column: "right",
        container: CalendarContainer,
        hasHover: true,
        hoverDisplay: React.createFactory(InfusionHoverDisplay),
        id: "siteChanges",
        index: 3,
        noDataMessage: "",
        togglable: togglableState.off,
        selector: React.createFactory(SiteChangeSelector),
        selectorOptions: {
          primary: { key: SITE_CHANGE_RESERVOIR, label: t("Reservoir changes") },
          rows: [
            [
              { key: SITE_CHANGE_CANNULA, label: t("Cannula Fills") },
              { key: SITE_CHANGE_TUBING, label: t("Tube Primes") },
            ],
          ],
        },
        settingsTogglable: togglableState.closed,
        title: t(siteChangesTitle),
        type: SITE_CHANGE_RESERVOIR,
      },
    },
  };
}

export default basicsState;
