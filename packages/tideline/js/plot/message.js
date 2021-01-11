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

import i18next from 'i18next';
var d3 = require('d3');
var _ = require('lodash');

var format = require('../data/util/format');

var postItImage = require('../../img/message/post_it.svg');
var newNoteImg = require('../../img/message/new.png');

var log = require('bows')('Message');

var t = i18next.t.bind(i18next);

var NEW_NOTE_WIDTH = 36;
var NEW_NOTE_HEIGHT = 29;
var NEW_NOTE_X = 0;
var NEW_NOTE_Y = 45;

module.exports = function(pool, opts) {

  opts = opts || {};

  var defaults = {
    previewLength: 50,
    tooltipPadding: 20,
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
          }
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
        'xlink:href': postItImage,
        cursor: 'pointer',
        x: message.xPosition,
        y: message.yPosition,
        width: opts.size,
        height: opts.size
      })
      .classed({'d3-image': true, 'd3-message': true});

    selection.on('mouseover', message._displayTooltip);
    selection.on('mouseout', message._removeTooltip);
    selection.on('click', function(d) {
      d3.event.stopPropagation(); // silence the click-and-drag listener
      opts.emitter.emit('messageThread', d.id);
      log('Message clicked!', d.id);
      d3.select(this).selectAll('.d3-rect-message').classed('hidden', false);
    });
  };

  message._displayTooltip = function(d) {
    var elem = d3.select('#message_' + d.id + ' image');
    var tooltips = pool.tooltips();

    var tooltip = tooltips.addForeignObjTooltip({
      cssClass: 'svg-tooltip-message',
      datum: _.assign(d, {type: 'message'}), // we're currently using the message pool to display the tooltip
      shape: 'generic',
      xPosition: message.xPositionCenter,
      yPosition: message.yPositionCenter
    });

    var foGroup = tooltip.foGroup;
    const msgDate = format.datestamp(d.normalTime, d.displayOffset);
    const msgTime = format.timestamp(d.normalTime, d.displayOffset);
    const msgDateTime = `<span class="fromto">${t('{{date}} - {{time}}', {date: msgDate, time: msgTime})}</span>`;
    tooltip.foGroup.append('p')
      .attr('class', 'messageTooltip')
      .append('span')
      .attr('class', 'secondary')
      .html(msgDateTime);
    tooltip.foGroup.append('p')
      .attr('class', 'messageTooltip')
      .append('span')
      .attr('class', 'secondary')
      .html('<span class="value">' + format.nameForDisplay(d.user.fullName) + '</span> ' + format.textPreview(d.messageText));

    var dims = tooltips.foreignObjDimensions(foGroup);
    // foGroup.node().parentNode is the <foreignObject> itself
    // because foGroup is actually the top-level <xhtml:div> element
    tooltips.anchorForeignObj(d3.select(foGroup.node().parentNode), {
      w: dims.width + opts.tooltipPadding,
      h: dims.height,
      x: message.xPositionCenter(d),
      y: -dims.height,
      orientation: {
        'default': 'leftAndDown',
        leftEdge: 'rightAndDown',
        rightEdge: 'leftAndDown'
      },
      shape: 'generic',
      edge: tooltip.edge
    });
  };

  message._removeTooltip = function(d) {
    var elem = d3.select('#tooltip_' + d.id).remove();
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

    opts.emitter.on('messageEdited', function(obj) {
      var messageGroup = mainGroup.select('g#message_' + obj.id)
        .datum(obj);
      message.updateMessageInPool(messageGroup);
    });
  };

  /**
   * Render the affordance for adding notes through blip
   */
  message.drawNewNoteIcon = _.once(function() {
    if (!d3.select('#tidelineLabels .newNoteIcon').empty()) { // do not draw twice!
      return;
    }

    var newNote = d3.select('#tidelineLabels').append('image')
      .attr({
        'class': 'newNoteIcon',
        'xlink:href': newNoteImg,
        cursor: 'pointer',
        x: NEW_NOTE_X,
        y: NEW_NOTE_Y,
        width: NEW_NOTE_WIDTH,
        height: NEW_NOTE_HEIGHT
      });

    newNote.on('mouseover', function() {
      d3.select('#tidelineLabels').append('text')
      .attr({
        'class': 'newNoteText',
        x: NEW_NOTE_X + 1,
        y: NEW_NOTE_Y + 43,
      })
      .text(t('New'));
      d3.select('#tidelineLabels').append('text')
      .attr({
        'class': 'newNoteText',
        x: NEW_NOTE_X + 1,
        y: NEW_NOTE_Y + 56,
      })
      .text(t('note'));
    });
    newNote.on('mouseout', function() {
      d3.selectAll('#tidelineLabels .newNoteText').remove();
    });

    newNote.on('click', function(event) {
      var date = new Date();
      if (!opts.timezoneAware) {
        var offsetMinutes = new Date(date).getTimezoneOffset();
        date.setUTCMinutes(date.getUTCMinutes() + offsetMinutes);
        opts.emitter.emit('clickTranslatesToDate', date);
      }
      else {
        opts.emitter.emit('clickTranslatesToDate', date);
      }
    });
  });

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

  message.xPositionCenter = function(d) {
    return opts.xScale(Date.parse(d.normalTime));
  };

  message.yPositionCenter = function(d) {
    return pool.height() / 2;
  };

  message.setUpMessageCreation();
  message.drawNewNoteIcon();

  return message;
};
