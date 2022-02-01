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

import {
  SITE_CHANGE_BY_MANUFACTURER,
  DEFAULT_MANUFACTURER,
  SITE_CHANGE_RESERVOIR,
  SITE_CHANGE_CANNULA,
  SITE_CHANGE_TUBING,
} from "./constants";
import CalendarContainer from "../components/CalendarContainer";
import SiteChangeSelector from "../components/sitechange/Selector";
import SiteChange from "../components/chart/SiteChange";
import InfusionHoverDisplay from "../components/day/hover/InfusionHoverDisplay";
import togglableState from "../TogglableState";

function basicsState(source, manufacturer) {
  const t = i18next.t.bind(i18next);
  const siteChangesTitle = _.get(
    _.get(SITE_CHANGE_BY_MANUFACTURER, manufacturer, SITE_CHANGE_BY_MANUFACTURER[DEFAULT_MANUFACTURER]),
    "label"
  );

  return {
    sections: {
      siteChanges: {
        active: true,
        chart: React.createFactory(SiteChange),
        column: "right",
        container: CalendarContainer,
        hasHover: true,
        hoverDisplay: React.createFactory(InfusionHoverDisplay),
        id: "siteChanges",
        index: 1,
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
