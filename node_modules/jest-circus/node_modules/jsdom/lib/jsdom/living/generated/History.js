"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;

const interfaceName = "History";

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
  throw new TypeError(`${context} is not of type 'History'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["History"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor History is not installed on the passed global object");
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
  class History {
    constructor() {
      throw new TypeError("Illegal constructor");
    }

    go() {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }
      const args = [];
      {
        let curArg = arguments[0];
        if (curArg !== undefined) {
          curArg = conversions["long"](curArg, { context: "Failed to execute 'go' on 'History': parameter 1" });
        } else {
          curArg = 0;
        }
        args.push(curArg);
      }
      return esValue[implSymbol].go(...args);
    }

    back() {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol].back();
    }

    forward() {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol].forward();
    }

    pushState(data, title) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 2) {
        throw new TypeError(
          "Failed to execute 'pushState' on 'History': 2 arguments required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["any"](curArg, { context: "Failed to execute 'pushState' on 'History': parameter 1" });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'pushState' on 'History': parameter 2"
        });
        args.push(curArg);
      }
      {
        let curArg = arguments[2];
        if (curArg !== undefined) {
          if (curArg === null || curArg === undefined) {
            curArg = null;
          } else {
            curArg = conversions["USVString"](curArg, {
              context: "Failed to execute 'pushState' on 'History': parameter 3"
            });
          }
        } else {
          curArg = null;
        }
        args.push(curArg);
      }
      return esValue[implSymbol].pushState(...args);
    }

    replaceState(data, title) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 2) {
        throw new TypeError(
          "Failed to execute 'replaceState' on 'History': 2 arguments required, but only " +
            arguments.length +
            " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["any"](curArg, { context: "Failed to execute 'replaceState' on 'History': parameter 1" });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        curArg = conversions["DOMString"](curArg, {
          context: "Failed to execute 'replaceState' on 'History': parameter 2"
        });
        args.push(curArg);
      }
      {
        let curArg = arguments[2];
        if (curArg !== undefined) {
          if (curArg === null || curArg === undefined) {
            curArg = null;
          } else {
            curArg = conversions["USVString"](curArg, {
              context: "Failed to execute 'replaceState' on 'History': parameter 3"
            });
          }
        } else {
          curArg = null;
        }
        args.push(curArg);
      }
      return esValue[implSymbol].replaceState(...args);
    }

    get length() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["length"];
    }

    get state() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["state"];
    }
  }
  Object.defineProperties(History.prototype, {
    go: { enumerable: true },
    back: { enumerable: true },
    forward: { enumerable: true },
    pushState: { enumerable: true },
    replaceState: { enumerable: true },
    length: { enumerable: true },
    state: { enumerable: true },
    [Symbol.toStringTag]: { value: "History", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = History;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: History
  });
};

const Impl = require("../window/History-impl.js");
