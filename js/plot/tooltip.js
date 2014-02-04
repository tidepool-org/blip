module.exports = function(container, tooltipsGroup) {

  var id;

  function tooltip(selection, d, tooltipXPos, path, image, tooltipWidth, tooltipHeight, imageX, imageY, textX, textY) {
    var tooltipGroup = selection.append('g')
      .attr('class', 'd3-tooltip')
      .attr('id', 'tooltip_' + d.id);

    var currentTranslation = container.currentTranslation();

    var locationInWindow = currentTranslation + tooltipXPos;

    // for now (unless I can persude Sara and Alix otherwise), high cbg values are a special case
    if (image.indexOf('cbg_tooltip_high') != -1) {
      if (locationInWindow < (((container.width() - container.axisGutter()) / 24) * 3)) {
        tooltipGroup.append('image')
          .attr({
            'xlink:href': '../img/' + path + '/' + image,
            'x': imageX,
            'y': imageY,
            'width': tooltipWidth,
            'height': tooltipHeight,
            'class': 'd3-tooltip-image'
          });

        tooltipGroup.append('text')
          .attr({
            'x': textX,
            'y': textY,
            'class': 'd3-tooltip-text'
          })
          .text(function() {
            return d.value;
          });
      }
      else {
        tooltipGroup.append('image')
          .attr({
            'xlink:href': function() {
              var str =  '../img/' + path + '/' + image;
              return str.replace('.svg', '_left.svg');
            },
            'x': imageX - tooltipWidth,
            'y': imageY,
            'width': tooltipWidth,
            'height': tooltipHeight,
            'class': 'd3-tooltip-image'
          });

        tooltipGroup.append('text')
          .attr({
            'x': textX - tooltipWidth,
            'y': textY,
            'class': 'd3-tooltip-text'
          })
          .text(function() {
            return d.value;
          });
      }
    }
    // if the data point is three hours from the end of the data in view or less, use a left tooltip
    else if (locationInWindow > container.width() - (((container.width() - container.axisGutter()) / 24) * 3)) {
      tooltipGroup.append('image')
        .attr({
          'xlink:href': function() {
            var str =  '../img/' + path + '/' + image;
            return str.replace('.svg', '_left.svg');
          },
          'x': imageX - tooltipWidth,
          'y': imageY,
          'width': tooltipWidth,
          'height': tooltipHeight,
          'class': 'd3-tooltip-image'
        });

      tooltipGroup.append('text')
        .attr({
          'x': textX - tooltipWidth,
          'y': textY,
          'class': 'd3-tooltip-text'
        })
        .text(function() {
          return d.value;
        });
    }
    else {
      tooltipGroup.append('image')
        .attr({
          'xlink:href': '../img/' + path + '/' + image,
          'x': imageX,
          'y': imageY,
          'width': tooltipWidth,
          'height': tooltipHeight,
          'class': 'd3-tooltip-image'
        });

      tooltipGroup.append('text')
        .attr({
          'x': textX,
          'y': textY,
          'class': 'd3-tooltip-text'
        })
        .text(function() {
          return d.value;
        });
    }

  }

  tooltip.addGroup = function(pool, type) {
    tooltipsGroup.append('g')
      .attr('id', tooltip.id() + '_' + type)
      .attr('transform', pool.attr('transform'));
  };

  // getters & setters
  tooltip.id = function(x) {
    if (!arguments.length) return id;
    id = tooltipsGroup.attr('id');
    return tooltip;
  };

  return tooltip;
};