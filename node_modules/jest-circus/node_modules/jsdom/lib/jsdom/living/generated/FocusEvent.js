"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const FocusEventInit = require("./FocusEventInit.js");
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const UIEvent = require("./UIEvent.js");

const interfaceName = "FocusEvent";

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
  throw new TypeError(`${context} is not of type 'FocusEvent'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["FocusEvent"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor FocusEvent is not installed on the passed global object");
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
  UIEvent._internalSetup(obj, globalObject);
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
  if (globalObject.UIEvent === undefined) {
    throw new Error("Internal error: attempting to evaluate FocusEvent before UIEvent");
  }
  class FocusEvent extends globalObject.UIEvent {
    constructor(type) {
      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to construct 'FocusEvent': 1 argument required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, { context: "Failed to construct 'FocusEvent': parameter 1" });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        curArg = FocusEventInit.convert(curArg, { context: "Failed to construct 'FocusEvent': parameter 2" });
        args.push(curArg);
      }
      return exports.setup(Object.create(new.target.prototype), globalObject, args);
    }

    get relatedTarget() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["relatedTarget"]);
    }
  }
  Object.defineProperties(FocusEvent.prototype, {
    relatedTarget: { enumerable: true },
    [Symbol.toStringTag]: { value: "FocusEvent", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = FocusEvent;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: FocusEvent
  });
};

const Impl = require("../events/FocusEvent-impl.js");
