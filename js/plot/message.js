/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

var d3 = require('d3');
var _ = require('lodash');

var images = require('../../img');

var log = require('bows')('Message');

module.exports = function(pool, opts) {

  opts = opts || {};

  var defaults = {
    imagesBaseUrl: pool.imagesBaseUrl(),
    highlightWidth: 4
  };

  _.defaults(opts, defaults);

  var mainGroup = pool.group();

  function message(selection) {
    opts.xScale = pool.xScale().copy();

    selection.each(function(currentData) {
      var messages = d3.select(this)
        .selectAll('g.d3-message-group')
        .data(currentData, function(d) {
          if (d.parentMessage === '' || d.parentMessage == null) {
            return d.id;
          }
        });

      var messageGroups = messages.enter()
        .append('g')
        .attr({
          'class': 'd3-message-group',
          id: function(d) {
            return 'message_' + d.id;
          },
          'clip-path': 'url(#mainClipPath)'
        });

      message.addMessageToPool(messageGroups);

      messages.exit().remove();
    });
  }

  message.addMessageToPool = function(selection) {
    opts.xScale = pool.xScale().copy();

    selection.append('rect')
      .attr({
        x: message.highlightXPosition,
        y: message.highlightYPosition,
        width: opts.size + opts.highlightWidth * 2,
        height: opts.size + opts.highlightWidth * 2,
        'class': 'd3-rect-message hidden'
      });

    selection.append('image')
      .attr({
        'xlink:href': images.message['post_it.svg'],
        cursor: 'pointer',
        x: message.xPosition,
        y: message.yPosition,
        width: opts.size,
        height: opts.size
      })
      .classed({'d3-image': true, 'd3-message': true});

    selection.on('click', function(d) {
      d3.event.stopPropagation(); // silence the click-and-drag listener
      opts.emitter.emit('messageThread', d.id);
      log('Message clicked!');
      d3.select(this).selectAll('.d3-rect-message').classed('hidden', false);
    });
  };

  message.updateMessageInPool = function(selection) {
    opts.xScale = pool.xScale().copy();

    selection.select('rect.d3-rect-message')
      .attr({
        x: message.highlightXPosition
      });

    selection.select('image')
      .attr({
        x: message.xPosition
      });
  };

  message.setUpMessageCreation = function() {
    log('Set up message creation listeners.');
    opts.emitter.on('clickTranslatesToDate', function(date) {
      log('Creating message at', date.toISOString().slice(0,-5));
      opts.emitter.emit('createMessage', date.toISOString());
    });

    opts.emitter.on('messageCreated', function(obj) {
      var messageGroup = mainGroup.select('#poolMessages_message')
        .append('g')
        .attr('class', 'd3-message-group d3-new')
        .attr('id', 'message_' + obj.id)
        .datum(obj);
      message.addMessageToPool(messageGroup);
    });

    opts.emitter.on('messageTimestampEdited', function(obj) {
      var messageGroup = mainGroup.select('g#message_' + obj.id)
        .datum(obj);
      message.updateMessageInPool(messageGroup);
    });
  };

  message.highlightXPosition = function(d) {
    return opts.xScale(Date.parse(d.normalTime)) - opts.size / 2 - opts.highlightWidth;
  };

  message.highlightYPosition = function(d) {
    return pool.height() / 2 - opts.size / 2 - opts.highlightWidth;
  };

  message.xPosition = function(d) {
    return opts.xScale(Date.parse(d.normalTime)) - opts.size / 2;
  };

  message.yPosition = function(d) {
    return pool.height() / 2 - opts.size / 2;
  };

  message.setUpMessageCreation();

  return message;
};
