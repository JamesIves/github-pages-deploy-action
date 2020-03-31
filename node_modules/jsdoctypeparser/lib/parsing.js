'use strict';

/**
 * @typedef AstNode
 * @property {string} type
 * @property {'none'|'single'|'double'} [quoteStyle]
 * @property {string} [key]
 * @property {string} [name]
 * @property {string} [number]
 * @property {string} [path]
 * @property {string} [string]
 * @property {boolean} [hasEventPrefix]
 * @property {boolean} [typeName]
 * @property {Object<string,any>} [meta]
 * @property {AstNode} [returns]
 * @property {AstNode} [new]
 * @property {AstNode} [value]
 * @property {AstNode} [left]
 * @property {AstNode} [right]
 * @property {AstNode} [owner]
 * @property {AstNode} [subject]
 * @property {AstNode} [this]
 * @property {AstNode[]} [entries]
 * @property {AstNode[]} [objects]
 * @property {AstNode[]} [params]
 */

const {SyntaxError: JSDocTypeSyntaxError, parse} = require('../peg_lib/jsdoctype.js');

module.exports = {

  /** * A class for JSDoc type expression syntax errors.
   * @constructor
   * @extends {Error}
   */
  JSDocTypeSyntaxError,


  /**
   * Parse the specified type expression string.
   * @param {string} typeExprStr Type expression string.
   * @return {AstNode} AST.
   */
  parse (typeExprStr) {
    return parse(typeExprStr);
  },
};
