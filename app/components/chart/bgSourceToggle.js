import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';

import { BG_DATA_TYPES } from '../../core/constants';

const { TwoOptionToggle } = vizComponents;
const { statBgSourceLabels } = vizUtils.stat;

class BgSourceToggle extends PureComponent {
  static propTypes = {
    bgSource: PropTypes.oneOf(BG_DATA_TYPES),
    bgSources: PropTypes.shape({
      cbg: PropTypes.bool.isRequired,
      smbg: PropTypes.bool.isRequired,
    }).isRequired,
    onClickBgSourceToggle: PropTypes.func.isRequired,
  };

  static displayName = 'BgSourceToggle';

  render = () => {
    const showToggle = this.props.bgSources.cbg || this.props.bgSources.smbg;
    const disabled = !(this.props.bgSources.cbg && this.props.bgSources.smbg);

    return (
      <div className="toggle-container">
        {showToggle ? <TwoOptionToggle
          left={{ label: statBgSourceLabels.smbg, state: this.props.bgSource === 'smbg' }}
          right={{ label: statBgSourceLabels.cbg, state: this.props.bgSource === 'cbg' }}
          toggleFn={this.handleBgToggle}
          disabled={disabled}
        /> : null}
      </div>
    );
  };

  handleBgToggle = (e) => {
    if (e) {
      e.preventDefault();
    }

    if (this.props.bgSource) {
      const bgSource = this.props.bgSource === 'cbg' ? 'smbg' : 'cbg';
      this.props.onClickBgSourceToggle(e, bgSource);
    }
  };
};

export default BgSourceToggle;
