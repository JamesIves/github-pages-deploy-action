"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const HTMLConstructor_helpers_html_constructor = require("../helpers/html-constructor.js").HTMLConstructor;
const ceReactionsPreSteps_helpers_custom_elements = require("../helpers/custom-elements.js").ceReactionsPreSteps;
const ceReactionsPostSteps_helpers_custom_elements = require("../helpers/custom-elements.js").ceReactionsPostSteps;
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const HTMLElement = require("./HTMLElement.js");

const interfaceName = "HTMLBaseElement";

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
  throw new TypeError(`${context} is not of type 'HTMLBaseElement'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["HTMLBaseElement"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor HTMLBaseElement is not installed on the passed global object");
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
  HTMLElement._internalSetup(obj, globalObject);
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
  if (globalObject.HTMLElement === undefined) {
    throw new Error("Internal error: attempting to evaluate HTMLBaseElement before HTMLElement");
  }
  class HTMLBaseElement extends globalObject.HTMLElement {
    constructor() {
      return HTMLConstructor_helpers_html_constructor(globalObject, interfaceName, new.target);
    }

    get href() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        return esValue[implSymbol]["href"];
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    set href(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = conversions["USVString"](V, {
        context: "Failed to set the 'href' property on 'HTMLBaseElement': The provided value"
      });

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        esValue[implSymbol]["href"] = V;
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    get target() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        const value = esValue[implSymbol].getAttributeNS(null, "target");
        return value === null ? "" : value;
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    set target(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'target' property on 'HTMLBaseElement': The provided value"
      });

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        esValue[implSymbol].setAttributeNS(null, "target", V);
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }
  }
  Object.defineProperties(HTMLBaseElement.prototype, {
    href: { enumerable: true },
    target: { enumerable: true },
    [Symbol.toStringTag]: { value: "HTMLBaseElement", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = HTMLBaseElement;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: HTMLBaseElement
  });
};

const Impl = require("../nodes/HTMLBaseElement-impl.js");
