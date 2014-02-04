module.exports = function(container, tooltipsGroup) {

  var id;

  function tooltip(selection, d, path, image, tooltipSize, imageX, imageY, textX, textY) {
    console.log('Adding a tooltip...');
    var tooltipGroup = selection.append('g')
      .attr('class', 'd3-tooltip')
      .attr('id', 'tooltip_' + d.id);

    tooltipGroup.append('image')
      .attr({
        'xlink:href': '../img/' + path + '/' + image,
        'x': imageX,
        'y': imageY,
        'width': tooltipSize,
        'height': tooltipSize,
        'class': 'd3-tooltip-image'
      });

    tooltipGroup.append('text')
      .attr({
        'x': textX,
        'y': textY,
        'class': function() {
          return 'd3-tooltip-text'
        }
      })
      .text(function() {
        return d.value;
      });
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