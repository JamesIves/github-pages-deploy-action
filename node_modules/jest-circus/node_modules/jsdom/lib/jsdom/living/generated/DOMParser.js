"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const SupportedType = require("./SupportedType.js");
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;

const interfaceName = "DOMParser";

exports.is = function is(obj) {
  return utils.isObject(obj) && utils.hasOwn(obj, implSymbol) && obj[implSymbol] instanceof Impl.implementation;
};
exports.isImpl = function isImpl(obj) {
  return utils.isObject(obj) && obj instanceof Impl.implementation;
};
exports.convert = function convert(obj, { context = "The provided value" } = {}) {
  if (exports.is(obj)) {
    return utils.implForWrapper(obj);
  }
  throw new TypeError(`${context} is not of type 'DOMParser'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["DOMParser"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor DOMParser is not installed on the passed global object");
  }

  let obj = Object.create(ctor.prototype);
  obj = exports.setup(obj, globalObject, constructorArgs, privateData);
  return obj;
};
exports.createImpl = function createImpl(globalObject, constructorArgs, privateData) {
  const obj = exports.create(globalObject, constructorArgs, privateData);
  return utils.implForWrapper(obj);
};
exports._internalSetup = function _internalSetup(obj, globalObject) {};
exports.setup = function setup(obj, globalObject, constructorArgs = [], privateData = {}) {
  privateData.wrapper = obj;

  exports._internalSetup(obj, globalObject);
  Object.defineProperty(obj, implSymbol, {
    value: new Impl.implementation(globalObject, constructorArgs, privateData),
    configurable: true
  });

  obj[implSymbol][utils.wrapperSymbol] = obj;
  if (Impl.init) {
    Impl.init(obj[implSymbol], privateData);
  }
  return obj;
};

exports.install = function install(globalObject) {
  class DOMParser {
    constructor() {
      return exports.setup(Object.create(new.target.prototype), globalObject, undefined);
    }

    parseFromString(str, type) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 2) {
        throw new TypeError(
          "Failed to execute 'parseFromString' on 'DOMParser': 2 arguments required, but only " +
            arguments.length +
            " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'parseFromString' on 'DOMParser': parameter 1"
        });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        curArg = SupportedType.convert(curArg, {
          context: "Failed to execute 'parseFromString' on 'DOMParser': parameter 2"
        });
        args.push(curArg);
      }
      return utils.tryWrapperForImpl(esValue[implSymbol].parseFromString(...args));
    }
  }
  Object.defineProperties(DOMParser.prototype, {
    parseFromString: { enumerable: true },
    [Symbol.toStringTag]: { value: "DOMParser", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = DOMParser;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: DOMParser
  });
};

const Impl = require("../domparsing/DOMParser-impl.js");
