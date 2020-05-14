"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const CharacterData = require("./CharacterData.js");

const interfaceName = "Text";

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
  throw new TypeError(`${context} is not of type 'Text'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["Text"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor Text is not installed on the passed global object");
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
  CharacterData._internalSetup(obj, globalObject);
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
  if (globalObject.CharacterData === undefined) {
    throw new Error("Internal error: attempting to evaluate Text before CharacterData");
  }
  class Text extends globalObject.CharacterData {
    constructor() {
      const args = [];
      {
        let curArg = arguments[0];
        if (curArg !== undefined) {
          curArg = conversions["DOMString"](curArg, { context: "Failed to construct 'Text': parameter 1" });
        } else {
          curArg = "";
        }
        args.push(curArg);
      }
      return exports.setup(Object.create(new.target.prototype), globalObject, args);
    }

    splitText(offset) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to execute 'splitText' on 'Text': 1 argument required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["unsigned long"](curArg, {
          context: "Failed to execute 'splitText' on 'Text': parameter 1"
        });
        args.push(curArg);
      }
      return utils.tryWrapperForImpl(esValue[implSymbol].splitText(...args));
    }

    get wholeText() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["wholeText"];
    }

    get assignedSlot() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["assignedSlot"]);
    }
  }
  Object.defineProperties(Text.prototype, {
    splitText: { enumerable: true },
    wholeText: { enumerable: true },
    assignedSlot: { enumerable: true },
    [Symbol.toStringTag]: { value: "Text", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = Text;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: Text
  });
};

const Impl = require("../nodes/Text-impl.js");
