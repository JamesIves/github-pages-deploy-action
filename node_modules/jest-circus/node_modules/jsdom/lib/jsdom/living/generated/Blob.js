"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const BlobPropertyBag = require("./BlobPropertyBag.js");
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;

const interfaceName = "Blob";

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
  throw new TypeError(`${context} is not of type 'Blob'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["Blob"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor Blob is not installed on the passed global object");
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
  class Blob {
    constructor() {
      const args = [];
      {
        let curArg = arguments[0];
        if (curArg !== undefined) {
          if (!utils.isObject(curArg)) {
            throw new TypeError("Failed to construct 'Blob': parameter 1" + " is not an iterable object.");
          } else {
            const V = [];
            const tmp = curArg;
            for (let nextItem of tmp) {
              if (exports.is(nextItem)) {
                nextItem = utils.implForWrapper(nextItem);
              } else if (utils.isArrayBuffer(nextItem)) {
              } else if (ArrayBuffer.isView(nextItem)) {
              } else {
                nextItem = conversions["USVString"](nextItem, {
                  context: "Failed to construct 'Blob': parameter 1" + "'s element"
                });
              }
              V.push(nextItem);
            }
            curArg = V;
          }
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        curArg = BlobPropertyBag.convert(curArg, { context: "Failed to construct 'Blob': parameter 2" });
        args.push(curArg);
      }
      return exports.setup(Object.create(new.target.prototype), globalObject, args);
    }

    slice() {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }
      const args = [];
      {
        let curArg = arguments[0];
        if (curArg !== undefined) {
          curArg = conversions["long long"](curArg, {
            context: "Failed to execute 'slice' on 'Blob': parameter 1",
            clamp: true
          });
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        if (curArg !== undefined) {
          curArg = conversions["long long"](curArg, {
            context: "Failed to execute 'slice' on 'Blob': parameter 2",
            clamp: true
          });
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[2];
        if (curArg !== undefined) {
          curArg = conversions["DOMString"](curArg, { context: "Failed to execute 'slice' on 'Blob': parameter 3" });
        }
        args.push(curArg);
      }
      return utils.tryWrapperForImpl(esValue[implSymbol].slice(...args));
    }

    get size() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["size"];
    }

    get type() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["type"];
    }
  }
  Object.defineProperties(Blob.prototype, {
    slice: { enumerable: true },
    size: { enumerable: true },
    type: { enumerable: true },
    [Symbol.toStringTag]: { value: "Blob", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = Blob;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: Blob
  });
};

const Impl = require("../file-api/Blob-impl.js");
