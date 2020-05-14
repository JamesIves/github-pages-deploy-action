"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;

const interfaceName = "Location";

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
  throw new TypeError(`${context} is not of type 'Location'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["Location"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor Location is not installed on the passed global object");
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
  Object.defineProperties(
    obj,
    Object.getOwnPropertyDescriptors({
      assign(url) {
        const esValue = this !== null && this !== undefined ? this : globalObject;
        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        if (arguments.length < 1) {
          throw new TypeError(
            "Failed to execute 'assign' on 'Location': 1 argument required, but only " + arguments.length + " present."
          );
        }
        const args = [];
        {
          let curArg = arguments[0];
          curArg = conversions["USVString"](curArg, {
            context: "Failed to execute 'assign' on 'Location': parameter 1"
          });
          args.push(curArg);
        }
        return esValue[implSymbol].assign(...args);
      },
      replace(url) {
        const esValue = this !== null && this !== undefined ? this : globalObject;
        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        if (arguments.length < 1) {
          throw new TypeError(
            "Failed to execute 'replace' on 'Location': 1 argument required, but only " + arguments.length + " present."
          );
        }
        const args = [];
        {
          let curArg = arguments[0];
          curArg = conversions["USVString"](curArg, {
            context: "Failed to execute 'replace' on 'Location': parameter 1"
          });
          args.push(curArg);
        }
        return esValue[implSymbol].replace(...args);
      },
      reload() {
        const esValue = this !== null && this !== undefined ? this : globalObject;
        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        return esValue[implSymbol].reload();
      },
      get href() {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        return esValue[implSymbol]["href"];
      },
      set href(V) {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        V = conversions["USVString"](V, {
          context: "Failed to set the 'href' property on 'Location': The provided value"
        });

        esValue[implSymbol]["href"] = V;
      },
      toString() {
        const esValue = this;
        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        return esValue[implSymbol]["href"];
      },
      get origin() {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        return esValue[implSymbol]["origin"];
      },
      get protocol() {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        return esValue[implSymbol]["protocol"];
      },
      set protocol(V) {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        V = conversions["USVString"](V, {
          context: "Failed to set the 'protocol' property on 'Location': The provided value"
        });

        esValue[implSymbol]["protocol"] = V;
      },
      get host() {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        return esValue[implSymbol]["host"];
      },
      set host(V) {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        V = conversions["USVString"](V, {
          context: "Failed to set the 'host' property on 'Location': The provided value"
        });

        esValue[implSymbol]["host"] = V;
      },
      get hostname() {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        return esValue[implSymbol]["hostname"];
      },
      set hostname(V) {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        V = conversions["USVString"](V, {
          context: "Failed to set the 'hostname' property on 'Location': The provided value"
        });

        esValue[implSymbol]["hostname"] = V;
      },
      get port() {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        return esValue[implSymbol]["port"];
      },
      set port(V) {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        V = conversions["USVString"](V, {
          context: "Failed to set the 'port' property on 'Location': The provided value"
        });

        esValue[implSymbol]["port"] = V;
      },
      get pathname() {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        return esValue[implSymbol]["pathname"];
      },
      set pathname(V) {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        V = conversions["USVString"](V, {
          context: "Failed to set the 'pathname' property on 'Location': The provided value"
        });

        esValue[implSymbol]["pathname"] = V;
      },
      get search() {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        return esValue[implSymbol]["search"];
      },
      set search(V) {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        V = conversions["USVString"](V, {
          context: "Failed to set the 'search' property on 'Location': The provided value"
        });

        esValue[implSymbol]["search"] = V;
      },
      get hash() {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        return esValue[implSymbol]["hash"];
      },
      set hash(V) {
        const esValue = this !== null && this !== undefined ? this : globalObject;

        if (!exports.is(esValue)) {
          throw new TypeError("Illegal invocation");
        }

        V = conversions["USVString"](V, {
          context: "Failed to set the 'hash' property on 'Location': The provided value"
        });

        esValue[implSymbol]["hash"] = V;
      }
    })
  );

  Object.defineProperties(obj, {
    assign: { configurable: false, writable: false },
    replace: { configurable: false, writable: false },
    reload: { configurable: false, writable: false },
    href: { configurable: false },
    toString: { configurable: false, writable: false },
    origin: { configurable: false },
    protocol: { configurable: false },
    host: { configurable: false },
    hostname: { configurable: false },
    port: { configurable: false },
    pathname: { configurable: false },
    search: { configurable: false },
    hash: { configurable: false }
  });
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
  class Location {
    constructor() {
      throw new TypeError("Illegal constructor");
    }
  }
  Object.defineProperties(Location.prototype, { [Symbol.toStringTag]: { value: "Location", configurable: true } });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = Location;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: Location
  });
};

const Impl = require("../window/Location-impl.js");
