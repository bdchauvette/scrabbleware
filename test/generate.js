'use strict';

const test = require('tape');
const sinon = require('sinon');
const Scrabbleware = require('../dist/scrabbleware');

const EM_DASH = '—';

test('generate()', function(t) {
  t.plan(1);

  const scrabbleware = new Scrabbleware();
  const passphrase = scrabbleware.generate();

  t.equal(passphrase.split(' ').length, 4, 'creates correct number of words');
});

test('generate(int)', function(t) {
  const numTests = 10;
  t.plan(numTests);

  for (let i = 1; i <= numTests; i++) {
    const scrabbleware = new Scrabbleware();
    const passphrase = scrabbleware.generate(i);

    t.equal(passphrase.split(' ').length, (i === 0 ? 1 : i), `generated ${i} words`);
  }
});

test('generate(!int)', function(t) {
  t.plan(1);

  const scrabbleware = new Scrabbleware();
  const passphrase = function() {
    return scrabbleware.generate('foo');
  }

  const errMsg = new RegExp('First argument must be Number or Object');
  t.throws(passphrase, errMsg, `rejects non-Number`);
});

test('generate(int, int)', function(t) {
  const numTests = 10;
  t.plan(numTests);

  for (let i = 0; i <= numTests - 1; i++) {
    const scrabbleware = new Scrabbleware();
    const extraCharSpy = sinon.spy(scrabbleware, '_addExtraChar');
    const passphrase = scrabbleware.generate(4, i);

    t.equal(extraCharSpy.callCount, i, `called _addExtraChar ${i} times`);
  }
});

test('generate(int, !int)', function(t) {
  t.plan(1);

  const scrabbleware = new Scrabbleware();
  const passphrase = function() {
    return scrabbleware.generate(1, 'foo');
  };

  const errMsg = new RegExp('Second argument must be Number or Object');
  t.throws(passphrase, errMsg, `rejects non-Number`);
});

test('generate(obj) - invalid numWords', function(t) {
  t.plan(1);

  const scrabbleware = new Scrabbleware();
  const passphrase = function() {
    return scrabbleware.generate({
      numWords: 'foo'
    });
  };

  const errMsg = new RegExp('numWords or numExtra is not a Number');
  t.throws(passphrase, errMsg, `rejects non-Number`);
});

test('generate(obj) - invalid numExtra', function(t) {
  t.plan(1);

  const scrabbleware = new Scrabbleware();
  const passphrase = function() {
    return scrabbleware.generate({
      numExtra: 'foo'
    });
  };

  const errMsg = new RegExp('numWords or numExtra is not a Number');
  t.throws(passphrase, errMsg, `rejects non-Number`);
});

test('generate(obj) - positions & overrides', function(t) {
  // all values changed from defaults
  const config = {
    numWords: 1,
    numExtra: 2,
    addCaps: false,
    verbose: true,
    separator: EM_DASH
  };

  const argValues = [
    [config],
    [, config],
    [, , config]
  ];

  argValues.forEach(function(args) {
    const scrabbleware = new Scrabbleware();
    const extraCharSpy = sinon.spy(scrabbleware, '_addExtraChar');
    const passphrase = scrabbleware.generate.apply(scrabbleware, args);

    const passphraseLength = passphrase.passphrase.split(config.separator).length;
    const extraChars = extraCharSpy.callCount;

    t.equal(typeof passphrase, 'object', 'returns an object');
    t.equal(passphraseLength, config.numWords, 'creates correct number of words');
    t.equal(extraChars, config.numExtra, 'added correct number of chars');
  });

  t.end();
});

test('generate(int, int, obj) - verbose (true)', function(t) {
  const numWords = 4;
  const numExtra = 5;
  const config = { verbose: true }
  const args = [numWords, numExtra, config];

  const scrabbleware = new Scrabbleware();
  const extraCharSpy = sinon.spy(scrabbleware, '_addExtraChar');
  const passphrase = scrabbleware.generate.apply(scrabbleware, args);

  const expectedKeys = ['passphrase', 'entropy', 'time'];
  expectedKeys.forEach(function(key) {
    t.ok(passphrase.hasOwnProperty(key), `has key: ${key}`);
  });

  const passphraseLength = passphrase.passphrase.split(' ').length;
  t.equal(passphraseLength, numWords, 'has correct number of words');
  t.equal(extraCharSpy.callCount, numExtra, 'added correct number of extra chars');

  t.end();
});

test('generate(int, int, obj) - verbose (false)', function(t) {
  t.plan(3);

  const numWords = 4;
  const numExtra = 5;
  const config = { verbose: false }
  const args = [numWords, numExtra, config];

  const scrabbleware = new Scrabbleware();
  const extraCharSpy = sinon.spy(scrabbleware, '_addExtraChar');
  const passphrase = scrabbleware.generate.apply(scrabbleware, args);

  t.equal(typeof passphrase, 'string', 'returns string');
  t.equal(passphrase.split(' ').length, numWords, 'has correct number of words');
  t.equal(extraCharSpy.callCount, numExtra, 'added correct number of extra chars');
});

test('generate(int, int, obj) - addCaps (true)', function(t) {
  t.plan(3);

  const numWords = 4;
  const numExtra = 5;
  const config = { addCaps: true }
  const args = [numWords, numExtra, config];

  const scrabbleware = new Scrabbleware();
  const extraCharSpy = sinon.spy(scrabbleware, '_addExtraChar');
  const addCapsSpy = sinon.spy(scrabbleware, '_maybeToUpperCase');
  const passphrase = scrabbleware.generate.apply(scrabbleware, args);

  t.ok(addCapsSpy.called, 'called _maybeToUpperCase');
  t.equal(passphrase.split(' ').length, numWords, 'has correct number of words');
  t.equal(extraCharSpy.callCount, numExtra, 'added correct number of extra chars');
});

test('generate(int, int, obj) - addCaps (false)', function(t) {
  t.plan(3);

  const numWords = 4;
  const numExtra = 5;
  const config = { addCaps: false }
  const args = [numWords, numExtra, config];

  const scrabbleware = new Scrabbleware();
  const extraCharSpy = sinon.spy(scrabbleware, '_addExtraChar');
  const addCapsSpy = sinon.spy(scrabbleware, '_maybeToUpperCase');
  const passphrase = scrabbleware.generate.apply(scrabbleware, args);

  t.notOk(addCapsSpy.called, 'never called _maybeToUpperCase');
  t.equal(passphrase.split(' ').length, numWords, 'has correct number of words');
  t.equal(extraCharSpy.callCount, numExtra, 'added correct number of extra chars');
});

test('generate(int, int, obj) - separator', function(t) {
  t.plan(2);

  const numWords = 4;
  const numExtra = 5;
  const config = { separator: EM_DASH }
  const args = [numWords, numExtra, config];

  const scrabbleware = new Scrabbleware();
  const extraCharSpy = sinon.spy(scrabbleware, '_addExtraChar');
  const passphrase = scrabbleware.generate.apply(scrabbleware, args);

  t.equal(passphrase.split(EM_DASH).length, numWords, 'uses correct separator');
  t.equal(extraCharSpy.callCount, numExtra, 'added correct number of extra chars');
});
