"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const HTMLConstructor_helpers_html_constructor = require("../helpers/html-constructor.js").HTMLConstructor;
const ceReactionsPreSteps_helpers_custom_elements = require("../helpers/custom-elements.js").ceReactionsPreSteps;
const ceReactionsPostSteps_helpers_custom_elements = require("../helpers/custom-elements.js").ceReactionsPostSteps;
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const HTMLElement = require("./HTMLElement.js");

const interfaceName = "HTMLMeterElement";

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
  throw new TypeError(`${context} is not of type 'HTMLMeterElement'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["HTMLMeterElement"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor HTMLMeterElement is not installed on the passed global object");
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
    throw new Error("Internal error: attempting to evaluate HTMLMeterElement before HTMLElement");
  }
  class HTMLMeterElement extends globalObject.HTMLElement {
    constructor() {
      return HTMLConstructor_helpers_html_constructor(globalObject, interfaceName, new.target);
    }

    get value() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        return esValue[implSymbol]["value"];
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    set value(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = conversions["double"](V, {
        context: "Failed to set the 'value' property on 'HTMLMeterElement': The provided value"
      });

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        esValue[implSymbol]["value"] = V;
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    get min() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        return esValue[implSymbol]["min"];
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    set min(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = conversions["double"](V, {
        context: "Failed to set the 'min' property on 'HTMLMeterElement': The provided value"
      });

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        esValue[implSymbol]["min"] = V;
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    get max() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        return esValue[implSymbol]["max"];
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    set max(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = conversions["double"](V, {
        context: "Failed to set the 'max' property on 'HTMLMeterElement': The provided value"
      });

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        esValue[implSymbol]["max"] = V;
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    get low() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        return esValue[implSymbol]["low"];
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    set low(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = conversions["double"](V, {
        context: "Failed to set the 'low' property on 'HTMLMeterElement': The provided value"
      });

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        esValue[implSymbol]["low"] = V;
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    get high() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        return esValue[implSymbol]["high"];
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    set high(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = conversions["double"](V, {
        context: "Failed to set the 'high' property on 'HTMLMeterElement': The provided value"
      });

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        esValue[implSymbol]["high"] = V;
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    get optimum() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        return esValue[implSymbol]["optimum"];
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    set optimum(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = conversions["double"](V, {
        context: "Failed to set the 'optimum' property on 'HTMLMeterElement': The provided value"
      });

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        esValue[implSymbol]["optimum"] = V;
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    get labels() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["labels"]);
    }
  }
  Object.defineProperties(HTMLMeterElement.prototype, {
    value: { enumerable: true },
    min: { enumerable: true },
    max: { enumerable: true },
    low: { enumerable: true },
    high: { enumerable: true },
    optimum: { enumerable: true },
    labels: { enumerable: true },
    [Symbol.toStringTag]: { value: "HTMLMeterElement", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = HTMLMeterElement;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: HTMLMeterElement
  });
};

const Impl = require("../nodes/HTMLMeterElement-impl.js");
