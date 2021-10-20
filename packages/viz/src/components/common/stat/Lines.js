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

import React from "react";
import PropTypes from "prop-types";

// @ts-ignore
import styles from "./Stat.css";

/**
  * Display the data name and the value
  * @param {{data: {id: string, value: number, valueString: string, units: string, name: string, displayLine?: boolean}[], id: string}} props
  */
function Lines(props) {
  const { data, id } = props;

  const elements = [];
  data.forEach((v) => {
    if (!v.displayLine) {
      return;
    }
    elements.push(
      <span
        key={`${v.id}-name`}
        id={`stats-line-${id}-${v.id}-text`}
        className={`${styles.statLineRowName} ${styles[`stats-line-${id}-${v.id}`] ?? ""}`}>
        {v.name}
      </span>
    );
    elements.push(
      <div
        key={`${v.id}-value`}
        id={`stats-line-${id}-${v.id}-value`}
        className={`${styles.statLineRowValue} ${styles[`stats-line-${id}-${v.id}`] ?? ""}`}>
        <span className={styles.statLineRowValueString}>{ v.value > 0 ? v.valueString : "0" }</span>
        <span className={styles.statLineRowUnits}>{v.units}</span>
      </div>
    );
  });
  return (
    <div id={`stats-line-${id}`} className={`${styles.statLines} ${styles[`statLines-${id}`] ?? ""}`}>
      {elements}
    </div>
  );
}

Lines.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    valueString: PropTypes.string.isRequired,
    units: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    displayLine: PropTypes.bool,
  })).isRequired,
  id: PropTypes.string.isRequired,
};

export default Lines;
