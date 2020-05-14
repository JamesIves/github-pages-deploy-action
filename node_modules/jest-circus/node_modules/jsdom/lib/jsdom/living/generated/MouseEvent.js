"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const MouseEventInit = require("./MouseEventInit.js");
const EventTarget = require("./EventTarget.js");
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const UIEvent = require("./UIEvent.js");

const interfaceName = "MouseEvent";

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
  throw new TypeError(`${context} is not of type 'MouseEvent'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["MouseEvent"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor MouseEvent is not installed on the passed global object");
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
    throw new Error("Internal error: attempting to evaluate MouseEvent before UIEvent");
  }
  class MouseEvent extends globalObject.UIEvent {
    constructor(type) {
      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to construct 'MouseEvent': 1 argument required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, { context: "Failed to construct 'MouseEvent': parameter 1" });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        curArg = MouseEventInit.convert(curArg, { context: "Failed to construct 'MouseEvent': parameter 2" });
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
          "Failed to execute 'getModifierState' on 'MouseEvent': 1 argument required, but only " +
            arguments.length +
            " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'getModifierState' on 'MouseEvent': parameter 1"
        });
        args.push(curArg);
      }
      return esValue[implSymbol].getModifierState(...args);
    }

    initMouseEvent(typeArg) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to execute 'initMouseEvent' on 'MouseEvent': 1 argument required, but only " +
            arguments.length +
            " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'initMouseEvent' on 'MouseEvent': parameter 1"
        });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        if (curArg !== undefined) {
          curArg = conversions["boolean"](curArg, {
            context: "Failed to execute 'initMouseEvent' on 'MouseEvent': parameter 2"
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
            context: "Failed to execute 'initMouseEvent' on 'MouseEvent': parameter 3"
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
            context: "Failed to execute 'initMouseEvent' on 'MouseEvent': parameter 5"
          });
        } else {
          curArg = 0;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[5];
        if (curArg !== undefined) {
          curArg = conversions["long"](curArg, {
            context: "Failed to execute 'initMouseEvent' on 'MouseEvent': parameter 6"
          });
        } else {
          curArg = 0;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[6];
        if (curArg !== undefined) {
          curArg = conversions["long"](curArg, {
            context: "Failed to execute 'initMouseEvent' on 'MouseEvent': parameter 7"
          });
        } else {
          curArg = 0;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[7];
        if (curArg !== undefined) {
          curArg = conversions["long"](curArg, {
            context: "Failed to execute 'initMouseEvent' on 'MouseEvent': parameter 8"
          });
        } else {
          curArg = 0;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[8];
        if (curArg !== undefined) {
          curArg = conversions["long"](curArg, {
            context: "Failed to execute 'initMouseEvent' on 'MouseEvent': parameter 9"
          });
        } else {
          curArg = 0;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[9];
        if (curArg !== undefined) {
          curArg = conversions["boolean"](curArg, {
            context: "Failed to execute 'initMouseEvent' on 'MouseEvent': parameter 10"
          });
        } else {
          curArg = 0;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[10];
        if (curArg !== undefined) {
          curArg = conversions["boolean"](curArg, {
            context: "Failed to execute 'initMouseEvent' on 'MouseEvent': parameter 11"
          });
        } else {
          curArg = 0;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[11];
        if (curArg !== undefined) {
          curArg = conversions["boolean"](curArg, {
            context: "Failed to execute 'initMouseEvent' on 'MouseEvent': parameter 12"
          });
        } else {
          curArg = 0;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[12];
        if (curArg !== undefined) {
          curArg = conversions["boolean"](curArg, {
            context: "Failed to execute 'initMouseEvent' on 'MouseEvent': parameter 13"
          });
        } else {
          curArg = 0;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[13];
        if (curArg !== undefined) {
          curArg = conversions["short"](curArg, {
            context: "Failed to execute 'initMouseEvent' on 'MouseEvent': parameter 14"
          });
        } else {
          curArg = 0;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[14];
        if (curArg !== undefined) {
          if (curArg === null || curArg === undefined) {
            curArg = null;
          } else {
            curArg = EventTarget.convert(curArg, {
              context: "Failed to execute 'initMouseEvent' on 'MouseEvent': parameter 15"
            });
          }
        } else {
          curArg = null;
        }
        args.push(curArg);
      }
      return esValue[implSymbol].initMouseEvent(...args);
    }

    get screenX() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["screenX"];
    }

    get screenY() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["screenY"];
    }

    get clientX() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["clientX"];
    }

    get clientY() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["clientY"];
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

    get button() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["button"];
    }

    get buttons() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["buttons"];
    }

    get relatedTarget() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["relatedTarget"]);
    }
  }
  Object.defineProperties(MouseEvent.prototype, {
    getModifierState: { enumerable: true },
    initMouseEvent: { enumerable: true },
    screenX: { enumerable: true },
    screenY: { enumerable: true },
    clientX: { enumerable: true },
    clientY: { enumerable: true },
    ctrlKey: { enumerable: true },
    shiftKey: { enumerable: true },
    altKey: { enumerable: true },
    metaKey: { enumerable: true },
    button: { enumerable: true },
    buttons: { enumerable: true },
    relatedTarget: { enumerable: true },
    [Symbol.toStringTag]: { value: "MouseEvent", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = MouseEvent;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: MouseEvent
  });
};

const Impl = require("../events/MouseEvent-impl.js");
