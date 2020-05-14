"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const AddEventListenerOptions = require("./AddEventListenerOptions.js");
const EventListenerOptions = require("./EventListenerOptions.js");
const Event = require("./Event.js");
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;

const interfaceName = "EventTarget";

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
  throw new TypeError(`${context} is not of type 'EventTarget'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["EventTarget"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor EventTarget is not installed on the passed global object");
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
  class EventTarget {
    constructor() {
      return exports.setup(Object.create(new.target.prototype), globalObject, undefined);
    }

    addEventListener(type, callback) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 2) {
        throw new TypeError(
          "Failed to execute 'addEventListener' on 'EventTarget': 2 arguments required, but only " +
            arguments.length +
            " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'addEventListener' on 'EventTarget': parameter 1"
        });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        if (curArg === null || curArg === undefined) {
          curArg = null;
        } else {
          if (!utils.isObject(curArg)) {
            throw new TypeError(
              "Failed to execute 'addEventListener' on 'EventTarget': parameter 2" + " is not an object"
            );
          }
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[2];
        if (curArg !== undefined) {
          if (curArg === null || curArg === undefined) {
            curArg = AddEventListenerOptions.convert(curArg, {
              context: "Failed to execute 'addEventListener' on 'EventTarget': parameter 3"
            });
          } else if (utils.isObject(curArg)) {
            curArg = AddEventListenerOptions.convert(curArg, {
              context: "Failed to execute 'addEventListener' on 'EventTarget': parameter 3" + " dictionary"
            });
          } else if (typeof curArg === "boolean") {
            curArg = conversions["boolean"](curArg, {
              context: "Failed to execute 'addEventListener' on 'EventTarget': parameter 3"
            });
          } else {
            curArg = conversions["boolean"](curArg, {
              context: "Failed to execute 'addEventListener' on 'EventTarget': parameter 3"
            });
          }
        }
        args.push(curArg);
      }
      return esValue[implSymbol].addEventListener(...args);
    }

    removeEventListener(type, callback) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 2) {
        throw new TypeError(
          "Failed to execute 'removeEventListener' on 'EventTarget': 2 arguments required, but only " +
            arguments.length +
            " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'removeEventListener' on 'EventTarget': parameter 1"
        });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        if (curArg === null || curArg === undefined) {
          curArg = null;
        } else {
          if (!utils.isObject(curArg)) {
            throw new TypeError(
              "Failed to execute 'removeEventListener' on 'EventTarget': parameter 2" + " is not an object"
            );
          }
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[2];
        if (curArg !== undefined) {
          if (curArg === null || curArg === undefined) {
            curArg = EventListenerOptions.convert(curArg, {
              context: "Failed to execute 'removeEventListener' on 'EventTarget': parameter 3"
            });
          } else if (utils.isObject(curArg)) {
            curArg = EventListenerOptions.convert(curArg, {
              context: "Failed to execute 'removeEventListener' on 'EventTarget': parameter 3" + " dictionary"
            });
          } else if (typeof curArg === "boolean") {
            curArg = conversions["boolean"](curArg, {
              context: "Failed to execute 'removeEventListener' on 'EventTarget': parameter 3"
            });
          } else {
            curArg = conversions["boolean"](curArg, {
              context: "Failed to execute 'removeEventListener' on 'EventTarget': parameter 3"
            });
          }
        }
        args.push(curArg);
      }
      return esValue[implSymbol].removeEventListener(...args);
    }

    dispatchEvent(event) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to execute 'dispatchEvent' on 'EventTarget': 1 argument required, but only " +
            arguments.length +
            " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = Event.convert(curArg, { context: "Failed to execute 'dispatchEvent' on 'EventTarget': parameter 1" });
        args.push(curArg);
      }
      return esValue[implSymbol].dispatchEvent(...args);
    }
  }
  Object.defineProperties(EventTarget.prototype, {
    addEventListener: { enumerable: true },
    removeEventListener: { enumerable: true },
    dispatchEvent: { enumerable: true },
    [Symbol.toStringTag]: { value: "EventTarget", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = EventTarget;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: EventTarget
  });
};

const Impl = require("../events/EventTarget-impl.js");
