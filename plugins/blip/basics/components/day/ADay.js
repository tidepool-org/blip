var React = require('react');
var moment = require('moment');

var ADay = React.createClass({
  propTypes: {
    dayAbbrevMask: React.PropTypes.string.isRequired,
    chart: React.PropTypes.func.isRequired,
    data: React.PropTypes.object,
    date: React.PropTypes.string.isRequired,
    future: React.PropTypes.bool.isRequired
  },
  getDefaultProps: function() {
    return {
      dayAbbrevMask: 'D'
    };
  },
  render: function() {
    return (
      <div className='Calendar-day'>
        <p className='Calendar-weekday'>
          {moment(this.props.date).format(this.props.dayAbbrevMask)}
        </p>
        {this.props.chart({data: this.props.data, date: this.props.date})}
      </div>
    );
  }
});