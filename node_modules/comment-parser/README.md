# comment-parser

Generic JSDoc-like comment parser. This library is not intended to be documentation generator, but rather composite unit for it.

`npm install comment-parser`

Module provides `parse(s: string[, opts: object]): object[]` function which takes `/** ... */` comment string and returns array  of objects with parsed data.

It is not trying to detect relations between tags or somehow recognize their meaning. Any tag can be used, as long as it satisfies the format.

```javascript
/**
 * Singleline or multiline description text. Line breaks are preserved.
 *
 * @some-tag {Type} name Singleline or multiline description text
 * @some-tag {Type} name.subname Singleline or multiline description text
 * @some-tag {Type} name.subname.subsubname Singleline or
 * multiline description text
 * @some-tag {Type} [optionalName=someDefault]
 * @another-tag
 */
```

this would be parsed into following

```json
[{
  "tags": [{
    "tag": "some-tag",
    "type": "Type",
    "name": "name",
    "optional": false,
    "description": "Singleline or multiline description text",
    "line": 3,
    "source": "@some-tag {Type} name Singleline or multiline description text"
  }, {
    "tag": "some-tag",
    "type": "Type",
    "name": "name.subname",
    "optional": false,
    "description": "Singleline or multiline description text",
    "line": 4,
    "source": "@some-tag {Type} name.subname Singleline or multiline description text"
  }, {
    "tag": "some-tag",
    "type": "Type",
    "name": "name.subname.subsubname",
    "optional": false,
    "description": "Singleline or\nmultiline description text",
    "line": 5,
    "source": "@some-tag {Type} name.subname.subsubname Singleline or\nmultiline description text"
  }, {
    "tag": "some-tag",
    "type": "Type",
    "name": "optionalName",
    "optional": true,
    "description": "",
    "line": 7,
    "default": "someDefault",
    "source": "@some-tag {Type} [optionalName=someDefault]"
  }, {
    "tag": "another-tag",
    "name": "",
    "optional": false,
    "type": "",
    "description": "",
    "line": 8,
    "source": "@another-tag"
  }],
  "line": 0,
  "description": "Singleline or multiline description text. Line breaks are preserved.",
  "source": "Singleline or multiline description text. Line breaks are preserved.\n\n@some-tag {Type} name Singleline or multiline description text\n@some-tag {Type} name.subname Singleline or multiline description text\n@some-tag {Type} name.subname.subsubname Singleline or\nmultiline description text\n@another-tag"
}]
```

Below are examples of acceptable comment formats

```javascript
/** online comment */

/** first line
 * second line */

/**
   No *s on middle lines is acceptable too
   which might be convenient for writing big
   chunks of text.

 * keeping *s on some lines
 * would work either

   left bound is determined by opening marker position
   and white space will be trimmed as there was '* '
 */

```

Comments starting with `/***` and `/*` are ignored.

Also you can parse entire file with `parse.file('path/to/file', callback)` or acquire an instance of [Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform) stream with `parse.stream()`.

## Options

### `dotted_names: boolean`

By default dotted names like `name.subname.subsubname` will be expanded into
nested sections, this can be prevented by passing `opts.dotted_names = false`.

### `trim: boolean`

Set this to `false` to avoid the default of trimming whitespace at the start and
end of each line.

### `join: string | number | boolean`

If the following lines of a multiline comment do not start with a star, `join` will have the following effect on *tag* `source` (and `description`) when joining the lines together:

1. If a string, use that string in place of the leading whitespace (and avoid newlines).
2. If a non-zero number (e.g., `1`), do no trimming and avoid newlines.
3. If `undefined`, `false`, or `0`, use the default behavior of not trimming
    but adding a newline.
4. Otherwise (e.g., if `join` is `true`), replace any leading whitespace with a single space and avoid newlines.

Note that if a multi-line comment has lines that start with a star, these will
be appended with initial whitespace as is and with newlines regardless of the
`join` setting.

Note also that the *comment* `source` will not be changed by this setting.

### `fence: string | RegExp | ((source: string) => boolean)`

Set to a string or regular expression to toggle state upon finding an
odd number of matches within a line. Defaults to \`\`\`.

If set to a function, it should return `true` to toggle fenced state;
upon returning `true` the first time, this will prevent subsequent lines
from being interpreted as starting a new jsdoc tag until such time as the
function returns `true` again to indicate that the state has toggled
back.

### `parsers: Parser[]` (Custom parsers)

In case you need to parse tags in different way you can pass `opts.parsers = [parser1, ..., parserN]`, where each parser is `function name(str:String, data:Object):{source:String, data:Object}`.

Each parser function takes string left after previous parsers applied and data produced by them. And returns `null` or `{source: '', data:{}}` where `source` is consumed substring and `data` is a payload with tag node fields.

Tag node data is build by merging result bits from all parsers. Here is some example that is not doing actual parsing but is demonstrating the flow:

```javascript
/**
 * Source to be parsed below
 * @tag {type} name Description
 */
parse(source, {parsers: [
	// takes entire string
	function parse_tag(str, data) {
		return {source: ' @tag', data: {tag: 'tag'}};
	},
	// parser throwing exception
	function check_tag(str, data) {
		if (allowed_tags.indexOf(data.tag) === -1) {
			throw new Error('Unrecognized tag "' + data.tag + '"');
		}			
	},
	// takes the rest of the string after ' @tag''
	function parse_name1(str, data) {
		return {source: ' name', data: {name: 'name1'}};
	},
	// alternative name parser
	function parse_name2(str, data) {
		return {source: ' name', data: {name: 'name2'}};
	}
]});
```

This would produce following:

```json
[{
  "tags": [{
    "tag": "tag",
    "errors": [
      "check_tag: Unrecognized tag \"tag\""
    ],
    "name": "name2",
    "optional": false,
    "type": "",
    "description": "",
    "line": 2,
    "source": "@tag {type} name Description"
  }],
  "line": 0,
  "description": "Source to be parsed below",
  "source": "Source to be parsed below\n@tag {type} name Description"
}]
```

## Stringifying

One may also convert `comment-parser` JSON structures back into strings using
the `stringify` method (`stringify(o: (object|Array) [, opts: object]): string`).

This method accepts the JSON as its first argument and an optional options
object with an `indent` property set to either a string or a number that
will be used to determine the number of spaces of indent. The indent of the
start of the doc block will be one space less than the indent of each line of
asterisks for the sake of alignment as per usual practice.

The `stringify` export delegates to the specialized methods `stringifyBlocks`,
`stringifyBlock`, and `stringifyTag`, which are available on the `stringify`
function object.

## Packaging

`comment-parser` is CommonJS module and was primarely designed to be used with Node. Module `index.js` includes stream and file functionality. Use prser-only module in browser `comment-parser/parse.js`

## Contributors

```
> npm info --registry https://registry.npmjs.org comment-parser contributors
```
