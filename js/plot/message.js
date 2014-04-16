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

var d3 = require('../lib/').d3;
var _ = require('../lib/')._;

var log = require('../lib/').bows('Message');

module.exports = function(pool, opts) {

  opts = opts || {};

  var defaults = {
    imagesBaseUrl: pool.imagesBaseUrl()
  };

  _.defaults(opts, defaults);

  var mainGroup = pool.group();

  function message(selection) {
    opts.xScale = pool.xScale().copy();
    
    message.setUpMessageCreation();

    selection.each(function(currentData) {
      var messages = d3.select(this)
        .selectAll('g')
        .data(currentData, function(d) {
          if (d.parentMessage === '' || d.parentMessage == null) {
            return d._id;
          }
        });

      var messageGroups = messages.enter()
        .append('g')
        .attr('class', 'd3-message-group');
      message.addMessageToPool(messageGroups);

      messages.exit().remove();
    });
  }

  message.addMessageToPool = function(selection) {
    selection.append('rect')
      .attr({
        'x': function(d) {
          return opts.xScale(Date.parse(d.normalTime)) - opts.size / 2 - 4;
        },
        'y': pool.height() / 2 - opts.size / 2 - 4,
        'width': opts.size + 8,
        'height': opts.size + 8,
        'class': 'd3-rect-message hidden'
      });
    selection.append('image')
      .attr({
        'xlink:href': opts.imagesBaseUrl + '/message/post_it.svg',
        'x': function(d) {
          return opts.xScale(Date.parse(d.normalTime)) - opts.size / 2;
        },
        'y': pool.height() / 2 - opts.size / 2,
        'width': opts.size,
        'height': opts.size,
        'id': function(d) {
          return 'message_' + d._id;
        }
      })
      .classed({'d3-image': true, 'd3-message': true});
    selection.on('click', function(d) {
      d3.event.stopPropagation(); // silence the click-and-drag listener
      opts.emitter.emit('messageThread', d._id);
      log('Message clicked!');
      d3.select(this).selectAll('.d3-rect-message').classed('hidden', false);
    });
  };

  message.setUpMessageCreation = _.once(function() {
    log('Set up message creation listeners.');
    mainGroup.selectAll('.d3-rect-fill').on('click', function() {
      opts.emitter.emit('clickInPool', d3.event.offsetX);
    });

    opts.emitter.on('clickTranslatesToDate', function(date) {
      log('Creating message at', date.toISOString().slice(0,-5));
      opts.emitter.emit('createMessage', date.toISOString());
    });

    opts.emitter.on('messageCreated', function(obj) {
      var messageGroup = mainGroup.select('#poolMessages_message')
        .append('g')
        .attr('class', 'd3-message-group d3-new')
        .datum(obj);
      message.addMessageToPool(messageGroup);
    });
  });

  return message;
};