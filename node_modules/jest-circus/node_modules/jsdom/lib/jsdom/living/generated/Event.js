"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const EventInit = require("./EventInit.js");
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;

const interfaceName = "Event";

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
  throw new TypeError(`${context} is not of type 'Event'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["Event"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor Event is not installed on the passed global object");
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
  Object.defineProperties(
    obj,
    Object.getOwnPropertyDescriptors({
      get isTrusted() {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        return esValue[implSymbol]["isTrusted"];
      }
    })
  );

  Object.defineProperties(obj, { isTrusted: { configurable: false } });
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
  class Event {
    constructor(type) {
      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to construct 'Event': 1 argument required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, { context: "Failed to construct 'Event': parameter 1" });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        curArg = EventInit.convert(curArg, { context: "Failed to construct 'Event': parameter 2" });
        args.push(curArg);
      }
      return exports.setup(Object.create(new.target.prototype), globalObject, args);
    }

    composedPath() {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol].composedPath());
    }

    stopPropagation() {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol].stopPropagation();
    }

    stopImmediatePropagation() {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol].stopImmediatePropagation();
    }

    preventDefault() {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol].preventDefault();
    }

    initEvent(type) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to execute 'initEvent' on 'Event': 1 argument required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, { context: "Failed to execute 'initEvent' on 'Event': parameter 1" });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        if (curArg !== undefined) {
          curArg = conversions["boolean"](curArg, { context: "Failed to execute 'initEvent' on 'Event': parameter 2" });
        } else {
          curArg = false;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[2];
        if (curArg !== undefined) {
          curArg = conversions["boolean"](curArg, { context: "Failed to execute 'initEvent' on 'Event': parameter 3" });
        } else {
          curArg = false;
        }
        args.push(curArg);
      }
      return esValue[implSymbol].initEvent(...args);
    }

    get type() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["type"];
    }

    get target() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["target"]);
    }

    get srcElement() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["srcElement"]);
    }

    get currentTarget() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["currentTarget"]);
    }

    get eventPhase() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["eventPhase"];
    }

    get cancelBubble() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["cancelBubble"];
    }

    set cancelBubble(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = conversions["boolean"](V, {
        context: "Failed to set the 'cancelBubble' property on 'Event': The provided value"
      });

      esValue[implSymbol]["cancelBubble"] = V;
    }

    get bubbles() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["bubbles"];
    }

    get cancelable() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["cancelable"];
    }

    get returnValue() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["returnValue"];
    }

    set returnValue(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = conversions["boolean"](V, {
        context: "Failed to set the 'returnValue' property on 'Event': The provided value"
      });

      esValue[implSymbol]["returnValue"] = V;
    }

    get defaultPrevented() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["defaultPrevented"];
    }

    get composed() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["composed"];
    }

    get timeStamp() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["timeStamp"];
    }
  }
  Object.defineProperties(Event.prototype, {
    composedPath: { enumerable: true },
    stopPropagation: { enumerable: true },
    stopImmediatePropagation: { enumerable: true },
    preventDefault: { enumerable: true },
    initEvent: { enumerable: true },
    type: { enumerable: true },
    target: { enumerable: true },
    srcElement: { enumerable: true },
    currentTarget: { enumerable: true },
    eventPhase: { enumerable: true },
    cancelBubble: { enumerable: true },
    bubbles: { enumerable: true },
    cancelable: { enumerable: true },
    returnValue: { enumerable: true },
    defaultPrevented: { enumerable: true },
    composed: { enumerable: true },
    timeStamp: { enumerable: true },
    [Symbol.toStringTag]: { value: "Event", configurable: true },
    NONE: { value: 0, enumerable: true },
    CAPTURING_PHASE: { value: 1, enumerable: true },
    AT_TARGET: { value: 2, enumerable: true },
    BUBBLING_PHASE: { value: 3, enumerable: true }
  });
  Object.defineProperties(Event, {
    NONE: { value: 0, enumerable: true },
    CAPTURING_PHASE: { value: 1, enumerable: true },
    AT_TARGET: { value: 2, enumerable: true },
    BUBBLING_PHASE: { value: 3, enumerable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = Event;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: Event
  });
};

const Impl = require("../events/Event-impl.js");
