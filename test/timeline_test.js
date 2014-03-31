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

  describe('no smooshing', function(){
    var line = null;
    beforeEach(function(){
      line = new Timeline();
    });

    it('can be added to', function(){
      expect(line.add({start: 0, end: 1})).deep.equals([]);
      expect(line.add({start: 1, end: 2})).deep.equals([]);
      expect(line.add({start: 2, end: 3})).deep.equals([]);

      expect(line.getArray()).deep.equals([{start: 0, end: 1}, {start: 1, end: 2}, {start: 2, end: 3}]);
    });

    it('handles overlaps', function(){
      expect(line.add({start: 0, end: 2, p: 'a'})).deep.equals([]);
      expect(line.add({start: 1, end: 3, p: 'b'})).deep.equals([{start: 1, end: 2, p: 'a'}]);
      expect(line.add({start: 2, end: 3, p: 'c'})).deep.equals([{start: 2, end: 3, p: 'b'}]);

      expect(line.getArray()).deep.equals(
        [
          {start: 0, end: 1, p: 'a'},
          {start: 1, end: 2, p: 'b'},
          {start: 2, end: 3, p: 'c'}
        ]
      );
    });

    it('handles extended overlaps', function(){
      expect(line.add({start: 0, end: 10, p: 'a'})).deep.equals([]);
      expect(line.add({start: 1, end: 2, p: 'b'})).deep.equals([{start: 1, end: 2, p: 'a'}]);
      expect(line.add({start: 2, end: 3, p: 'c'})).deep.equals([{start: 2, end: 3, p: 'a'}]);

      expect(line.getArray()).deep.equals(
        [
          {start: 0, end: 1, p: 'a'},
          {start: 1, end: 2, p: 'b'},
          {start: 2, end: 3, p: 'c'},
          {start: 3, end: 10, p: 'a'}
        ]
      );
    });

    it('handles gaps in extended overlaps', function(){
      expect(line.add({start: 0, end: 10, p: 'a'})).deep.equals([]);
      expect(line.add({start: 1, end: 2, p: 'b'})).deep.equals([{start: 1, end: 2, p: 'a'}]);
      expect(line.add({start: 5, end: 7, p: 'c'})).deep.equals([{start: 5, end: 7, p: 'a'}]);

      expect(line.getArray()).deep.equals(
        [
          {start: 0, end: 1, p: 'a'},
          {start: 1, end: 2, p: 'b'},
          {start: 2, end: 5, p: 'a'},
          {start: 5, end: 7, p: 'c'},
          {start: 7, end: 10, p: 'a'}
        ]
      );
    });

    it('allows gaps', function(){
      expect(line.add({start: 0, end: 1})).deep.equals([]);
      expect(line.add({start: 2, end: 3})).deep.equals([]);

      expect(line.getArray()).deep.equals([{start: 0, end: 1}, {start: 2, end: 3}]);
    });

    it('un-does and re-applies events to ensure insertion as if ordered by start -- all of them', function(){
      expect(line.add({start: 1, end: 2, p: 'b'})).deep.equals([]);
      expect(line.add({start: 2, end: 3, p: 'c'})).deep.equals([]);
      expect(line.add({start: 0, end: 10, p: 'a'})).deep.equals(
        [
          {start: 1, end: 2, p: 'a'},
          {start: 2, end: 3, p: 'a'}
        ]
      );

      expect(line.getArray()).deep.equals(
        [
          {start: 0, end: 1, p: 'a'},
          {start: 1, end: 2, p: 'b'},
          {start: 2, end: 3, p: 'c'},
          {start: 3, end: 10, p: 'a'}
        ]
      );
    });

    it('un-does and re-applies events to ensure insertion as if ordered by start -- some of them', function(){
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

  describe('smooshing!', function(){
    var line = null;
    beforeEach(function(){
      line = new Timeline(function(lhs, rhs){
        return lhs.p === rhs.p;
      });
    });

    it('smooshes overlaps', function(){
      expect(line.add({start: 0, end: 2, p: 'a'})).deep.equals([]);
      expect(line.add({start: 1, end: 3, p: 'a'})).deep.equals([{start: 1, end: 2, p: 'a'}]);
      expect(line.add({start: 2, end: 3, p: 'c'})).deep.equals([{start: 2, end: 3, p: 'a'}]);

      expect(line.getArray()).deep.equals(
        [
          {start: 0, end: 2, p: 'a'},
          {start: 2, end: 3, p: 'c'}
        ]
      );
    });
  });
});