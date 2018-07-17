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

import React, { PropTypes } from 'react';
import _ from 'lodash';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryPie } from 'victory';

import styles from './Stat.css';

const colors = {
  basal: '#19A0D7',
  basalAutomated: '#00D3E6',
  bolus: '#7CD0F0',
  smbg: '#6480FB',
  veryLow: '#FF8B7C',
  low: '#FF8B7C',
  target: '#76D3A6',
  high: '#BB9AE7',
  veryHigh: '#BB9AE7',
};

export const statTypes = {
  barHorizontal: 'barHorizontal',
  barVertical: 'barVertical',
  pie: 'pie',
};

const Stat = (props) => {
  const { type } = props;

  let chartRenderer;
  let chartProps;

  switch (type) {
    case 'pie':
      chartProps = {
        style: {
          data: {
            fill: d => colors[d.x],
          },
        },
        ...props,
      };
      chartRenderer = () => {
        return (
          <VictoryPie {...chartProps} />
        );
      };
      break;

    case 'barVertical':
      chartProps = {
        horizontal: false,
        cornerRadius: 4,
        style: {
          data: {
            fill: d => colors[d.x],
          },
        },
        ...props,
      };
      chartRenderer = () => {
        return (
          <VictoryBar {...chartProps} />
        );
      };
      break;

    case 'barHorizontal':
    default:
      chartProps = {
        horizontal: true,
        cornerRadius: 4,
        style: {
          data: {
            fill: d => colors[d.x],
          },
        },
        ...props,
      };
      chartRenderer = () => {
        return (
          <VictoryBar {...chartProps} />
        );
      };
      break;
  }

  return (
    <div className={styles[type]}>
      <VictoryChart maxDomain={{ x: 1.0 }} animate={{ duration: 300 }} >
        {chartRenderer()}
      </VictoryChart>
    </div>
  );
};

Stat.defaultProps = {
  type: statTypes.barHorizontal.type,
};

Stat.propTypes = {
  type: PropTypes.oneOf(_.map(statTypes, t => t.type)),
  data: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
};

export default Stat;
