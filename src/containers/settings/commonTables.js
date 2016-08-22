/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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
import React from 'react';

import Table from '../../components/common/Table';
import CollapsibleContainer from '../common/CollapsibleContainer';

import * as common from './common';

export function buildBasalRateTables(titleClass, columns, basalScheduleData, activeSchedule) {
  const schedules = common.getScheduleNames(basalScheduleData);

  const tables = schedules.map((schedule) => {
    const starts = basalScheduleData[schedule].map(s => s.start);
    const data = starts.map((startTime) => (
      { start: common.getTime(
          basalScheduleData[schedule],
          startTime
        ),
        rate: common.getBasalRate(
          basalScheduleData[schedule],
          startTime
        ),
      }
    ));

    data.push({
      start: 'Total',
      rate: common.getTotalBasalRates(basalScheduleData[schedule]),
    });

    const title = { label: schedule, className: titleClass };

    return (
      <div>
        <CollapsibleContainer
          styledLabel={title}
          openByDefault={schedule === activeSchedule}
        >
          <Table
            rows={data}
            columns={columns}
          />
        </CollapsibleContainer>
      </div>
    );
  });
  return (<div>{tables}</div>);
}

export function buildSensitivityTable(title, columns, sensitivityData, bgUnits) {
  const starts = sensitivityData.map(s => s.start);
  const data = starts.map((startTime) => (
    { start: common.getTime(
        sensitivityData,
        startTime
      ),
      amount: common.getBloodGlucoseValue(
        sensitivityData,
        'amount',
        startTime,
        bgUnits
      ),
    }
  ));

  return (
    <div>
      <Table
        title={title}
        rows={data}
        columns={columns}
      />
    </div>
  );
}

export function buildBgTargetTable(title, columns, targetsData, bgUnits) {
  const starts = targetsData.map(s => s.start);
  const data = starts.map((startTime) => (
    { start: common.getTime(
        targetsData,
        startTime
      ),
      low: common.getBloodGlucoseValue(
        targetsData,
        'low',
        startTime,
        bgUnits
      ),
      high: common.getBloodGlucoseValue(
        targetsData,
        'high',
        startTime,
        bgUnits
      ),
    }
  ));

  return (
    <div>
      <Table
        title={title}
        rows={data}
        columns={columns}
      />
    </div>
  );
}

export function buildCarbRatioTable(title, columns, carbRatioData) {
  const starts = carbRatioData.map(s => s.start);
  const data = starts.map((startTime) => (
    { start: common.getTime(
        carbRatioData,
        startTime
      ),
      amount: common.getValue(
        carbRatioData,
        'amount',
        startTime
      ),
    }
  ));

  return (
    <div>
      <Table
        title={title}
        rows={data}
        columns={columns}
      />
    </div>
  );
}
