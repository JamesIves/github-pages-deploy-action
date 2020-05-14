"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const EventTarget = require("./EventTarget.js");

const interfaceName = "XMLHttpRequestEventTarget";

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
  throw new TypeError(`${context} is not of type 'XMLHttpRequestEventTarget'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["XMLHttpRequestEventTarget"];
  if (ctor === undefined) {
    throw new Error(
      "Internal error: constructor XMLHttpRequestEventTarget is not installed on the passed global object"
    );
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
  EventTarget._internalSetup(obj, globalObject);
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
  if (globalObject.EventTarget === undefined) {
    throw new Error("Internal error: attempting to evaluate XMLHttpRequestEventTarget before EventTarget");
  }
  class XMLHttpRequestEventTarget extends globalObject.EventTarget {
    constructor() {
      throw new TypeError("Illegal constructor");
    }

    get onloadstart() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["onloadstart"]);
    }

    set onloadstart(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = utils.tryImplForWrapper(V);

      esValue[implSymbol]["onloadstart"] = V;
    }

    get onprogress() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["onprogress"]);
    }

    set onprogress(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = utils.tryImplForWrapper(V);

      esValue[implSymbol]["onprogress"] = V;
    }

    get onabort() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["onabort"]);
    }

    set onabort(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = utils.tryImplForWrapper(V);

      esValue[implSymbol]["onabort"] = V;
    }

    get onerror() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["onerror"]);
    }

    set onerror(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = utils.tryImplForWrapper(V);

      esValue[implSymbol]["onerror"] = V;
    }

    get onload() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["onload"]);
    }

    set onload(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = utils.tryImplForWrapper(V);

      esValue[implSymbol]["onload"] = V;
    }

    get ontimeout() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["ontimeout"]);
    }

    set ontimeout(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = utils.tryImplForWrapper(V);

      esValue[implSymbol]["ontimeout"] = V;
    }

    get onloadend() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["onloadend"]);
    }

    set onloadend(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = utils.tryImplForWrapper(V);

      esValue[implSymbol]["onloadend"] = V;
    }
  }
  Object.defineProperties(XMLHttpRequestEventTarget.prototype, {
    onloadstart: { enumerable: true },
    onprogress: { enumerable: true },
    onabort: { enumerable: true },
    onerror: { enumerable: true },
    onload: { enumerable: true },
    ontimeout: { enumerable: true },
    onloadend: { enumerable: true },
    [Symbol.toStringTag]: { value: "XMLHttpRequestEventTarget", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = XMLHttpRequestEventTarget;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: XMLHttpRequestEventTarget
  });
};

const Impl = require("../xhr/XMLHttpRequestEventTarget-impl.js");
