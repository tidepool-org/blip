/**
 * Copyright (c) 2021, Diabeloop
 * Types definitions for Typescript
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

export type SortDirection = "asc" | "desc";
export type SortFields = "lastname" | "firstname";
export type FilterType = "all" | "flagged" | "pending" | string;

/**
 * FIXME: Remove me when we have the team API
 */
export interface Team {
  id: string;
  name: string;
}
