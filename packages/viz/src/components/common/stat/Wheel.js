/**
 * Copyright (c) 2020, Diabeloop
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import styles from './Stat.css';

const circleRadius = 70;

function isValidPercent(value) {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

function WheelPercent(props) {
  const { values, rawValues, units, className } = props;

  const valid = isValidPercent(values.on) && isValidPercent(values.off);
  const onValue = valid ? values.on.toString(10) : i18next.t('N/A');
  const offValue = valid ? values.off.toString(10) : i18next.t('N/A');

  const clipPaths = [];
  let optsStyle = {};
  if (valid) {
    const angle = values.off * Math.PI / 100;
    const x = circleRadius*2.0 * Math.cos(angle);
    const y = -circleRadius*2.0 * Math.sin(angle);
    if (values.off > 50) {
      clipPaths.push(<path d="M0,0 l140,0 l0,-140 l-140,0 Z" key="50%" />);
      clipPaths.push(<path d={`M0,0 l0,-140 L${x},${y} Z`} key="percent-leftover"/>);
    } else {
      clipPaths.push(<path d={`M0,0 L${circleRadius*2.0},0 L${x},${y} Z`} key="percent" />);
    }
  } else {
    clipPaths.push(<rect x="-70" y="-70" width="140" height="140" key="n/a" />);
    optsStyle = {
      display: 'none',
    };
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 290 80" className={`${className} ${styles.donutChart}`}>
      <g className={styles.onColor} transform="translate(10 15)">
        <rect className={styles.legendBackground} width="40" height="20" rx="8" />
        <text x="20" y="10" textAnchor="middle" dominantBaseline="central" className={styles.legendLabelText}>{i18next.t('wheel-label-on')}</text>
      </g>
      <g className={styles.offColor} transform="translate(240 15)">
        <rect className={styles.legendBackground} width="40" height="20" rx="8" />
        <text x="20" y="10" textAnchor="middle" dominantBaseline="central" className={styles.legendLabelText}>{i18next.t('wheel-label-off')}</text>
      </g>
      <g className={styles.labelOnValueUnits} transform="translate(30 63)">
        <text className={styles.labelValueUnits} textAnchor="middle">
          <tspan className={styles.legendLabelValue}>{onValue}</tspan>
          <tspan className={styles.legendLabelUnits} style={optsStyle} dy="-4">{units}</tspan>
        </text>
        <text className={styles.labelRawValue} style={optsStyle} textAnchor="middle" dy="12">{rawValues.on}</text>
      </g>
      <g className={styles.labelOffValueUnits} transform="translate(260 63)">
        <text className={styles.labelValueUnits} textAnchor="middle">
          <tspan className={styles.legendLabelValue}>{offValue}</tspan>
          <tspan className={styles.legendLabelUnits} style={optsStyle} dy="-4">{units}</tspan>
        </text>
        <text className={styles.labelRawValue} style={optsStyle} textAnchor="middle" dy="12">{rawValues.off}</text>
      </g>
      <g transform="translate(145 75)">
        <mask id="half-wheel-mask">
          <rect x="-70" y="-70" width="140" height="70" fill="white" />
          <circle cx="0" cy="0" r="40" fill="black" />
        </mask>
        <clipPath id="half-circle-percent-clip">
          {clipPaths}
        </clipPath>
        <circle className={styles.onEllipse} cx="0" cy="0" r="70" fill="blue" mask="url(#half-wheel-mask)" />
        <circle className={styles.offEllipse} cx="0" cy="0" r="70" fill="grey" mask="url(#half-wheel-mask)" clipPath="url(#half-circle-percent-clip)"/>
      </g>
    </svg>
  );
}

WheelPercent.propTypes = {
  values: PropTypes.shape({
    on: PropTypes.number.isRequired,
    off: PropTypes.number.isRequired,
  }).isRequired,
  className: PropTypes.string.isRequired,
  units: PropTypes.string,
  rawValues: PropTypes.shape({
    on: PropTypes.string.isRequired,
    off: PropTypes.string.isRequired,
  }).isRequired,
};
WheelPercent.defaultProps = {
  units: '%'
};

export default WheelPercent;
