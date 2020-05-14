"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const SVGElement = require("./SVGElement.js");

const interfaceName = "SVGGraphicsElement";

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
  throw new TypeError(`${context} is not of type 'SVGGraphicsElement'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["SVGGraphicsElement"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor SVGGraphicsElement is not installed on the passed global object");
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
  SVGElement._internalSetup(obj, globalObject);
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
  if (globalObject.SVGElement === undefined) {
    throw new Error("Internal error: attempting to evaluate SVGGraphicsElement before SVGElement");
  }
  class SVGGraphicsElement extends globalObject.SVGElement {
    constructor() {
      throw new TypeError("Illegal constructor");
    }

    get requiredExtensions() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.getSameObject(this, "requiredExtensions", () => {
        return utils.tryWrapperForImpl(esValue[implSymbol]["requiredExtensions"]);
      });
    }

    get systemLanguage() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.getSameObject(this, "systemLanguage", () => {
        return utils.tryWrapperForImpl(esValue[implSymbol]["systemLanguage"]);
      });
    }
  }
  Object.defineProperties(SVGGraphicsElement.prototype, {
    requiredExtensions: { enumerable: true },
    systemLanguage: { enumerable: true },
    [Symbol.toStringTag]: { value: "SVGGraphicsElement", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = SVGGraphicsElement;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: SVGGraphicsElement
  });
};

const Impl = require("../nodes/SVGGraphicsElement-impl.js");
