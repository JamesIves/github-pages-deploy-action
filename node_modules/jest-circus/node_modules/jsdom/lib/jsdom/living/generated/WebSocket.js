"use strict";

const conversions = require("webidl-conversions");
const utils = require("./utils.js");

const Blob = require("./Blob.js");
const BinaryType = require("./BinaryType.js");
const implSymbol = utils.implSymbol;
const ctorRegistrySymbol = utils.ctorRegistrySymbol;
const EventTarget = require("./EventTarget.js");

const interfaceName = "WebSocket";

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
  throw new TypeError(`${context} is not of type 'WebSocket'.`);
};

exports.create = function create(globalObject, constructorArgs, privateData) {
  if (globalObject[ctorRegistrySymbol] === undefined) {
    throw new Error("Internal error: invalid global object");
  }

  const ctor = globalObject[ctorRegistrySymbol]["WebSocket"];
  if (ctor === undefined) {
    throw new Error("Internal error: constructor WebSocket is not installed on the passed global object");
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
    throw new Error("Internal error: attempting to evaluate WebSocket before EventTarget");
  }
  class WebSocket extends globalObject.EventTarget {
    constructor(url) {
      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to construct 'WebSocket': 1 argument required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        curArg = conversions["USVString"](curArg, { context: "Failed to construct 'WebSocket': parameter 1" });
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        if (curArg !== undefined) {
          if (utils.isObject(curArg)) {
            if (curArg[Symbol.iterator] !== undefined) {
              if (!utils.isObject(curArg)) {
                throw new TypeError(
                  "Failed to construct 'WebSocket': parameter 2" + " sequence" + " is not an iterable object."
                );
              } else {
                const V = [];
                const tmp = curArg;
                for (let nextItem of tmp) {
                  nextItem = conversions["DOMString"](nextItem, {
                    context: "Failed to construct 'WebSocket': parameter 2" + " sequence" + "'s element"
                  });

                  V.push(nextItem);
                }
                curArg = V;
              }
            } else {
            }
          } else {
            curArg = conversions["DOMString"](curArg, { context: "Failed to construct 'WebSocket': parameter 2" });
          }
        } else {
          curArg = [];
        }
        args.push(curArg);
      }
      return exports.setup(Object.create(new.target.prototype), globalObject, args);
    }

    close() {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }
      const args = [];
      {
        let curArg = arguments[0];
        if (curArg !== undefined) {
          curArg = conversions["unsigned short"](curArg, {
            context: "Failed to execute 'close' on 'WebSocket': parameter 1",
            clamp: true
          });
        }
        args.push(curArg);
      }
      {
        let curArg = arguments[1];
        if (curArg !== undefined) {
          curArg = conversions["USVString"](curArg, {
            context: "Failed to execute 'close' on 'WebSocket': parameter 2"
          });
        }
        args.push(curArg);
      }
      return esValue[implSymbol].close(...args);
    }

    send(data) {
      const esValue = this !== null && this !== undefined ? this : globalObject;
      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      if (arguments.length < 1) {
        throw new TypeError(
          "Failed to execute 'send' on 'WebSocket': 1 argument required, but only " + arguments.length + " present."
        );
      }
      const args = [];
      {
        let curArg = arguments[0];
        if (Blob.is(curArg)) {
          {
            let curArg = arguments[0];
            curArg = Blob.convert(curArg, { context: "Failed to execute 'send' on 'WebSocket': parameter 1" });
            args.push(curArg);
          }
        } else if (utils.isArrayBuffer(curArg)) {
          {
            let curArg = arguments[0];
            curArg = conversions["ArrayBuffer"](curArg, {
              context: "Failed to execute 'send' on 'WebSocket': parameter 1"
            });
            args.push(curArg);
          }
        } else if (ArrayBuffer.isView(curArg)) {
          {
            let curArg = arguments[0];
            if (ArrayBuffer.isView(curArg)) {
            } else {
              throw new TypeError(
                "Failed to execute 'send' on 'WebSocket': parameter 1" + " is not of any supported type."
              );
            }
            args.push(curArg);
          }
        } else {
          {
            let curArg = arguments[0];
            curArg = conversions["USVString"](curArg, {
              context: "Failed to execute 'send' on 'WebSocket': parameter 1"
            });
            args.push(curArg);
          }
        }
      }
      return esValue[implSymbol].send(...args);
    }

    get url() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["url"];
    }

    get readyState() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["readyState"];
    }

    get bufferedAmount() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["bufferedAmount"];
    }

    get onopen() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["onopen"]);
    }

    set onopen(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = utils.tryImplForWrapper(V);

      esValue[implSymbol]["onopen"] = V;
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

    get onclose() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["onclose"]);
    }

    set onclose(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = utils.tryImplForWrapper(V);

      esValue[implSymbol]["onclose"] = V;
    }

    get extensions() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["extensions"];
    }

    get protocol() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return esValue[implSymbol]["protocol"];
    }

    get onmessage() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["onmessage"]);
    }

    set onmessage(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = utils.tryImplForWrapper(V);

      esValue[implSymbol]["onmessage"] = V;
    }

    get binaryType() {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      return utils.tryWrapperForImpl(esValue[implSymbol]["binaryType"]);
    }

    set binaryType(V) {
      const esValue = this !== null && this !== undefined ? this : globalObject;

      if (!exports.is(esValue)) {
        throw new TypeError("Illegal invocation");
      }

      V = `${V}`;
      if (!BinaryType.enumerationValues.has(V)) {
        return;
      }

      esValue[implSymbol]["binaryType"] = V;
    }
  }
  Object.defineProperties(WebSocket.prototype, {
    close: { enumerable: true },
    send: { enumerable: true },
    url: { enumerable: true },
    readyState: { enumerable: true },
    bufferedAmount: { enumerable: true },
    onopen: { enumerable: true },
    onerror: { enumerable: true },
    onclose: { enumerable: true },
    extensions: { enumerable: true },
    protocol: { enumerable: true },
    onmessage: { enumerable: true },
    binaryType: { enumerable: true },
    [Symbol.toStringTag]: { value: "WebSocket", configurable: true },
    CONNECTING: { value: 0, enumerable: true },
    OPEN: { value: 1, enumerable: true },
    CLOSING: { value: 2, enumerable: true },
    CLOSED: { value: 3, enumerable: true }
  });
  Object.defineProperties(WebSocket, {
    CONNECTING: { value: 0, enumerable: true },
    OPEN: { value: 1, enumerable: true },
    CLOSING: { value: 2, enumerable: true },
    CLOSED: { value: 3, enumerable: true }
  });
  if (globalObject[ctorRegistrySymbol] === undefined) {
    globalObject[ctorRegistrySymbol] = Object.create(null);
  }
  globalObject[ctorRegistrySymbol][interfaceName] = WebSocket;

  Object.defineProperty(globalObject, interfaceName, {
    configurable: true,
    writable: true,
    value: WebSocket
  });
};

const Impl = require("../websockets/WebSocket-impl.js");
