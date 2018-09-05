var _ = require('lodash');
var React = require('react');
var i18next = require('i18next');
var t = i18next.t.bind(i18next);

var NoDataContainer = React.createClass({
  propTypes: {
    message: React.PropTypes.string.isRequired,
    moreInfo: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      message: t('No available data to display here, sorry!')
    };
  },

  render: function() {
    var moreInfo = null;
    if (!_.isEmpty(this.props.moreInfo)) {
      moreInfo = (
        <p>{this.props.moreInfo}</p>
      );
    }
    return (
      <div className="NoDataContainer">
        <p>{this.props.message}</p>
        {moreInfo}
      </div>
    );
  }
});

module.exports = NoDataContainer;
