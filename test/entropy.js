'use strict';

const test = require('tape');
const sinon = require('sinon');
const Scrabbleware = require('../dist/scrabbleware');

test('entropy : plain', function(t) {
  t.plan(1);

  const wordlist = ['foo', 'bar'];
  const numWords = 2;
  const numExtra = 0;

  const scrabbleware = new Scrabbleware({ wordlist });
  const passphrase = scrabbleware.generate({
    numWords,
    numExtra,
    addCaps: false,
    verbose: true
  });

  const expectedEntropy = Math.log2(Math.pow(wordlist.length, numWords));

  t.equal(passphrase.entropy, expectedEntropy, 'creates correct number of words');
});

test('entropy : capitalization', function(t) {
  t.plan(1);

  const wordlist = ['foo', 'bar'];
  const numWords = 2;
  const numExtra = 0;

  const scrabbleware = new Scrabbleware({ wordlist });
  const passphrase = scrabbleware.generate({
    numWords,
    numExtra,
    addCaps: true,
    verbose: true
  });

  const expectedEntropy = (
    Math.log2(Math.pow(wordlist.length, numWords)) // choosing words
    + 2                                            // choosing capitalization
  );

  t.equal(passphrase.entropy, expectedEntropy, 'creates correct number of words');
});

test('entropy : extra chars', function(t) {
  t.plan(1);

  const wordlist = ['foo', 'bar'];
  const charlist = '!?';
  const numWords = 2;
  const numExtra = 1;

  const scrabbleware = new Scrabbleware({ wordlist, charlist });
  const passphrase = scrabbleware.generate({
    numWords,
    numExtra,
    addCaps: false,
    verbose: true
  });

  const expectedEntropy = (
    Math.log2(Math.pow(wordlist.length, numWords)) // choosing words
    + Math.log2(numWords)                          // choosing word for punctuation
    + Math.log2(charlist.length)                   // choosing extra char
    + Math.log2(3)                                 // choosing where to put extra char
   );

  t.equal(passphrase.entropy, expectedEntropy, 'creates correct number of words');
});

test('entropy : capitalization & extra chars', function(t) {
  t.plan(1);

  const wordlist = ['foo', 'bar'];
  const charlist = '!?';
  const numWords = 2;
  const numExtra = 1;

  const scrabbleware = new Scrabbleware({ wordlist, charlist });
  const passphrase = scrabbleware.generate({
    numWords,
    numExtra,
    addCaps: true,
    verbose: true
  });

  const expectedEntropy = (
    Math.log2(Math.pow(wordlist.length, numWords))   // choosing words
    + Math.log2(numWords)                            // choosing word to add punctuation to
    + Math.log2(charlist.length)                     // choosing extra char
    + Math.log2(3)                                   // choosing where to put extra char
    + numWords                                       // choosing capitalization
   );

  t.equal(passphrase.entropy, expectedEntropy, 'creates correct number of words');
});
