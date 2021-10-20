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

import bows from "bows";

import shapeutil from "../shapeutil";

const log = bows("AnnotationShapes");
function tooltipPolygon(opts = {}) {
  const { w, h, t, k } = opts;
  if (!(Number.isFinite(w) && Number.isFinite(h) && Number.isFinite(t) && Number.isFinite(k))) {
    log.warn("Sorry, I need w, h, t, and k variables to generate a tooltip polygon.");
  }

  return shapeutil.pointString(0,0) +
    shapeutil.pointString((t/2), k) +
    shapeutil.pointString((w-(3/2*t)), k) +
    shapeutil.pointString((w-(3/2*t)), (k+h)) +
    shapeutil.pointString((0-(3/2*t)), (k+h)) +
    shapeutil.pointString((0-(3/2*t)), k) +
    shapeutil.pointString((0-(t/2)), k) + "0,0";
}

export default tooltipPolygon;
