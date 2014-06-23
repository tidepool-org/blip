/** @jsx React.DOM */
var bows = window.bows;
var d3 = window.d3;
var React = window.React;
var cx = React.addons.classSet;

var back = require('../blip_icons_back.svg');
var next = require('../blip_icons_next.svg');

var tideline = {
  log: bows('Header')
};

var TidelineHeader = React.createClass({
  propTypes: {
    chartType: React.PropTypes.string.isRequired,
    onClickBack: React.PropTypes.func,
    onClickMostRecent: React.PropTypes.func.isRequired,
    onClickNext: React.PropTypes.func,
    onClickOneDay: React.PropTypes.func.isRequired,
    onClickTwoWeeks: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      atMostRecent: false,
      inTransition: false
    };
  },
  componentDidMount: function() {
    if (this.props.chartType === 'settings') {
      this.updateMostRecent(true);
    }
    else {
      this.updateMostRecent();
    }
    this.updateTitle();
  },
  render: function() {
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
      'tidelineNavRightLabel': true,
      'active': this.state.atMostRecent
    });

    var backClass = cx({
      'active': !this.state.inTransition,
      'inactive': this.state.inTransition,
      'hidden': this.props.chartType === 'settings'
    });

    var nextClass = cx({
      'active': !this.state.atMostRecent && !this.state.inTransition,
      'inactive': this.state.atMostRecent || this.state.inTransition,
      'hidden': this.props.chartType === 'settings'
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
          <img src={back} className={backClass} ref="back" onClick={this.props.onClickBack} />
          <div className="tidelineNavLabelWrapper">
            <span className="tidelineNavLabel" ref="title"></span>
          </div>
          <img src={next} className={nextClass} ref="next" onClick={this.props.onClickNext} />
        </div>
        <div className="grid-item one-quarter">
          <a className={mostRecentLinkClass} onClick={this.props.onClickMostRecent} ref="mostRecent">Most Recent</a>
        </div>
      </div>
      );
    /* jshint ignore:end */
  },
  arrowsInTransition: function(inTransition) {
    this.setState({
      inTransition: inTransition
    });
  },
  updateMostRecent: function(mostRecent) {
    this.setState({
      atMostRecent: mostRecent
    });
  },
  updateTitle: function(title) {
    function getTitle(props) {
      if (props.chartType === 'settings') {
        return 'Device Settings';
      }
      else if (title) {
        return title;
      }
      else {
        return 'Data';
      }
    }
    d3.select(this.refs.title.getDOMNode())
      .html(getTitle(this.props));
  }
});

module.exports = TidelineHeader;