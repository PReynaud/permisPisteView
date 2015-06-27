(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars.runtime.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;

var _import = require('./handlebars/base');

var base = _interopRequireWildcard(_import);

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)

var _SafeString = require('./handlebars/safe-string');

var _SafeString2 = _interopRequireWildcard(_SafeString);

var _Exception = require('./handlebars/exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var _import2 = require('./handlebars/utils');

var Utils = _interopRequireWildcard(_import2);

var _import3 = require('./handlebars/runtime');

var runtime = _interopRequireWildcard(_import3);

var _noConflict = require('./handlebars/no-conflict');

var _noConflict2 = _interopRequireWildcard(_noConflict);

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = _SafeString2['default'];
  hb.Exception = _Exception2['default'];
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;

  hb.VM = runtime;
  hb.template = function (spec) {
    return runtime.template(spec, hb);
  };

  return hb;
}

var inst = create();
inst.create = create;

_noConflict2['default'](inst);

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];
},{"./handlebars/base":"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\base.js","./handlebars/exception":"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\exception.js","./handlebars/no-conflict":"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\no-conflict.js","./handlebars/runtime":"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\runtime.js","./handlebars/safe-string":"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\safe-string.js","./handlebars/utils":"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\utils.js"}],"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\base.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;
exports.HandlebarsEnvironment = HandlebarsEnvironment;
exports.createFrame = createFrame;

var _import = require('./utils');

var Utils = _interopRequireWildcard(_import);

var _Exception = require('./exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var VERSION = '3.0.1';
exports.VERSION = VERSION;
var COMPILER_REVISION = 6;

exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1'
};

exports.REVISION_CHANGES = REVISION_CHANGES;
var isArray = Utils.isArray,
    isFunction = Utils.isFunction,
    toString = Utils.toString,
    objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials) {
  this.helpers = helpers || {};
  this.partials = partials || {};

  registerDefaultHelpers(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: logger,
  log: log,

  registerHelper: function registerHelper(name, fn) {
    if (toString.call(name) === objectType) {
      if (fn) {
        throw new _Exception2['default']('Arg not supported with multiple helpers');
      }
      Utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },

  registerPartial: function registerPartial(name, partial) {
    if (toString.call(name) === objectType) {
      Utils.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _Exception2['default']('Attempting to register a partial as undefined');
      }
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  }
};

function registerDefaultHelpers(instance) {
  instance.registerHelper('helperMissing', function () {
    if (arguments.length === 1) {
      // A missing field in a {{foo}} constuct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new _Exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
    }
  });

  instance.registerHelper('blockHelperMissing', function (context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if (context === true) {
      return fn(this);
    } else if (context === false || context == null) {
      return inverse(this);
    } else if (isArray(context)) {
      if (context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = createFrame(options.data);
        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
        options = { data: data };
      }

      return fn(context, options);
    }
  });

  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new _Exception2['default']('Must pass iterator to #each');
    }

    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data = undefined,
        contextPath = undefined;

    if (options.data && options.ids) {
      contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = createFrame(options.data);
    }

    function execIteration(field, index, last) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret = ret + fn(context[field], {
        data: data,
        blockParams: Utils.blockParams([context[field], field], [contextPath + field, null])
      });
    }

    if (context && typeof context === 'object') {
      if (isArray(context)) {
        for (var j = context.length; i < j; i++) {
          execIteration(i, i, i === context.length - 1);
        }
      } else {
        var priorKey = undefined;

        for (var key in context) {
          if (context.hasOwnProperty(key)) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey) {
              execIteration(priorKey, i - 1);
            }
            priorKey = key;
            i++;
          }
        }
        if (priorKey) {
          execIteration(priorKey, i - 1, true);
        }
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });

  instance.registerHelper('if', function (conditional, options) {
    if (isFunction(conditional)) {
      conditional = conditional.call(this);
    }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if (!options.hash.includeZero && !conditional || Utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function (conditional, options) {
    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
  });

  instance.registerHelper('with', function (context, options) {
    if (isFunction(context)) {
      context = context.call(this);
    }

    var fn = options.fn;

    if (!Utils.isEmpty(context)) {
      if (options.data && options.ids) {
        var data = createFrame(options.data);
        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
        options = { data: data };
      }

      return fn(context, options);
    } else {
      return options.inverse(this);
    }
  });

  instance.registerHelper('log', function (message, options) {
    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    instance.log(level, message);
  });

  instance.registerHelper('lookup', function (obj, field) {
    return obj && obj[field];
  });
}

var logger = {
  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

  // State enum
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  level: 1,

  // Can be overridden in the host environment
  log: function log(level, message) {
    if (typeof console !== 'undefined' && logger.level <= level) {
      var method = logger.methodMap[level];
      (console[method] || console.log).call(console, message); // eslint-disable-line no-console
    }
  }
};

exports.logger = logger;
var log = logger.log;

exports.log = log;

function createFrame(object) {
  var frame = Utils.extend({}, object);
  frame._parent = object;
  return frame;
}

/* [args, ]options */
},{"./exception":"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\exception.js","./utils":"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\utils.js"}],"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\exception.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var loc = node && node.loc,
      line = undefined,
      column = undefined;
  if (loc) {
    line = loc.start.line;
    column = loc.start.column;

    message += ' - ' + line + ':' + column;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, Exception);
  }

  if (loc) {
    this.lineNumber = line;
    this.column = column;
  }
}

Exception.prototype = new Error();

exports['default'] = Exception;
module.exports = exports['default'];
},{}],"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\no-conflict.js":[function(require,module,exports){
(function (global){
'use strict';

exports.__esModule = true;
/*global window */

exports['default'] = function (Handlebars) {
  /* istanbul ignore next */
  var root = typeof global !== 'undefined' ? global : window,
      $Handlebars = root.Handlebars;
  /* istanbul ignore next */
  Handlebars.noConflict = function () {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }
  };
};

module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\runtime.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;
exports.checkRevision = checkRevision;

// TODO: Remove this line and break up compilePartial

exports.template = template;
exports.wrapProgram = wrapProgram;
exports.resolvePartial = resolvePartial;
exports.invokePartial = invokePartial;
exports.noop = noop;

var _import = require('./utils');

var Utils = _interopRequireWildcard(_import);

var _Exception = require('./exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var _COMPILER_REVISION$REVISION_CHANGES$createFrame = require('./base');

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = _COMPILER_REVISION$REVISION_CHANGES$createFrame.COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[currentRevision],
          compilerVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[compilerRevision];
      throw new _Exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new _Exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
    }
  }
}

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new _Exception2['default']('No environment passed to template');
  }
  if (!templateSpec || !templateSpec.main) {
    throw new _Exception2['default']('Unknown template object: ' + typeof templateSpec);
  }

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  function invokePartialWrapper(partial, context, options) {
    if (options.hash) {
      context = Utils.extend({}, context, options.hash);
    }

    partial = env.VM.resolvePartial.call(this, partial, context, options);
    var result = env.VM.invokePartial.call(this, partial, context, options);

    if (result == null && env.compile) {
      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
      result = options.partials[options.name](context, options);
    }
    if (result != null) {
      if (options.indent) {
        var lines = result.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (!lines[i] && i + 1 === l) {
            break;
          }

          lines[i] = options.indent + lines[i];
        }
        result = lines.join('\n');
      }
      return result;
    } else {
      throw new _Exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
    }
  }

  // Just add water
  var container = {
    strict: function strict(obj, name) {
      if (!(name in obj)) {
        throw new _Exception2['default']('"' + name + '" not defined in ' + obj);
      }
      return obj[name];
    },
    lookup: function lookup(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        if (depths[i] && depths[i][name] != null) {
          return depths[i][name];
        }
      }
    },
    lambda: function lambda(current, context) {
      return typeof current === 'function' ? current.call(context) : current;
    },

    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function fn(i) {
      return templateSpec[i];
    },

    programs: [],
    program: function program(i, data, declaredBlockParams, blockParams, depths) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if (data || depths || blockParams || declaredBlockParams) {
        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
      }
      return programWrapper;
    },

    data: function data(value, depth) {
      while (value && depth--) {
        value = value._parent;
      }
      return value;
    },
    merge: function merge(param, common) {
      var obj = param || common;

      if (param && common && param !== common) {
        obj = Utils.extend({}, common, param);
      }

      return obj;
    },

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  function ret(context) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths = undefined,
        blockParams = templateSpec.useBlockParams ? [] : undefined;
    if (templateSpec.useDepths) {
      depths = options.depths ? [context].concat(options.depths) : [context];
    }

    return templateSpec.main.call(container, context, container.helpers, container.partials, data, blockParams, depths);
  }
  ret.isTop = true;

  ret._setup = function (options) {
    if (!options.partial) {
      container.helpers = container.merge(options.helpers, env.helpers);

      if (templateSpec.usePartial) {
        container.partials = container.merge(options.partials, env.partials);
      }
    } else {
      container.helpers = options.helpers;
      container.partials = options.partials;
    }
  };

  ret._child = function (i, data, blockParams, depths) {
    if (templateSpec.useBlockParams && !blockParams) {
      throw new _Exception2['default']('must pass block params');
    }
    if (templateSpec.useDepths && !depths) {
      throw new _Exception2['default']('must pass parent depths');
    }

    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
  };
  return ret;
}

function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
  function prog(context) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    return fn.call(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), depths && [context].concat(depths));
  }
  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  prog.blockParams = declaredBlockParams || 0;
  return prog;
}

function resolvePartial(partial, context, options) {
  if (!partial) {
    partial = options.partials[options.name];
  } else if (!partial.call && !options.name) {
    // This is a dynamic partial that returned a string
    options.name = partial;
    partial = options.partials[partial];
  }
  return partial;
}

function invokePartial(partial, context, options) {
  options.partial = true;

  if (partial === undefined) {
    throw new _Exception2['default']('The partial ' + options.name + ' could not be found');
  } else if (partial instanceof Function) {
    return partial(context, options);
  }
}

function noop() {
  return '';
}

function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? _COMPILER_REVISION$REVISION_CHANGES$createFrame.createFrame(data) : {};
    data.root = context;
  }
  return data;
}
},{"./base":"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\base.js","./exception":"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\exception.js","./utils":"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\utils.js"}],"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\safe-string.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
  return '' + this.string;
};

exports['default'] = SafeString;
module.exports = exports['default'];
},{}],"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars\\utils.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.extend = extend;

// Older IE versions do not directly support indexOf so we must implement our own, sadly.
exports.indexOf = indexOf;
exports.escapeExpression = escapeExpression;
exports.isEmpty = isEmpty;
exports.blockParams = blockParams;
exports.appendContextPath = appendContextPath;
var escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#x27;',
  '`': '&#x60;'
};

var badChars = /[&<>"'`]/g,
    possible = /[&<>"'`]/;

function escapeChar(chr) {
  return escape[chr];
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

var toString = Object.prototype.toString;

exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/*eslint-disable func-style, no-var */
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
/* istanbul ignore next */
if (isFunction(/x/)) {
  exports.isFunction = isFunction = function (value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
var isFunction;
exports.isFunction = isFunction;
/*eslint-enable func-style, no-var */

/* istanbul ignore next */
var isArray = Array.isArray || function (value) {
  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
};exports.isArray = isArray;

function indexOf(array, value) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
}

function escapeExpression(string) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}
},{}],"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\runtime.js":[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime')['default'];

},{"./dist/cjs/handlebars.runtime":"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\dist\\cjs\\handlebars.runtime.js"}],"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js":[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":"c:\\dev\\PermisPisteView\\node_modules\\handlebars\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Actions\\Action.js":[function(require,module,exports){
var config = require('../../configuration.js');

var ActionsModel = Backbone.Model.extend({
	urlRoot: config.url + 'Action/'
});
module.exports = ActionsModel;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Actions\\ActionsList.js":[function(require,module,exports){
var config = require('../../configuration.js');
var ActionsModel = require('./Action');

var ActionsCollection = Backbone.Collection.extend({
	model: ActionsModel,
	url: config.url + 'Action/'
});

 module.exports = ActionsCollection;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js","./Action":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Actions\\Action.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Apprenants\\Apprenant.js":[function(require,module,exports){
var config = require('../../configuration.js');

var ApprenantsModel = Backbone.Model.extend({
	urlRoot: config.url + 'Apprenant/'
});

module.exports = ApprenantsModel;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Apprenants\\ApprenantsList.js":[function(require,module,exports){
var config = require('../../configuration.js');
var ApprenantsModel = require('./Apprenant');

var ApprenantsCollection = Backbone.Collection.extend({
	model: ApprenantsModel,
	url: config.url + 'Apprenant/'
});

 module.exports = ApprenantsCollection;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js","./Apprenant":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Apprenants\\Apprenant.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Est_associe\\Est_associe.js":[function(require,module,exports){
var config = require('../../configuration.js');

var Est_associeModel = Backbone.Model.extend({
	urlRoot: config.url + 'EstAssocie/'
});

module.exports = Est_associeModel;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Evaluation\\Evaluation.js":[function(require,module,exports){
var config = require('../../configuration.js');

var EvaluationModel = Backbone.Model.extend({
});

module.exports = EvaluationModel;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Fixe\\Fixe.js":[function(require,module,exports){
var config = require('../../configuration.js');

var FixeModel = Backbone.Model.extend({
	urlRoot: config.url + 'Mission/'
});

module.exports = FixeModel;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Fixe\\Fixe2.js":[function(require,module,exports){
var config = require('../../configuration.js');

var FixeModel = Backbone.Model.extend({
	urlRoot: config.url + 'Fixe/'
});

module.exports = FixeModel;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Indicateurs\\Indicateur.js":[function(require,module,exports){
var config = require('../../configuration.js');

var IndicateursModel = Backbone.Model.extend({
	urlRoot: config.url + 'Indicateur/'
});
module.exports = IndicateursModel;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Indicateurs\\IndicateursList.js":[function(require,module,exports){
var config = require('../../configuration.js');
var IndicateursModel = require('./Indicateur');

var IndicateursCollection = Backbone.Collection.extend({
	model: IndicateursModel,
	url: config.url + 'Indicateur/'
});

 module.exports = IndicateursCollection;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js","./Indicateur":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Indicateurs\\Indicateur.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Jeux\\Jeu.js":[function(require,module,exports){
var config = require('../../configuration.js');

var JeuxModel = Backbone.Model.extend({
	urlRoot: config.url + 'Jeu/'
});
module.exports = JeuxModel;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Jeux\\JeuxList.js":[function(require,module,exports){
var config = require('../../configuration.js');
var JeuxModel = require('./Jeu');

var JeuxCollection = Backbone.Collection.extend({
	model: JeuxModel,
	url: config.url + 'Jeu/'
});

 module.exports = JeuxCollection;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js","./Jeu":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Jeux\\Jeu.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Missions\\Mission.js":[function(require,module,exports){
var config = require('../../configuration.js');

var MissionsModel = Backbone.Model.extend({
	urlRoot: config.url+ 'Mission/'
});
module.exports = MissionsModel;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Objectifs\\Objectif.js":[function(require,module,exports){
var config = require('../../configuration.js');

var ObjectifsModel = Backbone.Model.extend({
	urlRoot: config.url + 'Objectif/'
});
module.exports = ObjectifsModel;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Objectifs\\ObjectifMission.js":[function(require,module,exports){
var config = require('../../configuration.js');
var ObjectifsModel = require('./Objectif');

var ObjectifMissionCollection = Backbone.Collection.extend({
	model: ObjectifsModel,
	url: config.url
});
module.exports = ObjectifMissionCollection;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js","./Objectif":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Objectifs\\Objectif.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Objectifs\\ObjectifsList.js":[function(require,module,exports){
var config = require('../../configuration.js');
var ObjectifsModel = require('./Objectif');

var ObjectifsCollection = Backbone.Collection.extend({
	model: ObjectifsModel,
	url: config.url + 'Objectif/'
});

 module.exports = ObjectifsCollection;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js","./Objectif":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Objectifs\\Objectif.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Possede\\Possede.js":[function(require,module,exports){
var config = require('../../configuration.js');

var PossedeModel = Backbone.Model.extend({
	urlRoot: config.url + 'Possede/'
});

module.exports = PossedeModel;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Regles\\Regle.js":[function(require,module,exports){
var config = require('../../configuration.js');

var ReglesModel = Backbone.Model.extend({
	urlRoot: config.url + 'Regle/'/*,
	url: config.url + 'Regle/'*/
});
module.exports = ReglesModel;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js"}],"c:\\dev\\PermisPisteView\\src\\js\\Model\\Regles\\ReglesList.js":[function(require,module,exports){
var config = require('../../configuration.js');
var ReglesModel = require('./Regle');

var ReglesCollection = Backbone.Collection.extend({
	model: ReglesModel,
	url: config.url + 'Regle/'
});

 module.exports = ReglesCollection;
},{"../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js","./Regle":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Regles\\Regle.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Accueil\\Accueil.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"jumbotron\">\r\n	<p>Bienvenue sur l'application d'évaluation des apprentis pilote.</p>\r\n	<p><a href=\"#Apprenants\">Commencez à évaluer un apprenant.</a></p>\r\n	<p>Vous pouvez également modifier les jeux d'évaluation et leurs sous éléments.</p>\r\n	<p><i>\"Fly safe !\"</i> Scott Manley</p>\r\n</div>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Accueil\\Accueil.js":[function(require,module,exports){
var template = require("./Accueil.hbs");



module.exports = Backbone.View.extend({
	content : $('#content'),
	title : $('#title'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		$(this.title).html("Projet permis piste");
		$(this.content).html(template());
	}
});
},{"./Accueil.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Accueil\\Accueil.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\Action.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "						<table class=\"table\" id=\"tabRegle\">\r\n							<thead>\r\n								<tr>\r\n									<th>Identifiant</th>\r\n									<th>Libellé</th>\r\n									<th></th>\r\n								</tr>\r\n							</thead>\r\n							<tbody>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.regles : depth0),{"name":"each","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "							</tbody>\r\n						</table>\r\n";
},"2":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "									<tr onClick=\"document.location='#Regles/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numregle : stack1), depth0))
    + "'\">\r\n										<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numregle : stack1), depth0))
    + "</td><td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.libregle : stack1), depth0))
    + "</td>\r\n									</tr>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<table class=\"table\">\r\n	<thead>\r\n		<tr>\r\n			<th>Identifiant</th>\r\n			<th>ID Action Requise</th>\r\n			<th>Libellé Action</th>\r\n			<th>Score min</th>\r\n			<th>Regles</th>\r\n			<th></th>\r\n		</tr>\r\n	</thead>\r\n	<tbody>\r\n			<tr>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.numaction : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.actNumaction : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.libaction : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.scoremin : stack1), depth0))
    + "</td>\r\n				<td>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.regles : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "				</td>\r\n				<td>\r\n					<a href=\"#Actions/Modifier/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.numaction : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n					</a>\r\n					<a href=\"#Actions/Supprimer/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.numaction : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n					</a>\r\n				</td>\r\n			</tr>\r\n	</tbody>\r\n</table>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\Action.js":[function(require,module,exports){
var actionModel = require('../../Model/Actions/Action');
var regleModel = require('../../Model/Regles/Regle');
var template = require('./Action.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		var model = new regleModel();
		model.url = model.urlRoot+'/Action/'+id;

		$.when( new actionModel({"id":id}).fetch(),model.fetch())
		.done(_.bind(function(objectif,actions){
			this.renderResultat(objectif,actions);
		},this));
		$(this.pageName).html("Détail Action");
		$(this.title).html("Informations Action");
	},

	renderResultat: function(response, responseRegles){

		// Refactoring list des règle pour que ça soit plus lisible
		var Regle = Backbone.Model.extend({
	  	});
		var CollectionRegle = Backbone.Collection.extend({
		  model: Regle
		});
		var count = 0;
		var listRegle = new CollectionRegle();
		for (var i = 0; i <  responseRegles[0].length; i++) {
			var regle = new Regle(responseRegles[0][i][0]);
			listRegle.add([regle]);
			count++;
		}

		// Passe les élément à la vue
		if(count !==0 ){
			$(this.content).html(template({action: response[0], regles:listRegle.models}));
		}else{
			$(this.content).html(template({action: response[0]}));
		}
	}
});

module.exports = view;
},{"../../Model/Actions/Action":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Actions\\Action.js","../../Model/Regles/Regle":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Regles\\Regle.js","./Action.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\Action.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\Actions.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "			<tr onClick=\"document.location='#Actions/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numaction : stack1), depth0))
    + "'\">\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numaction : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.actNumaction : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.libaction : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.scoremin : stack1), depth0))
    + "</td>\r\n				<td>\r\n					<a href=\"#Actions/Modifier/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numaction : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n					</a>\r\n					<a href=\"#Actions/Supprimer/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numaction : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n					</a>\r\n				</td>\r\n			</tr>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<a href=\"#Actions/Ajout\">\r\n	<button type=\"button\" class=\"btn btn-success\">\r\n	  <span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span> Ajouter Action\r\n	</button>\r\n</a>\r\n\r\n<table class=\"table\">\r\n	<thead>\r\n		<tr>\r\n			<th>Identifiant</th>\r\n			<th>ID action requise</th>\r\n			<th>Libellé</th>\r\n			<th>Score minimal</th>\r\n			<th></th>\r\n		</tr>\r\n	</thead>\r\n	<tbody>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.actions : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "	</tbody>\r\n</table>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\Actions.js":[function(require,module,exports){
var actionsModel = require('../../Model/Actions/ActionsList');
var template = require('./Actions.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		var model = new actionsModel().fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Liste des Actions");
		$(this.title).html("Liste des Actions");
	},

	renderResultat: function(response){
		$(this.content).html(template({actions: response.toArray()}));
	}
});

module.exports = view;
},{"../../Model/Actions/ActionsList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Actions\\ActionsList.js","./Actions.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\Actions.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\DeleteAction.js":[function(require,module,exports){
var actionModel = require('../../Model/Actions/Action');
var possedeModel = require('../../Model/Possede/Possede');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	render: function(id){
		var model = new actionModel({"id":id}).fetch({
			success: _.bind(this.confirm,this)
		});

	},

	renderPossede: function(id,iRegle){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new possedeModel({"numaction":id, "numregle":iRegle}).destroy({
				success: _.bind(this.valid,this),
				error: _.bind(this.showErrorModal,this)
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Actions/Modifier/'+id, {trigger:true});
		},this));
	},

	confirm:function(action){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new actionModel({"id":action.id}).destroy({
				success: _.bind(this.valid,this),
				error: _.bind(this.showErrorModal,this)
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Actions', {trigger:true});
		},this));
	},

	valid:function(){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Suppression effecuée"
		});
		
		$('.modal-backdrop').remove();
			Backbone.history.navigate('#Actions', {trigger:true});
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.showModal();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de la suppression : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view;
},{"../../Model/Actions/Action":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Actions\\Action.js","../../Model/Possede/Possede":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Possede\\Possede.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\PutAction.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "        <option value="
    + alias3(((helper = (helper = helpers.numaction || (depth0 != null ? depth0.numaction : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numaction","hash":{},"data":data}) : helper)))
    + ">"
    + alias3(((helper = (helper = helpers.numaction || (depth0 != null ? depth0.numaction : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numaction","hash":{},"data":data}) : helper)))
    + " "
    + alias3(((helper = (helper = helpers.libaction || (depth0 != null ? depth0.libaction : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"libaction","hash":{},"data":data}) : helper)))
    + "</option>\r\n";
},"3":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "      <tr>\r\n        <td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numregle : stack1), depth0))
    + "</td><td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.libregle : stack1), depth0))
    + "</td><td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.scoremin : stack1), depth0))
    + "</td>\r\n        <td><a href=\"#Regles/Modifier/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numregle : stack1), depth0))
    + "\">\r\n            <span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n          </a>\r\n      </td>\r\n        <td><a href=\"#Actions/Modifier/"
    + alias2(alias1(((stack1 = (depths[1] != null ? depths[1].action : depths[1])) != null ? stack1.numaction : stack1), depth0))
    + "/Regle/Supprimer/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numregle : stack1), depth0))
    + "\">\r\n              <span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n            </a>\r\n        </td>\r\n      </tr>\r\n";
},"5":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "          <option value="
    + alias3(((helper = (helper = helpers.numregle || (depth0 != null ? depth0.numregle : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numregle","hash":{},"data":data}) : helper)))
    + ">"
    + alias3(((helper = (helper = helpers.numregle || (depth0 != null ? depth0.numregle : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numregle","hash":{},"data":data}) : helper)))
    + " "
    + alias3(((helper = (helper = helpers.libregle || (depth0 != null ? depth0.libregle : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"libregle","hash":{},"data":data}) : helper)))
    + "</option>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "  <form id=\"formPutAction\" method=\"post\">\r\n  <div class=\"form-group\">\r\n   <label for=\"actNumaction\">Action requise</label>\r\n    <select  class=\"form-control\" id=\"actNumaction\">\r\n      <option value=null> Aucun </option>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.actions : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </select>\r\n  </div>\r\n  <div class=\"form-group\">\r\n    <label for=\"libaction\">libaction</label>\r\n    <input type=\"text\" class=\"form-control\" id=\"libaction\" placeholder=\"Entrez un libellé\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.libaction : stack1), depth0))
    + "\" required>\r\n  </div>\r\n  <div class=\"form-group\">\r\n    <label for=\"scoremin\">scoremin</label>\r\n    <input type=\"number\" class=\"form-control\" id=\"scoremin\" placeholder=\"Entrez un score minimum\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.action : depth0)) != null ? stack1.scoremin : stack1), depth0))
    + "\" required>\r\n  </div> \r\n  <button class=\"btn btn-default\">Valider</button>\r\n  </form>\r\n\r\n  <hr>\r\n\r\n  <label for=\"numregle\">Liste des règles de l'action</label>\r\n  <table class=\"table\" id=\"tabRegle\">\r\n    <thead>\r\n      <tr>\r\n        <th>Identifiant</th>\r\n        <th>Libellé</th>\r\n        <th>Score minimum</th>\r\n        <th></th>\r\n      </tr>\r\n    </thead>\r\n    <tbody>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.regles : depth0),{"name":"each","hash":{},"fn":this.program(3, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </tbody>\r\n  </table>\r\n  <form id=\"formPutRegle\" method=\"post\">\r\n    <div class=\"form-group\">\r\n     <label for=\"numregle\">Ajouter une Règle</label>\r\n      <select  class=\"form-control\" id=\"numregle\">\r\n        <option value=null> Aucun </option>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.reglesTot : depth0),{"name":"each","hash":{},"fn":this.program(5, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "      </select>\r\n    </div>\r\n    <button class=\"btn btn-default\">Ajouter</button>\r\n  </form>";
},"useData":true,"useDepths":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\PutAction.js":[function(require,module,exports){
var actionModel = require('../../Model/Actions/Action');
var actionsModel = require('../../Model/Actions/ActionsList');
var reglesModel = require('../../Model/Regles/ReglesList');
var regleModel = require('../../Model/Regles/Regle');
var possedeModel = require('../../Model/Possede/Possede');
var template = require('./PutAction.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formPutAction'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		$.when(new actionsModel().fetch())
		.done(_.bind(function(actions){
			this.renderResultat(actions);
		},this));
		this.$pageName.html("Ajout Action");
		this.$title.html("Ajouter une Action");
	},

	renderModif: function(id){
		var modelRegles = new reglesModel();
		var model = new regleModel();
		model.url = model.urlRoot+'/Action/'+id;
		
		$.when(new actionsModel().fetch(),modelRegles.fetch(),model.fetch(),new actionModel({"id":id}).fetch())
		.done(_.bind(function(actions,reglesTot,regles,action){
			this.renderResultat(actions,reglesTot,regles,action);
		},this));
		this.$pageName.html("Modifier Action");
		this.$title.html("Modifier une Action");
		this.idAction=id;
	},

	valid: function(e){
		var actNumaction = $('#actNumaction').val();
		var libaction = $('#libaction').val();
		var scoremin = $('#scoremin').val();

		var model = new actionModel();
		if (this.idAction===undefined){
			model.save({"actNumaction":actNumaction, "libaction":libaction, "scoremin":scoremin}, {
				success: this.showModal("Ajout"),
				error: _.bind(this.showErrorModal,this)
			});
		}
		else{
			model.save({"numaction":this.idAction, "actNumaction":actNumaction, "libaction":libaction, "scoremin":scoremin}, {
				success: this.showModal("Modifier"),
				error: _.bind(this.showErrorModal,this)
			});
		} 
		return true;
	},

	validRegle: function(e){
		var numregle = $('#numregle').val();
		var model =  new possedeModel();
		model.save({"numaction":this.idAction, "numregle":numregle}, {
			success: this.showModal,
			error: _.bind(this.showErrorModal,this)
		});
		return true;
	},

	renderResultat: function(responseList, responseListRegleTot, responseListRegle, response){
		if(response===undefined){
			this.actionType = 'Ajout';
			this.$content.html(template({actions:responseList}));
		}else{
			this.actionType = 'Modifier';

			// Enleve l'id courrant de la liste
			for(var i = 0; i <responseList[0].length; i++) {
	      		if(responseList[0][i].numaction === response[0].numaction) {
			         responseList[0].splice(i, 1);
			    }
		  	}

		  	// Refactoring list des règle pour que ça soit plus lisible
			var Regle = Backbone.Model.extend({
		  	});
			var CollectionRegle = Backbone.Collection.extend({
			  model: Regle
			});
			var count = 0;
			var listRegle = new CollectionRegle();
			for (var i = 0; i <  responseListRegle[0].length; i++) {
				var regle = new Regle(responseListRegle[0][i][0]);
				listRegle.add([regle]);
				count++;
			}
			console.log(responseListRegleTot[0]);
			this.$content.html(template({action: response[0], actions: responseList[0],regles: listRegle.models,reglesTot: responseListRegleTot[0]}));
			$("#actNumaction option[value='"+response[0].actNumaction+"']").attr("selected", "selected");
		}
		$('#formPutAction').submit(_.bind(function(event){
		    this.valid();
		}, this));

		$('#formPutRegle').submit(_.bind(function(event){
		    this.validRegle();
		}, this));
	},

	showModal: function(){
		var ArticleModalBody = "La";
		if(this.actionType === "Ajout"){
			ArticleModalBody = "L'";
		}
		var modalView = new modal({
			modalTitle: this.actionType,
		 	modalBody: ArticleModalBody+" "+this.actionType+" a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Actions', {trigger:true});
		window.location.reload();
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.showModal();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de l'ajout : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view;
},{"../../Model/Actions/Action":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Actions\\Action.js","../../Model/Actions/ActionsList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Actions\\ActionsList.js","../../Model/Possede/Possede":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Possede\\Possede.js","../../Model/Regles/Regle":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Regles\\Regle.js","../../Model/Regles/ReglesList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Regles\\ReglesList.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js","./PutAction.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\PutAction.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\RouterActions.js":[function(require,module,exports){
var Actions = require('./Actions');
var Action = require('./Action');
var PutAction = require('./PutAction');
var DeleteAction = require('./DeleteAction');

var Router = Backbone.Router.extend({
	routes: {
		"Actions": "Actions",
		"Actions/Ajout": "AjoutAction",
		"Actions/Modifier/:id": "ModifAction",
		"Actions/Supprimer/:id": "SupprAction",
		"Actions/:id": "Action",
		"Actions/Modifier/:id/Regle/Supprimer/:idRegle": "SupprActionRegle",
	},

	initialize: function(){

	},

	Actions: function(){
		this.actions = new Actions();
		this.actions.render();
	},

	Action: function(id){
		this.actions = new Action();
		this.actions.render(id);
	},

	AjoutAction: function(){
		this._action = new PutAction();
		this._action.render();
	},

	ModifAction: function(id){
		this._action = new PutAction();
		this._action.renderModif(id);
	},

	SupprAction: function(id){
		this._action = new DeleteAction();
		this._action.render(id);
	},

	SupprActionRegle: function(id, idRegle){
		this._action = new DeleteAction();
		this._action.renderPossede(id,idRegle);
	}
});

module.exports = Router;
},{"./Action":"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\Action.js","./Actions":"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\Actions.js","./DeleteAction":"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\DeleteAction.js","./PutAction":"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\PutAction.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\Apprenant.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<table class=\"table\">\r\n	<thead>\r\n		<tr>\r\n			<th>Identifiant</th>\r\n			<th>Nom</th>\r\n			<th>Prenom</th>\r\n		</tr>\r\n	</thead>\r\n	<tbody>\r\n			<tr>\r\n				<td>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.apprenant : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.numapprenant : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.apprenant : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.nomapprenant : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.apprenant : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.prenomapprenant : stack1), depth0))
    + "</td>\r\n			</tr>\r\n	</tbody>\r\n</table>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\Apprenant.js":[function(require,module,exports){
var apprenantModel = require('../../Model/Apprenants/Apprenant');
var template = require('./Apprenant.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		var model = new apprenantModel({"id":id}).fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Détail Apprenant");
		$(this.title).html("Informations Apprenant");
	},

	renderResultat: function(apprenant){
		$(this.content).html(template({apprenant}));
	}
});

module.exports = view;
},{"../../Model/Apprenants/Apprenant":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Apprenants\\Apprenant.js","./Apprenant.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\Apprenant.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\Apprenants.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "			<tr onClick=\"document.location='#Apprenants/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numapprenant : stack1), depth0))
    + "'\">\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numapprenant : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.nomapprenant : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.prenomapprenant : stack1), depth0))
    + "</td>\r\n				<td>\r\n					<a href=\"#Evaluation\">\r\n						<span class=\"glyphicon glyphicon-screenshot\" aria-hidden=\"true\"></span>\r\n					</a>\r\n				</td>\r\n				<td>\r\n					<a href=\"#Apprenants/Modifier/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numapprenant : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n					</a>\r\n					<a href=\"#Apprenants/Supprimer/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numapprenant : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n					</a>\r\n				</td>\r\n			</tr>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<a href=\"#Apprenants/Ajout\">\r\n	<button type=\"button\" class=\"btn btn-success\">\r\n	  <span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span> Ajouter Apprenant\r\n	</button>\r\n</a>\r\n\r\n<table class=\"table\">\r\n	<thead>\r\n		<tr>\r\n			<th>Identifiant</th>\r\n			<th>Nom</th>\r\n			<th>Prenom</th>\r\n			<th>Evaluation</th>\r\n			<th></th>\r\n		</tr>\r\n	</thead>\r\n	<tbody>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.apprenants : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "	</tbody>\r\n</table>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\Apprenants.js":[function(require,module,exports){
var apprenantsModel = require('../../Model/Apprenants/ApprenantsList');
var template = require('./Apprenants.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		var model = new apprenantsModel().fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Liste des Apprenants");
		$(this.title).html("Liste des Apprenants");
	},

	renderResultat: function(response){
		$(this.content).html(template({apprenants: response.toArray()}));
	}
});

module.exports = view;
},{"../../Model/Apprenants/ApprenantsList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Apprenants\\ApprenantsList.js","./Apprenants.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\Apprenants.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\DeleteApprenant.js":[function(require,module,exports){
var apprenantModel = require('../../Model/Apprenants/Apprenant');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	render: function(id){
		var model = new apprenantModel({"id":id}).fetch({
			success: _.bind(this.confirm,this),
			error: _.bind(this.showErrorModal,this)
		});

	},

	confirm:function(apprenant){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new apprenantModel({"id":apprenant.id}).destroy({
				success: _.bind(this.valid,this),
				error: _.bind(this.showErrorModal,this)
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Apprenants', {trigger:true});
		},this));
	},

	valid:function(){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Suppression effecuée"
		});
		$('.modal-backdrop').remove();
		Backbone.history.navigate('#Apprenants', {trigger:true});
		Backbone.history.stop(); 
		Backbone.history.start();
	},

	showModal: function(missionType){
		var ArticleModalBody = "La";
		if(missionType === "Ajout"){
			ArticleModalBody = "L'";
		}
		var modalView = new modal({
			modalTitle: missionType,
		 	modalBody: ArticleModalBody+" "+missionType+" a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Apprenants', {trigger:true});
		window.location.reload();
	},

	showErrorModal: function(object,error){
		if (error.status==201 || error.status==200){
			this.valid();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de la suppression : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view;
},{"../../Model/Apprenants/Apprenant":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Apprenants\\Apprenant.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\PutApprenant.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return " <form id=\"formPutApprenant\" method=\"post\">\r\n  <div class=\"form-group\">\r\n    <label for=\"nomapprenant\">Nom</label>\r\n    <input type=\"text\" class=\"form-control\" id=\"nomapprenant\" placeholder=\"Entrez un nom\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.apprenti : depth0)) != null ? stack1.nomapprenant : stack1), depth0))
    + "\" required>\r\n  </div>\r\n  <div class=\"form-group\">\r\n    <label for=\"prenomapprenant\">Prénom</label>\r\n    <input type=\"text\" class=\"form-control\" id=\"prenomapprenant\" placeholder=\"Entrez un prénom\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.apprenti : depth0)) != null ? stack1.prenomapprenant : stack1), depth0))
    + "\" required>\r\n  </div>\r\n  <button class=\"btn btn-default\">Valider</button>\r\n</form>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\PutApprenant.js":[function(require,module,exports){
var apprenantModel = require('../../Model/Apprenants/Apprenant');
var template = require('./PutApprenant.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formPutApprenant'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		this.renderResultat(undefined);
		this.$pageName.html("Ajout Apprenant");
		this.$title.html("Ajouter un Apprenant");
	},

	renderModif: function(id){
		$.when(new apprenantModel({"id":id}).fetch())
		.done(_.bind(function(apprenant){
			this.renderResultat(apprenant);
		},this));		
		this.$pageName.html("Modifier Apprenant");
		this.$title.html("Modifier un Apprenant");
		this.idApprenant=id;
	},

	valid: function(e){
		var nomapprenant = $('#nomapprenant').val();
		var prenomapprenant = $('#prenomapprenant').val();

		var model = new apprenantModel();
		if (this.idApprenant===undefined){
			this.missionType = 'Ajout';
			model.save({"nomapprenant":nomapprenant, "prenomapprenant":prenomapprenant}, {
				success: this.showModal(),
				error: _.bind(this.showErrorModal,this)
			});
		}
		else{
			this.missionType = 'Modifier';
			model.save({"numapprenant":this.idApprenant, "nomapprenant":nomapprenant, "prenomapprenant":prenomapprenant}, {
				success: this.showModal(),
				error: _.bind(this.showErrorModal,this)
			});
		} 
		return true;
	},

	renderResultat: function(response){
		if(response===undefined){
			this.$content.html(template());
		}else{
			this.$content.html(template({apprenti: response}));
		}

		$('#formPutApprenant').submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	showModal: function(){
		var ArticleModalBody = "La";
		if(this.missionType === "Ajout"){
			ArticleModalBody = "L'";
		}
		var modalView = new modal({
			modalTitle: this.missionType,
		 	modalBody: ArticleModalBody+" "+this.missionType+" a été effectué avec succès"
		});
		Backbone.history.navigate('#Apprenants', {trigger:true});
		window.location.reload();
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.showModal();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de l'ajout : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view;
},{"../../Model/Apprenants/Apprenant":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Apprenants\\Apprenant.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js","./PutApprenant.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\PutApprenant.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\RouterApprenants.js":[function(require,module,exports){
var Apprenants = require('./Apprenants');
var Apprenant = require('./Apprenant');
var PutApprenant = require('./PutApprenant');
var DeleteApprenant = require('./DeleteApprenant');

var Router = Backbone.Router.extend({
	routes: {
		"Apprenants": "Apprenants",
		"Apprenants/Ajout": "AjoutApprenant",
		"Apprenants/Modifier/:id": "ModifApprenant",
		"Apprenants/Supprimer/:id": "SupprApprenant",
		"Apprenants/:id": "Apprenant",
	},

	initialize: function(){

	},

	Apprenants: function(){
		this.Apprenants = new Apprenants();
		this.Apprenants.render();
	},

	Apprenant: function(id){
		this.Apprenant = new Apprenant();
		this.Apprenant.render(id);
	},

	AjoutApprenant: function(){
		this.Apprenant = new PutApprenant();
		this.Apprenant.render();
	},

	ModifApprenant: function(id){
		this.Apprenant = new PutApprenant();
		this.Apprenant.renderModif(id);
	},

	SupprApprenant: function(id){
		this.Apprenant = new DeleteApprenant();
		this.Apprenant.render(id);
	}
});

module.exports = Router;
},{"./Apprenant":"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\Apprenant.js","./Apprenants":"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\Apprenants.js","./DeleteApprenant":"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\DeleteApprenant.js","./PutApprenant":"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\PutApprenant.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Evaluation\\BilanFinal.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "  <h1>En construction</h1>\r\n\r\n  <table class=\"table\">\r\n  <thead>\r\n    <tr>\r\n      <th>Num</th>\r\n      <th>Mission</th>\r\n      <th>Score</th>\r\n    </tr>\r\n  </thead>\r\n  <tbody>\r\n  <tr>\r\n    <td></td>\r\n    <td></td>\r\n    <td></td>\r\n  </tr>\r\n  <tr>\r\n    <td></td>\r\n    <td></td>\r\n    <td></td>\r\n  </tr>\r\n</table>\r\n\r\n<h2>Score total: </h2>\r\n\r\n<a href=\"\">\r\n  <button id=\"accueil\" class=\"btn btn-default\">Retour à l'accueil</button>\r\n</a>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Evaluation\\BilanMission.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "  <h1>En construction</h1>\r\n\r\n  <table class=\"table\">\r\n  <thead>\r\n    <tr>\r\n      <th>Num</th>\r\n      <th>Objectif</th>\r\n      <th>Actions</th>\r\n    </tr>\r\n  </thead>\r\n  <tbody>\r\n  <tr>\r\n    <td></td>\r\n    <td></td>\r\n    <td></td>\r\n  </tr>\r\n  <tr>\r\n    <td></td>\r\n    <td></td>\r\n    <td></td>\r\n  </tr>\r\n</table>\r\n\r\n<h4>Total de la mission: </h4>\r\n\r\n<button id=\"missionSuivante\" class=\"btn btn-default\">Mission suivante</button>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Evaluation\\EvalMission.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "    <div class=\"row\">\r\n      <div class=\"col-md-3\">\r\n        "
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.libobjectif : stack1), depth0))
    + "\r\n      </div>\r\n        <div class=\"col-md-9\">\r\n"
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.listAction : stack1),{"name":"each","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\r\n    </div>\r\n";
},"2":function(depth0,helpers,partials,data) {
    var stack1;

  return "            <div class=\"row\">\r\n              <div class=\"col-md-4\">\r\n                "
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.libaction : stack1), depth0))
    + "\r\n              </div>\r\n              <div class=\"col-md-8\">\r\n"
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.listRegle : stack1),{"name":"each","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "              </div>\r\n            </div>\r\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "                <div class=\"row\">\r\n                  <div class=\"col-md-6\">\r\n                    "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.libregle : stack1), depth0))
    + "\r\n                  </div>\r\n                  <div class=\"col-md-6\">\r\n                    <input type=\"checkbox\" id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.libregle : stack1), depth0))
    + "\">\r\n                  </div>\r\n                </div>  \r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<h1>En construction</h1>\r\n<h3>Evaluation de la mission</h3>\r\n<h2>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.mission : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.libmission : stack1), depth0))
    + "</h2>\r\n  <form id=\"formChoixRegle\" method=\"post\">\r\n    <div class=\"row\">\r\n      <div class=\"col-md-3\">\r\n        Objectifs\r\n      </div>\r\n      <div class=\"col-md-3\">\r\n        Actions\r\n      </div>\r\n      <div class=\"col-md-3\">\r\n        Règles\r\n      </div>\r\n      <div class=\"col-md-3\">\r\n      </div>\r\n    </div>\r\n"
    + ((stack1 = helpers.each.call(depth0,((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.mission : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.listObjectif : stack1)) != null ? stack1.models : stack1),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\r\n\r\n  <button id=\"submitButton\" class=\"btn btn-default\">Valider</button>\r\n  </form>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Evaluation\\Evaluation.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "        <option value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numjeu : stack1), depth0))
    + "\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.libellejeu : stack1), depth0))
    + "</option>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<h3>Choix du jeu</h3>\r\n  <form id=\"formChoixJeu\" method=\"post\">\r\n  <div class=\"form-group\">\r\n    <label for=\"choixJeu\">Choisir le jeu</label>\r\n    <select class=\"form-control\" id=\"choixJeu\">\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.jeux : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </select>\r\n  </div>  \r\n  <button id=\"submitButton\" class=\"btn btn-default\">Valider</button>\r\n  </form>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Evaluation\\Evaluation.js":[function(require,module,exports){
var choixModel = require('../../Model/Evaluation/Evaluation');
var jeuxModel = require('../../Model/Jeux/JeuxList');
var template = require('./Evaluation.hbs');
var templateEvalMission = require('./EvalMission.hbs');
var templateBilanMission = require('./BilanMission.hbs');
var templateBilanFinal = require('./BilanFinal.hbs');

var mission = require('../../Model/Missions/Mission');
var missionObjectifCollection = require('../../Model/Objectifs/ObjectifMission');
var objectifModel = require('../../Model/Objectifs/Objectif');
var objectifList = require('../../Model/Objectifs/ObjectifsList');

var actionModel = require('../../Model/Actions/Action');
var actionList = require('../../Model/Actions/ActionsList');

var regleModel = require('../../Model/Regles/Regle');
var regleList = require('../../Model/Regles/ReglesList');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		this.model = new choixModel();
		$(this.pageName).html("Evaluation");
		$(this.title).html("Evaluation");

		this.jeux = new jeuxModel().fetch({
			success: _.bind(this.renderResultat, this)
		});
	},

	/* Render de la sélection d'un jeu */ 
	renderResultat: function(response){
		$(this.content).html(template({jeux: response.toArray()}));
		this.jeuResponse = response.toArray();

		var $formChoixJeu = $('#formChoixJeu');
		$formChoixJeu.submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	/* Clic sur le premier bouton valider */
	valid: function(e){
		var choixJeu = $('#choixJeu').val();

		for(var i = 0; i < this.jeuResponse.length; i++){
			if(this.jeuResponse[i].attributes.numjeu == choixJeu){				
				this.selectedJeu = this.jeuResponse[i].attributes;
			}
		}
		this.currentMission = 0;
		this.numberOfMission = this.selectedJeu.missionJeu.length;

		this.renderOneMission();
	},

	/* Fais le rendu de la page pour une mission */ 
	renderOneMission: function(){
		/*
			Trois requêtes à faire:
			_ entre objectif et mission
			_ entre chaque mission et actions
			_ entre chaque action et règles 
		 */

		var missionObjectif = new missionObjectifCollection();
		var urlObjectifMission = missionObjectif.url + "/Mission/" + (this.currentMission + 1) + "/Objectif";
		missionObjectif.url = urlObjectifMission;

		$.when(missionObjectif.fetch())
			.done(_.bind(this.requestActions, this));
	},

	requestActions: function(response){
		this.listObjectif = response;
		var tempList = new objectifList();
		for(var i=0;i<response.length;i++){
			var tempObjectifModel = new objectifModel({
					libobjectif: response[i][2].libobjectif,
					numobjectif: response[i][2].numobjectif
			});
			tempList.add(tempObjectifModel);
		}
		this.listObjectif = tempList;

		var promiseTab = [];
		this.actionRequestList = new actionList();
		for(var i=0;i<this.listObjectif.length; i++){
			var tempAction = new actionModel();
			tempAction.url = tempList.url + this.listObjectif.at(i).get("numobjectif") + "/Action";
			promiseTab[promiseTab.length] = tempAction.fetch();
		}

		$.whenall = function(arr) { return $.when.apply($, arr); };

		$.whenall(promiseTab).then(_.bind(function(response){
			if(response === null || response === undefined || response.length == 0){
				return this;
			}
			else{
				for(var j = 0; j < response.length; j++){
					/* On récupère toutes les règles de l'action en cours */
					var tempAction = new actionModel({
								numaction: response[0][j][1].numaction,
								scoremin:  response[0][j][1].scoremin,
								libaction: response[0][j][1].libaction,
								numobjectif: response[0][j][0].numobjectif
							});
					/*Ajout de l'action à la liste d'action*/
					this.actionRequestList.add(tempAction);
				}
				return this;
			}
		}, this))
		.done(_.bind(function(){
			this.requestRegles();
		}, this));
	},

	requestRegles: function(){
		this.regleRequestList = new regleList();
		var promiseArray = [];
		for(var i = 0; i < this.actionRequestList.length; i++){
			var tempRegleModel = new regleModel();
			tempRegleModel.urlRoot = tempRegleModel.urlRoot + "Action/" + this.actionRequestList.at(i).get("numaction");
			promiseArray[promiseArray.length] = tempRegleModel.fetch();
		}
		$.whenall(promiseArray).then(_.bind(function(response){
			if(response === undefined){
				return this;
			}
			else{
				var responseArray = response[0];
				for(var j = 0; j < responseArray.length; j++){
					var tempRegleModel = new regleModel({
						libregle: responseArray[j][0].libregle,
						numregle: responseArray[j][0].numregle,
						scoremin: responseArray[j][0].scoremin,
						numaction: responseArray[j][1].numaction
					});
					this.regleRequestList.add(tempRegleModel);
				}
				return this;
			}
		}, this))
		.done(_.bind(function(){
			this.joinDatas();
		}, this));
	},

	joinDatas : function(){
		for(var i = 0; i < this.actionRequestList.length; i++){
			var listRegle = [];
			for (var j = 0; j<this.regleRequestList.length;j++) {
				if(this.actionRequestList.at(i).get("numaction")==this.regleRequestList.at(j).get("numaction")){
					listRegle.push(this.regleRequestList.at(j));
				}
			}
			this.actionRequestList.at(i).set("listRegle",listRegle);
		}

		for(var i = 0; i < this.listObjectif.length; i++){
			var listAction = [];
			for (var j = 0; j<this.actionRequestList.length;j++) {
				if(this.listObjectif.at(i).get("numobjectif")==this.actionRequestList.at(j).get("numobjectif")){
					listAction.push(this.actionRequestList.at(j));
				}
			}
			this.listObjectif.at(i).set("listAction",listAction);
		}
		var temp = this.selectedJeu.missionJeu[this.currentMission];
		var actualMission = new mission({
			nummission: temp.nummission,
			numjeu: temp.numjeu,
			libmission: temp.libmission
		}); 
		actualMission.set("listObjectif", this.listObjectif);
	
		/* Rendu final de la page d'une mission*/ 
		$(this.content).html(templateEvalMission({mission:actualMission}));

		var $bilanButton = $("#formChoixRegle");
		$bilanButton.submit(_.bind(function(e){
			this.validMission();
		}, this));
	},

	/* Clic sur le second bouton valider */ 
	validMission: function(){
		$(this.content).html(templateBilanMission());

		var $missionSuivante = $('#missionSuivante');
		$missionSuivante.click(_.bind(function(event){
			if(this.currentMission >= this.numberOfMission - 1){
		    	this.validBilan();
			}
			else{
				this.currentMission=this.currentMission+1;
				this.renderOneMission();
			}
		}, this));
	},


	/* Lorsque toutes les missions ont été validées */ 
	validBilan: function(e){
		$(this.content).html(templateBilanFinal());
	}
});

module.exports = view;
},{"../../Model/Actions/Action":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Actions\\Action.js","../../Model/Actions/ActionsList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Actions\\ActionsList.js","../../Model/Evaluation/Evaluation":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Evaluation\\Evaluation.js","../../Model/Jeux/JeuxList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Jeux\\JeuxList.js","../../Model/Missions/Mission":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Missions\\Mission.js","../../Model/Objectifs/Objectif":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Objectifs\\Objectif.js","../../Model/Objectifs/ObjectifMission":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Objectifs\\ObjectifMission.js","../../Model/Objectifs/ObjectifsList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Objectifs\\ObjectifsList.js","../../Model/Regles/Regle":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Regles\\Regle.js","../../Model/Regles/ReglesList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Regles\\ReglesList.js","./BilanFinal.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Evaluation\\BilanFinal.hbs","./BilanMission.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Evaluation\\BilanMission.hbs","./EvalMission.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Evaluation\\EvalMission.hbs","./Evaluation.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Evaluation\\Evaluation.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Evaluation\\RouterEvaluation.js":[function(require,module,exports){
var Evaluation = require('./Evaluation');

var Router = Backbone.Router.extend({
	routes: {
		"Evaluation": "Evaluation"
	},

	initialize: function(){

	},

	Evaluation: function(){
		this.evaluation = new Evaluation();
		this.evaluation.render();
	}
});

module.exports = Router;
},{"./Evaluation":"c:\\dev\\PermisPisteView\\src\\js\\View\\Evaluation\\Evaluation.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<!-- Modal -->\r\n  <div class=\"modal fade\" id=\"modalView\" role=\"dialog\">\r\n    <div class=\"modal-dialog\">\r\n      <div class=\"modal-content\">\r\n        <div class=\"modal-header\">\r\n        <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\r\n          <span aria-hidden=\"true\">&times;</span>\r\n        </button>\r\n          <h4>"
    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "</h4>\r\n        </div>\r\n        <div class=\"modal-body\">\r\n          "
    + alias3(((helper = (helper = helpers.body || (depth0 != null ? depth0.body : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"body","hash":{},"data":data}) : helper)))
    + "\r\n        </div>\r\n        <div class=\"modal-footer\">\r\n          "
    + ((stack1 = ((helper = (helper = helpers.footer || (depth0 != null ? depth0.footer : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"footer","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js":[function(require,module,exports){
var template = require('./modal.hbs');
var templateError = require('./modalError.hbs');

var modal = Backbone.View.extend({
    $modalRoot: $('#modal-root'),

    initialize: function(options){
        this.modalTitle = options.modalTitle || '';
        this.modalBody = options.modalBody || '';
        this.modalFooter = options.modalFooter || '';
        this.modalError = options.modalError || false;

        this.render();

        if(this.modalError){
            $('#modalErrorView').modal('show');
        }
        else{
            $('#modalView').modal('show');
        }
    },

    render: function(){
        if(this.modalError){
            this.$modalRoot.html(templateError({title: this.modalTitle,
            body: this.modalBody, footer: this.modalFooter}));
        }
        else{
            this.$modalRoot.html(template({title: this.modalTitle,
            body: this.modalBody, footer: this.modalFooter}));
        }
    }
});

module.exports = modal;
},{"./modal.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.hbs","./modalError.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modalError.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modalError.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<!-- Modal -->\r\n  <div class=\"modal fade\" id=\"modalErrorView\" role=\"dialog\">\r\n    <div class=\"modal-dialog\">\r\n      <div class=\"modal-content\">\r\n        <div class=\"modal-header\">\r\n        <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\r\n          <span aria-hidden=\"true\">&times;</span>\r\n        </button>\r\n          <h4>"
    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper)))
    + "</h4>\r\n        </div>\r\n        <div class=\"modal-body\">\r\n          "
    + alias3(((helper = (helper = helpers.body || (depth0 != null ? depth0.body : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"body","hash":{},"data":data}) : helper)))
    + "\r\n        </div>\r\n        <div class=\"modal-footer\">\r\n          "
    + alias3(((helper = (helper = helpers.footer || (depth0 != null ? depth0.footer : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"footer","hash":{},"data":data}) : helper)))
    + "\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\DeleteIndicateur.js":[function(require,module,exports){
var indicateurModel = require('../../Model/Indicateurs/Indicateur');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	render: function(id){
		var model = new indicateurModel({"id":id}).fetch({
			success: _.bind(this.confirm,this)
		});

	},

	confirm:function(indicateur){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new indicateurModel({"id":indicateur.id}).destroy({
				success: _.bind(this.valid,this),
				error: _.bind(this.showErrorModal,this)
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Indicateurs', {trigger:true});
		},this));
	},

	valid:function(){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Suppression effecuée"
		});
		$('.modal-backdrop').remove();
		Backbone.history.navigate('#Indicateurs', {trigger:true});
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.showModal();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de la suppression : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view;
},{"../../Model/Indicateurs/Indicateur":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Indicateurs\\Indicateur.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\Indicateur.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<table class=\"table\">\r\n	<thead>\r\n		<tr>\r\n			<th>Identifiant</th>\r\n			<th>Action associée</th>\r\n			<th>Libellé</th>\r\n			<th>Poids</th>\r\n		</tr>\r\n	</thead>\r\n	<tbody>\r\n			<tr>\r\n				<td>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.indicateur : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.numindic : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.indicateur : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.numaction : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.indicateur : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.libindic : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.indicateur : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.poids : stack1), depth0))
    + "</td>\r\n			</tr>\r\n	</tbody>\r\n</table>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\Indicateur.js":[function(require,module,exports){
var indicateurModel = require('../../Model/Indicateurs/Indicateur');
var template = require('./Indicateur.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		var model = new indicateurModel({"id":id}).fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Détail Indicateur");
		$(this.title).html("Informations Indicateur");
	},

	renderResultat: function(indicateur){
		$(this.content).html(template({indicateur}));
	}
});

module.exports = view;
},{"../../Model/Indicateurs/Indicateur":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Indicateurs\\Indicateur.js","./Indicateur.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\Indicateur.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\Indicateurs.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "			<tr onClick=\"document.location='#Indicateurs/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numindic : stack1), depth0))
    + "'\">\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numindic : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numaction : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.libindic : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.poids : stack1), depth0))
    + "</td>\r\n				<td>\r\n					<a href=\"#Indicateurs/Modifier/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numindic : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n					</a>\r\n					<a href=\"#Indicateurs/Supprimer/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numindic : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n					</a>\r\n				</td>\r\n			</tr>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<a href=\"#Indicateurs/Ajout\">\r\n<button type=\"button\" class=\"btn btn-success\">\r\n		<span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span> Ajouter Indicateur\r\n	\r\n</button>\r\n</a>\r\n<table class=\"table\">\r\n	<thead>\r\n		<tr>\r\n			<th>Identifiant</th>\r\n			<th>Action associée</th>\r\n			<th>Libellé</th>\r\n			<th>Poids</th>\r\n			<th></th>\r\n		</tr>\r\n	</thead>\r\n	<tbody>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.indicateurs : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "	</tbody>\r\n</table>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\Indicateurs.js":[function(require,module,exports){
var indicateurModel = require('../../Model/Indicateurs/IndicateursList');
var template = require('./Indicateurs.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		var model = new indicateurModel().fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Liste des Indicateurs");
		$(this.title).html("Liste des Indicateurs");
	},

	renderResultat: function(response){
		$(this.content).html(template({indicateurs: response.toArray()}));
	}
});

module.exports = view;
},{"../../Model/Indicateurs/IndicateursList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Indicateurs\\IndicateursList.js","./Indicateurs.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\Indicateurs.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\PutIndicateur.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "\r\n        <option value=\""
    + alias3(((helper = (helper = helpers.numaction || (depth0 != null ? depth0.numaction : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numaction","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3(((helper = (helper = helpers.numaction || (depth0 != null ? depth0.numaction : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numaction","hash":{},"data":data}) : helper)))
    + " "
    + alias3(((helper = (helper = helpers.libaction || (depth0 != null ? depth0.libaction : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"libaction","hash":{},"data":data}) : helper)))
    + "</option>\r\n\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "  <form id=\"formAjoutIndicateur\" method=\"post\">\r\n  <div class=\"form-group\">\r\n    <label for=\"actionIndicateur\">Action associé</label>\r\n    <select class=\"form-control\" id=\"actionIndicateur\">\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.actions : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\r\n    </select>\r\n  </div>  \r\n  <div class=\"form-group\">\r\n    <label for=\"libIndicateur\">Libellé</label>\r\n    <input type=\"text\" class=\"form-control\" id=\"libIndicateur\" placeholder=\"Entrez un libellé\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.indicateur : depth0)) != null ? stack1.libindic : stack1), depth0))
    + "\" required>\r\n  </div>\r\n  <div class=\"form-group\">\r\n    <label for=\"poidsIndicateur\">Poids</label>\r\n    <input type=\"text\" class=\"form-control\" id=\"poidsIndicateur\" placeholder=\"Entrez un poids\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.indicateur : depth0)) != null ? stack1.poids : stack1), depth0))
    + "\" required>\r\n  </div>\r\n  <button id=\"submitButton\" class=\"btn btn-default\">Valider</button>\r\n  </form>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\PutIndicateur.js":[function(require,module,exports){
var indicateurModel = require('../../Model/Indicateurs/Indicateur');
var actionModel= require ('../../Model/Actions/ActionsList')
var template = require('./PutIndicateur.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formAjoutIndicateur'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		this.$pageName.html("Ajout Indicateur");
		this.$title.html("Ajouter un Indicateur");
		$.when(null,new actionModel().fetch())
		.done(_.bind(function(indicateur, response){
		this.renderResultat(null,response);
        },this));
	},
	renderModif: function(id){
		$.when(new indicateurModel({"id":id}).fetch(),new actionModel().fetch())
		.done(_.bind(function(indicateur, response){
		this.renderResultat(indicateur,response);
        },this));
		this.$pageName.html("Modifier Indicateur");
		this.$title.html("Modifier un Indicateur");
		this.idIndicateur=id;
	},
	valid: function(e){
		var libIndicateur = $('#libIndicateur').val();
		var scoreAction = $('#actionIndicateur').val();
		var libPoids=$('#poidsIndicateur').val();
		console.log(libIndicateur+" "+scoreAction+" "+libPoids);
		var model = new indicateurModel();
		if(this.idIndicateur===undefined)
		{
			console.log(model);
			model.save({"libindic":libIndicateur, "numaction":scoreAction ,"poids":libPoids}, {
				success: this.showModal,
				error: _.bind(this.showErrorModal,this)
			});
		}
		else
		{
			model.save({"numindic":this.idIndicateur,"libindic":libIndicateur, "numaction":scoreAction ,"poids":libPoids}, {
				success: this.showModal,
				error: _.bind(this.showErrorModal,this)
			});
		}

		return true;
	},
	renderResultat: function(indicateur,response){
		if(indicateur===null)
		{
			$(this.$content).html(template({actions: response[0]}));
		}
		else
		{
			this.$content.html(template({indicateur:indicateur[0],actions: response[0]}));
			$("#actionIndicateur option[value='"+indicateur[0].numaction+"']").attr("selected", "selected");
		}
		var $formAjoutIndicateur = $('#formAjoutIndicateur');

		$formAjoutIndicateur.submit(_.bind(function(event){
		    this.valid();
		}, this));
	},
	showModal: function(){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "L'ajout a été effectué avec succès"
		});
		Backbone.history.navigate('#Indicateurs', {trigger:true});
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.showModal();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de l'ajout : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view;
},{"../../Model/Actions/ActionsList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Actions\\ActionsList.js","../../Model/Indicateurs/Indicateur":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Indicateurs\\Indicateur.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js","./PutIndicateur.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\PutIndicateur.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\RouterIndicateurs.js":[function(require,module,exports){
var Indicateurs = require('./Indicateurs');
var Indicateur = require('./Indicateur');
var AjoutIndicateur = require('./PutIndicateur');
var DeleteIndicateur = require('./DeleteIndicateur');

var Router = Backbone.Router.extend({
	routes: {
		"Indicateurs": "Indicateurs",
		"Indicateurs/Ajout": "AjoutIndicateur",
		"Indicateurs/Modifier/:id": "ModifIndicateur",
		"Indicateurs/Supprimer/:id": "SupprIndicateur",
		"Indicateurs/:id": "Indicateur"
	},

	initialize: function(){

	},

	Indicateurs: function(){
		this.Indicateurs = new Indicateurs();
		this.Indicateurs.render();
	},

	Indicateur: function(id){
		this.Indicateur = new Indicateur();
		this.Indicateur.render(id);
	},

	AjoutIndicateur: function(){
		this.Indicateur = new AjoutIndicateur();
		this.Indicateur.render();
	},
	ModifIndicateur: function(id){
		this.Indicateur = new AjoutIndicateur();
		this.Indicateur.renderModif(id);
	},
	SupprIndicateur: function(id){
		this.indicateur = new DeleteIndicateur();
		this.indicateur.render(id);
	}
});

module.exports = Router;
},{"./DeleteIndicateur":"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\DeleteIndicateur.js","./Indicateur":"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\Indicateur.js","./Indicateurs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\Indicateurs.js","./PutIndicateur":"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\PutIndicateur.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\DeleteJeu.js":[function(require,module,exports){
var jeuModel = require('../../Model/Jeux/Jeu');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	render: function(id){
		var model = new jeuModel({"id":id}).fetch({
			success: _.bind(this.confirm,this)
		});

	},

	confirm:function(jeu){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new jeuModel({"id":jeu.id}).destroy({
				success: _.bind(this.valid,this),
				error: _.bind(this.showErrorModal,this)
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Jeux', {trigger:true});
		},this));
	},

	valid:function(){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Suppression effecuée"
		});
		$('.modal-backdrop').remove();
		Backbone.history.navigate('#Jeux', {trigger:true});
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.showModal();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de la suppression : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view;
},{"../../Model/Jeux/Jeu":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Jeux\\Jeu.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\Jeu.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<table class=\"table\">\r\n	<thead>\r\n		<tr>\r\n			<th>Numéro du jeu</th>\r\n			<th>Nom du jeu</th>\r\n		</tr>\r\n	</thead>\r\n	<tbody>\r\n			<tr>\r\n				<td>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.jeu : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.numjeu : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.jeu : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.libellejeu : stack1), depth0))
    + "</td>\r\n			</tr>\r\n	</tbody>\r\n</table>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\Jeu.js":[function(require,module,exports){
var jeuModel = require('../../Model/Jeux/Jeu');
var template = require('./Jeu.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		var model = new jeuModel({"id":id}).fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Détail Jeu");
		$(this.title).html("Informations Jeu");
	},

	renderResultat: function(jeu){
		$(this.content).html(template({jeu}));
	}
});

module.exports = view;
},{"../../Model/Jeux/Jeu":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Jeux\\Jeu.js","./Jeu.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\Jeu.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\Jeux.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "			<tr onClick=\"document.location='#Jeux/"
    + alias3(((helper = (helper = helpers.numjeu || (depth0 != null ? depth0.numjeu : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numjeu","hash":{},"data":data}) : helper)))
    + "'\">\r\n				<td>"
    + alias3(((helper = (helper = helpers.numjeu || (depth0 != null ? depth0.numjeu : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numjeu","hash":{},"data":data}) : helper)))
    + "</td>\r\n				<td>"
    + alias3(((helper = (helper = helpers.libellejeu || (depth0 != null ? depth0.libellejeu : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"libellejeu","hash":{},"data":data}) : helper)))
    + "</td>\r\n				<td>numéro</td>\r\n				<td>libellé</td>\r\n				<td>\r\n					<a href=\"#Jeux/Modifier/"
    + alias3(((helper = (helper = helpers.numjeu || (depth0 != null ? depth0.numjeu : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numjeu","hash":{},"data":data}) : helper)))
    + "\">\r\n						<span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n					</a>\r\n					<a href=\"#Jeux/Supprimer/"
    + alias3(((helper = (helper = helpers.numjeu || (depth0 != null ? depth0.numjeu : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numjeu","hash":{},"data":data}) : helper)))
    + "\">\r\n						<span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n					</a>\r\n				</td>\r\n			</tr>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.missionJeu : depth0),{"name":"each","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "			<tr>\r\n				<td></td>\r\n				<td></td>\r\n				<td>\r\n				</a>\r\n					<a href=\"#Jeux/"
    + alias3(((helper = (helper = helpers.numjeu || (depth0 != null ? depth0.numjeu : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numjeu","hash":{},"data":data}) : helper)))
    + "/Missions/Ajout\">\r\n						<button type=\"button\" class=\"btn btn-success\">\r\n						<span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span>Ajouter Mission</button>\r\n					</a>\r\n				</td>\r\n			</tr>\r\n";
},"2":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "			<tr onClick=\"document.location='#Jeux/"
    + alias3(((helper = (helper = helpers.numjeu || (depth0 != null ? depth0.numjeu : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numjeu","hash":{},"data":data}) : helper)))
    + "/Missions/"
    + alias3(((helper = (helper = helpers.nummission || (depth0 != null ? depth0.nummission : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"nummission","hash":{},"data":data}) : helper)))
    + "'\">\r\n				<td></td>\r\n				<td></td>\r\n				<td>"
    + alias3(((helper = (helper = helpers.nummission || (depth0 != null ? depth0.nummission : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"nummission","hash":{},"data":data}) : helper)))
    + "</td>\r\n				<td>"
    + alias3(((helper = (helper = helpers.libmission || (depth0 != null ? depth0.libmission : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"libmission","hash":{},"data":data}) : helper)))
    + "</td>\r\n				<td>\r\n					<a href=\"#Jeux/"
    + alias3(((helper = (helper = helpers.numjeu || (depth0 != null ? depth0.numjeu : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numjeu","hash":{},"data":data}) : helper)))
    + "/Missions/Modifier/"
    + alias3(((helper = (helper = helpers.nummission || (depth0 != null ? depth0.nummission : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"nummission","hash":{},"data":data}) : helper)))
    + "\">\r\n						<span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n					</a>\r\n					<a href=\"#Jeux/Missions/Supprimer/"
    + alias3(((helper = (helper = helpers.nummission || (depth0 != null ? depth0.nummission : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"nummission","hash":{},"data":data}) : helper)))
    + "\">\r\n						<span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n					</a>\r\n				</td>\r\n			</tr>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<a href=\"#Jeux/Ajout\">\r\n<button type=\"button\" class=\"btn btn-success\">\r\n  <span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span> Ajouter Jeu\r\n</button>\r\n</a>\r\n<table class=\"table\">\r\n	<thead>\r\n		<tr>\r\n			<th>Numéro du jeu</th>\r\n			<th>Nom du jeu</th>\r\n			<th>Mission<th>\r\n			<th></th>\r\n		</tr>\r\n	</thead>\r\n	<tbody>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.jeux : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "	</tbody>\r\n</table>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\Jeux.js":[function(require,module,exports){
var jeuxModel = require('../../Model/Jeux/JeuxList');
var template = require('./Jeux.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		$.when(new jeuxModel().fetch())
		.done(_.bind(function(jeux){
			this.renderResultat(jeux);
		},this));
		$(this.pageName).html("Liste des Jeux");
		$(this.title).html("Liste des Jeux");
	},

	renderResultat: function(response){
		console.log(response);
		$(this.content).html(template({jeux:response}));
	}
});

module.exports = view;
},{"../../Model/Jeux/JeuxList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Jeux\\JeuxList.js","./Jeux.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\Jeux.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\PutJeu.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "  <form id=\"formPutJeu\" method=\"post\">\r\n  <div class=\"form-group\">\r\n    <label for=\"libellejeu\">Libellé</label>\r\n    <input type=\"text\" class=\"form-control\" id=\"libellejeu\" placeholder=\"Entrez un nom\" value=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.jeu : depth0)) != null ? stack1.libellejeu : stack1), depth0))
    + "\" required>\r\n  </div>\r\n  <button class=\"btn btn-default\">Valider</button>\r\n  </form>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\PutJeu.js":[function(require,module,exports){
var jeuModel = require('../../Model/Jeux/Jeu');
var template = require('./PutJeu.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formPutJeu'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		$.when(new jeuModel().fetch())
		.done(_.bind(function(jeu){
			this.renderResultat(jeu);
		},this));
		this.$pageName.html("Ajout Jeu");
		this.$title.html("Ajouter un Jeu");
	},

	renderModif: function(id){
		$.when(new jeuModel({"id":id}).fetch())
		.done(_.bind(function(jeu){
			this.renderResultat(jeu);
		},this));		
		this.$pageName.html("Modifier Jeu");
		this.$title.html("Modifier un Jeu");
		this.idJeu=id;
	},
	valid: function(e){
		var libellejeu = $('#libellejeu').val();
		var model = new jeuModel();
		if (this.idJeu===undefined){
			model.save({"libellejeu":libellejeu}, {
				success: this.showModal("Ajout"),
				error: _.bind(this.showErrorModal,this)
			});
		}
		else{
			model.save({"id":this.idJeu, "libellejeu":libellejeu}, {
				success: this.showModal("Modifier"),
				error: _.bind(this.showErrorModal,this)
			});
		} 
		return true;
	},

	renderResultat: function(response){
		if(response===undefined){
			this.$content.html(template());
		}else{
			this.$content.html(template({jeu:response}));
		}
		$('#formPutJeu').submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	showModal: function(jeuType){
		var ArticleModalBody = "La";
		if(jeuType === "Ajout"){
			ArticleModalBody = "L'";
		}
		var modalView = new modal({
			modalTitle: jeuType,
		 	modalBody: ArticleModalBody+" "+jeuType+" a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Jeux', {trigger:true});
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.showModal();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de l'ajout : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view;
},{"../../Model/Jeux/Jeu":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Jeux\\Jeu.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js","./PutJeu.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\PutJeu.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\RouterJeux.js":[function(require,module,exports){
var Jeux = require('./Jeux');
var Jeu = require('./Jeu');
var PutJeu = require('./PutJeu');
var DeleteJeu = require('./DeleteJeu');

var Router = Backbone.Router.extend({
	routes: {
		"Jeux": "Jeux",
		"Jeux/Ajout": "AjoutJeu",
		"Jeux/Modifier/:id": "ModifJeu",
		"Jeux/Supprimer/:id": "SupprJeu",
		"Jeux/:id": "Jeu"
	},

	initialize: function(){

	},

	Jeux: function(){
		this.Jeux = new Jeux();
		this.Jeux.render();
	},

	Jeu: function(id){
		this.Jeu = new Jeu();
		this.Jeu.render(id);
	},

	AjoutJeu: function(){
		this.Jeu = new PutJeu();
		this.Jeu.render();
	},

	ModifJeu: function(id){
		this.Jeu = new PutJeu();
		this.Jeu.renderModif(id);
	},

	SupprJeu: function(id){
		this.Jeu = new DeleteJeu();
		this.Jeu.render(id);
	}
});

module.exports = Router;
},{"./DeleteJeu":"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\DeleteJeu.js","./Jeu":"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\Jeu.js","./Jeux":"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\Jeux.js","./PutJeu":"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\PutJeu.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Missions\\DeleteMission.js":[function(require,module,exports){
var missionModel = require('../../Model/Missions/Mission');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	render: function(id){
		var model = new missionModel({"id":id}).fetch({
			success: _.bind(this.confirm,this)
		});

	},

	confirm:function(mission){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new missionModel({"id":mission.id}).destroy({
				success: _.bind(this.valid,this),
				error: _.bind(this.showErrorModal,this)
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Missions', {trigger:true});
		},this));
	},

	valid:function(){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Suppression effecuée"
		});
		$('.modal-backdrop').remove();
		Backbone.history.navigate('#Jeux', {trigger:true});
		Backbone.history.stop(); 
		Backbone.history.start();
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.showModal();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de la suppression : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view;
},{"../../Model/Missions/Mission":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Missions\\Mission.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Missions\\Mission.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "			<tr onClick=\"document.location='#Objectifs/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0['2'] : depth0)) != null ? stack1.numobjectif : stack1), depth0))
    + "'\">\r\n				<td></td>\r\n				<td></td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0['2'] : depth0)) != null ? stack1.numobjectif : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0['2'] : depth0)) != null ? stack1.libobjectif : stack1), depth0))
    + "</td>\r\n				<td>\r\n					<a href=\"#Objectifs/Modifier/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0['2'] : depth0)) != null ? stack1.numobjectif : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n					</a>\r\n					<a href=\"#Objectifs/Supprimer/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0['2'] : depth0)) != null ? stack1.numobjectif : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n					</a>\r\n				</td>\r\n			</tr>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<table class=\"table\">\r\n	<thead>\r\n		<tr>\r\n			<th>Identifiant</th>\r\n			<th>Libellé Mission</th>\r\n			<th>Objectifs lié</th>\r\n			<th></th>\r\n		</tr>\r\n	</thead>\r\n	<tbody>\r\n			<tr>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.mission : depth0)) != null ? stack1.nummission : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.mission : depth0)) != null ? stack1.libmission : stack1), depth0))
    + "</td>\r\n				<td>Identifiant</td>\r\n				<td>Libellé Objectif</td>\r\n				<td>\r\n					<a href=\"#Jeux/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.mission : depth0)) != null ? stack1.numjeu : stack1), depth0))
    + "/Missions/Modifier/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.mission : depth0)) != null ? stack1.nummission : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n					</a>\r\n					<a href=\"#Jeux/Missions/Supprimer/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.mission : depth0)) != null ? stack1.nummission : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n					</a>\r\n				</td>\r\n			</tr>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.objectifs : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "			<tr>\r\n				<td></td>\r\n				<td></td>\r\n				<td>\r\n				</a>\r\n					<a href=\"#Jeux/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.mission : depth0)) != null ? stack1.numjeu : stack1), depth0))
    + "/Missions/Modifier/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.mission : depth0)) != null ? stack1.nummission : stack1), depth0))
    + "/Objectifs/Ajout\">\r\n						<button type=\"button\" class=\"btn btn-success\">\r\n						<span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span>Fixer Objectif</button>\r\n					</a>\r\n				</td>\r\n			</tr>\r\n	</tbody>\r\n</table>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Missions\\Mission.js":[function(require,module,exports){
var missionModel = require('../../Model/Missions/Mission');
var objectifList= require('../../Model/Fixe/Fixe')
var template = require('./Mission.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		var objectifs=new objectifList();
		objectifs.urlRoot=objectifs.urlRoot+''+id+"/Objectif";
		$.when(new missionModel({"id":id}).fetch(),objectifs.fetch())
		.done(_.bind(function(mission,objectifs){
			this.renderResultat(mission,objectifs);
		},this));
		$(this.pageName).html("Détail Mission");
		$(this.title).html("Informations Mission");
	},

	renderResultat: function(mission,objectifs){
		$(this.content).html(template({mission:mission[0],objectifs:objectifs[0]}));
	}
});

module.exports = view;
},{"../../Model/Fixe/Fixe":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Fixe\\Fixe.js","../../Model/Missions/Mission":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Missions\\Mission.js","./Mission.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Missions\\Mission.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Missions\\PutMission.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "  <form id=\"formPutMission\" method=\"post\">\r\n  <div class=\"form-group\">\r\n  <label for=\"libmission\">Libellé</label>\r\n    <input type=\"text\" class=\"form-control\" id=\"libmission\" placeholder=\"Entrez un nom\" value=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.mission : depth0)) != null ? stack1.libmission : stack1), depth0))
    + "\" required>\r\n  </div>\r\n  <button class=\"btn btn-default\">Valider</button>\r\n  </form>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Missions\\PutMission.js":[function(require,module,exports){
var missionModel = require('../../Model/Missions/Mission');
var template = require('./PutMission.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formPutMission'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(idJeu){
		this.renderResultat();
		this.$pageName.html("Ajout mission");
		this.$title.html("Ajouter un mission");
		this.idJeu=idJeu;
	},

	renderModif: function(id,idJeu){
		$.when(new missionModel({"id":idJeu}).fetch())
		.done(_.bind(function(mission){
			this.renderResultat(mission);
		},this));		
		this.$pageName.html("Modifier mission");
		this.$title.html("Modifier un mission");
		this.idMission=id;
		this.idJeu=idJeu;
	},
	valid: function(e){
		var libmission = $('#libmission').val();
		var model = new missionModel();
		if (this.idMission===undefined){
			model.save({"numjeu":this.idJeu,"libmission":libmission}, {
				success: this.showModal("Ajout"),
				error: _.bind(this.showErrorModal,this)
			});
		}
		else{
			model.save({"id":this.idMission,"numjeu":this.idJeu, "libmission":libmission}, {
				success: this.showModal("Modifier"),
				error: _.bind(this.showErrorModal,this)
			});
		} 
		return true;
	},

	renderResultat: function(response){
		if(response===undefined){
			this.$content.html(template());
		}else{
			this.$content.html(template({mission:response}));
		}
		$('#formPutMission').submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	showModal: function(missionType){
		var ArticleModalBody = "La";
		if(missionType === "Ajout"){
			ArticleModalBody = "L'";
		}
		var modalView = new modal({
			modalTitle: missionType,
		 	modalBody: ArticleModalBody+" "+missionType+" a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Jeux', {trigger:true});
		window.location.reload();
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.showModal();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de l'ajout : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view;
},{"../../Model/Missions/Mission":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Missions\\Mission.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js","./PutMission.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Missions\\PutMission.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Missions\\RouterMissions.js":[function(require,module,exports){
var PutMission = require('./PutMission');
var DeleteMission = require('./DeleteMission');
var Mission= require('./Mission')
var Router = Backbone.Router.extend({
	routes: {
		"Jeux/:idJeu/Missions/Ajout": "AjoutMission",
		"Jeux/:idJeu/Missions/Modifier/:id": "ModifMission",
		"Jeux/Missions/Supprimer/:id": "SupprMission",
		"Jeux/:idJeu/Missions/:id": "Mission",
	},

	initialize: function(){

	},
	Mission: function(idJeu,id){
		this.Mission = new Mission();
		this.Mission.render(id);
	},
	AjoutMission: function(idJeu){
		this.Mission = new PutMission();
		this.Mission.render(idJeu);
	},

	ModifMission: function(id,idJeu){
		this.Mission = new PutMission();
		this.Mission.renderModif(id,idJeu);
	},

	SupprMission: function(id){
		this.Mission = new DeleteMission();
		this.Mission.render(id);
	}
});

module.exports = Router;
},{"./DeleteMission":"c:\\dev\\PermisPisteView\\src\\js\\View\\Missions\\DeleteMission.js","./Mission":"c:\\dev\\PermisPisteView\\src\\js\\View\\Missions\\Mission.js","./PutMission":"c:\\dev\\PermisPisteView\\src\\js\\View\\Missions\\PutMission.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\DeleteObjectif.js":[function(require,module,exports){
var objectifModel = require('../../Model/Objectifs/Objectif');
var modal = require('../Global/modal.js');
var Est_associeModel = require('../../Model/Est_associe/Est_associe');

var view = Backbone.View.extend({
	render: function(id){
		var model = new objectifModel({"id":id}).fetch({
			success: _.bind(this.confirm,this)
		});

	},

	renderEstAsso: function(id,idAction){
		console.log("test "+id+" "+idAction);
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new Est_associeModel({"numobjectif":id, "numaction":idAction }).destroy({
				success: _.bind(this.valid,this),
				error: _.bind(this.showErrorModal,this)
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Objectifs/Modifier/'+id, {trigger:true});
		},this));
	},

	confirm:function(objectif){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new objectifModel({"id":objectif.id}).destroy({
				success: _.bind(this.valid,this),
				error: _.bind(this.showErrorModal,this)
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Objectifs', {trigger:true});
		},this));
	},

	valid:function(){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Suppression effecuée"
		});
		$('.modal-backdrop').remove();
		Backbone.history.navigate('#Objectifs', {trigger:true});
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.showModal();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de la suppression : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view;
},{"../../Model/Est_associe/Est_associe":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Est_associe\\Est_associe.js","../../Model/Objectifs/Objectif":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Objectifs\\Objectif.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\LieObjectif.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "        <option value=\""
    + alias3(((helper = (helper = helpers.numobjectif || (depth0 != null ? depth0.numobjectif : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numobjectif","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3(((helper = (helper = helpers.numobjectif || (depth0 != null ? depth0.numobjectif : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numobjectif","hash":{},"data":data}) : helper)))
    + " "
    + alias3(((helper = (helper = helpers.libobjectif || (depth0 != null ? depth0.libobjectif : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"libobjectif","hash":{},"data":data}) : helper)))
    + "</option>\r\n\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return " <form id=\"formLieObjectif\" method=\"post\">\r\n  <div class=\"form-group\">\r\n    <label for=\"objectif\">Objectif associé</label>\r\n    <select class=\"form-control\" id=\"objectif\">\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.Objectifstot : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\r\n    </select>\r\n  <button id=\"submitButton\" class=\"btn btn-default\">Lié</button>\r\n  </form>\r\n";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\LieObjectif.js":[function(require,module,exports){
var objectifModel = require('../../Model/Objectifs/Objectif');
var objectifsModel = require('../../Model/Objectifs/ObjectifsList');
var objectifList= require('../../Model/Fixe/Fixe');
var FixeModel = require('../../Model/Fixe/Fixe2');
var template = require('./LieObjectif.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formLieObjectif'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(idJeu,idMission){
		var objectifsParser=new objectifList();
		objectifsParser.urlRoot=objectifsParser.urlRoot+''+idMission+"/Objectif";
		$.when(new objectifModel().fetch(),new objectifsModel().fetch(),objectifsParser.fetch())
		.done(_.bind(function(fixe,objectifs,objectifsParser){
			this.renderResultat(fixe,objectifs,objectifsParser);
		},this));
		this.$pageName.html("Lie Objectif");
		this.$title.html("Lier un Objectif");
		this.idMission=idMission;
		this.idJeu=idJeu;
	},

	valid: function(e){
		var numobjectif = $('#objectif').val();
		var model = new FixeModel();
		model.save({"nummission":this.idMission, "numobjectif":numobjectif}, {
			success: this.showModal,
			error: _.bind(this.showErrorModal,this)
		});
		return true;
	},

	renderResultat: function(fixe,objectifs,objectifsParser){
		if(objectifsParser===null){
			this.$content.html(template({objectifs:objectifs}));
		}else{
			var Objectif = Backbone.Model.extend({
				numobjectif:0,
				libobjectif:""
	  		});
			var CollectionObjectif = Backbone.Collection.extend({
			  model: Objectif
			});
			var listObjectif = new CollectionObjectif();
			// Enleve l'id les ids deja selectionnes de la liste
			for(var i = 0; i <objectifs[0].length; i++) {
				objectif=new Objectif();
				objectif.numobjectif=objectifs[0][i].numobjectif;
				objectif.libobjectif=objectifs[0][i].libobjectif;
				listObjectif.add([objectif]);
				for(var j = 0; j <objectifsParser[0].length; j++) {
		      		if(this.idMission == objectifsParser[0][j][0].nummission) {
		      			if(objectifs[0][i].numobjectif == objectifsParser[0][j][0].numobjectif)
		      			{
		      				listObjectif.remove([objectif]);
		      			}
				    }
				}
		  	}
			// Passe les elments au hbs
				this.$content.html(template({Objectifstot:listObjectif.models}));
			}

		$('#formLieObjectif').submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	showModal: function(){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "L'ajout a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Jeux/'+this.idJeu+'/Missions/'+this.idMission, {trigger:true});
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.showModal();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de l'ajout : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view; 
},{"../../Model/Fixe/Fixe":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Fixe\\Fixe.js","../../Model/Fixe/Fixe2":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Fixe\\Fixe2.js","../../Model/Objectifs/Objectif":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Objectifs\\Objectif.js","../../Model/Objectifs/ObjectifsList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Objectifs\\ObjectifsList.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js","./LieObjectif.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\LieObjectif.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\Objectif.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "						<table class=\"table\" id=\"tabAction\">\r\n							<thead>\r\n								<tr>\r\n									<th>Identifiant</th>\r\n									<th>Libellé</th>\r\n									<th></th>\r\n								</tr>\r\n							</thead>\r\n							<tbody>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.actions : depth0),{"name":"each","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "							</tbody>\r\n						</table>\r\n";
},"2":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "								<tr onClick=\"document.location='#Actions/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numaction : stack1), depth0))
    + "'\">\r\n									<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numaction : stack1), depth0))
    + "</td><td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.libaction : stack1), depth0))
    + "</td>\r\n								</tr>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<table class=\"table\">\r\n	<thead>\r\n		<tr>\r\n			<th>Identifiant</th>\r\n			<th>Libellé</th>\r\n			<th>Actions</th>\r\n			<th></th>\r\n		</tr>\r\n	</thead>\r\n	<tbody>\r\n			<tr>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.objectif : depth0)) != null ? stack1.numobjectif : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.objectif : depth0)) != null ? stack1.libobjectif : stack1), depth0))
    + "</td>\r\n				<td>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.actions : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "				<td>\r\n				<td>\r\n					<a href=\"#Objectifs/Modifier/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.objectif : depth0)) != null ? stack1.numobjectif : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n					</a>\r\n					<a href=\"#Objectifs/Supprimer/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.objectif : depth0)) != null ? stack1.numobjectif : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n					</a>\r\n				</td>\r\n			</tr>\r\n	</tbody>\r\n</table>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\Objectif.js":[function(require,module,exports){
var objectifModel = require('../../Model/Objectifs/Objectif');
var template = require('./Objectif.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		var model = new objectifModel();
		model.url = model.urlRoot+''+id+"/Action";

		$.when(new objectifModel({"id":id}).fetch(),model.fetch())
		.done(_.bind(function(objectif,actions){
			this.renderResultat(objectif,actions);
		},this));
		
		this.idObjectif = id;
		$(this.pageName).html("Détail Objectif");
		$(this.title).html("Informations Objectif");
	},

	renderResultat: function(response, responseActions){
		var Action = Backbone.Model.extend({
	  	});

		var CollectionAction = Backbone.Collection.extend({
		  model: Action
		});
		var count = 0;
		var listAction = new CollectionAction();
		for (var i = 0; i <  responseActions[0].length; i++) {
			var action = new Action(responseActions[0][i][1]);
			listAction.add([action]);
			count++;
		}

		if(count !==0 ){
			$(this.content).html(template({objectif: response[0], actions:listAction.models}));
		}else{
			$(this.content).html(template({objectif: response[0]}));
		}
	
	}
});

module.exports = view;
},{"../../Model/Objectifs/Objectif":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Objectifs\\Objectif.js","./Objectif.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\Objectif.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\Objectifs.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "			<tr onClick=\"document.location='#Objectifs/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numobjectif : stack1), depth0))
    + "'\">\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numobjectif : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.libobjectif : stack1), depth0))
    + "</td>\r\n				<td>\r\n					<a href=\"#Objectifs/Modifier/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numobjectif : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n					</a>\r\n					<a href=\"#Objectifs/Supprimer/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numobjectif : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n					</a>\r\n				</td>\r\n			</tr>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<a href=\"#Objectifs/Ajout\">\r\n	<button type=\"button\" class=\"btn btn-success\">\r\n	  <span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span> Ajouter Objectif\r\n	</button>\r\n</a>\r\n<table class=\"table\">\r\n	<thead>\r\n		<tr>\r\n			<th>Identifiant</th>\r\n			<th>Libellé</th>\r\n			<th></th>\r\n		</tr>\r\n	</thead>\r\n	<tbody>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.objectifs : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "	</tbody>\r\n</table>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\Objectifs.js":[function(require,module,exports){
var objectifModel = require('../../Model/Objectifs/ObjectifsList');
var template = require('./Objectifs.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		var model = new objectifModel().fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Liste des Objectifs");
		$(this.title).html("Liste des Objectifs");
	},

	renderResultat: function(response){
		$(this.content).html(template({objectifs: response.toArray()}));
	}
});

module.exports = view;
},{"../../Model/Objectifs/ObjectifsList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Objectifs\\ObjectifsList.js","./Objectifs.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\Objectifs.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\PutObjectif.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "    <tr>\r\n      <td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numaction : stack1), depth0))
    + "</td><td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.libaction : stack1), depth0))
    + "</td>\r\n      <td><a href=\"#Actions/Modifier/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numaction : stack1), depth0))
    + "\">\r\n            <span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n          </a>\r\n      </td>\r\n      <td><a href=\"#Objectifs/Modifier/"
    + alias2(alias1(((stack1 = (depths[1] != null ? depths[1].objectif : depths[1])) != null ? stack1.numobjectif : stack1), depth0))
    + "/Action/Supprimer/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numaction : stack1), depth0))
    + "\">\r\n            <span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n          </a>\r\n      </td>\r\n    </tr>\r\n";
},"3":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "        <option value="
    + alias3(((helper = (helper = helpers.numaction || (depth0 != null ? depth0.numaction : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numaction","hash":{},"data":data}) : helper)))
    + ">"
    + alias3(((helper = (helper = helpers.numaction || (depth0 != null ? depth0.numaction : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"numaction","hash":{},"data":data}) : helper)))
    + " "
    + alias3(((helper = (helper = helpers.libaction || (depth0 != null ? depth0.libaction : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"libaction","hash":{},"data":data}) : helper)))
    + "</option>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return " <form id=\"formPutObjectif\" method=\"post\">\r\n  <div class=\"form-group\">\r\n    <label for=\"libobjectif\">libobjectif</label>\r\n    <input type=\"text\" class=\"form-control\" id=\"libobjectif\" placeholder=\"Entrez un libellé\" value=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.objectif : depth0)) != null ? stack1.libobjectif : stack1), depth0))
    + "\" required>\r\n  </div>\r\n  <button class=\"btn btn-default\">Valider</button>\r\n</form>\r\n\r\n<hr>\r\n\r\n<label for=\"numaction\">Liste des actions de l'objectif</label>\r\n<table class=\"table\" id=\"tabAction\">\r\n  <thead>\r\n    <tr>\r\n      <th>Identifiant</th>\r\n      <th>Libellé</th>\r\n    </tr>\r\n  </thead>\r\n  <tbody>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.actions : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "  </tbody>\r\n</table>\r\n <form id=\"formPutAction\" method=\"post\">\r\n  <div class=\"form-group\">\r\n   <label for=\"numaction\">Ajouter une Action</label>\r\n    <select  class=\"form-control\" id=\"numaction\">\r\n      <option value=null> Aucun </option>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.actionsTot : depth0),{"name":"each","hash":{},"fn":this.program(3, data, 0, blockParams, depths),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </select>\r\n  </div>\r\n  <button class=\"btn btn-default\">Ajouter</button>\r\n</form>\r\n";
},"useData":true,"useDepths":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\PutObjectif.js":[function(require,module,exports){
var objectifModel = require('../../Model/Objectifs/Objectif');
var objectifsModel = require('../../Model/Objectifs/ObjectifsList');
var actionModel = require('../../Model/Actions/ActionsList');
var Est_associeModel = require('../../Model/Est_associe/Est_associe');
var template = require('./PutObjectif.hbs');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formPutObjectif'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		$.when(new actionModel().fetch(),null,null)
		.done(_.bind(function(actions,objectif,acionObjectif){
			this.renderResultat(actions,null,null);
		},this));
		this.$pageName.html("Ajout Objectif");
		this.$title.html("Ajouter un Objectif");
	},

	renderModif: function(id){
		var model = new objectifModel();
		model.url = model.urlRoot+''+id+"/Action";

		$.when(new actionModel().fetch(),new objectifModel({"id":id}).fetch(),model.fetch())
		.done(_.bind(function(actions,objectif,acionObjectif){
			this.renderResultat(actions,objectif,acionObjectif);
		},this));		
		this.$pageName.html("Modifier Objectif");
		this.$title.html("Modifier un Objectif");
		this.idObjectif=id;
	},

	valid: function(e){
		var libobjectif = $('#libobjectif').val();

		var model = new objectifModel();
		if (this.idObjectif===undefined){
			model.save({"libobjectif":libobjectif}, {
				success: this.showModal,
				error: _.bind(this.showErrorModal,this)
			});
		}
		else{
			model.save({"numobjectif":this.idObjectif, "libobjectif":libobjectif}, {
				success: this.showModal,
				error: _.bind(this.showErrorModal,this)
			});
		} 
		return true;
	},

	validAction: function(e){
		var numaction = $('#numaction').val();

		var model =  new Est_associeModel();
		model.save({"numobjectif":this.idObjectif, "numaction":numaction}, {
			success: this.showModal,
			error: _.bind(this.showErrorModal,this)
		});
		return true;
	},

	renderResultat: function(responseActionListTot,response,responseActionList){
		if(this.idObjectif===undefined){
			this.$content.html(template());
		}else{

			// Enleve l'id les ids deja selectionnes de la liste
			for(var i = 0; i <responseActionListTot[0].length; i++) {
				for(var j = 0; j <responseActionList[0].length; j++) {
		      		if(responseActionListTot[0][i].numaction === responseActionList[0].numaction) {
				         responseActionListTot[0].splice(i, 1);
				    }
				}
		  	}

		  	// Recuperer une liste d'action de l'objectif plus lisible
		  	var Action = Backbone.Model.extend({
	  		});
			var CollectionAction = Backbone.Collection.extend({
			  model: Action
			});
			var count = 0;
			var listAction = new CollectionAction();
			for (var i = 0; i <  responseActionList[0].length; i++) {
				var action = new Action(responseActionList[0][i][1]);
				listAction.add([action]);
				count++;
			}
						
			// Passe les elments au hbs
			if(count !==0 ){
				this.$content.html(template({objectif: response[0],actionsTot:responseActionListTot[0],actions:listAction.models}));
			}else{
				this.$content.html(template({objectif: response[0],actionsTot:responseActionListTot[0]}));
			}
		}

		$('#formPutObjectif').submit(_.bind(function(event){
		    this.valid();
		}, this));

		$('#formPutAction').submit(_.bind(function(event){
		    this.validAction();
		}, this));
	},

	showModal: function(){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "L'ajout a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Objectifs', {trigger:true});
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.showModal();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de l'ajout : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view; 
},{"../../Model/Actions/ActionsList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Actions\\ActionsList.js","../../Model/Est_associe/Est_associe":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Est_associe\\Est_associe.js","../../Model/Objectifs/Objectif":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Objectifs\\Objectif.js","../../Model/Objectifs/ObjectifsList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Objectifs\\ObjectifsList.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js","./PutObjectif.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\PutObjectif.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\RouterObjectifs.js":[function(require,module,exports){
var Objectifs = require('./Objectifs');
var Objectif = require('./Objectif');
var LieObjectif=require('./LieObjectif')
var PutObjectif = require('./PutObjectif');
var DeleteObjectif = require('./DeleteObjectif');

var Router = Backbone.Router.extend({
	routes: {
		"Objectifs": "Objectifs",
		"Objectifs/Ajout": "AjoutObjectif",
		"Objectifs/Modifier/:id": "ModifObjectif",
		"Objectifs/Supprimer/:id": "SupprObjectif",
		"Objectifs/:id": "Objectif",
		"Objectifs/Modifier/:id/Action/Supprimer/:idAction": "SupprObjectifAction",
		"Jeux/:idJeu/Missions/Modifier/:idMission/Objectifs/Ajout": "LieObjectifMission",
	},

	initialize: function(){

	},

	Objectifs: function(){
		this.Objectifs = new Objectifs();
		this.Objectifs.render();
	},

	Objectif: function(id){
		this.objectifs = new Objectif();
		this.objectifs.render(id);
	},

	AjoutObjectif: function(){
		this.objectif = new PutObjectif();
		this.objectif.render();
	},
	LieObjectifMission: function(idJeu,idMission){
		this.lieObjectif = new LieObjectif();
		this.lieObjectif.render(idJeu,idMission);
	},

	ModifObjectif: function(id){
		this.objectif = new PutObjectif();
		this.objectif.renderModif(id);
	},

	SupprObjectif: function(id){
		this.objectif = new DeleteObjectif();
		this.objectif.render(id);
	},

	SupprObjectifAction: function(id, idAction){
		this.objectif = new DeleteObjectif();
		this.objectif.renderEstAsso(id,idAction);
	}
});

module.exports = Router;
},{"./DeleteObjectif":"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\DeleteObjectif.js","./LieObjectif":"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\LieObjectif.js","./Objectif":"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\Objectif.js","./Objectifs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\Objectifs.js","./PutObjectif":"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\PutObjectif.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\DeleteRegle.js":[function(require,module,exports){
var regleModel = require('../../Model/Regles/Regle');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	render: function(id){
		var model = new regleModel({"id":id}).fetch({
			success: _.bind(this.confirm,this)
		});

	},

	confirm:function(regle){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new regleModel({"id":regle.id}).destroy({
				success: _.bind(this.valid,this),
				error: _.bind(this.showErrorModal,this)
			});
		},this));
		$('#annulDelete').on('click',_.bind(function(e){
			Backbone.history.navigate('#Regles', {trigger:true});
		},this));
	},

	valid:function(){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Suppression effecuée"
		});
		$('.modal-backdrop').remove();
		Backbone.history.navigate('#Regles', {trigger:true});
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.valid();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de la suppression : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view;
},{"../../Model/Regles/Regle":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Regles\\Regle.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\PutRegle.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "  <form id=\"formPutRegle\" method=\"post\">\r\n  <div class=\"form-group\">\r\n    <label for=\"libRegle\">Libellé</label>\r\n    <input type=\"text\" class=\"form-control\" id=\"libRegle\" placeholder=\"Entrez un nom\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.regle : depth0)) != null ? stack1.libregle : stack1), depth0))
    + "\" required>\r\n  </div>\r\n  <div class=\"form-group\">\r\n    <label for=\"scoreAction\">Score</label>\r\n    <input type=\"number\" class=\"form-control\" id=\"scoreAction\" placeholder=\"Entrez un score\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.regle : depth0)) != null ? stack1.scoremin : stack1), depth0))
    + "\" required>\r\n  </div>  \r\n  <button class=\"btn btn-default\">Valider</button>\r\n  </form>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\PutRegle.js":[function(require,module,exports){
var regleModel = require('../../Model/Regles/Regle');
var template = require('./PutRegle.hbs');
var modal = require('../Global/modal.js');
var config = require('../../configuration.js');

var view = Backbone.View.extend({
	$pageName : $('title'),
	$title : $('#title'),	
	$content : $('#content'),

	el: $('#formPutRegle'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
			this.renderResultat(undefined);
		this.$pageName.html("Ajout Regle");
		this.$title.html("Ajouter une Regle");
	},

	renderModif: function(id){
		this.idRegle=id;
		$.when(new regleModel({"id":id}).fetch())
		.done(_.bind(function(regle){
			this.renderResultat(regle);
		},this));		
		this.$pageName.html("Modifier Regle");
		this.$title.html("Modifier une Regle");
	},

	valid: function(e){
		var libRegle = $('#libRegle').val();
		var scoreAction = $('#scoreAction').val();

		var model = new regleModel();
		if (this.idRegle===undefined){
			model.save({"libregle":libRegle, "scoremin":scoreAction}, {
				success: this.showModal("Ajout"),
				error: _.bind(this.showErrorModal,this)
			}); 
		}
		else{
			model.save({"numregle":this.idRegle, "libregle":libRegle, "scoremin":scoreAction}, {
				success: this.showModal("Modifier"),
				error: _.bind(this.showErrorModal,this)
			});
		} 
		return true;
	},

	renderResultat: function(regle){
		if(regle===undefined){
			this.$content.html(template());
		}else{
			this.$content.html(template({regle:regle}));
		}
		$('#formPutRegle').submit(_.bind(function(event){
		    this.valid();
		}, this));
	},

	showModal: function(actionType){
		var ArticleModalBody = "La";
		if(actionType === "Ajout"){
			ArticleModalBody = "L'";
		}
		var modalView = new modal({
			modalTitle: actionType,
		 	modalBody: ArticleModalBody+" "+actionType+" a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Regles', {trigger:true});
	},

	showErrorModal: function(object,error){
		if (error.status==201){
			this.showModal();
			return true;
		}
		var modalView = new modal({
			modalTitle: "Erreur "+error.status,
		 	modalBody: "Erreur lors de l'ajout : " + error.statusText,
		 	modalError: true
		});
	}
});

module.exports = view;
},{"../../Model/Regles/Regle":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Regles\\Regle.js","../../configuration.js":"c:\\dev\\PermisPisteView\\src\\js\\configuration.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js","./PutRegle.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\PutRegle.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\Regle.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<table class=\"table\">\r\n	<thead>\r\n		<tr>\r\n			<th>Identifiant</th>\r\n			<th>Libellé Règle</th>\r\n			<th>Score</th>\r\n			<th></th>\r\n		</tr>\r\n	</thead>\r\n	<tbody>\r\n			<tr>\r\n				<td>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.regle : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.numregle : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.regle : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.libregle : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.regle : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.scoremin : stack1), depth0))
    + "</td>\r\n				<td>\r\n					<a href=\"#Regles/Modifier/"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.regle : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.numregle : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n					</a>\r\n					<a href=\"#Regles/Supprimer/"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.regle : depth0)) != null ? stack1.attributes : stack1)) != null ? stack1.numregle : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n					</a>\r\n				</td>\r\n			</tr>\r\n	</tbody>\r\n</table>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\Regle.js":[function(require,module,exports){
var regleModel = require('../../Model/Regles/Regle');
var template = require('./Regle.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(id){
		var model = new regleModel({"id":id}).fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Détail Règle");
		$(this.title).html("Informations Règle");
	},

	renderResultat: function(regle){
		$(this.content).html(template({regle}));
	}
});

module.exports = view;
},{"../../Model/Regles/Regle":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Regles\\Regle.js","./Regle.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\Regle.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\Regles.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"1":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "			<tr onClick=\"document.location='#Regles/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numregle : stack1), depth0))
    + "'\">\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numregle : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.libregle : stack1), depth0))
    + "</td>\r\n				<td>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.scoremin : stack1), depth0))
    + "</td>\r\n				<td>\r\n					<a href=\"#Regles/Modifier/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numregle : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n					</a>\r\n					<a href=\"#Regles/Supprimer/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numregle : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n					</a>\r\n				</td>\r\n			</tr>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<a href=\"#Regles/Ajout\">\r\n	<button type=\"button\" class=\"btn btn-success\">\r\n	  <span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span> Ajouter Règle\r\n	</button>\r\n</a>\r\n\r\n<table class=\"table\">\r\n	<thead>\r\n		<tr>\r\n			<th>Identifiant</th>\r\n			<th>Libellé</th>\r\n			<th>Score</th>\r\n			<th></th>\r\n		</tr>\r\n	</thead>\r\n	<tbody>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.regles : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "	</tbody>\r\n</table>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\Regles.js":[function(require,module,exports){
var regleModel = require('../../Model/Regles/ReglesList');
var template = require('./Regles.hbs');

var view = Backbone.View.extend({
	pageName : $('title'),
	title : $('#title'),
	content : $('#content'),

	//Appelé au moment de l'instanciation	
	initialize: function(){
	},

	//Fonction chargée du rendu
	render: function(){
		var model = new regleModel().fetch({
			success: _.bind(this.renderResultat, this)
		});
		$(this.pageName).html("Liste des Règles");
		$(this.title).html("Liste des Règles");
	},

	renderResultat: function(response){
		$(this.content).html(template({regles: response.toArray()}));
	}
});

module.exports = view;
},{"../../Model/Regles/ReglesList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Regles\\ReglesList.js","./Regles.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\Regles.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\RouterRegles.js":[function(require,module,exports){
var Regles = require('./Regles');
var Regle = require('./Regle');
var PutRegle = require('./PutRegle');
var DeleteRegle = require('./DeleteRegle');

var Router = Backbone.Router.extend({
	routes: {
		"Regles": "Regles",
		"Regles/Ajout": "AjoutRegle",
		"Regles/Modifier/:id": "ModifRegle",
		"Regles/Supprimer/:id": "SupprRegle",
		"Regles/:id": "Regle"
	},

	initialize: function(){

	},

	Regles: function(){
		this.regles = new Regles();
		this.regles.render();
	},

	Regle: function(id){
		this.regle = new Regle();
		this.regle.render(id);
	},

	AjoutRegle: function(){
		this.regle = new PutRegle();
		this.regle.render();
	},

	ModifRegle: function(id){
		this.regle = new PutRegle();
		this.regle.renderModif(id);
	},

	SupprRegle: function(id){
		this.regle = new DeleteRegle();
		this.regle.render(id);
	}
});

module.exports = Router;
},{"./DeleteRegle":"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\DeleteRegle.js","./PutRegle":"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\PutRegle.js","./Regle":"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\Regle.js","./Regles":"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\Regles.js"}],"c:\\dev\\PermisPisteView\\src\\js\\configuration.js":[function(require,module,exports){
var configuration = {
	url: "http://localhost:8080/"
};

module.exports = configuration;
},{}],"src/js/app.js":[function(require,module,exports){
var Accueil = require('./View/Accueil/Accueil');
var Apprenants = require('./View/Apprenants/RouterApprenants');
var Actions = require('./View/Actions/RouterActions');
var Regles = require('./View/Regles/RouterRegles');
var Indicateurs = require('./View/Indicateurs/RouterIndicateurs');
var Objectifs = require('./View/Objectifs/RouterObjectifs');
var Jeux=require('./View/Jeux/RouterJeux');
var Evaluation = require('./View/Evaluation/RouterEvaluation');
var Missions= require('./View/Missions/RouterMissions')

var Router = Backbone.Router.extend({
	routes: {
		"": "Accueil"
	},

	initialize: function(){

	},

	Accueil: function(){
		this.accueil = new Accueil();
		this.accueil.render();
	}
});

var router = new Router();
var apprenantsRouter = new Apprenants();
var actionsRouter = new Actions();
var reglesRouter = new Regles();
var indicateursRouteur = new Indicateurs();
var objectifsRouteur = new Objectifs();
var evaluationRouteur = new Evaluation();
var JeuxRouteur=new Jeux();
var MissionsRouteur=new Missions();

Backbone.history.start();
},{"./View/Accueil/Accueil":"c:\\dev\\PermisPisteView\\src\\js\\View\\Accueil\\Accueil.js","./View/Actions/RouterActions":"c:\\dev\\PermisPisteView\\src\\js\\View\\Actions\\RouterActions.js","./View/Apprenants/RouterApprenants":"c:\\dev\\PermisPisteView\\src\\js\\View\\Apprenants\\RouterApprenants.js","./View/Evaluation/RouterEvaluation":"c:\\dev\\PermisPisteView\\src\\js\\View\\Evaluation\\RouterEvaluation.js","./View/Indicateurs/RouterIndicateurs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\RouterIndicateurs.js","./View/Jeux/RouterJeux":"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\RouterJeux.js","./View/Missions/RouterMissions":"c:\\dev\\PermisPisteView\\src\\js\\View\\Missions\\RouterMissions.js","./View/Objectifs/RouterObjectifs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Objectifs\\RouterObjectifs.js","./View/Regles/RouterRegles":"c:\\dev\\PermisPisteView\\src\\js\\View\\Regles\\RouterRegles.js"}]},{},["src/js/app.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2Jhc2UuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGJzZnkvcnVudGltZS5qcyIsInNyYy9qcy9Nb2RlbC9BY3Rpb25zL0FjdGlvbi5qcyIsInNyYy9qcy9Nb2RlbC9BY3Rpb25zL0FjdGlvbnNMaXN0LmpzIiwic3JjL2pzL01vZGVsL0FwcHJlbmFudHMvQXBwcmVuYW50LmpzIiwic3JjL2pzL01vZGVsL0FwcHJlbmFudHMvQXBwcmVuYW50c0xpc3QuanMiLCJzcmMvanMvTW9kZWwvRXN0X2Fzc29jaWUvRXN0X2Fzc29jaWUuanMiLCJzcmMvanMvTW9kZWwvRXZhbHVhdGlvbi9FdmFsdWF0aW9uLmpzIiwic3JjL2pzL01vZGVsL0ZpeGUvRml4ZS5qcyIsInNyYy9qcy9Nb2RlbC9GaXhlL0ZpeGUyLmpzIiwic3JjL2pzL01vZGVsL0luZGljYXRldXJzL0luZGljYXRldXIuanMiLCJzcmMvanMvTW9kZWwvSW5kaWNhdGV1cnMvSW5kaWNhdGV1cnNMaXN0LmpzIiwic3JjL2pzL01vZGVsL0pldXgvSmV1LmpzIiwic3JjL2pzL01vZGVsL0pldXgvSmV1eExpc3QuanMiLCJzcmMvanMvTW9kZWwvTWlzc2lvbnMvTWlzc2lvbi5qcyIsInNyYy9qcy9Nb2RlbC9PYmplY3RpZnMvT2JqZWN0aWYuanMiLCJzcmMvanMvTW9kZWwvT2JqZWN0aWZzL09iamVjdGlmTWlzc2lvbi5qcyIsInNyYy9qcy9Nb2RlbC9PYmplY3RpZnMvT2JqZWN0aWZzTGlzdC5qcyIsInNyYy9qcy9Nb2RlbC9Qb3NzZWRlL1Bvc3NlZGUuanMiLCJzcmMvanMvTW9kZWwvUmVnbGVzL1JlZ2xlLmpzIiwic3JjL2pzL01vZGVsL1JlZ2xlcy9SZWdsZXNMaXN0LmpzIiwic3JjL2pzL1ZpZXcvQWNjdWVpbC9BY2N1ZWlsLmhicyIsInNyYy9qcy9WaWV3L0FjY3VlaWwvQWNjdWVpbC5qcyIsInNyYy9qcy9WaWV3L0FjdGlvbnMvQWN0aW9uLmhicyIsInNyYy9qcy9WaWV3L0FjdGlvbnMvQWN0aW9uLmpzIiwic3JjL2pzL1ZpZXcvQWN0aW9ucy9BY3Rpb25zLmhicyIsInNyYy9qcy9WaWV3L0FjdGlvbnMvQWN0aW9ucy5qcyIsInNyYy9qcy9WaWV3L0FjdGlvbnMvRGVsZXRlQWN0aW9uLmpzIiwic3JjL2pzL1ZpZXcvQWN0aW9ucy9QdXRBY3Rpb24uaGJzIiwic3JjL2pzL1ZpZXcvQWN0aW9ucy9QdXRBY3Rpb24uanMiLCJzcmMvanMvVmlldy9BY3Rpb25zL1JvdXRlckFjdGlvbnMuanMiLCJzcmMvanMvVmlldy9BcHByZW5hbnRzL0FwcHJlbmFudC5oYnMiLCJzcmMvanMvVmlldy9BcHByZW5hbnRzL0FwcHJlbmFudC5qcyIsInNyYy9qcy9WaWV3L0FwcHJlbmFudHMvQXBwcmVuYW50cy5oYnMiLCJzcmMvanMvVmlldy9BcHByZW5hbnRzL0FwcHJlbmFudHMuanMiLCJzcmMvanMvVmlldy9BcHByZW5hbnRzL0RlbGV0ZUFwcHJlbmFudC5qcyIsInNyYy9qcy9WaWV3L0FwcHJlbmFudHMvUHV0QXBwcmVuYW50LmhicyIsInNyYy9qcy9WaWV3L0FwcHJlbmFudHMvUHV0QXBwcmVuYW50LmpzIiwic3JjL2pzL1ZpZXcvQXBwcmVuYW50cy9Sb3V0ZXJBcHByZW5hbnRzLmpzIiwic3JjL2pzL1ZpZXcvRXZhbHVhdGlvbi9CaWxhbkZpbmFsLmhicyIsInNyYy9qcy9WaWV3L0V2YWx1YXRpb24vQmlsYW5NaXNzaW9uLmhicyIsInNyYy9qcy9WaWV3L0V2YWx1YXRpb24vRXZhbE1pc3Npb24uaGJzIiwic3JjL2pzL1ZpZXcvRXZhbHVhdGlvbi9FdmFsdWF0aW9uLmhicyIsInNyYy9qcy9WaWV3L0V2YWx1YXRpb24vRXZhbHVhdGlvbi5qcyIsInNyYy9qcy9WaWV3L0V2YWx1YXRpb24vUm91dGVyRXZhbHVhdGlvbi5qcyIsInNyYy9qcy9WaWV3L0dsb2JhbC9tb2RhbC5oYnMiLCJzcmMvanMvVmlldy9HbG9iYWwvbW9kYWwuanMiLCJzcmMvanMvVmlldy9HbG9iYWwvbW9kYWxFcnJvci5oYnMiLCJzcmMvanMvVmlldy9JbmRpY2F0ZXVycy9EZWxldGVJbmRpY2F0ZXVyLmpzIiwic3JjL2pzL1ZpZXcvSW5kaWNhdGV1cnMvSW5kaWNhdGV1ci5oYnMiLCJzcmMvanMvVmlldy9JbmRpY2F0ZXVycy9JbmRpY2F0ZXVyLmpzIiwic3JjL2pzL1ZpZXcvSW5kaWNhdGV1cnMvSW5kaWNhdGV1cnMuaGJzIiwic3JjL2pzL1ZpZXcvSW5kaWNhdGV1cnMvSW5kaWNhdGV1cnMuanMiLCJzcmMvanMvVmlldy9JbmRpY2F0ZXVycy9QdXRJbmRpY2F0ZXVyLmhicyIsInNyYy9qcy9WaWV3L0luZGljYXRldXJzL1B1dEluZGljYXRldXIuanMiLCJzcmMvanMvVmlldy9JbmRpY2F0ZXVycy9Sb3V0ZXJJbmRpY2F0ZXVycy5qcyIsInNyYy9qcy9WaWV3L0pldXgvRGVsZXRlSmV1LmpzIiwic3JjL2pzL1ZpZXcvSmV1eC9KZXUuaGJzIiwic3JjL2pzL1ZpZXcvSmV1eC9KZXUuanMiLCJzcmMvanMvVmlldy9KZXV4L0pldXguaGJzIiwic3JjL2pzL1ZpZXcvSmV1eC9KZXV4LmpzIiwic3JjL2pzL1ZpZXcvSmV1eC9QdXRKZXUuaGJzIiwic3JjL2pzL1ZpZXcvSmV1eC9QdXRKZXUuanMiLCJzcmMvanMvVmlldy9KZXV4L1JvdXRlckpldXguanMiLCJzcmMvanMvVmlldy9NaXNzaW9ucy9EZWxldGVNaXNzaW9uLmpzIiwic3JjL2pzL1ZpZXcvTWlzc2lvbnMvTWlzc2lvbi5oYnMiLCJzcmMvanMvVmlldy9NaXNzaW9ucy9NaXNzaW9uLmpzIiwic3JjL2pzL1ZpZXcvTWlzc2lvbnMvUHV0TWlzc2lvbi5oYnMiLCJzcmMvanMvVmlldy9NaXNzaW9ucy9QdXRNaXNzaW9uLmpzIiwic3JjL2pzL1ZpZXcvTWlzc2lvbnMvUm91dGVyTWlzc2lvbnMuanMiLCJzcmMvanMvVmlldy9PYmplY3RpZnMvRGVsZXRlT2JqZWN0aWYuanMiLCJzcmMvanMvVmlldy9PYmplY3RpZnMvTGllT2JqZWN0aWYuaGJzIiwic3JjL2pzL1ZpZXcvT2JqZWN0aWZzL0xpZU9iamVjdGlmLmpzIiwic3JjL2pzL1ZpZXcvT2JqZWN0aWZzL09iamVjdGlmLmhicyIsInNyYy9qcy9WaWV3L09iamVjdGlmcy9PYmplY3RpZi5qcyIsInNyYy9qcy9WaWV3L09iamVjdGlmcy9PYmplY3RpZnMuaGJzIiwic3JjL2pzL1ZpZXcvT2JqZWN0aWZzL09iamVjdGlmcy5qcyIsInNyYy9qcy9WaWV3L09iamVjdGlmcy9QdXRPYmplY3RpZi5oYnMiLCJzcmMvanMvVmlldy9PYmplY3RpZnMvUHV0T2JqZWN0aWYuanMiLCJzcmMvanMvVmlldy9PYmplY3RpZnMvUm91dGVyT2JqZWN0aWZzLmpzIiwic3JjL2pzL1ZpZXcvUmVnbGVzL0RlbGV0ZVJlZ2xlLmpzIiwic3JjL2pzL1ZpZXcvUmVnbGVzL1B1dFJlZ2xlLmhicyIsInNyYy9qcy9WaWV3L1JlZ2xlcy9QdXRSZWdsZS5qcyIsInNyYy9qcy9WaWV3L1JlZ2xlcy9SZWdsZS5oYnMiLCJzcmMvanMvVmlldy9SZWdsZXMvUmVnbGUuanMiLCJzcmMvanMvVmlldy9SZWdsZXMvUmVnbGVzLmhicyIsInNyYy9qcy9WaWV3L1JlZ2xlcy9SZWdsZXMuanMiLCJzcmMvanMvVmlldy9SZWdsZXMvUm91dGVyUmVnbGVzLmpzIiwic3JjL2pzL2NvbmZpZ3VyYXRpb24uanMiLCJzcmMvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2ltcG9ydCA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9iYXNlJyk7XG5cbnZhciBiYXNlID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydCk7XG5cbi8vIEVhY2ggb2YgdGhlc2UgYXVnbWVudCB0aGUgSGFuZGxlYmFycyBvYmplY3QuIE5vIG5lZWQgdG8gc2V0dXAgaGVyZS5cbi8vIChUaGlzIGlzIGRvbmUgdG8gZWFzaWx5IHNoYXJlIGNvZGUgYmV0d2VlbiBjb21tb25qcyBhbmQgYnJvd3NlIGVudnMpXG5cbnZhciBfU2FmZVN0cmluZyA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9zYWZlLXN0cmluZycpO1xuXG52YXIgX1NhZmVTdHJpbmcyID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX1NhZmVTdHJpbmcpO1xuXG52YXIgX0V4Y2VwdGlvbiA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9leGNlcHRpb24nKTtcblxudmFyIF9FeGNlcHRpb24yID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX0V4Y2VwdGlvbik7XG5cbnZhciBfaW1wb3J0MiA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy91dGlscycpO1xuXG52YXIgVXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0Mik7XG5cbnZhciBfaW1wb3J0MyA9IHJlcXVpcmUoJy4vaGFuZGxlYmFycy9ydW50aW1lJyk7XG5cbnZhciBydW50aW1lID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydDMpO1xuXG52YXIgX25vQ29uZmxpY3QgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QnKTtcblxudmFyIF9ub0NvbmZsaWN0MiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9ub0NvbmZsaWN0KTtcblxuLy8gRm9yIGNvbXBhdGliaWxpdHkgYW5kIHVzYWdlIG91dHNpZGUgb2YgbW9kdWxlIHN5c3RlbXMsIG1ha2UgdGhlIEhhbmRsZWJhcnMgb2JqZWN0IGEgbmFtZXNwYWNlXG5mdW5jdGlvbiBjcmVhdGUoKSB7XG4gIHZhciBoYiA9IG5ldyBiYXNlLkhhbmRsZWJhcnNFbnZpcm9ubWVudCgpO1xuXG4gIFV0aWxzLmV4dGVuZChoYiwgYmFzZSk7XG4gIGhiLlNhZmVTdHJpbmcgPSBfU2FmZVN0cmluZzJbJ2RlZmF1bHQnXTtcbiAgaGIuRXhjZXB0aW9uID0gX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXTtcbiAgaGIuVXRpbHMgPSBVdGlscztcbiAgaGIuZXNjYXBlRXhwcmVzc2lvbiA9IFV0aWxzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgaGIuVk0gPSBydW50aW1lO1xuICBoYi50ZW1wbGF0ZSA9IGZ1bmN0aW9uIChzcGVjKSB7XG4gICAgcmV0dXJuIHJ1bnRpbWUudGVtcGxhdGUoc3BlYywgaGIpO1xuICB9O1xuXG4gIHJldHVybiBoYjtcbn1cblxudmFyIGluc3QgPSBjcmVhdGUoKTtcbmluc3QuY3JlYXRlID0gY3JlYXRlO1xuXG5fbm9Db25mbGljdDJbJ2RlZmF1bHQnXShpbnN0KTtcblxuaW5zdFsnZGVmYXVsdCddID0gaW5zdDtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gaW5zdDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5IYW5kbGViYXJzRW52aXJvbm1lbnQgPSBIYW5kbGViYXJzRW52aXJvbm1lbnQ7XG5leHBvcnRzLmNyZWF0ZUZyYW1lID0gY3JlYXRlRnJhbWU7XG5cbnZhciBfaW1wb3J0ID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgVXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0KTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpO1xuXG52YXIgX0V4Y2VwdGlvbjIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfRXhjZXB0aW9uKTtcblxudmFyIFZFUlNJT04gPSAnMy4wLjEnO1xuZXhwb3J0cy5WRVJTSU9OID0gVkVSU0lPTjtcbnZhciBDT01QSUxFUl9SRVZJU0lPTiA9IDY7XG5cbmV4cG9ydHMuQ09NUElMRVJfUkVWSVNJT04gPSBDT01QSUxFUl9SRVZJU0lPTjtcbnZhciBSRVZJU0lPTl9DSEFOR0VTID0ge1xuICAxOiAnPD0gMS4wLnJjLjInLCAvLyAxLjAucmMuMiBpcyBhY3R1YWxseSByZXYyIGJ1dCBkb2Vzbid0IHJlcG9ydCBpdFxuICAyOiAnPT0gMS4wLjAtcmMuMycsXG4gIDM6ICc9PSAxLjAuMC1yYy40JyxcbiAgNDogJz09IDEueC54JyxcbiAgNTogJz09IDIuMC4wLWFscGhhLngnLFxuICA2OiAnPj0gMi4wLjAtYmV0YS4xJ1xufTtcblxuZXhwb3J0cy5SRVZJU0lPTl9DSEFOR0VTID0gUkVWSVNJT05fQ0hBTkdFUztcbnZhciBpc0FycmF5ID0gVXRpbHMuaXNBcnJheSxcbiAgICBpc0Z1bmN0aW9uID0gVXRpbHMuaXNGdW5jdGlvbixcbiAgICB0b1N0cmluZyA9IFV0aWxzLnRvU3RyaW5nLFxuICAgIG9iamVjdFR5cGUgPSAnW29iamVjdCBPYmplY3RdJztcblxuZnVuY3Rpb24gSGFuZGxlYmFyc0Vudmlyb25tZW50KGhlbHBlcnMsIHBhcnRpYWxzKSB7XG4gIHRoaXMuaGVscGVycyA9IGhlbHBlcnMgfHwge307XG4gIHRoaXMucGFydGlhbHMgPSBwYXJ0aWFscyB8fCB7fTtcblxuICByZWdpc3RlckRlZmF1bHRIZWxwZXJzKHRoaXMpO1xufVxuXG5IYW5kbGViYXJzRW52aXJvbm1lbnQucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogSGFuZGxlYmFyc0Vudmlyb25tZW50LFxuXG4gIGxvZ2dlcjogbG9nZ2VyLFxuICBsb2c6IGxvZyxcblxuICByZWdpc3RlckhlbHBlcjogZnVuY3Rpb24gcmVnaXN0ZXJIZWxwZXIobmFtZSwgZm4pIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgaWYgKGZuKSB7XG4gICAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGhlbHBlcnMnKTtcbiAgICAgIH1cbiAgICAgIFV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgICB9XG4gIH0sXG4gIHVucmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uIHVucmVnaXN0ZXJIZWxwZXIobmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLmhlbHBlcnNbbmFtZV07XG4gIH0sXG5cbiAgcmVnaXN0ZXJQYXJ0aWFsOiBmdW5jdGlvbiByZWdpc3RlclBhcnRpYWwobmFtZSwgcGFydGlhbCkge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBVdGlscy5leHRlbmQodGhpcy5wYXJ0aWFscywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgcGFydGlhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ0F0dGVtcHRpbmcgdG8gcmVnaXN0ZXIgYSBwYXJ0aWFsIGFzIHVuZGVmaW5lZCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHBhcnRpYWw7XG4gICAgfVxuICB9LFxuICB1bnJlZ2lzdGVyUGFydGlhbDogZnVuY3Rpb24gdW5yZWdpc3RlclBhcnRpYWwobmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLnBhcnRpYWxzW25hbWVdO1xuICB9XG59O1xuXG5mdW5jdGlvbiByZWdpc3RlckRlZmF1bHRIZWxwZXJzKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdoZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24gKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAvLyBBIG1pc3NpbmcgZmllbGQgaW4gYSB7e2Zvb319IGNvbnN0dWN0LlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU29tZW9uZSBpcyBhY3R1YWxseSB0cnlpbmcgdG8gY2FsbCBzb21ldGhpbmcsIGJsb3cgdXAuXG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnTWlzc2luZyBoZWxwZXI6IFwiJyArIGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV0ubmFtZSArICdcIicpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmIChjb250ZXh0ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZm4odGhpcyk7XG4gICAgfSBlbHNlIGlmIChjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgaWYgKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAob3B0aW9ucy5pZHMpIHtcbiAgICAgICAgICBvcHRpb25zLmlkcyA9IFtvcHRpb25zLm5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnMuZWFjaChjb250ZXh0LCBvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIHZhciBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IFV0aWxzLmFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5uYW1lKTtcbiAgICAgICAgb3B0aW9ucyA9IHsgZGF0YTogZGF0YSB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnTXVzdCBwYXNzIGl0ZXJhdG9yIHRvICNlYWNoJyk7XG4gICAgfVxuXG4gICAgdmFyIGZuID0gb3B0aW9ucy5mbixcbiAgICAgICAgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIHJldCA9ICcnLFxuICAgICAgICBkYXRhID0gdW5kZWZpbmVkLFxuICAgICAgICBjb250ZXh0UGF0aCA9IHVuZGVmaW5lZDtcblxuICAgIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5pZHMpIHtcbiAgICAgIGNvbnRleHRQYXRoID0gVXRpbHMuYXBwZW5kQ29udGV4dFBhdGgob3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoLCBvcHRpb25zLmlkc1swXSkgKyAnLic7XG4gICAgfVxuXG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHtcbiAgICAgIGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuZGF0YSkge1xuICAgICAgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXhlY0l0ZXJhdGlvbihmaWVsZCwgaW5kZXgsIGxhc3QpIHtcbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIGRhdGEua2V5ID0gZmllbGQ7XG4gICAgICAgIGRhdGEuaW5kZXggPSBpbmRleDtcbiAgICAgICAgZGF0YS5maXJzdCA9IGluZGV4ID09PSAwO1xuICAgICAgICBkYXRhLmxhc3QgPSAhIWxhc3Q7XG5cbiAgICAgICAgaWYgKGNvbnRleHRQYXRoKSB7XG4gICAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IGNvbnRleHRQYXRoICsgZmllbGQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtmaWVsZF0sIHtcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgYmxvY2tQYXJhbXM6IFV0aWxzLmJsb2NrUGFyYW1zKFtjb250ZXh0W2ZpZWxkXSwgZmllbGRdLCBbY29udGV4dFBhdGggKyBmaWVsZCwgbnVsbF0pXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChpc0FycmF5KGNvbnRleHQpKSB7XG4gICAgICAgIGZvciAodmFyIGogPSBjb250ZXh0Lmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgIGV4ZWNJdGVyYXRpb24oaSwgaSwgaSA9PT0gY29udGV4dC5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHByaW9yS2V5ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBjb250ZXh0KSB7XG4gICAgICAgICAgaWYgKGNvbnRleHQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgLy8gV2UncmUgcnVubmluZyB0aGUgaXRlcmF0aW9ucyBvbmUgc3RlcCBvdXQgb2Ygc3luYyBzbyB3ZSBjYW4gZGV0ZWN0XG4gICAgICAgICAgICAvLyB0aGUgbGFzdCBpdGVyYXRpb24gd2l0aG91dCBoYXZlIHRvIHNjYW4gdGhlIG9iamVjdCB0d2ljZSBhbmQgY3JlYXRlXG4gICAgICAgICAgICAvLyBhbiBpdGVybWVkaWF0ZSBrZXlzIGFycmF5LlxuICAgICAgICAgICAgaWYgKHByaW9yS2V5KSB7XG4gICAgICAgICAgICAgIGV4ZWNJdGVyYXRpb24ocHJpb3JLZXksIGkgLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByaW9yS2V5ID0ga2V5O1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocHJpb3JLZXkpIHtcbiAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgcmV0ID0gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbiAoY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjb25kaXRpb25hbCkpIHtcbiAgICAgIGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICAvLyBEZWZhdWx0IGJlaGF2aW9yIGlzIHRvIHJlbmRlciB0aGUgcG9zaXRpdmUgcGF0aCBpZiB0aGUgdmFsdWUgaXMgdHJ1dGh5IGFuZCBub3QgZW1wdHkuXG4gICAgLy8gVGhlIGBpbmNsdWRlWmVyb2Agb3B0aW9uIG1heSBiZSBzZXQgdG8gdHJlYXQgdGhlIGNvbmR0aW9uYWwgYXMgcHVyZWx5IG5vdCBlbXB0eSBiYXNlZCBvbiB0aGVcbiAgICAvLyBiZWhhdmlvciBvZiBpc0VtcHR5LiBFZmZlY3RpdmVseSB0aGlzIGRldGVybWluZXMgaWYgMCBpcyBoYW5kbGVkIGJ5IHRoZSBwb3NpdGl2ZSBwYXRoIG9yIG5lZ2F0aXZlLlxuICAgIGlmICghb3B0aW9ucy5oYXNoLmluY2x1ZGVaZXJvICYmICFjb25kaXRpb25hbCB8fCBVdGlscy5pc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcigndW5sZXNzJywgZnVuY3Rpb24gKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwgeyBmbjogb3B0aW9ucy5pbnZlcnNlLCBpbnZlcnNlOiBvcHRpb25zLmZuLCBoYXNoOiBvcHRpb25zLmhhc2ggfSk7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24gKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkge1xuICAgICAgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICB2YXIgZm4gPSBvcHRpb25zLmZuO1xuXG4gICAgaWYgKCFVdGlscy5pc0VtcHR5KGNvbnRleHQpKSB7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIHZhciBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IFV0aWxzLmFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5pZHNbMF0pO1xuICAgICAgICBvcHRpb25zID0geyBkYXRhOiBkYXRhIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmbihjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbiAobWVzc2FnZSwgb3B0aW9ucykge1xuICAgIHZhciBsZXZlbCA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCA/IHBhcnNlSW50KG9wdGlvbnMuZGF0YS5sZXZlbCwgMTApIDogMTtcbiAgICBpbnN0YW5jZS5sb2cobGV2ZWwsIG1lc3NhZ2UpO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9va3VwJywgZnVuY3Rpb24gKG9iaiwgZmllbGQpIHtcbiAgICByZXR1cm4gb2JqICYmIG9ialtmaWVsZF07XG4gIH0pO1xufVxuXG52YXIgbG9nZ2VyID0ge1xuICBtZXRob2RNYXA6IHsgMDogJ2RlYnVnJywgMTogJ2luZm8nLCAyOiAnd2FybicsIDM6ICdlcnJvcicgfSxcblxuICAvLyBTdGF0ZSBlbnVtXG4gIERFQlVHOiAwLFxuICBJTkZPOiAxLFxuICBXQVJOOiAyLFxuICBFUlJPUjogMyxcbiAgbGV2ZWw6IDEsXG5cbiAgLy8gQ2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbiBsb2cobGV2ZWwsIG1lc3NhZ2UpIHtcbiAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGxvZ2dlci5sZXZlbCA8PSBsZXZlbCkge1xuICAgICAgdmFyIG1ldGhvZCA9IGxvZ2dlci5tZXRob2RNYXBbbGV2ZWxdO1xuICAgICAgKGNvbnNvbGVbbWV0aG9kXSB8fCBjb25zb2xlLmxvZykuY2FsbChjb25zb2xlLCBtZXNzYWdlKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgfVxuICB9XG59O1xuXG5leHBvcnRzLmxvZ2dlciA9IGxvZ2dlcjtcbnZhciBsb2cgPSBsb2dnZXIubG9nO1xuXG5leHBvcnRzLmxvZyA9IGxvZztcblxuZnVuY3Rpb24gY3JlYXRlRnJhbWUob2JqZWN0KSB7XG4gIHZhciBmcmFtZSA9IFV0aWxzLmV4dGVuZCh7fSwgb2JqZWN0KTtcbiAgZnJhbWUuX3BhcmVudCA9IG9iamVjdDtcbiAgcmV0dXJuIGZyYW1lO1xufVxuXG4vKiBbYXJncywgXW9wdGlvbnMgKi8iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBlcnJvclByb3BzID0gWydkZXNjcmlwdGlvbicsICdmaWxlTmFtZScsICdsaW5lTnVtYmVyJywgJ21lc3NhZ2UnLCAnbmFtZScsICdudW1iZXInLCAnc3RhY2snXTtcblxuZnVuY3Rpb24gRXhjZXB0aW9uKG1lc3NhZ2UsIG5vZGUpIHtcbiAgdmFyIGxvYyA9IG5vZGUgJiYgbm9kZS5sb2MsXG4gICAgICBsaW5lID0gdW5kZWZpbmVkLFxuICAgICAgY29sdW1uID0gdW5kZWZpbmVkO1xuICBpZiAobG9jKSB7XG4gICAgbGluZSA9IGxvYy5zdGFydC5saW5lO1xuICAgIGNvbHVtbiA9IGxvYy5zdGFydC5jb2x1bW47XG5cbiAgICBtZXNzYWdlICs9ICcgLSAnICsgbGluZSArICc6JyArIGNvbHVtbjtcbiAgfVxuXG4gIHZhciB0bXAgPSBFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBtZXNzYWdlKTtcblxuICAvLyBVbmZvcnR1bmF0ZWx5IGVycm9ycyBhcmUgbm90IGVudW1lcmFibGUgaW4gQ2hyb21lIChhdCBsZWFzdCksIHNvIGBmb3IgcHJvcCBpbiB0bXBgIGRvZXNuJ3Qgd29yay5cbiAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgZXJyb3JQcm9wcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgdGhpc1tlcnJvclByb3BzW2lkeF1dID0gdG1wW2Vycm9yUHJvcHNbaWR4XV07XG4gIH1cblxuICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBFeGNlcHRpb24pO1xuICB9XG5cbiAgaWYgKGxvYykge1xuICAgIHRoaXMubGluZU51bWJlciA9IGxpbmU7XG4gICAgdGhpcy5jb2x1bW4gPSBjb2x1bW47XG4gIH1cbn1cblxuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBFeGNlcHRpb247XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4vKmdsb2JhbCB3aW5kb3cgKi9cblxuZXhwb3J0c1snZGVmYXVsdCddID0gZnVuY3Rpb24gKEhhbmRsZWJhcnMpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgdmFyIHJvb3QgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHdpbmRvdyxcbiAgICAgICRIYW5kbGViYXJzID0gcm9vdC5IYW5kbGViYXJzO1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBIYW5kbGViYXJzLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHJvb3QuSGFuZGxlYmFycyA9PT0gSGFuZGxlYmFycykge1xuICAgICAgcm9vdC5IYW5kbGViYXJzID0gJEhhbmRsZWJhcnM7XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQgPSBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmNoZWNrUmV2aXNpb24gPSBjaGVja1JldmlzaW9uO1xuXG4vLyBUT0RPOiBSZW1vdmUgdGhpcyBsaW5lIGFuZCBicmVhayB1cCBjb21waWxlUGFydGlhbFxuXG5leHBvcnRzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG5leHBvcnRzLndyYXBQcm9ncmFtID0gd3JhcFByb2dyYW07XG5leHBvcnRzLnJlc29sdmVQYXJ0aWFsID0gcmVzb2x2ZVBhcnRpYWw7XG5leHBvcnRzLmludm9rZVBhcnRpYWwgPSBpbnZva2VQYXJ0aWFsO1xuZXhwb3J0cy5ub29wID0gbm9vcDtcblxudmFyIF9pbXBvcnQgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBVdGlscyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQpO1xuXG52YXIgX0V4Y2VwdGlvbiA9IHJlcXVpcmUoJy4vZXhjZXB0aW9uJyk7XG5cbnZhciBfRXhjZXB0aW9uMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9FeGNlcHRpb24pO1xuXG52YXIgX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUgPSByZXF1aXJlKCcuL2Jhc2UnKTtcblxuZnVuY3Rpb24gY2hlY2tSZXZpc2lvbihjb21waWxlckluZm8pIHtcbiAgdmFyIGNvbXBpbGVyUmV2aXNpb24gPSBjb21waWxlckluZm8gJiYgY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICBjdXJyZW50UmV2aXNpb24gPSBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5DT01QSUxFUl9SRVZJU0lPTjtcblxuICBpZiAoY29tcGlsZXJSZXZpc2lvbiAhPT0gY3VycmVudFJldmlzaW9uKSB7XG4gICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gPCBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgIHZhciBydW50aW1lVmVyc2lvbnMgPSBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5SRVZJU0lPTl9DSEFOR0VTW2N1cnJlbnRSZXZpc2lvbl0sXG4gICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lLlJFVklTSU9OX0NIQU5HRVNbY29tcGlsZXJSZXZpc2lvbl07XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYW4gb2xkZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gJyArICdQbGVhc2UgdXBkYXRlIHlvdXIgcHJlY29tcGlsZXIgdG8gYSBuZXdlciB2ZXJzaW9uICgnICsgcnVudGltZVZlcnNpb25zICsgJykgb3IgZG93bmdyYWRlIHlvdXIgcnVudGltZSB0byBhbiBvbGRlciB2ZXJzaW9uICgnICsgY29tcGlsZXJWZXJzaW9ucyArICcpLicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhIG5ld2VyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuICcgKyAnUGxlYXNlIHVwZGF0ZSB5b3VyIHJ1bnRpbWUgdG8gYSBuZXdlciB2ZXJzaW9uICgnICsgY29tcGlsZXJJbmZvWzFdICsgJykuJyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKHRlbXBsYXRlU3BlYywgZW52KSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGlmICghZW52KSB7XG4gICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ05vIGVudmlyb25tZW50IHBhc3NlZCB0byB0ZW1wbGF0ZScpO1xuICB9XG4gIGlmICghdGVtcGxhdGVTcGVjIHx8ICF0ZW1wbGF0ZVNwZWMubWFpbikge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdVbmtub3duIHRlbXBsYXRlIG9iamVjdDogJyArIHR5cGVvZiB0ZW1wbGF0ZVNwZWMpO1xuICB9XG5cbiAgLy8gTm90ZTogVXNpbmcgZW52LlZNIHJlZmVyZW5jZXMgcmF0aGVyIHRoYW4gbG9jYWwgdmFyIHJlZmVyZW5jZXMgdGhyb3VnaG91dCB0aGlzIHNlY3Rpb24gdG8gYWxsb3dcbiAgLy8gZm9yIGV4dGVybmFsIHVzZXJzIHRvIG92ZXJyaWRlIHRoZXNlIGFzIHBzdWVkby1zdXBwb3J0ZWQgQVBJcy5cbiAgZW52LlZNLmNoZWNrUmV2aXNpb24odGVtcGxhdGVTcGVjLmNvbXBpbGVyKTtcblxuICBmdW5jdGlvbiBpbnZva2VQYXJ0aWFsV3JhcHBlcihwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuaGFzaCkge1xuICAgICAgY29udGV4dCA9IFV0aWxzLmV4dGVuZCh7fSwgY29udGV4dCwgb3B0aW9ucy5oYXNoKTtcbiAgICB9XG5cbiAgICBwYXJ0aWFsID0gZW52LlZNLnJlc29sdmVQYXJ0aWFsLmNhbGwodGhpcywgcGFydGlhbCwgY29udGV4dCwgb3B0aW9ucyk7XG4gICAgdmFyIHJlc3VsdCA9IGVudi5WTS5pbnZva2VQYXJ0aWFsLmNhbGwodGhpcywgcGFydGlhbCwgY29udGV4dCwgb3B0aW9ucyk7XG5cbiAgICBpZiAocmVzdWx0ID09IG51bGwgJiYgZW52LmNvbXBpbGUpIHtcbiAgICAgIG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXSA9IGVudi5jb21waWxlKHBhcnRpYWwsIHRlbXBsYXRlU3BlYy5jb21waWxlck9wdGlvbnMsIGVudik7XG4gICAgICByZXN1bHQgPSBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV0oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfVxuICAgIGlmIChyZXN1bHQgIT0gbnVsbCkge1xuICAgICAgaWYgKG9wdGlvbnMuaW5kZW50KSB7XG4gICAgICAgIHZhciBsaW5lcyA9IHJlc3VsdC5zcGxpdCgnXFxuJyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGluZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCFsaW5lc1tpXSAmJiBpICsgMSA9PT0gbCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGluZXNbaV0gPSBvcHRpb25zLmluZGVudCArIGxpbmVzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IGxpbmVzLmpvaW4oJ1xcbicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RoZSBwYXJ0aWFsICcgKyBvcHRpb25zLm5hbWUgKyAnIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGUnKTtcbiAgICB9XG4gIH1cblxuICAvLyBKdXN0IGFkZCB3YXRlclxuICB2YXIgY29udGFpbmVyID0ge1xuICAgIHN0cmljdDogZnVuY3Rpb24gc3RyaWN0KG9iaiwgbmFtZSkge1xuICAgICAgaWYgKCEobmFtZSBpbiBvYmopKSB7XG4gICAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdcIicgKyBuYW1lICsgJ1wiIG5vdCBkZWZpbmVkIGluICcgKyBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9ialtuYW1lXTtcbiAgICB9LFxuICAgIGxvb2t1cDogZnVuY3Rpb24gbG9va3VwKGRlcHRocywgbmFtZSkge1xuICAgICAgdmFyIGxlbiA9IGRlcHRocy5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChkZXB0aHNbaV0gJiYgZGVwdGhzW2ldW25hbWVdICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gZGVwdGhzW2ldW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBsYW1iZGE6IGZ1bmN0aW9uIGxhbWJkYShjdXJyZW50LCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGN1cnJlbnQgPT09ICdmdW5jdGlvbicgPyBjdXJyZW50LmNhbGwoY29udGV4dCkgOiBjdXJyZW50O1xuICAgIH0sXG5cbiAgICBlc2NhcGVFeHByZXNzaW9uOiBVdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgIGludm9rZVBhcnRpYWw6IGludm9rZVBhcnRpYWxXcmFwcGVyLFxuXG4gICAgZm46IGZ1bmN0aW9uIGZuKGkpIHtcbiAgICAgIHJldHVybiB0ZW1wbGF0ZVNwZWNbaV07XG4gICAgfSxcblxuICAgIHByb2dyYW1zOiBbXSxcbiAgICBwcm9ncmFtOiBmdW5jdGlvbiBwcm9ncmFtKGksIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgICAgIHZhciBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0sXG4gICAgICAgICAgZm4gPSB0aGlzLmZuKGkpO1xuICAgICAgaWYgKGRhdGEgfHwgZGVwdGhzIHx8IGJsb2NrUGFyYW1zIHx8IGRlY2xhcmVkQmxvY2tQYXJhbXMpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB3cmFwUHJvZ3JhbSh0aGlzLCBpLCBmbiwgZGF0YSwgZGVjbGFyZWRCbG9ja1BhcmFtcywgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gICAgICB9IGVsc2UgaWYgKCFwcm9ncmFtV3JhcHBlcikge1xuICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSB3cmFwUHJvZ3JhbSh0aGlzLCBpLCBmbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvZ3JhbVdyYXBwZXI7XG4gICAgfSxcblxuICAgIGRhdGE6IGZ1bmN0aW9uIGRhdGEodmFsdWUsIGRlcHRoKSB7XG4gICAgICB3aGlsZSAodmFsdWUgJiYgZGVwdGgtLSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLl9wYXJlbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcbiAgICBtZXJnZTogZnVuY3Rpb24gbWVyZ2UocGFyYW0sIGNvbW1vbikge1xuICAgICAgdmFyIG9iaiA9IHBhcmFtIHx8IGNvbW1vbjtcblxuICAgICAgaWYgKHBhcmFtICYmIGNvbW1vbiAmJiBwYXJhbSAhPT0gY29tbW9uKSB7XG4gICAgICAgIG9iaiA9IFV0aWxzLmV4dGVuZCh7fSwgY29tbW9uLCBwYXJhbSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcblxuICAgIG5vb3A6IGVudi5WTS5ub29wLFxuICAgIGNvbXBpbGVySW5mbzogdGVtcGxhdGVTcGVjLmNvbXBpbGVyXG4gIH07XG5cbiAgZnVuY3Rpb24gcmV0KGNvbnRleHQpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMV07XG5cbiAgICB2YXIgZGF0YSA9IG9wdGlvbnMuZGF0YTtcblxuICAgIHJldC5fc2V0dXAob3B0aW9ucyk7XG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwgJiYgdGVtcGxhdGVTcGVjLnVzZURhdGEpIHtcbiAgICAgIGRhdGEgPSBpbml0RGF0YShjb250ZXh0LCBkYXRhKTtcbiAgICB9XG4gICAgdmFyIGRlcHRocyA9IHVuZGVmaW5lZCxcbiAgICAgICAgYmxvY2tQYXJhbXMgPSB0ZW1wbGF0ZVNwZWMudXNlQmxvY2tQYXJhbXMgPyBbXSA6IHVuZGVmaW5lZDtcbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocykge1xuICAgICAgZGVwdGhzID0gb3B0aW9ucy5kZXB0aHMgPyBbY29udGV4dF0uY29uY2F0KG9wdGlvbnMuZGVwdGhzKSA6IFtjb250ZXh0XTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGVtcGxhdGVTcGVjLm1haW4uY2FsbChjb250YWluZXIsIGNvbnRleHQsIGNvbnRhaW5lci5oZWxwZXJzLCBjb250YWluZXIucGFydGlhbHMsIGRhdGEsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICB9XG4gIHJldC5pc1RvcCA9IHRydWU7XG5cbiAgcmV0Ll9zZXR1cCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwpIHtcbiAgICAgIGNvbnRhaW5lci5oZWxwZXJzID0gY29udGFpbmVyLm1lcmdlKG9wdGlvbnMuaGVscGVycywgZW52LmhlbHBlcnMpO1xuXG4gICAgICBpZiAodGVtcGxhdGVTcGVjLnVzZVBhcnRpYWwpIHtcbiAgICAgICAgY29udGFpbmVyLnBhcnRpYWxzID0gY29udGFpbmVyLm1lcmdlKG9wdGlvbnMucGFydGlhbHMsIGVudi5wYXJ0aWFscyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRhaW5lci5oZWxwZXJzID0gb3B0aW9ucy5oZWxwZXJzO1xuICAgICAgY29udGFpbmVyLnBhcnRpYWxzID0gb3B0aW9ucy5wYXJ0aWFscztcbiAgICB9XG4gIH07XG5cbiAgcmV0Ll9jaGlsZCA9IGZ1bmN0aW9uIChpLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VCbG9ja1BhcmFtcyAmJiAhYmxvY2tQYXJhbXMpIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdtdXN0IHBhc3MgYmxvY2sgcGFyYW1zJyk7XG4gICAgfVxuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlRGVwdGhzICYmICFkZXB0aHMpIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdtdXN0IHBhc3MgcGFyZW50IGRlcHRocycpO1xuICAgIH1cblxuICAgIHJldHVybiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIHRlbXBsYXRlU3BlY1tpXSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gIH07XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIHdyYXBQcm9ncmFtKGNvbnRhaW5lciwgaSwgZm4sIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgZnVuY3Rpb24gcHJvZyhjb250ZXh0KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgcmV0dXJuIGZuLmNhbGwoY29udGFpbmVyLCBjb250ZXh0LCBjb250YWluZXIuaGVscGVycywgY29udGFpbmVyLnBhcnRpYWxzLCBvcHRpb25zLmRhdGEgfHwgZGF0YSwgYmxvY2tQYXJhbXMgJiYgW29wdGlvbnMuYmxvY2tQYXJhbXNdLmNvbmNhdChibG9ja1BhcmFtcyksIGRlcHRocyAmJiBbY29udGV4dF0uY29uY2F0KGRlcHRocykpO1xuICB9XG4gIHByb2cucHJvZ3JhbSA9IGk7XG4gIHByb2cuZGVwdGggPSBkZXB0aHMgPyBkZXB0aHMubGVuZ3RoIDogMDtcbiAgcHJvZy5ibG9ja1BhcmFtcyA9IGRlY2xhcmVkQmxvY2tQYXJhbXMgfHwgMDtcbiAgcmV0dXJuIHByb2c7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVQYXJ0aWFsKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgaWYgKCFwYXJ0aWFsKSB7XG4gICAgcGFydGlhbCA9IG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXTtcbiAgfSBlbHNlIGlmICghcGFydGlhbC5jYWxsICYmICFvcHRpb25zLm5hbWUpIHtcbiAgICAvLyBUaGlzIGlzIGEgZHluYW1pYyBwYXJ0aWFsIHRoYXQgcmV0dXJuZWQgYSBzdHJpbmdcbiAgICBvcHRpb25zLm5hbWUgPSBwYXJ0aWFsO1xuICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW3BhcnRpYWxdO1xuICB9XG4gIHJldHVybiBwYXJ0aWFsO1xufVxuXG5mdW5jdGlvbiBpbnZva2VQYXJ0aWFsKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5wYXJ0aWFsID0gdHJ1ZTtcblxuICBpZiAocGFydGlhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RoZSBwYXJ0aWFsICcgKyBvcHRpb25zLm5hbWUgKyAnIGNvdWxkIG5vdCBiZSBmb3VuZCcpO1xuICB9IGVsc2UgaWYgKHBhcnRpYWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7XG4gIHJldHVybiAnJztcbn1cblxuZnVuY3Rpb24gaW5pdERhdGEoY29udGV4dCwgZGF0YSkge1xuICBpZiAoIWRhdGEgfHwgISgncm9vdCcgaW4gZGF0YSkpIHtcbiAgICBkYXRhID0gZGF0YSA/IF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lLmNyZWF0ZUZyYW1lKGRhdGEpIDoge307XG4gICAgZGF0YS5yb290ID0gY29udGV4dDtcbiAgfVxuICByZXR1cm4gZGF0YTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4vLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuZnVuY3Rpb24gU2FmZVN0cmluZyhzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59XG5cblNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gU2FmZVN0cmluZy5wcm90b3R5cGUudG9IVE1MID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gJycgKyB0aGlzLnN0cmluZztcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNhZmVTdHJpbmc7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmV4dGVuZCA9IGV4dGVuZDtcblxuLy8gT2xkZXIgSUUgdmVyc2lvbnMgZG8gbm90IGRpcmVjdGx5IHN1cHBvcnQgaW5kZXhPZiBzbyB3ZSBtdXN0IGltcGxlbWVudCBvdXIgb3duLCBzYWRseS5cbmV4cG9ydHMuaW5kZXhPZiA9IGluZGV4T2Y7XG5leHBvcnRzLmVzY2FwZUV4cHJlc3Npb24gPSBlc2NhcGVFeHByZXNzaW9uO1xuZXhwb3J0cy5pc0VtcHR5ID0gaXNFbXB0eTtcbmV4cG9ydHMuYmxvY2tQYXJhbXMgPSBibG9ja1BhcmFtcztcbmV4cG9ydHMuYXBwZW5kQ29udGV4dFBhdGggPSBhcHBlbmRDb250ZXh0UGF0aDtcbnZhciBlc2NhcGUgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgJ1xcJyc6ICcmI3gyNzsnLFxuICAnYCc6ICcmI3g2MDsnXG59O1xuXG52YXIgYmFkQ2hhcnMgPSAvWyY8PlwiJ2BdL2csXG4gICAgcG9zc2libGUgPSAvWyY8PlwiJ2BdLztcblxuZnVuY3Rpb24gZXNjYXBlQ2hhcihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdO1xufVxuXG5mdW5jdGlvbiBleHRlbmQob2JqIC8qICwgLi4uc291cmNlICovKSB7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGFyZ3VtZW50c1tpXSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhcmd1bWVudHNbaV0sIGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSBhcmd1bWVudHNbaV1ba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5leHBvcnRzLnRvU3RyaW5nID0gdG9TdHJpbmc7XG4vLyBTb3VyY2VkIGZyb20gbG9kYXNoXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYmVzdGllanMvbG9kYXNoL2Jsb2IvbWFzdGVyL0xJQ0VOU0UudHh0XG4vKmVzbGludC1kaXNhYmxlIGZ1bmMtc3R5bGUsIG5vLXZhciAqL1xudmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59O1xuLy8gZmFsbGJhY2sgZm9yIG9sZGVyIHZlcnNpb25zIG9mIENocm9tZSBhbmQgU2FmYXJpXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuaWYgKGlzRnVuY3Rpb24oL3gvKSkge1xuICBleHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgfTtcbn1cbnZhciBpc0Z1bmN0aW9uO1xuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcbi8qZXNsaW50LWVuYWJsZSBmdW5jLXN0eWxlLCBuby12YXIgKi9cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgPyB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJyA6IGZhbHNlO1xufTtleHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpbmRleE9mKGFycmF5LCB2YWx1ZSkge1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoYXJyYXlbaV0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVFeHByZXNzaW9uKHN0cmluZykge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gICAgaWYgKHN0cmluZyAmJiBzdHJpbmcudG9IVE1MKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLnRvSFRNTCgpO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nID09IG51bGwpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9IGVsc2UgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcgKyAnJztcbiAgICB9XG5cbiAgICAvLyBGb3JjZSBhIHN0cmluZyBjb252ZXJzaW9uIGFzIHRoaXMgd2lsbCBiZSBkb25lIGJ5IHRoZSBhcHBlbmQgcmVnYXJkbGVzcyBhbmRcbiAgICAvLyB0aGUgcmVnZXggdGVzdCB3aWxsIGRvIHRoaXMgdHJhbnNwYXJlbnRseSBiZWhpbmQgdGhlIHNjZW5lcywgY2F1c2luZyBpc3N1ZXMgaWZcbiAgICAvLyBhbiBvYmplY3QncyB0byBzdHJpbmcgaGFzIGVzY2FwZWQgY2hhcmFjdGVycyBpbiBpdC5cbiAgICBzdHJpbmcgPSAnJyArIHN0cmluZztcbiAgfVxuXG4gIGlmICghcG9zc2libGUudGVzdChzdHJpbmcpKSB7XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xufVxuXG5mdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XG4gIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gYmxvY2tQYXJhbXMocGFyYW1zLCBpZHMpIHtcbiAgcGFyYW1zLnBhdGggPSBpZHM7XG4gIHJldHVybiBwYXJhbXM7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZENvbnRleHRQYXRoKGNvbnRleHRQYXRoLCBpZCkge1xuICByZXR1cm4gKGNvbnRleHRQYXRoID8gY29udGV4dFBhdGggKyAnLicgOiAnJykgKyBpZDtcbn0iLCIvLyBDcmVhdGUgYSBzaW1wbGUgcGF0aCBhbGlhcyB0byBhbGxvdyBicm93c2VyaWZ5IHRvIHJlc29sdmVcbi8vIHRoZSBydW50aW1lIG9uIGEgc3VwcG9ydGVkIHBhdGguXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZGlzdC9janMvaGFuZGxlYmFycy5ydW50aW1lJylbJ2RlZmF1bHQnXTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImhhbmRsZWJhcnMvcnVudGltZVwiKVtcImRlZmF1bHRcIl07XG4iLCJ2YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vLi4vY29uZmlndXJhdGlvbi5qcycpO1xyXG5cclxudmFyIEFjdGlvbnNNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblx0dXJsUm9vdDogY29uZmlnLnVybCArICdBY3Rpb24vJ1xyXG59KTtcclxubW9kdWxlLmV4cG9ydHMgPSBBY3Rpb25zTW9kZWw7IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZ3VyYXRpb24uanMnKTtcclxudmFyIEFjdGlvbnNNb2RlbCA9IHJlcXVpcmUoJy4vQWN0aW9uJyk7XHJcblxyXG52YXIgQWN0aW9uc0NvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XHJcblx0bW9kZWw6IEFjdGlvbnNNb2RlbCxcclxuXHR1cmw6IGNvbmZpZy51cmwgKyAnQWN0aW9uLydcclxufSk7XHJcblxyXG4gbW9kdWxlLmV4cG9ydHMgPSBBY3Rpb25zQ29sbGVjdGlvbjsiLCJ2YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vLi4vY29uZmlndXJhdGlvbi5qcycpO1xyXG5cclxudmFyIEFwcHJlbmFudHNNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblx0dXJsUm9vdDogY29uZmlnLnVybCArICdBcHByZW5hbnQvJ1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXBwcmVuYW50c01vZGVsOyIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcbnZhciBBcHByZW5hbnRzTW9kZWwgPSByZXF1aXJlKCcuL0FwcHJlbmFudCcpO1xyXG5cclxudmFyIEFwcHJlbmFudHNDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xyXG5cdG1vZGVsOiBBcHByZW5hbnRzTW9kZWwsXHJcblx0dXJsOiBjb25maWcudXJsICsgJ0FwcHJlbmFudC8nXHJcbn0pO1xyXG5cclxuIG1vZHVsZS5leHBvcnRzID0gQXBwcmVuYW50c0NvbGxlY3Rpb247IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZ3VyYXRpb24uanMnKTtcclxuXHJcbnZhciBFc3RfYXNzb2NpZU1vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuXHR1cmxSb290OiBjb25maWcudXJsICsgJ0VzdEFzc29jaWUvJ1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRXN0X2Fzc29jaWVNb2RlbDsiLCJ2YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vLi4vY29uZmlndXJhdGlvbi5qcycpO1xyXG5cclxudmFyIEV2YWx1YXRpb25Nb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFdmFsdWF0aW9uTW9kZWw7IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZ3VyYXRpb24uanMnKTtcclxuXHJcbnZhciBGaXhlTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG5cdHVybFJvb3Q6IGNvbmZpZy51cmwgKyAnTWlzc2lvbi8nXHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaXhlTW9kZWw7IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZ3VyYXRpb24uanMnKTtcclxuXHJcbnZhciBGaXhlTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG5cdHVybFJvb3Q6IGNvbmZpZy51cmwgKyAnRml4ZS8nXHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaXhlTW9kZWw7IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZ3VyYXRpb24uanMnKTtcclxuXHJcbnZhciBJbmRpY2F0ZXVyc01vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuXHR1cmxSb290OiBjb25maWcudXJsICsgJ0luZGljYXRldXIvJ1xyXG59KTtcclxubW9kdWxlLmV4cG9ydHMgPSBJbmRpY2F0ZXVyc01vZGVsOyIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcbnZhciBJbmRpY2F0ZXVyc01vZGVsID0gcmVxdWlyZSgnLi9JbmRpY2F0ZXVyJyk7XHJcblxyXG52YXIgSW5kaWNhdGV1cnNDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xyXG5cdG1vZGVsOiBJbmRpY2F0ZXVyc01vZGVsLFxyXG5cdHVybDogY29uZmlnLnVybCArICdJbmRpY2F0ZXVyLydcclxufSk7XHJcblxyXG4gbW9kdWxlLmV4cG9ydHMgPSBJbmRpY2F0ZXVyc0NvbGxlY3Rpb247IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZ3VyYXRpb24uanMnKTtcclxuXHJcbnZhciBKZXV4TW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG5cdHVybFJvb3Q6IGNvbmZpZy51cmwgKyAnSmV1LydcclxufSk7XHJcbm1vZHVsZS5leHBvcnRzID0gSmV1eE1vZGVsOyIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcbnZhciBKZXV4TW9kZWwgPSByZXF1aXJlKCcuL0pldScpO1xyXG5cclxudmFyIEpldXhDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xyXG5cdG1vZGVsOiBKZXV4TW9kZWwsXHJcblx0dXJsOiBjb25maWcudXJsICsgJ0pldS8nXHJcbn0pO1xyXG5cclxuIG1vZHVsZS5leHBvcnRzID0gSmV1eENvbGxlY3Rpb247IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZ3VyYXRpb24uanMnKTtcclxuXHJcbnZhciBNaXNzaW9uc01vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuXHR1cmxSb290OiBjb25maWcudXJsKyAnTWlzc2lvbi8nXHJcbn0pO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE1pc3Npb25zTW9kZWw7IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZ3VyYXRpb24uanMnKTtcclxuXHJcbnZhciBPYmplY3RpZnNNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblx0dXJsUm9vdDogY29uZmlnLnVybCArICdPYmplY3RpZi8nXHJcbn0pO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdGlmc01vZGVsOyIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcbnZhciBPYmplY3RpZnNNb2RlbCA9IHJlcXVpcmUoJy4vT2JqZWN0aWYnKTtcclxuXHJcbnZhciBPYmplY3RpZk1pc3Npb25Db2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xyXG5cdG1vZGVsOiBPYmplY3RpZnNNb2RlbCxcclxuXHR1cmw6IGNvbmZpZy51cmxcclxufSk7XHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0aWZNaXNzaW9uQ29sbGVjdGlvbjsiLCJ2YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vLi4vY29uZmlndXJhdGlvbi5qcycpO1xyXG52YXIgT2JqZWN0aWZzTW9kZWwgPSByZXF1aXJlKCcuL09iamVjdGlmJyk7XHJcblxyXG52YXIgT2JqZWN0aWZzQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcclxuXHRtb2RlbDogT2JqZWN0aWZzTW9kZWwsXHJcblx0dXJsOiBjb25maWcudXJsICsgJ09iamVjdGlmLydcclxufSk7XHJcblxyXG4gbW9kdWxlLmV4cG9ydHMgPSBPYmplY3RpZnNDb2xsZWN0aW9uOyIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcblxyXG52YXIgUG9zc2VkZU1vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuXHR1cmxSb290OiBjb25maWcudXJsICsgJ1Bvc3NlZGUvJ1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUG9zc2VkZU1vZGVsOyIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcblxyXG52YXIgUmVnbGVzTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG5cdHVybFJvb3Q6IGNvbmZpZy51cmwgKyAnUmVnbGUvJy8qLFxyXG5cdHVybDogY29uZmlnLnVybCArICdSZWdsZS8nKi9cclxufSk7XHJcbm1vZHVsZS5leHBvcnRzID0gUmVnbGVzTW9kZWw7IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZ3VyYXRpb24uanMnKTtcclxudmFyIFJlZ2xlc01vZGVsID0gcmVxdWlyZSgnLi9SZWdsZScpO1xyXG5cclxudmFyIFJlZ2xlc0NvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XHJcblx0bW9kZWw6IFJlZ2xlc01vZGVsLFxyXG5cdHVybDogY29uZmlnLnVybCArICdSZWdsZS8nXHJcbn0pO1xyXG5cclxuIG1vZHVsZS5leHBvcnRzID0gUmVnbGVzQ29sbGVjdGlvbjsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwianVtYm90cm9uXFxcIj5cXHJcXG5cdDxwPkJpZW52ZW51ZSBzdXIgbCdhcHBsaWNhdGlvbiBkJ8OpdmFsdWF0aW9uIGRlcyBhcHByZW50aXMgcGlsb3RlLjwvcD5cXHJcXG5cdDxwPjxhIGhyZWY9XFxcIiNBcHByZW5hbnRzXFxcIj5Db21tZW5jZXogw6Agw6l2YWx1ZXIgdW4gYXBwcmVuYW50LjwvYT48L3A+XFxyXFxuXHQ8cD5Wb3VzIHBvdXZleiDDqWdhbGVtZW50IG1vZGlmaWVyIGxlcyBqZXV4IGQnw6l2YWx1YXRpb24gZXQgbGV1cnMgc291cyDDqWzDqW1lbnRzLjwvcD5cXHJcXG5cdDxwPjxpPlxcXCJGbHkgc2FmZSAhXFxcIjwvaT4gU2NvdHQgTWFubGV5PC9wPlxcclxcbjwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCJ2YXIgdGVtcGxhdGUgPSByZXF1aXJlKFwiLi9BY2N1ZWlsLmhic1wiKTtcclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcblx0Y29udGVudCA6ICQoJyNjb250ZW50JyksXHJcblx0dGl0bGUgOiAkKCcjdGl0bGUnKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdCQodGhpcy50aXRsZSkuaHRtbChcIlByb2pldCBwZXJtaXMgcGlzdGVcIik7XHJcblx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZSgpKTtcclxuXHR9XHJcbn0pOyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiXHRcdFx0XHRcdFx0PHRhYmxlIGNsYXNzPVxcXCJ0YWJsZVxcXCIgaWQ9XFxcInRhYlJlZ2xlXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHRcdDx0aGVhZD5cXHJcXG5cdFx0XHRcdFx0XHRcdFx0PHRyPlxcclxcblx0XHRcdFx0XHRcdFx0XHRcdDx0aD5JZGVudGlmaWFudDwvdGg+XFxyXFxuXHRcdFx0XHRcdFx0XHRcdFx0PHRoPkxpYmVsbMOpPC90aD5cXHJcXG5cdFx0XHRcdFx0XHRcdFx0XHQ8dGg+PC90aD5cXHJcXG5cdFx0XHRcdFx0XHRcdFx0PC90cj5cXHJcXG5cdFx0XHRcdFx0XHRcdDwvdGhlYWQ+XFxyXFxuXHRcdFx0XHRcdFx0XHQ8dGJvZHk+XFxyXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5yZWdsZXMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcdFx0XHRcdFx0XHRcdDwvdGJvZHk+XFxyXFxuXHRcdFx0XHRcdFx0PC90YWJsZT5cXHJcXG5cIjtcbn0sXCIyXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT10aGlzLmxhbWJkYSwgYWxpYXMyPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdFx0XHRcdFx0XHRcdFx0XHQ8dHIgb25DbGljaz1cXFwiZG9jdW1lbnQubG9jYXRpb249JyNSZWdsZXMvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtcmVnbGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCInXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1yZWdsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYnJlZ2xlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdFx0XHRcdFx0XHQ8L3RyPlxcclxcblwiO1xufSxcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT10aGlzLmxhbWJkYSwgYWxpYXMyPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCI8dGFibGUgY2xhc3M9XFxcInRhYmxlXFxcIj5cXHJcXG5cdDx0aGVhZD5cXHJcXG5cdFx0PHRyPlxcclxcblx0XHRcdDx0aD5JZGVudGlmaWFudDwvdGg+XFxyXFxuXHRcdFx0PHRoPklEIEFjdGlvbiBSZXF1aXNlPC90aD5cXHJcXG5cdFx0XHQ8dGg+TGliZWxsw6kgQWN0aW9uPC90aD5cXHJcXG5cdFx0XHQ8dGg+U2NvcmUgbWluPC90aD5cXHJcXG5cdFx0XHQ8dGg+UmVnbGVzPC90aD5cXHJcXG5cdFx0XHQ8dGg+PC90aD5cXHJcXG5cdFx0PC90cj5cXHJcXG5cdDwvdGhlYWQ+XFxyXFxuXHQ8dGJvZHk+XFxyXFxuXHRcdFx0PHRyPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFjdGlvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hY3Rpb24gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmFjdE51bWFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYWN0aW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJhY3Rpb24gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFjdGlvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuc2NvcmVtaW4gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnNbJ2lmJ10uY2FsbChkZXB0aDAsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnJlZ2xlcyA6IGRlcHRoMCkse1wibmFtZVwiOlwiaWZcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcdFx0XHRcdDwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNBY3Rpb25zL01vZGlmaWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFjdGlvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWxcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI0FjdGlvbnMvU3VwcHJpbWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFjdGlvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi10cmFzaFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0PC90ZD5cXHJcXG5cdFx0XHQ8L3RyPlxcclxcblx0PC90Ym9keT5cXHJcXG48L3RhYmxlPlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCJ2YXIgYWN0aW9uTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9BY3Rpb25zL0FjdGlvbicpO1xyXG52YXIgcmVnbGVNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL1JlZ2xlcy9SZWdsZScpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL0FjdGlvbi5oYnMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHBhZ2VOYW1lIDogJCgndGl0bGUnKSxcclxuXHR0aXRsZSA6ICQoJyN0aXRsZScpLFxyXG5cdGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHQvL0FwcGVsw6kgYXUgbW9tZW50IGRlIGwnaW5zdGFuY2lhdGlvblx0XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHR9LFxyXG5cclxuXHQvL0ZvbmN0aW9uIGNoYXJnw6llIGR1IHJlbmR1XHJcblx0cmVuZGVyOiBmdW5jdGlvbihpZCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgcmVnbGVNb2RlbCgpO1xyXG5cdFx0bW9kZWwudXJsID0gbW9kZWwudXJsUm9vdCsnL0FjdGlvbi8nK2lkO1xyXG5cclxuXHRcdCQud2hlbiggbmV3IGFjdGlvbk1vZGVsKHtcImlkXCI6aWR9KS5mZXRjaCgpLG1vZGVsLmZldGNoKCkpXHJcblx0XHQuZG9uZShfLmJpbmQoZnVuY3Rpb24ob2JqZWN0aWYsYWN0aW9ucyl7XHJcblx0XHRcdHRoaXMucmVuZGVyUmVzdWx0YXQob2JqZWN0aWYsYWN0aW9ucyk7XHJcblx0XHR9LHRoaXMpKTtcclxuXHRcdCQodGhpcy5wYWdlTmFtZSkuaHRtbChcIkTDqXRhaWwgQWN0aW9uXCIpO1xyXG5cdFx0JCh0aGlzLnRpdGxlKS5odG1sKFwiSW5mb3JtYXRpb25zIEFjdGlvblwiKTtcclxuXHR9LFxyXG5cclxuXHRyZW5kZXJSZXN1bHRhdDogZnVuY3Rpb24ocmVzcG9uc2UsIHJlc3BvbnNlUmVnbGVzKXtcclxuXHJcblx0XHQvLyBSZWZhY3RvcmluZyBsaXN0IGRlcyByw6hnbGUgcG91ciBxdWUgw6dhIHNvaXQgcGx1cyBsaXNpYmxlXHJcblx0XHR2YXIgUmVnbGUgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG5cdCAgXHR9KTtcclxuXHRcdHZhciBDb2xsZWN0aW9uUmVnbGUgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XHJcblx0XHQgIG1vZGVsOiBSZWdsZVxyXG5cdFx0fSk7XHJcblx0XHR2YXIgY291bnQgPSAwO1xyXG5cdFx0dmFyIGxpc3RSZWdsZSA9IG5ldyBDb2xsZWN0aW9uUmVnbGUoKTtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgIHJlc3BvbnNlUmVnbGVzWzBdLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHZhciByZWdsZSA9IG5ldyBSZWdsZShyZXNwb25zZVJlZ2xlc1swXVtpXVswXSk7XHJcblx0XHRcdGxpc3RSZWdsZS5hZGQoW3JlZ2xlXSk7XHJcblx0XHRcdGNvdW50Kys7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gUGFzc2UgbGVzIMOpbMOpbWVudCDDoCBsYSB2dWVcclxuXHRcdGlmKGNvdW50ICE9PTAgKXtcclxuXHRcdFx0JCh0aGlzLmNvbnRlbnQpLmh0bWwodGVtcGxhdGUoe2FjdGlvbjogcmVzcG9uc2VbMF0sIHJlZ2xlczpsaXN0UmVnbGUubW9kZWxzfSkpO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdCQodGhpcy5jb250ZW50KS5odG1sKHRlbXBsYXRlKHthY3Rpb246IHJlc3BvbnNlWzBdfSkpO1xyXG5cdFx0fVxyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0XHRcdDx0ciBvbkNsaWNrPVxcXCJkb2N1bWVudC5sb2NhdGlvbj0nI0FjdGlvbnMvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiJ1xcXCI+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hY3ROdW1hY3Rpb24gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYmFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuc2NvcmVtaW4gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjQWN0aW9ucy9Nb2RpZmllci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1hY3Rpb24gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcclxcblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjQWN0aW9ucy9TdXBwcmltZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi10cmFzaFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0PC90ZD5cXHJcXG5cdFx0XHQ8L3RyPlxcclxcblwiO1xufSxcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiPGEgaHJlZj1cXFwiI0FjdGlvbnMvQWpvdXRcXFwiPlxcclxcblx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLXN1Y2Nlc3NcXFwiPlxcclxcblx0ICA8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPiBBam91dGVyIEFjdGlvblxcclxcblx0PC9idXR0b24+XFxyXFxuPC9hPlxcclxcblxcclxcbjx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcblx0PHRoZWFkPlxcclxcblx0XHQ8dHI+XFxyXFxuXHRcdFx0PHRoPklkZW50aWZpYW50PC90aD5cXHJcXG5cdFx0XHQ8dGg+SUQgYWN0aW9uIHJlcXVpc2U8L3RoPlxcclxcblx0XHRcdDx0aD5MaWJlbGzDqTwvdGg+XFxyXFxuXHRcdFx0PHRoPlNjb3JlIG1pbmltYWw8L3RoPlxcclxcblx0XHRcdDx0aD48L3RoPlxcclxcblx0XHQ8L3RyPlxcclxcblx0PC90aGVhZD5cXHJcXG5cdDx0Ym9keT5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFjdGlvbnMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcdDwvdGJvZHk+XFxyXFxuPC90YWJsZT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIGFjdGlvbnNNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0FjdGlvbnMvQWN0aW9uc0xpc3QnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9BY3Rpb25zLmhicycpO1xyXG5cclxudmFyIHZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcblx0cGFnZU5hbWUgOiAkKCd0aXRsZScpLFxyXG5cdHRpdGxlIDogJCgnI3RpdGxlJyksXHJcblx0Y29udGVudCA6ICQoJyNjb250ZW50JyksXHJcblxyXG5cdC8vQXBwZWzDqSBhdSBtb21lbnQgZGUgbCdpbnN0YW5jaWF0aW9uXHRcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdC8vRm9uY3Rpb24gY2hhcmfDqWUgZHUgcmVuZHVcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgYWN0aW9uc01vZGVsKCkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5yZW5kZXJSZXN1bHRhdCwgdGhpcylcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLnBhZ2VOYW1lKS5odG1sKFwiTGlzdGUgZGVzIEFjdGlvbnNcIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJMaXN0ZSBkZXMgQWN0aW9uc1wiKTtcclxuXHR9LFxyXG5cclxuXHRyZW5kZXJSZXN1bHRhdDogZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0JCh0aGlzLmNvbnRlbnQpLmh0bWwodGVtcGxhdGUoe2FjdGlvbnM6IHJlc3BvbnNlLnRvQXJyYXkoKX0pKTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsInZhciBhY3Rpb25Nb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0FjdGlvbnMvQWN0aW9uJyk7XHJcbnZhciBwb3NzZWRlTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9Qb3NzZWRlL1Bvc3NlZGUnKTtcclxudmFyIG1vZGFsID0gcmVxdWlyZSgnLi4vR2xvYmFsL21vZGFsLmpzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHZhciBtb2RlbCA9IG5ldyBhY3Rpb25Nb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5jb25maXJtLHRoaXMpXHJcblx0XHR9KTtcclxuXHJcblx0fSxcclxuXHJcblx0cmVuZGVyUG9zc2VkZTogZnVuY3Rpb24oaWQsaVJlZ2xlKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIlN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiQ29uZmlybWVyIGxhIHN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEZvb3RlcjogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIiBpZD1cImFubnVsRGVsZXRlXCI+QW5udWxlcjwvYnV0dG9uPjxhIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgYnRuLW9rXCIgaWQ9XCJjb25maXJtRGVsZXRlXCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIj5TdXBwcmltZXI8L2E+J1xyXG5cdFx0fSk7XHJcblx0XHQkKCcjY29uZmlybURlbGV0ZScpLm9uKCdjbGljaycsXy5iaW5kKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHR2YXIgbW9kZWwgPSBuZXcgcG9zc2VkZU1vZGVsKHtcIm51bWFjdGlvblwiOmlkLCBcIm51bXJlZ2xlXCI6aVJlZ2xlfSkuZGVzdHJveSh7XHJcblx0XHRcdFx0c3VjY2VzczogXy5iaW5kKHRoaXMudmFsaWQsdGhpcyksXHJcblx0XHRcdFx0ZXJyb3I6IF8uYmluZCh0aGlzLnNob3dFcnJvck1vZGFsLHRoaXMpXHJcblx0XHRcdH0pO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0XHQkKCcjYW5udWxEZWxldGUnKS5vbignY2xpY2snLF8uYmluZChmdW5jdGlvbihlKXtcclxuXHRcdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI0FjdGlvbnMvTW9kaWZpZXIvJytpZCwge3RyaWdnZXI6dHJ1ZX0pO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0fSxcclxuXHJcblx0Y29uZmlybTpmdW5jdGlvbihhY3Rpb24pe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJDb25maXJtZXIgbGEgc3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsRm9vdGVyOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBkYXRhLWRpc21pc3M9XCJtb2RhbFwiIGlkPVwiYW5udWxEZWxldGVcIj5Bbm51bGVyPC9idXR0b24+PGEgY2xhc3M9XCJidG4gYnRuLWRhbmdlciBidG4tb2tcIiBpZD1cImNvbmZpcm1EZWxldGVcIiBkYXRhLWRpc21pc3M9XCJtb2RhbFwiPlN1cHByaW1lcjwvYT4nXHJcblx0XHR9KTtcclxuXHRcdCQoJyNjb25maXJtRGVsZXRlJykub24oJ2NsaWNrJyxfLmJpbmQoZnVuY3Rpb24oZSl7XHJcblx0XHRcdHZhciBtb2RlbCA9IG5ldyBhY3Rpb25Nb2RlbCh7XCJpZFwiOmFjdGlvbi5pZH0pLmRlc3Ryb3koe1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLnZhbGlkLHRoaXMpLFxyXG5cdFx0XHRcdGVycm9yOiBfLmJpbmQodGhpcy5zaG93RXJyb3JNb2RhbCx0aGlzKVxyXG5cdFx0XHR9KTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdFx0JCgnI2FubnVsRGVsZXRlJykub24oJ2NsaWNrJyxfLmJpbmQoZnVuY3Rpb24oZSl7XHJcblx0XHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoJyNBY3Rpb25zJywge3RyaWdnZXI6dHJ1ZX0pO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0fSxcclxuXHJcblx0dmFsaWQ6ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIlN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiU3VwcHJlc3Npb24gZWZmZWN1w6llXCJcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQkKCcubW9kYWwtYmFja2Ryb3AnKS5yZW1vdmUoKTtcclxuXHRcdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI0FjdGlvbnMnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0fSxcclxuXHJcblx0c2hvd0Vycm9yTW9kYWw6IGZ1bmN0aW9uKG9iamVjdCxlcnJvcil7XHJcblx0XHRpZiAoZXJyb3Iuc3RhdHVzPT0yMDEpe1xyXG5cdFx0XHR0aGlzLnNob3dNb2RhbCgpO1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIkVycmV1ciBcIitlcnJvci5zdGF0dXMsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiRXJyZXVyIGxvcnMgZGUgbGEgc3VwcHJlc3Npb24gOiBcIiArIGVycm9yLnN0YXR1c1RleHQsXHJcblx0XHQgXHRtb2RhbEVycm9yOiB0cnVlXHJcblx0XHR9KTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXIsIGFsaWFzMT1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMj1cImZ1bmN0aW9uXCIsIGFsaWFzMz10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5udW1hY3Rpb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm51bWFjdGlvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtYWN0aW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubnVtYWN0aW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5udW1hY3Rpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm51bWFjdGlvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIgXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxpYmFjdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGliYWN0aW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJsaWJhY3Rpb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9vcHRpb24+XFxyXFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIiAgICAgIDx0cj5cXHJcXG4gICAgICAgIDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1yZWdsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYnJlZ2xlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD48dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuc2NvcmVtaW4gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcbiAgICAgICAgPHRkPjxhIGhyZWY9XFxcIiNSZWdsZXMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtcmVnbGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcclxcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG4gICAgICAgICAgPC9hPlxcclxcbiAgICAgIDwvdGQ+XFxyXFxuICAgICAgICA8dGQ+PGEgaHJlZj1cXFwiI0FjdGlvbnMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uYWN0aW9uIDogZGVwdGhzWzFdKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1hY3Rpb24gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCIvUmVnbGUvU3VwcHJpbWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bXJlZ2xlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXHJcXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXRyYXNoXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPlxcclxcbiAgICAgICAgICAgIDwvYT5cXHJcXG4gICAgICAgIDwvdGQ+XFxyXFxuICAgICAgPC90cj5cXHJcXG5cIjtcbn0sXCI1XCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXIsIGFsaWFzMT1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMj1cImZ1bmN0aW9uXCIsIGFsaWFzMz10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bXJlZ2xlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5udW1yZWdsZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtcmVnbGVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5udW1yZWdsZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtcmVnbGUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm51bXJlZ2xlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiBcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGlicmVnbGUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxpYnJlZ2xlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJsaWJyZWdsZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L29wdGlvbj5cXHJcXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIiAgPGZvcm0gaWQ9XFxcImZvcm1QdXRBY3Rpb25cXFwiIG1ldGhvZD1cXFwicG9zdFxcXCI+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXHJcXG4gICA8bGFiZWwgZm9yPVxcXCJhY3ROdW1hY3Rpb25cXFwiPkFjdGlvbiByZXF1aXNlPC9sYWJlbD5cXHJcXG4gICAgPHNlbGVjdCAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgaWQ9XFxcImFjdE51bWFjdGlvblxcXCI+XFxyXFxuICAgICAgPG9wdGlvbiB2YWx1ZT1udWxsPiBBdWN1biA8L29wdGlvbj5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFjdGlvbnMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgICAgPC9zZWxlY3Q+XFxyXFxuICA8L2Rpdj5cXHJcXG4gIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcclxcbiAgICA8bGFiZWwgZm9yPVxcXCJsaWJhY3Rpb25cXFwiPmxpYmFjdGlvbjwvbGFiZWw+XFxyXFxuICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIiBpZD1cXFwibGliYWN0aW9uXFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50cmV6IHVuIGxpYmVsbMOpXFxcIiB2YWx1ZT1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYWN0aW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJhY3Rpb24gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIHJlcXVpcmVkPlxcclxcbiAgPC9kaXY+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXHJcXG4gICAgPGxhYmVsIGZvcj1cXFwic2NvcmVtaW5cXFwiPnNjb3JlbWluPC9sYWJlbD5cXHJcXG4gICAgPGlucHV0IHR5cGU9XFxcIm51bWJlclxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgaWQ9XFxcInNjb3JlbWluXFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50cmV6IHVuIHNjb3JlIG1pbmltdW1cXFwiIHZhbHVlPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hY3Rpb24gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNjb3JlbWluIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiByZXF1aXJlZD5cXHJcXG4gIDwvZGl2PiBcXHJcXG4gIDxidXR0b24gY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdFxcXCI+VmFsaWRlcjwvYnV0dG9uPlxcclxcbiAgPC9mb3JtPlxcclxcblxcclxcbiAgPGhyPlxcclxcblxcclxcbiAgPGxhYmVsIGZvcj1cXFwibnVtcmVnbGVcXFwiPkxpc3RlIGRlcyByw6hnbGVzIGRlIGwnYWN0aW9uPC9sYWJlbD5cXHJcXG4gIDx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiIGlkPVxcXCJ0YWJSZWdsZVxcXCI+XFxyXFxuICAgIDx0aGVhZD5cXHJcXG4gICAgICA8dHI+XFxyXFxuICAgICAgICA8dGg+SWRlbnRpZmlhbnQ8L3RoPlxcclxcbiAgICAgICAgPHRoPkxpYmVsbMOpPC90aD5cXHJcXG4gICAgICAgIDx0aD5TY29yZSBtaW5pbXVtPC90aD5cXHJcXG4gICAgICAgIDx0aD48L3RoPlxcclxcbiAgICAgIDwvdHI+XFxyXFxuICAgIDwvdGhlYWQ+XFxyXFxuICAgIDx0Ym9keT5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnJlZ2xlcyA6IGRlcHRoMCkse1wibmFtZVwiOlwiZWFjaFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAgICA8L3Rib2R5PlxcclxcbiAgPC90YWJsZT5cXHJcXG4gIDxmb3JtIGlkPVxcXCJmb3JtUHV0UmVnbGVcXFwiIG1ldGhvZD1cXFwicG9zdFxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcclxcbiAgICAgPGxhYmVsIGZvcj1cXFwibnVtcmVnbGVcXFwiPkFqb3V0ZXIgdW5lIFLDqGdsZTwvbGFiZWw+XFxyXFxuICAgICAgPHNlbGVjdCAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgaWQ9XFxcIm51bXJlZ2xlXFxcIj5cXHJcXG4gICAgICAgIDxvcHRpb24gdmFsdWU9bnVsbD4gQXVjdW4gPC9vcHRpb24+XFxyXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5yZWdsZXNUb3QgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDUsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgICAgICA8L3NlbGVjdD5cXHJcXG4gICAgPC9kaXY+XFxyXFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdFxcXCI+QWpvdXRlcjwvYnV0dG9uPlxcclxcbiAgPC9mb3JtPlwiO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xuIiwidmFyIGFjdGlvbk1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvQWN0aW9ucy9BY3Rpb24nKTtcclxudmFyIGFjdGlvbnNNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0FjdGlvbnMvQWN0aW9uc0xpc3QnKTtcclxudmFyIHJlZ2xlc01vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvUmVnbGVzL1JlZ2xlc0xpc3QnKTtcclxudmFyIHJlZ2xlTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9SZWdsZXMvUmVnbGUnKTtcclxudmFyIHBvc3NlZGVNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL1Bvc3NlZGUvUG9zc2VkZScpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL1B1dEFjdGlvbi5oYnMnKTtcclxudmFyIG1vZGFsID0gcmVxdWlyZSgnLi4vR2xvYmFsL21vZGFsLmpzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHQkcGFnZU5hbWUgOiAkKCd0aXRsZScpLFxyXG5cdCR0aXRsZSA6ICQoJyN0aXRsZScpLFx0XHJcblx0JGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHRlbDogJCgnI2Zvcm1QdXRBY3Rpb24nKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdCQud2hlbihuZXcgYWN0aW9uc01vZGVsKCkuZmV0Y2goKSlcclxuXHRcdC5kb25lKF8uYmluZChmdW5jdGlvbihhY3Rpb25zKXtcclxuXHRcdFx0dGhpcy5yZW5kZXJSZXN1bHRhdChhY3Rpb25zKTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdFx0dGhpcy4kcGFnZU5hbWUuaHRtbChcIkFqb3V0IEFjdGlvblwiKTtcclxuXHRcdHRoaXMuJHRpdGxlLmh0bWwoXCJBam91dGVyIHVuZSBBY3Rpb25cIik7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyTW9kaWY6IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHZhciBtb2RlbFJlZ2xlcyA9IG5ldyByZWdsZXNNb2RlbCgpO1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IHJlZ2xlTW9kZWwoKTtcclxuXHRcdG1vZGVsLnVybCA9IG1vZGVsLnVybFJvb3QrJy9BY3Rpb24vJytpZDtcclxuXHRcdFxyXG5cdFx0JC53aGVuKG5ldyBhY3Rpb25zTW9kZWwoKS5mZXRjaCgpLG1vZGVsUmVnbGVzLmZldGNoKCksbW9kZWwuZmV0Y2goKSxuZXcgYWN0aW9uTW9kZWwoe1wiaWRcIjppZH0pLmZldGNoKCkpXHJcblx0XHQuZG9uZShfLmJpbmQoZnVuY3Rpb24oYWN0aW9ucyxyZWdsZXNUb3QscmVnbGVzLGFjdGlvbil7XHJcblx0XHRcdHRoaXMucmVuZGVyUmVzdWx0YXQoYWN0aW9ucyxyZWdsZXNUb3QscmVnbGVzLGFjdGlvbik7XHJcblx0XHR9LHRoaXMpKTtcclxuXHRcdHRoaXMuJHBhZ2VOYW1lLmh0bWwoXCJNb2RpZmllciBBY3Rpb25cIik7XHJcblx0XHR0aGlzLiR0aXRsZS5odG1sKFwiTW9kaWZpZXIgdW5lIEFjdGlvblwiKTtcclxuXHRcdHRoaXMuaWRBY3Rpb249aWQ7XHJcblx0fSxcclxuXHJcblx0dmFsaWQ6IGZ1bmN0aW9uKGUpe1xyXG5cdFx0dmFyIGFjdE51bWFjdGlvbiA9ICQoJyNhY3ROdW1hY3Rpb24nKS52YWwoKTtcclxuXHRcdHZhciBsaWJhY3Rpb24gPSAkKCcjbGliYWN0aW9uJykudmFsKCk7XHJcblx0XHR2YXIgc2NvcmVtaW4gPSAkKCcjc2NvcmVtaW4nKS52YWwoKTtcclxuXHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgYWN0aW9uTW9kZWwoKTtcclxuXHRcdGlmICh0aGlzLmlkQWN0aW9uPT09dW5kZWZpbmVkKXtcclxuXHRcdFx0bW9kZWwuc2F2ZSh7XCJhY3ROdW1hY3Rpb25cIjphY3ROdW1hY3Rpb24sIFwibGliYWN0aW9uXCI6bGliYWN0aW9uLCBcInNjb3JlbWluXCI6c2NvcmVtaW59LCB7XHJcblx0XHRcdFx0c3VjY2VzczogdGhpcy5zaG93TW9kYWwoXCJBam91dFwiKSxcclxuXHRcdFx0XHRlcnJvcjogXy5iaW5kKHRoaXMuc2hvd0Vycm9yTW9kYWwsdGhpcylcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHRtb2RlbC5zYXZlKHtcIm51bWFjdGlvblwiOnRoaXMuaWRBY3Rpb24sIFwiYWN0TnVtYWN0aW9uXCI6YWN0TnVtYWN0aW9uLCBcImxpYmFjdGlvblwiOmxpYmFjdGlvbiwgXCJzY29yZW1pblwiOnNjb3JlbWlufSwge1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IHRoaXMuc2hvd01vZGFsKFwiTW9kaWZpZXJcIiksXHJcblx0XHRcdFx0ZXJyb3I6IF8uYmluZCh0aGlzLnNob3dFcnJvck1vZGFsLHRoaXMpXHJcblx0XHRcdH0pO1xyXG5cdFx0fSBcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0sXHJcblxyXG5cdHZhbGlkUmVnbGU6IGZ1bmN0aW9uKGUpe1xyXG5cdFx0dmFyIG51bXJlZ2xlID0gJCgnI251bXJlZ2xlJykudmFsKCk7XHJcblx0XHR2YXIgbW9kZWwgPSAgbmV3IHBvc3NlZGVNb2RlbCgpO1xyXG5cdFx0bW9kZWwuc2F2ZSh7XCJudW1hY3Rpb25cIjp0aGlzLmlkQWN0aW9uLCBcIm51bXJlZ2xlXCI6bnVtcmVnbGV9LCB7XHJcblx0XHRcdHN1Y2Nlc3M6IHRoaXMuc2hvd01vZGFsLFxyXG5cdFx0XHRlcnJvcjogXy5iaW5kKHRoaXMuc2hvd0Vycm9yTW9kYWwsdGhpcylcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlc3BvbnNlTGlzdCwgcmVzcG9uc2VMaXN0UmVnbGVUb3QsIHJlc3BvbnNlTGlzdFJlZ2xlLCByZXNwb25zZSl7XHJcblx0XHRpZihyZXNwb25zZT09PXVuZGVmaW5lZCl7XHJcblx0XHRcdHRoaXMuYWN0aW9uVHlwZSA9ICdBam91dCc7XHJcblx0XHRcdHRoaXMuJGNvbnRlbnQuaHRtbCh0ZW1wbGF0ZSh7YWN0aW9uczpyZXNwb25zZUxpc3R9KSk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0dGhpcy5hY3Rpb25UeXBlID0gJ01vZGlmaWVyJztcclxuXHJcblx0XHRcdC8vIEVubGV2ZSBsJ2lkIGNvdXJyYW50IGRlIGxhIGxpc3RlXHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPHJlc3BvbnNlTGlzdFswXS5sZW5ndGg7IGkrKykge1xyXG5cdCAgICAgIFx0XHRpZihyZXNwb25zZUxpc3RbMF1baV0ubnVtYWN0aW9uID09PSByZXNwb25zZVswXS5udW1hY3Rpb24pIHtcclxuXHRcdFx0ICAgICAgICAgcmVzcG9uc2VMaXN0WzBdLnNwbGljZShpLCAxKTtcclxuXHRcdFx0ICAgIH1cclxuXHRcdCAgXHR9XHJcblxyXG5cdFx0ICBcdC8vIFJlZmFjdG9yaW5nIGxpc3QgZGVzIHLDqGdsZSBwb3VyIHF1ZSDDp2Egc29pdCBwbHVzIGxpc2libGVcclxuXHRcdFx0dmFyIFJlZ2xlID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuXHRcdCAgXHR9KTtcclxuXHRcdFx0dmFyIENvbGxlY3Rpb25SZWdsZSA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcclxuXHRcdFx0ICBtb2RlbDogUmVnbGVcclxuXHRcdFx0fSk7XHJcblx0XHRcdHZhciBjb3VudCA9IDA7XHJcblx0XHRcdHZhciBsaXN0UmVnbGUgPSBuZXcgQ29sbGVjdGlvblJlZ2xlKCk7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgIHJlc3BvbnNlTGlzdFJlZ2xlWzBdLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dmFyIHJlZ2xlID0gbmV3IFJlZ2xlKHJlc3BvbnNlTGlzdFJlZ2xlWzBdW2ldWzBdKTtcclxuXHRcdFx0XHRsaXN0UmVnbGUuYWRkKFtyZWdsZV0pO1xyXG5cdFx0XHRcdGNvdW50Kys7XHJcblx0XHRcdH1cclxuXHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2VMaXN0UmVnbGVUb3RbMF0pO1xyXG5cdFx0XHR0aGlzLiRjb250ZW50Lmh0bWwodGVtcGxhdGUoe2FjdGlvbjogcmVzcG9uc2VbMF0sIGFjdGlvbnM6IHJlc3BvbnNlTGlzdFswXSxyZWdsZXM6IGxpc3RSZWdsZS5tb2RlbHMscmVnbGVzVG90OiByZXNwb25zZUxpc3RSZWdsZVRvdFswXX0pKTtcclxuXHRcdFx0JChcIiNhY3ROdW1hY3Rpb24gb3B0aW9uW3ZhbHVlPSdcIityZXNwb25zZVswXS5hY3ROdW1hY3Rpb24rXCInXVwiKS5hdHRyKFwic2VsZWN0ZWRcIiwgXCJzZWxlY3RlZFwiKTtcclxuXHRcdH1cclxuXHRcdCQoJyNmb3JtUHV0QWN0aW9uJykuc3VibWl0KF8uYmluZChmdW5jdGlvbihldmVudCl7XHJcblx0XHQgICAgdGhpcy52YWxpZCgpO1xyXG5cdFx0fSwgdGhpcykpO1xyXG5cclxuXHRcdCQoJyNmb3JtUHV0UmVnbGUnKS5zdWJtaXQoXy5iaW5kKGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdCAgICB0aGlzLnZhbGlkUmVnbGUoKTtcclxuXHRcdH0sIHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHRzaG93TW9kYWw6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgQXJ0aWNsZU1vZGFsQm9keSA9IFwiTGFcIjtcclxuXHRcdGlmKHRoaXMuYWN0aW9uVHlwZSA9PT0gXCJBam91dFwiKXtcclxuXHRcdFx0QXJ0aWNsZU1vZGFsQm9keSA9IFwiTCdcIjtcclxuXHRcdH1cclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiB0aGlzLmFjdGlvblR5cGUsXHJcblx0XHQgXHRtb2RhbEJvZHk6IEFydGljbGVNb2RhbEJvZHkrXCIgXCIrdGhpcy5hY3Rpb25UeXBlK1wiIGEgw6l0w6kgZWZmZWN0dcOpIGF2ZWMgc3VjY8Ooc1wiXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI0FjdGlvbnMnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0XHR3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcblx0fSxcclxuXHJcblx0c2hvd0Vycm9yTW9kYWw6IGZ1bmN0aW9uKG9iamVjdCxlcnJvcil7XHJcblx0XHRpZiAoZXJyb3Iuc3RhdHVzPT0yMDEpe1xyXG5cdFx0XHR0aGlzLnNob3dNb2RhbCgpO1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIkVycmV1ciBcIitlcnJvci5zdGF0dXMsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiRXJyZXVyIGxvcnMgZGUgbCdham91dCA6IFwiICsgZXJyb3Iuc3RhdHVzVGV4dCxcclxuXHRcdCBcdG1vZGFsRXJyb3I6IHRydWVcclxuXHRcdH0pO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwidmFyIEFjdGlvbnMgPSByZXF1aXJlKCcuL0FjdGlvbnMnKTtcclxudmFyIEFjdGlvbiA9IHJlcXVpcmUoJy4vQWN0aW9uJyk7XHJcbnZhciBQdXRBY3Rpb24gPSByZXF1aXJlKCcuL1B1dEFjdGlvbicpO1xyXG52YXIgRGVsZXRlQWN0aW9uID0gcmVxdWlyZSgnLi9EZWxldGVBY3Rpb24nKTtcclxuXHJcbnZhciBSb3V0ZXIgPSBCYWNrYm9uZS5Sb3V0ZXIuZXh0ZW5kKHtcclxuXHRyb3V0ZXM6IHtcclxuXHRcdFwiQWN0aW9uc1wiOiBcIkFjdGlvbnNcIixcclxuXHRcdFwiQWN0aW9ucy9Bam91dFwiOiBcIkFqb3V0QWN0aW9uXCIsXHJcblx0XHRcIkFjdGlvbnMvTW9kaWZpZXIvOmlkXCI6IFwiTW9kaWZBY3Rpb25cIixcclxuXHRcdFwiQWN0aW9ucy9TdXBwcmltZXIvOmlkXCI6IFwiU3VwcHJBY3Rpb25cIixcclxuXHRcdFwiQWN0aW9ucy86aWRcIjogXCJBY3Rpb25cIixcclxuXHRcdFwiQWN0aW9ucy9Nb2RpZmllci86aWQvUmVnbGUvU3VwcHJpbWVyLzppZFJlZ2xlXCI6IFwiU3VwcHJBY3Rpb25SZWdsZVwiLFxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblxyXG5cdH0sXHJcblxyXG5cdEFjdGlvbnM6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLmFjdGlvbnMgPSBuZXcgQWN0aW9ucygpO1xyXG5cdFx0dGhpcy5hY3Rpb25zLnJlbmRlcigpO1xyXG5cdH0sXHJcblxyXG5cdEFjdGlvbjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5hY3Rpb25zID0gbmV3IEFjdGlvbigpO1xyXG5cdFx0dGhpcy5hY3Rpb25zLnJlbmRlcihpZCk7XHJcblx0fSxcclxuXHJcblx0QWpvdXRBY3Rpb246IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLl9hY3Rpb24gPSBuZXcgUHV0QWN0aW9uKCk7XHJcblx0XHR0aGlzLl9hY3Rpb24ucmVuZGVyKCk7XHJcblx0fSxcclxuXHJcblx0TW9kaWZBY3Rpb246IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHRoaXMuX2FjdGlvbiA9IG5ldyBQdXRBY3Rpb24oKTtcclxuXHRcdHRoaXMuX2FjdGlvbi5yZW5kZXJNb2RpZihpZCk7XHJcblx0fSxcclxuXHJcblx0U3VwcHJBY3Rpb246IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHRoaXMuX2FjdGlvbiA9IG5ldyBEZWxldGVBY3Rpb24oKTtcclxuXHRcdHRoaXMuX2FjdGlvbi5yZW5kZXIoaWQpO1xyXG5cdH0sXHJcblxyXG5cdFN1cHByQWN0aW9uUmVnbGU6IGZ1bmN0aW9uKGlkLCBpZFJlZ2xlKXtcclxuXHRcdHRoaXMuX2FjdGlvbiA9IG5ldyBEZWxldGVBY3Rpb24oKTtcclxuXHRcdHRoaXMuX2FjdGlvbi5yZW5kZXJQb3NzZWRlKGlkLGlkUmVnbGUpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlcjsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcblx0PHRoZWFkPlxcclxcblx0XHQ8dHI+XFxyXFxuXHRcdFx0PHRoPklkZW50aWZpYW50PC90aD5cXHJcXG5cdFx0XHQ8dGg+Tm9tPC90aD5cXHJcXG5cdFx0XHQ8dGg+UHJlbm9tPC90aD5cXHJcXG5cdFx0PC90cj5cXHJcXG5cdDwvdGhlYWQ+XFxyXFxuXHQ8dGJvZHk+XFxyXFxuXHRcdFx0PHRyPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXBwcmVuYW50IDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hdHRyaWJ1dGVzIDogc3RhY2sxKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1hcHByZW5hbnQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXBwcmVuYW50IDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hdHRyaWJ1dGVzIDogc3RhY2sxKSkgIT0gbnVsbCA/IHN0YWNrMS5ub21hcHByZW5hbnQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXBwcmVuYW50IDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hdHRyaWJ1dGVzIDogc3RhY2sxKSkgIT0gbnVsbCA/IHN0YWNrMS5wcmVub21hcHByZW5hbnQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdDwvdHI+XFxyXFxuXHQ8L3Rib2R5PlxcclxcbjwvdGFibGU+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBhcHByZW5hbnRNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0FwcHJlbmFudHMvQXBwcmVuYW50Jyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vQXBwcmVuYW50LmhicycpO1xyXG5cclxudmFyIHZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcblx0cGFnZU5hbWUgOiAkKCd0aXRsZScpLFxyXG5cdHRpdGxlIDogJCgnI3RpdGxlJyksXHJcblx0Y29udGVudCA6ICQoJyNjb250ZW50JyksXHJcblxyXG5cdC8vQXBwZWzDqSBhdSBtb21lbnQgZGUgbCdpbnN0YW5jaWF0aW9uXHRcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdC8vRm9uY3Rpb24gY2hhcmfDqWUgZHUgcmVuZHVcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHZhciBtb2RlbCA9IG5ldyBhcHByZW5hbnRNb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5yZW5kZXJSZXN1bHRhdCwgdGhpcylcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLnBhZ2VOYW1lKS5odG1sKFwiRMOpdGFpbCBBcHByZW5hbnRcIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJJbmZvcm1hdGlvbnMgQXBwcmVuYW50XCIpO1xyXG5cdH0sXHJcblxyXG5cdHJlbmRlclJlc3VsdGF0OiBmdW5jdGlvbihhcHByZW5hbnQpe1xyXG5cdFx0JCh0aGlzLmNvbnRlbnQpLmh0bWwodGVtcGxhdGUoe2FwcHJlbmFudH0pKTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT10aGlzLmxhbWJkYSwgYWxpYXMyPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdFx0XHQ8dHIgb25DbGljaz1cXFwiZG9jdW1lbnQubG9jYXRpb249JyNBcHByZW5hbnRzL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFwcHJlbmFudCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIidcXFwiPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFwcHJlbmFudCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubm9tYXBwcmVuYW50IDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5wcmVub21hcHByZW5hbnQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjRXZhbHVhdGlvblxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tc2NyZWVuc2hvdFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0PC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cXHJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI0FwcHJlbmFudHMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtYXBwcmVuYW50IDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWxcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI0FwcHJlbmFudHMvU3VwcHJpbWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFwcHJlbmFudCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdDwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIjxhIGhyZWY9XFxcIiNBcHByZW5hbnRzL0Fqb3V0XFxcIj5cXHJcXG5cdDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1zdWNjZXNzXFxcIj5cXHJcXG5cdCAgPHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tcGx1c1xcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj4gQWpvdXRlciBBcHByZW5hbnRcXHJcXG5cdDwvYnV0dG9uPlxcclxcbjwvYT5cXHJcXG5cXHJcXG48dGFibGUgY2xhc3M9XFxcInRhYmxlXFxcIj5cXHJcXG5cdDx0aGVhZD5cXHJcXG5cdFx0PHRyPlxcclxcblx0XHRcdDx0aD5JZGVudGlmaWFudDwvdGg+XFxyXFxuXHRcdFx0PHRoPk5vbTwvdGg+XFxyXFxuXHRcdFx0PHRoPlByZW5vbTwvdGg+XFxyXFxuXHRcdFx0PHRoPkV2YWx1YXRpb248L3RoPlxcclxcblx0XHRcdDx0aD48L3RoPlxcclxcblx0XHQ8L3RyPlxcclxcblx0PC90aGVhZD5cXHJcXG5cdDx0Ym9keT5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFwcHJlbmFudHMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcdDwvdGJvZHk+XFxyXFxuPC90YWJsZT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIGFwcHJlbmFudHNNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0FwcHJlbmFudHMvQXBwcmVuYW50c0xpc3QnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9BcHByZW5hbnRzLmhicycpO1xyXG5cclxudmFyIHZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcblx0cGFnZU5hbWUgOiAkKCd0aXRsZScpLFxyXG5cdHRpdGxlIDogJCgnI3RpdGxlJyksXHJcblx0Y29udGVudCA6ICQoJyNjb250ZW50JyksXHJcblxyXG5cdC8vQXBwZWzDqSBhdSBtb21lbnQgZGUgbCdpbnN0YW5jaWF0aW9uXHRcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdC8vRm9uY3Rpb24gY2hhcmfDqWUgZHUgcmVuZHVcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgYXBwcmVuYW50c01vZGVsKCkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5yZW5kZXJSZXN1bHRhdCwgdGhpcylcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLnBhZ2VOYW1lKS5odG1sKFwiTGlzdGUgZGVzIEFwcHJlbmFudHNcIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJMaXN0ZSBkZXMgQXBwcmVuYW50c1wiKTtcclxuXHR9LFxyXG5cclxuXHRyZW5kZXJSZXN1bHRhdDogZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0JCh0aGlzLmNvbnRlbnQpLmh0bWwodGVtcGxhdGUoe2FwcHJlbmFudHM6IHJlc3BvbnNlLnRvQXJyYXkoKX0pKTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsInZhciBhcHByZW5hbnRNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0FwcHJlbmFudHMvQXBwcmVuYW50Jyk7XHJcbnZhciBtb2RhbCA9IHJlcXVpcmUoJy4uL0dsb2JhbC9tb2RhbC5qcycpO1xyXG5cclxudmFyIHZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcblx0cmVuZGVyOiBmdW5jdGlvbihpZCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgYXBwcmVuYW50TW9kZWwoe1wiaWRcIjppZH0pLmZldGNoKHtcclxuXHRcdFx0c3VjY2VzczogXy5iaW5kKHRoaXMuY29uZmlybSx0aGlzKSxcclxuXHRcdFx0ZXJyb3I6IF8uYmluZCh0aGlzLnNob3dFcnJvck1vZGFsLHRoaXMpXHJcblx0XHR9KTtcclxuXHJcblx0fSxcclxuXHJcblx0Y29uZmlybTpmdW5jdGlvbihhcHByZW5hbnQpe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJDb25maXJtZXIgbGEgc3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsRm9vdGVyOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBkYXRhLWRpc21pc3M9XCJtb2RhbFwiIGlkPVwiYW5udWxEZWxldGVcIj5Bbm51bGVyPC9idXR0b24+PGEgY2xhc3M9XCJidG4gYnRuLWRhbmdlciBidG4tb2tcIiBpZD1cImNvbmZpcm1EZWxldGVcIiBkYXRhLWRpc21pc3M9XCJtb2RhbFwiPlN1cHByaW1lcjwvYT4nXHJcblx0XHR9KTtcclxuXHRcdCQoJyNjb25maXJtRGVsZXRlJykub24oJ2NsaWNrJyxfLmJpbmQoZnVuY3Rpb24oZSl7XHJcblx0XHRcdHZhciBtb2RlbCA9IG5ldyBhcHByZW5hbnRNb2RlbCh7XCJpZFwiOmFwcHJlbmFudC5pZH0pLmRlc3Ryb3koe1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLnZhbGlkLHRoaXMpLFxyXG5cdFx0XHRcdGVycm9yOiBfLmJpbmQodGhpcy5zaG93RXJyb3JNb2RhbCx0aGlzKVxyXG5cdFx0XHR9KTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdFx0JCgnI2FubnVsRGVsZXRlJykub24oJ2NsaWNrJyxfLmJpbmQoZnVuY3Rpb24oZSl7XHJcblx0XHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoJyNBcHByZW5hbnRzJywge3RyaWdnZXI6dHJ1ZX0pO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0fSxcclxuXHJcblx0dmFsaWQ6ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIlN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiU3VwcHJlc3Npb24gZWZmZWN1w6llXCJcclxuXHRcdH0pO1xyXG5cdFx0JCgnLm1vZGFsLWJhY2tkcm9wJykucmVtb3ZlKCk7XHJcblx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcjQXBwcmVuYW50cycsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHRcdEJhY2tib25lLmhpc3Rvcnkuc3RvcCgpOyBcclxuXHRcdEJhY2tib25lLmhpc3Rvcnkuc3RhcnQoKTtcclxuXHR9LFxyXG5cclxuXHRzaG93TW9kYWw6IGZ1bmN0aW9uKG1pc3Npb25UeXBlKXtcclxuXHRcdHZhciBBcnRpY2xlTW9kYWxCb2R5ID0gXCJMYVwiO1xyXG5cdFx0aWYobWlzc2lvblR5cGUgPT09IFwiQWpvdXRcIil7XHJcblx0XHRcdEFydGljbGVNb2RhbEJvZHkgPSBcIkwnXCI7XHJcblx0XHR9XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogbWlzc2lvblR5cGUsXHJcblx0XHQgXHRtb2RhbEJvZHk6IEFydGljbGVNb2RhbEJvZHkrXCIgXCIrbWlzc2lvblR5cGUrXCIgYSDDqXTDqSBlZmZlY3R1w6kgYXZlYyBzdWNjw6hzXCJcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcjQXBwcmVuYW50cycsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHRcdHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuXHR9LFxyXG5cclxuXHRzaG93RXJyb3JNb2RhbDogZnVuY3Rpb24ob2JqZWN0LGVycm9yKXtcclxuXHRcdGlmIChlcnJvci5zdGF0dXM9PTIwMSB8fCBlcnJvci5zdGF0dXM9PTIwMCl7XHJcblx0XHRcdHRoaXMudmFsaWQoKTtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJFcnJldXIgXCIrZXJyb3Iuc3RhdHVzLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIkVycmV1ciBsb3JzIGRlIGxhIHN1cHByZXNzaW9uIDogXCIgKyBlcnJvci5zdGF0dXNUZXh0LFxyXG5cdFx0IFx0bW9kYWxFcnJvcjogdHJ1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIiA8Zm9ybSBpZD1cXFwiZm9ybVB1dEFwcHJlbmFudFxcXCIgbWV0aG9kPVxcXCJwb3N0XFxcIj5cXHJcXG4gIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcclxcbiAgICA8bGFiZWwgZm9yPVxcXCJub21hcHByZW5hbnRcXFwiPk5vbTwvbGFiZWw+XFxyXFxuICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIiBpZD1cXFwibm9tYXBwcmVuYW50XFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50cmV6IHVuIG5vbVxcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFwcHJlbnRpIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5ub21hcHByZW5hbnQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIHJlcXVpcmVkPlxcclxcbiAgPC9kaXY+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXHJcXG4gICAgPGxhYmVsIGZvcj1cXFwicHJlbm9tYXBwcmVuYW50XFxcIj5QcsOpbm9tPC9sYWJlbD5cXHJcXG4gICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiIGlkPVxcXCJwcmVub21hcHByZW5hbnRcXFwiIHBsYWNlaG9sZGVyPVxcXCJFbnRyZXogdW4gcHLDqW5vbVxcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFwcHJlbnRpIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5wcmVub21hcHByZW5hbnQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIHJlcXVpcmVkPlxcclxcbiAgPC9kaXY+XFxyXFxuICA8YnV0dG9uIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHRcXFwiPlZhbGlkZXI8L2J1dHRvbj5cXHJcXG48L2Zvcm0+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBhcHByZW5hbnRNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0FwcHJlbmFudHMvQXBwcmVuYW50Jyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vUHV0QXBwcmVuYW50LmhicycpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdCRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0JHRpdGxlIDogJCgnI3RpdGxlJyksXHRcclxuXHQkY29udGVudCA6ICQoJyNjb250ZW50JyksXHJcblxyXG5cdGVsOiAkKCcjZm9ybVB1dEFwcHJlbmFudCcpLFxyXG5cclxuXHQvL0FwcGVsw6kgYXUgbW9tZW50IGRlIGwnaW5zdGFuY2lhdGlvblx0XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHR9LFxyXG5cclxuXHQvL0ZvbmN0aW9uIGNoYXJnw6llIGR1IHJlbmR1XHJcblx0cmVuZGVyOiBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5yZW5kZXJSZXN1bHRhdCh1bmRlZmluZWQpO1xyXG5cdFx0dGhpcy4kcGFnZU5hbWUuaHRtbChcIkFqb3V0IEFwcHJlbmFudFwiKTtcclxuXHRcdHRoaXMuJHRpdGxlLmh0bWwoXCJBam91dGVyIHVuIEFwcHJlbmFudFwiKTtcclxuXHR9LFxyXG5cclxuXHRyZW5kZXJNb2RpZjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0JC53aGVuKG5ldyBhcHByZW5hbnRNb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goKSlcclxuXHRcdC5kb25lKF8uYmluZChmdW5jdGlvbihhcHByZW5hbnQpe1xyXG5cdFx0XHR0aGlzLnJlbmRlclJlc3VsdGF0KGFwcHJlbmFudCk7XHJcblx0XHR9LHRoaXMpKTtcdFx0XHJcblx0XHR0aGlzLiRwYWdlTmFtZS5odG1sKFwiTW9kaWZpZXIgQXBwcmVuYW50XCIpO1xyXG5cdFx0dGhpcy4kdGl0bGUuaHRtbChcIk1vZGlmaWVyIHVuIEFwcHJlbmFudFwiKTtcclxuXHRcdHRoaXMuaWRBcHByZW5hbnQ9aWQ7XHJcblx0fSxcclxuXHJcblx0dmFsaWQ6IGZ1bmN0aW9uKGUpe1xyXG5cdFx0dmFyIG5vbWFwcHJlbmFudCA9ICQoJyNub21hcHByZW5hbnQnKS52YWwoKTtcclxuXHRcdHZhciBwcmVub21hcHByZW5hbnQgPSAkKCcjcHJlbm9tYXBwcmVuYW50JykudmFsKCk7XHJcblxyXG5cdFx0dmFyIG1vZGVsID0gbmV3IGFwcHJlbmFudE1vZGVsKCk7XHJcblx0XHRpZiAodGhpcy5pZEFwcHJlbmFudD09PXVuZGVmaW5lZCl7XHJcblx0XHRcdHRoaXMubWlzc2lvblR5cGUgPSAnQWpvdXQnO1xyXG5cdFx0XHRtb2RlbC5zYXZlKHtcIm5vbWFwcHJlbmFudFwiOm5vbWFwcHJlbmFudCwgXCJwcmVub21hcHByZW5hbnRcIjpwcmVub21hcHByZW5hbnR9LCB7XHJcblx0XHRcdFx0c3VjY2VzczogdGhpcy5zaG93TW9kYWwoKSxcclxuXHRcdFx0XHRlcnJvcjogXy5iaW5kKHRoaXMuc2hvd0Vycm9yTW9kYWwsdGhpcylcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHR0aGlzLm1pc3Npb25UeXBlID0gJ01vZGlmaWVyJztcclxuXHRcdFx0bW9kZWwuc2F2ZSh7XCJudW1hcHByZW5hbnRcIjp0aGlzLmlkQXBwcmVuYW50LCBcIm5vbWFwcHJlbmFudFwiOm5vbWFwcHJlbmFudCwgXCJwcmVub21hcHByZW5hbnRcIjpwcmVub21hcHByZW5hbnR9LCB7XHJcblx0XHRcdFx0c3VjY2VzczogdGhpcy5zaG93TW9kYWwoKSxcclxuXHRcdFx0XHRlcnJvcjogXy5iaW5kKHRoaXMuc2hvd0Vycm9yTW9kYWwsdGhpcylcclxuXHRcdFx0fSk7XHJcblx0XHR9IFxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdGlmKHJlc3BvbnNlPT09dW5kZWZpbmVkKXtcclxuXHRcdFx0dGhpcy4kY29udGVudC5odG1sKHRlbXBsYXRlKCkpO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHRoaXMuJGNvbnRlbnQuaHRtbCh0ZW1wbGF0ZSh7YXBwcmVudGk6IHJlc3BvbnNlfSkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdCQoJyNmb3JtUHV0QXBwcmVuYW50Jykuc3VibWl0KF8uYmluZChmdW5jdGlvbihldmVudCl7XHJcblx0XHQgICAgdGhpcy52YWxpZCgpO1xyXG5cdFx0fSwgdGhpcykpO1xyXG5cdH0sXHJcblxyXG5cdHNob3dNb2RhbDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBBcnRpY2xlTW9kYWxCb2R5ID0gXCJMYVwiO1xyXG5cdFx0aWYodGhpcy5taXNzaW9uVHlwZSA9PT0gXCJBam91dFwiKXtcclxuXHRcdFx0QXJ0aWNsZU1vZGFsQm9keSA9IFwiTCdcIjtcclxuXHRcdH1cclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiB0aGlzLm1pc3Npb25UeXBlLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBBcnRpY2xlTW9kYWxCb2R5K1wiIFwiK3RoaXMubWlzc2lvblR5cGUrXCIgYSDDqXTDqSBlZmZlY3R1w6kgYXZlYyBzdWNjw6hzXCJcclxuXHRcdH0pO1xyXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI0FwcHJlbmFudHMnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0XHR3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcblx0fSxcclxuXHJcblx0c2hvd0Vycm9yTW9kYWw6IGZ1bmN0aW9uKG9iamVjdCxlcnJvcil7XHJcblx0XHRpZiAoZXJyb3Iuc3RhdHVzPT0yMDEpe1xyXG5cdFx0XHR0aGlzLnNob3dNb2RhbCgpO1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIkVycmV1ciBcIitlcnJvci5zdGF0dXMsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiRXJyZXVyIGxvcnMgZGUgbCdham91dCA6IFwiICsgZXJyb3Iuc3RhdHVzVGV4dCxcclxuXHRcdCBcdG1vZGFsRXJyb3I6IHRydWVcclxuXHRcdH0pO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwidmFyIEFwcHJlbmFudHMgPSByZXF1aXJlKCcuL0FwcHJlbmFudHMnKTtcclxudmFyIEFwcHJlbmFudCA9IHJlcXVpcmUoJy4vQXBwcmVuYW50Jyk7XHJcbnZhciBQdXRBcHByZW5hbnQgPSByZXF1aXJlKCcuL1B1dEFwcHJlbmFudCcpO1xyXG52YXIgRGVsZXRlQXBwcmVuYW50ID0gcmVxdWlyZSgnLi9EZWxldGVBcHByZW5hbnQnKTtcclxuXHJcbnZhciBSb3V0ZXIgPSBCYWNrYm9uZS5Sb3V0ZXIuZXh0ZW5kKHtcclxuXHRyb3V0ZXM6IHtcclxuXHRcdFwiQXBwcmVuYW50c1wiOiBcIkFwcHJlbmFudHNcIixcclxuXHRcdFwiQXBwcmVuYW50cy9Bam91dFwiOiBcIkFqb3V0QXBwcmVuYW50XCIsXHJcblx0XHRcIkFwcHJlbmFudHMvTW9kaWZpZXIvOmlkXCI6IFwiTW9kaWZBcHByZW5hbnRcIixcclxuXHRcdFwiQXBwcmVuYW50cy9TdXBwcmltZXIvOmlkXCI6IFwiU3VwcHJBcHByZW5hbnRcIixcclxuXHRcdFwiQXBwcmVuYW50cy86aWRcIjogXCJBcHByZW5hbnRcIixcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cclxuXHR9LFxyXG5cclxuXHRBcHByZW5hbnRzOiBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5BcHByZW5hbnRzID0gbmV3IEFwcHJlbmFudHMoKTtcclxuXHRcdHRoaXMuQXBwcmVuYW50cy5yZW5kZXIoKTtcclxuXHR9LFxyXG5cclxuXHRBcHByZW5hbnQ6IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHRoaXMuQXBwcmVuYW50ID0gbmV3IEFwcHJlbmFudCgpO1xyXG5cdFx0dGhpcy5BcHByZW5hbnQucmVuZGVyKGlkKTtcclxuXHR9LFxyXG5cclxuXHRBam91dEFwcHJlbmFudDogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuQXBwcmVuYW50ID0gbmV3IFB1dEFwcHJlbmFudCgpO1xyXG5cdFx0dGhpcy5BcHByZW5hbnQucmVuZGVyKCk7XHJcblx0fSxcclxuXHJcblx0TW9kaWZBcHByZW5hbnQ6IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHRoaXMuQXBwcmVuYW50ID0gbmV3IFB1dEFwcHJlbmFudCgpO1xyXG5cdFx0dGhpcy5BcHByZW5hbnQucmVuZGVyTW9kaWYoaWQpO1xyXG5cdH0sXHJcblxyXG5cdFN1cHByQXBwcmVuYW50OiBmdW5jdGlvbihpZCl7XHJcblx0XHR0aGlzLkFwcHJlbmFudCA9IG5ldyBEZWxldGVBcHByZW5hbnQoKTtcclxuXHRcdHRoaXMuQXBwcmVuYW50LnJlbmRlcihpZCk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUm91dGVyOyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgIDxoMT5FbiBjb25zdHJ1Y3Rpb248L2gxPlxcclxcblxcclxcbiAgPHRhYmxlIGNsYXNzPVxcXCJ0YWJsZVxcXCI+XFxyXFxuICA8dGhlYWQ+XFxyXFxuICAgIDx0cj5cXHJcXG4gICAgICA8dGg+TnVtPC90aD5cXHJcXG4gICAgICA8dGg+TWlzc2lvbjwvdGg+XFxyXFxuICAgICAgPHRoPlNjb3JlPC90aD5cXHJcXG4gICAgPC90cj5cXHJcXG4gIDwvdGhlYWQ+XFxyXFxuICA8dGJvZHk+XFxyXFxuICA8dHI+XFxyXFxuICAgIDx0ZD48L3RkPlxcclxcbiAgICA8dGQ+PC90ZD5cXHJcXG4gICAgPHRkPjwvdGQ+XFxyXFxuICA8L3RyPlxcclxcbiAgPHRyPlxcclxcbiAgICA8dGQ+PC90ZD5cXHJcXG4gICAgPHRkPjwvdGQ+XFxyXFxuICAgIDx0ZD48L3RkPlxcclxcbiAgPC90cj5cXHJcXG48L3RhYmxlPlxcclxcblxcclxcbjxoMj5TY29yZSB0b3RhbDogPC9oMj5cXHJcXG5cXHJcXG48YSBocmVmPVxcXCJcXFwiPlxcclxcbiAgPGJ1dHRvbiBpZD1cXFwiYWNjdWVpbFxcXCIgY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdFxcXCI+UmV0b3VyIMOgIGwnYWNjdWVpbDwvYnV0dG9uPlxcclxcbjwvYT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgPGgxPkVuIGNvbnN0cnVjdGlvbjwvaDE+XFxyXFxuXFxyXFxuICA8dGFibGUgY2xhc3M9XFxcInRhYmxlXFxcIj5cXHJcXG4gIDx0aGVhZD5cXHJcXG4gICAgPHRyPlxcclxcbiAgICAgIDx0aD5OdW08L3RoPlxcclxcbiAgICAgIDx0aD5PYmplY3RpZjwvdGg+XFxyXFxuICAgICAgPHRoPkFjdGlvbnM8L3RoPlxcclxcbiAgICA8L3RyPlxcclxcbiAgPC90aGVhZD5cXHJcXG4gIDx0Ym9keT5cXHJcXG4gIDx0cj5cXHJcXG4gICAgPHRkPjwvdGQ+XFxyXFxuICAgIDx0ZD48L3RkPlxcclxcbiAgICA8dGQ+PC90ZD5cXHJcXG4gIDwvdHI+XFxyXFxuICA8dHI+XFxyXFxuICAgIDx0ZD48L3RkPlxcclxcbiAgICA8dGQ+PC90ZD5cXHJcXG4gICAgPHRkPjwvdGQ+XFxyXFxuICA8L3RyPlxcclxcbjwvdGFibGU+XFxyXFxuXFxyXFxuPGg0PlRvdGFsIGRlIGxhIG1pc3Npb246IDwvaDQ+XFxyXFxuXFxyXFxuPGJ1dHRvbiBpZD1cXFwibWlzc2lvblN1aXZhbnRlXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0XFxcIj5NaXNzaW9uIHN1aXZhbnRlPC9idXR0b24+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiICAgIDxkaXYgY2xhc3M9XFxcInJvd1xcXCI+XFxyXFxuICAgICAgPGRpdiBjbGFzcz1cXFwiY29sLW1kLTNcXFwiPlxcclxcbiAgICAgICAgXCJcbiAgICArIHRoaXMuZXNjYXBlRXhwcmVzc2lvbih0aGlzLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJvYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcclxcbiAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29sLW1kLTlcXFwiPlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saXN0QWN0aW9uIDogc3RhY2sxKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgyLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiICAgICAgPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCIgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiPlxcclxcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29sLW1kLTRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICBcIlxuICAgICsgdGhpcy5lc2NhcGVFeHByZXNzaW9uKHRoaXMubGFtYmRhKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYmFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcclxcbiAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb2wtbWQtOFxcXCI+XFxyXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpc3RSZWdsZSA6IHN0YWNrMSkse1wibmFtZVwiOlwiZWFjaFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMywgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgPC9kaXY+XFxyXFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInJvd1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29sLW1kLTZcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGlicmVnbGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXHJcXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb2wtbWQtNlxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiY2hlY2tib3hcXFwiIGlkPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJyZWdsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PiAgXFxyXFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCI8aDE+RW4gY29uc3RydWN0aW9uPC9oMT5cXHJcXG48aDM+RXZhbHVhdGlvbiBkZSBsYSBtaXNzaW9uPC9oMz5cXHJcXG48aDI+XCJcbiAgICArIHRoaXMuZXNjYXBlRXhwcmVzc2lvbih0aGlzLmxhbWJkYSgoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1pc3Npb24gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmF0dHJpYnV0ZXMgOiBzdGFjazEpKSAhPSBudWxsID8gc3RhY2sxLmxpYm1pc3Npb24gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2gyPlxcclxcbiAgPGZvcm0gaWQ9XFxcImZvcm1DaG9peFJlZ2xlXFxcIiBtZXRob2Q9XFxcInBvc3RcXFwiPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiPlxcclxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNvbC1tZC0zXFxcIj5cXHJcXG4gICAgICAgIE9iamVjdGlmc1xcclxcbiAgICAgIDwvZGl2PlxcclxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNvbC1tZC0zXFxcIj5cXHJcXG4gICAgICAgIEFjdGlvbnNcXHJcXG4gICAgICA8L2Rpdj5cXHJcXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJjb2wtbWQtM1xcXCI+XFxyXFxuICAgICAgICBSw6hnbGVzXFxyXFxuICAgICAgPC9kaXY+XFxyXFxuICAgICAgPGRpdiBjbGFzcz1cXFwiY29sLW1kLTNcXFwiPlxcclxcbiAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKChzdGFjazEgPSAoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1pc3Npb24gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmF0dHJpYnV0ZXMgOiBzdGFjazEpKSAhPSBudWxsID8gc3RhY2sxLmxpc3RPYmplY3RpZiA6IHN0YWNrMSkpICE9IG51bGwgPyBzdGFjazEubW9kZWxzIDogc3RhY2sxKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxyXFxuXFxyXFxuICA8YnV0dG9uIGlkPVxcXCJzdWJtaXRCdXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHRcXFwiPlZhbGlkZXI8L2J1dHRvbj5cXHJcXG4gIDwvZm9ybT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtamV1IDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJlbGxlamV1IDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9vcHRpb24+XFxyXFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCI8aDM+Q2hvaXggZHUgamV1PC9oMz5cXHJcXG4gIDxmb3JtIGlkPVxcXCJmb3JtQ2hvaXhKZXVcXFwiIG1ldGhvZD1cXFwicG9zdFxcXCI+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXHJcXG4gICAgPGxhYmVsIGZvcj1cXFwiY2hvaXhKZXVcXFwiPkNob2lzaXIgbGUgamV1PC9sYWJlbD5cXHJcXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIiBpZD1cXFwiY2hvaXhKZXVcXFwiPlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuamV1eCA6IGRlcHRoMCkse1wibmFtZVwiOlwiZWFjaFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAgICA8L3NlbGVjdD5cXHJcXG4gIDwvZGl2PiAgXFxyXFxuICA8YnV0dG9uIGlkPVxcXCJzdWJtaXRCdXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHRcXFwiPlZhbGlkZXI8L2J1dHRvbj5cXHJcXG4gIDwvZm9ybT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIGNob2l4TW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9FdmFsdWF0aW9uL0V2YWx1YXRpb24nKTtcclxudmFyIGpldXhNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0pldXgvSmV1eExpc3QnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9FdmFsdWF0aW9uLmhicycpO1xyXG52YXIgdGVtcGxhdGVFdmFsTWlzc2lvbiA9IHJlcXVpcmUoJy4vRXZhbE1pc3Npb24uaGJzJyk7XHJcbnZhciB0ZW1wbGF0ZUJpbGFuTWlzc2lvbiA9IHJlcXVpcmUoJy4vQmlsYW5NaXNzaW9uLmhicycpO1xyXG52YXIgdGVtcGxhdGVCaWxhbkZpbmFsID0gcmVxdWlyZSgnLi9CaWxhbkZpbmFsLmhicycpO1xyXG5cclxudmFyIG1pc3Npb24gPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9NaXNzaW9ucy9NaXNzaW9uJyk7XHJcbnZhciBtaXNzaW9uT2JqZWN0aWZDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvT2JqZWN0aWZzL09iamVjdGlmTWlzc2lvbicpO1xyXG52YXIgb2JqZWN0aWZNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL09iamVjdGlmcy9PYmplY3RpZicpO1xyXG52YXIgb2JqZWN0aWZMaXN0ID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvT2JqZWN0aWZzL09iamVjdGlmc0xpc3QnKTtcclxuXHJcbnZhciBhY3Rpb25Nb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0FjdGlvbnMvQWN0aW9uJyk7XHJcbnZhciBhY3Rpb25MaXN0ID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvQWN0aW9ucy9BY3Rpb25zTGlzdCcpO1xyXG5cclxudmFyIHJlZ2xlTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9SZWdsZXMvUmVnbGUnKTtcclxudmFyIHJlZ2xlTGlzdCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL1JlZ2xlcy9SZWdsZXNMaXN0Jyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0dGl0bGUgOiAkKCcjdGl0bGUnKSxcclxuXHRjb250ZW50IDogJCgnI2NvbnRlbnQnKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5tb2RlbCA9IG5ldyBjaG9peE1vZGVsKCk7XHJcblx0XHQkKHRoaXMucGFnZU5hbWUpLmh0bWwoXCJFdmFsdWF0aW9uXCIpO1xyXG5cdFx0JCh0aGlzLnRpdGxlKS5odG1sKFwiRXZhbHVhdGlvblwiKTtcclxuXHJcblx0XHR0aGlzLmpldXggPSBuZXcgamV1eE1vZGVsKCkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5yZW5kZXJSZXN1bHRhdCwgdGhpcylcclxuXHRcdH0pO1xyXG5cdH0sXHJcblxyXG5cdC8qIFJlbmRlciBkZSBsYSBzw6lsZWN0aW9uIGQndW4gamV1ICovIFxyXG5cdHJlbmRlclJlc3VsdGF0OiBmdW5jdGlvbihyZXNwb25zZSl7XHJcblx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZSh7amV1eDogcmVzcG9uc2UudG9BcnJheSgpfSkpO1xyXG5cdFx0dGhpcy5qZXVSZXNwb25zZSA9IHJlc3BvbnNlLnRvQXJyYXkoKTtcclxuXHJcblx0XHR2YXIgJGZvcm1DaG9peEpldSA9ICQoJyNmb3JtQ2hvaXhKZXUnKTtcclxuXHRcdCRmb3JtQ2hvaXhKZXUuc3VibWl0KF8uYmluZChmdW5jdGlvbihldmVudCl7XHJcblx0XHQgICAgdGhpcy52YWxpZCgpO1xyXG5cdFx0fSwgdGhpcykpO1xyXG5cdH0sXHJcblxyXG5cdC8qIENsaWMgc3VyIGxlIHByZW1pZXIgYm91dG9uIHZhbGlkZXIgKi9cclxuXHR2YWxpZDogZnVuY3Rpb24oZSl7XHJcblx0XHR2YXIgY2hvaXhKZXUgPSAkKCcjY2hvaXhKZXUnKS52YWwoKTtcclxuXHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5qZXVSZXNwb25zZS5sZW5ndGg7IGkrKyl7XHJcblx0XHRcdGlmKHRoaXMuamV1UmVzcG9uc2VbaV0uYXR0cmlidXRlcy5udW1qZXUgPT0gY2hvaXhKZXUpe1x0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5zZWxlY3RlZEpldSA9IHRoaXMuamV1UmVzcG9uc2VbaV0uYXR0cmlidXRlcztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dGhpcy5jdXJyZW50TWlzc2lvbiA9IDA7XHJcblx0XHR0aGlzLm51bWJlck9mTWlzc2lvbiA9IHRoaXMuc2VsZWN0ZWRKZXUubWlzc2lvbkpldS5sZW5ndGg7XHJcblxyXG5cdFx0dGhpcy5yZW5kZXJPbmVNaXNzaW9uKCk7XHJcblx0fSxcclxuXHJcblx0LyogRmFpcyBsZSByZW5kdSBkZSBsYSBwYWdlIHBvdXIgdW5lIG1pc3Npb24gKi8gXHJcblx0cmVuZGVyT25lTWlzc2lvbjogZnVuY3Rpb24oKXtcclxuXHRcdC8qXHJcblx0XHRcdFRyb2lzIHJlcXXDqnRlcyDDoCBmYWlyZTpcclxuXHRcdFx0XyBlbnRyZSBvYmplY3RpZiBldCBtaXNzaW9uXHJcblx0XHRcdF8gZW50cmUgY2hhcXVlIG1pc3Npb24gZXQgYWN0aW9uc1xyXG5cdFx0XHRfIGVudHJlIGNoYXF1ZSBhY3Rpb24gZXQgcsOoZ2xlcyBcclxuXHRcdCAqL1xyXG5cclxuXHRcdHZhciBtaXNzaW9uT2JqZWN0aWYgPSBuZXcgbWlzc2lvbk9iamVjdGlmQ29sbGVjdGlvbigpO1xyXG5cdFx0dmFyIHVybE9iamVjdGlmTWlzc2lvbiA9IG1pc3Npb25PYmplY3RpZi51cmwgKyBcIi9NaXNzaW9uL1wiICsgKHRoaXMuY3VycmVudE1pc3Npb24gKyAxKSArIFwiL09iamVjdGlmXCI7XHJcblx0XHRtaXNzaW9uT2JqZWN0aWYudXJsID0gdXJsT2JqZWN0aWZNaXNzaW9uO1xyXG5cclxuXHRcdCQud2hlbihtaXNzaW9uT2JqZWN0aWYuZmV0Y2goKSlcclxuXHRcdFx0LmRvbmUoXy5iaW5kKHRoaXMucmVxdWVzdEFjdGlvbnMsIHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHRyZXF1ZXN0QWN0aW9uczogZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0dGhpcy5saXN0T2JqZWN0aWYgPSByZXNwb25zZTtcclxuXHRcdHZhciB0ZW1wTGlzdCA9IG5ldyBvYmplY3RpZkxpc3QoKTtcclxuXHRcdGZvcih2YXIgaT0wO2k8cmVzcG9uc2UubGVuZ3RoO2krKyl7XHJcblx0XHRcdHZhciB0ZW1wT2JqZWN0aWZNb2RlbCA9IG5ldyBvYmplY3RpZk1vZGVsKHtcclxuXHRcdFx0XHRcdGxpYm9iamVjdGlmOiByZXNwb25zZVtpXVsyXS5saWJvYmplY3RpZixcclxuXHRcdFx0XHRcdG51bW9iamVjdGlmOiByZXNwb25zZVtpXVsyXS5udW1vYmplY3RpZlxyXG5cdFx0XHR9KTtcclxuXHRcdFx0dGVtcExpc3QuYWRkKHRlbXBPYmplY3RpZk1vZGVsKTtcclxuXHRcdH1cclxuXHRcdHRoaXMubGlzdE9iamVjdGlmID0gdGVtcExpc3Q7XHJcblxyXG5cdFx0dmFyIHByb21pc2VUYWIgPSBbXTtcclxuXHRcdHRoaXMuYWN0aW9uUmVxdWVzdExpc3QgPSBuZXcgYWN0aW9uTGlzdCgpO1xyXG5cdFx0Zm9yKHZhciBpPTA7aTx0aGlzLmxpc3RPYmplY3RpZi5sZW5ndGg7IGkrKyl7XHJcblx0XHRcdHZhciB0ZW1wQWN0aW9uID0gbmV3IGFjdGlvbk1vZGVsKCk7XHJcblx0XHRcdHRlbXBBY3Rpb24udXJsID0gdGVtcExpc3QudXJsICsgdGhpcy5saXN0T2JqZWN0aWYuYXQoaSkuZ2V0KFwibnVtb2JqZWN0aWZcIikgKyBcIi9BY3Rpb25cIjtcclxuXHRcdFx0cHJvbWlzZVRhYltwcm9taXNlVGFiLmxlbmd0aF0gPSB0ZW1wQWN0aW9uLmZldGNoKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0JC53aGVuYWxsID0gZnVuY3Rpb24oYXJyKSB7IHJldHVybiAkLndoZW4uYXBwbHkoJCwgYXJyKTsgfTtcclxuXHJcblx0XHQkLndoZW5hbGwocHJvbWlzZVRhYikudGhlbihfLmJpbmQoZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0XHRpZihyZXNwb25zZSA9PT0gbnVsbCB8fCByZXNwb25zZSA9PT0gdW5kZWZpbmVkIHx8IHJlc3BvbnNlLmxlbmd0aCA9PSAwKXtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCByZXNwb25zZS5sZW5ndGg7IGorKyl7XHJcblx0XHRcdFx0XHQvKiBPbiByw6ljdXDDqHJlIHRvdXRlcyBsZXMgcsOoZ2xlcyBkZSBsJ2FjdGlvbiBlbiBjb3VycyAqL1xyXG5cdFx0XHRcdFx0dmFyIHRlbXBBY3Rpb24gPSBuZXcgYWN0aW9uTW9kZWwoe1xyXG5cdFx0XHRcdFx0XHRcdFx0bnVtYWN0aW9uOiByZXNwb25zZVswXVtqXVsxXS5udW1hY3Rpb24sXHJcblx0XHRcdFx0XHRcdFx0XHRzY29yZW1pbjogIHJlc3BvbnNlWzBdW2pdWzFdLnNjb3JlbWluLFxyXG5cdFx0XHRcdFx0XHRcdFx0bGliYWN0aW9uOiByZXNwb25zZVswXVtqXVsxXS5saWJhY3Rpb24sXHJcblx0XHRcdFx0XHRcdFx0XHRudW1vYmplY3RpZjogcmVzcG9uc2VbMF1bal1bMF0ubnVtb2JqZWN0aWZcclxuXHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdC8qQWpvdXQgZGUgbCdhY3Rpb24gw6AgbGEgbGlzdGUgZCdhY3Rpb24qL1xyXG5cdFx0XHRcdFx0dGhpcy5hY3Rpb25SZXF1ZXN0TGlzdC5hZGQodGVtcEFjdGlvbik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0XHR9XHJcblx0XHR9LCB0aGlzKSlcclxuXHRcdC5kb25lKF8uYmluZChmdW5jdGlvbigpe1xyXG5cdFx0XHR0aGlzLnJlcXVlc3RSZWdsZXMoKTtcclxuXHRcdH0sIHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHRyZXF1ZXN0UmVnbGVzOiBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5yZWdsZVJlcXVlc3RMaXN0ID0gbmV3IHJlZ2xlTGlzdCgpO1xyXG5cdFx0dmFyIHByb21pc2VBcnJheSA9IFtdO1xyXG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMuYWN0aW9uUmVxdWVzdExpc3QubGVuZ3RoOyBpKyspe1xyXG5cdFx0XHR2YXIgdGVtcFJlZ2xlTW9kZWwgPSBuZXcgcmVnbGVNb2RlbCgpO1xyXG5cdFx0XHR0ZW1wUmVnbGVNb2RlbC51cmxSb290ID0gdGVtcFJlZ2xlTW9kZWwudXJsUm9vdCArIFwiQWN0aW9uL1wiICsgdGhpcy5hY3Rpb25SZXF1ZXN0TGlzdC5hdChpKS5nZXQoXCJudW1hY3Rpb25cIik7XHJcblx0XHRcdHByb21pc2VBcnJheVtwcm9taXNlQXJyYXkubGVuZ3RoXSA9IHRlbXBSZWdsZU1vZGVsLmZldGNoKCk7XHJcblx0XHR9XHJcblx0XHQkLndoZW5hbGwocHJvbWlzZUFycmF5KS50aGVuKF8uYmluZChmdW5jdGlvbihyZXNwb25zZSl7XHJcblx0XHRcdGlmKHJlc3BvbnNlID09PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0dmFyIHJlc3BvbnNlQXJyYXkgPSByZXNwb25zZVswXTtcclxuXHRcdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgcmVzcG9uc2VBcnJheS5sZW5ndGg7IGorKyl7XHJcblx0XHRcdFx0XHR2YXIgdGVtcFJlZ2xlTW9kZWwgPSBuZXcgcmVnbGVNb2RlbCh7XHJcblx0XHRcdFx0XHRcdGxpYnJlZ2xlOiByZXNwb25zZUFycmF5W2pdWzBdLmxpYnJlZ2xlLFxyXG5cdFx0XHRcdFx0XHRudW1yZWdsZTogcmVzcG9uc2VBcnJheVtqXVswXS5udW1yZWdsZSxcclxuXHRcdFx0XHRcdFx0c2NvcmVtaW46IHJlc3BvbnNlQXJyYXlbal1bMF0uc2NvcmVtaW4sXHJcblx0XHRcdFx0XHRcdG51bWFjdGlvbjogcmVzcG9uc2VBcnJheVtqXVsxXS5udW1hY3Rpb25cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0dGhpcy5yZWdsZVJlcXVlc3RMaXN0LmFkZCh0ZW1wUmVnbGVNb2RlbCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0XHR9XHJcblx0XHR9LCB0aGlzKSlcclxuXHRcdC5kb25lKF8uYmluZChmdW5jdGlvbigpe1xyXG5cdFx0XHR0aGlzLmpvaW5EYXRhcygpO1xyXG5cdFx0fSwgdGhpcykpO1xyXG5cdH0sXHJcblxyXG5cdGpvaW5EYXRhcyA6IGZ1bmN0aW9uKCl7XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5hY3Rpb25SZXF1ZXN0TGlzdC5sZW5ndGg7IGkrKyl7XHJcblx0XHRcdHZhciBsaXN0UmVnbGUgPSBbXTtcclxuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGo8dGhpcy5yZWdsZVJlcXVlc3RMaXN0Lmxlbmd0aDtqKyspIHtcclxuXHRcdFx0XHRpZih0aGlzLmFjdGlvblJlcXVlc3RMaXN0LmF0KGkpLmdldChcIm51bWFjdGlvblwiKT09dGhpcy5yZWdsZVJlcXVlc3RMaXN0LmF0KGopLmdldChcIm51bWFjdGlvblwiKSl7XHJcblx0XHRcdFx0XHRsaXN0UmVnbGUucHVzaCh0aGlzLnJlZ2xlUmVxdWVzdExpc3QuYXQoaikpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLmFjdGlvblJlcXVlc3RMaXN0LmF0KGkpLnNldChcImxpc3RSZWdsZVwiLGxpc3RSZWdsZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMubGlzdE9iamVjdGlmLmxlbmd0aDsgaSsrKXtcclxuXHRcdFx0dmFyIGxpc3RBY3Rpb24gPSBbXTtcclxuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGo8dGhpcy5hY3Rpb25SZXF1ZXN0TGlzdC5sZW5ndGg7aisrKSB7XHJcblx0XHRcdFx0aWYodGhpcy5saXN0T2JqZWN0aWYuYXQoaSkuZ2V0KFwibnVtb2JqZWN0aWZcIik9PXRoaXMuYWN0aW9uUmVxdWVzdExpc3QuYXQoaikuZ2V0KFwibnVtb2JqZWN0aWZcIikpe1xyXG5cdFx0XHRcdFx0bGlzdEFjdGlvbi5wdXNoKHRoaXMuYWN0aW9uUmVxdWVzdExpc3QuYXQoaikpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLmxpc3RPYmplY3RpZi5hdChpKS5zZXQoXCJsaXN0QWN0aW9uXCIsbGlzdEFjdGlvbik7XHJcblx0XHR9XHJcblx0XHR2YXIgdGVtcCA9IHRoaXMuc2VsZWN0ZWRKZXUubWlzc2lvbkpldVt0aGlzLmN1cnJlbnRNaXNzaW9uXTtcclxuXHRcdHZhciBhY3R1YWxNaXNzaW9uID0gbmV3IG1pc3Npb24oe1xyXG5cdFx0XHRudW1taXNzaW9uOiB0ZW1wLm51bW1pc3Npb24sXHJcblx0XHRcdG51bWpldTogdGVtcC5udW1qZXUsXHJcblx0XHRcdGxpYm1pc3Npb246IHRlbXAubGlibWlzc2lvblxyXG5cdFx0fSk7IFxyXG5cdFx0YWN0dWFsTWlzc2lvbi5zZXQoXCJsaXN0T2JqZWN0aWZcIiwgdGhpcy5saXN0T2JqZWN0aWYpO1xyXG5cdFxyXG5cdFx0LyogUmVuZHUgZmluYWwgZGUgbGEgcGFnZSBkJ3VuZSBtaXNzaW9uKi8gXHJcblx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZUV2YWxNaXNzaW9uKHttaXNzaW9uOmFjdHVhbE1pc3Npb259KSk7XHJcblxyXG5cdFx0dmFyICRiaWxhbkJ1dHRvbiA9ICQoXCIjZm9ybUNob2l4UmVnbGVcIik7XHJcblx0XHQkYmlsYW5CdXR0b24uc3VibWl0KF8uYmluZChmdW5jdGlvbihlKXtcclxuXHRcdFx0dGhpcy52YWxpZE1pc3Npb24oKTtcclxuXHRcdH0sIHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHQvKiBDbGljIHN1ciBsZSBzZWNvbmQgYm91dG9uIHZhbGlkZXIgKi8gXHJcblx0dmFsaWRNaXNzaW9uOiBmdW5jdGlvbigpe1xyXG5cdFx0JCh0aGlzLmNvbnRlbnQpLmh0bWwodGVtcGxhdGVCaWxhbk1pc3Npb24oKSk7XHJcblxyXG5cdFx0dmFyICRtaXNzaW9uU3VpdmFudGUgPSAkKCcjbWlzc2lvblN1aXZhbnRlJyk7XHJcblx0XHQkbWlzc2lvblN1aXZhbnRlLmNsaWNrKF8uYmluZChmdW5jdGlvbihldmVudCl7XHJcblx0XHRcdGlmKHRoaXMuY3VycmVudE1pc3Npb24gPj0gdGhpcy5udW1iZXJPZk1pc3Npb24gLSAxKXtcclxuXHRcdCAgICBcdHRoaXMudmFsaWRCaWxhbigpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0dGhpcy5jdXJyZW50TWlzc2lvbj10aGlzLmN1cnJlbnRNaXNzaW9uKzE7XHJcblx0XHRcdFx0dGhpcy5yZW5kZXJPbmVNaXNzaW9uKCk7XHJcblx0XHRcdH1cclxuXHRcdH0sIHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyogTG9yc3F1ZSB0b3V0ZXMgbGVzIG1pc3Npb25zIG9udCDDqXTDqSB2YWxpZMOpZXMgKi8gXHJcblx0dmFsaWRCaWxhbjogZnVuY3Rpb24oZSl7XHJcblx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZUJpbGFuRmluYWwoKSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCJ2YXIgRXZhbHVhdGlvbiA9IHJlcXVpcmUoJy4vRXZhbHVhdGlvbicpO1xyXG5cclxudmFyIFJvdXRlciA9IEJhY2tib25lLlJvdXRlci5leHRlbmQoe1xyXG5cdHJvdXRlczoge1xyXG5cdFx0XCJFdmFsdWF0aW9uXCI6IFwiRXZhbHVhdGlvblwiXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHJcblx0fSxcclxuXHJcblx0RXZhbHVhdGlvbjogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuZXZhbHVhdGlvbiA9IG5ldyBFdmFsdWF0aW9uKCk7XHJcblx0XHR0aGlzLmV2YWx1YXRpb24ucmVuZGVyKCk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUm91dGVyOyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMj1cImZ1bmN0aW9uXCIsIGFsaWFzMz10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPCEtLSBNb2RhbCAtLT5cXHJcXG4gIDxkaXYgY2xhc3M9XFxcIm1vZGFsIGZhZGVcXFwiIGlkPVxcXCJtb2RhbFZpZXdcXFwiIHJvbGU9XFxcImRpYWxvZ1xcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcIm1vZGFsLWRpYWxvZ1xcXCI+XFxyXFxuICAgICAgPGRpdiBjbGFzcz1cXFwibW9kYWwtY29udGVudFxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtb2RhbC1oZWFkZXJcXFwiPlxcclxcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJjbG9zZVxcXCIgZGF0YS1kaXNtaXNzPVxcXCJtb2RhbFxcXCIgYXJpYS1sYWJlbD1cXFwiQ2xvc2VcXFwiPlxcclxcbiAgICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+JnRpbWVzOzwvc3Bhbj5cXHJcXG4gICAgICAgIDwvYnV0dG9uPlxcclxcbiAgICAgICAgICA8aDQ+XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRpdGxlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50aXRsZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwidGl0bGVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9oND5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwibW9kYWwtYm9keVxcXCI+XFxyXFxuICAgICAgICAgIFwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ib2R5IHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ib2R5IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJib2R5XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtb2RhbC1mb290ZXJcXFwiPlxcclxcbiAgICAgICAgICBcIlxuICAgICsgKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmZvb3RlciB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZm9vdGVyIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJmb290ZXJcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcbiAgPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vbW9kYWwuaGJzJyk7XHJcbnZhciB0ZW1wbGF0ZUVycm9yID0gcmVxdWlyZSgnLi9tb2RhbEVycm9yLmhicycpO1xyXG5cclxudmFyIG1vZGFsID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgJG1vZGFsUm9vdDogJCgnI21vZGFsLXJvb3QnKSxcclxuXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKXtcclxuICAgICAgICB0aGlzLm1vZGFsVGl0bGUgPSBvcHRpb25zLm1vZGFsVGl0bGUgfHwgJyc7XHJcbiAgICAgICAgdGhpcy5tb2RhbEJvZHkgPSBvcHRpb25zLm1vZGFsQm9keSB8fCAnJztcclxuICAgICAgICB0aGlzLm1vZGFsRm9vdGVyID0gb3B0aW9ucy5tb2RhbEZvb3RlciB8fCAnJztcclxuICAgICAgICB0aGlzLm1vZGFsRXJyb3IgPSBvcHRpb25zLm1vZGFsRXJyb3IgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMubW9kYWxFcnJvcil7XHJcbiAgICAgICAgICAgICQoJyNtb2RhbEVycm9yVmlldycpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICQoJyNtb2RhbFZpZXcnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIGlmKHRoaXMubW9kYWxFcnJvcil7XHJcbiAgICAgICAgICAgIHRoaXMuJG1vZGFsUm9vdC5odG1sKHRlbXBsYXRlRXJyb3Ioe3RpdGxlOiB0aGlzLm1vZGFsVGl0bGUsXHJcbiAgICAgICAgICAgIGJvZHk6IHRoaXMubW9kYWxCb2R5LCBmb290ZXI6IHRoaXMubW9kYWxGb290ZXJ9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMuJG1vZGFsUm9vdC5odG1sKHRlbXBsYXRlKHt0aXRsZTogdGhpcy5tb2RhbFRpdGxlLFxyXG4gICAgICAgICAgICBib2R5OiB0aGlzLm1vZGFsQm9keSwgZm9vdGVyOiB0aGlzLm1vZGFsRm9vdGVyfSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1vZGFsOyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczI9XCJmdW5jdGlvblwiLCBhbGlhczM9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjwhLS0gTW9kYWwgLS0+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJtb2RhbCBmYWRlXFxcIiBpZD1cXFwibW9kYWxFcnJvclZpZXdcXFwiIHJvbGU9XFxcImRpYWxvZ1xcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcIm1vZGFsLWRpYWxvZ1xcXCI+XFxyXFxuICAgICAgPGRpdiBjbGFzcz1cXFwibW9kYWwtY29udGVudFxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtb2RhbC1oZWFkZXJcXFwiPlxcclxcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJjbG9zZVxcXCIgZGF0YS1kaXNtaXNzPVxcXCJtb2RhbFxcXCIgYXJpYS1sYWJlbD1cXFwiQ2xvc2VcXFwiPlxcclxcbiAgICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+JnRpbWVzOzwvc3Bhbj5cXHJcXG4gICAgICAgIDwvYnV0dG9uPlxcclxcbiAgICAgICAgICA8aDQ+XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRpdGxlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50aXRsZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwidGl0bGVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9oND5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwibW9kYWwtYm9keVxcXCI+XFxyXFxuICAgICAgICAgIFwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ib2R5IHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ib2R5IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJib2R5XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtb2RhbC1mb290ZXJcXFwiPlxcclxcbiAgICAgICAgICBcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZm9vdGVyIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5mb290ZXIgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImZvb3RlclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG4gIDwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCJ2YXIgaW5kaWNhdGV1ck1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvSW5kaWNhdGV1cnMvSW5kaWNhdGV1cicpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHJlbmRlcjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IGluZGljYXRldXJNb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5jb25maXJtLHRoaXMpXHJcblx0XHR9KTtcclxuXHJcblx0fSxcclxuXHJcblx0Y29uZmlybTpmdW5jdGlvbihpbmRpY2F0ZXVyKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIlN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiQ29uZmlybWVyIGxhIHN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEZvb3RlcjogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIiBpZD1cImFubnVsRGVsZXRlXCI+QW5udWxlcjwvYnV0dG9uPjxhIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgYnRuLW9rXCIgaWQ9XCJjb25maXJtRGVsZXRlXCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIj5TdXBwcmltZXI8L2E+J1xyXG5cdFx0fSk7XHJcblx0XHQkKCcjY29uZmlybURlbGV0ZScpLm9uKCdjbGljaycsXy5iaW5kKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHR2YXIgbW9kZWwgPSBuZXcgaW5kaWNhdGV1ck1vZGVsKHtcImlkXCI6aW5kaWNhdGV1ci5pZH0pLmRlc3Ryb3koe1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLnZhbGlkLHRoaXMpLFxyXG5cdFx0XHRcdGVycm9yOiBfLmJpbmQodGhpcy5zaG93RXJyb3JNb2RhbCx0aGlzKVxyXG5cdFx0XHR9KTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdFx0JCgnI2FubnVsRGVsZXRlJykub24oJ2NsaWNrJyxfLmJpbmQoZnVuY3Rpb24oZSl7XHJcblx0XHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoJyNJbmRpY2F0ZXVycycsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdH0sXHJcblxyXG5cdHZhbGlkOmZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJTdXBwcmVzc2lvblwiLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIlN1cHByZXNzaW9uIGVmZmVjdcOpZVwiXHJcblx0XHR9KTtcclxuXHRcdCQoJy5tb2RhbC1iYWNrZHJvcCcpLnJlbW92ZSgpO1xyXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI0luZGljYXRldXJzJywge3RyaWdnZXI6dHJ1ZX0pO1xyXG5cdH0sXHJcblxyXG5cdHNob3dFcnJvck1vZGFsOiBmdW5jdGlvbihvYmplY3QsZXJyb3Ipe1xyXG5cdFx0aWYgKGVycm9yLnN0YXR1cz09MjAxKXtcclxuXHRcdFx0dGhpcy5zaG93TW9kYWwoKTtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJFcnJldXIgXCIrZXJyb3Iuc3RhdHVzLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIkVycmV1ciBsb3JzIGRlIGxhIHN1cHByZXNzaW9uIDogXCIgKyBlcnJvci5zdGF0dXNUZXh0LFxyXG5cdFx0IFx0bW9kYWxFcnJvcjogdHJ1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcblx0PHRoZWFkPlxcclxcblx0XHQ8dHI+XFxyXFxuXHRcdFx0PHRoPklkZW50aWZpYW50PC90aD5cXHJcXG5cdFx0XHQ8dGg+QWN0aW9uIGFzc29jacOpZTwvdGg+XFxyXFxuXHRcdFx0PHRoPkxpYmVsbMOpPC90aD5cXHJcXG5cdFx0XHQ8dGg+UG9pZHM8L3RoPlxcclxcblx0XHQ8L3RyPlxcclxcblx0PC90aGVhZD5cXHJcXG5cdDx0Ym9keT5cXHJcXG5cdFx0XHQ8dHI+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmRpY2F0ZXVyIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hdHRyaWJ1dGVzIDogc3RhY2sxKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1pbmRpYyA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmRpY2F0ZXVyIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hdHRyaWJ1dGVzIDogc3RhY2sxKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1hY3Rpb24gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5kaWNhdGV1ciA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuYXR0cmlidXRlcyA6IHN0YWNrMSkpICE9IG51bGwgPyBzdGFjazEubGliaW5kaWMgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5kaWNhdGV1ciA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuYXR0cmlidXRlcyA6IHN0YWNrMSkpICE9IG51bGwgPyBzdGFjazEucG9pZHMgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdDwvdHI+XFxyXFxuXHQ8L3Rib2R5PlxcclxcbjwvdGFibGU+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBpbmRpY2F0ZXVyTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9JbmRpY2F0ZXVycy9JbmRpY2F0ZXVyJyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vSW5kaWNhdGV1ci5oYnMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHBhZ2VOYW1lIDogJCgndGl0bGUnKSxcclxuXHR0aXRsZSA6ICQoJyN0aXRsZScpLFxyXG5cdGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHQvL0FwcGVsw6kgYXUgbW9tZW50IGRlIGwnaW5zdGFuY2lhdGlvblx0XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHR9LFxyXG5cclxuXHQvL0ZvbmN0aW9uIGNoYXJnw6llIGR1IHJlbmR1XHJcblx0cmVuZGVyOiBmdW5jdGlvbihpZCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgaW5kaWNhdGV1ck1vZGVsKHtcImlkXCI6aWR9KS5mZXRjaCh7XHJcblx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLnJlbmRlclJlc3VsdGF0LCB0aGlzKVxyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMucGFnZU5hbWUpLmh0bWwoXCJEw6l0YWlsIEluZGljYXRldXJcIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJJbmZvcm1hdGlvbnMgSW5kaWNhdGV1clwiKTtcclxuXHR9LFxyXG5cclxuXHRyZW5kZXJSZXN1bHRhdDogZnVuY3Rpb24oaW5kaWNhdGV1cil7XHJcblx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZSh7aW5kaWNhdGV1cn0pKTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT10aGlzLmxhbWJkYSwgYWxpYXMyPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdFx0XHQ8dHIgb25DbGljaz1cXFwiZG9jdW1lbnQubG9jYXRpb249JyNJbmRpY2F0ZXVycy9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1pbmRpYyA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIidcXFwiPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWluZGljIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1hY3Rpb24gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYmluZGljIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5wb2lkcyA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNJbmRpY2F0ZXVycy9Nb2RpZmllci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1pbmRpYyA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPlxcclxcblx0XHRcdFx0XHQ8L2E+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNJbmRpY2F0ZXVycy9TdXBwcmltZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtaW5kaWMgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcclxcblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXRyYXNoXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPlxcclxcblx0XHRcdFx0XHQ8L2E+XFxyXFxuXHRcdFx0XHQ8L3RkPlxcclxcblx0XHRcdDwvdHI+XFxyXFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCI8YSBocmVmPVxcXCIjSW5kaWNhdGV1cnMvQWpvdXRcXFwiPlxcclxcbjxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1zdWNjZXNzXFxcIj5cXHJcXG5cdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tcGx1c1xcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj4gQWpvdXRlciBJbmRpY2F0ZXVyXFxyXFxuXHRcXHJcXG48L2J1dHRvbj5cXHJcXG48L2E+XFxyXFxuPHRhYmxlIGNsYXNzPVxcXCJ0YWJsZVxcXCI+XFxyXFxuXHQ8dGhlYWQ+XFxyXFxuXHRcdDx0cj5cXHJcXG5cdFx0XHQ8dGg+SWRlbnRpZmlhbnQ8L3RoPlxcclxcblx0XHRcdDx0aD5BY3Rpb24gYXNzb2Npw6llPC90aD5cXHJcXG5cdFx0XHQ8dGg+TGliZWxsw6k8L3RoPlxcclxcblx0XHRcdDx0aD5Qb2lkczwvdGg+XFxyXFxuXHRcdFx0PHRoPjwvdGg+XFxyXFxuXHRcdDwvdHI+XFxyXFxuXHQ8L3RoZWFkPlxcclxcblx0PHRib2R5PlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5kaWNhdGV1cnMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcdDwvdGJvZHk+XFxyXFxuPC90YWJsZT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIGluZGljYXRldXJNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0luZGljYXRldXJzL0luZGljYXRldXJzTGlzdCcpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL0luZGljYXRldXJzLmhicycpO1xyXG5cclxudmFyIHZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcblx0cGFnZU5hbWUgOiAkKCd0aXRsZScpLFxyXG5cdHRpdGxlIDogJCgnI3RpdGxlJyksXHJcblx0Y29udGVudCA6ICQoJyNjb250ZW50JyksXHJcblxyXG5cdC8vQXBwZWzDqSBhdSBtb21lbnQgZGUgbCdpbnN0YW5jaWF0aW9uXHRcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdC8vRm9uY3Rpb24gY2hhcmfDqWUgZHUgcmVuZHVcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgaW5kaWNhdGV1ck1vZGVsKCkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5yZW5kZXJSZXN1bHRhdCwgdGhpcylcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLnBhZ2VOYW1lKS5odG1sKFwiTGlzdGUgZGVzIEluZGljYXRldXJzXCIpO1xyXG5cdFx0JCh0aGlzLnRpdGxlKS5odG1sKFwiTGlzdGUgZGVzIEluZGljYXRldXJzXCIpO1xyXG5cdH0sXHJcblxyXG5cdHJlbmRlclJlc3VsdGF0OiBmdW5jdGlvbihyZXNwb25zZSl7XHJcblx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZSh7aW5kaWNhdGV1cnM6IHJlc3BvbnNlLnRvQXJyYXkoKX0pKTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXIsIGFsaWFzMT1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMj1cImZ1bmN0aW9uXCIsIGFsaWFzMz10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXFxyXFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubnVtYWN0aW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5udW1hY3Rpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm51bWFjdGlvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5udW1hY3Rpb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm51bWFjdGlvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtYWN0aW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiBcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGliYWN0aW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5saWJhY3Rpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImxpYmFjdGlvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L29wdGlvbj5cXHJcXG5cXHJcXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiICA8Zm9ybSBpZD1cXFwiZm9ybUFqb3V0SW5kaWNhdGV1clxcXCIgbWV0aG9kPVxcXCJwb3N0XFxcIj5cXHJcXG4gIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcclxcbiAgICA8bGFiZWwgZm9yPVxcXCJhY3Rpb25JbmRpY2F0ZXVyXFxcIj5BY3Rpb24gYXNzb2Npw6k8L2xhYmVsPlxcclxcbiAgICA8c2VsZWN0IGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiIGlkPVxcXCJhY3Rpb25JbmRpY2F0ZXVyXFxcIj5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFjdGlvbnMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXHJcXG4gICAgPC9zZWxlY3Q+XFxyXFxuICA8L2Rpdj4gIFxcclxcbiAgPGRpdiBjbGFzcz1cXFwiZm9ybS1ncm91cFxcXCI+XFxyXFxuICAgIDxsYWJlbCBmb3I9XFxcImxpYkluZGljYXRldXJcXFwiPkxpYmVsbMOpPC9sYWJlbD5cXHJcXG4gICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiIGlkPVxcXCJsaWJJbmRpY2F0ZXVyXFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50cmV6IHVuIGxpYmVsbMOpXFxcIiB2YWx1ZT1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5kaWNhdGV1ciA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGliaW5kaWMgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIHJlcXVpcmVkPlxcclxcbiAgPC9kaXY+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXHJcXG4gICAgPGxhYmVsIGZvcj1cXFwicG9pZHNJbmRpY2F0ZXVyXFxcIj5Qb2lkczwvbGFiZWw+XFxyXFxuICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIiBpZD1cXFwicG9pZHNJbmRpY2F0ZXVyXFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50cmV6IHVuIHBvaWRzXFxcIiB2YWx1ZT1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuaW5kaWNhdGV1ciA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEucG9pZHMgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIHJlcXVpcmVkPlxcclxcbiAgPC9kaXY+XFxyXFxuICA8YnV0dG9uIGlkPVxcXCJzdWJtaXRCdXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHRcXFwiPlZhbGlkZXI8L2J1dHRvbj5cXHJcXG4gIDwvZm9ybT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIGluZGljYXRldXJNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0luZGljYXRldXJzL0luZGljYXRldXInKTtcclxudmFyIGFjdGlvbk1vZGVsPSByZXF1aXJlICgnLi4vLi4vTW9kZWwvQWN0aW9ucy9BY3Rpb25zTGlzdCcpXHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vUHV0SW5kaWNhdGV1ci5oYnMnKTtcclxudmFyIG1vZGFsID0gcmVxdWlyZSgnLi4vR2xvYmFsL21vZGFsLmpzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHQkcGFnZU5hbWUgOiAkKCd0aXRsZScpLFxyXG5cdCR0aXRsZSA6ICQoJyN0aXRsZScpLFx0XHJcblx0JGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHRlbDogJCgnI2Zvcm1Bam91dEluZGljYXRldXInKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuJHBhZ2VOYW1lLmh0bWwoXCJBam91dCBJbmRpY2F0ZXVyXCIpO1xyXG5cdFx0dGhpcy4kdGl0bGUuaHRtbChcIkFqb3V0ZXIgdW4gSW5kaWNhdGV1clwiKTtcclxuXHRcdCQud2hlbihudWxsLG5ldyBhY3Rpb25Nb2RlbCgpLmZldGNoKCkpXHJcblx0XHQuZG9uZShfLmJpbmQoZnVuY3Rpb24oaW5kaWNhdGV1ciwgcmVzcG9uc2Upe1xyXG5cdFx0dGhpcy5yZW5kZXJSZXN1bHRhdChudWxsLHJlc3BvbnNlKTtcclxuICAgICAgICB9LHRoaXMpKTtcclxuXHR9LFxyXG5cdHJlbmRlck1vZGlmOiBmdW5jdGlvbihpZCl7XHJcblx0XHQkLndoZW4obmV3IGluZGljYXRldXJNb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goKSxuZXcgYWN0aW9uTW9kZWwoKS5mZXRjaCgpKVxyXG5cdFx0LmRvbmUoXy5iaW5kKGZ1bmN0aW9uKGluZGljYXRldXIsIHJlc3BvbnNlKXtcclxuXHRcdHRoaXMucmVuZGVyUmVzdWx0YXQoaW5kaWNhdGV1cixyZXNwb25zZSk7XHJcbiAgICAgICAgfSx0aGlzKSk7XHJcblx0XHR0aGlzLiRwYWdlTmFtZS5odG1sKFwiTW9kaWZpZXIgSW5kaWNhdGV1clwiKTtcclxuXHRcdHRoaXMuJHRpdGxlLmh0bWwoXCJNb2RpZmllciB1biBJbmRpY2F0ZXVyXCIpO1xyXG5cdFx0dGhpcy5pZEluZGljYXRldXI9aWQ7XHJcblx0fSxcclxuXHR2YWxpZDogZnVuY3Rpb24oZSl7XHJcblx0XHR2YXIgbGliSW5kaWNhdGV1ciA9ICQoJyNsaWJJbmRpY2F0ZXVyJykudmFsKCk7XHJcblx0XHR2YXIgc2NvcmVBY3Rpb24gPSAkKCcjYWN0aW9uSW5kaWNhdGV1cicpLnZhbCgpO1xyXG5cdFx0dmFyIGxpYlBvaWRzPSQoJyNwb2lkc0luZGljYXRldXInKS52YWwoKTtcclxuXHRcdGNvbnNvbGUubG9nKGxpYkluZGljYXRldXIrXCIgXCIrc2NvcmVBY3Rpb24rXCIgXCIrbGliUG9pZHMpO1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IGluZGljYXRldXJNb2RlbCgpO1xyXG5cdFx0aWYodGhpcy5pZEluZGljYXRldXI9PT11bmRlZmluZWQpXHJcblx0XHR7XHJcblx0XHRcdGNvbnNvbGUubG9nKG1vZGVsKTtcclxuXHRcdFx0bW9kZWwuc2F2ZSh7XCJsaWJpbmRpY1wiOmxpYkluZGljYXRldXIsIFwibnVtYWN0aW9uXCI6c2NvcmVBY3Rpb24gLFwicG9pZHNcIjpsaWJQb2lkc30sIHtcclxuXHRcdFx0XHRzdWNjZXNzOiB0aGlzLnNob3dNb2RhbCxcclxuXHRcdFx0XHRlcnJvcjogXy5iaW5kKHRoaXMuc2hvd0Vycm9yTW9kYWwsdGhpcylcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdG1vZGVsLnNhdmUoe1wibnVtaW5kaWNcIjp0aGlzLmlkSW5kaWNhdGV1cixcImxpYmluZGljXCI6bGliSW5kaWNhdGV1ciwgXCJudW1hY3Rpb25cIjpzY29yZUFjdGlvbiAsXCJwb2lkc1wiOmxpYlBvaWRzfSwge1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IHRoaXMuc2hvd01vZGFsLFxyXG5cdFx0XHRcdGVycm9yOiBfLmJpbmQodGhpcy5zaG93RXJyb3JNb2RhbCx0aGlzKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9LFxyXG5cdHJlbmRlclJlc3VsdGF0OiBmdW5jdGlvbihpbmRpY2F0ZXVyLHJlc3BvbnNlKXtcclxuXHRcdGlmKGluZGljYXRldXI9PT1udWxsKVxyXG5cdFx0e1xyXG5cdFx0XHQkKHRoaXMuJGNvbnRlbnQpLmh0bWwodGVtcGxhdGUoe2FjdGlvbnM6IHJlc3BvbnNlWzBdfSkpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLiRjb250ZW50Lmh0bWwodGVtcGxhdGUoe2luZGljYXRldXI6aW5kaWNhdGV1clswXSxhY3Rpb25zOiByZXNwb25zZVswXX0pKTtcclxuXHRcdFx0JChcIiNhY3Rpb25JbmRpY2F0ZXVyIG9wdGlvblt2YWx1ZT0nXCIraW5kaWNhdGV1clswXS5udW1hY3Rpb24rXCInXVwiKS5hdHRyKFwic2VsZWN0ZWRcIiwgXCJzZWxlY3RlZFwiKTtcclxuXHRcdH1cclxuXHRcdHZhciAkZm9ybUFqb3V0SW5kaWNhdGV1ciA9ICQoJyNmb3JtQWpvdXRJbmRpY2F0ZXVyJyk7XHJcblxyXG5cdFx0JGZvcm1Bam91dEluZGljYXRldXIuc3VibWl0KF8uYmluZChmdW5jdGlvbihldmVudCl7XHJcblx0XHQgICAgdGhpcy52YWxpZCgpO1xyXG5cdFx0fSwgdGhpcykpO1xyXG5cdH0sXHJcblx0c2hvd01vZGFsOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiQWpvdXRcIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJMJ2Fqb3V0IGEgw6l0w6kgZWZmZWN0dcOpIGF2ZWMgc3VjY8Ooc1wiXHJcblx0XHR9KTtcclxuXHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoJyNJbmRpY2F0ZXVycycsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHR9LFxyXG5cclxuXHRzaG93RXJyb3JNb2RhbDogZnVuY3Rpb24ob2JqZWN0LGVycm9yKXtcclxuXHRcdGlmIChlcnJvci5zdGF0dXM9PTIwMSl7XHJcblx0XHRcdHRoaXMuc2hvd01vZGFsKCk7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiRXJyZXVyIFwiK2Vycm9yLnN0YXR1cyxcclxuXHRcdCBcdG1vZGFsQm9keTogXCJFcnJldXIgbG9ycyBkZSBsJ2Fqb3V0IDogXCIgKyBlcnJvci5zdGF0dXNUZXh0LFxyXG5cdFx0IFx0bW9kYWxFcnJvcjogdHJ1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCJ2YXIgSW5kaWNhdGV1cnMgPSByZXF1aXJlKCcuL0luZGljYXRldXJzJyk7XHJcbnZhciBJbmRpY2F0ZXVyID0gcmVxdWlyZSgnLi9JbmRpY2F0ZXVyJyk7XHJcbnZhciBBam91dEluZGljYXRldXIgPSByZXF1aXJlKCcuL1B1dEluZGljYXRldXInKTtcclxudmFyIERlbGV0ZUluZGljYXRldXIgPSByZXF1aXJlKCcuL0RlbGV0ZUluZGljYXRldXInKTtcclxuXHJcbnZhciBSb3V0ZXIgPSBCYWNrYm9uZS5Sb3V0ZXIuZXh0ZW5kKHtcclxuXHRyb3V0ZXM6IHtcclxuXHRcdFwiSW5kaWNhdGV1cnNcIjogXCJJbmRpY2F0ZXVyc1wiLFxyXG5cdFx0XCJJbmRpY2F0ZXVycy9Bam91dFwiOiBcIkFqb3V0SW5kaWNhdGV1clwiLFxyXG5cdFx0XCJJbmRpY2F0ZXVycy9Nb2RpZmllci86aWRcIjogXCJNb2RpZkluZGljYXRldXJcIixcclxuXHRcdFwiSW5kaWNhdGV1cnMvU3VwcHJpbWVyLzppZFwiOiBcIlN1cHBySW5kaWNhdGV1clwiLFxyXG5cdFx0XCJJbmRpY2F0ZXVycy86aWRcIjogXCJJbmRpY2F0ZXVyXCJcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cclxuXHR9LFxyXG5cclxuXHRJbmRpY2F0ZXVyczogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuSW5kaWNhdGV1cnMgPSBuZXcgSW5kaWNhdGV1cnMoKTtcclxuXHRcdHRoaXMuSW5kaWNhdGV1cnMucmVuZGVyKCk7XHJcblx0fSxcclxuXHJcblx0SW5kaWNhdGV1cjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5JbmRpY2F0ZXVyID0gbmV3IEluZGljYXRldXIoKTtcclxuXHRcdHRoaXMuSW5kaWNhdGV1ci5yZW5kZXIoaWQpO1xyXG5cdH0sXHJcblxyXG5cdEFqb3V0SW5kaWNhdGV1cjogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuSW5kaWNhdGV1ciA9IG5ldyBBam91dEluZGljYXRldXIoKTtcclxuXHRcdHRoaXMuSW5kaWNhdGV1ci5yZW5kZXIoKTtcclxuXHR9LFxyXG5cdE1vZGlmSW5kaWNhdGV1cjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5JbmRpY2F0ZXVyID0gbmV3IEFqb3V0SW5kaWNhdGV1cigpO1xyXG5cdFx0dGhpcy5JbmRpY2F0ZXVyLnJlbmRlck1vZGlmKGlkKTtcclxuXHR9LFxyXG5cdFN1cHBySW5kaWNhdGV1cjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5pbmRpY2F0ZXVyID0gbmV3IERlbGV0ZUluZGljYXRldXIoKTtcclxuXHRcdHRoaXMuaW5kaWNhdGV1ci5yZW5kZXIoaWQpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlcjsiLCJ2YXIgamV1TW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9KZXV4L0pldScpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHJlbmRlcjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IGpldU1vZGVsKHtcImlkXCI6aWR9KS5mZXRjaCh7XHJcblx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLmNvbmZpcm0sdGhpcylcclxuXHRcdH0pO1xyXG5cclxuXHR9LFxyXG5cclxuXHRjb25maXJtOmZ1bmN0aW9uKGpldSl7XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJTdXBwcmVzc2lvblwiLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIkNvbmZpcm1lciBsYSBzdXBwcmVzc2lvblwiLFxyXG5cdFx0IFx0bW9kYWxGb290ZXI6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIGRhdGEtZGlzbWlzcz1cIm1vZGFsXCIgaWQ9XCJhbm51bERlbGV0ZVwiPkFubnVsZXI8L2J1dHRvbj48YSBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIGJ0bi1va1wiIGlkPVwiY29uZmlybURlbGV0ZVwiIGRhdGEtZGlzbWlzcz1cIm1vZGFsXCI+U3VwcHJpbWVyPC9hPidcclxuXHRcdH0pO1xyXG5cdFx0JCgnI2NvbmZpcm1EZWxldGUnKS5vbignY2xpY2snLF8uYmluZChmdW5jdGlvbihlKXtcclxuXHRcdFx0dmFyIG1vZGVsID0gbmV3IGpldU1vZGVsKHtcImlkXCI6amV1LmlkfSkuZGVzdHJveSh7XHJcblx0XHRcdFx0c3VjY2VzczogXy5iaW5kKHRoaXMudmFsaWQsdGhpcyksXHJcblx0XHRcdFx0ZXJyb3I6IF8uYmluZCh0aGlzLnNob3dFcnJvck1vZGFsLHRoaXMpXHJcblx0XHRcdH0pO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0XHQkKCcjYW5udWxEZWxldGUnKS5vbignY2xpY2snLF8uYmluZChmdW5jdGlvbihlKXtcclxuXHRcdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI0pldXgnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0XHR9LHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHR2YWxpZDpmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJTdXBwcmVzc2lvbiBlZmZlY3XDqWVcIlxyXG5cdFx0fSk7XHJcblx0XHQkKCcubW9kYWwtYmFja2Ryb3AnKS5yZW1vdmUoKTtcclxuXHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoJyNKZXV4Jywge3RyaWdnZXI6dHJ1ZX0pO1xyXG5cdH0sXHJcblxyXG5cdHNob3dFcnJvck1vZGFsOiBmdW5jdGlvbihvYmplY3QsZXJyb3Ipe1xyXG5cdFx0aWYgKGVycm9yLnN0YXR1cz09MjAxKXtcclxuXHRcdFx0dGhpcy5zaG93TW9kYWwoKTtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJFcnJldXIgXCIrZXJyb3Iuc3RhdHVzLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIkVycmV1ciBsb3JzIGRlIGxhIHN1cHByZXNzaW9uIDogXCIgKyBlcnJvci5zdGF0dXNUZXh0LFxyXG5cdFx0IFx0bW9kYWxFcnJvcjogdHJ1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcblx0PHRoZWFkPlxcclxcblx0XHQ8dHI+XFxyXFxuXHRcdFx0PHRoPk51bcOpcm8gZHUgamV1PC90aD5cXHJcXG5cdFx0XHQ8dGg+Tm9tIGR1IGpldTwvdGg+XFxyXFxuXHRcdDwvdHI+XFxyXFxuXHQ8L3RoZWFkPlxcclxcblx0PHRib2R5Plxcclxcblx0XHRcdDx0cj5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmpldSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuYXR0cmlidXRlcyA6IHN0YWNrMSkpICE9IG51bGwgPyBzdGFjazEubnVtamV1IDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmpldSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuYXR0cmlidXRlcyA6IHN0YWNrMSkpICE9IG51bGwgPyBzdGFjazEubGliZWxsZWpldSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cdDwvdGJvZHk+XFxyXFxuPC90YWJsZT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIGpldU1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvSmV1eC9KZXUnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9KZXUuaGJzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0dGl0bGUgOiAkKCcjdGl0bGUnKSxcclxuXHRjb250ZW50IDogJCgnI2NvbnRlbnQnKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IGpldU1vZGVsKHtcImlkXCI6aWR9KS5mZXRjaCh7XHJcblx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLnJlbmRlclJlc3VsdGF0LCB0aGlzKVxyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMucGFnZU5hbWUpLmh0bWwoXCJEw6l0YWlsIEpldVwiKTtcclxuXHRcdCQodGhpcy50aXRsZSkuaHRtbChcIkluZm9ybWF0aW9ucyBKZXVcIik7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKGpldSl7XHJcblx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZSh7amV1fSkpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczI9XCJmdW5jdGlvblwiLCBhbGlhczM9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0XHRcdDx0ciBvbkNsaWNrPVxcXCJkb2N1bWVudC5sb2NhdGlvbj0nI0pldXgvXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bWpldSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtamV1IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJudW1qZXVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiJ1xcXCI+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bWpldSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtamV1IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJudW1qZXVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGliZWxsZWpldSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGliZWxsZWpldSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibGliZWxsZWpldVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPm51bcOpcm88L3RkPlxcclxcblx0XHRcdFx0PHRkPmxpYmVsbMOpPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cXHJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI0pldXgvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bWpldSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtamV1IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJudW1qZXVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWxcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI0pldXgvU3VwcHJpbWVyL1wiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5udW1qZXUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm51bWpldSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtamV1XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdDwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1pc3Npb25KZXUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcdFx0XHQ8dHI+XFxyXFxuXHRcdFx0XHQ8dGQ+PC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD48L3RkPlxcclxcblx0XHRcdFx0PHRkPlxcclxcblx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjSmV1eC9cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubnVtamV1IHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5udW1qZXUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm51bWpldVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIvTWlzc2lvbnMvQWpvdXRcXFwiPlxcclxcblx0XHRcdFx0XHRcdDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1zdWNjZXNzXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPkFqb3V0ZXIgTWlzc2lvbjwvYnV0dG9uPlxcclxcblx0XHRcdFx0XHQ8L2E+XFxyXFxuXHRcdFx0XHQ8L3RkPlxcclxcblx0XHRcdDwvdHI+XFxyXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczI9XCJmdW5jdGlvblwiLCBhbGlhczM9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0XHRcdDx0ciBvbkNsaWNrPVxcXCJkb2N1bWVudC5sb2NhdGlvbj0nI0pldXgvXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bWpldSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtamV1IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJudW1qZXVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiL01pc3Npb25zL1wiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5udW1taXNzaW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5udW1taXNzaW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJudW1taXNzaW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIidcXFwiPlxcclxcblx0XHRcdFx0PHRkPjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+PC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubnVtbWlzc2lvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtbWlzc2lvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtbWlzc2lvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5saWJtaXNzaW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5saWJtaXNzaW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJsaWJtaXNzaW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNKZXV4L1wiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5udW1qZXUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm51bWpldSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtamV1XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIi9NaXNzaW9ucy9Nb2RpZmllci9cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubnVtbWlzc2lvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtbWlzc2lvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtbWlzc2lvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcclxcblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjSmV1eC9NaXNzaW9ucy9TdXBwcmltZXIvXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bW1pc3Npb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm51bW1pc3Npb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm51bW1pc3Npb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi10cmFzaFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0PC90ZD5cXHJcXG5cdFx0XHQ8L3RyPlxcclxcblwiO1xufSxcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiPGEgaHJlZj1cXFwiI0pldXgvQWpvdXRcXFwiPlxcclxcbjxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1zdWNjZXNzXFxcIj5cXHJcXG4gIDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBsdXNcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+IEFqb3V0ZXIgSmV1XFxyXFxuPC9idXR0b24+XFxyXFxuPC9hPlxcclxcbjx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcblx0PHRoZWFkPlxcclxcblx0XHQ8dHI+XFxyXFxuXHRcdFx0PHRoPk51bcOpcm8gZHUgamV1PC90aD5cXHJcXG5cdFx0XHQ8dGg+Tm9tIGR1IGpldTwvdGg+XFxyXFxuXHRcdFx0PHRoPk1pc3Npb248dGg+XFxyXFxuXHRcdFx0PHRoPjwvdGg+XFxyXFxuXHRcdDwvdHI+XFxyXFxuXHQ8L3RoZWFkPlxcclxcblx0PHRib2R5PlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuamV1eCA6IGRlcHRoMCkse1wibmFtZVwiOlwiZWFjaFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlx0PC90Ym9keT5cXHJcXG48L3RhYmxlPlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCJ2YXIgamV1eE1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvSmV1eC9KZXV4TGlzdCcpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL0pldXguaGJzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0dGl0bGUgOiAkKCcjdGl0bGUnKSxcclxuXHRjb250ZW50IDogJCgnI2NvbnRlbnQnKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdCQud2hlbihuZXcgamV1eE1vZGVsKCkuZmV0Y2goKSlcclxuXHRcdC5kb25lKF8uYmluZChmdW5jdGlvbihqZXV4KXtcclxuXHRcdFx0dGhpcy5yZW5kZXJSZXN1bHRhdChqZXV4KTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdFx0JCh0aGlzLnBhZ2VOYW1lKS5odG1sKFwiTGlzdGUgZGVzIEpldXhcIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJMaXN0ZSBkZXMgSmV1eFwiKTtcclxuXHR9LFxyXG5cclxuXHRyZW5kZXJSZXN1bHRhdDogZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0Y29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG5cdFx0JCh0aGlzLmNvbnRlbnQpLmh0bWwodGVtcGxhdGUoe2pldXg6cmVzcG9uc2V9KSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCIgIDxmb3JtIGlkPVxcXCJmb3JtUHV0SmV1XFxcIiBtZXRob2Q9XFxcInBvc3RcXFwiPlxcclxcbiAgPGRpdiBjbGFzcz1cXFwiZm9ybS1ncm91cFxcXCI+XFxyXFxuICAgIDxsYWJlbCBmb3I9XFxcImxpYmVsbGVqZXVcXFwiPkxpYmVsbMOpPC9sYWJlbD5cXHJcXG4gICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiIGlkPVxcXCJsaWJlbGxlamV1XFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50cmV6IHVuIG5vbVxcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyB0aGlzLmVzY2FwZUV4cHJlc3Npb24odGhpcy5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuamV1IDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJlbGxlamV1IDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiByZXF1aXJlZD5cXHJcXG4gIDwvZGl2PlxcclxcbiAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0XFxcIj5WYWxpZGVyPC9idXR0b24+XFxyXFxuICA8L2Zvcm0+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBqZXVNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0pldXgvSmV1Jyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vUHV0SmV1LmhicycpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdCRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0JHRpdGxlIDogJCgnI3RpdGxlJyksXHRcclxuXHQkY29udGVudCA6ICQoJyNjb250ZW50JyksXHJcblxyXG5cdGVsOiAkKCcjZm9ybVB1dEpldScpLFxyXG5cclxuXHQvL0FwcGVsw6kgYXUgbW9tZW50IGRlIGwnaW5zdGFuY2lhdGlvblx0XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHR9LFxyXG5cclxuXHQvL0ZvbmN0aW9uIGNoYXJnw6llIGR1IHJlbmR1XHJcblx0cmVuZGVyOiBmdW5jdGlvbigpe1xyXG5cdFx0JC53aGVuKG5ldyBqZXVNb2RlbCgpLmZldGNoKCkpXHJcblx0XHQuZG9uZShfLmJpbmQoZnVuY3Rpb24oamV1KXtcclxuXHRcdFx0dGhpcy5yZW5kZXJSZXN1bHRhdChqZXUpO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0XHR0aGlzLiRwYWdlTmFtZS5odG1sKFwiQWpvdXQgSmV1XCIpO1xyXG5cdFx0dGhpcy4kdGl0bGUuaHRtbChcIkFqb3V0ZXIgdW4gSmV1XCIpO1xyXG5cdH0sXHJcblxyXG5cdHJlbmRlck1vZGlmOiBmdW5jdGlvbihpZCl7XHJcblx0XHQkLndoZW4obmV3IGpldU1vZGVsKHtcImlkXCI6aWR9KS5mZXRjaCgpKVxyXG5cdFx0LmRvbmUoXy5iaW5kKGZ1bmN0aW9uKGpldSl7XHJcblx0XHRcdHRoaXMucmVuZGVyUmVzdWx0YXQoamV1KTtcclxuXHRcdH0sdGhpcykpO1x0XHRcclxuXHRcdHRoaXMuJHBhZ2VOYW1lLmh0bWwoXCJNb2RpZmllciBKZXVcIik7XHJcblx0XHR0aGlzLiR0aXRsZS5odG1sKFwiTW9kaWZpZXIgdW4gSmV1XCIpO1xyXG5cdFx0dGhpcy5pZEpldT1pZDtcclxuXHR9LFxyXG5cdHZhbGlkOiBmdW5jdGlvbihlKXtcclxuXHRcdHZhciBsaWJlbGxlamV1ID0gJCgnI2xpYmVsbGVqZXUnKS52YWwoKTtcclxuXHRcdHZhciBtb2RlbCA9IG5ldyBqZXVNb2RlbCgpO1xyXG5cdFx0aWYgKHRoaXMuaWRKZXU9PT11bmRlZmluZWQpe1xyXG5cdFx0XHRtb2RlbC5zYXZlKHtcImxpYmVsbGVqZXVcIjpsaWJlbGxlamV1fSwge1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IHRoaXMuc2hvd01vZGFsKFwiQWpvdXRcIiksXHJcblx0XHRcdFx0ZXJyb3I6IF8uYmluZCh0aGlzLnNob3dFcnJvck1vZGFsLHRoaXMpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0bW9kZWwuc2F2ZSh7XCJpZFwiOnRoaXMuaWRKZXUsIFwibGliZWxsZWpldVwiOmxpYmVsbGVqZXV9LCB7XHJcblx0XHRcdFx0c3VjY2VzczogdGhpcy5zaG93TW9kYWwoXCJNb2RpZmllclwiKSxcclxuXHRcdFx0XHRlcnJvcjogXy5iaW5kKHRoaXMuc2hvd0Vycm9yTW9kYWwsdGhpcylcclxuXHRcdFx0fSk7XHJcblx0XHR9IFxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdGlmKHJlc3BvbnNlPT09dW5kZWZpbmVkKXtcclxuXHRcdFx0dGhpcy4kY29udGVudC5odG1sKHRlbXBsYXRlKCkpO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHRoaXMuJGNvbnRlbnQuaHRtbCh0ZW1wbGF0ZSh7amV1OnJlc3BvbnNlfSkpO1xyXG5cdFx0fVxyXG5cdFx0JCgnI2Zvcm1QdXRKZXUnKS5zdWJtaXQoXy5iaW5kKGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdCAgICB0aGlzLnZhbGlkKCk7XHJcblx0XHR9LCB0aGlzKSk7XHJcblx0fSxcclxuXHJcblx0c2hvd01vZGFsOiBmdW5jdGlvbihqZXVUeXBlKXtcclxuXHRcdHZhciBBcnRpY2xlTW9kYWxCb2R5ID0gXCJMYVwiO1xyXG5cdFx0aWYoamV1VHlwZSA9PT0gXCJBam91dFwiKXtcclxuXHRcdFx0QXJ0aWNsZU1vZGFsQm9keSA9IFwiTCdcIjtcclxuXHRcdH1cclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBqZXVUeXBlLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBBcnRpY2xlTW9kYWxCb2R5K1wiIFwiK2pldVR5cGUrXCIgYSDDqXTDqSBlZmZlY3R1w6kgYXZlYyBzdWNjw6hzXCJcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcjSmV1eCcsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHR9LFxyXG5cclxuXHRzaG93RXJyb3JNb2RhbDogZnVuY3Rpb24ob2JqZWN0LGVycm9yKXtcclxuXHRcdGlmIChlcnJvci5zdGF0dXM9PTIwMSl7XHJcblx0XHRcdHRoaXMuc2hvd01vZGFsKCk7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiRXJyZXVyIFwiK2Vycm9yLnN0YXR1cyxcclxuXHRcdCBcdG1vZGFsQm9keTogXCJFcnJldXIgbG9ycyBkZSBsJ2Fqb3V0IDogXCIgKyBlcnJvci5zdGF0dXNUZXh0LFxyXG5cdFx0IFx0bW9kYWxFcnJvcjogdHJ1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCJ2YXIgSmV1eCA9IHJlcXVpcmUoJy4vSmV1eCcpO1xyXG52YXIgSmV1ID0gcmVxdWlyZSgnLi9KZXUnKTtcclxudmFyIFB1dEpldSA9IHJlcXVpcmUoJy4vUHV0SmV1Jyk7XHJcbnZhciBEZWxldGVKZXUgPSByZXF1aXJlKCcuL0RlbGV0ZUpldScpO1xyXG5cclxudmFyIFJvdXRlciA9IEJhY2tib25lLlJvdXRlci5leHRlbmQoe1xyXG5cdHJvdXRlczoge1xyXG5cdFx0XCJKZXV4XCI6IFwiSmV1eFwiLFxyXG5cdFx0XCJKZXV4L0Fqb3V0XCI6IFwiQWpvdXRKZXVcIixcclxuXHRcdFwiSmV1eC9Nb2RpZmllci86aWRcIjogXCJNb2RpZkpldVwiLFxyXG5cdFx0XCJKZXV4L1N1cHByaW1lci86aWRcIjogXCJTdXBwckpldVwiLFxyXG5cdFx0XCJKZXV4LzppZFwiOiBcIkpldVwiXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHJcblx0fSxcclxuXHJcblx0SmV1eDogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuSmV1eCA9IG5ldyBKZXV4KCk7XHJcblx0XHR0aGlzLkpldXgucmVuZGVyKCk7XHJcblx0fSxcclxuXHJcblx0SmV1OiBmdW5jdGlvbihpZCl7XHJcblx0XHR0aGlzLkpldSA9IG5ldyBKZXUoKTtcclxuXHRcdHRoaXMuSmV1LnJlbmRlcihpZCk7XHJcblx0fSxcclxuXHJcblx0QWpvdXRKZXU6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLkpldSA9IG5ldyBQdXRKZXUoKTtcclxuXHRcdHRoaXMuSmV1LnJlbmRlcigpO1xyXG5cdH0sXHJcblxyXG5cdE1vZGlmSmV1OiBmdW5jdGlvbihpZCl7XHJcblx0XHR0aGlzLkpldSA9IG5ldyBQdXRKZXUoKTtcclxuXHRcdHRoaXMuSmV1LnJlbmRlck1vZGlmKGlkKTtcclxuXHR9LFxyXG5cclxuXHRTdXBwckpldTogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5KZXUgPSBuZXcgRGVsZXRlSmV1KCk7XHJcblx0XHR0aGlzLkpldS5yZW5kZXIoaWQpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlcjsiLCJ2YXIgbWlzc2lvbk1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvTWlzc2lvbnMvTWlzc2lvbicpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHJlbmRlcjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IG1pc3Npb25Nb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5jb25maXJtLHRoaXMpXHJcblx0XHR9KTtcclxuXHJcblx0fSxcclxuXHJcblx0Y29uZmlybTpmdW5jdGlvbihtaXNzaW9uKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIlN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiQ29uZmlybWVyIGxhIHN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEZvb3RlcjogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIiBpZD1cImFubnVsRGVsZXRlXCI+QW5udWxlcjwvYnV0dG9uPjxhIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgYnRuLW9rXCIgaWQ9XCJjb25maXJtRGVsZXRlXCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIj5TdXBwcmltZXI8L2E+J1xyXG5cdFx0fSk7XHJcblx0XHQkKCcjY29uZmlybURlbGV0ZScpLm9uKCdjbGljaycsXy5iaW5kKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHR2YXIgbW9kZWwgPSBuZXcgbWlzc2lvbk1vZGVsKHtcImlkXCI6bWlzc2lvbi5pZH0pLmRlc3Ryb3koe1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLnZhbGlkLHRoaXMpLFxyXG5cdFx0XHRcdGVycm9yOiBfLmJpbmQodGhpcy5zaG93RXJyb3JNb2RhbCx0aGlzKVxyXG5cdFx0XHR9KTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdFx0JCgnI2FubnVsRGVsZXRlJykub24oJ2NsaWNrJyxfLmJpbmQoZnVuY3Rpb24oZSl7XHJcblx0XHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoJyNNaXNzaW9ucycsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdH0sXHJcblxyXG5cdHZhbGlkOmZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJTdXBwcmVzc2lvblwiLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIlN1cHByZXNzaW9uIGVmZmVjdcOpZVwiXHJcblx0XHR9KTtcclxuXHRcdCQoJy5tb2RhbC1iYWNrZHJvcCcpLnJlbW92ZSgpO1xyXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI0pldXgnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0XHRCYWNrYm9uZS5oaXN0b3J5LnN0b3AoKTsgXHJcblx0XHRCYWNrYm9uZS5oaXN0b3J5LnN0YXJ0KCk7XHJcblx0fSxcclxuXHJcblx0c2hvd0Vycm9yTW9kYWw6IGZ1bmN0aW9uKG9iamVjdCxlcnJvcil7XHJcblx0XHRpZiAoZXJyb3Iuc3RhdHVzPT0yMDEpe1xyXG5cdFx0XHR0aGlzLnNob3dNb2RhbCgpO1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIkVycmV1ciBcIitlcnJvci5zdGF0dXMsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiRXJyZXVyIGxvcnMgZGUgbGEgc3VwcHJlc3Npb24gOiBcIiArIGVycm9yLnN0YXR1c1RleHQsXHJcblx0XHQgXHRtb2RhbEVycm9yOiB0cnVlXHJcblx0XHR9KTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT10aGlzLmxhbWJkYSwgYWxpYXMyPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdFx0XHQ8dHIgb25DbGljaz1cXFwiZG9jdW1lbnQubG9jYXRpb249JyNPYmplY3RpZnMvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJzInXSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtb2JqZWN0aWYgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCInXFxcIj5cXHJcXG5cdFx0XHRcdDx0ZD48L3RkPlxcclxcblx0XHRcdFx0PHRkPjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJzInXSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtb2JqZWN0aWYgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWycyJ10gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYm9iamVjdGlmIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cXHJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI09iamVjdGlmcy9Nb2RpZmllci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnMiddIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1vYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPlxcclxcblx0XHRcdFx0XHQ8L2E+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNPYmplY3RpZnMvU3VwcHJpbWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWycyJ10gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bW9iamVjdGlmIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi10cmFzaFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0PC90ZD5cXHJcXG5cdFx0XHQ8L3RyPlxcclxcblwiO1xufSxcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT10aGlzLmxhbWJkYSwgYWxpYXMyPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCI8dGFibGUgY2xhc3M9XFxcInRhYmxlXFxcIj5cXHJcXG5cdDx0aGVhZD5cXHJcXG5cdFx0PHRyPlxcclxcblx0XHRcdDx0aD5JZGVudGlmaWFudDwvdGg+XFxyXFxuXHRcdFx0PHRoPkxpYmVsbMOpIE1pc3Npb248L3RoPlxcclxcblx0XHRcdDx0aD5PYmplY3RpZnMgbGnDqTwvdGg+XFxyXFxuXHRcdFx0PHRoPjwvdGg+XFxyXFxuXHRcdDwvdHI+XFxyXFxuXHQ8L3RoZWFkPlxcclxcblx0PHRib2R5Plxcclxcblx0XHRcdDx0cj5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5taXNzaW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1taXNzaW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5taXNzaW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJtaXNzaW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5JZGVudGlmaWFudDwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+TGliZWxsw6kgT2JqZWN0aWY8L3RkPlxcclxcblx0XHRcdFx0PHRkPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjSmV1eC9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5taXNzaW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1qZXUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCIvTWlzc2lvbnMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWlzc2lvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtbWlzc2lvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPlxcclxcblx0XHRcdFx0XHQ8L2E+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNKZXV4L01pc3Npb25zL1N1cHByaW1lci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5taXNzaW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1taXNzaW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi10cmFzaFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0PC90ZD5cXHJcXG5cdFx0XHQ8L3RyPlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub2JqZWN0aWZzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXHRcdFx0PHRyPlxcclxcblx0XHRcdFx0PHRkPjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+PC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cXHJcXG5cdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI0pldXgvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWlzc2lvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtamV1IDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiL01pc3Npb25zL01vZGlmaWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1pc3Npb24gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bW1pc3Npb24gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCIvT2JqZWN0aWZzL0Fqb3V0XFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0biBidG4tc3VjY2Vzc1xcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tcGx1c1xcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5GaXhlciBPYmplY3RpZjwvYnV0dG9uPlxcclxcblx0XHRcdFx0XHQ8L2E+XFxyXFxuXHRcdFx0XHQ8L3RkPlxcclxcblx0XHRcdDwvdHI+XFxyXFxuXHQ8L3Rib2R5PlxcclxcbjwvdGFibGU+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBtaXNzaW9uTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9NaXNzaW9ucy9NaXNzaW9uJyk7XHJcbnZhciBvYmplY3RpZkxpc3Q9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0ZpeGUvRml4ZScpXHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vTWlzc2lvbi5oYnMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHBhZ2VOYW1lIDogJCgndGl0bGUnKSxcclxuXHR0aXRsZSA6ICQoJyN0aXRsZScpLFxyXG5cdGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHQvL0FwcGVsw6kgYXUgbW9tZW50IGRlIGwnaW5zdGFuY2lhdGlvblx0XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHR9LFxyXG5cclxuXHQvL0ZvbmN0aW9uIGNoYXJnw6llIGR1IHJlbmR1XHJcblx0cmVuZGVyOiBmdW5jdGlvbihpZCl7XHJcblx0XHR2YXIgb2JqZWN0aWZzPW5ldyBvYmplY3RpZkxpc3QoKTtcclxuXHRcdG9iamVjdGlmcy51cmxSb290PW9iamVjdGlmcy51cmxSb290KycnK2lkK1wiL09iamVjdGlmXCI7XHJcblx0XHQkLndoZW4obmV3IG1pc3Npb25Nb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goKSxvYmplY3RpZnMuZmV0Y2goKSlcclxuXHRcdC5kb25lKF8uYmluZChmdW5jdGlvbihtaXNzaW9uLG9iamVjdGlmcyl7XHJcblx0XHRcdHRoaXMucmVuZGVyUmVzdWx0YXQobWlzc2lvbixvYmplY3RpZnMpO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0XHQkKHRoaXMucGFnZU5hbWUpLmh0bWwoXCJEw6l0YWlsIE1pc3Npb25cIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJJbmZvcm1hdGlvbnMgTWlzc2lvblwiKTtcclxuXHR9LFxyXG5cclxuXHRyZW5kZXJSZXN1bHRhdDogZnVuY3Rpb24obWlzc2lvbixvYmplY3RpZnMpe1xyXG5cdFx0JCh0aGlzLmNvbnRlbnQpLmh0bWwodGVtcGxhdGUoe21pc3Npb246bWlzc2lvblswXSxvYmplY3RpZnM6b2JqZWN0aWZzWzBdfSkpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiICA8Zm9ybSBpZD1cXFwiZm9ybVB1dE1pc3Npb25cXFwiIG1ldGhvZD1cXFwicG9zdFxcXCI+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXHJcXG4gIDxsYWJlbCBmb3I9XFxcImxpYm1pc3Npb25cXFwiPkxpYmVsbMOpPC9sYWJlbD5cXHJcXG4gICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiIGlkPVxcXCJsaWJtaXNzaW9uXFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50cmV6IHVuIG5vbVxcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyB0aGlzLmVzY2FwZUV4cHJlc3Npb24odGhpcy5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWlzc2lvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGlibWlzc2lvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCIgcmVxdWlyZWQ+XFxyXFxuICA8L2Rpdj5cXHJcXG4gIDxidXR0b24gY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdFxcXCI+VmFsaWRlcjwvYnV0dG9uPlxcclxcbiAgPC9mb3JtPlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCJ2YXIgbWlzc2lvbk1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvTWlzc2lvbnMvTWlzc2lvbicpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL1B1dE1pc3Npb24uaGJzJyk7XHJcbnZhciBtb2RhbCA9IHJlcXVpcmUoJy4uL0dsb2JhbC9tb2RhbC5qcycpO1xyXG5cclxudmFyIHZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcblx0JHBhZ2VOYW1lIDogJCgndGl0bGUnKSxcclxuXHQkdGl0bGUgOiAkKCcjdGl0bGUnKSxcdFxyXG5cdCRjb250ZW50IDogJCgnI2NvbnRlbnQnKSxcclxuXHJcblx0ZWw6ICQoJyNmb3JtUHV0TWlzc2lvbicpLFxyXG5cclxuXHQvL0FwcGVsw6kgYXUgbW9tZW50IGRlIGwnaW5zdGFuY2lhdGlvblx0XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHR9LFxyXG5cclxuXHQvL0ZvbmN0aW9uIGNoYXJnw6llIGR1IHJlbmR1XHJcblx0cmVuZGVyOiBmdW5jdGlvbihpZEpldSl7XHJcblx0XHR0aGlzLnJlbmRlclJlc3VsdGF0KCk7XHJcblx0XHR0aGlzLiRwYWdlTmFtZS5odG1sKFwiQWpvdXQgbWlzc2lvblwiKTtcclxuXHRcdHRoaXMuJHRpdGxlLmh0bWwoXCJBam91dGVyIHVuIG1pc3Npb25cIik7XHJcblx0XHR0aGlzLmlkSmV1PWlkSmV1O1xyXG5cdH0sXHJcblxyXG5cdHJlbmRlck1vZGlmOiBmdW5jdGlvbihpZCxpZEpldSl7XHJcblx0XHQkLndoZW4obmV3IG1pc3Npb25Nb2RlbCh7XCJpZFwiOmlkSmV1fSkuZmV0Y2goKSlcclxuXHRcdC5kb25lKF8uYmluZChmdW5jdGlvbihtaXNzaW9uKXtcclxuXHRcdFx0dGhpcy5yZW5kZXJSZXN1bHRhdChtaXNzaW9uKTtcclxuXHRcdH0sdGhpcykpO1x0XHRcclxuXHRcdHRoaXMuJHBhZ2VOYW1lLmh0bWwoXCJNb2RpZmllciBtaXNzaW9uXCIpO1xyXG5cdFx0dGhpcy4kdGl0bGUuaHRtbChcIk1vZGlmaWVyIHVuIG1pc3Npb25cIik7XHJcblx0XHR0aGlzLmlkTWlzc2lvbj1pZDtcclxuXHRcdHRoaXMuaWRKZXU9aWRKZXU7XHJcblx0fSxcclxuXHR2YWxpZDogZnVuY3Rpb24oZSl7XHJcblx0XHR2YXIgbGlibWlzc2lvbiA9ICQoJyNsaWJtaXNzaW9uJykudmFsKCk7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgbWlzc2lvbk1vZGVsKCk7XHJcblx0XHRpZiAodGhpcy5pZE1pc3Npb249PT11bmRlZmluZWQpe1xyXG5cdFx0XHRtb2RlbC5zYXZlKHtcIm51bWpldVwiOnRoaXMuaWRKZXUsXCJsaWJtaXNzaW9uXCI6bGlibWlzc2lvbn0sIHtcclxuXHRcdFx0XHRzdWNjZXNzOiB0aGlzLnNob3dNb2RhbChcIkFqb3V0XCIpLFxyXG5cdFx0XHRcdGVycm9yOiBfLmJpbmQodGhpcy5zaG93RXJyb3JNb2RhbCx0aGlzKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdG1vZGVsLnNhdmUoe1wiaWRcIjp0aGlzLmlkTWlzc2lvbixcIm51bWpldVwiOnRoaXMuaWRKZXUsIFwibGlibWlzc2lvblwiOmxpYm1pc3Npb259LCB7XHJcblx0XHRcdFx0c3VjY2VzczogdGhpcy5zaG93TW9kYWwoXCJNb2RpZmllclwiKSxcclxuXHRcdFx0XHRlcnJvcjogXy5iaW5kKHRoaXMuc2hvd0Vycm9yTW9kYWwsdGhpcylcclxuXHRcdFx0fSk7XHJcblx0XHR9IFxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdGlmKHJlc3BvbnNlPT09dW5kZWZpbmVkKXtcclxuXHRcdFx0dGhpcy4kY29udGVudC5odG1sKHRlbXBsYXRlKCkpO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHRoaXMuJGNvbnRlbnQuaHRtbCh0ZW1wbGF0ZSh7bWlzc2lvbjpyZXNwb25zZX0pKTtcclxuXHRcdH1cclxuXHRcdCQoJyNmb3JtUHV0TWlzc2lvbicpLnN1Ym1pdChfLmJpbmQoZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0ICAgIHRoaXMudmFsaWQoKTtcclxuXHRcdH0sIHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHRzaG93TW9kYWw6IGZ1bmN0aW9uKG1pc3Npb25UeXBlKXtcclxuXHRcdHZhciBBcnRpY2xlTW9kYWxCb2R5ID0gXCJMYVwiO1xyXG5cdFx0aWYobWlzc2lvblR5cGUgPT09IFwiQWpvdXRcIil7XHJcblx0XHRcdEFydGljbGVNb2RhbEJvZHkgPSBcIkwnXCI7XHJcblx0XHR9XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogbWlzc2lvblR5cGUsXHJcblx0XHQgXHRtb2RhbEJvZHk6IEFydGljbGVNb2RhbEJvZHkrXCIgXCIrbWlzc2lvblR5cGUrXCIgYSDDqXTDqSBlZmZlY3R1w6kgYXZlYyBzdWNjw6hzXCJcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcjSmV1eCcsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHRcdHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuXHR9LFxyXG5cclxuXHRzaG93RXJyb3JNb2RhbDogZnVuY3Rpb24ob2JqZWN0LGVycm9yKXtcclxuXHRcdGlmIChlcnJvci5zdGF0dXM9PTIwMSl7XHJcblx0XHRcdHRoaXMuc2hvd01vZGFsKCk7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiRXJyZXVyIFwiK2Vycm9yLnN0YXR1cyxcclxuXHRcdCBcdG1vZGFsQm9keTogXCJFcnJldXIgbG9ycyBkZSBsJ2Fqb3V0IDogXCIgKyBlcnJvci5zdGF0dXNUZXh0LFxyXG5cdFx0IFx0bW9kYWxFcnJvcjogdHJ1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCJ2YXIgUHV0TWlzc2lvbiA9IHJlcXVpcmUoJy4vUHV0TWlzc2lvbicpO1xyXG52YXIgRGVsZXRlTWlzc2lvbiA9IHJlcXVpcmUoJy4vRGVsZXRlTWlzc2lvbicpO1xyXG52YXIgTWlzc2lvbj0gcmVxdWlyZSgnLi9NaXNzaW9uJylcclxudmFyIFJvdXRlciA9IEJhY2tib25lLlJvdXRlci5leHRlbmQoe1xyXG5cdHJvdXRlczoge1xyXG5cdFx0XCJKZXV4LzppZEpldS9NaXNzaW9ucy9Bam91dFwiOiBcIkFqb3V0TWlzc2lvblwiLFxyXG5cdFx0XCJKZXV4LzppZEpldS9NaXNzaW9ucy9Nb2RpZmllci86aWRcIjogXCJNb2RpZk1pc3Npb25cIixcclxuXHRcdFwiSmV1eC9NaXNzaW9ucy9TdXBwcmltZXIvOmlkXCI6IFwiU3VwcHJNaXNzaW9uXCIsXHJcblx0XHRcIkpldXgvOmlkSmV1L01pc3Npb25zLzppZFwiOiBcIk1pc3Npb25cIixcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cclxuXHR9LFxyXG5cdE1pc3Npb246IGZ1bmN0aW9uKGlkSmV1LGlkKXtcclxuXHRcdHRoaXMuTWlzc2lvbiA9IG5ldyBNaXNzaW9uKCk7XHJcblx0XHR0aGlzLk1pc3Npb24ucmVuZGVyKGlkKTtcclxuXHR9LFxyXG5cdEFqb3V0TWlzc2lvbjogZnVuY3Rpb24oaWRKZXUpe1xyXG5cdFx0dGhpcy5NaXNzaW9uID0gbmV3IFB1dE1pc3Npb24oKTtcclxuXHRcdHRoaXMuTWlzc2lvbi5yZW5kZXIoaWRKZXUpO1xyXG5cdH0sXHJcblxyXG5cdE1vZGlmTWlzc2lvbjogZnVuY3Rpb24oaWQsaWRKZXUpe1xyXG5cdFx0dGhpcy5NaXNzaW9uID0gbmV3IFB1dE1pc3Npb24oKTtcclxuXHRcdHRoaXMuTWlzc2lvbi5yZW5kZXJNb2RpZihpZCxpZEpldSk7XHJcblx0fSxcclxuXHJcblx0U3VwcHJNaXNzaW9uOiBmdW5jdGlvbihpZCl7XHJcblx0XHR0aGlzLk1pc3Npb24gPSBuZXcgRGVsZXRlTWlzc2lvbigpO1xyXG5cdFx0dGhpcy5NaXNzaW9uLnJlbmRlcihpZCk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUm91dGVyOyIsInZhciBvYmplY3RpZk1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvT2JqZWN0aWZzL09iamVjdGlmJyk7XHJcbnZhciBtb2RhbCA9IHJlcXVpcmUoJy4uL0dsb2JhbC9tb2RhbC5qcycpO1xyXG52YXIgRXN0X2Fzc29jaWVNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0VzdF9hc3NvY2llL0VzdF9hc3NvY2llJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHZhciBtb2RlbCA9IG5ldyBvYmplY3RpZk1vZGVsKHtcImlkXCI6aWR9KS5mZXRjaCh7XHJcblx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLmNvbmZpcm0sdGhpcylcclxuXHRcdH0pO1xyXG5cclxuXHR9LFxyXG5cclxuXHRyZW5kZXJFc3RBc3NvOiBmdW5jdGlvbihpZCxpZEFjdGlvbil7XHJcblx0XHRjb25zb2xlLmxvZyhcInRlc3QgXCIraWQrXCIgXCIraWRBY3Rpb24pO1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJDb25maXJtZXIgbGEgc3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsRm9vdGVyOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBkYXRhLWRpc21pc3M9XCJtb2RhbFwiIGlkPVwiYW5udWxEZWxldGVcIj5Bbm51bGVyPC9idXR0b24+PGEgY2xhc3M9XCJidG4gYnRuLWRhbmdlciBidG4tb2tcIiBpZD1cImNvbmZpcm1EZWxldGVcIiBkYXRhLWRpc21pc3M9XCJtb2RhbFwiPlN1cHByaW1lcjwvYT4nXHJcblx0XHR9KTtcclxuXHRcdCQoJyNjb25maXJtRGVsZXRlJykub24oJ2NsaWNrJyxfLmJpbmQoZnVuY3Rpb24oZSl7XHJcblx0XHRcdHZhciBtb2RlbCA9IG5ldyBFc3RfYXNzb2NpZU1vZGVsKHtcIm51bW9iamVjdGlmXCI6aWQsIFwibnVtYWN0aW9uXCI6aWRBY3Rpb24gfSkuZGVzdHJveSh7XHJcblx0XHRcdFx0c3VjY2VzczogXy5iaW5kKHRoaXMudmFsaWQsdGhpcyksXHJcblx0XHRcdFx0ZXJyb3I6IF8uYmluZCh0aGlzLnNob3dFcnJvck1vZGFsLHRoaXMpXHJcblx0XHRcdH0pO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0XHQkKCcjYW5udWxEZWxldGUnKS5vbignY2xpY2snLF8uYmluZChmdW5jdGlvbihlKXtcclxuXHRcdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI09iamVjdGlmcy9Nb2RpZmllci8nK2lkLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0XHR9LHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHRjb25maXJtOmZ1bmN0aW9uKG9iamVjdGlmKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIlN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiQ29uZmlybWVyIGxhIHN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEZvb3RlcjogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIiBpZD1cImFubnVsRGVsZXRlXCI+QW5udWxlcjwvYnV0dG9uPjxhIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgYnRuLW9rXCIgaWQ9XCJjb25maXJtRGVsZXRlXCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIj5TdXBwcmltZXI8L2E+J1xyXG5cdFx0fSk7XHJcblx0XHQkKCcjY29uZmlybURlbGV0ZScpLm9uKCdjbGljaycsXy5iaW5kKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHR2YXIgbW9kZWwgPSBuZXcgb2JqZWN0aWZNb2RlbCh7XCJpZFwiOm9iamVjdGlmLmlkfSkuZGVzdHJveSh7XHJcblx0XHRcdFx0c3VjY2VzczogXy5iaW5kKHRoaXMudmFsaWQsdGhpcyksXHJcblx0XHRcdFx0ZXJyb3I6IF8uYmluZCh0aGlzLnNob3dFcnJvck1vZGFsLHRoaXMpXHJcblx0XHRcdH0pO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0XHQkKCcjYW5udWxEZWxldGUnKS5vbignY2xpY2snLF8uYmluZChmdW5jdGlvbihlKXtcclxuXHRcdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI09iamVjdGlmcycsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdH0sXHJcblxyXG5cdHZhbGlkOmZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJTdXBwcmVzc2lvblwiLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIlN1cHByZXNzaW9uIGVmZmVjdcOpZVwiXHJcblx0XHR9KTtcclxuXHRcdCQoJy5tb2RhbC1iYWNrZHJvcCcpLnJlbW92ZSgpO1xyXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI09iamVjdGlmcycsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHR9LFxyXG5cclxuXHRzaG93RXJyb3JNb2RhbDogZnVuY3Rpb24ob2JqZWN0LGVycm9yKXtcclxuXHRcdGlmIChlcnJvci5zdGF0dXM9PTIwMSl7XHJcblx0XHRcdHRoaXMuc2hvd01vZGFsKCk7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiRXJyZXVyIFwiK2Vycm9yLnN0YXR1cyxcclxuXHRcdCBcdG1vZGFsQm9keTogXCJFcnJldXIgbG9ycyBkZSBsYSBzdXBwcmVzc2lvbiA6IFwiICsgZXJyb3Iuc3RhdHVzVGV4dCxcclxuXHRcdCBcdG1vZGFsRXJyb3I6IHRydWVcclxuXHRcdH0pO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlciwgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIiwgYWxpYXMzPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCIgICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5udW1vYmplY3RpZiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtb2JqZWN0aWYgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm51bW9iamVjdGlmXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bW9iamVjdGlmIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5udW1vYmplY3RpZiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtb2JqZWN0aWZcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiIFwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5saWJvYmplY3RpZiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGlib2JqZWN0aWYgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImxpYm9iamVjdGlmXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvb3B0aW9uPlxcclxcblxcclxcblwiO1xufSxcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiIDxmb3JtIGlkPVxcXCJmb3JtTGllT2JqZWN0aWZcXFwiIG1ldGhvZD1cXFwicG9zdFxcXCI+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXHJcXG4gICAgPGxhYmVsIGZvcj1cXFwib2JqZWN0aWZcXFwiPk9iamVjdGlmIGFzc29jacOpPC9sYWJlbD5cXHJcXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIiBpZD1cXFwib2JqZWN0aWZcXFwiPlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuT2JqZWN0aWZzdG90IDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxyXFxuICAgIDwvc2VsZWN0PlxcclxcbiAgPGJ1dHRvbiBpZD1cXFwic3VibWl0QnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0XFxcIj5MacOpPC9idXR0b24+XFxyXFxuICA8L2Zvcm0+XFxyXFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBvYmplY3RpZk1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvT2JqZWN0aWZzL09iamVjdGlmJyk7XHJcbnZhciBvYmplY3RpZnNNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL09iamVjdGlmcy9PYmplY3RpZnNMaXN0Jyk7XHJcbnZhciBvYmplY3RpZkxpc3Q9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0ZpeGUvRml4ZScpO1xyXG52YXIgRml4ZU1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvRml4ZS9GaXhlMicpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL0xpZU9iamVjdGlmLmhicycpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdCRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0JHRpdGxlIDogJCgnI3RpdGxlJyksXHRcclxuXHQkY29udGVudCA6ICQoJyNjb250ZW50JyksXHJcblxyXG5cdGVsOiAkKCcjZm9ybUxpZU9iamVjdGlmJyksXHJcblxyXG5cdC8vQXBwZWzDqSBhdSBtb21lbnQgZGUgbCdpbnN0YW5jaWF0aW9uXHRcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdC8vRm9uY3Rpb24gY2hhcmfDqWUgZHUgcmVuZHVcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKGlkSmV1LGlkTWlzc2lvbil7XHJcblx0XHR2YXIgb2JqZWN0aWZzUGFyc2VyPW5ldyBvYmplY3RpZkxpc3QoKTtcclxuXHRcdG9iamVjdGlmc1BhcnNlci51cmxSb290PW9iamVjdGlmc1BhcnNlci51cmxSb290KycnK2lkTWlzc2lvbitcIi9PYmplY3RpZlwiO1xyXG5cdFx0JC53aGVuKG5ldyBvYmplY3RpZk1vZGVsKCkuZmV0Y2goKSxuZXcgb2JqZWN0aWZzTW9kZWwoKS5mZXRjaCgpLG9iamVjdGlmc1BhcnNlci5mZXRjaCgpKVxyXG5cdFx0LmRvbmUoXy5iaW5kKGZ1bmN0aW9uKGZpeGUsb2JqZWN0aWZzLG9iamVjdGlmc1BhcnNlcil7XHJcblx0XHRcdHRoaXMucmVuZGVyUmVzdWx0YXQoZml4ZSxvYmplY3RpZnMsb2JqZWN0aWZzUGFyc2VyKTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdFx0dGhpcy4kcGFnZU5hbWUuaHRtbChcIkxpZSBPYmplY3RpZlwiKTtcclxuXHRcdHRoaXMuJHRpdGxlLmh0bWwoXCJMaWVyIHVuIE9iamVjdGlmXCIpO1xyXG5cdFx0dGhpcy5pZE1pc3Npb249aWRNaXNzaW9uO1xyXG5cdFx0dGhpcy5pZEpldT1pZEpldTtcclxuXHR9LFxyXG5cclxuXHR2YWxpZDogZnVuY3Rpb24oZSl7XHJcblx0XHR2YXIgbnVtb2JqZWN0aWYgPSAkKCcjb2JqZWN0aWYnKS52YWwoKTtcclxuXHRcdHZhciBtb2RlbCA9IG5ldyBGaXhlTW9kZWwoKTtcclxuXHRcdG1vZGVsLnNhdmUoe1wibnVtbWlzc2lvblwiOnRoaXMuaWRNaXNzaW9uLCBcIm51bW9iamVjdGlmXCI6bnVtb2JqZWN0aWZ9LCB7XHJcblx0XHRcdHN1Y2Nlc3M6IHRoaXMuc2hvd01vZGFsLFxyXG5cdFx0XHRlcnJvcjogXy5iaW5kKHRoaXMuc2hvd0Vycm9yTW9kYWwsdGhpcylcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKGZpeGUsb2JqZWN0aWZzLG9iamVjdGlmc1BhcnNlcil7XHJcblx0XHRpZihvYmplY3RpZnNQYXJzZXI9PT1udWxsKXtcclxuXHRcdFx0dGhpcy4kY29udGVudC5odG1sKHRlbXBsYXRlKHtvYmplY3RpZnM6b2JqZWN0aWZzfSkpO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHZhciBPYmplY3RpZiA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblx0XHRcdFx0bnVtb2JqZWN0aWY6MCxcclxuXHRcdFx0XHRsaWJvYmplY3RpZjpcIlwiXHJcblx0ICBcdFx0fSk7XHJcblx0XHRcdHZhciBDb2xsZWN0aW9uT2JqZWN0aWYgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XHJcblx0XHRcdCAgbW9kZWw6IE9iamVjdGlmXHJcblx0XHRcdH0pO1xyXG5cdFx0XHR2YXIgbGlzdE9iamVjdGlmID0gbmV3IENvbGxlY3Rpb25PYmplY3RpZigpO1xyXG5cdFx0XHQvLyBFbmxldmUgbCdpZCBsZXMgaWRzIGRlamEgc2VsZWN0aW9ubmVzIGRlIGxhIGxpc3RlXHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPG9iamVjdGlmc1swXS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdG9iamVjdGlmPW5ldyBPYmplY3RpZigpO1xyXG5cdFx0XHRcdG9iamVjdGlmLm51bW9iamVjdGlmPW9iamVjdGlmc1swXVtpXS5udW1vYmplY3RpZjtcclxuXHRcdFx0XHRvYmplY3RpZi5saWJvYmplY3RpZj1vYmplY3RpZnNbMF1baV0ubGlib2JqZWN0aWY7XHJcblx0XHRcdFx0bGlzdE9iamVjdGlmLmFkZChbb2JqZWN0aWZdKTtcclxuXHRcdFx0XHRmb3IodmFyIGogPSAwOyBqIDxvYmplY3RpZnNQYXJzZXJbMF0ubGVuZ3RoOyBqKyspIHtcclxuXHRcdCAgICAgIFx0XHRpZih0aGlzLmlkTWlzc2lvbiA9PSBvYmplY3RpZnNQYXJzZXJbMF1bal1bMF0ubnVtbWlzc2lvbikge1xyXG5cdFx0ICAgICAgXHRcdFx0aWYob2JqZWN0aWZzWzBdW2ldLm51bW9iamVjdGlmID09IG9iamVjdGlmc1BhcnNlclswXVtqXVswXS5udW1vYmplY3RpZilcclxuXHRcdCAgICAgIFx0XHRcdHtcclxuXHRcdCAgICAgIFx0XHRcdFx0bGlzdE9iamVjdGlmLnJlbW92ZShbb2JqZWN0aWZdKTtcclxuXHRcdCAgICAgIFx0XHRcdH1cclxuXHRcdFx0XHQgICAgfVxyXG5cdFx0XHRcdH1cclxuXHRcdCAgXHR9XHJcblx0XHRcdC8vIFBhc3NlIGxlcyBlbG1lbnRzIGF1IGhic1xyXG5cdFx0XHRcdHRoaXMuJGNvbnRlbnQuaHRtbCh0ZW1wbGF0ZSh7T2JqZWN0aWZzdG90Omxpc3RPYmplY3RpZi5tb2RlbHN9KSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHQkKCcjZm9ybUxpZU9iamVjdGlmJykuc3VibWl0KF8uYmluZChmdW5jdGlvbihldmVudCl7XHJcblx0XHQgICAgdGhpcy52YWxpZCgpO1xyXG5cdFx0fSwgdGhpcykpO1xyXG5cdH0sXHJcblxyXG5cdHNob3dNb2RhbDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIkFqb3V0XCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiTCdham91dCBhIMOpdMOpIGVmZmVjdHXDqSBhdmVjIHN1Y2PDqHNcIlxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoJyNKZXV4LycrdGhpcy5pZEpldSsnL01pc3Npb25zLycrdGhpcy5pZE1pc3Npb24sIHt0cmlnZ2VyOnRydWV9KTtcclxuXHR9LFxyXG5cclxuXHRzaG93RXJyb3JNb2RhbDogZnVuY3Rpb24ob2JqZWN0LGVycm9yKXtcclxuXHRcdGlmIChlcnJvci5zdGF0dXM9PTIwMSl7XHJcblx0XHRcdHRoaXMuc2hvd01vZGFsKCk7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiRXJyZXVyIFwiK2Vycm9yLnN0YXR1cyxcclxuXHRcdCBcdG1vZGFsQm9keTogXCJFcnJldXIgbG9ycyBkZSBsJ2Fqb3V0IDogXCIgKyBlcnJvci5zdGF0dXNUZXh0LFxyXG5cdFx0IFx0bW9kYWxFcnJvcjogdHJ1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsgIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCJcdFx0XHRcdFx0XHQ8dGFibGUgY2xhc3M9XFxcInRhYmxlXFxcIiBpZD1cXFwidGFiQWN0aW9uXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHRcdDx0aGVhZD5cXHJcXG5cdFx0XHRcdFx0XHRcdFx0PHRyPlxcclxcblx0XHRcdFx0XHRcdFx0XHRcdDx0aD5JZGVudGlmaWFudDwvdGg+XFxyXFxuXHRcdFx0XHRcdFx0XHRcdFx0PHRoPkxpYmVsbMOpPC90aD5cXHJcXG5cdFx0XHRcdFx0XHRcdFx0XHQ8dGg+PC90aD5cXHJcXG5cdFx0XHRcdFx0XHRcdFx0PC90cj5cXHJcXG5cdFx0XHRcdFx0XHRcdDwvdGhlYWQ+XFxyXFxuXHRcdFx0XHRcdFx0XHQ8dGJvZHk+XFxyXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hY3Rpb25zIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgyLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXHRcdFx0XHRcdFx0XHQ8L3Rib2R5Plxcclxcblx0XHRcdFx0XHRcdDwvdGFibGU+XFxyXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXHRcdFx0XHRcdFx0XHRcdDx0ciBvbkNsaWNrPVxcXCJkb2N1bWVudC5sb2NhdGlvbj0nI0FjdGlvbnMvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiJ1xcXCI+XFxyXFxuXHRcdFx0XHRcdFx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYmFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHRcdFx0XHRcdDwvdHI+XFxyXFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcblx0PHRoZWFkPlxcclxcblx0XHQ8dHI+XFxyXFxuXHRcdFx0PHRoPklkZW50aWZpYW50PC90aD5cXHJcXG5cdFx0XHQ8dGg+TGliZWxsw6k8L3RoPlxcclxcblx0XHRcdDx0aD5BY3Rpb25zPC90aD5cXHJcXG5cdFx0XHQ8dGg+PC90aD5cXHJcXG5cdFx0PC90cj5cXHJcXG5cdDwvdGhlYWQ+XFxyXFxuXHQ8dGJvZHk+XFxyXFxuXHRcdFx0PHRyPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9iamVjdGlmIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1vYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub2JqZWN0aWYgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYm9iamVjdGlmIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hY3Rpb25zIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlx0XHRcdFx0PHRkPlxcclxcblx0XHRcdFx0PHRkPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjT2JqZWN0aWZzL01vZGlmaWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9iamVjdGlmIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1vYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPlxcclxcblx0XHRcdFx0XHQ8L2E+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNPYmplY3RpZnMvU3VwcHJpbWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9iamVjdGlmIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1vYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdDwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cdDwvdGJvZHk+XFxyXFxuPC90YWJsZT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIG9iamVjdGlmTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9PYmplY3RpZnMvT2JqZWN0aWYnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9PYmplY3RpZi5oYnMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHBhZ2VOYW1lIDogJCgndGl0bGUnKSxcclxuXHR0aXRsZSA6ICQoJyN0aXRsZScpLFxyXG5cdGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHQvL0FwcGVsw6kgYXUgbW9tZW50IGRlIGwnaW5zdGFuY2lhdGlvblx0XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHR9LFxyXG5cclxuXHQvL0ZvbmN0aW9uIGNoYXJnw6llIGR1IHJlbmR1XHJcblx0cmVuZGVyOiBmdW5jdGlvbihpZCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgb2JqZWN0aWZNb2RlbCgpO1xyXG5cdFx0bW9kZWwudXJsID0gbW9kZWwudXJsUm9vdCsnJytpZCtcIi9BY3Rpb25cIjtcclxuXHJcblx0XHQkLndoZW4obmV3IG9iamVjdGlmTW9kZWwoe1wiaWRcIjppZH0pLmZldGNoKCksbW9kZWwuZmV0Y2goKSlcclxuXHRcdC5kb25lKF8uYmluZChmdW5jdGlvbihvYmplY3RpZixhY3Rpb25zKXtcclxuXHRcdFx0dGhpcy5yZW5kZXJSZXN1bHRhdChvYmplY3RpZixhY3Rpb25zKTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmlkT2JqZWN0aWYgPSBpZDtcclxuXHRcdCQodGhpcy5wYWdlTmFtZSkuaHRtbChcIkTDqXRhaWwgT2JqZWN0aWZcIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJJbmZvcm1hdGlvbnMgT2JqZWN0aWZcIik7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlc3BvbnNlLCByZXNwb25zZUFjdGlvbnMpe1xyXG5cdFx0dmFyIEFjdGlvbiA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblx0ICBcdH0pO1xyXG5cclxuXHRcdHZhciBDb2xsZWN0aW9uQWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xyXG5cdFx0ICBtb2RlbDogQWN0aW9uXHJcblx0XHR9KTtcclxuXHRcdHZhciBjb3VudCA9IDA7XHJcblx0XHR2YXIgbGlzdEFjdGlvbiA9IG5ldyBDb2xsZWN0aW9uQWN0aW9uKCk7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8ICByZXNwb25zZUFjdGlvbnNbMF0ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0dmFyIGFjdGlvbiA9IG5ldyBBY3Rpb24ocmVzcG9uc2VBY3Rpb25zWzBdW2ldWzFdKTtcclxuXHRcdFx0bGlzdEFjdGlvbi5hZGQoW2FjdGlvbl0pO1xyXG5cdFx0XHRjb3VudCsrO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGNvdW50ICE9PTAgKXtcclxuXHRcdFx0JCh0aGlzLmNvbnRlbnQpLmh0bWwodGVtcGxhdGUoe29iamVjdGlmOiByZXNwb25zZVswXSwgYWN0aW9uczpsaXN0QWN0aW9uLm1vZGVsc30pKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZSh7b2JqZWN0aWY6IHJlc3BvbnNlWzBdfSkpO1xyXG5cdFx0fVxyXG5cdFxyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0XHRcdDx0ciBvbkNsaWNrPVxcXCJkb2N1bWVudC5sb2NhdGlvbj0nI09iamVjdGlmcy9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1vYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIidcXFwiPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bW9iamVjdGlmIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJvYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNPYmplY3RpZnMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtb2JqZWN0aWYgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcclxcblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjT2JqZWN0aWZzL1N1cHByaW1lci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1vYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdDwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIjxhIGhyZWY9XFxcIiNPYmplY3RpZnMvQWpvdXRcXFwiPlxcclxcblx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLXN1Y2Nlc3NcXFwiPlxcclxcblx0ICA8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPiBBam91dGVyIE9iamVjdGlmXFxyXFxuXHQ8L2J1dHRvbj5cXHJcXG48L2E+XFxyXFxuPHRhYmxlIGNsYXNzPVxcXCJ0YWJsZVxcXCI+XFxyXFxuXHQ8dGhlYWQ+XFxyXFxuXHRcdDx0cj5cXHJcXG5cdFx0XHQ8dGg+SWRlbnRpZmlhbnQ8L3RoPlxcclxcblx0XHRcdDx0aD5MaWJlbGzDqTwvdGg+XFxyXFxuXHRcdFx0PHRoPjwvdGg+XFxyXFxuXHRcdDwvdHI+XFxyXFxuXHQ8L3RoZWFkPlxcclxcblx0PHRib2R5PlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub2JqZWN0aWZzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXHQ8L3Rib2R5PlxcclxcbjwvdGFibGU+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBvYmplY3RpZk1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvT2JqZWN0aWZzL09iamVjdGlmc0xpc3QnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9PYmplY3RpZnMuaGJzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0dGl0bGUgOiAkKCcjdGl0bGUnKSxcclxuXHRjb250ZW50IDogJCgnI2NvbnRlbnQnKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtb2RlbCA9IG5ldyBvYmplY3RpZk1vZGVsKCkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5yZW5kZXJSZXN1bHRhdCwgdGhpcylcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLnBhZ2VOYW1lKS5odG1sKFwiTGlzdGUgZGVzIE9iamVjdGlmc1wiKTtcclxuXHRcdCQodGhpcy50aXRsZSkuaHRtbChcIkxpc3RlIGRlcyBPYmplY3RpZnNcIik7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdCQodGhpcy5jb250ZW50KS5odG1sKHRlbXBsYXRlKHtvYmplY3RpZnM6IHJlc3BvbnNlLnRvQXJyYXkoKX0pKTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiICAgIDx0cj5cXHJcXG4gICAgICA8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD48dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGliYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG4gICAgICA8dGQ+PGEgaHJlZj1cXFwiI0FjdGlvbnMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXHJcXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWxcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuICAgICAgICAgIDwvYT5cXHJcXG4gICAgICA8L3RkPlxcclxcbiAgICAgIDx0ZD48YSBocmVmPVxcXCIjT2JqZWN0aWZzL01vZGlmaWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLm9iamVjdGlmIDogZGVwdGhzWzFdKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1vYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIi9BY3Rpb24vU3VwcHJpbWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuICAgICAgICAgIDwvYT5cXHJcXG4gICAgICA8L3RkPlxcclxcbiAgICA8L3RyPlxcclxcblwiO1xufSxcIjNcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlciwgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIiwgYWxpYXMzPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCIgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bWFjdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtYWN0aW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJudW1hY3Rpb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5udW1hY3Rpb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm51bWFjdGlvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtYWN0aW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiBcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGliYWN0aW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5saWJhY3Rpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImxpYmFjdGlvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L29wdGlvbj5cXHJcXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCIgPGZvcm0gaWQ9XFxcImZvcm1QdXRPYmplY3RpZlxcXCIgbWV0aG9kPVxcXCJwb3N0XFxcIj5cXHJcXG4gIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcclxcbiAgICA8bGFiZWwgZm9yPVxcXCJsaWJvYmplY3RpZlxcXCI+bGlib2JqZWN0aWY8L2xhYmVsPlxcclxcbiAgICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgaWQ9XFxcImxpYm9iamVjdGlmXFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50cmV6IHVuIGxpYmVsbMOpXFxcIiB2YWx1ZT1cXFwiXCJcbiAgICArIHRoaXMuZXNjYXBlRXhwcmVzc2lvbih0aGlzLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5vYmplY3RpZiA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGlib2JqZWN0aWYgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIHJlcXVpcmVkPlxcclxcbiAgPC9kaXY+XFxyXFxuICA8YnV0dG9uIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHRcXFwiPlZhbGlkZXI8L2J1dHRvbj5cXHJcXG48L2Zvcm0+XFxyXFxuXFxyXFxuPGhyPlxcclxcblxcclxcbjxsYWJlbCBmb3I9XFxcIm51bWFjdGlvblxcXCI+TGlzdGUgZGVzIGFjdGlvbnMgZGUgbCdvYmplY3RpZjwvbGFiZWw+XFxyXFxuPHRhYmxlIGNsYXNzPVxcXCJ0YWJsZVxcXCIgaWQ9XFxcInRhYkFjdGlvblxcXCI+XFxyXFxuICA8dGhlYWQ+XFxyXFxuICAgIDx0cj5cXHJcXG4gICAgICA8dGg+SWRlbnRpZmlhbnQ8L3RoPlxcclxcbiAgICAgIDx0aD5MaWJlbGzDqTwvdGg+XFxyXFxuICAgIDwvdHI+XFxyXFxuICA8L3RoZWFkPlxcclxcbiAgPHRib2R5PlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYWN0aW9ucyA6IGRlcHRoMCkse1wibmFtZVwiOlwiZWFjaFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAgPC90Ym9keT5cXHJcXG48L3RhYmxlPlxcclxcbiA8Zm9ybSBpZD1cXFwiZm9ybVB1dEFjdGlvblxcXCIgbWV0aG9kPVxcXCJwb3N0XFxcIj5cXHJcXG4gIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcclxcbiAgIDxsYWJlbCBmb3I9XFxcIm51bWFjdGlvblxcXCI+QWpvdXRlciB1bmUgQWN0aW9uPC9sYWJlbD5cXHJcXG4gICAgPHNlbGVjdCAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgaWQ9XFxcIm51bWFjdGlvblxcXCI+XFxyXFxuICAgICAgPG9wdGlvbiB2YWx1ZT1udWxsPiBBdWN1biA8L29wdGlvbj5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFjdGlvbnNUb3QgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDMsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgICAgPC9zZWxlY3Q+XFxyXFxuICA8L2Rpdj5cXHJcXG4gIDxidXR0b24gY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdFxcXCI+QWpvdXRlcjwvYnV0dG9uPlxcclxcbjwvZm9ybT5cXHJcXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbiIsInZhciBvYmplY3RpZk1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvT2JqZWN0aWZzL09iamVjdGlmJyk7XHJcbnZhciBvYmplY3RpZnNNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL09iamVjdGlmcy9PYmplY3RpZnNMaXN0Jyk7XHJcbnZhciBhY3Rpb25Nb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0FjdGlvbnMvQWN0aW9uc0xpc3QnKTtcclxudmFyIEVzdF9hc3NvY2llTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9Fc3RfYXNzb2NpZS9Fc3RfYXNzb2NpZScpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL1B1dE9iamVjdGlmLmhicycpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdCRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0JHRpdGxlIDogJCgnI3RpdGxlJyksXHRcclxuXHQkY29udGVudCA6ICQoJyNjb250ZW50JyksXHJcblxyXG5cdGVsOiAkKCcjZm9ybVB1dE9iamVjdGlmJyksXHJcblxyXG5cdC8vQXBwZWzDqSBhdSBtb21lbnQgZGUgbCdpbnN0YW5jaWF0aW9uXHRcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdC8vRm9uY3Rpb24gY2hhcmfDqWUgZHUgcmVuZHVcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XHJcblx0XHQkLndoZW4obmV3IGFjdGlvbk1vZGVsKCkuZmV0Y2goKSxudWxsLG51bGwpXHJcblx0XHQuZG9uZShfLmJpbmQoZnVuY3Rpb24oYWN0aW9ucyxvYmplY3RpZixhY2lvbk9iamVjdGlmKXtcclxuXHRcdFx0dGhpcy5yZW5kZXJSZXN1bHRhdChhY3Rpb25zLG51bGwsbnVsbCk7XHJcblx0XHR9LHRoaXMpKTtcclxuXHRcdHRoaXMuJHBhZ2VOYW1lLmh0bWwoXCJBam91dCBPYmplY3RpZlwiKTtcclxuXHRcdHRoaXMuJHRpdGxlLmh0bWwoXCJBam91dGVyIHVuIE9iamVjdGlmXCIpO1xyXG5cdH0sXHJcblxyXG5cdHJlbmRlck1vZGlmOiBmdW5jdGlvbihpZCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgb2JqZWN0aWZNb2RlbCgpO1xyXG5cdFx0bW9kZWwudXJsID0gbW9kZWwudXJsUm9vdCsnJytpZCtcIi9BY3Rpb25cIjtcclxuXHJcblx0XHQkLndoZW4obmV3IGFjdGlvbk1vZGVsKCkuZmV0Y2goKSxuZXcgb2JqZWN0aWZNb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goKSxtb2RlbC5mZXRjaCgpKVxyXG5cdFx0LmRvbmUoXy5iaW5kKGZ1bmN0aW9uKGFjdGlvbnMsb2JqZWN0aWYsYWNpb25PYmplY3RpZil7XHJcblx0XHRcdHRoaXMucmVuZGVyUmVzdWx0YXQoYWN0aW9ucyxvYmplY3RpZixhY2lvbk9iamVjdGlmKTtcclxuXHRcdH0sdGhpcykpO1x0XHRcclxuXHRcdHRoaXMuJHBhZ2VOYW1lLmh0bWwoXCJNb2RpZmllciBPYmplY3RpZlwiKTtcclxuXHRcdHRoaXMuJHRpdGxlLmh0bWwoXCJNb2RpZmllciB1biBPYmplY3RpZlwiKTtcclxuXHRcdHRoaXMuaWRPYmplY3RpZj1pZDtcclxuXHR9LFxyXG5cclxuXHR2YWxpZDogZnVuY3Rpb24oZSl7XHJcblx0XHR2YXIgbGlib2JqZWN0aWYgPSAkKCcjbGlib2JqZWN0aWYnKS52YWwoKTtcclxuXHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgb2JqZWN0aWZNb2RlbCgpO1xyXG5cdFx0aWYgKHRoaXMuaWRPYmplY3RpZj09PXVuZGVmaW5lZCl7XHJcblx0XHRcdG1vZGVsLnNhdmUoe1wibGlib2JqZWN0aWZcIjpsaWJvYmplY3RpZn0sIHtcclxuXHRcdFx0XHRzdWNjZXNzOiB0aGlzLnNob3dNb2RhbCxcclxuXHRcdFx0XHRlcnJvcjogXy5iaW5kKHRoaXMuc2hvd0Vycm9yTW9kYWwsdGhpcylcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHRtb2RlbC5zYXZlKHtcIm51bW9iamVjdGlmXCI6dGhpcy5pZE9iamVjdGlmLCBcImxpYm9iamVjdGlmXCI6bGlib2JqZWN0aWZ9LCB7XHJcblx0XHRcdFx0c3VjY2VzczogdGhpcy5zaG93TW9kYWwsXHJcblx0XHRcdFx0ZXJyb3I6IF8uYmluZCh0aGlzLnNob3dFcnJvck1vZGFsLHRoaXMpXHJcblx0XHRcdH0pO1xyXG5cdFx0fSBcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0sXHJcblxyXG5cdHZhbGlkQWN0aW9uOiBmdW5jdGlvbihlKXtcclxuXHRcdHZhciBudW1hY3Rpb24gPSAkKCcjbnVtYWN0aW9uJykudmFsKCk7XHJcblxyXG5cdFx0dmFyIG1vZGVsID0gIG5ldyBFc3RfYXNzb2NpZU1vZGVsKCk7XHJcblx0XHRtb2RlbC5zYXZlKHtcIm51bW9iamVjdGlmXCI6dGhpcy5pZE9iamVjdGlmLCBcIm51bWFjdGlvblwiOm51bWFjdGlvbn0sIHtcclxuXHRcdFx0c3VjY2VzczogdGhpcy5zaG93TW9kYWwsXHJcblx0XHRcdGVycm9yOiBfLmJpbmQodGhpcy5zaG93RXJyb3JNb2RhbCx0aGlzKVxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9LFxyXG5cclxuXHRyZW5kZXJSZXN1bHRhdDogZnVuY3Rpb24ocmVzcG9uc2VBY3Rpb25MaXN0VG90LHJlc3BvbnNlLHJlc3BvbnNlQWN0aW9uTGlzdCl7XHJcblx0XHRpZih0aGlzLmlkT2JqZWN0aWY9PT11bmRlZmluZWQpe1xyXG5cdFx0XHR0aGlzLiRjb250ZW50Lmh0bWwodGVtcGxhdGUoKSk7XHJcblx0XHR9ZWxzZXtcclxuXHJcblx0XHRcdC8vIEVubGV2ZSBsJ2lkIGxlcyBpZHMgZGVqYSBzZWxlY3Rpb25uZXMgZGUgbGEgbGlzdGVcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8cmVzcG9uc2VBY3Rpb25MaXN0VG90WzBdLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8cmVzcG9uc2VBY3Rpb25MaXN0WzBdLmxlbmd0aDsgaisrKSB7XHJcblx0XHQgICAgICBcdFx0aWYocmVzcG9uc2VBY3Rpb25MaXN0VG90WzBdW2ldLm51bWFjdGlvbiA9PT0gcmVzcG9uc2VBY3Rpb25MaXN0WzBdLm51bWFjdGlvbikge1xyXG5cdFx0XHRcdCAgICAgICAgIHJlc3BvbnNlQWN0aW9uTGlzdFRvdFswXS5zcGxpY2UoaSwgMSk7XHJcblx0XHRcdFx0ICAgIH1cclxuXHRcdFx0XHR9XHJcblx0XHQgIFx0fVxyXG5cclxuXHRcdCAgXHQvLyBSZWN1cGVyZXIgdW5lIGxpc3RlIGQnYWN0aW9uIGRlIGwnb2JqZWN0aWYgcGx1cyBsaXNpYmxlXHJcblx0XHQgIFx0dmFyIEFjdGlvbiA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblx0ICBcdFx0fSk7XHJcblx0XHRcdHZhciBDb2xsZWN0aW9uQWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xyXG5cdFx0XHQgIG1vZGVsOiBBY3Rpb25cclxuXHRcdFx0fSk7XHJcblx0XHRcdHZhciBjb3VudCA9IDA7XHJcblx0XHRcdHZhciBsaXN0QWN0aW9uID0gbmV3IENvbGxlY3Rpb25BY3Rpb24oKTtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAgcmVzcG9uc2VBY3Rpb25MaXN0WzBdLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dmFyIGFjdGlvbiA9IG5ldyBBY3Rpb24ocmVzcG9uc2VBY3Rpb25MaXN0WzBdW2ldWzFdKTtcclxuXHRcdFx0XHRsaXN0QWN0aW9uLmFkZChbYWN0aW9uXSk7XHJcblx0XHRcdFx0Y291bnQrKztcclxuXHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0Ly8gUGFzc2UgbGVzIGVsbWVudHMgYXUgaGJzXHJcblx0XHRcdGlmKGNvdW50ICE9PTAgKXtcclxuXHRcdFx0XHR0aGlzLiRjb250ZW50Lmh0bWwodGVtcGxhdGUoe29iamVjdGlmOiByZXNwb25zZVswXSxhY3Rpb25zVG90OnJlc3BvbnNlQWN0aW9uTGlzdFRvdFswXSxhY3Rpb25zOmxpc3RBY3Rpb24ubW9kZWxzfSkpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLiRjb250ZW50Lmh0bWwodGVtcGxhdGUoe29iamVjdGlmOiByZXNwb25zZVswXSxhY3Rpb25zVG90OnJlc3BvbnNlQWN0aW9uTGlzdFRvdFswXX0pKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdCQoJyNmb3JtUHV0T2JqZWN0aWYnKS5zdWJtaXQoXy5iaW5kKGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdCAgICB0aGlzLnZhbGlkKCk7XHJcblx0XHR9LCB0aGlzKSk7XHJcblxyXG5cdFx0JCgnI2Zvcm1QdXRBY3Rpb24nKS5zdWJtaXQoXy5iaW5kKGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdCAgICB0aGlzLnZhbGlkQWN0aW9uKCk7XHJcblx0XHR9LCB0aGlzKSk7XHJcblx0fSxcclxuXHJcblx0c2hvd01vZGFsOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiQWpvdXRcIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJMJ2Fqb3V0IGEgw6l0w6kgZWZmZWN0dcOpIGF2ZWMgc3VjY8Ooc1wiXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI09iamVjdGlmcycsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHR9LFxyXG5cclxuXHRzaG93RXJyb3JNb2RhbDogZnVuY3Rpb24ob2JqZWN0LGVycm9yKXtcclxuXHRcdGlmIChlcnJvci5zdGF0dXM9PTIwMSl7XHJcblx0XHRcdHRoaXMuc2hvd01vZGFsKCk7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiRXJyZXVyIFwiK2Vycm9yLnN0YXR1cyxcclxuXHRcdCBcdG1vZGFsQm9keTogXCJFcnJldXIgbG9ycyBkZSBsJ2Fqb3V0IDogXCIgKyBlcnJvci5zdGF0dXNUZXh0LFxyXG5cdFx0IFx0bW9kYWxFcnJvcjogdHJ1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsgIiwidmFyIE9iamVjdGlmcyA9IHJlcXVpcmUoJy4vT2JqZWN0aWZzJyk7XHJcbnZhciBPYmplY3RpZiA9IHJlcXVpcmUoJy4vT2JqZWN0aWYnKTtcclxudmFyIExpZU9iamVjdGlmPXJlcXVpcmUoJy4vTGllT2JqZWN0aWYnKVxyXG52YXIgUHV0T2JqZWN0aWYgPSByZXF1aXJlKCcuL1B1dE9iamVjdGlmJyk7XHJcbnZhciBEZWxldGVPYmplY3RpZiA9IHJlcXVpcmUoJy4vRGVsZXRlT2JqZWN0aWYnKTtcclxuXHJcbnZhciBSb3V0ZXIgPSBCYWNrYm9uZS5Sb3V0ZXIuZXh0ZW5kKHtcclxuXHRyb3V0ZXM6IHtcclxuXHRcdFwiT2JqZWN0aWZzXCI6IFwiT2JqZWN0aWZzXCIsXHJcblx0XHRcIk9iamVjdGlmcy9Bam91dFwiOiBcIkFqb3V0T2JqZWN0aWZcIixcclxuXHRcdFwiT2JqZWN0aWZzL01vZGlmaWVyLzppZFwiOiBcIk1vZGlmT2JqZWN0aWZcIixcclxuXHRcdFwiT2JqZWN0aWZzL1N1cHByaW1lci86aWRcIjogXCJTdXBwck9iamVjdGlmXCIsXHJcblx0XHRcIk9iamVjdGlmcy86aWRcIjogXCJPYmplY3RpZlwiLFxyXG5cdFx0XCJPYmplY3RpZnMvTW9kaWZpZXIvOmlkL0FjdGlvbi9TdXBwcmltZXIvOmlkQWN0aW9uXCI6IFwiU3VwcHJPYmplY3RpZkFjdGlvblwiLFxyXG5cdFx0XCJKZXV4LzppZEpldS9NaXNzaW9ucy9Nb2RpZmllci86aWRNaXNzaW9uL09iamVjdGlmcy9Bam91dFwiOiBcIkxpZU9iamVjdGlmTWlzc2lvblwiLFxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblxyXG5cdH0sXHJcblxyXG5cdE9iamVjdGlmczogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuT2JqZWN0aWZzID0gbmV3IE9iamVjdGlmcygpO1xyXG5cdFx0dGhpcy5PYmplY3RpZnMucmVuZGVyKCk7XHJcblx0fSxcclxuXHJcblx0T2JqZWN0aWY6IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHRoaXMub2JqZWN0aWZzID0gbmV3IE9iamVjdGlmKCk7XHJcblx0XHR0aGlzLm9iamVjdGlmcy5yZW5kZXIoaWQpO1xyXG5cdH0sXHJcblxyXG5cdEFqb3V0T2JqZWN0aWY6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLm9iamVjdGlmID0gbmV3IFB1dE9iamVjdGlmKCk7XHJcblx0XHR0aGlzLm9iamVjdGlmLnJlbmRlcigpO1xyXG5cdH0sXHJcblx0TGllT2JqZWN0aWZNaXNzaW9uOiBmdW5jdGlvbihpZEpldSxpZE1pc3Npb24pe1xyXG5cdFx0dGhpcy5saWVPYmplY3RpZiA9IG5ldyBMaWVPYmplY3RpZigpO1xyXG5cdFx0dGhpcy5saWVPYmplY3RpZi5yZW5kZXIoaWRKZXUsaWRNaXNzaW9uKTtcclxuXHR9LFxyXG5cclxuXHRNb2RpZk9iamVjdGlmOiBmdW5jdGlvbihpZCl7XHJcblx0XHR0aGlzLm9iamVjdGlmID0gbmV3IFB1dE9iamVjdGlmKCk7XHJcblx0XHR0aGlzLm9iamVjdGlmLnJlbmRlck1vZGlmKGlkKTtcclxuXHR9LFxyXG5cclxuXHRTdXBwck9iamVjdGlmOiBmdW5jdGlvbihpZCl7XHJcblx0XHR0aGlzLm9iamVjdGlmID0gbmV3IERlbGV0ZU9iamVjdGlmKCk7XHJcblx0XHR0aGlzLm9iamVjdGlmLnJlbmRlcihpZCk7XHJcblx0fSxcclxuXHJcblx0U3VwcHJPYmplY3RpZkFjdGlvbjogZnVuY3Rpb24oaWQsIGlkQWN0aW9uKXtcclxuXHRcdHRoaXMub2JqZWN0aWYgPSBuZXcgRGVsZXRlT2JqZWN0aWYoKTtcclxuXHRcdHRoaXMub2JqZWN0aWYucmVuZGVyRXN0QXNzbyhpZCxpZEFjdGlvbik7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUm91dGVyOyIsInZhciByZWdsZU1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvUmVnbGVzL1JlZ2xlJyk7XHJcbnZhciBtb2RhbCA9IHJlcXVpcmUoJy4uL0dsb2JhbC9tb2RhbC5qcycpO1xyXG5cclxudmFyIHZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcblx0cmVuZGVyOiBmdW5jdGlvbihpZCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgcmVnbGVNb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5jb25maXJtLHRoaXMpXHJcblx0XHR9KTtcclxuXHJcblx0fSxcclxuXHJcblx0Y29uZmlybTpmdW5jdGlvbihyZWdsZSl7XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJTdXBwcmVzc2lvblwiLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIkNvbmZpcm1lciBsYSBzdXBwcmVzc2lvblwiLFxyXG5cdFx0IFx0bW9kYWxGb290ZXI6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIGRhdGEtZGlzbWlzcz1cIm1vZGFsXCIgaWQ9XCJhbm51bERlbGV0ZVwiPkFubnVsZXI8L2J1dHRvbj48YSBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIGJ0bi1va1wiIGlkPVwiY29uZmlybURlbGV0ZVwiIGRhdGEtZGlzbWlzcz1cIm1vZGFsXCI+U3VwcHJpbWVyPC9hPidcclxuXHRcdH0pO1xyXG5cdFx0JCgnI2NvbmZpcm1EZWxldGUnKS5vbignY2xpY2snLF8uYmluZChmdW5jdGlvbihlKXtcclxuXHRcdFx0dmFyIG1vZGVsID0gbmV3IHJlZ2xlTW9kZWwoe1wiaWRcIjpyZWdsZS5pZH0pLmRlc3Ryb3koe1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLnZhbGlkLHRoaXMpLFxyXG5cdFx0XHRcdGVycm9yOiBfLmJpbmQodGhpcy5zaG93RXJyb3JNb2RhbCx0aGlzKVxyXG5cdFx0XHR9KTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdFx0JCgnI2FubnVsRGVsZXRlJykub24oJ2NsaWNrJyxfLmJpbmQoZnVuY3Rpb24oZSl7XHJcblx0XHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoJyNSZWdsZXMnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0XHR9LHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHR2YWxpZDpmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJTdXBwcmVzc2lvbiBlZmZlY3XDqWVcIlxyXG5cdFx0fSk7XHJcblx0XHQkKCcubW9kYWwtYmFja2Ryb3AnKS5yZW1vdmUoKTtcclxuXHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoJyNSZWdsZXMnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0fSxcclxuXHJcblx0c2hvd0Vycm9yTW9kYWw6IGZ1bmN0aW9uKG9iamVjdCxlcnJvcil7XHJcblx0XHRpZiAoZXJyb3Iuc3RhdHVzPT0yMDEpe1xyXG5cdFx0XHR0aGlzLnZhbGlkKCk7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiRXJyZXVyIFwiK2Vycm9yLnN0YXR1cyxcclxuXHRcdCBcdG1vZGFsQm9keTogXCJFcnJldXIgbG9ycyBkZSBsYSBzdXBwcmVzc2lvbiA6IFwiICsgZXJyb3Iuc3RhdHVzVGV4dCxcclxuXHRcdCBcdG1vZGFsRXJyb3I6IHRydWVcclxuXHRcdH0pO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT10aGlzLmxhbWJkYSwgYWxpYXMyPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCIgIDxmb3JtIGlkPVxcXCJmb3JtUHV0UmVnbGVcXFwiIG1ldGhvZD1cXFwicG9zdFxcXCI+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXHJcXG4gICAgPGxhYmVsIGZvcj1cXFwibGliUmVnbGVcXFwiPkxpYmVsbMOpPC9sYWJlbD5cXHJcXG4gICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiIGlkPVxcXCJsaWJSZWdsZVxcXCIgcGxhY2Vob2xkZXI9XFxcIkVudHJleiB1biBub21cXFwiIHZhbHVlPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5yZWdsZSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGlicmVnbGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIHJlcXVpcmVkPlxcclxcbiAgPC9kaXY+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXHJcXG4gICAgPGxhYmVsIGZvcj1cXFwic2NvcmVBY3Rpb25cXFwiPlNjb3JlPC9sYWJlbD5cXHJcXG4gICAgPGlucHV0IHR5cGU9XFxcIm51bWJlclxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgaWQ9XFxcInNjb3JlQWN0aW9uXFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50cmV6IHVuIHNjb3JlXFxcIiB2YWx1ZT1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucmVnbGUgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNjb3JlbWluIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiByZXF1aXJlZD5cXHJcXG4gIDwvZGl2PiAgXFxyXFxuICA8YnV0dG9uIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHRcXFwiPlZhbGlkZXI8L2J1dHRvbj5cXHJcXG4gIDwvZm9ybT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIHJlZ2xlTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9SZWdsZXMvUmVnbGUnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9QdXRSZWdsZS5oYnMnKTtcclxudmFyIG1vZGFsID0gcmVxdWlyZSgnLi4vR2xvYmFsL21vZGFsLmpzJyk7XHJcbnZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHQkcGFnZU5hbWUgOiAkKCd0aXRsZScpLFxyXG5cdCR0aXRsZSA6ICQoJyN0aXRsZScpLFx0XHJcblx0JGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHRlbDogJCgnI2Zvcm1QdXRSZWdsZScpLFxyXG5cclxuXHQvL0FwcGVsw6kgYXUgbW9tZW50IGRlIGwnaW5zdGFuY2lhdGlvblx0XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHR9LFxyXG5cclxuXHQvL0ZvbmN0aW9uIGNoYXJnw6llIGR1IHJlbmR1XHJcblx0cmVuZGVyOiBmdW5jdGlvbigpe1xyXG5cdFx0XHR0aGlzLnJlbmRlclJlc3VsdGF0KHVuZGVmaW5lZCk7XHJcblx0XHR0aGlzLiRwYWdlTmFtZS5odG1sKFwiQWpvdXQgUmVnbGVcIik7XHJcblx0XHR0aGlzLiR0aXRsZS5odG1sKFwiQWpvdXRlciB1bmUgUmVnbGVcIik7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyTW9kaWY6IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHRoaXMuaWRSZWdsZT1pZDtcclxuXHRcdCQud2hlbihuZXcgcmVnbGVNb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goKSlcclxuXHRcdC5kb25lKF8uYmluZChmdW5jdGlvbihyZWdsZSl7XHJcblx0XHRcdHRoaXMucmVuZGVyUmVzdWx0YXQocmVnbGUpO1xyXG5cdFx0fSx0aGlzKSk7XHRcdFxyXG5cdFx0dGhpcy4kcGFnZU5hbWUuaHRtbChcIk1vZGlmaWVyIFJlZ2xlXCIpO1xyXG5cdFx0dGhpcy4kdGl0bGUuaHRtbChcIk1vZGlmaWVyIHVuZSBSZWdsZVwiKTtcclxuXHR9LFxyXG5cclxuXHR2YWxpZDogZnVuY3Rpb24oZSl7XHJcblx0XHR2YXIgbGliUmVnbGUgPSAkKCcjbGliUmVnbGUnKS52YWwoKTtcclxuXHRcdHZhciBzY29yZUFjdGlvbiA9ICQoJyNzY29yZUFjdGlvbicpLnZhbCgpO1xyXG5cclxuXHRcdHZhciBtb2RlbCA9IG5ldyByZWdsZU1vZGVsKCk7XHJcblx0XHRpZiAodGhpcy5pZFJlZ2xlPT09dW5kZWZpbmVkKXtcclxuXHRcdFx0bW9kZWwuc2F2ZSh7XCJsaWJyZWdsZVwiOmxpYlJlZ2xlLCBcInNjb3JlbWluXCI6c2NvcmVBY3Rpb259LCB7XHJcblx0XHRcdFx0c3VjY2VzczogdGhpcy5zaG93TW9kYWwoXCJBam91dFwiKSxcclxuXHRcdFx0XHRlcnJvcjogXy5iaW5kKHRoaXMuc2hvd0Vycm9yTW9kYWwsdGhpcylcclxuXHRcdFx0fSk7IFxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0bW9kZWwuc2F2ZSh7XCJudW1yZWdsZVwiOnRoaXMuaWRSZWdsZSwgXCJsaWJyZWdsZVwiOmxpYlJlZ2xlLCBcInNjb3JlbWluXCI6c2NvcmVBY3Rpb259LCB7XHJcblx0XHRcdFx0c3VjY2VzczogdGhpcy5zaG93TW9kYWwoXCJNb2RpZmllclwiKSxcclxuXHRcdFx0XHRlcnJvcjogXy5iaW5kKHRoaXMuc2hvd0Vycm9yTW9kYWwsdGhpcylcclxuXHRcdFx0fSk7XHJcblx0XHR9IFxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlZ2xlKXtcclxuXHRcdGlmKHJlZ2xlPT09dW5kZWZpbmVkKXtcclxuXHRcdFx0dGhpcy4kY29udGVudC5odG1sKHRlbXBsYXRlKCkpO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHRoaXMuJGNvbnRlbnQuaHRtbCh0ZW1wbGF0ZSh7cmVnbGU6cmVnbGV9KSk7XHJcblx0XHR9XHJcblx0XHQkKCcjZm9ybVB1dFJlZ2xlJykuc3VibWl0KF8uYmluZChmdW5jdGlvbihldmVudCl7XHJcblx0XHQgICAgdGhpcy52YWxpZCgpO1xyXG5cdFx0fSwgdGhpcykpO1xyXG5cdH0sXHJcblxyXG5cdHNob3dNb2RhbDogZnVuY3Rpb24oYWN0aW9uVHlwZSl7XHJcblx0XHR2YXIgQXJ0aWNsZU1vZGFsQm9keSA9IFwiTGFcIjtcclxuXHRcdGlmKGFjdGlvblR5cGUgPT09IFwiQWpvdXRcIil7XHJcblx0XHRcdEFydGljbGVNb2RhbEJvZHkgPSBcIkwnXCI7XHJcblx0XHR9XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogYWN0aW9uVHlwZSxcclxuXHRcdCBcdG1vZGFsQm9keTogQXJ0aWNsZU1vZGFsQm9keStcIiBcIithY3Rpb25UeXBlK1wiIGEgw6l0w6kgZWZmZWN0dcOpIGF2ZWMgc3VjY8Ooc1wiXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI1JlZ2xlcycsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHR9LFxyXG5cclxuXHRzaG93RXJyb3JNb2RhbDogZnVuY3Rpb24ob2JqZWN0LGVycm9yKXtcclxuXHRcdGlmIChlcnJvci5zdGF0dXM9PTIwMSl7XHJcblx0XHRcdHRoaXMuc2hvd01vZGFsKCk7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiRXJyZXVyIFwiK2Vycm9yLnN0YXR1cyxcclxuXHRcdCBcdG1vZGFsQm9keTogXCJFcnJldXIgbG9ycyBkZSBsJ2Fqb3V0IDogXCIgKyBlcnJvci5zdGF0dXNUZXh0LFxyXG5cdFx0IFx0bW9kYWxFcnJvcjogdHJ1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcblx0PHRoZWFkPlxcclxcblx0XHQ8dHI+XFxyXFxuXHRcdFx0PHRoPklkZW50aWZpYW50PC90aD5cXHJcXG5cdFx0XHQ8dGg+TGliZWxsw6kgUsOoZ2xlPC90aD5cXHJcXG5cdFx0XHQ8dGg+U2NvcmU8L3RoPlxcclxcblx0XHRcdDx0aD48L3RoPlxcclxcblx0XHQ8L3RyPlxcclxcblx0PC90aGVhZD5cXHJcXG5cdDx0Ym9keT5cXHJcXG5cdFx0XHQ8dHI+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5yZWdsZSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuYXR0cmlidXRlcyA6IHN0YWNrMSkpICE9IG51bGwgPyBzdGFjazEubnVtcmVnbGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucmVnbGUgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmF0dHJpYnV0ZXMgOiBzdGFjazEpKSAhPSBudWxsID8gc3RhY2sxLmxpYnJlZ2xlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnJlZ2xlIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hdHRyaWJ1dGVzIDogc3RhY2sxKSkgIT0gbnVsbCA/IHN0YWNrMS5zY29yZW1pbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNSZWdsZXMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5yZWdsZSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuYXR0cmlidXRlcyA6IHN0YWNrMSkpICE9IG51bGwgPyBzdGFjazEubnVtcmVnbGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcclxcblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjUmVnbGVzL1N1cHByaW1lci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnJlZ2xlIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hdHRyaWJ1dGVzIDogc3RhY2sxKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1yZWdsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdDwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cdDwvdGJvZHk+XFxyXFxuPC90YWJsZT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIHJlZ2xlTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9SZWdsZXMvUmVnbGUnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9SZWdsZS5oYnMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHBhZ2VOYW1lIDogJCgndGl0bGUnKSxcclxuXHR0aXRsZSA6ICQoJyN0aXRsZScpLFxyXG5cdGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHQvL0FwcGVsw6kgYXUgbW9tZW50IGRlIGwnaW5zdGFuY2lhdGlvblx0XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHR9LFxyXG5cclxuXHQvL0ZvbmN0aW9uIGNoYXJnw6llIGR1IHJlbmR1XHJcblx0cmVuZGVyOiBmdW5jdGlvbihpZCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgcmVnbGVNb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5yZW5kZXJSZXN1bHRhdCwgdGhpcylcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLnBhZ2VOYW1lKS5odG1sKFwiRMOpdGFpbCBSw6hnbGVcIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJJbmZvcm1hdGlvbnMgUsOoZ2xlXCIpO1xyXG5cdH0sXHJcblxyXG5cdHJlbmRlclJlc3VsdGF0OiBmdW5jdGlvbihyZWdsZSl7XHJcblx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZSh7cmVnbGV9KSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXHRcdFx0PHRyIG9uQ2xpY2s9XFxcImRvY3VtZW50LmxvY2F0aW9uPScjUmVnbGVzL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bXJlZ2xlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiJ1xcXCI+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtcmVnbGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYnJlZ2xlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zY29yZW1pbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNSZWdsZXMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtcmVnbGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcclxcblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjUmVnbGVzL1N1cHByaW1lci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1yZWdsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdDwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIjxhIGhyZWY9XFxcIiNSZWdsZXMvQWpvdXRcXFwiPlxcclxcblx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLXN1Y2Nlc3NcXFwiPlxcclxcblx0ICA8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPiBBam91dGVyIFLDqGdsZVxcclxcblx0PC9idXR0b24+XFxyXFxuPC9hPlxcclxcblxcclxcbjx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcblx0PHRoZWFkPlxcclxcblx0XHQ8dHI+XFxyXFxuXHRcdFx0PHRoPklkZW50aWZpYW50PC90aD5cXHJcXG5cdFx0XHQ8dGg+TGliZWxsw6k8L3RoPlxcclxcblx0XHRcdDx0aD5TY29yZTwvdGg+XFxyXFxuXHRcdFx0PHRoPjwvdGg+XFxyXFxuXHRcdDwvdHI+XFxyXFxuXHQ8L3RoZWFkPlxcclxcblx0PHRib2R5PlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucmVnbGVzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXHQ8L3Rib2R5PlxcclxcbjwvdGFibGU+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciByZWdsZU1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvUmVnbGVzL1JlZ2xlc0xpc3QnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9SZWdsZXMuaGJzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0dGl0bGUgOiAkKCcjdGl0bGUnKSxcclxuXHRjb250ZW50IDogJCgnI2NvbnRlbnQnKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtb2RlbCA9IG5ldyByZWdsZU1vZGVsKCkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5yZW5kZXJSZXN1bHRhdCwgdGhpcylcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLnBhZ2VOYW1lKS5odG1sKFwiTGlzdGUgZGVzIFLDqGdsZXNcIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJMaXN0ZSBkZXMgUsOoZ2xlc1wiKTtcclxuXHR9LFxyXG5cclxuXHRyZW5kZXJSZXN1bHRhdDogZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0JCh0aGlzLmNvbnRlbnQpLmh0bWwodGVtcGxhdGUoe3JlZ2xlczogcmVzcG9uc2UudG9BcnJheSgpfSkpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwidmFyIFJlZ2xlcyA9IHJlcXVpcmUoJy4vUmVnbGVzJyk7XHJcbnZhciBSZWdsZSA9IHJlcXVpcmUoJy4vUmVnbGUnKTtcclxudmFyIFB1dFJlZ2xlID0gcmVxdWlyZSgnLi9QdXRSZWdsZScpO1xyXG52YXIgRGVsZXRlUmVnbGUgPSByZXF1aXJlKCcuL0RlbGV0ZVJlZ2xlJyk7XHJcblxyXG52YXIgUm91dGVyID0gQmFja2JvbmUuUm91dGVyLmV4dGVuZCh7XHJcblx0cm91dGVzOiB7XHJcblx0XHRcIlJlZ2xlc1wiOiBcIlJlZ2xlc1wiLFxyXG5cdFx0XCJSZWdsZXMvQWpvdXRcIjogXCJBam91dFJlZ2xlXCIsXHJcblx0XHRcIlJlZ2xlcy9Nb2RpZmllci86aWRcIjogXCJNb2RpZlJlZ2xlXCIsXHJcblx0XHRcIlJlZ2xlcy9TdXBwcmltZXIvOmlkXCI6IFwiU3VwcHJSZWdsZVwiLFxyXG5cdFx0XCJSZWdsZXMvOmlkXCI6IFwiUmVnbGVcIlxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblxyXG5cdH0sXHJcblxyXG5cdFJlZ2xlczogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMucmVnbGVzID0gbmV3IFJlZ2xlcygpO1xyXG5cdFx0dGhpcy5yZWdsZXMucmVuZGVyKCk7XHJcblx0fSxcclxuXHJcblx0UmVnbGU6IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHRoaXMucmVnbGUgPSBuZXcgUmVnbGUoKTtcclxuXHRcdHRoaXMucmVnbGUucmVuZGVyKGlkKTtcclxuXHR9LFxyXG5cclxuXHRBam91dFJlZ2xlOiBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5yZWdsZSA9IG5ldyBQdXRSZWdsZSgpO1xyXG5cdFx0dGhpcy5yZWdsZS5yZW5kZXIoKTtcclxuXHR9LFxyXG5cclxuXHRNb2RpZlJlZ2xlOiBmdW5jdGlvbihpZCl7XHJcblx0XHR0aGlzLnJlZ2xlID0gbmV3IFB1dFJlZ2xlKCk7XHJcblx0XHR0aGlzLnJlZ2xlLnJlbmRlck1vZGlmKGlkKTtcclxuXHR9LFxyXG5cclxuXHRTdXBwclJlZ2xlOiBmdW5jdGlvbihpZCl7XHJcblx0XHR0aGlzLnJlZ2xlID0gbmV3IERlbGV0ZVJlZ2xlKCk7XHJcblx0XHR0aGlzLnJlZ2xlLnJlbmRlcihpZCk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUm91dGVyOyIsInZhciBjb25maWd1cmF0aW9uID0ge1xyXG5cdHVybDogXCJodHRwOi8vbG9jYWxob3N0OjgwODAvXCJcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY29uZmlndXJhdGlvbjsiLCJ2YXIgQWNjdWVpbCA9IHJlcXVpcmUoJy4vVmlldy9BY2N1ZWlsL0FjY3VlaWwnKTtcclxudmFyIEFwcHJlbmFudHMgPSByZXF1aXJlKCcuL1ZpZXcvQXBwcmVuYW50cy9Sb3V0ZXJBcHByZW5hbnRzJyk7XHJcbnZhciBBY3Rpb25zID0gcmVxdWlyZSgnLi9WaWV3L0FjdGlvbnMvUm91dGVyQWN0aW9ucycpO1xyXG52YXIgUmVnbGVzID0gcmVxdWlyZSgnLi9WaWV3L1JlZ2xlcy9Sb3V0ZXJSZWdsZXMnKTtcclxudmFyIEluZGljYXRldXJzID0gcmVxdWlyZSgnLi9WaWV3L0luZGljYXRldXJzL1JvdXRlckluZGljYXRldXJzJyk7XHJcbnZhciBPYmplY3RpZnMgPSByZXF1aXJlKCcuL1ZpZXcvT2JqZWN0aWZzL1JvdXRlck9iamVjdGlmcycpO1xyXG52YXIgSmV1eD1yZXF1aXJlKCcuL1ZpZXcvSmV1eC9Sb3V0ZXJKZXV4Jyk7XHJcbnZhciBFdmFsdWF0aW9uID0gcmVxdWlyZSgnLi9WaWV3L0V2YWx1YXRpb24vUm91dGVyRXZhbHVhdGlvbicpO1xyXG52YXIgTWlzc2lvbnM9IHJlcXVpcmUoJy4vVmlldy9NaXNzaW9ucy9Sb3V0ZXJNaXNzaW9ucycpXHJcblxyXG52YXIgUm91dGVyID0gQmFja2JvbmUuUm91dGVyLmV4dGVuZCh7XHJcblx0cm91dGVzOiB7XHJcblx0XHRcIlwiOiBcIkFjY3VlaWxcIlxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblxyXG5cdH0sXHJcblxyXG5cdEFjY3VlaWw6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLmFjY3VlaWwgPSBuZXcgQWNjdWVpbCgpO1xyXG5cdFx0dGhpcy5hY2N1ZWlsLnJlbmRlcigpO1xyXG5cdH1cclxufSk7XHJcblxyXG52YXIgcm91dGVyID0gbmV3IFJvdXRlcigpO1xyXG52YXIgYXBwcmVuYW50c1JvdXRlciA9IG5ldyBBcHByZW5hbnRzKCk7XHJcbnZhciBhY3Rpb25zUm91dGVyID0gbmV3IEFjdGlvbnMoKTtcclxudmFyIHJlZ2xlc1JvdXRlciA9IG5ldyBSZWdsZXMoKTtcclxudmFyIGluZGljYXRldXJzUm91dGV1ciA9IG5ldyBJbmRpY2F0ZXVycygpO1xyXG52YXIgb2JqZWN0aWZzUm91dGV1ciA9IG5ldyBPYmplY3RpZnMoKTtcclxudmFyIGV2YWx1YXRpb25Sb3V0ZXVyID0gbmV3IEV2YWx1YXRpb24oKTtcclxudmFyIEpldXhSb3V0ZXVyPW5ldyBKZXV4KCk7XHJcbnZhciBNaXNzaW9uc1JvdXRldXI9bmV3IE1pc3Npb25zKCk7XHJcblxyXG5CYWNrYm9uZS5oaXN0b3J5LnN0YXJ0KCk7Il19
