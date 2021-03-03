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

import _ from "lodash";
import i18next from "i18next";
import bows from "bows";
import moment from "moment-timezone";

const d3 = require("d3");

const format = require("../data/util/format");
const postItImage = require("../../img/message/post_it.svg");
const newNoteImg = require("../../img/message/new.png");

const t = i18next.t.bind(i18next);

const NEW_NOTE_WIDTH = 36;
const NEW_NOTE_HEIGHT = 29;
const NEW_NOTE_X = 0;
const NEW_NOTE_Y = 45;

module.exports = function (pool, opts) {
  opts = opts || {};

  const defaults = {
    previewLength: 50,
    tooltipPadding: 20,
    highlightWidth: 4,
  };

  const log = bows("TidelineMessage");

  _.defaults(opts, defaults);

  const mainGroup = pool.group();

  function message(selection) {
    opts.xScale = pool.xScale().copy();

    selection.each(function (currentData) {
      const messages = d3
        .select(this)
        .selectAll("g.d3-message-group")
        .data(currentData, (d) => d.id);

      const messageGroups = messages
        .enter()
        .append("g")
        .attr({
          class: "d3-message-group",
          id: function (d) {
            return "message_" + d.id;
          },
        });

      message.addMessageToPool(messageGroups);

      messages.exit().remove();
    });
  }

  message.addMessageToPool = function (selection) {
    opts.xScale = pool.xScale().copy();

    selection.append("rect").attr({
      x: message.highlightXPosition,
      y: message.highlightYPosition,
      width: opts.size + opts.highlightWidth * 2,
      height: opts.size + opts.highlightWidth * 2,
      class: "d3-rect-message hidden",
    });

    selection
      .append("image")
      .attr({
        "xlink:href": postItImage,
        cursor: "pointer",
        x: message.xPosition,
        y: message.yPosition,
        width: opts.size,
        height: opts.size,
      })
      .classed({ "d3-image": true, "d3-message": true });

    selection.on("mouseover", message.displayTooltip);
    selection.on("mouseout", message.removeTooltip);
    selection.on("click", function clickMessage(d) {
      log.debug("Message clicked!", d);
      d3.event.stopPropagation(); // silence the click-and-drag listener
      opts.emitter.emit("messageThread", d.id);
      d3.select(this).selectAll(".d3-rect-message").classed("hidden", false);
    });
  };

  message.displayTooltip = (d) => {
    d3.select("#message_" + d.id + " image");

    const tooltips = pool.tooltips();

    const tooltip = tooltips.addForeignObjTooltip({
      cssClass: "svg-tooltip-message",
      datum: _.assign(d, { type: "message" }), // we're currently using the message pool to display the tooltip
      shape: "generic",
      xPosition: message.xPositionCenter,
      yPosition: message.yPositionCenter,
    });

    const foGroup = tooltip.foGroup;
    const mTime = moment.utc(d.epoch).tz(d.timezone);
    const msgDate = format.datestamp(mTime);
    const msgTime = format.timestamp(mTime);
    const htmlDateTime = `<span class="message-from-to">${t("{{date}} - {{time}}", { date: msgDate, time: msgTime })}</span>`;
    const htmlName = `<span class="message-author">${format.nameForDisplay(d.user)}:</span>`;
    const htmlValue = `<br><span class="message-text">${format.textPreview(d.messageText)}</span>`;

    tooltip.foGroup.append("p").attr("class", "messageTooltip").append("span").attr("class", "secondary").html(htmlDateTime);
    tooltip.foGroup
      .append("p")
      .attr("class", "messageTooltip")
      .append("span")
      .attr("class", "secondary")
      .html(htmlName + htmlValue);

    const dims = tooltips.foreignObjDimensions(foGroup);
    // foGroup.node().parentNode is the <foreignObject> itself
    // because foGroup is actually the top-level <xhtml:div> element
    tooltips.anchorForeignObj(d3.select(foGroup.node().parentNode), {
      w: dims.width + opts.tooltipPadding,
      h: dims.height,
      x: message.xPositionCenter(d),
      y: -dims.height,
      orientation: {
        default: "leftAndDown",
        leftEdge: "rightAndDown",
        rightEdge: "leftAndDown",
      },
      shape: "generic",
      edge: tooltip.edge,
    });
  };

  message.removeTooltip = (d) => {
    d3.select("#tooltip_" + d.id).remove();
  };

  message.updateMessageInPool = function (selection) {
    opts.xScale = pool.xScale().copy();

    selection.select("rect.d3-rect-message").attr({
      x: message.highlightXPosition,
    });

    selection.select("image").attr({
      x: message.xPosition,
    });
  };

  message.setUpMessageCreation = function () {
    opts.emitter.on("clickToDate", function (date) {
      opts.emitter.emit("createMessage", date);
    });

    opts.emitter.on("messageCreated", function (d) {
      log.info("Adding message to the timeline", d);
      const messageGroup = mainGroup
        .select("#poolMessages_message")
        .append("g")
        .attr("class", "d3-message-group d3-new")
        .attr("id", `message_${d.id}`)
        .datum(d);
      message.addMessageToPool(messageGroup);
    });

    opts.emitter.on("messageEdited", function (obj) {
      var messageGroup = mainGroup.select("g#message_" + obj.id).datum(obj);
      message.updateMessageInPool(messageGroup);
    });
  };

  /**
   * Render the affordance for adding notes through blip
   */
  message.drawNewNoteIcon = _.once(function () {
    if (!d3.select("#tidelineLabels .newNoteIcon").empty()) {
      // do not draw twice!
      return;
    }

    var newNote = d3.select("#tidelineLabels").append("image").attr({
      class: "newNoteIcon",
      "xlink:href": newNoteImg,
      cursor: "pointer",
      x: NEW_NOTE_X,
      y: NEW_NOTE_Y,
      width: NEW_NOTE_WIDTH,
      height: NEW_NOTE_HEIGHT,
    });

    newNote.on("mouseover", function () {
      d3.select("#tidelineLabels")
        .append("text")
        .attr({
          class: "newNoteText",
          x: NEW_NOTE_X + 1,
          y: NEW_NOTE_Y + 43,
        })
        .text(t("New"));
      d3.select("#tidelineLabels")
        .append("text")
        .attr({
          class: "newNoteText",
          x: NEW_NOTE_X + 1,
          y: NEW_NOTE_Y + 56,
        })
        .text(t("note"));
    });
    newNote.on("mouseout", function () {
      d3.selectAll("#tidelineLabels .newNoteText").remove();
    });

    newNote.on("click", function () {
      log.debug("newNode click");
      opts.emitter.emit("clickTranslatesToDate", null);
    });
  });

  message.highlightXPosition = (d) => {
    return opts.xScale(d.epoch) - opts.size / 2 - opts.highlightWidth;
  };

  message.highlightYPosition = (/* d */) => {
    return pool.height() / 2 - opts.size / 2 - opts.highlightWidth;
  };

  message.xPosition = (d) => {
    return opts.xScale(d.epoch) - opts.size / 2;
  };

  message.yPosition = (/* d */) => {
    return pool.height() / 2 - opts.size / 2;
  };

  message.xPositionCenter = (d) => {
    return opts.xScale(d.epoch);
  };

  message.yPositionCenter = (/* d */) => {
    return pool.height() / 2;
  };

  message.setUpMessageCreation();
  message.drawNewNoteIcon();

  return message;
};
