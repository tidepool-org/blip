/*
* == BSD2 LICENSE ==
* Copyright (c) 2017, Tidepool Project
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
import { Cell } from 'fixed-data-table-2';

const SortTypes = {
  ASC: 'asc',
  DESC: 'desc',
};

function reverseSortDirection(sortDir) {
  return sortDir === SortTypes.DESC ? SortTypes.ASC : SortTypes.DESC;
}

class SortHeaderCell extends React.Component {
  constructor(props) {
    super(props);
    this.handleSortChange = this.handleSortChange.bind(this);
  }

  handleSortChange(e) {
    e.preventDefault();

    const { onSortChange, sortDir, columnKey } = this.props;

    if (onSortChange) {
      onSortChange(
        columnKey,
        sortDir ?
          reverseSortDirection(sortDir) :
          SortTypes.DESC,
        true
      );
    }
  }

  render() {
    const { onSortChange, sortDir, children, ...props } = this.props;
    let sortDirectionClass = 'peopletable-search-icon';

    if (sortDir === SortTypes.DESC) {
      sortDirectionClass += ' icon-arrow-down';
    } else if (sortDir === SortTypes.ASC) {
      sortDirectionClass += ' icon-arrow-up';
    }

    return (
      <Cell {...props}>
        <a onClick={this.handleSortChange}>
          {children} <i className={sortDirectionClass}></i>
        </a>
      </Cell>
    );
  }
}

SortHeaderCell.propTypes = {
  columnKey: React.PropTypes.string,
  onSortChange: React.PropTypes.func,
  sortDir: React.PropTypes.string,
};

export { SortHeaderCell, SortTypes };
