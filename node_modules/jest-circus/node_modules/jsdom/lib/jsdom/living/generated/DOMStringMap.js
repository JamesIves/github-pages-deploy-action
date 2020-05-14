"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const ceReactionsPreSteps_helpers_custom_elements = require("../helpers/custom-elements.js").ceReactionsPreSteps;
const ceReactionsPostSteps_helpers_custom_elements = require("../helpers/custom-elements.js").ceReactionsPostSteps;
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;

const interfaceName = "DOMStringMap";

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
  throw new TypeError(`${context} is not of type 'DOMStringMap'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["DOMStringMap"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor DOMStringMap is not installed on the passed global object");
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

  {
    let proxyHandler = proxyHandlerCache.get(globalObject);
    if (proxyHandler === undefined) {
      proxyHandler = new ProxyHandler(globalObject);
      proxyHandlerCache.set(globalObject, proxyHandler);
    }
    obj = new Proxy(obj, proxyHandler);
  }

  obj[implSymbol][utils.wrapperSymbol] = obj;
  if (Impl.init) {
    Impl.init(obj[implSymbol], privateData);
  }
  return obj;
};

exports.install = function install(globalObject) {
  class DOMStringMap {
    constructor() {
      throw new TypeError("Illegal constructor");
    }
  }
  Object.defineProperties(DOMStringMap.prototype, {
    [Symbol.toStringTag]: { value: "DOMStringMap", configurable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = DOMStringMap;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: DOMStringMap
  });
};

const proxyHandlerCache = new WeakMap();
class ProxyHandler {
  constructor(globalObject) {
    this._globalObject = globalObject;
  }

  get(target, P, receiver) {
    if (typeof P === "symbol") {
      return Reflect.get(target, P, receiver);
    }
    const desc = this.getOwnPropertyDescriptor(target, P);
    if (desc === undefined) {
      const parent = Object.getPrototypeOf(target);
      if (parent === null) {
        return undefined;
      }
      return Reflect.get(target, P, receiver);
    }
    if (!desc.get && !desc.set) {
      return desc.value;
    }
    const getter = desc.get;
    if (getter === undefined) {
      return undefined;
    }
    return Reflect.apply(getter, receiver, []);
  }

  has(target, P) {
    if (typeof P === "symbol") {
      return Reflect.has(target, P);
    }
    const desc = this.getOwnPropertyDescriptor(target, P);
    if (desc !== undefined) {
      return true;
    }
    const parent = Object.getPrototypeOf(target);
    if (parent !== null) {
      return Reflect.has(parent, P);
    }
    return false;
  }

  ownKeys(target) {
    const keys = new Set();

    for (const key of target[implSymbol][utils.supportedPropertyNames]) {
      if (!utils.hasOwn(target, key)) {
        keys.add(`${key}`);
      }
    }

    for (const key of Reflect.ownKeys(target)) {
      keys.add(key);
    }
    return [...keys];
  }

  getOwnPropertyDescriptor(target, P) {
    if (typeof P === "symbol") {
      return Reflect.getOwnPropertyDescriptor(target, P);
    }
    let ignoreNamedProps = false;

    const namedValue = target[implSymbol][utils.namedGet](P);

    if (namedValue !== undefined && !utils.hasOwn(target, P) && !ignoreNamedProps) {
      return {
        writable: true,
        enumerable: true,
        configurable: true,
        value: utils.tryWrapperForImpl(namedValue)
      };
    }

    return Reflect.getOwnPropertyDescriptor(target, P);
  }

  set(target, P, V, receiver) {
    if (typeof P === "symbol") {
      return Reflect.set(target, P, V, receiver);
    }
    if (target === receiver) {
      const globalObject = this._globalObject;

      if (typeof P === "string" && !utils.isArrayIndexPropName(P)) {
        let namedValue = V;

        namedValue = conversions["DOMString"](namedValue, {
          context: "Failed to set the '" + P + "' property on 'DOMStringMap': The provided value"
        });

        ceReactionsPreSteps_helpers_custom_elements(globalObject);
        try {
          const creating = !(target[implSymbol][utils.namedGet](P) !== undefined);
          if (creating) {
            target[implSymbol][utils.namedSetNew](P, namedValue);
          } else {
            target[implSymbol][utils.namedSetExisting](P, namedValue);
          }
        } finally {
          ceReactionsPostSteps_helpers_custom_elements(globalObject);
        }

        return true;
      }
    }
    let ownDesc;

    if (ownDesc === undefined) {
      ownDesc = Reflect.getOwnPropertyDescriptor(target, P);
    }
    if (ownDesc === undefined) {
      const parent = Reflect.getPrototypeOf(target);
      if (parent !== null) {
        return Reflect.set(parent, P, V, receiver);
      }
      ownDesc = { writable: true, enumerable: true, configurable: true, value: undefined };
    }
    if (!ownDesc.writable) {
      return false;
    }
    if (!utils.isObject(receiver)) {
      return false;
    }
    const existingDesc = Reflect.getOwnPropertyDescriptor(receiver, P);
    let valueDesc;
    if (existingDesc !== undefined) {
      if (existingDesc.get || existingDesc.set) {
        return false;
      }
      if (!existingDesc.writable) {
        return false;
      }
      valueDesc = { value: V };
    } else {
      valueDesc = { writable: true, enumerable: true, configurable: true, value: V };
    }
    return Reflect.defineProperty(receiver, P, valueDesc);
  }

  defineProperty(target, P, desc) {
    if (typeof P === "symbol") {
      return Reflect.defineProperty(target, P, desc);
    }

    const globalObject = this._globalObject;

    if (desc.get || desc.set) {
      return false;
    }

    let namedValue = desc.value;

    namedValue = conversions["DOMString"](namedValue, {
      context: "Failed to set the '" + P + "' property on 'DOMStringMap': The provided value"
    });

    ceReactionsPreSteps_helpers_custom_elements(globalObject);
    try {
      const creating = !(target[implSymbol][utils.namedGet](P) !== undefined);
      if (creating) {
        target[implSymbol][utils.namedSetNew](P, namedValue);
      } else {
        target[implSymbol][utils.namedSetExisting](P, namedValue);
      }
    } finally {
      ceReactionsPostSteps_helpers_custom_elements(globalObject);
    }

    return true;
  }

  deleteProperty(target, P) {
    if (typeof P === "symbol") {
      return Reflect.deleteProperty(target, P);
    }

    const globalObject = this._globalObject;

    if (target[implSymbol][utils.namedGet](P) !== undefined && !utils.hasOwn(target, P)) {
      ceReactionsPreSteps_helpers_custom_elements(globalObject);
      try {
        target[implSymbol][utils.namedDelete](P);
        return true;
      } finally {
        ceReactionsPostSteps_helpers_custom_elements(globalObject);
      }
    }

    return Reflect.deleteProperty(target, P);
  }

  preventExtensions() {
    return false;
  }
}

const Impl = require("../nodes/DOMStringMap-impl.js");
