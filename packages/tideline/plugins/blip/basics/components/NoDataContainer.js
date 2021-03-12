import i18next from "i18next";

import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";

class NoDataContainer extends React.Component {
  static propTypes = {
    message: PropTypes.string,
    moreInfo: PropTypes.string,
  };

  static defaultProps = {
    message: null,
    moreInfo: null,
  };

  render() {
    let moreInfo = null;
    if (!_.isEmpty(this.props.moreInfo)) {
      moreInfo = <p>{this.props.moreInfo}</p>;
    }
    const message = _.isEmpty(this.props.message) ? i18next.t("No available data to display here, sorry!") : this.props.message;
    return (
      <div className="NoDataContainer">
        <p>{message}</p>
        {moreInfo}
      </div>
    );
  }
}

export default NoDataContainer;
