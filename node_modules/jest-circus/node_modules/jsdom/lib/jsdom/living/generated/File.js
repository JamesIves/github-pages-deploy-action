"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const Blob = require("./Blob.js");
const FilePropertyBag = require("./FilePropertyBag.js");
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;

const interfaceName = "File";

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
  throw new TypeError(`${context} is not of type 'File'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["File"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor File is not installed on the passed global object");
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
  Blob._internalSetup(obj, globalObject);
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
  if (globalObject.Blob === undefined) {
    throw new Error("Internal error: attempting to evaluate File before Blob");
  }
  class File extends globalObject.Blob {
    constructor(fileBits, fileName) {
      if (arguments.length < 2) {
        throw new TypeError(
          "Failed to construct 'File': 2 arguments required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        if (!utils.isObject(curArg)) {
          throw new TypeError("Failed to construct 'File': parameter 1" + " is not an iterable object.");
        } else {
          const V = [];
          const tmp = curArg;
          for (let nextItem of tmp) {
            if (Blob.is(nextItem)) {
              nextItem = utils.implForWrapper(nextItem);
            } else if (utils.isArrayBuffer(nextItem)) {
            } else if (ArrayBuffer.isView(nextItem)) {
            } else {
              nextItem = conversions["USVString"](nextItem, {
                context: "Failed to construct 'File': parameter 1" + "'s element"
              });
            }
            V.push(nextItem);
          }
          curArg = V;
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        curArg = conversions["USVString"](curArg, { context: "Failed to construct 'File': parameter 2" });
        args.push(curArg);
      }
      {
        let curArg = arguments[2];
        curArg = FilePropertyBag.convert(curArg, { context: "Failed to construct 'File': parameter 3" });
        args.push(curArg);
      }
      return exports.setup(Object.create(new.target.prototype), globalObject, args);
    }

    get name() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["name"];
    }

    get lastModified() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["lastModified"];
    }
  }
  Object.defineProperties(File.prototype, {
    name: { enumerable: true },
    lastModified: { enumerable: true },
    [Symbol.toStringTag]: { value: "File", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = File;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: File
  });
};

const Impl = require("../file-api/File-impl.js");
