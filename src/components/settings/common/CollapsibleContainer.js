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

import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import Collapse from 'react-collapse';

import SingleLineCollapsibleContainerLabel from './SingleLineCollapsibleContainerLabel';
import TwoLineCollapsibleContainerLabel from './TwoLineCollapsibleContainerLabel';

import styles from './CollapsibleContainer.css';

class CollapsibleContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { isOpened: this.props.openByDefault };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const current = this.state.isOpened;
    this.setState({ isOpened: !current });
  }

  render() {
    const { label, labelClass } = this.props;
    let renderedLabel = (
      <SingleLineCollapsibleContainerLabel
        className={labelClass}
        isOpened={this.state.isOpened}
        label={label}
        onClick={this.handleClick}
      />
    );
    const { twoLineLabel, label: { secondary } } = this.props;
    if (twoLineLabel && !_.isEmpty(secondary)) {
      renderedLabel = (
        <TwoLineCollapsibleContainerLabel
          className={labelClass}
          isOpened={this.state.isOpened}
          label={label}
          onClick={this.handleClick}
        />
      );
    }

    return (
      <div>
        {renderedLabel}
        <Collapse
          className={styles.collapsibleContainer}
          isOpened={this.state.isOpened}
          springConfig={{ stiffness: 120, damping: 20 }}
        >
          <div>{this.props.children}</div>
        </Collapse>
      </div>
    );
  }
}

CollapsibleContainer.defaultProps = {
  twoLineLabel: true,
};

CollapsibleContainer.propTypes = {
  children: PropTypes.element.isRequired,
  label: PropTypes.shape({
    main: PropTypes.string.isRequired,
    secondary: PropTypes.string.isRequired,
    units: PropTypes.string.isRequired,
  }).isRequired,
  labelClass: PropTypes.string.isRequired,
  openByDefault: PropTypes.bool.isRequired,
  twoLineLabel: PropTypes.bool,
};

export default CollapsibleContainer;
