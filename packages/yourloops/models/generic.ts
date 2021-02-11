/**
 * Copyright (c) 2021, Diabeloop
 * Yourloops API client generic type definition
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
 */

enum Units {
  mole = "mmol/L",
  gram = "mg/dL",
}

interface PostalAddress {
  line1: string;
  line2?: string;
  zip: string;
  city: string;
  country: string;
}

export { PostalAddress, Units };
