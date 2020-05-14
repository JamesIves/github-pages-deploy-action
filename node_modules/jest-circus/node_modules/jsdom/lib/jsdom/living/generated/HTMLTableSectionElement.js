"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const HTMLConstructor_helpers_html_constructor = require("../helpers/html-constructor.js").HTMLConstructor;
const ceReactionsPreSteps_helpers_custom_elements = require("../helpers/custom-elements.js").ceReactionsPreSteps;
const ceReactionsPostSteps_helpers_custom_elements = require("../helpers/custom-elements.js").ceReactionsPostSteps;
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const HTMLElement = require("./HTMLElement.js");

const interfaceName = "HTMLTableSectionElement";

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
  throw new TypeError(`${context} is not of type 'HTMLTableSectionElement'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["HTMLTableSectionElement"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor HTMLTableSectionElement is not installed on the passed global object");
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
    throw new Error("Internal error: attempting to evaluate HTMLTableSectionElement before HTMLElement");
  }
  class HTMLTableSectionElement extends globalObject.HTMLElement {
    constructor() {
      return HTMLConstructor_helpers_html_constructor(globalObject, interfaceName, new.target);
    }

    insertRow() {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }
      const args = [];
      {
        let curArg = arguments[0];
        if (curArg !== undefined) {
          curArg = conversions["long"](curArg, {
            context: "Failed to execute 'insertRow' on 'HTMLTableSectionElement': parameter 1"
          });
        } else {
          curArg = -1;
        }
        args.push(curArg);
      }
      return utils.tryWrapperForImpl(esValue[implSymbol].insertRow(...args));
    }

    deleteRow(index) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to execute 'deleteRow' on 'HTMLTableSectionElement': 1 argument required, but only " +
            arguments.length +
            " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["long"](curArg, {
          context: "Failed to execute 'deleteRow' on 'HTMLTableSectionElement': parameter 1"
        });
        args.push(curArg);
      }
      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        return esValue[implSymbol].deleteRow(...args);
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    get rows() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.getSameObject(this, "rows", () => {
        return utils.tryWrapperForImpl(esValue[implSymbol]["rows"]);
      });
    }

    get align() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        const value = esValue[implSymbol].getAttributeNS(null, "align");
        return value === null ? "" : value;
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    set align(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'align' property on 'HTMLTableSectionElement': The provided value"
      });

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        esValue[implSymbol].setAttributeNS(null, "align", V);
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    get ch() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        const value = esValue[implSymbol].getAttributeNS(null, "char");
        return value === null ? "" : value;
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    set ch(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'ch' property on 'HTMLTableSectionElement': The provided value"
      });

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        esValue[implSymbol].setAttributeNS(null, "char", V);
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    get chOff() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        const value = esValue[implSymbol].getAttributeNS(null, "charoff");
        return value === null ? "" : value;
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    set chOff(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'chOff' property on 'HTMLTableSectionElement': The provided value"
      });

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        esValue[implSymbol].setAttributeNS(null, "charoff", V);
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    get vAlign() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        const value = esValue[implSymbol].getAttributeNS(null, "valign");
        return value === null ? "" : value;
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    set vAlign(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = conversions["DOMString"](V, {
        context: "Failed to set the 'vAlign' property on 'HTMLTableSectionElement': The provided value"
      });

      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        esValue[implSymbol].setAttributeNS(null, "valign", V);
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }
  }
  Object.defineProperties(HTMLTableSectionElement.prototype, {
    insertRow: { enumerable: true },
    deleteRow: { enumerable: true },
    rows: { enumerable: true },
    align: { enumerable: true },
    ch: { enumerable: true },
    chOff: { enumerable: true },
    vAlign: { enumerable: true },
    [Symbol.toStringTag]: { value: "HTMLTableSectionElement", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = HTMLTableSectionElement;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: HTMLTableSectionElement
  });
};

const Impl = require("../nodes/HTMLTableSectionElement-impl.js");
