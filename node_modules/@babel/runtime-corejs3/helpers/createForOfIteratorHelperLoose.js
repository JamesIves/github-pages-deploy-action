var _bindInstanceProperty = require("../core-js/instance/bind");

var _getIterator = require("../core-js/get-iterator");

var _Array$isArray = require("../core-js/array/is-array");

var _getIteratorMethod = require("../core-js/get-iterator-method");

var _Symbol = require("../core-js/symbol");

var unsupportedIterableToArray = require("./unsupportedIterableToArray");

function _createForOfIteratorHelperLoose(o) {
  var _context;

  var i = 0;

  if (typeof _Symbol === "undefined" || _getIteratorMethod(o) == null) {
    if (_Array$isArray(o) || (o = unsupportedIterableToArray(o))) return function () {
      if (i >= o.length) return {
        done: true
      };
      return {
        done: false,
        value: o[i++]
      };
    };
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  i = _getIterator(o);
  return _bindInstanceProperty(_context = i.next).call(_context, i);
}

module.exports = _createForOfIteratorHelperLoose;