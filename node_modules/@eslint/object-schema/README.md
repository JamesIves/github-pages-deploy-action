# ObjectSchema Package

## Overview

A JavaScript object merge/validation utility where you can define a different merge and validation strategy for each key. This is helpful when you need to validate complex data structures and then merge them in a way that is more complex than `Object.assign()`. This is used in the [`@eslint/config-array`](https://npmjs.com/package/@eslint/config-array) package but can also be used on its own.

## Installation

For Node.js and compatible runtimes:

```shell
npm install @eslint/object-schema
# or
yarn add @eslint/object-schema
# or
pnpm install @eslint/object-schema
# or
bun install @eslint/object-schema
```

For Deno:

```shell
deno add @eslint/object-schema
```

## Usage

Import the `ObjectSchema` constructor:

```js
// using ESM
import { ObjectSchema } from "@eslint/object-schema";

// using CommonJS
const { ObjectSchema } = require("@eslint/object-schema");

const schema = new ObjectSchema({
	// define a definition for the "downloads" key
	downloads: {
		required: true,
		merge(value1, value2) {
			return value1 + value2;
		},
		validate(value) {
			if (typeof value !== "number") {
				throw new Error("Expected downloads to be a number.");
			}
		},
	},

	// define a strategy for the "versions" key
	version: {
		required: true,
		merge(value1, value2) {
			return value1.concat(value2);
		},
		validate(value) {
			if (!Array.isArray(value)) {
				throw new Error("Expected versions to be an array.");
			}
		},
	},
});

const record1 = {
	downloads: 25,
	versions: ["v1.0.0", "v1.1.0", "v1.2.0"],
};

const record2 = {
	downloads: 125,
	versions: ["v2.0.0", "v2.1.0", "v3.0.0"],
};

// make sure the records are valid
schema.validate(record1);
schema.validate(record2);

// merge together (schema.merge() accepts any number of objects)
const result = schema.merge(record1, record2);

// result looks like this:

const result = {
	downloads: 75,
	versions: ["v1.0.0", "v1.1.0", "v1.2.0", "v2.0.0", "v2.1.0", "v3.0.0"],
};
```

## Tips and Tricks

### Named merge strategies

Instead of specifying a `merge()` method, you can specify one of the following strings to use a default merge strategy:

-   `"assign"` - use `Object.assign()` to merge the two values into one object.
-   `"overwrite"` - the second value always replaces the first.
-   `"replace"` - the second value replaces the first if the second is not `undefined`.

For example:

```js
const schema = new ObjectSchema({
	name: {
		merge: "replace",
		validate() {},
	},
});
```

### Named validation strategies

Instead of specifying a `validate()` method, you can specify one of the following strings to use a default validation strategy:

-   `"array"` - value must be an array.
-   `"boolean"` - value must be a boolean.
-   `"number"` - value must be a number.
-   `"object"` - value must be an object.
-   `"object?"` - value must be an object or null.
-   `"string"` - value must be a string.
-   `"string!"` - value must be a non-empty string.

For example:

```js
const schema = new ObjectSchema({
	name: {
		merge: "replace",
		validate: "string",
	},
});
```

### Subschemas

If you are defining a key that is, itself, an object, you can simplify the process by using a subschema. Instead of defining `merge()` and `validate()`, assign a `schema` key that contains a schema definition, like this:

```js
const schema = new ObjectSchema({
	name: {
		schema: {
			first: {
				merge: "replace",
				validate: "string",
			},
			last: {
				merge: "replace",
				validate: "string",
			},
		},
	},
});

schema.validate({
	name: {
		first: "n",
		last: "z",
	},
});
```

### Remove Keys During Merge

If the merge strategy for a key returns `undefined`, then the key will not appear in the final object. For example:

```js
const schema = new ObjectSchema({
	date: {
		merge() {
			return undefined;
		},
		validate(value) {
			Date.parse(value); // throws an error when invalid
		},
	},
});

const object1 = { date: "5/5/2005" };
const object2 = { date: "6/6/2006" };

const result = schema.merge(object1, object2);

console.log("date" in result); // false
```

### Requiring Another Key Be Present

If you'd like the presence of one key to require the presence of another key, you can use the `requires` property to specify an array of other properties that any key requires. For example:

```js
const schema = new ObjectSchema();

const schema = new ObjectSchema({
	date: {
		merge() {
			return undefined;
		},
		validate(value) {
			Date.parse(value); // throws an error when invalid
		},
	},
	time: {
		requires: ["date"],
		merge(first, second) {
			return second;
		},
		validate(value) {
			// ...
		},
	},
});

// throws error: Key "time" requires keys "date"
schema.validate({
	time: "13:45",
});
```

In this example, even though `date` is an optional key, it is required to be present whenever `time` is present.

## License

Apache 2.0

## Sponsors

The following companies, organizations, and individuals support ESLint's ongoing maintenance and development. [Become a Sponsor](https://eslint.org/donate) to get your logo on our README and website.

<!-- NOTE: This section is autogenerated. Do not manually edit.-->
<!--sponsorsstart-->
<h3>Platinum Sponsors</h3>
<p><a href="https://automattic.com"><img src="https://images.opencollective.com/automattic/d0ef3e1/logo.png" alt="Automattic" height="undefined"></a></p><h3>Gold Sponsors</h3>
<p><a href="#"><img src="https://images.opencollective.com/guest-bf377e88/avatar.png" alt="Eli Schleifer" height="96"></a> <a href="https://engineering.salesforce.com"><img src="https://images.opencollective.com/salesforce/ca8f997/logo.png" alt="Salesforce" height="96"></a> <a href="https://www.airbnb.com/"><img src="https://images.opencollective.com/airbnb/d327d66/logo.png" alt="Airbnb" height="96"></a></p><h3>Silver Sponsors</h3>
<p><a href="https://www.jetbrains.com/"><img src="https://images.opencollective.com/jetbrains/fe76f99/logo.png" alt="JetBrains" height="64"></a> <a href="https://liftoff.io/"><img src="https://images.opencollective.com/liftoff/5c4fa84/logo.png" alt="Liftoff" height="64"></a> <a href="https://americanexpress.io"><img src="https://avatars.githubusercontent.com/u/3853301?v=4" alt="American Express" height="64"></a> <a href="https://www.workleap.com"><img src="https://avatars.githubusercontent.com/u/53535748?u=d1e55d7661d724bf2281c1bfd33cb8f99fe2465f&v=4" alt="Workleap" height="64"></a></p><h3>Bronze Sponsors</h3>
<p><a href="https://www.notion.so"><img src="https://images.opencollective.com/notion/bf3b117/logo.png" alt="notion" height="32"></a> <a href="https://www.crosswordsolver.org/anagram-solver/"><img src="https://images.opencollective.com/anagram-solver/2666271/logo.png" alt="Anagram Solver" height="32"></a> <a href="https://icons8.com/"><img src="https://images.opencollective.com/icons8/7fa1641/logo.png" alt="Icons8" height="32"></a> <a href="https://discord.com"><img src="https://images.opencollective.com/discordapp/f9645d9/logo.png" alt="Discord" height="32"></a> <a href="https://www.ignitionapp.com"><img src="https://avatars.githubusercontent.com/u/5753491?v=4" alt="Ignition" height="32"></a> <a href="https://nx.dev"><img src="https://avatars.githubusercontent.com/u/23692104?v=4" alt="Nx" height="32"></a> <a href="https://herocoders.com"><img src="https://avatars.githubusercontent.com/u/37549774?v=4" alt="HeroCoders" height="32"></a></p>
<!--sponsorsend-->
