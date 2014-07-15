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
    onClickMostRecent: React.PropTypes.func.isRequired,
    onClickNext: React.PropTypes.func,
    onClickOneDay: React.PropTypes.func.isRequired,
    onClickTwoWeeks: React.PropTypes.func.isRequired,
    onClickSettings: React.PropTypes.func.isRequired
  },
  render: function() {
    var next = this.props.next;
    var back = this.props.back;
    var mostRecent = this.props.mostRecent;

    var dayLinkClass = cx({
      'tidelineNavLabel': true,
      'active': this.props.chartType === 'daily'
    });

    var weekLinkClass = cx({
      'tidelineNavLabel': true,
      'active': this.props.chartType === 'weekly'
    });

    var mostRecentLinkClass = cx({
      'tidelineNavLabel': true,
      'active': this.props.atMostRecent
    });

    var backClass = cx({
      'active': !this.props.inTransition,
      'inactive': this.props.inTransition,
      'hidden': this.props.chartType === 'settings'
    });

    var nextClass = cx({
      'active': !this.props.atMostRecent && !this.props.inTransition,
      'inactive': this.props.atMostRecent || this.props.inTransition,
      'hidden': this.props.chartType === 'settings'
    });

    var settingsLinkClass = cx({
      'tidelineNavLabel': true,
      'tidelineNavRightLabel': true,
      'active': this.props.chartType === 'settings'
    });

    /* jshint ignore:start */
    return (
      <div className="tidelineNav grid">
        <div className="grid-item one-quarter">
          <div className="grid-item three-eighths">
            <a className={dayLinkClass} onClick={this.props.onClickOneDay}>One Day</a>
          </div>
          <div className="grid-item one-half">
            <a className={weekLinkClass} onClick={this.props.onClickTwoWeeks}>Two Weeks</a>
          </div>
        </div>
        <div className="grid-item one-half" id="tidelineLabel">
          <a href="#" className={backClass} onClick={this.props.onClickBack}><i className={this.props.iconBack}/></a>
          <div className="tidelineNavLabelWrapper">
            <span className="tidelineNavLabel">{this.props.title}</span>
          </div>
          <a href="#" className={nextClass} onClick={this.props.onClickNext}><i className={this.props.iconNext}/></a>
          <a href="#" className={mostRecentLinkClass} onClick={this.props.onClickMostRecent}><i className={this.props.iconMostRecent}/></a>
        </div>
        <div className="grid-item one-quarter">
          <a className={settingsLinkClass} onClick={this.props.onClickSettings}>Device Settings</a>
        </div>
      </div>
      );
    /* jshint ignore:end */
  }
});

module.exports = TidelineHeader;
