// Type definitions for comment-parser
// Project: comment-parser
// Definitions by: Javier "Ciberman" Mora <https://github.com/jhm-ciberman/>

declare namespace parse {

  /**
   * In case you need to parse tags in a different way you can specify custom parsers here.
   * Each parser function takes string left after previous parsers were applied and the data produced by them.
   * It should return either `undefined` or the new object, where `source` is the consumed substring.
   */
  export type Parser = (str: string, data: any) => { source: string, data: any };

  /**
   * Represents a parsed doc comment.
   */
  export interface Comment {
    /**
     * A list of tags that are present in this doc comment.
     */
    tags: Tag[];
    /**
     * The starting line in the source code of this doc comment.
     */
    line: number;
    /**
     * The description of this doc comment. Empty string if no description was specified.
     */
    description: string;
    /**
     * The source of this doc comment, exactly as it appeared in the doc comment before parsing.
     */
    source: string;
  }

  /**
   * Represents a parsed tag. A tag has the following format:
   * >  &#64;tag {type} [name=default] description
   */
  export interface Tag {
    /**
     * The tag's kind, eg `param` or `return`.
     */
    tag: string;
    /**
     * The name of this tag, ie the first word after the tag. Empty string if no name was specified.
     */
    name: string;
    /**
     * `true` if the tag is optional (tag name enclosed in brackets), `false` otherwise.
     */
    optional: boolean;
    /**
     * The type declaration of this tag that is enclosed in curly braces. Empty string if no type was specified.
     */
    type: string;
    /**
     * The description of this tag that comes after the name. Empty string if no description was specified.
     */
    description: string;
    /**
     * The line number where this tag starts
     */
    line: number;
    /**
     * The source of this tag, exactly as it appeared in the doc comment before parsing.
     */
    source: string;
    /**
     * The default value for this tag. `undefined` in case no default value was specified.
     */
    default?: string;
    /**
     * A list of errors that occurred during the parsing of this tag. `undefined` if not error occurred.
     */
    errors? : string[];
    /**
     * If `dotted_names` was set to `true`, a list of sub tags. `undefined` if `dotted_names` was set to `false` or if
     * no sub tags exist.
     */
    tags?: Tag[];
  }

  /**
   * Options for parsing doc comments.
   */
  export interface Options {
    /**
     * In case you need to parse tags in a different way you can specify custom parsers here.
     * Each parser function takes string left after previous parsers were applied and the data produced by them.
     * It should return either `undefined` or the new object, where `source` is the consumed substring.
     *
     * If you specify custom parsers, the default parsers are overwritten, but you can access them via the constant
     * `PARSERS`.
     */
    parsers: Parser[];
    /**
     * By default dotted names like `name.subname.subsubname` will be expanded into nested sections, this can be
     * prevented by passing `opts.dotted_names = false`.
     */
    dotted_names: boolean;
    /**
     * Impacts behavior of joining non-asterisked multiline comments. Strings,
     * non-zero numbers, or `true` will collapse newlines. Strings will
     * additionally replace leading whitespace and `true` will replace with
     * a single space.
     */
    join: string | number | boolean;
    /**
     * `true` to trim whitespace at the start and end of each line, `false` otherwise.
     */
    trim: boolean;
    /**
     * Return `true` to toggle fenced state; upon returning `true` the
     * first time, will prevent subsequent lines from being interpreted as
     * starting a new jsdoc tag until such time as the function returns
     * `true` again to indicate that the state has toggled back; can also
     * be simply set to a string or regular expression which will toggle
     * state upon finding an odd number of matches within a line.
     */
    fence: string | RegExp | ((source: string) => boolean);
  }

    /**
   * Options for turning a parsed doc comment back into a string.
   */
  export interface StringifyOptions {
    /**
     * Indentation for each line. If a string is passed, that string is used verbatim to indent each line. If a number
     * is passed, indents each line with that many whitespaces.
     */
    indent: string | number;
  }

  export interface Stringify {
    /**
     * One may also convert comment-parser JSON structures back into strings using this stringify method.
     *
     * This method accepts the JSON as its first argument and an optional options object with an indent property set to
     * either a string or a number that will be used to determine the number of spaces of indent. The indent of the start
     * of the doc block will be one space less than the indent of each line of asterisks for the sake of alignment as per
     * usual practice.
     *
     * The stringify export delegates to the specialized methods `stringifyBlocks`, `stringifyBlock`, and
     * `stringifyTag`, which are available on the stringify function object.
     * @param comment A tag, comment or a list of comments to stringify.
     * @param options Options to control how the comment or comments are stringified.
     * @return The stringified doc comment(s).
     */
    (comment: Tag | Comment | Comment[], options?: Partial<StringifyOptions>): string;
    /**
     * Similar to `stringify`, but only accepts a list of doc comments.
     * @param comments A list of comments to stringify.
     * @param options Options to control how the comments are stringified.
     * @return The stringified doc comment(s).
     */
    stringifyBlocks(comments: Comment[], options?: Partial<StringifyOptions>): string;
    /**
     * Similar to `stringify`, but only accepts a single doc comment.
     * @param comment A comment to stringify.
     * @param options Options to control how the comment is stringified.
     * @return The stringified doc comment(s).
     */
    stringifyBlock(comment: Comment, options?: Partial<StringifyOptions>): string;
    /**
     * Similar to `stringify`, but only accepts a single tag.
     * @param tag A tag to stringify.
     * @param options Options to control how the tag is stringified.
     * @return The stringified doc comment(s).
     */
    stringifyTag(tag: Tag, options?: Partial<StringifyOptions>): string;
  }

  export const stringify: parse.Stringify;

  /**
   * The default list of parsers that is used to parse comments.
   */
  export const PARSERS: Record<"parse_tag" | "parse_type" | "parse_description" | "parse_name", Parser>
}

/**
 * The main method of this module which takes comment string and returns an array of objects with parsed data.
 * It is not trying to detect relations between tags or somehow recognize their meaning. Any tag can be used, as long
 * as it satisfies the format.
 * @param str A string with doc comments and source code to parse.
 * @param opts Options to control how the source string is parsed.
 * @return The parsed list of doc comments.
 */
declare function parse(str: string, opts?: Partial<parse.Options>): parse.Comment[];

export = parse;
