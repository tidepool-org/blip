import Queue from '../../../../app/core/Queue';
/* global sinon */
/* global chai */
/* global describe */
/* global it */
/* global before */
/* global beforeEach */
/* global after */
/* global afterEach */
/* global expect */

describe('Queue', () => {
  let queue;

  beforeEach(() => {
    queue = new Queue();
  });

  it('should initialize with `items` as an empty array', () => {
    expect(queue.items).to.eql([]);
  });

  it('should initialize with `processing` set to `false`', () => {
    expect(queue.processing).to.eql(false);
  });

  it('should initialize with `id` set to `null`', () => {
    expect(queue.id).to.eql(null);
  });

  it('should add items to the queue', () => {
    queue.add('foo');
    queue.add('bar');
    expect(queue.items).to.eql(['foo', 'bar']);
  });

  it('should clear the items queue and id', () => {
    queue.items = ['foo', 'bar', 'baz'];
    queue.clear();
    expect(queue.items).to.eql([]);
  });

  it('should get items from the beginning of the queue', () => {
    queue.items = ['foo', 'bar', 'baz'];
    queue.getNext();
    queue.items = ['bar', 'baz'];
    queue.getNext();
    expect(queue.items).to.eql(['baz']);
    queue.getNext();
    expect(queue.items).to.eql([]);
  });

  it('should set the `processing` property', () => {
    queue.setProcessing(true);
    expect(queue.processing).to.eql(true);
    queue.setProcessing(false);
    expect(queue.processing).to.eql(false);
  });

  it('should set the `id` property', () => {
    queue.setId('abc');
    expect(queue.id).to.eql('abc');

    queue.setId();
    expect(queue.id).to.eql(null);
  });
});
