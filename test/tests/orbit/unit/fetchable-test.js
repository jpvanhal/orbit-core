import Source from 'orbit/source';
import Fetchable from 'orbit/fetchable';
import Transform from 'orbit/transform';
import { Promise } from 'rsvp';
import { successfulOperation, failedOperation } from 'tests/test-helper';

var source;

module('Orbit - Fetchable', {
  setup: function() {
    source = new Source();
    Fetchable.extend(source);
  },

  teardown: function() {
    source = null;
  }
});

test('it exists', function(assert) {
  assert.ok(source);
});

test('it should resolve as a failure when _fetch fails', function(assert) {
  assert.expect(2);

  source._fetch = function(query) {
    return failedOperation();
  };

  return source.fetch({ fetch: '' })
    .catch((error) => {
      assert.ok(true, 'fetch promise resolved as a failure');
      assert.equal(error, ':(', 'failure');
    });
});

test('it should trigger `fetch` event after a successful action in which `_fetch` returns an array of transforms', function(assert) {
  assert.expect(9);

  let order = 0;

  const resultingTransforms = [
    Transform.from({ op: 'addRecord' }, { op: 'addRecord' }),
    Transform.from({ op: 'replaceRecordAttribute' })
  ];

  source._fetch = function(query) {
    assert.equal(++order, 1, 'action performed after willFetch');
    assert.deepEqual(query.expression, { fetch: ['abc', 'def'] }, 'query object matches');
    return Promise.resolve(resultingTransforms);
  };

  let transformCount = 0;
  source.on('transform', (transform) => {
    assert.strictEqual(transform, resultingTransforms[transformCount++], 'transform matches');
    return Promise.resolve();
  });

  source.on('fetch', (query, result) => {
    assert.equal(++order, 2, 'fetch triggered after action performed successfully');
    assert.deepEqual(query.expression, { fetch: ['abc', 'def'] }, 'query matches');
    assert.strictEqual(result, resultingTransforms, 'result matches');
  });

  return source.fetch({ fetch: ['abc', 'def'] })
    .then((result) => {
      assert.equal(++order, 3, 'promise resolved last');
      assert.strictEqual(result, resultingTransforms, 'success!');
    });
});

test('it should trigger `fetchFail` event after an unsuccessful fetch', function(assert) {
  assert.expect(7);

  let order = 0;

  source._fetch = function(query) {
    assert.equal(++order, 1, 'action performed after willFetch');
    assert.deepEqual(query.expression, { fetch: ['abc', 'def'] }, 'query object matches');
    return failedOperation();
  };

  source.on('fetch', () => {
    assert.ok(false, 'fetch should not be triggered');
  });

  source.on('fetchFail', (query, error) => {
    assert.equal(++order, 2, 'fetchFail triggered after an unsuccessful fetch');
    assert.deepEqual(query.expression, { fetch: ['abc', 'def'] }, 'query matches');
    assert.equal(error, ':(', 'error matches');
  });

  return source.fetch({ fetch: ['abc', 'def'] })
    .catch((error) => {
      assert.equal(++order, 3, 'promise resolved last');
      assert.equal(error, ':(', 'failure');
    });
});
