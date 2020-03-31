# v0.7.2
- make stringify to start each line with * in multiline comments

# v0.7.1
- ensure non-space characters after asterisk are included in source

# v0.7.0
- allow fenced blocks in tag description, see opts.fence

# v0.6.2
- document TypeScript definitions

# v0.6.1
- adjust strigifier indentation

# v0.6.0
- soft-drop node@6 support
- migrate to ES6 syntax
- allow to generate comments out of parsed data

# v0.5.5
- allow loose tag names, e.g. @.tag, @-tag

# v0.5.4
- allow quoted literal names, e.g. `@tag "My Var" description`

# v0.5.3
- corrected TypeScript definitions

# v0.5.2
- added TypeScript definitions
- removed `readable-stream` dependency

# v0.5.1
- Support for tab as separator between tag components.
- Docs: Indicate when `optional` is `true`; `default` property

# v0.5.0
- line wrapping control with `opts.join`

# v0.4.2
- tolerate inconsistent lines alignment within block

# v0.4.1
- refactored parsing, allow to not start lines with "* " inside block

# v0.3.2
- fix RegExp for `description` extraction to allow $ char

# v0.3.1
- use `readable-stream` fro Node 0.8 comatibility
- allow to pass optional parameters to `parse.file(path [,opts], done)`  
- allow `parse.stream` to work with Buffers in addition to strings

# v0.3.0
- `feature` allow to use custom parsers
- `feature` always include source, no `raw_value` option needed
- `bugfix` always provide `optional` tag property
- `refactor` clean up tests

# v0.2.3

- `bugfix` Accept `/** one line */` comments
- `refactor` Get rid of `lodash` to avoid unnecessary extra size when bundled

# v0.2.2

- `feature` allow spaces in default values `@my-tag {my.type} [name=John Doe]`

# v0.2.1

- `refactor` make line pasing mechanism more tolerable

# v0.2.0

- `feature` include source line numbers in parsed data
- `feature` optionally prevent dotten names expanding

# v0.1.2

- `bugfix` Allow to build nested tags from `name.subname` even if `name` wasn't d
- `bugfix` Preserve indentation when extracting comments

# v0.1.1

- `improvement` `parse(source)` returns array of all blocks found in source or an empty array
- `bugfix` fixed indented blocks parsing

# v0.1.0

Initial implementation
