/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
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

import enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";

enzyme.configure({
  adapter: new Adapter(),
  disableLifecycleMethods: true,
});

window.d3 = require("d3");
window.d3.chart = require("d3.chart");

// DOM not required
// ====================================

/* js/data/ */
import "./format.test";
import "./datetime.test";
import "./constants.test";
import "./tidelinedata.test";
import "./basalutil.test";
import "./bgutil.test";
import "./bolusutil.test";
import "./categorize.test";

/* js/plot/ */
import "./annotations.test";
import "./commonbolus.test";
import "./device.test";

// DOM required
// ====================================

/* plugins/ */
import "./chartbasicsfactory.test";
import "./basics_classifiers.test";
import "./basics_datamunger.test";
import "./nurseshark.test";

import "./blip/components/day/hover/InfusionHoverDisplay.test.js";
import "./blip/components/logic/actions.test.js";
import "./blip/components/misc/SummaryGroup.test.js";
import "./blip/components/sitechange/Selector.test.js";
import "./blip/components/BasicsUtils.test.js";
import "./blip/components/CalendarContainer.test.js";
