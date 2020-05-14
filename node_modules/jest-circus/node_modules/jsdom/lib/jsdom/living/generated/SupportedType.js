"use strict";

const enumerationValues = new Set([
  "text/html",
  "text/xml",
  "application/xml",
  "application/xhtml+xml",
  "image/svg+xml"
]);
exports.enumerationValues = enumerationValues;

exports.convert = function convert(value, { context = "The provided value" } = {}) {
  const string = `${value}`;
  if (!enumerationValues.has(value)) {
    throw new TypeError(`${context} '${value}' is not a valid enumeration value for SupportedType`);
  }
  return string;
};
