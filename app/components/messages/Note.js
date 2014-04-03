/**
 * @jsx React.DOM
 */

/*
== BSD2 LICENSE ==
Copyright (c) 2014, Tidepool Project

This program is free software; you can redistribute it and/or modify it under
the terms of the associated License, which is identical to the BSD 2-Clause
License as published by the Open Source Initiative at opensource.org.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the License for more details.

You should have received a copy of the License along with this program; if
not, you can obtain one from Tidepool Project at tidepool.org.
== BSD2 LICENSE ==
*/
'use strict';

var React = window.React;

var Note = React.createClass({

  propTypes: {
    author: React.PropTypes.string,
    image: React.PropTypes.string,
    when: React.PropTypes.string,
    note: React.PropTypes.string
  },

  niceTime: function(time){
    var nice = new Date(time);
    return nice.toLocaleString();
  },

  renderHeading : function(){
    /* jshint ignore:start */
    return (
      <div>
        <strong ref='messageAuthorAndGroup' className='note-header media-heading'> {this.props.author}</strong>
      </div>
    );
    /* jshint ignore:end */
  },

  render: function() {

    var noteHeading = this.renderHeading();

    return this.transferPropsTo(
      /* jshint ignore:start */
      <div className='note media'>
        <div ref='imgColumn' className='media-object pull-left'>
          <div ref='authorImage' className={this.props.image}/>
        </div>
        <div ref='detailColumn' className='media-body'>
          {noteHeading}
          <span ref='messageWhen' className='small note-when'>{this.niceTime(this.props.when)}</span>
          <p ref='messageText' className='note-message'>{this.props.note}</p>
        </div>
      </div>
      /* jshint ignore:end */
    );
  }
});

module.exports = Note;

