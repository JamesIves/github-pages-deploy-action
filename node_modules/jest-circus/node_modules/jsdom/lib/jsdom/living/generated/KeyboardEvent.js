"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const KeyboardEventInit = require("./KeyboardEventInit.js");
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const UIEvent = require("./UIEvent.js");

const interfaceName = "KeyboardEvent";

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
  throw new TypeError(`${context} is not of type 'KeyboardEvent'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["KeyboardEvent"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor KeyboardEvent is not installed on the passed global object");
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
    throw new Error("Internal error: attempting to evaluate KeyboardEvent before UIEvent");
  }
  class KeyboardEvent extends globalObject.UIEvent {
    constructor(type) {
      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to construct 'KeyboardEvent': 1 argument required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, { context: "Failed to construct 'KeyboardEvent': parameter 1" });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        curArg = KeyboardEventInit.convert(curArg, { context: "Failed to construct 'KeyboardEvent': parameter 2" });
        args.push(curArg);
      }
      return exports.setup(Object.create(new.target.prototype), globalObject, args);
    }

    getModifierState(keyArg) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to execute 'getModifierState' on 'KeyboardEvent': 1 argument required, but only " +
            arguments.length +
            " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'getModifierState' on 'KeyboardEvent': parameter 1"
        });
        args.push(curArg);
      }
      return esValue[implSymbol].getModifierState(...args);
    }

    initKeyboardEvent(typeArg) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to execute 'initKeyboardEvent' on 'KeyboardEvent': 1 argument required, but only " +
            arguments.length +
            " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'initKeyboardEvent' on 'KeyboardEvent': parameter 1"
        });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        if (curArg !== undefined) {
          curArg = conversions["boolean"](curArg, {
            context: "Failed to execute 'initKeyboardEvent' on 'KeyboardEvent': parameter 2"
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
            context: "Failed to execute 'initKeyboardEvent' on 'KeyboardEvent': parameter 3"
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
          curArg = conversions["DOMString"](curArg, {
            context: "Failed to execute 'initKeyboardEvent' on 'KeyboardEvent': parameter 5"
          });
        } else {
          curArg = "";
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[5];
        if (curArg !== undefined) {
          curArg = conversions["unsigned long"](curArg, {
            context: "Failed to execute 'initKeyboardEvent' on 'KeyboardEvent': parameter 6"
          });
        } else {
          curArg = 0;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[6];
        if (curArg !== undefined) {
          curArg = conversions["boolean"](curArg, {
            context: "Failed to execute 'initKeyboardEvent' on 'KeyboardEvent': parameter 7"
          });
        } else {
          curArg = false;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[7];
        if (curArg !== undefined) {
          curArg = conversions["boolean"](curArg, {
            context: "Failed to execute 'initKeyboardEvent' on 'KeyboardEvent': parameter 8"
          });
        } else {
          curArg = false;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[8];
        if (curArg !== undefined) {
          curArg = conversions["boolean"](curArg, {
            context: "Failed to execute 'initKeyboardEvent' on 'KeyboardEvent': parameter 9"
          });
        } else {
          curArg = false;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[9];
        if (curArg !== undefined) {
          curArg = conversions["boolean"](curArg, {
            context: "Failed to execute 'initKeyboardEvent' on 'KeyboardEvent': parameter 10"
          });
        } else {
          curArg = false;
        }
        args.push(curArg);
      }
      return esValue[implSymbol].initKeyboardEvent(...args);
    }

    get key() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["key"];
    }

    get code() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["code"];
    }

    get location() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["location"];
    }

    get ctrlKey() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["ctrlKey"];
    }

    get shiftKey() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["shiftKey"];
    }

    get altKey() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["altKey"];
    }

    get metaKey() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["metaKey"];
    }

    get repeat() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["repeat"];
    }

    get isComposing() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["isComposing"];
    }

    get charCode() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["charCode"];
    }

    get keyCode() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["keyCode"];
    }
  }
  Object.defineProperties(KeyboardEvent.prototype, {
    getModifierState: { enumerable: true },
    initKeyboardEvent: { enumerable: true },
    key: { enumerable: true },
    code: { enumerable: true },
    location: { enumerable: true },
    ctrlKey: { enumerable: true },
    shiftKey: { enumerable: true },
    altKey: { enumerable: true },
    metaKey: { enumerable: true },
    repeat: { enumerable: true },
    isComposing: { enumerable: true },
    charCode: { enumerable: true },
    keyCode: { enumerable: true },
    [Symbol.toStringTag]: { value: "KeyboardEvent", configurable: true },
    DOM_KEY_LOCATION_STANDARD: { value: 0x00, enumerable: true },
    DOM_KEY_LOCATION_LEFT: { value: 0x01, enumerable: true },
    DOM_KEY_LOCATION_RIGHT: { value: 0x02, enumerable: true },
    DOM_KEY_LOCATION_NUMPAD: { value: 0x03, enumerable: true }
  });
  Object.defineProperties(KeyboardEvent, {
    DOM_KEY_LOCATION_STANDARD: { value: 0x00, enumerable: true },
    DOM_KEY_LOCATION_LEFT: { value: 0x01, enumerable: true },
    DOM_KEY_LOCATION_RIGHT: { value: 0x02, enumerable: true },
    DOM_KEY_LOCATION_NUMPAD: { value: 0x03, enumerable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = KeyboardEvent;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: KeyboardEvent
  });
};

const Impl = require("../events/KeyboardEvent-impl.js");
