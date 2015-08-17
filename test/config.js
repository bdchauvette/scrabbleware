'use strict';

const test = require('tape');
const Scrabbleware = require('../dist/scrabbleware');
const sowpods = require('../lib/sowpods');
const twl = require('../lib/twl');

const _sw = new Scrabbleware();
const CHARLIST = _sw.charlist;

test('config : defaults', function(t) {
  t.plan(2);

  const scrabbleware = new Scrabbleware();

  t.equal(scrabbleware.wordlist, sowpods, 'uses sowpods wordlist');
  t.equal(scrabbleware.charlist, CHARLIST, 'has correct extra chars');
});

test('config : param (invalid)', function(t) {
  t.plan(1);

  const scrabbleware = function() {
    return new Scrabbleware(1);
  }

  const errMsg = new RegExp('Invalid configuration');
  t.throws(scrabbleware, errMsg, 'rejects params that are not string, object, or array');
});

test('config : string (sowpods)', function(t) {
  t.plan(2);

  const scrabbleware = new Scrabbleware('sowpods');

  t.equal(scrabbleware.wordlist, sowpods, 'uses sowpods wordlist');
  t.equal(scrabbleware.charlist, CHARLIST, 'has correct extra chars');
});

test('config : string (twl)', function(t) {
  t.plan(2);

  const scrabbleware = new Scrabbleware('twl');

  t.equal(scrabbleware.wordlist, twl, 'uses twl wordlist');
  t.equal(scrabbleware.charlist, CHARLIST, 'has correct extra chars');
});

test('config : string (invalid)', function(t) {
  t.plan(1);

  const scrabbleware = function() {
    return new Scrabbleware('foo');
  }

  const errMsg = new RegExp('wordlist must be "sowpods", "twl", or Array');
  t.throws(scrabbleware, errMsg, 'rejects non-existing wordlist');
});

test('config : array', function(t) {
  t.plan(2);

  const wordlist = ['foo', 'bar', 'baz'];
  const scrabbleware = new Scrabbleware(wordlist);

  t.equal(scrabbleware.wordlist, wordlist, 'uses custom wordlist');
  t.equal(scrabbleware.charlist, CHARLIST, 'has correct extra chars');
});

test('config : object - wordlist (sowpods)', function(t) {
  t.plan(2);

  const scrabbleware = new Scrabbleware({ wordlist: 'sowpods' });

  t.equal(scrabbleware.wordlist, sowpods, 'uses sowpods wordlist');
  t.equal(scrabbleware.charlist, CHARLIST, 'has correct extra chars');
});

test('config : object - wordlist (twl)', function(t) {
  t.plan(2);

  const scrabbleware = new Scrabbleware({ wordlist: 'twl' });

  t.equal(scrabbleware.wordlist, twl, 'uses twl wordlist');
  t.equal(scrabbleware.charlist, CHARLIST, 'has correct extra chars');
});

test('config : object - wordlist (array)', function(t) {
  t.plan(2);

  const wordlist = ['foo', 'bar', 'baz'];
  const scrabbleware = new Scrabbleware({ wordlist });

  t.equal(scrabbleware.wordlist, wordlist, 'uses custom wordlist');
  t.equal(scrabbleware.charlist, CHARLIST, 'has correct extra chars');
});

test('config : object - wordlist (invalid)', function(t) {
  t.plan(1);

  const scrabbleware = function() {
    return new Scrabbleware({ wordlist: 'foo' });
  }

  const errMsg = new RegExp('wordlist must be "sowpods", "twl", or Array');
  t.throws(scrabbleware, errMsg, 'rejects non-existing wordlist');
});

test('config : object - charlist (string)', function(t) {
  t.plan(1);

  const charlist = '123';
  const scrabbleware = new Scrabbleware({ charlist });

  t.equal(scrabbleware.charlist, charlist, 'has correct extra chars');
});

test('config : object - charlist (array)', function(t) {
  t.plan(1);

  const charlist = [1, 2, 3];
  const scrabbleware = new Scrabbleware({ charlist });

  t.equal(scrabbleware.charlist, charlist, 'has correct extra chars');
});

test('config : object - charlist (invalid)', function(t) {
  t.plan(1);

  const scrabbleware = function() {
    const charlist = 1;
    return new Scrabbleware( { charlist });
  }

  const errMsg = new RegExp('charlist must be String or Array');
  t.throws(scrabbleware, errMsg, 'rejects invalid types');
});

