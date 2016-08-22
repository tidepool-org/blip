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
import Collapse from 'react-collapse';

import styles from './CollapsibleContainer.css';

class CollapsibleContainer extends React.Component {

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
    let label = (<div className="label" onClick={this.handleClick}>{this.props.label}</div>);
    if (this.props.styledLabel) {
      label = (
        <div className={this.props.styledLabel.className} onClick={this.handleClick}>
          {this.props.styledLabel.label}
        </div>
      );
    }

    return (
      <div className={styles.wrapper}>
        {label}
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

CollapsibleContainer.propTypes = {
  children: React.PropTypes.element.isRequired,
  label: React.PropTypes.string,
  styledLabel: React.PropTypes.object,
  openByDefault: React.PropTypes.bool,
};

export default CollapsibleContainer;
