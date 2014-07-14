/** @jsx React.DOM */
var bows = window.bows;
var React = window.React;
var cx = React.addons.classSet;

var tideline = {
  log: bows('Footer')
};

var TidelineFooter = React.createClass({
  propTypes: {
    chartType: React.PropTypes.string.isRequired,
    onClickValues: React.PropTypes.func,
    showingValues: React.PropTypes.bool,
    onClickRefresh: React.PropTypes.func
  },
  render: function() {
    var valuesLinkClass = cx({
      'tidelineNavLabel': true,
      'tidelineNavRightLabel': true
    });

    var refreshLinkClass = cx({
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    function getValuesLinkText(props) {
      if (props.chartType === 'weekly') {
        if (props.showingValues) {
          return 'Hide numbers';
        }
        else {
          return 'Show numbers';
        }
      }
      else {
        return '';
      }
    }

    var valuesLinkText = getValuesLinkText(this.props);

    /* jshint ignore:start */
    var showValues = (
      <a className={valuesLinkClass} onClick={this.props.onClickValues}>{valuesLinkText}</a>
      );
    /* jshint ignore:end */

    /* jshint ignore:start */
    return (
      <div className="container-box-outer patient-data-footer-outer">
        <div className="container-box-inner patient-data-footer-inner">
          <div className="grid patient-data-footer">
            <div className="grid-item one-whole medium-one-half patient-data-footer-left">
              <a href="" className={refreshLinkClass} onClick={this.props.onClickRefresh}><i className="icon-refresh"/> Refresh</a>
            </div>
            <div href="" className="grid-item one-whole medium-one-half patient-data-footer-right">{showValues}</div>
          </div>
        </div>
      </div>
      );
    /* jshint ignore:end */
  }
});

module.exports = TidelineFooter;
