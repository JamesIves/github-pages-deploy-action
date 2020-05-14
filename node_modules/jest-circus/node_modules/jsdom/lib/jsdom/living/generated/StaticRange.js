"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const StaticRangeInit = require("./StaticRangeInit.js");
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const AbstractRange = require("./AbstractRange.js");

const interfaceName = "StaticRange";

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
  throw new TypeError(`${context} is not of type 'StaticRange'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["StaticRange"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor StaticRange is not installed on the passed global object");
  }

  let obj = Object.create(ctor.prototype);
  obj = exports.setup(obj, globalObject, constructorArgs, privateData);
  return obj;
};
exports.createImpl = function createImpl(globalObject, constructorArgs, privateData) {
  const obj = exports.create(globalObject, constructorArgs, privateData);
  return utils.implForWrapper(obj);
};
exports._internalSetup = function _internalSetup(obj, globalObject) {
  AbstractRange._internalSetup(obj, globalObject);
};
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
  if (globalObject.AbstractRange === undefined) {
    throw new Error("Internal error: attempting to evaluate StaticRange before AbstractRange");
  }
  class StaticRange extends globalObject.AbstractRange {
    constructor(init) {
      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to construct 'StaticRange': 1 argument required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = StaticRangeInit.convert(curArg, { context: "Failed to construct 'StaticRange': parameter 1" });
        args.push(curArg);
      }
      return exports.setup(Object.create(new.target.prototype), globalObject, args);
    }
  }
  Object.defineProperties(StaticRange.prototype, {
    [Symbol.toStringTag]: { value: "StaticRange", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = StaticRange;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: StaticRange
  });
};

const Impl = require("../range/StaticRange-impl.js");
