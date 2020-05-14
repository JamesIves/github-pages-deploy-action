"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;

const interfaceName = "Headers";

const IteratorPrototype = Object.create(utils.IteratorPrototype, {
  next: {
    value: function next() {
      const internal = this[utils.iterInternalSymbol];
      const { target, kind, index } = internal;
      const values = Array.from(target[implSymbol]);
      const len = values.length;
      if (index >= len) {
        return { value: undefined, done: true };
      }

      const pair = values[index];
      internal.index = index + 1;
      const [key, value] = pair.map(utils.tryWrapperForImpl);

      let result;
      switch (kind) {
        case "key":
          result = key;
          break;
        case "value":
          result = value;
          break;
        case "key+value":
          result = [key, value];
          break;
      }
      return { value: result, done: false };
    },
    writable: true,
    enumerable: true,
    configurable: true
  },
  [Symbol.toStringTag]: {
    value: "Headers Iterator",
    configurable: true
  }
});

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
  throw new TypeError(`${context} is not of type 'Headers'.`);
};

exports.createDefaultIterator = function createDefaultIterator(target, kind) {
  const iterator = Object.create(IteratorPrototype);
  Object.defineProperty(iterator, utils.iterInternalSymbol, {
    value: { target, kind, index: 0 },
    configurable: true
  });
  return iterator;
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["Headers"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor Headers is not installed on the passed global object");
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
  class Headers {
    constructor() {
      const args = [];
      {
        let curArg = arguments[0];
        if (curArg !== undefined) {
          if (utils.isObject(curArg)) {
            if (curArg[Symbol.iterator] !== undefined) {
              if (!utils.isObject(curArg)) {
                throw new TypeError(
                  "Failed to construct 'Headers': parameter 1" + " sequence" + " is not an iterable object."
                );
              } else {
                const V = [];
                const tmp = curArg;
                for (let nextItem of tmp) {
                  if (!utils.isObject(nextItem)) {
                    throw new TypeError(
                      "Failed to construct 'Headers': parameter 1" +
                        " sequence" +
                        "'s element" +
                        " is not an iterable object."
                    );
                  } else {
                    const V = [];
                    const tmp = nextItem;
                    for (let nextItem of tmp) {
                      nextItem = conversions["ByteString"](nextItem, {
                        context:
                          "Failed to construct 'Headers': parameter 1" + " sequence" + "'s element" + "'s element"
                      });

                      V.push(nextItem);
                    }
                    nextItem = V;
                  }

                  V.push(nextItem);
                }
                curArg = V;
              }
            } else {
              if (!utils.isObject(curArg)) {
                throw new TypeError("Failed to construct 'Headers': parameter 1" + " record" + " is not an object.");
              } else {
                const result = Object.create(null);
                for (const key of Reflect.ownKeys(curArg)) {
                  const desc = Object.getOwnPropertyDescriptor(curArg, key);
                  if (desc && desc.enumerable) {
                    let typedKey = key;

                    typedKey = conversions["ByteString"](typedKey, {
                      context: "Failed to construct 'Headers': parameter 1" + " record" + "'s key"
                    });

                    let typedValue = curArg[key];

                    typedValue = conversions["ByteString"](typedValue, {
                      context: "Failed to construct 'Headers': parameter 1" + " record" + "'s value"
                    });

                    result[typedKey] = typedValue;
                  }
                }
                curArg = result;
              }
            }
          } else {
            throw new TypeError("Failed to construct 'Headers': parameter 1" + " is not of any supported type.");
          }
        }
        args.push(curArg);
      }
      return exports.setup(Object.create(new.target.prototype), globalObject, args);
    }

    append(name, value) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 2) {
        throw new TypeError(
          "Failed to execute 'append' on 'Headers': 2 arguments required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["ByteString"](curArg, { context: "Failed to execute 'append' on 'Headers': parameter 1" });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        curArg = conversions["ByteString"](curArg, { context: "Failed to execute 'append' on 'Headers': parameter 2" });
        args.push(curArg);
      }
      return esValue[implSymbol].append(...args);
    }

    delete(name) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to execute 'delete' on 'Headers': 1 argument required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["ByteString"](curArg, { context: "Failed to execute 'delete' on 'Headers': parameter 1" });
        args.push(curArg);
      }
      return esValue[implSymbol].delete(...args);
    }

    get(name) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to execute 'get' on 'Headers': 1 argument required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["ByteString"](curArg, { context: "Failed to execute 'get' on 'Headers': parameter 1" });
        args.push(curArg);
      }
      return esValue[implSymbol].get(...args);
    }

    has(name) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to execute 'has' on 'Headers': 1 argument required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["ByteString"](curArg, { context: "Failed to execute 'has' on 'Headers': parameter 1" });
        args.push(curArg);
      }
      return esValue[implSymbol].has(...args);
    }

    set(name, value) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 2) {
        throw new TypeError(
          "Failed to execute 'set' on 'Headers': 2 arguments required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["ByteString"](curArg, { context: "Failed to execute 'set' on 'Headers': parameter 1" });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        curArg = conversions["ByteString"](curArg, { context: "Failed to execute 'set' on 'Headers': parameter 2" });
        args.push(curArg);
      }
      return esValue[implSymbol].set(...args);
    }

    keys() {
      if (!this || !exports.is(this)) {
        throw new TypeError("Illegal invocation");
      }
      return exports.createDefaultIterator(this, "key");
    }

    values() {
      if (!this || !exports.is(this)) {
        throw new TypeError("Illegal invocation");
      }
      return exports.createDefaultIterator(this, "value");
    }

    entries() {
      if (!this || !exports.is(this)) {
        throw new TypeError("Illegal invocation");
      }
      return exports.createDefaultIterator(this, "key+value");
    }

    forEach(callback) {
      if (!this || !exports.is(this)) {
        throw new TypeError("Illegal invocation");
      }
      if (arguments.length < 1) {
        throw new TypeError("Failed to execute 'forEach' on 'iterable': 1 argument required, " + "but only 0 present.");
      }
      if (typeof callback !== "function") {
        throw new TypeError(
          "Failed to execute 'forEach' on 'iterable': The callback provided " + "as parameter 1 is not a function."
        );
      }
      const thisArg = arguments[1];
      let pairs = Array.from(this[implSymbol]);
      let i = 0;
      while (i < pairs.length) {
        const [key, value] = pairs[i].map(utils.tryWrapperForImpl);
        callback.call(thisArg, value, key, this);
        pairs = Array.from(this[implSymbol]);
        i++;
      }
    }
  }
  Object.defineProperties(Headers.prototype, {
    append: { enumerable: true },
    delete: { enumerable: true },
    get: { enumerable: true },
    has: { enumerable: true },
    set: { enumerable: true },
    keys: { enumerable: true },
    values: { enumerable: true },
    entries: { enumerable: true },
    forEach: { enumerable: true },
    [Symbol.toStringTag]: { value: "Headers", configurable: true },
    [Symbol.iterator]: { value: Headers.prototype.entries, configurable: true, writable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = Headers;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: Headers
  });
};

const Impl = require("../fetch/Headers-impl.js");
