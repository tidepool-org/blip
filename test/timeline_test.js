/*
 * == BSD2 LICENSE ==
 */

var chai = require('chai');
var expect = chai.expect;

var Timeline = require('../js/data/util/timeline.js');

describe('Timeline', function(){
  it('is newable', function(){
    var line = new Timeline();
    expect(line).to.exist;
  });

  it('can be added to', function(){
    var line = new Timeline();
    expect(line.add({start: 0, end: 1})).deep.equals([]);
    expect(line.add({start: 1, end: 2})).deep.equals([]);
    expect(line.add({start: 2, end: 3})).deep.equals([]);

    expect(line.getArray()).deep.equals([{start: 0, end: 1}, {start: 1, end: 2}, {start: 2, end: 3}]);
  });

  it('handles overlaps', function(){
    var line = new Timeline();
    expect(line.add({start: 0, end: 2, payload: 'a'})).deep.equals([]);
    expect(line.add({start: 1, end: 3, payload: 'b'})).deep.equals([{start: 1, end: 2, payload: 'a'}]);
    expect(line.add({start: 2, end: 3, payload: 'c'})).deep.equals([{start: 2, end: 3, payload: 'b'}]);

    expect(line.getArray()).deep.equals(
      [
        {start: 0, end: 1, payload: 'a'},
        {start: 1, end: 2, payload: 'b'},
        {start: 2, end: 3, payload: 'c'}
      ]
    );
  });

  it('handles extended overlaps', function(){
    var line = new Timeline();
    expect(line.add({start: 0, end: 10, payload: 'a'})).deep.equals([]);
    expect(line.add({start: 1, end: 2, payload: 'b'})).deep.equals([{start: 1, end: 2, payload: 'a'}]);
    expect(line.add({start: 2, end: 3, payload: 'c'})).deep.equals([{start: 2, end: 3, payload: 'a'}]);

    expect(line.getArray()).deep.equals(
      [
        {start: 0, end: 1, payload: 'a'},
        {start: 1, end: 2, payload: 'b'},
        {start: 2, end: 3, payload: 'c'},
        {start: 3, end: 10, payload: 'a'}
      ]
    );
  });

  it('handles gaps in extended overlaps', function(){
    var line = new Timeline();
    expect(line.add({start: 0, end: 10, payload: 'a'})).deep.equals([]);
    expect(line.add({start: 1, end: 2, payload: 'b'})).deep.equals([{start: 1, end: 2, payload: 'a'}]);
    expect(line.add({start: 5, end: 7, payload: 'c'})).deep.equals([{start: 5, end: 7, payload: 'a'}]);

    expect(line.getArray()).deep.equals(
      [
        {start: 0, end: 1, payload: 'a'},
        {start: 1, end: 2, payload: 'b'},
        {start: 2, end: 5, payload: 'a'},
        {start: 5, end: 7, payload: 'c'},
        {start: 7, end: 10, payload: 'a'}
      ]
    );
  });

  it('allows gaps', function(){
    var line = new Timeline();
    expect(line.add({start: 0, end: 1})).deep.equals([]);
    expect(line.add({start: 2, end: 3})).deep.equals([]);

    expect(line.getArray()).deep.equals([{start: 0, end: 1}, {start: 2, end: 3}]);
  });

  it('un-does and re-applies events to ensure insertion as if ordered by start -- all of them', function(){
    var line = new Timeline();
    expect(line.add({start: 1, end: 2, payload: 'b'})).deep.equals([]);
    expect(line.add({start: 2, end: 3, payload: 'c'})).deep.equals([]);
    expect(line.add({start: 0, end: 10, payload: 'a'})).deep.equals(
      [
        {start: 1, end: 2, payload: 'a'},
        {start: 2, end: 3, payload: 'a'}
      ]
    );

    expect(line.getArray()).deep.equals(
      [
        {start: 0, end: 1, payload: 'a'},
        {start: 1, end: 2, payload: 'b'},
        {start: 2, end: 3, payload: 'c'},
        {start: 3, end: 10, payload: 'a'}
      ]
    );
  });

  it('un-does and re-applies events to ensure insertion as if ordered by start -- some of them', function(){
    var line = new Timeline();
    expect(line.add({start: 0, end: 1, p: 'a'})).deep.equals([]);
    expect(line.add({start: 2, end: 4, p: 'b'})).deep.equals([]);
    expect(line.add({start: 1, end: 3, p: 'c'})).deep.equals([{start: 2, end: 3, p: 'c'}]);

    expect(line.getArray()).deep.equals(
      [
        {start: 0, end: 1, p: 'a'},
        {start: 1, end: 2, p: 'c'},
        {start: 2, end: 4, p: 'b'}
      ]
    );
  });
});