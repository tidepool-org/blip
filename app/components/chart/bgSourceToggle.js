import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';

import { BG_DATA_TYPES } from '../../core/constants';

const { TwoOptionToggle } = vizComponents;
const { statBgSourceLabels } = vizUtils.stat;

class BgSourceToggle extends PureComponent {
  static propTypes = {
    bgSources: PropTypes.shape({
      cbg: PropTypes.bool.isRequired,
      smbg: PropTypes.bool.isRequired,
      current: PropTypes.string,
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
          left={{ label: statBgSourceLabels.smbg, state: this.props.bgSources.current === 'smbg' }}
          right={{ label: statBgSourceLabels.cbg, state: this.props.bgSources.current === 'cbg' }}
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

    if (this.props.bgSources.current) {
      const bgSource = this.props.bgSources.current === 'cbg' ? 'smbg' : 'cbg';
      this.props.onClickBgSourceToggle(e, bgSource);
    }
  };
};

export default BgSourceToggle;
