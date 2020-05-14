"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const UIEventInit = require("./UIEventInit.js");
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const Event = require("./Event.js");

const interfaceName = "UIEvent";

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
  throw new TypeError(`${context} is not of type 'UIEvent'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["UIEvent"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor UIEvent is not installed on the passed global object");
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
  Event._internalSetup(obj, globalObject);
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
  if (globalObject.Event === undefined) {
    throw new Error("Internal error: attempting to evaluate UIEvent before Event");
  }
  class UIEvent extends globalObject.Event {
    constructor(type) {
      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to construct 'UIEvent': 1 argument required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, { context: "Failed to construct 'UIEvent': parameter 1" });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        curArg = UIEventInit.convert(curArg, { context: "Failed to construct 'UIEvent': parameter 2" });
        args.push(curArg);
      }
      return exports.setup(Object.create(new.target.prototype), globalObject, args);
    }

    initUIEvent(typeArg) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to execute 'initUIEvent' on 'UIEvent': 1 argument required, but only " +
            arguments.length +
            " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'initUIEvent' on 'UIEvent': parameter 1"
        });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        if (curArg !== undefined) {
          curArg = conversions["boolean"](curArg, {
            context: "Failed to execute 'initUIEvent' on 'UIEvent': parameter 2"
          });
        } else {
          curArg = false;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[2];
        if (curArg !== undefined) {
          curArg = conversions["boolean"](curArg, {
            context: "Failed to execute 'initUIEvent' on 'UIEvent': parameter 3"
          });
        } else {
          curArg = false;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[3];
        if (curArg !== undefined) {
          if (curArg === null || curArg === undefined) {
            curArg = null;
          } else {
            curArg = utils.tryImplForWrapper(curArg);
          }
        } else {
          curArg = null;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[4];
        if (curArg !== undefined) {
          curArg = conversions["long"](curArg, {
            context: "Failed to execute 'initUIEvent' on 'UIEvent': parameter 5"
          });
        } else {
          curArg = 0;
        }
        args.push(curArg);
      }
      return esValue[implSymbol].initUIEvent(...args);
    }

    get view() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["view"]);
    }

    get detail() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["detail"];
    }

    get which() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["which"];
    }
  }
  Object.defineProperties(UIEvent.prototype, {
    initUIEvent: { enumerable: true },
    view: { enumerable: true },
    detail: { enumerable: true },
    which: { enumerable: true },
    [Symbol.toStringTag]: { value: "UIEvent", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = UIEvent;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: UIEvent
  });
};

const Impl = require("../events/UIEvent-impl.js");
