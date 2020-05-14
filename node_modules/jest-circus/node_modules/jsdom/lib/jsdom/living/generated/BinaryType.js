"use strict";

const enumerationValues = new Set(["blob", "arraybuffer"]);
exports.enumerationValues = enumerationValues;

exports.convert = function convert(value, { context = "The provided value" } = {}) {
  const string = `${value}`;
  if (!enumerationValues.has(value)) {
    throw new TypeError(`${context} '${value}' is not a valid enumeration value for BinaryType`);
  }
  return string;
};
