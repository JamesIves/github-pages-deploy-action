"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const ElementDefinitionOptions = require("./ElementDefinitionOptions.js");
const ceReactionsPreSteps_helpers_custom_elements = require("../helpers/custom-elements.js").ceReactionsPreSteps;
const ceReactionsPostSteps_helpers_custom_elements = require("../helpers/custom-elements.js").ceReactionsPostSteps;
const Node = require("./Node.js");
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;

const interfaceName = "CustomElementRegistry";

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
  throw new TypeError(`${context} is not of type 'CustomElementRegistry'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["CustomElementRegistry"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor CustomElementRegistry is not installed on the passed global object");
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
  class CustomElementRegistry {
    constructor() {
      throw new TypeError("Illegal constructor");
    }

    define(name, constructor) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 2) {
        throw new TypeError(
          "Failed to execute 'define' on 'CustomElementRegistry': 2 arguments required, but only " +
            arguments.length +
            " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'define' on 'CustomElementRegistry': parameter 1"
        });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        curArg = utils.tryImplForWrapper(curArg);
        args.push(curArg);
      }
      {
        let curArg = arguments[2];
        curArg = ElementDefinitionOptions.convert(curArg, {
          context: "Failed to execute 'define' on 'CustomElementRegistry': parameter 3"
        });
        args.push(curArg);
      }
      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        return esValue[implSymbol].define(...args);
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    get(name) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to execute 'get' on 'CustomElementRegistry': 1 argument required, but only " +
            arguments.length +
            " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'get' on 'CustomElementRegistry': parameter 1"
        });
        args.push(curArg);
      }
      return esValue[implSymbol].get(...args);
    }

    whenDefined(name) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to execute 'whenDefined' on 'CustomElementRegistry': 1 argument required, but only " +
            arguments.length +
            " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'whenDefined' on 'CustomElementRegistry': parameter 1"
        });
        args.push(curArg);
      }
      return utils.tryWrapperForImpl(esValue[implSymbol].whenDefined(...args));
    }

    upgrade(root) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to execute 'upgrade' on 'CustomElementRegistry': 1 argument required, but only " +
            arguments.length +
            " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = Node.convert(curArg, {
          context: "Failed to execute 'upgrade' on 'CustomElementRegistry': parameter 1"
        });
        args.push(curArg);
      }
      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        return esValue[implSymbol].upgrade(...args);
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }
  }
  Object.defineProperties(CustomElementRegistry.prototype, {
    define: { enumerable: true },
    get: { enumerable: true },
    whenDefined: { enumerable: true },
    upgrade: { enumerable: true },
    [Symbol.toStringTag]: { value: "CustomElementRegistry", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = CustomElementRegistry;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: CustomElementRegistry
  });
};

const Impl = require("../custom-elements/CustomElementRegistry-impl.js");
