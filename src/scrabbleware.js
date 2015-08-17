'use strict';

import random from 'crypto-rand';
import now from 'performance-now';

import sowpods from '../lib/sowpods';
import twl from '../lib/twl';

const WORDLISTS = { sowpods, twl };
const CHARLIST = '!"#$%&\'()*+,-./0123456789:;<=>?@[\\]^_`{|}~';

function randomElement(collection) {
  const index = random.randInt(0, collection.length - 1);
  return collection[index];
}

function isType(obj, type) {
  return typeof obj === type;
}

class Scrabbleware {
  /**
  @constructor
  @param {String|Array|Object} opts configuration for the object
  */
  constructor(opts) {
    let wordlist = 'sowpods';
    let charlist = CHARLIST;

    if (isType(opts, 'string') || Array.isArray(opts)) {
      wordlist = opts;
    } else if (isType(opts, 'object')) {
      if (isType(opts.wordlist, 'string') || Array.isArray(opts.wordlist)) {
        wordlist = opts.wordlist;
      }

      if (opts.charlist) {
        if (isType(opts.charlist, 'string') || Array.isArray(opts.charlist)) {
          charlist = opts.charlist;
        } else {
          throw new Error('charlist must be String or Array');
        }
      }
    } else if (!isType(opts, 'undefined')) {
      throw new Error('Invalid configuration');
    }

    if (isType(wordlist, 'string') && WORDLISTS.hasOwnProperty(wordlist)) {
      this.wordlist = WORDLISTS[wordlist];
    } else if (Array.isArray(wordlist)) {
      this.wordlist = wordlist;
    } else {
      throw new Error('wordlist must be "sowpods", "twl", or Array');
    }

    this.charlist = charlist;
  }

  /**
  Adds an extra character to a random word in a passphrase
  @private
  @param {Array} _words words in the passphrase
  */
  _addExtraChar(_words) {
    // clone the word list so we don't produce side effects
    const words = _words.slice(0);

    // process the word
    const wordIndex = random.randInt(0, words.length - 1);
    let word = words[wordIndex].split('');

    const charPos = random.randInt(0, word.length);
    const extraChar = randomElement(this.charlist);

    const entropy = Math.log2(words.length * word.length * this.charlist.length)

    word.splice(charPos, 0, extraChar);
    word = word.join('');

    return [word, wordIndex, entropy];
  }

  /**
  Possibly changes a word to uppercase
  @private
  @param {String} word word to possibly uppercase
  */
  _maybeToUpperCase(word) {
    return (random.randInt(0, 1))
      ? word.toUpperCase()
      : word;
  }

  /**
  Generates a new passphrase
  @param {Number} numWords Number of words in the passphrase
  @param {Number} numExtra Number of extra characters to add
  @param {Object} _opts Configuration object
  @returns {Object|String}
  */
  generate(numWords, numExtra, _opts) {
    const start = now();

    const opts = {
      numWords: 4,
      numExtra: 1,
      addCaps: true,
      verbose: false,
      separator: ' '
    };

    if (isType(numWords, 'number') && numWords > 0) {
      opts.numWords = numWords;
    } else if (isType(numWords, 'object')) {
      Object.assign(opts, numWords);
    } else if (!isType(numWords, 'undefined')) {
      throw new Error('First argument must be Number or Object');
    }

    if (isType(numExtra, 'number')) {
      opts.numExtra = numExtra;
    } else if (isType(numExtra, 'object')) {
      Object.assign(opts, numExtra);
    } else if (!isType(numExtra, 'undefined')) {
      throw new Error('Second argument must be Number or Object');
    }

    if (isType(_opts, 'object')) {
      Object.assign(opts, _opts);
    }

    if (!isType(opts.numWords, 'number') || !isType(opts.numExtra, 'number')) {
      throw new Error(`numWords or numExtra is not a Number`);
    }

    // let the passphrasing begin
    let words = [];
    let entropy = 0;

    for (let i = 0; i < opts.numWords; i++) {
      let word = randomElement(this.wordlist);

      if (opts.addCaps) {
        word = this._maybeToUpperCase(word);
        entropy++;
      }

      words.push(word);
      entropy += Math.log2(this.wordlist.length);
    }

    if (opts.numExtra) {
      for (let i = 0; i < opts.numExtra; i++) {
        const [word, index, extraEntropy] = this._addExtraChar(words);
        words[index] = word;
        entropy += extraEntropy;
      }
    }

    const passphrase = words.join(opts.separator);

    const end = now();
    const time = (end - start) / 1000;

    return (opts.verbose)
      ? { passphrase, entropy, time }
      : passphrase
  }
}

export default Scrabbleware;
