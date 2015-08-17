'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _cryptoRand = require('crypto-rand');

var _cryptoRand2 = _interopRequireDefault(_cryptoRand);

var _performanceNow = require('performance-now');

var _performanceNow2 = _interopRequireDefault(_performanceNow);

var _libSowpods = require('../lib/sowpods');

var _libSowpods2 = _interopRequireDefault(_libSowpods);

var _libTwl = require('../lib/twl');

var _libTwl2 = _interopRequireDefault(_libTwl);

var WORDLISTS = { sowpods: _libSowpods2['default'], twl: _libTwl2['default'] };
var CHARLIST = '!"#$%&\'()*+,-./0123456789:;<=>?@[\\]^_`{|}~';

function randomElement(collection) {
  var index = _cryptoRand2['default'].randInt(0, collection.length - 1);
  return collection[index];
}

function isType(obj, type) {
  return typeof obj === type;
}

var Scrabbleware = (function () {
  /**
  @constructor
  @param {String|Array|Object} opts configuration for the object
  */

  function Scrabbleware(opts) {
    _classCallCheck(this, Scrabbleware);

    var wordlist = 'sowpods';
    var charlist = CHARLIST;

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

  _createClass(Scrabbleware, [{
    key: '_addExtraChar',
    value: function _addExtraChar(_words) {
      // clone the word list so we don't produce side effects
      var words = _words.slice(0);

      // process the word
      var wordIndex = _cryptoRand2['default'].randInt(0, words.length - 1);
      var word = words[wordIndex].split('');

      var charPos = _cryptoRand2['default'].randInt(0, word.length);
      var extraChar = randomElement(this.charlist);

      var entropy = Math.log2(words.length * word.length * this.charlist.length);

      word.splice(charPos, 0, extraChar);
      word = word.join('');

      return [word, wordIndex, entropy];
    }

    /**
    Possibly changes a word to uppercase
    @private
    @param {String} word word to possibly uppercase
    */
  }, {
    key: '_maybeToUpperCase',
    value: function _maybeToUpperCase(word) {
      return _cryptoRand2['default'].randInt(0, 1) ? word.toUpperCase() : word;
    }

    /**
    Generates a new passphrase
    @param {Number} numWords Number of words in the passphrase
    @param {Number} numExtra Number of extra characters to add
    @param {Object} _opts Configuration object
    @returns {Object|String}
    */
  }, {
    key: 'generate',
    value: function generate(numWords, numExtra, _opts) {
      var start = (0, _performanceNow2['default'])();

      var opts = {
        numWords: 4,
        numExtra: 1,
        addCaps: true,
        verbose: false,
        separator: ' '
      };

      if (isType(numWords, 'number') && numWords > 0) {
        opts.numWords = numWords;
      } else if (isType(numWords, 'object')) {
        _extends(opts, numWords);
      } else if (!isType(numWords, 'undefined')) {
        throw new Error('First argument must be Number or Object');
      }

      if (isType(numExtra, 'number')) {
        opts.numExtra = numExtra;
      } else if (isType(numExtra, 'object')) {
        _extends(opts, numExtra);
      } else if (!isType(numExtra, 'undefined')) {
        throw new Error('Second argument must be Number or Object');
      }

      if (isType(_opts, 'object')) {
        _extends(opts, _opts);
      }

      if (!isType(opts.numWords, 'number') || !isType(opts.numExtra, 'number')) {
        throw new Error('numWords or numExtra is not a Number');
      }

      // let the passphrasing begin
      var words = [];
      var entropy = 0;

      for (var i = 0; i < opts.numWords; i++) {
        var word = randomElement(this.wordlist);

        if (opts.addCaps) {
          word = this._maybeToUpperCase(word);
          entropy++;
        }

        words.push(word);
        entropy += Math.log2(this.wordlist.length);
      }

      if (opts.numExtra) {
        for (var i = 0; i < opts.numExtra; i++) {
          var _addExtraChar2 = this._addExtraChar(words);

          var _addExtraChar22 = _slicedToArray(_addExtraChar2, 3);

          var word = _addExtraChar22[0];
          var index = _addExtraChar22[1];
          var extraEntropy = _addExtraChar22[2];

          words[index] = word;
          entropy += extraEntropy;
        }
      }

      var passphrase = words.join(opts.separator);

      var end = (0, _performanceNow2['default'])();
      var time = (end - start) / 1000;

      return opts.verbose ? { passphrase: passphrase, entropy: entropy, time: time } : passphrase;
    }
  }]);

  return Scrabbleware;
})();

exports['default'] = Scrabbleware;
module.exports = exports['default'];