"use strict";

const enumerationValues = new Set(["start", "center", "end", "nearest"]);
exports.enumerationValues = enumerationValues;

exports.convert = function convert(value, { context = "The provided value" } = {}) {
  const string = `${value}`;
  if (!enumerationValues.has(value)) {
    throw new TypeError(`${context} '${value}' is not a valid enumeration value for ScrollLogicalPosition`);
  }
  return string;
};
