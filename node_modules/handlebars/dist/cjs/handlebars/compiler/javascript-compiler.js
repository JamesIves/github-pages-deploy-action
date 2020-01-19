'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _base = require('../base');

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

var _utils = require('../utils');

var _codeGen = require('./code-gen');

var _codeGen2 = _interopRequireDefault(_codeGen);

function Literal(value) {
  this.value = value;
}

function JavaScriptCompiler() {}

JavaScriptCompiler.prototype = {
  // PUBLIC API: You can override these methods in a subclass to provide
  // alternative compiled forms for name lookup and buffering semantics
  nameLookup: function nameLookup(parent, name /* , type*/) {
    var isEnumerable = [this.aliasable('container.propertyIsEnumerable'), '.call(', parent, ',"constructor")'];

    if (name === 'constructor') {
      return ['(', isEnumerable, '?', _actualLookup(), ' : undefined)'];
    }
    return _actualLookup();

    function _actualLookup() {
      if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
        return [parent, '.', name];
      } else {
        return [parent, '[', JSON.stringify(name), ']'];
      }
    }
  },
  depthedLookup: function depthedLookup(name) {
    return [this.aliasable('container.lookup'), '(depths, "', name, '")'];
  },

  compilerInfo: function compilerInfo() {
    var revision = _base.COMPILER_REVISION,
        versions = _base.REVISION_CHANGES[revision];
    return [revision, versions];
  },

  appendToBuffer: function appendToBuffer(source, location, explicit) {
    // Force a source as this simplifies the merge logic.
    if (!_utils.isArray(source)) {
      source = [source];
    }
    source = this.source.wrap(source, location);

    if (this.environment.isSimple) {
      return ['return ', source, ';'];
    } else if (explicit) {
      // This is a case where the buffer operation occurs as a child of another
      // construct, generally braces. We have to explicitly output these buffer
      // operations to ensure that the emitted code goes in the correct location.
      return ['buffer += ', source, ';'];
    } else {
      source.appendToBuffer = true;
      return source;
    }
  },

  initializeBuffer: function initializeBuffer() {
    return this.quotedString('');
  },
  // END PUBLIC API

  compile: function compile(environment, options, context, asObject) {
    this.environment = environment;
    this.options = options;
    this.stringParams = this.options.stringParams;
    this.trackIds = this.options.trackIds;
    this.precompile = !asObject;

    this.name = this.environment.name;
    this.isChild = !!context;
    this.context = context || {
      decorators: [],
      programs: [],
      environments: []
    };

    this.preamble();

    this.stackSlot = 0;
    this.stackVars = [];
    this.aliases = {};
    this.registers = { list: [] };
    this.hashes = [];
    this.compileStack = [];
    this.inlineStack = [];
    this.blockParams = [];

    this.compileChildren(environment, options);

    this.useDepths = this.useDepths || environment.useDepths || environment.useDecorators || this.options.compat;
    this.useBlockParams = this.useBlockParams || environment.useBlockParams;

    var opcodes = environment.opcodes,
        opcode = undefined,
        firstLoc = undefined,
        i = undefined,
        l = undefined;

    for (i = 0, l = opcodes.length; i < l; i++) {
      opcode = opcodes[i];

      this.source.currentLocation = opcode.loc;
      firstLoc = firstLoc || opcode.loc;
      this[opcode.opcode].apply(this, opcode.args);
    }

    // Flush any trailing content that might be pending.
    this.source.currentLocation = firstLoc;
    this.pushSource('');

    /* istanbul ignore next */
    if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
      throw new _exception2['default']('Compile completed with content left on stack');
    }

    if (!this.decorators.isEmpty()) {
      this.useDecorators = true;

      this.decorators.prepend('var decorators = container.decorators;\n');
      this.decorators.push('return fn;');

      if (asObject) {
        this.decorators = Function.apply(this, ['fn', 'props', 'container', 'depth0', 'data', 'blockParams', 'depths', this.decorators.merge()]);
      } else {
        this.decorators.prepend('function(fn, props, container, depth0, data, blockParams, depths) {\n');
        this.decorators.push('}\n');
        this.decorators = this.decorators.merge();
      }
    } else {
      this.decorators = undefined;
    }

    var fn = this.createFunctionContext(asObject);
    if (!this.isChild) {
      var ret = {
        compiler: this.compilerInfo(),
        main: fn
      };

      if (this.decorators) {
        ret.main_d = this.decorators; // eslint-disable-line camelcase
        ret.useDecorators = true;
      }

      var _context = this.context;
      var programs = _context.programs;
      var decorators = _context.decorators;

      for (i = 0, l = programs.length; i < l; i++) {
        if (programs[i]) {
          ret[i] = programs[i];
          if (decorators[i]) {
            ret[i + '_d'] = decorators[i];
            ret.useDecorators = true;
          }
        }
      }

      if (this.environment.usePartial) {
        ret.usePartial = true;
      }
      if (this.options.data) {
        ret.useData = true;
      }
      if (this.useDepths) {
        ret.useDepths = true;
      }
      if (this.useBlockParams) {
        ret.useBlockParams = true;
      }
      if (this.options.compat) {
        ret.compat = true;
      }

      if (!asObject) {
        ret.compiler = JSON.stringify(ret.compiler);

        this.source.currentLocation = { start: { line: 1, column: 0 } };
        ret = this.objectLiteral(ret);

        if (options.srcName) {
          ret = ret.toStringWithSourceMap({ file: options.destName });
          ret.map = ret.map && ret.map.toString();
        } else {
          ret = ret.toString();
        }
      } else {
        ret.compilerOptions = this.options;
      }

      return ret;
    } else {
      return fn;
    }
  },

  preamble: function preamble() {
    // track the last context pushed into place to allow skipping the
    // getContext opcode when it would be a noop
    this.lastContext = 0;
    this.source = new _codeGen2['default'](this.options.srcName);
    this.decorators = new _codeGen2['default'](this.options.srcName);
  },

  createFunctionContext: function createFunctionContext(asObject) {
    var varDeclarations = '';

    var locals = this.stackVars.concat(this.registers.list);
    if (locals.length > 0) {
      varDeclarations += ', ' + locals.join(', ');
    }

    // Generate minimizer alias mappings
    //
    // When using true SourceNodes, this will update all references to the given alias
    // as the source nodes are reused in situ. For the non-source node compilation mode,
    // aliases will not be used, but this case is already being run on the client and
    // we aren't concern about minimizing the template size.
    var aliasCount = 0;
    for (var alias in this.aliases) {
      // eslint-disable-line guard-for-in
      var node = this.aliases[alias];
      if (this.aliases.hasOwnProperty(alias) && node.children && node.referenceCount > 1) {
        varDeclarations += ', alias' + ++aliasCount + '=' + alias;
        node.children[0] = 'alias' + aliasCount;
      }
    }

    var params = ['container', 'depth0', 'helpers', 'partials', 'data'];

    if (this.useBlockParams || this.useDepths) {
      params.push('blockParams');
    }
    if (this.useDepths) {
      params.push('depths');
    }

    // Perform a second pass over the output to merge content when possible
    var source = this.mergeSource(varDeclarations);

    if (asObject) {
      params.push(source);

      return Function.apply(this, params);
    } else {
      return this.source.wrap(['function(', params.join(','), ') {\n  ', source, '}']);
    }
  },
  mergeSource: function mergeSource(varDeclarations) {
    var isSimple = this.environment.isSimple,
        appendOnly = !this.forceBuffer,
        appendFirst = undefined,
        sourceSeen = undefined,
        bufferStart = undefined,
        bufferEnd = undefined;
    this.source.each(function (line) {
      if (line.appendToBuffer) {
        if (bufferStart) {
          line.prepend('  + ');
        } else {
          bufferStart = line;
        }
        bufferEnd = line;
      } else {
        if (bufferStart) {
          if (!sourceSeen) {
            appendFirst = true;
          } else {
            bufferStart.prepend('buffer += ');
          }
          bufferEnd.add(';');
          bufferStart = bufferEnd = undefined;
        }

        sourceSeen = true;
        if (!isSimple) {
          appendOnly = false;
        }
      }
    });

    if (appendOnly) {
      if (bufferStart) {
        bufferStart.prepend('return ');
        bufferEnd.add(';');
      } else if (!sourceSeen) {
        this.source.push('return "";');
      }
    } else {
      varDeclarations += ', buffer = ' + (appendFirst ? '' : this.initializeBuffer());

      if (bufferStart) {
        bufferStart.prepend('return buffer + ');
        bufferEnd.add(';');
      } else {
        this.source.push('return buffer;');
      }
    }

    if (varDeclarations) {
      this.source.prepend('var ' + varDeclarations.substring(2) + (appendFirst ? '' : ';\n'));
    }

    return this.source.merge();
  },

  // [blockValue]
  //
  // On stack, before: hash, inverse, program, value
  // On stack, after: return value of blockHelperMissing
  //
  // The purpose of this opcode is to take a block of the form
  // `{{#this.foo}}...{{/this.foo}}`, resolve the value of `foo`, and
  // replace it on the stack with the result of properly
  // invoking blockHelperMissing.
  blockValue: function blockValue(name) {
    var blockHelperMissing = this.aliasable('container.hooks.blockHelperMissing'),
        params = [this.contextName(0)];
    this.setupHelperArgs(name, 0, params);

    var blockName = this.popStack();
    params.splice(1, 0, blockName);

    this.push(this.source.functionCall(blockHelperMissing, 'call', params));
  },

  // [ambiguousBlockValue]
  //
  // On stack, before: hash, inverse, program, value
  // Compiler value, before: lastHelper=value of last found helper, if any
  // On stack, after, if no lastHelper: same as [blockValue]
  // On stack, after, if lastHelper: value
  ambiguousBlockValue: function ambiguousBlockValue() {
    // We're being a bit cheeky and reusing the options value from the prior exec
    var blockHelperMissing = this.aliasable('container.hooks.blockHelperMissing'),
        params = [this.contextName(0)];
    this.setupHelperArgs('', 0, params, true);

    this.flushInline();

    var current = this.topStack();
    params.splice(1, 0, current);

    this.pushSource(['if (!', this.lastHelper, ') { ', current, ' = ', this.source.functionCall(blockHelperMissing, 'call', params), '}']);
  },

  // [appendContent]
  //
  // On stack, before: ...
  // On stack, after: ...
  //
  // Appends the string value of `content` to the current buffer
  appendContent: function appendContent(content) {
    if (this.pendingContent) {
      content = this.pendingContent + content;
    } else {
      this.pendingLocation = this.source.currentLocation;
    }

    this.pendingContent = content;
  },

  // [append]
  //
  // On stack, before: value, ...
  // On stack, after: ...
  //
  // Coerces `value` to a String and appends it to the current buffer.
  //
  // If `value` is truthy, or 0, it is coerced into a string and appended
  // Otherwise, the empty string is appended
  append: function append() {
    if (this.isInline()) {
      this.replaceStack(function (current) {
        return [' != null ? ', current, ' : ""'];
      });

      this.pushSource(this.appendToBuffer(this.popStack()));
    } else {
      var local = this.popStack();
      this.pushSource(['if (', local, ' != null) { ', this.appendToBuffer(local, undefined, true), ' }']);
      if (this.environment.isSimple) {
        this.pushSource(['else { ', this.appendToBuffer("''", undefined, true), ' }']);
      }
    }
  },

  // [appendEscaped]
  //
  // On stack, before: value, ...
  // On stack, after: ...
  //
  // Escape `value` and append it to the buffer
  appendEscaped: function appendEscaped() {
    this.pushSource(this.appendToBuffer([this.aliasable('container.escapeExpression'), '(', this.popStack(), ')']));
  },

  // [getContext]
  //
  // On stack, before: ...
  // On stack, after: ...
  // Compiler value, after: lastContext=depth
  //
  // Set the value of the `lastContext` compiler value to the depth
  getContext: function getContext(depth) {
    this.lastContext = depth;
  },

  // [pushContext]
  //
  // On stack, before: ...
  // On stack, after: currentContext, ...
  //
  // Pushes the value of the current context onto the stack.
  pushContext: function pushContext() {
    this.pushStackLiteral(this.contextName(this.lastContext));
  },

  // [lookupOnContext]
  //
  // On stack, before: ...
  // On stack, after: currentContext[name], ...
  //
  // Looks up the value of `name` on the current context and pushes
  // it onto the stack.
  lookupOnContext: function lookupOnContext(parts, falsy, strict, scoped) {
    var i = 0;

    if (!scoped && this.options.compat && !this.lastContext) {
      // The depthed query is expected to handle the undefined logic for the root level that
      // is implemented below, so we evaluate that directly in compat mode
      this.push(this.depthedLookup(parts[i++]));
    } else {
      this.pushContext();
    }

    this.resolvePath('context', parts, i, falsy, strict);
  },

  // [lookupBlockParam]
  //
  // On stack, before: ...
  // On stack, after: blockParam[name], ...
  //
  // Looks up the value of `parts` on the given block param and pushes
  // it onto the stack.
  lookupBlockParam: function lookupBlockParam(blockParamId, parts) {
    this.useBlockParams = true;

    this.push(['blockParams[', blockParamId[0], '][', blockParamId[1], ']']);
    this.resolvePath('context', parts, 1);
  },

  // [lookupData]
  //
  // On stack, before: ...
  // On stack, after: data, ...
  //
  // Push the data lookup operator
  lookupData: function lookupData(depth, parts, strict) {
    if (!depth) {
      this.pushStackLiteral('data');
    } else {
      this.pushStackLiteral('container.data(data, ' + depth + ')');
    }

    this.resolvePath('data', parts, 0, true, strict);
  },

  resolvePath: function resolvePath(type, parts, i, falsy, strict) {
    // istanbul ignore next

    var _this = this;

    if (this.options.strict || this.options.assumeObjects) {
      this.push(strictLookup(this.options.strict && strict, this, parts, type));
      return;
    }

    var len = parts.length;
    for (; i < len; i++) {
      /* eslint-disable no-loop-func */
      this.replaceStack(function (current) {
        var lookup = _this.nameLookup(current, parts[i], type);
        // We want to ensure that zero and false are handled properly if the context (falsy flag)
        // needs to have the special handling for these values.
        if (!falsy) {
          return [' != null ? ', lookup, ' : ', current];
        } else {
          // Otherwise we can use generic falsy handling
          return [' && ', lookup];
        }
      });
      /* eslint-enable no-loop-func */
    }
  },

  // [resolvePossibleLambda]
  //
  // On stack, before: value, ...
  // On stack, after: resolved value, ...
  //
  // If the `value` is a lambda, replace it on the stack by
  // the return value of the lambda
  resolvePossibleLambda: function resolvePossibleLambda() {
    this.push([this.aliasable('container.lambda'), '(', this.popStack(), ', ', this.contextName(0), ')']);
  },

  // [pushStringParam]
  //
  // On stack, before: ...
  // On stack, after: string, currentContext, ...
  //
  // This opcode is designed for use in string mode, which
  // provides the string value of a parameter along with its
  // depth rather than resolving it immediately.
  pushStringParam: function pushStringParam(string, type) {
    this.pushContext();
    this.pushString(type);

    // If it's a subexpression, the string result
    // will be pushed after this opcode.
    if (type !== 'SubExpression') {
      if (typeof string === 'string') {
        this.pushString(string);
      } else {
        this.pushStackLiteral(string);
      }
    }
  },

  emptyHash: function emptyHash(omitEmpty) {
    if (this.trackIds) {
      this.push('{}'); // hashIds
    }
    if (this.stringParams) {
      this.push('{}'); // hashContexts
      this.push('{}'); // hashTypes
    }
    this.pushStackLiteral(omitEmpty ? 'undefined' : '{}');
  },
  pushHash: function pushHash() {
    if (this.hash) {
      this.hashes.push(this.hash);
    }
    this.hash = { values: {}, types: [], contexts: [], ids: [] };
  },
  popHash: function popHash() {
    var hash = this.hash;
    this.hash = this.hashes.pop();

    if (this.trackIds) {
      this.push(this.objectLiteral(hash.ids));
    }
    if (this.stringParams) {
      this.push(this.objectLiteral(hash.contexts));
      this.push(this.objectLiteral(hash.types));
    }

    this.push(this.objectLiteral(hash.values));
  },

  // [pushString]
  //
  // On stack, before: ...
  // On stack, after: quotedString(string), ...
  //
  // Push a quoted version of `string` onto the stack
  pushString: function pushString(string) {
    this.pushStackLiteral(this.quotedString(string));
  },

  // [pushLiteral]
  //
  // On stack, before: ...
  // On stack, after: value, ...
  //
  // Pushes a value onto the stack. This operation prevents
  // the compiler from creating a temporary variable to hold
  // it.
  pushLiteral: function pushLiteral(value) {
    this.pushStackLiteral(value);
  },

  // [pushProgram]
  //
  // On stack, before: ...
  // On stack, after: program(guid), ...
  //
  // Push a program expression onto the stack. This takes
  // a compile-time guid and converts it into a runtime-accessible
  // expression.
  pushProgram: function pushProgram(guid) {
    if (guid != null) {
      this.pushStackLiteral(this.programExpression(guid));
    } else {
      this.pushStackLiteral(null);
    }
  },

  // [registerDecorator]
  //
  // On stack, before: hash, program, params..., ...
  // On stack, after: ...
  //
  // Pops off the decorator's parameters, invokes the decorator,
  // and inserts the decorator into the decorators list.
  registerDecorator: function registerDecorator(paramSize, name) {
    var foundDecorator = this.nameLookup('decorators', name, 'decorator'),
        options = this.setupHelperArgs(name, paramSize);

    this.decorators.push(['fn = ', this.decorators.functionCall(foundDecorator, '', ['fn', 'props', 'container', options]), ' || fn;']);
  },

  // [invokeHelper]
  //
  // On stack, before: hash, inverse, program, params..., ...
  // On stack, after: result of helper invocation
  //
  // Pops off the helper's parameters, invokes the helper,
  // and pushes the helper's return value onto the stack.
  //
  // If the helper is not found, `helperMissing` is called.
  invokeHelper: function invokeHelper(paramSize, name, isSimple) {
    var nonHelper = this.popStack(),
        helper = this.setupHelper(paramSize, name);

    var possibleFunctionCalls = [];

    if (isSimple) {
      // direct call to helper
      possibleFunctionCalls.push(helper.name);
    }
    // call a function from the input object
    possibleFunctionCalls.push(nonHelper);
    if (!this.options.strict) {
      possibleFunctionCalls.push(this.aliasable('container.hooks.helperMissing'));
    }

    var functionLookupCode = ['(', this.itemsSeparatedBy(possibleFunctionCalls, '||'), ')'];
    var functionCall = this.source.functionCall(functionLookupCode, 'call', helper.callParams);
    this.push(functionCall);
  },

  itemsSeparatedBy: function itemsSeparatedBy(items, separator) {
    var result = [];
    result.push(items[0]);
    for (var i = 1; i < items.length; i++) {
      result.push(separator, items[i]);
    }
    return result;
  },
  // [invokeKnownHelper]
  //
  // On stack, before: hash, inverse, program, params..., ...
  // On stack, after: result of helper invocation
  //
  // This operation is used when the helper is known to exist,
  // so a `helperMissing` fallback is not required.
  invokeKnownHelper: function invokeKnownHelper(paramSize, name) {
    var helper = this.setupHelper(paramSize, name);
    this.push(this.source.functionCall(helper.name, 'call', helper.callParams));
  },

  // [invokeAmbiguous]
  //
  // On stack, before: hash, inverse, program, params..., ...
  // On stack, after: result of disambiguation
  //
  // This operation is used when an expression like `{{foo}}`
  // is provided, but we don't know at compile-time whether it
  // is a helper or a path.
  //
  // This operation emits more code than the other options,
  // and can be avoided by passing the `knownHelpers` and
  // `knownHelpersOnly` flags at compile-time.
  invokeAmbiguous: function invokeAmbiguous(name, helperCall) {
    this.useRegister('helper');

    var nonHelper = this.popStack();

    this.emptyHash();
    var helper = this.setupHelper(0, name, helperCall);

    var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

    var lookup = ['(', '(helper = ', helperName, ' || ', nonHelper, ')'];
    if (!this.options.strict) {
      lookup[0] = '(helper = ';
      lookup.push(' != null ? helper : ', this.aliasable('container.hooks.helperMissing'));
    }

    this.push(['(', lookup, helper.paramsInit ? ['),(', helper.paramsInit] : [], '),', '(typeof helper === ', this.aliasable('"function"'), ' ? ', this.source.functionCall('helper', 'call', helper.callParams), ' : helper))']);
  },

  // [invokePartial]
  //
  // On stack, before: context, ...
  // On stack after: result of partial invocation
  //
  // This operation pops off a context, invokes a partial with that context,
  // and pushes the result of the invocation back.
  invokePartial: function invokePartial(isDynamic, name, indent) {
    var params = [],
        options = this.setupParams(name, 1, params);

    if (isDynamic) {
      name = this.popStack();
      delete options.name;
    }

    if (indent) {
      options.indent = JSON.stringify(indent);
    }
    options.helpers = 'helpers';
    options.partials = 'partials';
    options.decorators = 'container.decorators';

    if (!isDynamic) {
      params.unshift(this.nameLookup('partials', name, 'partial'));
    } else {
      params.unshift(name);
    }

    if (this.options.compat) {
      options.depths = 'depths';
    }
    options = this.objectLiteral(options);
    params.push(options);

    this.push(this.source.functionCall('container.invokePartial', '', params));
  },

  // [assignToHash]
  //
  // On stack, before: value, ..., hash, ...
  // On stack, after: ..., hash, ...
  //
  // Pops a value off the stack and assigns it to the current hash
  assignToHash: function assignToHash(key) {
    var value = this.popStack(),
        context = undefined,
        type = undefined,
        id = undefined;

    if (this.trackIds) {
      id = this.popStack();
    }
    if (this.stringParams) {
      type = this.popStack();
      context = this.popStack();
    }

    var hash = this.hash;
    if (context) {
      hash.contexts[key] = context;
    }
    if (type) {
      hash.types[key] = type;
    }
    if (id) {
      hash.ids[key] = id;
    }
    hash.values[key] = value;
  },

  pushId: function pushId(type, name, child) {
    if (type === 'BlockParam') {
      this.pushStackLiteral('blockParams[' + name[0] + '].path[' + name[1] + ']' + (child ? ' + ' + JSON.stringify('.' + child) : ''));
    } else if (type === 'PathExpression') {
      this.pushString(name);
    } else if (type === 'SubExpression') {
      this.pushStackLiteral('true');
    } else {
      this.pushStackLiteral('null');
    }
  },

  // HELPERS

  compiler: JavaScriptCompiler,

  compileChildren: function compileChildren(environment, options) {
    var children = environment.children,
        child = undefined,
        compiler = undefined;

    for (var i = 0, l = children.length; i < l; i++) {
      child = children[i];
      compiler = new this.compiler(); // eslint-disable-line new-cap

      var existing = this.matchExistingProgram(child);

      if (existing == null) {
        this.context.programs.push(''); // Placeholder to prevent name conflicts for nested children
        var index = this.context.programs.length;
        child.index = index;
        child.name = 'program' + index;
        this.context.programs[index] = compiler.compile(child, options, this.context, !this.precompile);
        this.context.decorators[index] = compiler.decorators;
        this.context.environments[index] = child;

        this.useDepths = this.useDepths || compiler.useDepths;
        this.useBlockParams = this.useBlockParams || compiler.useBlockParams;
        child.useDepths = this.useDepths;
        child.useBlockParams = this.useBlockParams;
      } else {
        child.index = existing.index;
        child.name = 'program' + existing.index;

        this.useDepths = this.useDepths || existing.useDepths;
        this.useBlockParams = this.useBlockParams || existing.useBlockParams;
      }
    }
  },
  matchExistingProgram: function matchExistingProgram(child) {
    for (var i = 0, len = this.context.environments.length; i < len; i++) {
      var environment = this.context.environments[i];
      if (environment && environment.equals(child)) {
        return environment;
      }
    }
  },

  programExpression: function programExpression(guid) {
    var child = this.environment.children[guid],
        programParams = [child.index, 'data', child.blockParams];

    if (this.useBlockParams || this.useDepths) {
      programParams.push('blockParams');
    }
    if (this.useDepths) {
      programParams.push('depths');
    }

    return 'container.program(' + programParams.join(', ') + ')';
  },

  useRegister: function useRegister(name) {
    if (!this.registers[name]) {
      this.registers[name] = true;
      this.registers.list.push(name);
    }
  },

  push: function push(expr) {
    if (!(expr instanceof Literal)) {
      expr = this.source.wrap(expr);
    }

    this.inlineStack.push(expr);
    return expr;
  },

  pushStackLiteral: function pushStackLiteral(item) {
    this.push(new Literal(item));
  },

  pushSource: function pushSource(source) {
    if (this.pendingContent) {
      this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent), this.pendingLocation));
      this.pendingContent = undefined;
    }

    if (source) {
      this.source.push(source);
    }
  },

  replaceStack: function replaceStack(callback) {
    var prefix = ['('],
        stack = undefined,
        createdStack = undefined,
        usedLiteral = undefined;

    /* istanbul ignore next */
    if (!this.isInline()) {
      throw new _exception2['default']('replaceStack on non-inline');
    }

    // We want to merge the inline statement into the replacement statement via ','
    var top = this.popStack(true);

    if (top instanceof Literal) {
      // Literals do not need to be inlined
      stack = [top.value];
      prefix = ['(', stack];
      usedLiteral = true;
    } else {
      // Get or create the current stack name for use by the inline
      createdStack = true;
      var _name = this.incrStack();

      prefix = ['((', this.push(_name), ' = ', top, ')'];
      stack = this.topStack();
    }

    var item = callback.call(this, stack);

    if (!usedLiteral) {
      this.popStack();
    }
    if (createdStack) {
      this.stackSlot--;
    }
    this.push(prefix.concat(item, ')'));
  },

  incrStack: function incrStack() {
    this.stackSlot++;
    if (this.stackSlot > this.stackVars.length) {
      this.stackVars.push('stack' + this.stackSlot);
    }
    return this.topStackName();
  },
  topStackName: function topStackName() {
    return 'stack' + this.stackSlot;
  },
  flushInline: function flushInline() {
    var inlineStack = this.inlineStack;
    this.inlineStack = [];
    for (var i = 0, len = inlineStack.length; i < len; i++) {
      var entry = inlineStack[i];
      /* istanbul ignore if */
      if (entry instanceof Literal) {
        this.compileStack.push(entry);
      } else {
        var stack = this.incrStack();
        this.pushSource([stack, ' = ', entry, ';']);
        this.compileStack.push(stack);
      }
    }
  },
  isInline: function isInline() {
    return this.inlineStack.length;
  },

  popStack: function popStack(wrapped) {
    var inline = this.isInline(),
        item = (inline ? this.inlineStack : this.compileStack).pop();

    if (!wrapped && item instanceof Literal) {
      return item.value;
    } else {
      if (!inline) {
        /* istanbul ignore next */
        if (!this.stackSlot) {
          throw new _exception2['default']('Invalid stack pop');
        }
        this.stackSlot--;
      }
      return item;
    }
  },

  topStack: function topStack() {
    var stack = this.isInline() ? this.inlineStack : this.compileStack,
        item = stack[stack.length - 1];

    /* istanbul ignore if */
    if (item instanceof Literal) {
      return item.value;
    } else {
      return item;
    }
  },

  contextName: function contextName(context) {
    if (this.useDepths && context) {
      return 'depths[' + context + ']';
    } else {
      return 'depth' + context;
    }
  },

  quotedString: function quotedString(str) {
    return this.source.quotedString(str);
  },

  objectLiteral: function objectLiteral(obj) {
    return this.source.objectLiteral(obj);
  },

  aliasable: function aliasable(name) {
    var ret = this.aliases[name];
    if (ret) {
      ret.referenceCount++;
      return ret;
    }

    ret = this.aliases[name] = this.source.wrap(name);
    ret.aliasable = true;
    ret.referenceCount = 1;

    return ret;
  },

  setupHelper: function setupHelper(paramSize, name, blockHelper) {
    var params = [],
        paramsInit = this.setupHelperArgs(name, paramSize, params, blockHelper);
    var foundHelper = this.nameLookup('helpers', name, 'helper'),
        callContext = this.aliasable(this.contextName(0) + ' != null ? ' + this.contextName(0) + ' : (container.nullContext || {})');

    return {
      params: params,
      paramsInit: paramsInit,
      name: foundHelper,
      callParams: [callContext].concat(params)
    };
  },

  setupParams: function setupParams(helper, paramSize, params) {
    var options = {},
        contexts = [],
        types = [],
        ids = [],
        objectArgs = !params,
        param = undefined;

    if (objectArgs) {
      params = [];
    }

    options.name = this.quotedString(helper);
    options.hash = this.popStack();

    if (this.trackIds) {
      options.hashIds = this.popStack();
    }
    if (this.stringParams) {
      options.hashTypes = this.popStack();
      options.hashContexts = this.popStack();
    }

    var inverse = this.popStack(),
        program = this.popStack();

    // Avoid setting fn and inverse if neither are set. This allows
    // helpers to do a check for `if (options.fn)`
    if (program || inverse) {
      options.fn = program || 'container.noop';
      options.inverse = inverse || 'container.noop';
    }

    // The parameters go on to the stack in order (making sure that they are evaluated in order)
    // so we need to pop them off the stack in reverse order
    var i = paramSize;
    while (i--) {
      param = this.popStack();
      params[i] = param;

      if (this.trackIds) {
        ids[i] = this.popStack();
      }
      if (this.stringParams) {
        types[i] = this.popStack();
        contexts[i] = this.popStack();
      }
    }

    if (objectArgs) {
      options.args = this.source.generateArray(params);
    }

    if (this.trackIds) {
      options.ids = this.source.generateArray(ids);
    }
    if (this.stringParams) {
      options.types = this.source.generateArray(types);
      options.contexts = this.source.generateArray(contexts);
    }

    if (this.options.data) {
      options.data = 'data';
    }
    if (this.useBlockParams) {
      options.blockParams = 'blockParams';
    }
    return options;
  },

  setupHelperArgs: function setupHelperArgs(helper, paramSize, params, useRegister) {
    var options = this.setupParams(helper, paramSize, params);
    options.loc = JSON.stringify(this.source.currentLocation);
    options = this.objectLiteral(options);
    if (useRegister) {
      this.useRegister('options');
      params.push('options');
      return ['options=', options];
    } else if (params) {
      params.push(options);
      return '';
    } else {
      return options;
    }
  }
};

(function () {
  var reservedWords = ('break else new var' + ' case finally return void' + ' catch for switch while' + ' continue function this with' + ' default if throw' + ' delete in try' + ' do instanceof typeof' + ' abstract enum int short' + ' boolean export interface static' + ' byte extends long super' + ' char final native synchronized' + ' class float package throws' + ' const goto private transient' + ' debugger implements protected volatile' + ' double import public let yield await' + ' null true false').split(' ');

  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

  for (var i = 0, l = reservedWords.length; i < l; i++) {
    compilerWords[reservedWords[i]] = true;
  }
})();

JavaScriptCompiler.isValidJavaScriptVariableName = function (name) {
  return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
};

function strictLookup(requireTerminal, compiler, parts, type) {
  var stack = compiler.popStack(),
      i = 0,
      len = parts.length;
  if (requireTerminal) {
    len--;
  }

  for (; i < len; i++) {
    stack = compiler.nameLookup(stack, parts[i], type);
  }

  if (requireTerminal) {
    return [compiler.aliasable('container.strict'), '(', stack, ', ', compiler.quotedString(parts[i]), ', ', JSON.stringify(compiler.source.currentLocation), ' )'];
  } else {
    return stack;
  }
}

exports['default'] = JavaScriptCompiler;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi9oYW5kbGViYXJzL2NvbXBpbGVyL2phdmFzY3JpcHQtY29tcGlsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztvQkFBb0QsU0FBUzs7eUJBQ3ZDLGNBQWM7Ozs7cUJBQ2QsVUFBVTs7dUJBQ1osWUFBWTs7OztBQUVoQyxTQUFTLE9BQU8sQ0FBQyxLQUFLLEVBQUU7QUFDdEIsTUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7Q0FDcEI7O0FBRUQsU0FBUyxrQkFBa0IsR0FBRyxFQUFFOztBQUVoQyxrQkFBa0IsQ0FBQyxTQUFTLEdBQUc7OztBQUc3QixZQUFVLEVBQUUsb0JBQVMsTUFBTSxFQUFFLElBQUksY0FBYTtBQUM1QyxRQUFNLFlBQVksR0FBRyxDQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsZ0NBQWdDLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7O0FBRTlHLFFBQUksSUFBSSxLQUFLLGFBQWEsRUFBRTtBQUMxQixhQUFPLENBQUMsR0FBRyxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsYUFBYSxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUM7S0FDbkU7QUFDRCxXQUFPLGFBQWEsRUFBRSxDQUFDOztBQUV2QixhQUFTLGFBQWEsR0FBRztBQUN2QixVQUFJLGtCQUFrQixDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzFELGVBQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO09BQzVCLE1BQU07QUFDTCxlQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO09BQ2pEO0tBQ0Y7R0FDRjtBQUNELGVBQWEsRUFBRSx1QkFBUyxJQUFJLEVBQUU7QUFDNUIsV0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsRUFB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LENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDcEQ7O0FBRUQsTUFBSSxlQUFlLEVBQUU7QUFDbkIsV0FBTyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDakssTUFBTTtBQUNMLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7Q0FDRjs7cUJBRWMsa0JBQWtCIiwiZmlsZSI6ImphdmFzY3JpcHQtY29tcGlsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDT01QSUxFUl9SRVZJU0lPTiwgUkVWSVNJT05fQ0hBTkdFUyB9IGZyb20gJy4uL2Jhc2UnO1xuaW1wb3J0IEV4Y2VwdGlvbiBmcm9tICcuLi9leGNlcHRpb24nO1xuaW1wb3J0IHtpc0FycmF5fSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgQ29kZUdlbiBmcm9tICcuL2NvZGUtZ2VuJztcblxuZnVuY3Rpb24gTGl0ZXJhbCh2YWx1ZSkge1xuICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIEphdmFTY3JpcHRDb21waWxlcigpIHt9XG5cbkphdmFTY3JpcHRDb21waWxlci5wcm90b3R5cGUgPSB7XG4gIC8vIFBVQkxJQyBBUEk6IFlvdSBjYW4gb3ZlcnJpZGUgdGhlc2UgbWV0aG9kcyBpbiBhIHN1YmNsYXNzIHRvIHByb3ZpZGVcbiAgLy8gYWx0ZXJuYXRpdmUgY29tcGlsZWQgZm9ybXMgZm9yIG5hbWUgbG9va3VwIGFuZCBidWZmZXJpbmcgc2VtYW50aWNzXG4gIG5hbWVMb29rdXA6IGZ1bmN0aW9uKHBhcmVudCwgbmFtZS8qICwgdHlwZSovKSB7XG4gICAgY29uc3QgaXNFbnVtZXJhYmxlID0gWyB0aGlzLmFsaWFzYWJsZSgnY29udGFpbmVyLnByb3BlcnR5SXNFbnVtZXJhYmxlJyksICcuY2FsbCgnLCBwYXJlbnQsICcsXCJjb25zdHJ1Y3RvclwiKSddO1xuXG4gICAgaWYgKG5hbWUgPT09ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgIHJldHVybiBbJygnLCBpc0VudW1lcmFibGUsICc/JywgX2FjdHVhbExvb2t1cCgpLCAnIDogdW5kZWZpbmVkKSddO1xuICAgIH1cbiAgICByZXR1cm4gX2FjdHVhbExvb2t1cCgpO1xuXG4gICAgZnVuY3Rpb24gX2FjdHVhbExvb2t1cCgpIHtcbiAgICAgIGlmIChKYXZhU2NyaXB0Q29tcGlsZXIuaXNWYWxpZEphdmFTY3JpcHRWYXJpYWJsZU5hbWUobmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIFtwYXJlbnQsICcuJywgbmFtZV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gW3BhcmVudCwgJ1snLCBKU09OLnN0cmluZ2lmeShuYW1lKSwgJ10nXTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGRlcHRoZWRMb29rdXA6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gW3RoaXMuYWxpYXNhYmxlKCdjb250YWluZXIubG9va3VwJyksICcoZGVwdGhzLCBcIicsIG5hbWUsICdcIiknXTtcbiAgfSxcblxuICBjb21waWxlckluZm86IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHJldmlzaW9uID0gQ09NUElMRVJfUkVWSVNJT04sXG4gICAgICAgICAgdmVyc2lvbnMgPSBSRVZJU0lPTl9DSEFOR0VTW3JldmlzaW9uXTtcbiAgICByZXR1cm4gW3JldmlzaW9uLCB2ZXJzaW9uc107XG4gIH0sXG5cbiAgYXBwZW5kVG9CdWZmZXI6IGZ1bmN0aW9uKHNvdXJjZSwgbG9jYXRpb24sIGV4cGxpY2l0KSB7XG4gICAgLy8gRm9yY2UgYSBzb3VyY2UgYXMgdGhpcyBzaW1wbGlmaWVzIHRoZSBtZXJnZSBsb2dpYy5cbiAgICBpZiAoIWlzQXJyYXkoc291cmNlKSkge1xuICAgICAgc291cmNlID0gW3NvdXJjZV07XG4gICAgfVxuICAgIHNvdXJjZSA9IHRoaXMuc291cmNlLndyYXAoc291cmNlLCBsb2NhdGlvbik7XG5cbiAgICBpZiAodGhpcy5lbnZpcm9ubWVudC5pc1NpbXBsZSkge1xuICAgICAgcmV0dXJuIFsncmV0dXJuICcsIHNvdXJjZSwgJzsnXTtcbiAgICB9IGVsc2UgaWYgKGV4cGxpY2l0KSB7XG4gICAgICAvLyBUaGlzIGlzIGEgY2FzZSB3aGVyZSB0aGUgYnVmZmVyIG9wZXJhdGlvbiBvY2N1cnMgYXMgYSBjaGlsZCBvZiBhbm90aGVyXG4gICAgICAvLyBjb25zdHJ1Y3QsIGdlbmVyYWxseSBicmFjZXMuIFdlIGhhdmUgdG8gZXhwbGljaXRseSBvdXRwdXQgdGhlc2UgYnVmZmVyXG4gICAgICAvLyBvcGVyYXRpb25zIHRvIGVuc3VyZSB0aGF0IHRoZSBlbWl0dGVkIGNvZGUgZ29lcyBpbiB0aGUgY29ycmVjdCBsb2NhdGlvbi5cbiAgICAgIHJldHVybiBbJ2J1ZmZlciArPSAnLCBzb3VyY2UsICc7J107XG4gICAgfSBlbHNlIHtcbiAgICAgIHNvdXJjZS5hcHBlbmRUb0J1ZmZlciA9IHRydWU7XG4gICAgICByZXR1cm4gc291cmNlO1xuICAgIH1cbiAgfSxcblxuICBpbml0aWFsaXplQnVmZmVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5xdW90ZWRTdHJpbmcoJycpO1xuICB9LFxuICAvLyBFTkQgUFVCTElDIEFQSVxuXG4gIGNvbXBpbGU6IGZ1bmN0aW9uKGVudmlyb25tZW50LCBvcHRpb25zLCBjb250ZXh0LCBhc09iamVjdCkge1xuICAgIHRoaXMuZW52aXJvbm1lbnQgPSBlbnZpcm9ubWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuc3RyaW5nUGFyYW1zID0gdGhpcy5vcHRpb25zLnN0cmluZ1BhcmFtcztcbiAgICB0aGlzLnRyYWNrSWRzID0gdGhpcy5vcHRpb25zLnRyYWNrSWRzO1xuICAgIHRoaXMucHJlY29tcGlsZSA9ICFhc09iamVjdDtcblxuICAgIHRoaXMubmFtZSA9IHRoaXMuZW52aXJvbm1lbnQubmFtZTtcbiAgICB0aGlzLmlzQ2hpbGQgPSAhIWNvbnRleHQ7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dCB8fCB7XG4gICAgICBkZWNvcmF0b3JzOiBbXSxcbiAgICAgIHByb2dyYW1zOiBbXSxcbiAgICAgIGVudmlyb25tZW50czogW11cbiAgICB9O1xuXG4gICAgdGhpcy5wcmVhbWJsZSgpO1xuXG4gICAgdGhpcy5zdGFja1Nsb3QgPSAwO1xuICAgIHRoaXMuc3RhY2tWYXJzID0gW107XG4gICAgdGhpcy5hbGlhc2VzID0ge307XG4gICAgdGhpcy5yZWdpc3RlcnMgPSB7IGxpc3Q6IFtdIH07XG4gICAgdGhpcy5oYXNoZXMgPSBbXTtcbiAgICB0aGlzLmNvbXBpbGVTdGFjayA9IFtdO1xuICAgIHRoaXMuaW5saW5lU3RhY2sgPSBbXTtcbiAgICB0aGlzLmJsb2NrUGFyYW1zID0gW107XG5cbiAgICB0aGlzLmNvbXBpbGVDaGlsZHJlbihlbnZpcm9ubWVudCwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLnVzZURlcHRocyA9IHRoaXMudXNlRGVwdGhzIHx8IGVudmlyb25tZW50LnVzZURlcHRocyB8fCBlbnZpcm9ubWVudC51c2VEZWNvcmF0b3JzIHx8IHRoaXMub3B0aW9ucy5jb21wYXQ7XG4gICAgdGhpcy51c2VCbG9ja1BhcmFtcyA9IHRoaXMudXNlQmxvY2tQYXJhbXMgfHwgZW52aXJvbm1lbnQudXNlQmxvY2tQYXJhbXM7XG5cbiAgICBsZXQgb3Bjb2RlcyA9IGVudmlyb25tZW50Lm9wY29kZXMsXG4gICAgICAgIG9wY29kZSxcbiAgICAgICAgZmlyc3RMb2MsXG4gICAgICAgIGksXG4gICAgICAgIGw7XG5cbiAgICBmb3IgKGkgPSAwLCBsID0gb3Bjb2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIG9wY29kZSA9IG9wY29kZXNbaV07XG5cbiAgICAgIHRoaXMuc291cmNlLmN1cnJlbnRMb2NhdGlvbiA9IG9wY29kZS5sb2M7XG4gICAgICBmaXJzdExvYyA9IGZpcnN0TG9jIHx8IG9wY29kZS5sb2M7XG4gICAgICB0aGlzW29wY29kZS5vcGNvZGVdLmFwcGx5KHRoaXMsIG9wY29kZS5hcmdzKTtcbiAgICB9XG5cbiAgICAvLyBGbHVzaCBhbnkgdHJhaWxpbmcgY29udGVudCB0aGF0IG1pZ2h0IGJlIHBlbmRpbmcuXG4gICAgdGhpcy5zb3VyY2UuY3VycmVudExvY2F0aW9uID0gZmlyc3RMb2M7XG4gICAgdGhpcy5wdXNoU291cmNlKCcnKTtcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKHRoaXMuc3RhY2tTbG90IHx8IHRoaXMuaW5saW5lU3RhY2subGVuZ3RoIHx8IHRoaXMuY29tcGlsZVN0YWNrLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignQ29tcGlsZSBjb21wbGV0ZWQgd2l0aCBjb250ZW50IGxlZnQgb24gc3RhY2snKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuZGVjb3JhdG9ycy5pc0VtcHR5KCkpIHtcbiAgICAgIHRoaXMudXNlRGVjb3JhdG9ycyA9IHRydWU7XG5cbiAgICAgIHRoaXMuZGVjb3JhdG9ycy5wcmVwZW5kKCd2YXIgZGVjb3JhdG9ycyA9IGNvbnRhaW5lci5kZWNvcmF0b3JzO1xcbicpO1xuICAgICAgdGhpcy5kZWNvcmF0b3JzLnB1c2goJ3JldHVybiBmbjsnKTtcblxuICAgICAgaWYgKGFzT2JqZWN0KSB7XG4gICAgICAgIHRoaXMuZGVjb3JhdG9ycyA9IEZ1bmN0aW9uLmFwcGx5KHRoaXMsIFsnZm4nLCAncHJvcHMnLCAnY29udGFpbmVyJywgJ2RlcHRoMCcsICdkYXRhJywgJ2Jsb2NrUGFyYW1zJywgJ2RlcHRocycsIHRoaXMuZGVjb3JhdG9ycy5tZXJnZSgpXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRlY29yYXRvcnMucHJlcGVuZCgnZnVuY3Rpb24oZm4sIHByb3BzLCBjb250YWluZXIsIGRlcHRoMCwgZGF0YSwgYmxvY2tQYXJhbXMsIGRlcHRocykge1xcbicpO1xuICAgICAgICB0aGlzLmRlY29yYXRvcnMucHVzaCgnfVxcbicpO1xuICAgICAgICB0aGlzLmRlY29yYXRvcnMgPSB0aGlzLmRlY29yYXRvcnMubWVyZ2UoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZWNvcmF0b3JzID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGxldCBmbiA9IHRoaXMuY3JlYXRlRnVuY3Rpb25Db250ZXh0KGFzT2JqZWN0KTtcbiAgICBpZiAoIXRoaXMuaXNDaGlsZCkge1xuICAgICAgbGV0IHJldCA9IHtcbiAgICAgICAgY29tcGlsZXI6IHRoaXMuY29tcGlsZXJJbmZvKCksXG4gICAgICAgIG1haW46IGZuXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5kZWNvcmF0b3JzKSB7XG4gICAgICAgIHJldC5tYWluX2QgPSB0aGlzLmRlY29yYXRvcnM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIHJldC51c2VEZWNvcmF0b3JzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IHtwcm9ncmFtcywgZGVjb3JhdG9yc30gPSB0aGlzLmNvbnRleHQ7XG4gICAgICBmb3IgKGkgPSAwLCBsID0gcHJvZ3JhbXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9ncmFtc1tpXSkge1xuICAgICAgICAgIHJldFtpXSA9IHByb2dyYW1zW2ldO1xuICAgICAgICAgIGlmIChkZWNvcmF0b3JzW2ldKSB7XG4gICAgICAgICAgICByZXRbaSArICdfZCddID0gZGVjb3JhdG9yc1tpXTtcbiAgICAgICAgICAgIHJldC51c2VEZWNvcmF0b3JzID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuZW52aXJvbm1lbnQudXNlUGFydGlhbCkge1xuICAgICAgICByZXQudXNlUGFydGlhbCA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmRhdGEpIHtcbiAgICAgICAgcmV0LnVzZURhdGEgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMudXNlRGVwdGhzKSB7XG4gICAgICAgIHJldC51c2VEZXB0aHMgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMudXNlQmxvY2tQYXJhbXMpIHtcbiAgICAgICAgcmV0LnVzZUJsb2NrUGFyYW1zID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29tcGF0KSB7XG4gICAgICAgIHJldC5jb21wYXQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWFzT2JqZWN0KSB7XG4gICAgICAgIHJldC5jb21waWxlciA9IEpTT04uc3RyaW5naWZ5KHJldC5jb21waWxlcik7XG5cbiAgICAgICAgdGhpcy5zb3VyY2UuY3VycmVudExvY2F0aW9uID0ge3N0YXJ0OiB7bGluZTogMSwgY29sdW1uOiAwfX07XG4gICAgICAgIHJldCA9IHRoaXMub2JqZWN0TGl0ZXJhbChyZXQpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLnNyY05hbWUpIHtcbiAgICAgICAgICByZXQgPSByZXQudG9TdHJpbmdXaXRoU291cmNlTWFwKHtmaWxlOiBvcHRpb25zLmRlc3ROYW1lfSk7XG4gICAgICAgICAgcmV0Lm1hcCA9IHJldC5tYXAgJiYgcmV0Lm1hcC50b1N0cmluZygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldCA9IHJldC50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXQuY29tcGlsZXJPcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZm47XG4gICAgfVxuICB9LFxuXG4gIHByZWFtYmxlOiBmdW5jdGlvbigpIHtcbiAgICAvLyB0cmFjayB0aGUgbGFzdCBjb250ZXh0IHB1c2hlZCBpbnRvIHBsYWNlIHRvIGFsbG93IHNraXBwaW5nIHRoZVxuICAgIC8vIGdldENvbnRleHQgb3Bjb2RlIHdoZW4gaXQgd291bGQgYmUgYSBub29wXG4gICAgdGhpcy5sYXN0Q29udGV4dCA9IDA7XG4gICAgdGhpcy5zb3VyY2UgPSBuZXcgQ29kZUdlbih0aGlzLm9wdGlvbnMuc3JjTmFtZSk7XG4gICAgdGhpcy5kZWNvcmF0b3JzID0gbmV3IENvZGVHZW4odGhpcy5vcHRpb25zLnNyY05hbWUpO1xuICB9LFxuXG4gIGNyZWF0ZUZ1bmN0aW9uQ29udGV4dDogZnVuY3Rpb24oYXNPYmplY3QpIHtcbiAgICBsZXQgdmFyRGVjbGFyYXRpb25zID0gJyc7XG5cbiAgICBsZXQgbG9jYWxzID0gdGhpcy5zdGFja1ZhcnMuY29uY2F0KHRoaXMucmVnaXN0ZXJzLmxpc3QpO1xuICAgIGlmIChsb2NhbHMubGVuZ3RoID4gMCkge1xuICAgICAgdmFyRGVjbGFyYXRpb25zICs9ICcsICcgKyBsb2NhbHMuam9pbignLCAnKTtcbiAgICB9XG5cbiAgICAvLyBHZW5lcmF0ZSBtaW5pbWl6ZXIgYWxpYXMgbWFwcGluZ3NcbiAgICAvL1xuICAgIC8vIFdoZW4gdXNpbmcgdHJ1ZSBTb3VyY2VOb2RlcywgdGhpcyB3aWxsIHVwZGF0ZSBhbGwgcmVmZXJlbmNlcyB0byB0aGUgZ2l2ZW4gYWxpYXNcbiAgICAvLyBhcyB0aGUgc291cmNlIG5vZGVzIGFyZSByZXVzZWQgaW4gc2l0dS4gRm9yIHRoZSBub24tc291cmNlIG5vZGUgY29tcGlsYXRpb24gbW9kZSxcbiAgICAvLyBhbGlhc2VzIHdpbGwgbm90IGJlIHVzZWQsIGJ1dCB0aGlzIGNhc2UgaXMgYWxyZWFkeSBiZWluZyBydW4gb24gdGhlIGNsaWVudCBhbmRcbiAgICAvLyB3ZSBhcmVuJ3QgY29uY2VybiBhYm91dCBtaW5pbWl6aW5nIHRoZSB0ZW1wbGF0ZSBzaXplLlxuICAgIGxldCBhbGlhc0NvdW50ID0gMDtcbiAgICBmb3IgKGxldCBhbGlhcyBpbiB0aGlzLmFsaWFzZXMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBndWFyZC1mb3ItaW5cbiAgICAgIGxldCBub2RlID0gdGhpcy5hbGlhc2VzW2FsaWFzXTtcbiAgICAgIGlmICh0aGlzLmFsaWFzZXMuaGFzT3duUHJvcGVydHkoYWxpYXMpICYmIG5vZGUuY2hpbGRyZW4gJiYgbm9kZS5yZWZlcmVuY2VDb3VudCA+IDEpIHtcbiAgICAgICAgdmFyRGVjbGFyYXRpb25zICs9ICcsIGFsaWFzJyArICgrK2FsaWFzQ291bnQpICsgJz0nICsgYWxpYXM7XG4gICAgICAgIG5vZGUuY2hpbGRyZW5bMF0gPSAnYWxpYXMnICsgYWxpYXNDb3VudDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcGFyYW1zID0gWydjb250YWluZXInLCAnZGVwdGgwJywgJ2hlbHBlcnMnLCAncGFydGlhbHMnLCAnZGF0YSddO1xuXG4gICAgaWYgKHRoaXMudXNlQmxvY2tQYXJhbXMgfHwgdGhpcy51c2VEZXB0aHMpIHtcbiAgICAgIHBhcmFtcy5wdXNoKCdibG9ja1BhcmFtcycpO1xuICAgIH1cbiAgICBpZiAodGhpcy51c2VEZXB0aHMpIHtcbiAgICAgIHBhcmFtcy5wdXNoKCdkZXB0aHMnKTtcbiAgICB9XG5cbiAgICAvLyBQZXJmb3JtIGEgc2Vjb25kIHBhc3Mgb3ZlciB0aGUgb3V0cHV0IHRvIG1lcmdlIGNvbnRlbnQgd2hlbiBwb3NzaWJsZVxuICAgIGxldCBzb3VyY2UgPSB0aGlzLm1lcmdlU291cmNlKHZhckRlY2xhcmF0aW9ucyk7XG5cbiAgICBpZiAoYXNPYmplY3QpIHtcbiAgICAgIHBhcmFtcy5wdXNoKHNvdXJjZSk7XG5cbiAgICAgIHJldHVybiBGdW5jdGlvbi5hcHBseSh0aGlzLCBwYXJhbXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5zb3VyY2Uud3JhcChbJ2Z1bmN0aW9uKCcsIHBhcmFtcy5qb2luKCcsJyksICcpIHtcXG4gICcsIHNvdXJjZSwgJ30nXSk7XG4gICAgfVxuICB9LFxuICBtZXJnZVNvdXJjZTogZnVuY3Rpb24odmFyRGVjbGFyYXRpb25zKSB7XG4gICAgbGV0IGlzU2ltcGxlID0gdGhpcy5lbnZpcm9ubWVudC5pc1NpbXBsZSxcbiAgICAgICAgYXBwZW5kT25seSA9ICF0aGlzLmZvcmNlQnVmZmVyLFxuICAgICAgICBhcHBlbmRGaXJzdCxcblxuICAgICAgICBzb3VyY2VTZWVuLFxuICAgICAgICBidWZmZXJTdGFydCxcbiAgICAgICAgYnVmZmVyRW5kO1xuICAgIHRoaXMuc291cmNlLmVhY2goKGxpbmUpID0+IHtcbiAgICAgIGlmIChsaW5lLmFwcGVuZFRvQnVmZmVyKSB7XG4gICAgICAgIGlmIChidWZmZXJTdGFydCkge1xuICAgICAgICAgIGxpbmUucHJlcGVuZCgnICArICcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJ1ZmZlclN0YXJ0ID0gbGluZTtcbiAgICAgICAgfVxuICAgICAgICBidWZmZXJFbmQgPSBsaW5lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGJ1ZmZlclN0YXJ0KSB7XG4gICAgICAgICAgaWYgKCFzb3VyY2VTZWVuKSB7XG4gICAgICAgICAgICBhcHBlbmRGaXJzdCA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ1ZmZlclN0YXJ0LnByZXBlbmQoJ2J1ZmZlciArPSAnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnVmZmVyRW5kLmFkZCgnOycpO1xuICAgICAgICAgIGJ1ZmZlclN0YXJ0ID0gYnVmZmVyRW5kID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgc291cmNlU2VlbiA9IHRydWU7XG4gICAgICAgIGlmICghaXNTaW1wbGUpIHtcbiAgICAgICAgICBhcHBlbmRPbmx5ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgaWYgKGFwcGVuZE9ubHkpIHtcbiAgICAgIGlmIChidWZmZXJTdGFydCkge1xuICAgICAgICBidWZmZXJTdGFydC5wcmVwZW5kKCdyZXR1cm4gJyk7XG4gICAgICAgIGJ1ZmZlckVuZC5hZGQoJzsnKTtcbiAgICAgIH0gZWxzZSBpZiAoIXNvdXJjZVNlZW4pIHtcbiAgICAgICAgdGhpcy5zb3VyY2UucHVzaCgncmV0dXJuIFwiXCI7Jyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhckRlY2xhcmF0aW9ucyArPSAnLCBidWZmZXIgPSAnICsgKGFwcGVuZEZpcnN0ID8gJycgOiB0aGlzLmluaXRpYWxpemVCdWZmZXIoKSk7XG5cbiAgICAgIGlmIChidWZmZXJTdGFydCkge1xuICAgICAgICBidWZmZXJTdGFydC5wcmVwZW5kKCdyZXR1cm4gYnVmZmVyICsgJyk7XG4gICAgICAgIGJ1ZmZlckVuZC5hZGQoJzsnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc291cmNlLnB1c2goJ3JldHVybiBidWZmZXI7Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHZhckRlY2xhcmF0aW9ucykge1xuICAgICAgdGhpcy5zb3VyY2UucHJlcGVuZCgndmFyICcgKyB2YXJEZWNsYXJhdGlvbnMuc3Vic3RyaW5nKDIpICsgKGFwcGVuZEZpcnN0ID8gJycgOiAnO1xcbicpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zb3VyY2UubWVyZ2UoKTtcbiAgfSxcblxuICAvLyBbYmxvY2tWYWx1ZV1cbiAgLy9cbiAgLy8gT24gc3RhY2ssIGJlZm9yZTogaGFzaCwgaW52ZXJzZSwgcHJvZ3JhbSwgdmFsdWVcbiAgLy8gT24gc3RhY2ssIGFmdGVyOiByZXR1cm4gdmFsdWUgb2YgYmxvY2tIZWxwZXJNaXNzaW5nXG4gIC8vXG4gIC8vIFRoZSBwdXJwb3NlIG9mIHRoaXMgb3Bjb2RlIGlzIHRvIHRha2UgYSBibG9jayBvZiB0aGUgZm9ybVxuICAvLyBge3sjdGhpcy5mb299fS4uLnt7L3RoaXMuZm9vfX1gLCByZXNvbHZlIHRoZSB2YWx1ZSBvZiBgZm9vYCwgYW5kXG4gIC8vIHJlcGxhY2UgaXQgb24gdGhlIHN0YWNrIHdpdGggdGhlIHJlc3VsdCBvZiBwcm9wZXJseVxuICAvLyBpbnZva2luZyBibG9ja0hlbHBlck1pc3NpbmcuXG4gIGJsb2NrVmFsdWU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBsZXQgYmxvY2tIZWxwZXJNaXNzaW5nID0gdGhpcy5hbGlhc2FibGUoJ2NvbnRhaW5lci5ob29rcy5ibG9ja0hlbHBlck1pc3NpbmcnKSxcbiAgICAgICAgcGFyYW1zID0gW3RoaXMuY29udGV4dE5hbWUoMCldO1xuICAgIHRoaXMuc2V0dXBIZWxwZXJBcmdzKG5hbWUsIDAsIHBhcmFtcyk7XG5cbiAgICBsZXQgYmxvY2tOYW1lID0gdGhpcy5wb3BTdGFjaygpO1xuICAgIHBhcmFtcy5zcGxpY2UoMSwgMCwgYmxvY2tOYW1lKTtcblxuICAgIHRoaXMucHVzaCh0aGlzLnNvdXJjZS5mdW5jdGlvbkNhbGwoYmxvY2tIZWxwZXJNaXNzaW5nLCAnY2FsbCcsIHBhcmFtcykpO1xuICB9LFxuXG4gIC8vIFthbWJpZ3VvdXNCbG9ja1ZhbHVlXVxuICAvL1xuICAvLyBPbiBzdGFjaywgYmVmb3JlOiBoYXNoLCBpbnZlcnNlLCBwcm9ncmFtLCB2YWx1ZVxuICAvLyBDb21waWxlciB2YWx1ZSwgYmVmb3JlOiBsYXN0SGVscGVyPXZhbHVlIG9mIGxhc3QgZm91bmQgaGVscGVyLCBpZiBhbnlcbiAgLy8gT24gc3RhY2ssIGFmdGVyLCBpZiBubyBsYXN0SGVscGVyOiBzYW1lIGFzIFtibG9ja1ZhbHVlXVxuICAvLyBPbiBzdGFjaywgYWZ0ZXIsIGlmIGxhc3RIZWxwZXI6IHZhbHVlXG4gIGFtYmlndW91c0Jsb2NrVmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgIC8vIFdlJ3JlIGJlaW5nIGEgYml0IGNoZWVreSBhbmQgcmV1c2luZyB0aGUgb3B0aW9ucyB2YWx1ZSBmcm9tIHRoZSBwcmlvciBleGVjXG4gICAgbGV0IGJsb2NrSGVscGVyTWlzc2luZyA9IHRoaXMuYWxpYXNhYmxlKCdjb250YWluZXIuaG9va3MuYmxvY2tIZWxwZXJNaXNzaW5nJyksXG4gICAgICAgIHBhcmFtcyA9IFt0aGlzLmNvbnRleHROYW1lKDApXTtcbiAgICB0aGlzLnNldHVwSGVscGVyQXJncygnJywgMCwgcGFyYW1zLCB0cnVlKTtcblxuICAgIHRoaXMuZmx1c2hJbmxpbmUoKTtcblxuICAgIGxldCBjdXJyZW50ID0gdGhpcy50b3BTdGFjaygpO1xuICAgIHBhcmFtcy5zcGxpY2UoMSwgMCwgY3VycmVudCk7XG5cbiAgICB0aGlzLnB1c2hTb3VyY2UoW1xuICAgICAgJ2lmICghJywgdGhpcy5sYXN0SGVscGVyLCAnKSB7ICcsXG4gICAgICBjdXJyZW50LCAnID0gJywgdGhpcy5zb3VyY2UuZnVuY3Rpb25DYWxsKGJsb2NrSGVscGVyTWlzc2luZywgJ2NhbGwnLCBwYXJhbXMpLFxuICAgICAgJ30nXSk7XG4gIH0sXG5cbiAgLy8gW2FwcGVuZENvbnRlbnRdXG4gIC8vXG4gIC8vIE9uIHN0YWNrLCBiZWZvcmU6IC4uLlxuICAvLyBPbiBzdGFjaywgYWZ0ZXI6IC4uLlxuICAvL1xuICAvLyBBcHBlbmRzIHRoZSBzdHJpbmcgdmFsdWUgb2YgYGNvbnRlbnRgIHRvIHRoZSBjdXJyZW50IGJ1ZmZlclxuICBhcHBlbmRDb250ZW50OiBmdW5jdGlvbihjb250ZW50KSB7XG4gICAgaWYgKHRoaXMucGVuZGluZ0NvbnRlbnQpIHtcbiAgICAgIGNvbnRlbnQgPSB0aGlzLnBlbmRpbmdDb250ZW50ICsgY29udGVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wZW5kaW5nTG9jYXRpb24gPSB0aGlzLnNvdXJjZS5jdXJyZW50TG9jYXRpb247XG4gICAgfVxuXG4gICAgdGhpcy5wZW5kaW5nQ29udGVudCA9IGNvbnRlbnQ7XG4gIH0sXG5cbiAgLy8gW2FwcGVuZF1cbiAgLy9cbiAgLy8gT24gc3RhY2ssIGJlZm9yZTogdmFsdWUsIC4uLlxuICAvLyBPbiBzdGFjaywgYWZ0ZXI6IC4uLlxuICAvL1xuICAvLyBDb2VyY2VzIGB2YWx1ZWAgdG8gYSBTdHJpbmcgYW5kIGFwcGVuZHMgaXQgdG8gdGhlIGN1cnJlbnQgYnVmZmVyLlxuICAvL1xuICAvLyBJZiBgdmFsdWVgIGlzIHRydXRoeSwgb3IgMCwgaXQgaXMgY29lcmNlZCBpbnRvIGEgc3RyaW5nIGFuZCBhcHBlbmRlZFxuICAvLyBPdGhlcndpc2UsIHRoZSBlbXB0eSBzdHJpbmcgaXMgYXBwZW5kZWRcbiAgYXBwZW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5pc0lubGluZSgpKSB7XG4gICAgICB0aGlzLnJlcGxhY2VTdGFjaygoY3VycmVudCkgPT4gWycgIT0gbnVsbCA/ICcsIGN1cnJlbnQsICcgOiBcIlwiJ10pO1xuXG4gICAgICB0aGlzLnB1c2hTb3VyY2UodGhpcy5hcHBlbmRUb0J1ZmZlcih0aGlzLnBvcFN0YWNrKCkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGxvY2FsID0gdGhpcy5wb3BTdGFjaygpO1xuICAgICAgdGhpcy5wdXNoU291cmNlKFsnaWYgKCcsIGxvY2FsLCAnICE9IG51bGwpIHsgJywgdGhpcy5hcHBlbmRUb0J1ZmZlcihsb2NhbCwgdW5kZWZpbmVkLCB0cnVlKSwgJyB9J10pO1xuICAgICAgaWYgKHRoaXMuZW52aXJvbm1lbnQuaXNTaW1wbGUpIHtcbiAgICAgICAgdGhpcy5wdXNoU291cmNlKFsnZWxzZSB7ICcsIHRoaXMuYXBwZW5kVG9CdWZmZXIoXCInJ1wiLCB1bmRlZmluZWQsIHRydWUpLCAnIH0nXSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIFthcHBlbmRFc2NhcGVkXVxuICAvL1xuICAvLyBPbiBzdGFjaywgYmVmb3JlOiB2YWx1ZSwgLi4uXG4gIC8vIE9uIHN0YWNrLCBhZnRlcjogLi4uXG4gIC8vXG4gIC8vIEVzY2FwZSBgdmFsdWVgIGFuZCBhcHBlbmQgaXQgdG8gdGhlIGJ1ZmZlclxuICBhcHBlbmRFc2NhcGVkOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnB1c2hTb3VyY2UodGhpcy5hcHBlbmRUb0J1ZmZlcihcbiAgICAgICAgW3RoaXMuYWxpYXNhYmxlKCdjb250YWluZXIuZXNjYXBlRXhwcmVzc2lvbicpLCAnKCcsIHRoaXMucG9wU3RhY2soKSwgJyknXSkpO1xuICB9LFxuXG4gIC8vIFtnZXRDb250ZXh0XVxuICAvL1xuICAvLyBPbiBzdGFjaywgYmVmb3JlOiAuLi5cbiAgLy8gT24gc3RhY2ssIGFmdGVyOiAuLi5cbiAgLy8gQ29tcGlsZXIgdmFsdWUsIGFmdGVyOiBsYXN0Q29udGV4dD1kZXB0aFxuICAvL1xuICAvLyBTZXQgdGhlIHZhbHVlIG9mIHRoZSBgbGFzdENvbnRleHRgIGNvbXBpbGVyIHZhbHVlIHRvIHRoZSBkZXB0aFxuICBnZXRDb250ZXh0OiBmdW5jdGlvbihkZXB0aCkge1xuICAgIHRoaXMubGFzdENvbnRleHQgPSBkZXB0aDtcbiAgfSxcblxuICAvLyBbcHVzaENvbnRleHRdXG4gIC8vXG4gIC8vIE9uIHN0YWNrLCBiZWZvcmU6IC4uLlxuICAvLyBPbiBzdGFjaywgYWZ0ZXI6IGN1cnJlbnRDb250ZXh0LCAuLi5cbiAgLy9cbiAgLy8gUHVzaGVzIHRoZSB2YWx1ZSBvZiB0aGUgY3VycmVudCBjb250ZXh0IG9udG8gdGhlIHN0YWNrLlxuICBwdXNoQ29udGV4dDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wdXNoU3RhY2tMaXRlcmFsKHRoaXMuY29udGV4dE5hbWUodGhpcy5sYXN0Q29udGV4dCkpO1xuICB9LFxuXG4gIC8vIFtsb29rdXBPbkNvbnRleHRdXG4gIC8vXG4gIC8vIE9uIHN0YWNrLCBiZWZvcmU6IC4uLlxuICAvLyBPbiBzdGFjaywgYWZ0ZXI6IGN1cnJlbnRDb250ZXh0W25hbWVdLCAuLi5cbiAgLy9cbiAgLy8gTG9va3MgdXAgdGhlIHZhbHVlIG9mIGBuYW1lYCBvbiB0aGUgY3VycmVudCBjb250ZXh0IGFuZCBwdXNoZXNcbiAgLy8gaXQgb250byB0aGUgc3RhY2suXG4gIGxvb2t1cE9uQ29udGV4dDogZnVuY3Rpb24ocGFydHMsIGZhbHN5LCBzdHJpY3QsIHNjb3BlZCkge1xuICAgIGxldCBpID0gMDtcblxuICAgIGlmICghc2NvcGVkICYmIHRoaXMub3B0aW9ucy5jb21wYXQgJiYgIXRoaXMubGFzdENvbnRleHQpIHtcbiAgICAgIC8vIFRoZSBkZXB0aGVkIHF1ZXJ5IGlzIGV4cGVjdGVkIHRvIGhhbmRsZSB0aGUgdW5kZWZpbmVkIGxvZ2ljIGZvciB0aGUgcm9vdCBsZXZlbCB0aGF0XG4gICAgICAvLyBpcyBpbXBsZW1lbnRlZCBiZWxvdywgc28gd2UgZXZhbHVhdGUgdGhhdCBkaXJlY3RseSBpbiBjb21wYXQgbW9kZVxuICAgICAgdGhpcy5wdXNoKHRoaXMuZGVwdGhlZExvb2t1cChwYXJ0c1tpKytdKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHVzaENvbnRleHQoKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlc29sdmVQYXRoKCdjb250ZXh0JywgcGFydHMsIGksIGZhbHN5LCBzdHJpY3QpO1xuICB9LFxuXG4gIC8vIFtsb29rdXBCbG9ja1BhcmFtXVxuICAvL1xuICAvLyBPbiBzdGFjaywgYmVmb3JlOiAuLi5cbiAgLy8gT24gc3RhY2ssIGFmdGVyOiBibG9ja1BhcmFtW25hbWVdLCAuLi5cbiAgLy9cbiAgLy8gTG9va3MgdXAgdGhlIHZhbHVlIG9mIGBwYXJ0c2Agb24gdGhlIGdpdmVuIGJsb2NrIHBhcmFtIGFuZCBwdXNoZXNcbiAgLy8gaXQgb250byB0aGUgc3RhY2suXG4gIGxvb2t1cEJsb2NrUGFyYW06IGZ1bmN0aW9uKGJsb2NrUGFyYW1JZCwgcGFydHMpIHtcbiAgICB0aGlzLnVzZUJsb2NrUGFyYW1zID0gdHJ1ZTtcblxuICAgIHRoaXMucHVzaChbJ2Jsb2NrUGFyYW1zWycsIGJsb2NrUGFyYW1JZFswXSwgJ11bJywgYmxvY2tQYXJhbUlkWzFdLCAnXSddKTtcbiAgICB0aGlzLnJlc29sdmVQYXRoKCdjb250ZXh0JywgcGFydHMsIDEpO1xuICB9LFxuXG4gIC8vIFtsb29rdXBEYXRhXVxuICAvL1xuICAvLyBPbiBzdGFjaywgYmVmb3JlOiAuLi5cbiAgLy8gT24gc3RhY2ssIGFmdGVyOiBkYXRhLCAuLi5cbiAgLy9cbiAgLy8gUHVzaCB0aGUgZGF0YSBsb29rdXAgb3BlcmF0b3JcbiAgbG9va3VwRGF0YTogZnVuY3Rpb24oZGVwdGgsIHBhcnRzLCBzdHJpY3QpIHtcbiAgICBpZiAoIWRlcHRoKSB7XG4gICAgICB0aGlzLnB1c2hTdGFja0xpdGVyYWwoJ2RhdGEnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wdXNoU3RhY2tMaXRlcmFsKCdjb250YWluZXIuZGF0YShkYXRhLCAnICsgZGVwdGggKyAnKScpO1xuICAgIH1cblxuICAgIHRoaXMucmVzb2x2ZVBhdGgoJ2RhdGEnLCBwYXJ0cywgMCwgdHJ1ZSwgc3RyaWN0KTtcbiAgfSxcblxuICByZXNvbHZlUGF0aDogZnVuY3Rpb24odHlwZSwgcGFydHMsIGksIGZhbHN5LCBzdHJpY3QpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnN0cmljdCB8fCB0aGlzLm9wdGlvbnMuYXNzdW1lT2JqZWN0cykge1xuICAgICAgdGhpcy5wdXNoKHN0cmljdExvb2t1cCh0aGlzLm9wdGlvbnMuc3RyaWN0ICYmIHN0cmljdCwgdGhpcywgcGFydHMsIHR5cGUpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbGVuID0gcGFydHMubGVuZ3RoO1xuICAgIGZvciAoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWxvb3AtZnVuYyAqL1xuICAgICAgdGhpcy5yZXBsYWNlU3RhY2soKGN1cnJlbnQpID0+IHtcbiAgICAgICAgbGV0IGxvb2t1cCA9IHRoaXMubmFtZUxvb2t1cChjdXJyZW50LCBwYXJ0c1tpXSwgdHlwZSk7XG4gICAgICAgIC8vIFdlIHdhbnQgdG8gZW5zdXJlIHRoYXQgemVybyBhbmQgZmFsc2UgYXJlIGhhbmRsZWQgcHJvcGVybHkgaWYgdGhlIGNvbnRleHQgKGZhbHN5IGZsYWcpXG4gICAgICAgIC8vIG5lZWRzIHRvIGhhdmUgdGhlIHNwZWNpYWwgaGFuZGxpbmcgZm9yIHRoZXNlIHZhbHVlcy5cbiAgICAgICAgaWYgKCFmYWxzeSkge1xuICAgICAgICAgIHJldHVybiBbJyAhPSBudWxsID8gJywgbG9va3VwLCAnIDogJywgY3VycmVudF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIHdlIGNhbiB1c2UgZ2VuZXJpYyBmYWxzeSBoYW5kbGluZ1xuICAgICAgICAgIHJldHVybiBbJyAmJiAnLCBsb29rdXBdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tbG9vcC1mdW5jICovXG4gICAgfVxuICB9LFxuXG4gIC8vIFtyZXNvbHZlUG9zc2libGVMYW1iZGFdXG4gIC8vXG4gIC8vIE9uIHN0YWNrLCBiZWZvcmU6IHZhbHVlLCAuLi5cbiAgLy8gT24gc3RhY2ssIGFmdGVyOiByZXNvbHZlZCB2YWx1ZSwgLi4uXG4gIC8vXG4gIC8vIElmIHRoZSBgdmFsdWVgIGlzIGEgbGFtYmRhLCByZXBsYWNlIGl0IG9uIHRoZSBzdGFjayBieVxuICAvLyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBsYW1iZGFcbiAgcmVzb2x2ZVBvc3NpYmxlTGFtYmRhOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnB1c2goW3RoaXMuYWxpYXNhYmxlKCdjb250YWluZXIubGFtYmRhJyksICcoJywgdGhpcy5wb3BTdGFjaygpLCAnLCAnLCB0aGlzLmNvbnRleHROYW1lKDApLCAnKSddKTtcbiAgfSxcblxuICAvLyBbcHVzaFN0cmluZ1BhcmFtXVxuICAvL1xuICAvLyBPbiBzdGFjaywgYmVmb3JlOiAuLi5cbiAgLy8gT24gc3RhY2ssIGFmdGVyOiBzdHJpbmcsIGN1cnJlbnRDb250ZXh0LCAuLi5cbiAgLy9cbiAgLy8gVGhpcyBvcGNvZGUgaXMgZGVzaWduZWQgZm9yIHVzZSBpbiBzdHJpbmcgbW9kZSwgd2hpY2hcbiAgLy8gcHJvdmlkZXMgdGhlIHN0cmluZyB2YWx1ZSBvZiBhIHBhcmFtZXRlciBhbG9uZyB3aXRoIGl0c1xuICAvLyBkZXB0aCByYXRoZXIgdGhhbiByZXNvbHZpbmcgaXQgaW1tZWRpYXRlbHkuXG4gIHB1c2hTdHJpbmdQYXJhbTogZnVuY3Rpb24oc3RyaW5nLCB0eXBlKSB7XG4gICAgdGhpcy5wdXNoQ29udGV4dCgpO1xuICAgIHRoaXMucHVzaFN0cmluZyh0eXBlKTtcblxuICAgIC8vIElmIGl0J3MgYSBzdWJleHByZXNzaW9uLCB0aGUgc3RyaW5nIHJlc3VsdFxuICAgIC8vIHdpbGwgYmUgcHVzaGVkIGFmdGVyIHRoaXMgb3Bjb2RlLlxuICAgIGlmICh0eXBlICE9PSAnU3ViRXhwcmVzc2lvbicpIHtcbiAgICAgIGlmICh0eXBlb2Ygc3RyaW5nID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLnB1c2hTdHJpbmcoc3RyaW5nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHVzaFN0YWNrTGl0ZXJhbChzdHJpbmcpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBlbXB0eUhhc2g6IGZ1bmN0aW9uKG9taXRFbXB0eSkge1xuICAgIGlmICh0aGlzLnRyYWNrSWRzKSB7XG4gICAgICB0aGlzLnB1c2goJ3t9Jyk7IC8vIGhhc2hJZHNcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RyaW5nUGFyYW1zKSB7XG4gICAgICB0aGlzLnB1c2goJ3t9Jyk7IC8vIGhhc2hDb250ZXh0c1xuICAgICAgdGhpcy5wdXNoKCd7fScpOyAvLyBoYXNoVHlwZXNcbiAgICB9XG4gICAgdGhpcy5wdXNoU3RhY2tMaXRlcmFsKG9taXRFbXB0eSA/ICd1bmRlZmluZWQnIDogJ3t9Jyk7XG4gIH0sXG4gIHB1c2hIYXNoOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5oYXNoKSB7XG4gICAgICB0aGlzLmhhc2hlcy5wdXNoKHRoaXMuaGFzaCk7XG4gICAgfVxuICAgIHRoaXMuaGFzaCA9IHt2YWx1ZXM6IHt9LCB0eXBlczogW10sIGNvbnRleHRzOiBbXSwgaWRzOiBbXX07XG4gIH0sXG4gIHBvcEhhc2g6IGZ1bmN0aW9uKCkge1xuICAgIGxldCBoYXNoID0gdGhpcy5oYXNoO1xuICAgIHRoaXMuaGFzaCA9IHRoaXMuaGFzaGVzLnBvcCgpO1xuXG4gICAgaWYgKHRoaXMudHJhY2tJZHMpIHtcbiAgICAgIHRoaXMucHVzaCh0aGlzLm9iamVjdExpdGVyYWwoaGFzaC5pZHMpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RyaW5nUGFyYW1zKSB7XG4gICAgICB0aGlzLnB1c2godGhpcy5vYmplY3RMaXRlcmFsKGhhc2guY29udGV4dHMpKTtcbiAgICAgIHRoaXMucHVzaCh0aGlzLm9iamVjdExpdGVyYWwoaGFzaC50eXBlcykpO1xuICAgIH1cblxuICAgIHRoaXMucHVzaCh0aGlzLm9iamVjdExpdGVyYWwoaGFzaC52YWx1ZXMpKTtcbiAgfSxcblxuICAvLyBbcHVzaFN0cmluZ11cbiAgLy9cbiAgLy8gT24gc3RhY2ssIGJlZm9yZTogLi4uXG4gIC8vIE9uIHN0YWNrLCBhZnRlcjogcXVvdGVkU3RyaW5nKHN0cmluZyksIC4uLlxuICAvL1xuICAvLyBQdXNoIGEgcXVvdGVkIHZlcnNpb24gb2YgYHN0cmluZ2Agb250byB0aGUgc3RhY2tcbiAgcHVzaFN0cmluZzogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgdGhpcy5wdXNoU3RhY2tMaXRlcmFsKHRoaXMucXVvdGVkU3RyaW5nKHN0cmluZykpO1xuICB9LFxuXG4gIC8vIFtwdXNoTGl0ZXJhbF1cbiAgLy9cbiAgLy8gT24gc3RhY2ssIGJlZm9yZTogLi4uXG4gIC8vIE9uIHN0YWNrLCBhZnRlcjogdmFsdWUsIC4uLlxuICAvL1xuICAvLyBQdXNoZXMgYSB2YWx1ZSBvbnRvIHRoZSBzdGFjay4gVGhpcyBvcGVyYXRpb24gcHJldmVudHNcbiAgLy8gdGhlIGNvbXBpbGVyIGZyb20gY3JlYXRpbmcgYSB0ZW1wb3JhcnkgdmFyaWFibGUgdG8gaG9sZFxuICAvLyBpdC5cbiAgcHVzaExpdGVyYWw6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdGhpcy5wdXNoU3RhY2tMaXRlcmFsKHZhbHVlKTtcbiAgfSxcblxuICAvLyBbcHVzaFByb2dyYW1dXG4gIC8vXG4gIC8vIE9uIHN0YWNrLCBiZWZvcmU6IC4uLlxuICAvLyBPbiBzdGFjaywgYWZ0ZXI6IHByb2dyYW0oZ3VpZCksIC4uLlxuICAvL1xuICAvLyBQdXNoIGEgcHJvZ3JhbSBleHByZXNzaW9uIG9udG8gdGhlIHN0YWNrLiBUaGlzIHRha2VzXG4gIC8vIGEgY29tcGlsZS10aW1lIGd1aWQgYW5kIGNvbnZlcnRzIGl0IGludG8gYSBydW50aW1lLWFjY2Vzc2libGVcbiAgLy8gZXhwcmVzc2lvbi5cbiAgcHVzaFByb2dyYW06IGZ1bmN0aW9uKGd1aWQpIHtcbiAgICBpZiAoZ3VpZCAhPSBudWxsKSB7XG4gICAgICB0aGlzLnB1c2hTdGFja0xpdGVyYWwodGhpcy5wcm9ncmFtRXhwcmVzc2lvbihndWlkKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHVzaFN0YWNrTGl0ZXJhbChudWxsKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gW3JlZ2lzdGVyRGVjb3JhdG9yXVxuICAvL1xuICAvLyBPbiBzdGFjaywgYmVmb3JlOiBoYXNoLCBwcm9ncmFtLCBwYXJhbXMuLi4sIC4uLlxuICAvLyBPbiBzdGFjaywgYWZ0ZXI6IC4uLlxuICAvL1xuICAvLyBQb3BzIG9mZiB0aGUgZGVjb3JhdG9yJ3MgcGFyYW1ldGVycywgaW52b2tlcyB0aGUgZGVjb3JhdG9yLFxuICAvLyBhbmQgaW5zZXJ0cyB0aGUgZGVjb3JhdG9yIGludG8gdGhlIGRlY29yYXRvcnMgbGlzdC5cbiAgcmVnaXN0ZXJEZWNvcmF0b3IocGFyYW1TaXplLCBuYW1lKSB7XG4gICAgbGV0IGZvdW5kRGVjb3JhdG9yID0gdGhpcy5uYW1lTG9va3VwKCdkZWNvcmF0b3JzJywgbmFtZSwgJ2RlY29yYXRvcicpLFxuICAgICAgICBvcHRpb25zID0gdGhpcy5zZXR1cEhlbHBlckFyZ3MobmFtZSwgcGFyYW1TaXplKTtcblxuICAgIHRoaXMuZGVjb3JhdG9ycy5wdXNoKFtcbiAgICAgICdmbiA9ICcsXG4gICAgICB0aGlzLmRlY29yYXRvcnMuZnVuY3Rpb25DYWxsKGZvdW5kRGVjb3JhdG9yLCAnJywgWydmbicsICdwcm9wcycsICdjb250YWluZXInLCBvcHRpb25zXSksXG4gICAgICAnIHx8IGZuOydcbiAgICBdKTtcbiAgfSxcblxuICAvLyBbaW52b2tlSGVscGVyXVxuICAvL1xuICAvLyBPbiBzdGFjaywgYmVmb3JlOiBoYXNoLCBpbnZlcnNlLCBwcm9ncmFtLCBwYXJhbXMuLi4sIC4uLlxuICAvLyBPbiBzdGFjaywgYWZ0ZXI6IHJlc3VsdCBvZiBoZWxwZXIgaW52b2NhdGlvblxuICAvL1xuICAvLyBQb3BzIG9mZiB0aGUgaGVscGVyJ3MgcGFyYW1ldGVycywgaW52b2tlcyB0aGUgaGVscGVyLFxuICAvLyBhbmQgcHVzaGVzIHRoZSBoZWxwZXIncyByZXR1cm4gdmFsdWUgb250byB0aGUgc3RhY2suXG4gIC8vXG4gIC8vIElmIHRoZSBoZWxwZXIgaXMgbm90IGZvdW5kLCBgaGVscGVyTWlzc2luZ2AgaXMgY2FsbGVkLlxuICBpbnZva2VIZWxwZXI6IGZ1bmN0aW9uKHBhcmFtU2l6ZSwgbmFtZSwgaXNTaW1wbGUpIHtcbiAgICBsZXQgbm9uSGVscGVyID0gdGhpcy5wb3BTdGFjaygpLFxuICAgICAgICBoZWxwZXIgPSB0aGlzLnNldHVwSGVscGVyKHBhcmFtU2l6ZSwgbmFtZSk7XG5cbiAgICBsZXQgcG9zc2libGVGdW5jdGlvbkNhbGxzID0gW107XG5cbiAgICBpZiAoaXNTaW1wbGUpIHsgLy8gZGlyZWN0IGNhbGwgdG8gaGVscGVyXG4gICAgICBwb3NzaWJsZUZ1bmN0aW9uQ2FsbHMucHVzaChoZWxwZXIubmFtZSk7XG4gICAgfVxuICAgIC8vIGNhbGwgYSBmdW5jdGlvbiBmcm9tIHRoZSBpbnB1dCBvYmplY3RcbiAgICBwb3NzaWJsZUZ1bmN0aW9uQ2FsbHMucHVzaChub25IZWxwZXIpO1xuICAgIGlmICghdGhpcy5vcHRpb25zLnN0cmljdCkge1xuICAgICAgcG9zc2libGVGdW5jdGlvbkNhbGxzLnB1c2godGhpcy5hbGlhc2FibGUoJ2NvbnRhaW5lci5ob29rcy5oZWxwZXJNaXNzaW5nJykpO1xuICAgIH1cblxuICAgIGxldCBmdW5jdGlvbkxvb2t1cENvZGUgPSBbJygnLCB0aGlzLml0ZW1zU2VwYXJhdGVkQnkocG9zc2libGVGdW5jdGlvbkNhbGxzLCAnfHwnKSwgJyknXTtcbiAgICBsZXQgZnVuY3Rpb25DYWxsID0gdGhpcy5zb3VyY2UuZnVuY3Rpb25DYWxsKGZ1bmN0aW9uTG9va3VwQ29kZSwgJ2NhbGwnLCBoZWxwZXIuY2FsbFBhcmFtcyk7XG4gICAgdGhpcy5wdXNoKGZ1bmN0aW9uQ2FsbCk7XG4gIH0sXG5cbiAgaXRlbXNTZXBhcmF0ZWRCeTogZnVuY3Rpb24oaXRlbXMsIHNlcGFyYXRvcikge1xuICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICByZXN1bHQucHVzaChpdGVtc1swXSk7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0LnB1c2goc2VwYXJhdG9yLCBpdGVtc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG4gIC8vIFtpbnZva2VLbm93bkhlbHBlcl1cbiAgLy9cbiAgLy8gT24gc3RhY2ssIGJlZm9yZTogaGFzaCwgaW52ZXJzZSwgcHJvZ3JhbSwgcGFyYW1zLi4uLCAuLi5cbiAgLy8gT24gc3RhY2ssIGFmdGVyOiByZXN1bHQgb2YgaGVscGVyIGludm9jYXRpb25cbiAgLy9cbiAgLy8gVGhpcyBvcGVyYXRpb24gaXMgdXNlZCB3aGVuIHRoZSBoZWxwZXIgaXMga25vd24gdG8gZXhpc3QsXG4gIC8vIHNvIGEgYGhlbHBlck1pc3NpbmdgIGZhbGxiYWNrIGlzIG5vdCByZXF1aXJlZC5cbiAgaW52b2tlS25vd25IZWxwZXI6IGZ1bmN0aW9uKHBhcmFtU2l6ZSwgbmFtZSkge1xuICAgIGxldCBoZWxwZXIgPSB0aGlzLnNldHVwSGVscGVyKHBhcmFtU2l6ZSwgbmFtZSk7XG4gICAgdGhpcy5wdXNoKHRoaXMuc291cmNlLmZ1bmN0aW9uQ2FsbChoZWxwZXIubmFtZSwgJ2NhbGwnLCBoZWxwZXIuY2FsbFBhcmFtcykpO1xuICB9LFxuXG4gIC8vIFtpbnZva2VBbWJpZ3VvdXNdXG4gIC8vXG4gIC8vIE9uIHN0YWNrLCBiZWZvcmU6IGhhc2gsIGludmVyc2UsIHByb2dyYW0sIHBhcmFtcy4uLiwgLi4uXG4gIC8vIE9uIHN0YWNrLCBhZnRlcjogcmVzdWx0IG9mIGRpc2FtYmlndWF0aW9uXG4gIC8vXG4gIC8vIFRoaXMgb3BlcmF0aW9uIGlzIHVzZWQgd2hlbiBhbiBleHByZXNzaW9uIGxpa2UgYHt7Zm9vfX1gXG4gIC8vIGlzIHByb3ZpZGVkLCBidXQgd2UgZG9uJ3Qga25vdyBhdCBjb21waWxlLXRpbWUgd2hldGhlciBpdFxuICAvLyBpcyBhIGhlbHBlciBvciBhIHBhdGguXG4gIC8vXG4gIC8vIFRoaXMgb3BlcmF0aW9uIGVtaXRzIG1vcmUgY29kZSB0aGFuIHRoZSBvdGhlciBvcHRpb25zLFxuICAvLyBhbmQgY2FuIGJlIGF2b2lkZWQgYnkgcGFzc2luZyB0aGUgYGtub3duSGVscGVyc2AgYW5kXG4gIC8vIGBrbm93bkhlbHBlcnNPbmx5YCBmbGFncyBhdCBjb21waWxlLXRpbWUuXG4gIGludm9rZUFtYmlndW91czogZnVuY3Rpb24obmFtZSwgaGVscGVyQ2FsbCkge1xuICAgIHRoaXMudXNlUmVnaXN0ZXIoJ2hlbHBlcicpO1xuXG4gICAgbGV0IG5vbkhlbHBlciA9IHRoaXMucG9wU3RhY2soKTtcblxuICAgIHRoaXMuZW1wdHlIYXNoKCk7XG4gICAgbGV0IGhlbHBlciA9IHRoaXMuc2V0dXBIZWxwZXIoMCwgbmFtZSwgaGVscGVyQ2FsbCk7XG5cbiAgICBsZXQgaGVscGVyTmFtZSA9IHRoaXMubGFzdEhlbHBlciA9IHRoaXMubmFtZUxvb2t1cCgnaGVscGVycycsIG5hbWUsICdoZWxwZXInKTtcblxuICAgIGxldCBsb29rdXAgPSBbJygnLCAnKGhlbHBlciA9ICcsIGhlbHBlck5hbWUsICcgfHwgJywgbm9uSGVscGVyLCAnKSddO1xuICAgIGlmICghdGhpcy5vcHRpb25zLnN0cmljdCkge1xuICAgICAgbG9va3VwWzBdID0gJyhoZWxwZXIgPSAnO1xuICAgICAgbG9va3VwLnB1c2goXG4gICAgICAgICAgJyAhPSBudWxsID8gaGVscGVyIDogJyxcbiAgICAgICAgICB0aGlzLmFsaWFzYWJsZSgnY29udGFpbmVyLmhvb2tzLmhlbHBlck1pc3NpbmcnKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLnB1c2goW1xuICAgICAgJygnLCBsb29rdXAsXG4gICAgICAoaGVscGVyLnBhcmFtc0luaXQgPyBbJyksKCcsIGhlbHBlci5wYXJhbXNJbml0XSA6IFtdKSwgJyksJyxcbiAgICAgICcodHlwZW9mIGhlbHBlciA9PT0gJywgdGhpcy5hbGlhc2FibGUoJ1wiZnVuY3Rpb25cIicpLCAnID8gJyxcbiAgICAgIHRoaXMuc291cmNlLmZ1bmN0aW9uQ2FsbCgnaGVscGVyJywgJ2NhbGwnLCBoZWxwZXIuY2FsbFBhcmFtcyksICcgOiBoZWxwZXIpKSdcbiAgICBdKTtcbiAgfSxcblxuICAvLyBbaW52b2tlUGFydGlhbF1cbiAgLy9cbiAgLy8gT24gc3RhY2ssIGJlZm9yZTogY29udGV4dCwgLi4uXG4gIC8vIE9uIHN0YWNrIGFmdGVyOiByZXN1bHQgb2YgcGFydGlhbCBpbnZvY2F0aW9uXG4gIC8vXG4gIC8vIFRoaXMgb3BlcmF0aW9uIHBvcHMgb2ZmIGEgY29udGV4dCwgaW52b2tlcyBhIHBhcnRpYWwgd2l0aCB0aGF0IGNvbnRleHQsXG4gIC8vIGFuZCBwdXNoZXMgdGhlIHJlc3VsdCBvZiB0aGUgaW52b2NhdGlvbiBiYWNrLlxuICBpbnZva2VQYXJ0aWFsOiBmdW5jdGlvbihpc0R5bmFtaWMsIG5hbWUsIGluZGVudCkge1xuICAgIGxldCBwYXJhbXMgPSBbXSxcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMuc2V0dXBQYXJhbXMobmFtZSwgMSwgcGFyYW1zKTtcblxuICAgIGlmIChpc0R5bmFtaWMpIHtcbiAgICAgIG5hbWUgPSB0aGlzLnBvcFN0YWNrKCk7XG4gICAgICBkZWxldGUgb3B0aW9ucy5uYW1lO1xuICAgIH1cblxuICAgIGlmIChpbmRlbnQpIHtcbiAgICAgIG9wdGlvbnMuaW5kZW50ID0gSlNPTi5zdHJpbmdpZnkoaW5kZW50KTtcbiAgICB9XG4gICAgb3B0aW9ucy5oZWxwZXJzID0gJ2hlbHBlcnMnO1xuICAgIG9wdGlvbnMucGFydGlhbHMgPSAncGFydGlhbHMnO1xuICAgIG9wdGlvbnMuZGVjb3JhdG9ycyA9ICdjb250YWluZXIuZGVjb3JhdG9ycyc7XG5cbiAgICBpZiAoIWlzRHluYW1pYykge1xuICAgICAgcGFyYW1zLnVuc2hpZnQodGhpcy5uYW1lTG9va3VwKCdwYXJ0aWFscycsIG5hbWUsICdwYXJ0aWFsJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJhbXMudW5zaGlmdChuYW1lKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbXBhdCkge1xuICAgICAgb3B0aW9ucy5kZXB0aHMgPSAnZGVwdGhzJztcbiAgICB9XG4gICAgb3B0aW9ucyA9IHRoaXMub2JqZWN0TGl0ZXJhbChvcHRpb25zKTtcbiAgICBwYXJhbXMucHVzaChvcHRpb25zKTtcblxuICAgIHRoaXMucHVzaCh0aGlzLnNvdXJjZS5mdW5jdGlvbkNhbGwoJ2NvbnRhaW5lci5pbnZva2VQYXJ0aWFsJywgJycsIHBhcmFtcykpO1xuICB9LFxuXG4gIC8vIFthc3NpZ25Ub0hhc2hdXG4gIC8vXG4gIC8vIE9uIHN0YWNrLCBiZWZvcmU6IHZhbHVlLCAuLi4sIGhhc2gsIC4uLlxuICAvLyBPbiBzdGFjaywgYWZ0ZXI6IC4uLiwgaGFzaCwgLi4uXG4gIC8vXG4gIC8vIFBvcHMgYSB2YWx1ZSBvZmYgdGhlIHN0YWNrIGFuZCBhc3NpZ25zIGl0IHRvIHRoZSBjdXJyZW50IGhhc2hcbiAgYXNzaWduVG9IYXNoOiBmdW5jdGlvbihrZXkpIHtcbiAgICBsZXQgdmFsdWUgPSB0aGlzLnBvcFN0YWNrKCksXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIHR5cGUsXG4gICAgICAgIGlkO1xuXG4gICAgaWYgKHRoaXMudHJhY2tJZHMpIHtcbiAgICAgIGlkID0gdGhpcy5wb3BTdGFjaygpO1xuICAgIH1cbiAgICBpZiAodGhpcy5zdHJpbmdQYXJhbXMpIHtcbiAgICAgIHR5cGUgPSB0aGlzLnBvcFN0YWNrKCk7XG4gICAgICBjb250ZXh0ID0gdGhpcy5wb3BTdGFjaygpO1xuICAgIH1cblxuICAgIGxldCBoYXNoID0gdGhpcy5oYXNoO1xuICAgIGlmIChjb250ZXh0KSB7XG4gICAgICBoYXNoLmNvbnRleHRzW2tleV0gPSBjb250ZXh0O1xuICAgIH1cbiAgICBpZiAodHlwZSkge1xuICAgICAgaGFzaC50eXBlc1trZXldID0gdHlwZTtcbiAgICB9XG4gICAgaWYgKGlkKSB7XG4gICAgICBoYXNoLmlkc1trZXldID0gaWQ7XG4gICAgfVxuICAgIGhhc2gudmFsdWVzW2tleV0gPSB2YWx1ZTtcbiAgfSxcblxuICBwdXNoSWQ6IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIGNoaWxkKSB7XG4gICAgaWYgKHR5cGUgPT09ICdCbG9ja1BhcmFtJykge1xuICAgICAgdGhpcy5wdXNoU3RhY2tMaXRlcmFsKFxuICAgICAgICAgICdibG9ja1BhcmFtc1snICsgbmFtZVswXSArICddLnBhdGhbJyArIG5hbWVbMV0gKyAnXSdcbiAgICAgICAgICArIChjaGlsZCA/ICcgKyAnICsgSlNPTi5zdHJpbmdpZnkoJy4nICsgY2hpbGQpIDogJycpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdQYXRoRXhwcmVzc2lvbicpIHtcbiAgICAgIHRoaXMucHVzaFN0cmluZyhuYW1lKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdTdWJFeHByZXNzaW9uJykge1xuICAgICAgdGhpcy5wdXNoU3RhY2tMaXRlcmFsKCd0cnVlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHVzaFN0YWNrTGl0ZXJhbCgnbnVsbCcpO1xuICAgIH1cbiAgfSxcblxuICAvLyBIRUxQRVJTXG5cbiAgY29tcGlsZXI6IEphdmFTY3JpcHRDb21waWxlcixcblxuICBjb21waWxlQ2hpbGRyZW46IGZ1bmN0aW9uKGVudmlyb25tZW50LCBvcHRpb25zKSB7XG4gICAgbGV0IGNoaWxkcmVuID0gZW52aXJvbm1lbnQuY2hpbGRyZW4sIGNoaWxkLCBjb21waWxlcjtcblxuICAgIGZvciAobGV0IGkgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgY29tcGlsZXIgPSBuZXcgdGhpcy5jb21waWxlcigpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5ldy1jYXBcblxuICAgICAgbGV0IGV4aXN0aW5nID0gdGhpcy5tYXRjaEV4aXN0aW5nUHJvZ3JhbShjaGlsZCk7XG5cbiAgICAgIGlmIChleGlzdGluZyA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuY29udGV4dC5wcm9ncmFtcy5wdXNoKCcnKTsgLy8gUGxhY2Vob2xkZXIgdG8gcHJldmVudCBuYW1lIGNvbmZsaWN0cyBmb3IgbmVzdGVkIGNoaWxkcmVuXG4gICAgICAgIGxldCBpbmRleCA9IHRoaXMuY29udGV4dC5wcm9ncmFtcy5sZW5ndGg7XG4gICAgICAgIGNoaWxkLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIGNoaWxkLm5hbWUgPSAncHJvZ3JhbScgKyBpbmRleDtcbiAgICAgICAgdGhpcy5jb250ZXh0LnByb2dyYW1zW2luZGV4XSA9IGNvbXBpbGVyLmNvbXBpbGUoY2hpbGQsIG9wdGlvbnMsIHRoaXMuY29udGV4dCwgIXRoaXMucHJlY29tcGlsZSk7XG4gICAgICAgIHRoaXMuY29udGV4dC5kZWNvcmF0b3JzW2luZGV4XSA9IGNvbXBpbGVyLmRlY29yYXRvcnM7XG4gICAgICAgIHRoaXMuY29udGV4dC5lbnZpcm9ubWVudHNbaW5kZXhdID0gY2hpbGQ7XG5cbiAgICAgICAgdGhpcy51c2VEZXB0aHMgPSB0aGlzLnVzZURlcHRocyB8fCBjb21waWxlci51c2VEZXB0aHM7XG4gICAgICAgIHRoaXMudXNlQmxvY2tQYXJhbXMgPSB0aGlzLnVzZUJsb2NrUGFyYW1zIHx8IGNvbXBpbGVyLnVzZUJsb2NrUGFyYW1zO1xuICAgICAgICBjaGlsZC51c2VEZXB0aHMgPSB0aGlzLnVzZURlcHRocztcbiAgICAgICAgY2hpbGQudXNlQmxvY2tQYXJhbXMgPSB0aGlzLnVzZUJsb2NrUGFyYW1zO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hpbGQuaW5kZXggPSBleGlzdGluZy5pbmRleDtcbiAgICAgICAgY2hpbGQubmFtZSA9ICdwcm9ncmFtJyArIGV4aXN0aW5nLmluZGV4O1xuXG4gICAgICAgIHRoaXMudXNlRGVwdGhzID0gdGhpcy51c2VEZXB0aHMgfHwgZXhpc3RpbmcudXNlRGVwdGhzO1xuICAgICAgICB0aGlzLnVzZUJsb2NrUGFyYW1zID0gdGhpcy51c2VCbG9ja1BhcmFtcyB8fCBleGlzdGluZy51c2VCbG9ja1BhcmFtcztcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIG1hdGNoRXhpc3RpbmdQcm9ncmFtOiBmdW5jdGlvbihjaGlsZCkge1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLmNvbnRleHQuZW52aXJvbm1lbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBsZXQgZW52aXJvbm1lbnQgPSB0aGlzLmNvbnRleHQuZW52aXJvbm1lbnRzW2ldO1xuICAgICAgaWYgKGVudmlyb25tZW50ICYmIGVudmlyb25tZW50LmVxdWFscyhjaGlsZCkpIHtcbiAgICAgICAgcmV0dXJuIGVudmlyb25tZW50O1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBwcm9ncmFtRXhwcmVzc2lvbjogZnVuY3Rpb24oZ3VpZCkge1xuICAgIGxldCBjaGlsZCA9IHRoaXMuZW52aXJvbm1lbnQuY2hpbGRyZW5bZ3VpZF0sXG4gICAgICAgIHByb2dyYW1QYXJhbXMgPSBbY2hpbGQuaW5kZXgsICdkYXRhJywgY2hpbGQuYmxvY2tQYXJhbXNdO1xuXG4gICAgaWYgKHRoaXMudXNlQmxvY2tQYXJhbXMgfHwgdGhpcy51c2VEZXB0aHMpIHtcbiAgICAgIHByb2dyYW1QYXJhbXMucHVzaCgnYmxvY2tQYXJhbXMnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudXNlRGVwdGhzKSB7XG4gICAgICBwcm9ncmFtUGFyYW1zLnB1c2goJ2RlcHRocycpO1xuICAgIH1cblxuICAgIHJldHVybiAnY29udGFpbmVyLnByb2dyYW0oJyArIHByb2dyYW1QYXJhbXMuam9pbignLCAnKSArICcpJztcbiAgfSxcblxuICB1c2VSZWdpc3RlcjogZnVuY3Rpb24obmFtZSkge1xuICAgIGlmICghdGhpcy5yZWdpc3RlcnNbbmFtZV0pIHtcbiAgICAgIHRoaXMucmVnaXN0ZXJzW25hbWVdID0gdHJ1ZTtcbiAgICAgIHRoaXMucmVnaXN0ZXJzLmxpc3QucHVzaChuYW1lKTtcbiAgICB9XG4gIH0sXG5cbiAgcHVzaDogZnVuY3Rpb24oZXhwcikge1xuICAgIGlmICghKGV4cHIgaW5zdGFuY2VvZiBMaXRlcmFsKSkge1xuICAgICAgZXhwciA9IHRoaXMuc291cmNlLndyYXAoZXhwcik7XG4gICAgfVxuXG4gICAgdGhpcy5pbmxpbmVTdGFjay5wdXNoKGV4cHIpO1xuICAgIHJldHVybiBleHByO1xuICB9LFxuXG4gIHB1c2hTdGFja0xpdGVyYWw6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICB0aGlzLnB1c2gobmV3IExpdGVyYWwoaXRlbSkpO1xuICB9LFxuXG4gIHB1c2hTb3VyY2U6IGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgIGlmICh0aGlzLnBlbmRpbmdDb250ZW50KSB7XG4gICAgICB0aGlzLnNvdXJjZS5wdXNoKFxuICAgICAgICAgIHRoaXMuYXBwZW5kVG9CdWZmZXIodGhpcy5zb3VyY2UucXVvdGVkU3RyaW5nKHRoaXMucGVuZGluZ0NvbnRlbnQpLCB0aGlzLnBlbmRpbmdMb2NhdGlvbikpO1xuICAgICAgdGhpcy5wZW5kaW5nQ29udGVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoc291cmNlKSB7XG4gICAgICB0aGlzLnNvdXJjZS5wdXNoKHNvdXJjZSk7XG4gICAgfVxuICB9LFxuXG4gIHJlcGxhY2VTdGFjazogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBsZXQgcHJlZml4ID0gWycoJ10sXG4gICAgICAgIHN0YWNrLFxuICAgICAgICBjcmVhdGVkU3RhY2ssXG4gICAgICAgIHVzZWRMaXRlcmFsO1xuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBpZiAoIXRoaXMuaXNJbmxpbmUoKSkge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbigncmVwbGFjZVN0YWNrIG9uIG5vbi1pbmxpbmUnKTtcbiAgICB9XG5cbiAgICAvLyBXZSB3YW50IHRvIG1lcmdlIHRoZSBpbmxpbmUgc3RhdGVtZW50IGludG8gdGhlIHJlcGxhY2VtZW50IHN0YXRlbWVudCB2aWEgJywnXG4gICAgbGV0IHRvcCA9IHRoaXMucG9wU3RhY2sodHJ1ZSk7XG5cbiAgICBpZiAodG9wIGluc3RhbmNlb2YgTGl0ZXJhbCkge1xuICAgICAgLy8gTGl0ZXJhbHMgZG8gbm90IG5lZWQgdG8gYmUgaW5saW5lZFxuICAgICAgc3RhY2sgPSBbdG9wLnZhbHVlXTtcbiAgICAgIHByZWZpeCA9IFsnKCcsIHN0YWNrXTtcbiAgICAgIHVzZWRMaXRlcmFsID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gR2V0IG9yIGNyZWF0ZSB0aGUgY3VycmVudCBzdGFjayBuYW1lIGZvciB1c2UgYnkgdGhlIGlubGluZVxuICAgICAgY3JlYXRlZFN0YWNrID0gdHJ1ZTtcbiAgICAgIGxldCBuYW1lID0gdGhpcy5pbmNyU3RhY2soKTtcblxuICAgICAgcHJlZml4ID0gWycoKCcsIHRoaXMucHVzaChuYW1lKSwgJyA9ICcsIHRvcCwgJyknXTtcbiAgICAgIHN0YWNrID0gdGhpcy50b3BTdGFjaygpO1xuICAgIH1cblxuICAgIGxldCBpdGVtID0gY2FsbGJhY2suY2FsbCh0aGlzLCBzdGFjayk7XG5cbiAgICBpZiAoIXVzZWRMaXRlcmFsKSB7XG4gICAgICB0aGlzLnBvcFN0YWNrKCk7XG4gICAgfVxuICAgIGlmIChjcmVhdGVkU3RhY2spIHtcbiAgICAgIHRoaXMuc3RhY2tTbG90LS07XG4gICAgfVxuICAgIHRoaXMucHVzaChwcmVmaXguY29uY2F0KGl0ZW0sICcpJykpO1xuICB9LFxuXG4gIGluY3JTdGFjazogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdGFja1Nsb3QrKztcbiAgICBpZiAodGhpcy5zdGFja1Nsb3QgPiB0aGlzLnN0YWNrVmFycy5sZW5ndGgpIHsgdGhpcy5zdGFja1ZhcnMucHVzaCgnc3RhY2snICsgdGhpcy5zdGFja1Nsb3QpOyB9XG4gICAgcmV0dXJuIHRoaXMudG9wU3RhY2tOYW1lKCk7XG4gIH0sXG4gIHRvcFN0YWNrTmFtZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdzdGFjaycgKyB0aGlzLnN0YWNrU2xvdDtcbiAgfSxcbiAgZmx1c2hJbmxpbmU6IGZ1bmN0aW9uKCkge1xuICAgIGxldCBpbmxpbmVTdGFjayA9IHRoaXMuaW5saW5lU3RhY2s7XG4gICAgdGhpcy5pbmxpbmVTdGFjayA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBpbmxpbmVTdGFjay5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgbGV0IGVudHJ5ID0gaW5saW5lU3RhY2tbaV07XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmIChlbnRyeSBpbnN0YW5jZW9mIExpdGVyYWwpIHtcbiAgICAgICAgdGhpcy5jb21waWxlU3RhY2sucHVzaChlbnRyeSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgc3RhY2sgPSB0aGlzLmluY3JTdGFjaygpO1xuICAgICAgICB0aGlzLnB1c2hTb3VyY2UoW3N0YWNrLCAnID0gJywgZW50cnksICc7J10pO1xuICAgICAgICB0aGlzLmNvbXBpbGVTdGFjay5wdXNoKHN0YWNrKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGlzSW5saW5lOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5pbmxpbmVTdGFjay5sZW5ndGg7XG4gIH0sXG5cbiAgcG9wU3RhY2s6IGZ1bmN0aW9uKHdyYXBwZWQpIHtcbiAgICBsZXQgaW5saW5lID0gdGhpcy5pc0lubGluZSgpLFxuICAgICAgICBpdGVtID0gKGlubGluZSA/IHRoaXMuaW5saW5lU3RhY2sgOiB0aGlzLmNvbXBpbGVTdGFjaykucG9wKCk7XG5cbiAgICBpZiAoIXdyYXBwZWQgJiYgKGl0ZW0gaW5zdGFuY2VvZiBMaXRlcmFsKSkge1xuICAgICAgcmV0dXJuIGl0ZW0udmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghaW5saW5lKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGlmICghdGhpcy5zdGFja1Nsb3QpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdJbnZhbGlkIHN0YWNrIHBvcCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhY2tTbG90LS07XG4gICAgICB9XG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9XG4gIH0sXG5cbiAgdG9wU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgIGxldCBzdGFjayA9ICh0aGlzLmlzSW5saW5lKCkgPyB0aGlzLmlubGluZVN0YWNrIDogdGhpcy5jb21waWxlU3RhY2spLFxuICAgICAgICBpdGVtID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIExpdGVyYWwpIHtcbiAgICAgIHJldHVybiBpdGVtLnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9XG4gIH0sXG5cbiAgY29udGV4dE5hbWU6IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBpZiAodGhpcy51c2VEZXB0aHMgJiYgY29udGV4dCkge1xuICAgICAgcmV0dXJuICdkZXB0aHNbJyArIGNvbnRleHQgKyAnXSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnZGVwdGgnICsgY29udGV4dDtcbiAgICB9XG4gIH0sXG5cbiAgcXVvdGVkU3RyaW5nOiBmdW5jdGlvbihzdHIpIHtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2UucXVvdGVkU3RyaW5nKHN0cik7XG4gIH0sXG5cbiAgb2JqZWN0TGl0ZXJhbDogZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlLm9iamVjdExpdGVyYWwob2JqKTtcbiAgfSxcblxuICBhbGlhc2FibGU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBsZXQgcmV0ID0gdGhpcy5hbGlhc2VzW25hbWVdO1xuICAgIGlmIChyZXQpIHtcbiAgICAgIHJldC5yZWZlcmVuY2VDb3VudCsrO1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICByZXQgPSB0aGlzLmFsaWFzZXNbbmFtZV0gPSB0aGlzLnNvdXJjZS53cmFwKG5hbWUpO1xuICAgIHJldC5hbGlhc2FibGUgPSB0cnVlO1xuICAgIHJldC5yZWZlcmVuY2VDb3VudCA9IDE7XG5cbiAgICByZXR1cm4gcmV0O1xuICB9LFxuXG4gIHNldHVwSGVscGVyOiBmdW5jdGlvbihwYXJhbVNpemUsIG5hbWUsIGJsb2NrSGVscGVyKSB7XG4gICAgbGV0IHBhcmFtcyA9IFtdLFxuICAgICAgICBwYXJhbXNJbml0ID0gdGhpcy5zZXR1cEhlbHBlckFyZ3MobmFtZSwgcGFyYW1TaXplLCBwYXJhbXMsIGJsb2NrSGVscGVyKTtcbiAgICBsZXQgZm91bmRIZWxwZXIgPSB0aGlzLm5hbWVMb29rdXAoJ2hlbHBlcnMnLCBuYW1lLCAnaGVscGVyJyksXG4gICAgICAgIGNhbGxDb250ZXh0ID0gdGhpcy5hbGlhc2FibGUoYCR7dGhpcy5jb250ZXh0TmFtZSgwKX0gIT0gbnVsbCA/ICR7dGhpcy5jb250ZXh0TmFtZSgwKX0gOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KWApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHBhcmFtczogcGFyYW1zLFxuICAgICAgcGFyYW1zSW5pdDogcGFyYW1zSW5pdCxcbiAgICAgIG5hbWU6IGZvdW5kSGVscGVyLFxuICAgICAgY2FsbFBhcmFtczogW2NhbGxDb250ZXh0XS5jb25jYXQocGFyYW1zKVxuICAgIH07XG4gIH0sXG5cbiAgc2V0dXBQYXJhbXM6IGZ1bmN0aW9uKGhlbHBlciwgcGFyYW1TaXplLCBwYXJhbXMpIHtcbiAgICBsZXQgb3B0aW9ucyA9IHt9LFxuICAgICAgICBjb250ZXh0cyA9IFtdLFxuICAgICAgICB0eXBlcyA9IFtdLFxuICAgICAgICBpZHMgPSBbXSxcbiAgICAgICAgb2JqZWN0QXJncyA9ICFwYXJhbXMsXG4gICAgICAgIHBhcmFtO1xuXG4gICAgaWYgKG9iamVjdEFyZ3MpIHtcbiAgICAgIHBhcmFtcyA9IFtdO1xuICAgIH1cblxuICAgIG9wdGlvbnMubmFtZSA9IHRoaXMucXVvdGVkU3RyaW5nKGhlbHBlcik7XG4gICAgb3B0aW9ucy5oYXNoID0gdGhpcy5wb3BTdGFjaygpO1xuXG4gICAgaWYgKHRoaXMudHJhY2tJZHMpIHtcbiAgICAgIG9wdGlvbnMuaGFzaElkcyA9IHRoaXMucG9wU3RhY2soKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RyaW5nUGFyYW1zKSB7XG4gICAgICBvcHRpb25zLmhhc2hUeXBlcyA9IHRoaXMucG9wU3RhY2soKTtcbiAgICAgIG9wdGlvbnMuaGFzaENvbnRleHRzID0gdGhpcy5wb3BTdGFjaygpO1xuICAgIH1cblxuICAgIGxldCBpbnZlcnNlID0gdGhpcy5wb3BTdGFjaygpLFxuICAgICAgICBwcm9ncmFtID0gdGhpcy5wb3BTdGFjaygpO1xuXG4gICAgLy8gQXZvaWQgc2V0dGluZyBmbiBhbmQgaW52ZXJzZSBpZiBuZWl0aGVyIGFyZSBzZXQuIFRoaXMgYWxsb3dzXG4gICAgLy8gaGVscGVycyB0byBkbyBhIGNoZWNrIGZvciBgaWYgKG9wdGlvbnMuZm4pYFxuICAgIGlmIChwcm9ncmFtIHx8IGludmVyc2UpIHtcbiAgICAgIG9wdGlvbnMuZm4gPSBwcm9ncmFtIHx8ICdjb250YWluZXIubm9vcCc7XG4gICAgICBvcHRpb25zLmludmVyc2UgPSBpbnZlcnNlIHx8ICdjb250YWluZXIubm9vcCc7XG4gICAgfVxuXG4gICAgLy8gVGhlIHBhcmFtZXRlcnMgZ28gb24gdG8gdGhlIHN0YWNrIGluIG9yZGVyIChtYWtpbmcgc3VyZSB0aGF0IHRoZXkgYXJlIGV2YWx1YXRlZCBpbiBvcmRlcilcbiAgICAvLyBzbyB3ZSBuZWVkIHRvIHBvcCB0aGVtIG9mZiB0aGUgc3RhY2sgaW4gcmV2ZXJzZSBvcmRlclxuICAgIGxldCBpID0gcGFyYW1TaXplO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHBhcmFtID0gdGhpcy5wb3BTdGFjaygpO1xuICAgICAgcGFyYW1zW2ldID0gcGFyYW07XG5cbiAgICAgIGlmICh0aGlzLnRyYWNrSWRzKSB7XG4gICAgICAgIGlkc1tpXSA9IHRoaXMucG9wU3RhY2soKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnN0cmluZ1BhcmFtcykge1xuICAgICAgICB0eXBlc1tpXSA9IHRoaXMucG9wU3RhY2soKTtcbiAgICAgICAgY29udGV4dHNbaV0gPSB0aGlzLnBvcFN0YWNrKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9iamVjdEFyZ3MpIHtcbiAgICAgIG9wdGlvbnMuYXJncyA9IHRoaXMuc291cmNlLmdlbmVyYXRlQXJyYXkocGFyYW1zKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy50cmFja0lkcykge1xuICAgICAgb3B0aW9ucy5pZHMgPSB0aGlzLnNvdXJjZS5nZW5lcmF0ZUFycmF5KGlkcyk7XG4gICAgfVxuICAgIGlmICh0aGlzLnN0cmluZ1BhcmFtcykge1xuICAgICAgb3B0aW9ucy50eXBlcyA9IHRoaXMuc291cmNlLmdlbmVyYXRlQXJyYXkodHlwZXMpO1xuICAgICAgb3B0aW9ucy5jb250ZXh0cyA9IHRoaXMuc291cmNlLmdlbmVyYXRlQXJyYXkoY29udGV4dHMpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGF0YSkge1xuICAgICAgb3B0aW9ucy5kYXRhID0gJ2RhdGEnO1xuICAgIH1cbiAgICBpZiAodGhpcy51c2VCbG9ja1BhcmFtcykge1xuICAgICAgb3B0aW9ucy5ibG9ja1BhcmFtcyA9ICdibG9ja1BhcmFtcyc7XG4gICAgfVxuICAgIHJldHVybiBvcHRpb25zO1xuICB9LFxuXG4gIHNldHVwSGVscGVyQXJnczogZnVuY3Rpb24oaGVscGVyLCBwYXJhbVNpemUsIHBhcmFtcywgdXNlUmVnaXN0ZXIpIHtcbiAgICBsZXQgb3B0aW9ucyA9IHRoaXMuc2V0dXBQYXJhbXMoaGVscGVyLCBwYXJhbVNpemUsIHBhcmFtcyk7XG4gICAgb3B0aW9ucy5sb2MgPSBKU09OLnN0cmluZ2lmeSh0aGlzLnNvdXJjZS5jdXJyZW50TG9jYXRpb24pO1xuICAgIG9wdGlvbnMgPSB0aGlzLm9iamVjdExpdGVyYWwob3B0aW9ucyk7XG4gICAgaWYgKHVzZVJlZ2lzdGVyKSB7XG4gICAgICB0aGlzLnVzZVJlZ2lzdGVyKCdvcHRpb25zJyk7XG4gICAgICBwYXJhbXMucHVzaCgnb3B0aW9ucycpO1xuICAgICAgcmV0dXJuIFsnb3B0aW9ucz0nLCBvcHRpb25zXTtcbiAgICB9IGVsc2UgaWYgKHBhcmFtcykge1xuICAgICAgcGFyYW1zLnB1c2gob3B0aW9ucyk7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zO1xuICAgIH1cbiAgfVxufTtcblxuXG4oZnVuY3Rpb24oKSB7XG4gIGNvbnN0IHJlc2VydmVkV29yZHMgPSAoXG4gICAgJ2JyZWFrIGVsc2UgbmV3IHZhcicgK1xuICAgICcgY2FzZSBmaW5hbGx5IHJldHVybiB2b2lkJyArXG4gICAgJyBjYXRjaCBmb3Igc3dpdGNoIHdoaWxlJyArXG4gICAgJyBjb250aW51ZSBmdW5jdGlvbiB0aGlzIHdpdGgnICtcbiAgICAnIGRlZmF1bHQgaWYgdGhyb3cnICtcbiAgICAnIGRlbGV0ZSBpbiB0cnknICtcbiAgICAnIGRvIGluc3RhbmNlb2YgdHlwZW9mJyArXG4gICAgJyBhYnN0cmFjdCBlbnVtIGludCBzaG9ydCcgK1xuICAgICcgYm9vbGVhbiBleHBvcnQgaW50ZXJmYWNlIHN0YXRpYycgK1xuICAgICcgYnl0ZSBleHRlbmRzIGxvbmcgc3VwZXInICtcbiAgICAnIGNoYXIgZmluYWwgbmF0aXZlIHN5bmNocm9uaXplZCcgK1xuICAgICcgY2xhc3MgZmxvYXQgcGFja2FnZSB0aHJvd3MnICtcbiAgICAnIGNvbnN0IGdvdG8gcHJpdmF0ZSB0cmFuc2llbnQnICtcbiAgICAnIGRlYnVnZ2VyIGltcGxlbWVudHMgcHJvdGVjdGVkIHZvbGF0aWxlJyArXG4gICAgJyBkb3VibGUgaW1wb3J0IHB1YmxpYyBsZXQgeWllbGQgYXdhaXQnICtcbiAgICAnIG51bGwgdHJ1ZSBmYWxzZSdcbiAgKS5zcGxpdCgnICcpO1xuXG4gIGNvbnN0IGNvbXBpbGVyV29yZHMgPSBKYXZhU2NyaXB0Q29tcGlsZXIuUkVTRVJWRURfV09SRFMgPSB7fTtcblxuICBmb3IgKGxldCBpID0gMCwgbCA9IHJlc2VydmVkV29yZHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgY29tcGlsZXJXb3Jkc1tyZXNlcnZlZFdvcmRzW2ldXSA9IHRydWU7XG4gIH1cbn0oKSk7XG5cbkphdmFTY3JpcHRDb21waWxlci5pc1ZhbGlkSmF2YVNjcmlwdFZhcmlhYmxlTmFtZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgcmV0dXJuICFKYXZhU2NyaXB0Q29tcGlsZXIuUkVTRVJWRURfV09SRFNbbmFtZV0gJiYgKC9eW2EtekEtWl8kXVswLTlhLXpBLVpfJF0qJC8pLnRlc3QobmFtZSk7XG59O1xuXG5mdW5jdGlvbiBzdHJpY3RMb29rdXAocmVxdWlyZVRlcm1pbmFsLCBjb21waWxlciwgcGFydHMsIHR5cGUpIHtcbiAgbGV0IHN0YWNrID0gY29tcGlsZXIucG9wU3RhY2soKSxcbiAgICAgIGkgPSAwLFxuICAgICAgbGVuID0gcGFydHMubGVuZ3RoO1xuICBpZiAocmVxdWlyZVRlcm1pbmFsKSB7XG4gICAgbGVuLS07XG4gIH1cblxuICBmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgc3RhY2sgPSBjb21waWxlci5uYW1lTG9va3VwKHN0YWNrLCBwYXJ0c1tpXSwgdHlwZSk7XG4gIH1cblxuICBpZiAocmVxdWlyZVRlcm1pbmFsKSB7XG4gICAgcmV0dXJuIFtjb21waWxlci5hbGlhc2FibGUoJ2NvbnRhaW5lci5zdHJpY3QnKSwgJygnLCBzdGFjaywgJywgJywgY29tcGlsZXIucXVvdGVkU3RyaW5nKHBhcnRzW2ldKSwgJywgJywgSlNPTi5zdHJpbmdpZnkoY29tcGlsZXIuc291cmNlLmN1cnJlbnRMb2NhdGlvbiksICcgKSddO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdGFjaztcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBKYXZhU2NyaXB0Q29tcGlsZXI7XG4iXX0=
