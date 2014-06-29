/** @jsx React.DOM */
var bows = window.bows;
var React = window.React;
var cx = React.addons.classSet;

var tideline = {
  log: bows('Header')
};

var TidelineHeader = React.createClass({
  propTypes: {
    chartType: React.PropTypes.string.isRequired,
    inTransition: React.PropTypes.bool.isRequired,
    atMostRecent: React.PropTypes.bool.isRequired,
    title: React.PropTypes.string.isRequired,
    onClickBack: React.PropTypes.func,
    onClickMostRecent: React.PropTypes.func,
    onClickNext: React.PropTypes.func,
    onClickOneDay: React.PropTypes.func,
    onClickRefresh: React.PropTypes.func,
    onClickTwoWeeks: React.PropTypes.func
  },
  render: function() {
    var dayLinkClass = cx({
      'patient-data-subnav-active': this.props.chartType === 'daily',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    var weekLinkClass = cx({
      'patient-data-subnav-active': this.props.chartType === 'weekly',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    var refreshLinkClass = cx({
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    var mostRecentLinkClass = cx({
      'patient-data-subnav-active': this.props.atMostRecent,
      'patient-data-subnav-hidden': this.props.chartType === 'no-data'
    });

    var backClass = cx({
      'patient-data-subnav-active': !this.props.inTransition,
      'patient-data-subnav-disabled': this.props.inTransition,
      'patient-data-subnav-hidden': this.props.chartType === 'settings' ||
        this.props.chartType === 'no-data'
    });

    var nextClass = cx({
      'patient-data-subnav-active': !this.props.atMostRecent && !this.props.inTransition,
      'patient-data-subnav-disabled': this.props.atMostRecent || this.props.inTransition,
      'patient-data-subnav-hidden': this.props.chartType === 'settings' ||
        this.props.chartType === 'no-data'
    });

    /* jshint ignore:start */
    return (
      <div className="container-box-outer patient-data-subnav-outer">
        <div className="container-box-inner patient-data-subnav-inner">
          <div className="grid patient-data-subnav">
            <div className="grid-item one-whole large-one-quarter">
              <div className="grid-item large-three-eighths">
                <a href="" className={dayLinkClass} onClick={this.props.onClickOneDay}>One Day</a>
              </div>
              <div className="grid-item large-one-half patient-data-subnav-left">
                <a href="" className={weekLinkClass} onClick={this.props.onClickTwoWeeks}>Two Weeks</a>
              </div>
            </div>
            <div className="grid-item one-whole large-one-half patient-data-subnav-center" id="tidelineLabel">
              <a href="" className={backClass} onClick={this.props.onClickBack}><i className="icon-back"/></a>
              <div className="patient-data-subnav-text patient-data-subnav-text-dates">
                {this.props.title}
              </div>
              <a href="" className={nextClass} onClick={this.props.onClickNext}><i className="icon-next"/></a>
            </div>
            <div className="grid-item one-whole large-one-quarter">
              <div className="grid-item one-whole large-one-half patient-data-subnav-right">
                <a href="" className={refreshLinkClass} onClick={this.props.onClickRefresh}>Refresh</a>
              </div>
              <div className="grid-item one-whole large-one-half">
                <a href="" className={mostRecentLinkClass} onClick={this.props.onClickMostRecent}>Most Recent</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      );
    /* jshint ignore:end */
  }
});

module.exports = TidelineHeader;