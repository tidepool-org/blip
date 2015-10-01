var _ = require('lodash');
var React = require('react');

var NoDataContainer = React.createClass({
  propTypes: {
    message: React.PropTypes.string.isRequired,
    moreInfo: React.PropTypes.string
  },
  getDefaultProps: function() {
    return {
      message: 'No available data to display here, sorry!'
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
      <div>
        <p>{this.props.message}</p>
        {moreInfo}
      </div>
    );
  }
});

module.exports = NoDataContainer;