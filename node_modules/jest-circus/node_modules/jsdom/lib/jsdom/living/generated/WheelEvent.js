"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const WheelEventInit = require("./WheelEventInit.js");
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const MouseEvent = require("./MouseEvent.js");

const interfaceName = "WheelEvent";

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
  throw new TypeError(`${context} is not of type 'WheelEvent'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["WheelEvent"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor WheelEvent is not installed on the passed global object");
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
  MouseEvent._internalSetup(obj, globalObject);
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
  if (globalObject.MouseEvent === undefined) {
    throw new Error("Internal error: attempting to evaluate WheelEvent before MouseEvent");
  }
  class WheelEvent extends globalObject.MouseEvent {
    constructor(type) {
      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to construct 'WheelEvent': 1 argument required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, { context: "Failed to construct 'WheelEvent': parameter 1" });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        curArg = WheelEventInit.convert(curArg, { context: "Failed to construct 'WheelEvent': parameter 2" });
        args.push(curArg);
      }
      return exports.setup(Object.create(new.target.prototype), globalObject, args);
    }

    get deltaX() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["deltaX"];
    }

    get deltaY() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["deltaY"];
    }

    get deltaZ() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["deltaZ"];
    }

    get deltaMode() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["deltaMode"];
    }
  }
  Object.defineProperties(WheelEvent.prototype, {
    deltaX: { enumerable: true },
    deltaY: { enumerable: true },
    deltaZ: { enumerable: true },
    deltaMode: { enumerable: true },
    [Symbol.toStringTag]: { value: "WheelEvent", configurable: true },
    DOM_DELTA_PIXEL: { value: 0x00, enumerable: true },
    DOM_DELTA_LINE: { value: 0x01, enumerable: true },
    DOM_DELTA_PAGE: { value: 0x02, enumerable: true }
  });
  Object.defineProperties(WheelEvent, {
    DOM_DELTA_PIXEL: { value: 0x00, enumerable: true },
    DOM_DELTA_LINE: { value: 0x01, enumerable: true },
    DOM_DELTA_PAGE: { value: 0x02, enumerable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = WheelEvent;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: WheelEvent
  });
};

const Impl = require("../events/WheelEvent-impl.js");
