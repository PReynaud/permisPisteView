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
				error: this.showErrorModal
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
				error: this.showErrorModal
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

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Erreur lors de la suppression : " + error,
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
				error: this.showErrorModal
			});
		}
		else{
			model.save({"numaction":this.idAction, "actNumaction":actNumaction, "libaction":libaction, "scoremin":scoremin}, {
				success: this.showModal("Modifier"),
				error: this.showErrorModal
			});
		} 
		return true;
	},

	validRegle: function(e){
		var numregle = $('#numregle').val();
		var model =  new possedeModel();
		model.save({"numaction":this.idAction, "numregle":numregle}, {
			success: this.showModal,
			error: this.showErrorModal
		});
		return true;
	},

	renderResultat: function(responseList, responseListRegleTot, responseListRegle, response){
		if(response===undefined){
			this.$content.html(template({actions:responseList}));
		}else{

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

	showModal: function(actionType){
		var ArticleModalBody = "La";
		if(actionType === "Ajout"){
			ArticleModalBody = "L'";
		}
		var modalView = new modal({
			modalTitle: actionType,
		 	modalBody: ArticleModalBody+" "+actionType+" a été effectué avec succès"
		});
		
		Backbone.history.navigate('#Actions', {trigger:true});
	},

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Ajout/Modifier",
		 	modalBody: "Erreur lors de l'ajout/modification : " + error,
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
    + "</td>\r\n				<td>\r\n					<a href=\"#Apprenants/Modifier/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numapprenant : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span>\r\n					</a>\r\n					<a href=\"#Apprenants/Supprimer/"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.attributes : depth0)) != null ? stack1.numapprenant : stack1), depth0))
    + "\">\r\n						<span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\r\n					</a>\r\n				</td>\r\n			</tr>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<a href=\"#Apprenants/Ajout\">\r\n	<button type=\"button\" class=\"btn btn-success\">\r\n	  <span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span> Ajouter Apprenant\r\n	</button>\r\n</a>\r\n\r\n<table class=\"table\">\r\n	<thead>\r\n		<tr>\r\n			<th>Identifiant</th>\r\n			<th>Nom</th>\r\n			<th>Prenom</th>\r\n			<th></th>\r\n		</tr>\r\n	</thead>\r\n	<tbody>\r\n"
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
var ApprenantModel = require('../../Model/Apprenants/Apprenant');
var modal = require('../Global/modal.js');

var view = Backbone.View.extend({
	render: function(id){
		var model = new ApprenantModel({"id":id}).fetch({
			success: _.bind(this.confirm,this)
		});

	},

	confirm:function(apprenant){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Confirmer la suppression",
		 	modalFooter: '<button type="button" class="btn btn-default" data-dismiss="modal" id="annulDelete">Annuler</button><a class="btn btn-danger btn-ok" id="confirmDelete" data-dismiss="modal">Supprimer</a>'
		});
		$('#confirmDelete').on('click',_.bind(function(e){
			var model = new ApprenantModel({"id":apprenant.id}).destroy({
				success: _.bind(this.valid,this)
			});
			//$('.modal-backdrop').remove();
			Backbone.history.navigate('#Apprenants', {trigger:true});
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
		Backbone.history.navigate('#Apprenants', {trigger:true});
	},

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Erreur lors de la suppression : " + error,
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
			model.save({"nomapprenant":nomapprenant, "prenomapprenant":prenomapprenant}, {
				success: this.showErrorModal,
				error: this.showModal
			});
		}
		else{
			model.save({"numapprenant":this.idApprenant, "nomapprenant":nomapprenant, "prenomapprenant":prenomapprenant}, {
				success: this.showErrorModal,
				error: this.showModal
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
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "L'ajout a été effectué avec succès"
		});
		Backbone.history.navigate('#Apprenants', {trigger:true});
	},

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "Erreur lors de l'ajout : " + error,
		 	modalError: true
		});
		Backbone.history.navigate('#Apprenants', {trigger:true});
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
    return "  <h3>Bilan final</h3>\r\n\r\n  <table class=\"table\">\r\n  <thead>\r\n    <tr>\r\n      <th>Num</th>\r\n      <th>Mission</th>\r\n      <th>Score</th>\r\n    </tr>\r\n  </thead>\r\n  <tbody>\r\n  <tr>\r\n    <td></td>\r\n    <td></td>\r\n    <td></td>\r\n  </tr>\r\n  <tr>\r\n    <td></td>\r\n    <td></td>\r\n    <td></td>\r\n  </tr>\r\n</table>\r\n\r\n<h4>Score total: </h4>\r\n\r\n<a href=\"\">\r\n  <button id=\"accueil\" class=\"btn btn-default\">Retour à l'accueil</button>\r\n</a>";
},"useData":true});

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Evaluation\\BilanMission.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "  <h3>Bilan de la mission</h3>\r\n\r\n  <table class=\"table\">\r\n  <thead>\r\n    <tr>\r\n      <th>Num</th>\r\n      <th>Objectif</th>\r\n      <th>Actions</th>\r\n    </tr>\r\n  </thead>\r\n  <tbody>\r\n  <tr>\r\n    <td></td>\r\n    <td></td>\r\n    <td></td>\r\n  </tr>\r\n  <tr>\r\n    <td></td>\r\n    <td></td>\r\n    <td></td>\r\n  </tr>\r\n</table>\r\n\r\n<h4>Total de la mission: </h4>\r\n\r\n<button id=\"missionSuivante\" class=\"btn btn-default\">Mission suivante</button>";
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

  return "<h3>Evaluation de la mission</h3>\r\n<h2>"
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

		$(this.content).html(templateEvalMission({mission:actualMission}));
	},

	/* Clic sur le second bouton valider */ 
	validMission: function(e){
		$(this.content).html(templateBilanMission());

		var $missionSuivante = $('#missionSuivante');
		$missionSuivante.click(_.bind(function(event){
			if(this.currentMission >= this.numberOfMission){
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

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\AjoutIndicateur.hbs":[function(require,module,exports){
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

},{"hbsfy/runtime":"c:\\dev\\PermisPisteView\\node_modules\\hbsfy\\runtime.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\AjoutIndicateur.js":[function(require,module,exports){
var indicateurModel = require('../../Model/Indicateurs/Indicateur');
var actionModel= require ('../../Model/Actions/ActionsList')
var template = require('./AjoutIndicateur.hbs');
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
				error: this.showErrorModal
			});
		}
		else
		{
			model.save({"id":this.idIndicateur,"libindic":libIndicateur, "numaction":scoreAction ,"poids":libPoids}, {
				success: this.showModal,
				error: this.showErrorModal
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

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "Erreur lors de l'ajout : " + error,
		 	modalError: true
		});
	}
});

module.exports = view;
},{"../../Model/Actions/ActionsList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Actions\\ActionsList.js","../../Model/Indicateurs/Indicateur":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Indicateurs\\Indicateur.js","../Global/modal.js":"c:\\dev\\PermisPisteView\\src\\js\\View\\Global\\modal.js","./AjoutIndicateur.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\AjoutIndicateur.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\DeleteIndicateur.js":[function(require,module,exports){
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
				error: this.showErrorModal
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

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Erreur lors de la suppression : " + error,
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
},{"../../Model/Indicateurs/IndicateursList":"c:\\dev\\PermisPisteView\\src\\js\\Model\\Indicateurs\\IndicateursList.js","./Indicateurs.hbs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\Indicateurs.hbs"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\RouterIndicateurs.js":[function(require,module,exports){
var Indicateurs = require('./Indicateurs');
var Indicateur = require('./Indicateur');
var AjoutIndicateur = require('./AjoutIndicateur');
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
},{"./AjoutIndicateur":"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\AjoutIndicateur.js","./DeleteIndicateur":"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\DeleteIndicateur.js","./Indicateur":"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\Indicateur.js","./Indicateurs":"c:\\dev\\PermisPisteView\\src\\js\\View\\Indicateurs\\Indicateurs.js"}],"c:\\dev\\PermisPisteView\\src\\js\\View\\Jeux\\DeleteJeu.js":[function(require,module,exports){
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
				error: this.showErrorModal
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

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Erreur lors de la suppression : " + error,
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
				error: this.showErrorModal
			});
		}
		else{
			model.save({"id":this.idJeu, "libellejeu":libellejeu}, {
				success: this.showModal("Modifier"),
				error: this.showErrorModal
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

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Ajout/Modifier",
		 	modalBody: "Erreur lors de l'ajout/modification : " + error,
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
				error: this.showErrorModal
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

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Erreur lors de la suppression : " + error,
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
		console.log(id);
		objectifs.urlRoot=objectifs.urlRoot+''+id+"/Objectif";
		$.when(new missionModel({"id":id}).fetch(),objectifs.fetch())
		.done(_.bind(function(mission,objectifs){
			this.renderResultat(mission,objectifs);
		},this));
		$(this.pageName).html("Détail Mission");
		$(this.title).html("Informations Mission");
	},

	renderResultat: function(mission,objectifs){
		console.log(mission);
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
		this.renderResultat(undefined);
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
				error: this.showErrorModal
			});
		}
		else{
			model.save({"id":this.idMission,"numjeu":this.idJeu, "libmission":libmission}, {
				success: this.showModal("Modifier"),
				error: this.showErrorModal
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
		
		Backbone.history.navigate('#Jeux');
		window.location.reload();
	},

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Ajout/Modifier",
		 	modalBody: "Erreur lors de l'ajout/modification : " + error,
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
				error: this.showErrorModal
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
				error: this.showErrorModal
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

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Erreur lors de la suppression : " + error,
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
		console.log(numobjectif);
		var model = new FixeModel();
		if (this.idObjectif===undefined){
			model.save({"nummission":this.idMission, "numobjectif":numobjectif}, {
				success: this.showModal,
				error: this.showErrorModal
			});
		}
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

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "Erreur lors de l'ajout : " + error,
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
				error: this.showErrorModal
			});
		}
		else{
			model.save({"numobjectif":this.idObjectif, "libobjectif":libobjectif}, {
				success: this.showModal,
				error: this.showErrorModal
			});
		} 
		return true;
	},

	validAction: function(e){
		var numaction = $('#numaction').val();

		var model =  new Est_associeModel();
		model.save({"numobjectif":this.idObjectif, "numaction":numaction}, {
			success: this.showModal,
			error: this.showErrorModal
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

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Ajout",
		 	modalBody: "Erreur lors de l'ajout : " + error,
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
				error: this.showErrorModal
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

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Suppression",
		 	modalBody: "Erreur lors de la suppression : " + error,
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
				error: this.showErrorModal
			}); 
		}
		else{
			model.save({"id":this.idRegle, "libregle":libRegle, "scoremin":scoreAction}, {
				success: this.showModal("Modifier"),
				error: this.showErrorModal
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

	showErrorModal: function(error){
		var modalView = new modal({
			modalTitle: "Ajout/Modification",
		 	modalBody: "Erreur lors de l'ajout/modification : " + error,
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2Jhc2UuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3NhZmUtc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGJzZnkvcnVudGltZS5qcyIsInNyYy9qcy9Nb2RlbC9BY3Rpb25zL0FjdGlvbi5qcyIsInNyYy9qcy9Nb2RlbC9BY3Rpb25zL0FjdGlvbnNMaXN0LmpzIiwic3JjL2pzL01vZGVsL0FwcHJlbmFudHMvQXBwcmVuYW50LmpzIiwic3JjL2pzL01vZGVsL0FwcHJlbmFudHMvQXBwcmVuYW50c0xpc3QuanMiLCJzcmMvanMvTW9kZWwvRXN0X2Fzc29jaWUvRXN0X2Fzc29jaWUuanMiLCJzcmMvanMvTW9kZWwvRXZhbHVhdGlvbi9FdmFsdWF0aW9uLmpzIiwic3JjL2pzL01vZGVsL0ZpeGUvRml4ZS5qcyIsInNyYy9qcy9Nb2RlbC9GaXhlL0ZpeGUyLmpzIiwic3JjL2pzL01vZGVsL0luZGljYXRldXJzL0luZGljYXRldXIuanMiLCJzcmMvanMvTW9kZWwvSW5kaWNhdGV1cnMvSW5kaWNhdGV1cnNMaXN0LmpzIiwic3JjL2pzL01vZGVsL0pldXgvSmV1LmpzIiwic3JjL2pzL01vZGVsL0pldXgvSmV1eExpc3QuanMiLCJzcmMvanMvTW9kZWwvTWlzc2lvbnMvTWlzc2lvbi5qcyIsInNyYy9qcy9Nb2RlbC9PYmplY3RpZnMvT2JqZWN0aWYuanMiLCJzcmMvanMvTW9kZWwvT2JqZWN0aWZzL09iamVjdGlmTWlzc2lvbi5qcyIsInNyYy9qcy9Nb2RlbC9PYmplY3RpZnMvT2JqZWN0aWZzTGlzdC5qcyIsInNyYy9qcy9Nb2RlbC9Qb3NzZWRlL1Bvc3NlZGUuanMiLCJzcmMvanMvTW9kZWwvUmVnbGVzL1JlZ2xlLmpzIiwic3JjL2pzL01vZGVsL1JlZ2xlcy9SZWdsZXNMaXN0LmpzIiwic3JjL2pzL1ZpZXcvQWNjdWVpbC9BY2N1ZWlsLmhicyIsInNyYy9qcy9WaWV3L0FjY3VlaWwvQWNjdWVpbC5qcyIsInNyYy9qcy9WaWV3L0FjdGlvbnMvQWN0aW9uLmhicyIsInNyYy9qcy9WaWV3L0FjdGlvbnMvQWN0aW9uLmpzIiwic3JjL2pzL1ZpZXcvQWN0aW9ucy9BY3Rpb25zLmhicyIsInNyYy9qcy9WaWV3L0FjdGlvbnMvQWN0aW9ucy5qcyIsInNyYy9qcy9WaWV3L0FjdGlvbnMvRGVsZXRlQWN0aW9uLmpzIiwic3JjL2pzL1ZpZXcvQWN0aW9ucy9QdXRBY3Rpb24uaGJzIiwic3JjL2pzL1ZpZXcvQWN0aW9ucy9QdXRBY3Rpb24uanMiLCJzcmMvanMvVmlldy9BY3Rpb25zL1JvdXRlckFjdGlvbnMuanMiLCJzcmMvanMvVmlldy9BcHByZW5hbnRzL0FwcHJlbmFudC5oYnMiLCJzcmMvanMvVmlldy9BcHByZW5hbnRzL0FwcHJlbmFudC5qcyIsInNyYy9qcy9WaWV3L0FwcHJlbmFudHMvQXBwcmVuYW50cy5oYnMiLCJzcmMvanMvVmlldy9BcHByZW5hbnRzL0FwcHJlbmFudHMuanMiLCJzcmMvanMvVmlldy9BcHByZW5hbnRzL0RlbGV0ZUFwcHJlbmFudC5qcyIsInNyYy9qcy9WaWV3L0FwcHJlbmFudHMvUHV0QXBwcmVuYW50LmhicyIsInNyYy9qcy9WaWV3L0FwcHJlbmFudHMvUHV0QXBwcmVuYW50LmpzIiwic3JjL2pzL1ZpZXcvQXBwcmVuYW50cy9Sb3V0ZXJBcHByZW5hbnRzLmpzIiwic3JjL2pzL1ZpZXcvRXZhbHVhdGlvbi9CaWxhbkZpbmFsLmhicyIsInNyYy9qcy9WaWV3L0V2YWx1YXRpb24vQmlsYW5NaXNzaW9uLmhicyIsInNyYy9qcy9WaWV3L0V2YWx1YXRpb24vRXZhbE1pc3Npb24uaGJzIiwic3JjL2pzL1ZpZXcvRXZhbHVhdGlvbi9FdmFsdWF0aW9uLmhicyIsInNyYy9qcy9WaWV3L0V2YWx1YXRpb24vRXZhbHVhdGlvbi5qcyIsInNyYy9qcy9WaWV3L0V2YWx1YXRpb24vUm91dGVyRXZhbHVhdGlvbi5qcyIsInNyYy9qcy9WaWV3L0dsb2JhbC9tb2RhbC5oYnMiLCJzcmMvanMvVmlldy9HbG9iYWwvbW9kYWwuanMiLCJzcmMvanMvVmlldy9HbG9iYWwvbW9kYWxFcnJvci5oYnMiLCJzcmMvanMvVmlldy9JbmRpY2F0ZXVycy9Bam91dEluZGljYXRldXIuaGJzIiwic3JjL2pzL1ZpZXcvSW5kaWNhdGV1cnMvQWpvdXRJbmRpY2F0ZXVyLmpzIiwic3JjL2pzL1ZpZXcvSW5kaWNhdGV1cnMvRGVsZXRlSW5kaWNhdGV1ci5qcyIsInNyYy9qcy9WaWV3L0luZGljYXRldXJzL0luZGljYXRldXIuaGJzIiwic3JjL2pzL1ZpZXcvSW5kaWNhdGV1cnMvSW5kaWNhdGV1ci5qcyIsInNyYy9qcy9WaWV3L0luZGljYXRldXJzL0luZGljYXRldXJzLmhicyIsInNyYy9qcy9WaWV3L0luZGljYXRldXJzL0luZGljYXRldXJzLmpzIiwic3JjL2pzL1ZpZXcvSW5kaWNhdGV1cnMvUm91dGVySW5kaWNhdGV1cnMuanMiLCJzcmMvanMvVmlldy9KZXV4L0RlbGV0ZUpldS5qcyIsInNyYy9qcy9WaWV3L0pldXgvSmV1LmhicyIsInNyYy9qcy9WaWV3L0pldXgvSmV1LmpzIiwic3JjL2pzL1ZpZXcvSmV1eC9KZXV4LmhicyIsInNyYy9qcy9WaWV3L0pldXgvSmV1eC5qcyIsInNyYy9qcy9WaWV3L0pldXgvUHV0SmV1LmhicyIsInNyYy9qcy9WaWV3L0pldXgvUHV0SmV1LmpzIiwic3JjL2pzL1ZpZXcvSmV1eC9Sb3V0ZXJKZXV4LmpzIiwic3JjL2pzL1ZpZXcvTWlzc2lvbnMvRGVsZXRlTWlzc2lvbi5qcyIsInNyYy9qcy9WaWV3L01pc3Npb25zL01pc3Npb24uaGJzIiwic3JjL2pzL1ZpZXcvTWlzc2lvbnMvTWlzc2lvbi5qcyIsInNyYy9qcy9WaWV3L01pc3Npb25zL1B1dE1pc3Npb24uaGJzIiwic3JjL2pzL1ZpZXcvTWlzc2lvbnMvUHV0TWlzc2lvbi5qcyIsInNyYy9qcy9WaWV3L01pc3Npb25zL1JvdXRlck1pc3Npb25zLmpzIiwic3JjL2pzL1ZpZXcvT2JqZWN0aWZzL0RlbGV0ZU9iamVjdGlmLmpzIiwic3JjL2pzL1ZpZXcvT2JqZWN0aWZzL0xpZU9iamVjdGlmLmhicyIsInNyYy9qcy9WaWV3L09iamVjdGlmcy9MaWVPYmplY3RpZi5qcyIsInNyYy9qcy9WaWV3L09iamVjdGlmcy9PYmplY3RpZi5oYnMiLCJzcmMvanMvVmlldy9PYmplY3RpZnMvT2JqZWN0aWYuanMiLCJzcmMvanMvVmlldy9PYmplY3RpZnMvT2JqZWN0aWZzLmhicyIsInNyYy9qcy9WaWV3L09iamVjdGlmcy9PYmplY3RpZnMuanMiLCJzcmMvanMvVmlldy9PYmplY3RpZnMvUHV0T2JqZWN0aWYuaGJzIiwic3JjL2pzL1ZpZXcvT2JqZWN0aWZzL1B1dE9iamVjdGlmLmpzIiwic3JjL2pzL1ZpZXcvT2JqZWN0aWZzL1JvdXRlck9iamVjdGlmcy5qcyIsInNyYy9qcy9WaWV3L1JlZ2xlcy9EZWxldGVSZWdsZS5qcyIsInNyYy9qcy9WaWV3L1JlZ2xlcy9QdXRSZWdsZS5oYnMiLCJzcmMvanMvVmlldy9SZWdsZXMvUHV0UmVnbGUuanMiLCJzcmMvanMvVmlldy9SZWdsZXMvUmVnbGUuaGJzIiwic3JjL2pzL1ZpZXcvUmVnbGVzL1JlZ2xlLmpzIiwic3JjL2pzL1ZpZXcvUmVnbGVzL1JlZ2xlcy5oYnMiLCJzcmMvanMvVmlldy9SZWdsZXMvUmVnbGVzLmpzIiwic3JjL2pzL1ZpZXcvUmVnbGVzL1JvdXRlclJlZ2xlcy5qcyIsInNyYy9qcy9jb25maWd1cmF0aW9uLmpzIiwic3JjL2pzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9pbXBvcnQgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvYmFzZScpO1xuXG52YXIgYmFzZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQpO1xuXG4vLyBFYWNoIG9mIHRoZXNlIGF1Z21lbnQgdGhlIEhhbmRsZWJhcnMgb2JqZWN0LiBObyBuZWVkIHRvIHNldHVwIGhlcmUuXG4vLyAoVGhpcyBpcyBkb25lIHRvIGVhc2lseSBzaGFyZSBjb2RlIGJldHdlZW4gY29tbW9uanMgYW5kIGJyb3dzZSBlbnZzKVxuXG52YXIgX1NhZmVTdHJpbmcgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvc2FmZS1zdHJpbmcnKTtcblxudmFyIF9TYWZlU3RyaW5nMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9TYWZlU3RyaW5nKTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvZXhjZXB0aW9uJyk7XG5cbnZhciBfRXhjZXB0aW9uMiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9FeGNlcHRpb24pO1xuXG52YXIgX2ltcG9ydDIgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvdXRpbHMnKTtcblxudmFyIFV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydDIpO1xuXG52YXIgX2ltcG9ydDMgPSByZXF1aXJlKCcuL2hhbmRsZWJhcnMvcnVudGltZScpO1xuXG52YXIgcnVudGltZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9pbXBvcnQzKTtcblxudmFyIF9ub0NvbmZsaWN0ID0gcmVxdWlyZSgnLi9oYW5kbGViYXJzL25vLWNvbmZsaWN0Jyk7XG5cbnZhciBfbm9Db25mbGljdDIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfbm9Db25mbGljdCk7XG5cbi8vIEZvciBjb21wYXRpYmlsaXR5IGFuZCB1c2FnZSBvdXRzaWRlIG9mIG1vZHVsZSBzeXN0ZW1zLCBtYWtlIHRoZSBIYW5kbGViYXJzIG9iamVjdCBhIG5hbWVzcGFjZVxuZnVuY3Rpb24gY3JlYXRlKCkge1xuICB2YXIgaGIgPSBuZXcgYmFzZS5IYW5kbGViYXJzRW52aXJvbm1lbnQoKTtcblxuICBVdGlscy5leHRlbmQoaGIsIGJhc2UpO1xuICBoYi5TYWZlU3RyaW5nID0gX1NhZmVTdHJpbmcyWydkZWZhdWx0J107XG4gIGhiLkV4Y2VwdGlvbiA9IF9FeGNlcHRpb24yWydkZWZhdWx0J107XG4gIGhiLlV0aWxzID0gVXRpbHM7XG4gIGhiLmVzY2FwZUV4cHJlc3Npb24gPSBVdGlscy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIGhiLlZNID0gcnVudGltZTtcbiAgaGIudGVtcGxhdGUgPSBmdW5jdGlvbiAoc3BlYykge1xuICAgIHJldHVybiBydW50aW1lLnRlbXBsYXRlKHNwZWMsIGhiKTtcbiAgfTtcblxuICByZXR1cm4gaGI7XG59XG5cbnZhciBpbnN0ID0gY3JlYXRlKCk7XG5pbnN0LmNyZWF0ZSA9IGNyZWF0ZTtcblxuX25vQ29uZmxpY3QyWydkZWZhdWx0J10oaW5zdCk7XG5cbmluc3RbJ2RlZmF1bHQnXSA9IGluc3Q7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGluc3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuSGFuZGxlYmFyc0Vudmlyb25tZW50ID0gSGFuZGxlYmFyc0Vudmlyb25tZW50O1xuZXhwb3J0cy5jcmVhdGVGcmFtZSA9IGNyZWF0ZUZyYW1lO1xuXG52YXIgX2ltcG9ydCA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIFV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2ltcG9ydCk7XG5cbnZhciBfRXhjZXB0aW9uID0gcmVxdWlyZSgnLi9leGNlcHRpb24nKTtcblxudmFyIF9FeGNlcHRpb24yID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX0V4Y2VwdGlvbik7XG5cbnZhciBWRVJTSU9OID0gJzMuMC4xJztcbmV4cG9ydHMuVkVSU0lPTiA9IFZFUlNJT047XG52YXIgQ09NUElMRVJfUkVWSVNJT04gPSA2O1xuXG5leHBvcnRzLkNPTVBJTEVSX1JFVklTSU9OID0gQ09NUElMRVJfUkVWSVNJT047XG52YXIgUkVWSVNJT05fQ0hBTkdFUyA9IHtcbiAgMTogJzw9IDEuMC5yYy4yJywgLy8gMS4wLnJjLjIgaXMgYWN0dWFsbHkgcmV2MiBidXQgZG9lc24ndCByZXBvcnQgaXRcbiAgMjogJz09IDEuMC4wLXJjLjMnLFxuICAzOiAnPT0gMS4wLjAtcmMuNCcsXG4gIDQ6ICc9PSAxLngueCcsXG4gIDU6ICc9PSAyLjAuMC1hbHBoYS54JyxcbiAgNjogJz49IDIuMC4wLWJldGEuMSdcbn07XG5cbmV4cG9ydHMuUkVWSVNJT05fQ0hBTkdFUyA9IFJFVklTSU9OX0NIQU5HRVM7XG52YXIgaXNBcnJheSA9IFV0aWxzLmlzQXJyYXksXG4gICAgaXNGdW5jdGlvbiA9IFV0aWxzLmlzRnVuY3Rpb24sXG4gICAgdG9TdHJpbmcgPSBVdGlscy50b1N0cmluZyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbmZ1bmN0aW9uIEhhbmRsZWJhcnNFbnZpcm9ubWVudChoZWxwZXJzLCBwYXJ0aWFscykge1xuICB0aGlzLmhlbHBlcnMgPSBoZWxwZXJzIHx8IHt9O1xuICB0aGlzLnBhcnRpYWxzID0gcGFydGlhbHMgfHwge307XG5cbiAgcmVnaXN0ZXJEZWZhdWx0SGVscGVycyh0aGlzKTtcbn1cblxuSGFuZGxlYmFyc0Vudmlyb25tZW50LnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IEhhbmRsZWJhcnNFbnZpcm9ubWVudCxcblxuICBsb2dnZXI6IGxvZ2dlcixcbiAgbG9nOiBsb2csXG5cbiAgcmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uIHJlZ2lzdGVySGVscGVyKG5hbWUsIGZuKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGlmIChmbikge1xuICAgICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7XG4gICAgICB9XG4gICAgICBVdGlscy5leHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gICAgfVxuICB9LFxuICB1bnJlZ2lzdGVySGVscGVyOiBmdW5jdGlvbiB1bnJlZ2lzdGVySGVscGVyKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5oZWxwZXJzW25hbWVdO1xuICB9LFxuXG4gIHJlZ2lzdGVyUGFydGlhbDogZnVuY3Rpb24gcmVnaXN0ZXJQYXJ0aWFsKG5hbWUsIHBhcnRpYWwpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgVXRpbHMuZXh0ZW5kKHRoaXMucGFydGlhbHMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIHBhcnRpYWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdBdHRlbXB0aW5nIHRvIHJlZ2lzdGVyIGEgcGFydGlhbCBhcyB1bmRlZmluZWQnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBwYXJ0aWFsO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uIHVucmVnaXN0ZXJQYXJ0aWFsKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5wYXJ0aWFsc1tuYW1lXTtcbiAgfVxufTtcblxuZnVuY3Rpb24gcmVnaXN0ZXJEZWZhdWx0SGVscGVycyhpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgLy8gQSBtaXNzaW5nIGZpZWxkIGluIGEge3tmb299fSBjb25zdHVjdC5cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNvbWVvbmUgaXMgYWN0dWFsbHkgdHJ5aW5nIHRvIGNhbGwgc29tZXRoaW5nLCBibG93IHVwLlxuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ01pc3NpbmcgaGVscGVyOiBcIicgKyBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdLm5hbWUgKyAnXCInKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlLFxuICAgICAgICBmbiA9IG9wdGlvbnMuZm47XG5cbiAgICBpZiAoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGZuKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoY29udGV4dCA9PT0gZmFsc2UgfHwgY29udGV4dCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkoY29udGV4dCkpIHtcbiAgICAgIGlmIChjb250ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaWRzKSB7XG4gICAgICAgICAgb3B0aW9ucy5pZHMgPSBbb3B0aW9ucy5uYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgICB2YXIgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBVdGlscy5hcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMubmFtZSk7XG4gICAgICAgIG9wdGlvbnMgPSB7IGRhdGE6IGRhdGEgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2VhY2gnLCBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ011c3QgcGFzcyBpdGVyYXRvciB0byAjZWFjaCcpO1xuICAgIH1cblxuICAgIHZhciBmbiA9IG9wdGlvbnMuZm4sXG4gICAgICAgIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICByZXQgPSAnJyxcbiAgICAgICAgZGF0YSA9IHVuZGVmaW5lZCxcbiAgICAgICAgY29udGV4dFBhdGggPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICBjb250ZXh0UGF0aCA9IFV0aWxzLmFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5pZHNbMF0pICsgJy4nO1xuICAgIH1cblxuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7XG4gICAgICBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICAgIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4ZWNJdGVyYXRpb24oZmllbGQsIGluZGV4LCBsYXN0KSB7XG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICBkYXRhLmtleSA9IGZpZWxkO1xuICAgICAgICBkYXRhLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIGRhdGEuZmlyc3QgPSBpbmRleCA9PT0gMDtcbiAgICAgICAgZGF0YS5sYXN0ID0gISFsYXN0O1xuXG4gICAgICAgIGlmIChjb250ZXh0UGF0aCkge1xuICAgICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBjb250ZXh0UGF0aCArIGZpZWxkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbZmllbGRdLCB7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGJsb2NrUGFyYW1zOiBVdGlscy5ibG9ja1BhcmFtcyhbY29udGV4dFtmaWVsZF0sIGZpZWxkXSwgW2NvbnRleHRQYXRoICsgZmllbGQsIG51bGxdKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgICBmb3IgKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICBleGVjSXRlcmF0aW9uKGksIGksIGkgPT09IGNvbnRleHQubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBwcmlvcktleSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICAgIGlmIChjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIC8vIFdlJ3JlIHJ1bm5pbmcgdGhlIGl0ZXJhdGlvbnMgb25lIHN0ZXAgb3V0IG9mIHN5bmMgc28gd2UgY2FuIGRldGVjdFxuICAgICAgICAgICAgLy8gdGhlIGxhc3QgaXRlcmF0aW9uIHdpdGhvdXQgaGF2ZSB0byBzY2FuIHRoZSBvYmplY3QgdHdpY2UgYW5kIGNyZWF0ZVxuICAgICAgICAgICAgLy8gYW4gaXRlcm1lZGlhdGUga2V5cyBhcnJheS5cbiAgICAgICAgICAgIGlmIChwcmlvcktleSkge1xuICAgICAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmlvcktleSA9IGtleTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByaW9yS2V5KSB7XG4gICAgICAgICAgZXhlY0l0ZXJhdGlvbihwcmlvcktleSwgaSAtIDEsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24gKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uYWwpKSB7XG4gICAgICBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCBiZWhhdmlvciBpcyB0byByZW5kZXIgdGhlIHBvc2l0aXZlIHBhdGggaWYgdGhlIHZhbHVlIGlzIHRydXRoeSBhbmQgbm90IGVtcHR5LlxuICAgIC8vIFRoZSBgaW5jbHVkZVplcm9gIG9wdGlvbiBtYXkgYmUgc2V0IHRvIHRyZWF0IHRoZSBjb25kdGlvbmFsIGFzIHB1cmVseSBub3QgZW1wdHkgYmFzZWQgb24gdGhlXG4gICAgLy8gYmVoYXZpb3Igb2YgaXNFbXB0eS4gRWZmZWN0aXZlbHkgdGhpcyBkZXRlcm1pbmVzIGlmIDAgaXMgaGFuZGxlZCBieSB0aGUgcG9zaXRpdmUgcGF0aCBvciBuZWdhdGl2ZS5cbiAgICBpZiAoIW9wdGlvbnMuaGFzaC5pbmNsdWRlWmVybyAmJiAhY29uZGl0aW9uYWwgfHwgVXRpbHMuaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uIChjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHsgZm46IG9wdGlvbnMuaW52ZXJzZSwgaW52ZXJzZTogb3B0aW9ucy5mbiwgaGFzaDogb3B0aW9ucy5oYXNoIH0pO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHtcbiAgICAgIGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgdmFyIGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmICghVXRpbHMuaXNFbXB0eShjb250ZXh0KSkge1xuICAgICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgICB2YXIgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBVdGlscy5hcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMuaWRzWzBdKTtcbiAgICAgICAgb3B0aW9ucyA9IHsgZGF0YTogZGF0YSB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9nJywgZnVuY3Rpb24gKG1lc3NhZ2UsIG9wdGlvbnMpIHtcbiAgICB2YXIgbGV2ZWwgPSBvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5kYXRhLmxldmVsICE9IG51bGwgPyBwYXJzZUludChvcHRpb25zLmRhdGEubGV2ZWwsIDEwKSA6IDE7XG4gICAgaW5zdGFuY2UubG9nKGxldmVsLCBtZXNzYWdlKTtcbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2xvb2t1cCcsIGZ1bmN0aW9uIChvYmosIGZpZWxkKSB7XG4gICAgcmV0dXJuIG9iaiAmJiBvYmpbZmllbGRdO1xuICB9KTtcbn1cblxudmFyIGxvZ2dlciA9IHtcbiAgbWV0aG9kTWFwOiB7IDA6ICdkZWJ1ZycsIDE6ICdpbmZvJywgMjogJ3dhcm4nLCAzOiAnZXJyb3InIH0sXG5cbiAgLy8gU3RhdGUgZW51bVxuICBERUJVRzogMCxcbiAgSU5GTzogMSxcbiAgV0FSTjogMixcbiAgRVJST1I6IDMsXG4gIGxldmVsOiAxLFxuXG4gIC8vIENhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24gbG9nKGxldmVsLCBtZXNzYWdlKSB7XG4gICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBsb2dnZXIubGV2ZWwgPD0gbGV2ZWwpIHtcbiAgICAgIHZhciBtZXRob2QgPSBsb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIChjb25zb2xlW21ldGhvZF0gfHwgY29uc29sZS5sb2cpLmNhbGwoY29uc29sZSwgbWVzc2FnZSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0cy5sb2dnZXIgPSBsb2dnZXI7XG52YXIgbG9nID0gbG9nZ2VyLmxvZztcblxuZXhwb3J0cy5sb2cgPSBsb2c7XG5cbmZ1bmN0aW9uIGNyZWF0ZUZyYW1lKG9iamVjdCkge1xuICB2YXIgZnJhbWUgPSBVdGlscy5leHRlbmQoe30sIG9iamVjdCk7XG4gIGZyYW1lLl9wYXJlbnQgPSBvYmplY3Q7XG4gIHJldHVybiBmcmFtZTtcbn1cblxuLyogW2FyZ3MsIF1vcHRpb25zICovIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbmZ1bmN0aW9uIEV4Y2VwdGlvbihtZXNzYWdlLCBub2RlKSB7XG4gIHZhciBsb2MgPSBub2RlICYmIG5vZGUubG9jLFxuICAgICAgbGluZSA9IHVuZGVmaW5lZCxcbiAgICAgIGNvbHVtbiA9IHVuZGVmaW5lZDtcbiAgaWYgKGxvYykge1xuICAgIGxpbmUgPSBsb2Muc3RhcnQubGluZTtcbiAgICBjb2x1bW4gPSBsb2Muc3RhcnQuY29sdW1uO1xuXG4gICAgbWVzc2FnZSArPSAnIC0gJyArIGxpbmUgKyAnOicgKyBjb2x1bW47XG4gIH1cblxuICB2YXIgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgbWVzc2FnZSk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG5cbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgRXhjZXB0aW9uKTtcbiAgfVxuXG4gIGlmIChsb2MpIHtcbiAgICB0aGlzLmxpbmVOdW1iZXIgPSBsaW5lO1xuICAgIHRoaXMuY29sdW1uID0gY29sdW1uO1xuICB9XG59XG5cbkV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gRXhjZXB0aW9uO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuLypnbG9iYWwgd2luZG93ICovXG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uIChIYW5kbGViYXJzKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHZhciByb290ID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3csXG4gICAgICAkSGFuZGxlYmFycyA9IHJvb3QuSGFuZGxlYmFycztcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgSGFuZGxlYmFycy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChyb290LkhhbmRsZWJhcnMgPT09IEhhbmRsZWJhcnMpIHtcbiAgICAgIHJvb3QuSGFuZGxlYmFycyA9ICRIYW5kbGViYXJzO1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkID0gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5jaGVja1JldmlzaW9uID0gY2hlY2tSZXZpc2lvbjtcblxuLy8gVE9ETzogUmVtb3ZlIHRoaXMgbGluZSBhbmQgYnJlYWsgdXAgY29tcGlsZVBhcnRpYWxcblxuZXhwb3J0cy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuZXhwb3J0cy53cmFwUHJvZ3JhbSA9IHdyYXBQcm9ncmFtO1xuZXhwb3J0cy5yZXNvbHZlUGFydGlhbCA9IHJlc29sdmVQYXJ0aWFsO1xuZXhwb3J0cy5pbnZva2VQYXJ0aWFsID0gaW52b2tlUGFydGlhbDtcbmV4cG9ydHMubm9vcCA9IG5vb3A7XG5cbnZhciBfaW1wb3J0ID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgVXRpbHMgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfaW1wb3J0KTtcblxudmFyIF9FeGNlcHRpb24gPSByZXF1aXJlKCcuL2V4Y2VwdGlvbicpO1xuXG52YXIgX0V4Y2VwdGlvbjIgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfRXhjZXB0aW9uKTtcblxudmFyIF9DT01QSUxFUl9SRVZJU0lPTiRSRVZJU0lPTl9DSEFOR0VTJGNyZWF0ZUZyYW1lID0gcmVxdWlyZSgnLi9iYXNlJyk7XG5cbmZ1bmN0aW9uIGNoZWNrUmV2aXNpb24oY29tcGlsZXJJbmZvKSB7XG4gIHZhciBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvICYmIGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgY3VycmVudFJldmlzaW9uID0gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuQ09NUElMRVJfUkVWSVNJT047XG5cbiAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgIGlmIChjb21waWxlclJldmlzaW9uIDwgY3VycmVudFJldmlzaW9uKSB7XG4gICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gX0NPTVBJTEVSX1JFVklTSU9OJFJFVklTSU9OX0NIQU5HRVMkY3JlYXRlRnJhbWUuUkVWSVNJT05fQ0hBTkdFU1tjdXJyZW50UmV2aXNpb25dLFxuICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5SRVZJU0lPTl9DSEFOR0VTW2NvbXBpbGVyUmV2aXNpb25dO1xuICAgICAgdGhyb3cgbmV3IF9FeGNlcHRpb24yWydkZWZhdWx0J10oJ1RlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuICcgKyAnUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIHJ1bnRpbWVWZXJzaW9ucyArICcpIG9yIGRvd25ncmFkZSB5b3VyIHJ1bnRpbWUgdG8gYW4gb2xkZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVyVmVyc2lvbnMgKyAnKS4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVXNlIHRoZSBlbWJlZGRlZCB2ZXJzaW9uIGluZm8gc2luY2UgdGhlIHJ1bnRpbWUgZG9lc24ndCBrbm93IGFib3V0IHRoaXMgcmV2aXNpb24geWV0XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiAnICsgJ1BsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVySW5mb1sxXSArICcpLicpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0ZW1wbGF0ZSh0ZW1wbGF0ZVNwZWMsIGVudikge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpZiAoIWVudikge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdObyBlbnZpcm9ubWVudCBwYXNzZWQgdG8gdGVtcGxhdGUnKTtcbiAgfVxuICBpZiAoIXRlbXBsYXRlU3BlYyB8fCAhdGVtcGxhdGVTcGVjLm1haW4pIHtcbiAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnVW5rbm93biB0ZW1wbGF0ZSBvYmplY3Q6ICcgKyB0eXBlb2YgdGVtcGxhdGVTcGVjKTtcbiAgfVxuXG4gIC8vIE5vdGU6IFVzaW5nIGVudi5WTSByZWZlcmVuY2VzIHJhdGhlciB0aGFuIGxvY2FsIHZhciByZWZlcmVuY2VzIHRocm91Z2hvdXQgdGhpcyBzZWN0aW9uIHRvIGFsbG93XG4gIC8vIGZvciBleHRlcm5hbCB1c2VycyB0byBvdmVycmlkZSB0aGVzZSBhcyBwc3VlZG8tc3VwcG9ydGVkIEFQSXMuXG4gIGVudi5WTS5jaGVja1JldmlzaW9uKHRlbXBsYXRlU3BlYy5jb21waWxlcik7XG5cbiAgZnVuY3Rpb24gaW52b2tlUGFydGlhbFdyYXBwZXIocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmhhc2gpIHtcbiAgICAgIGNvbnRleHQgPSBVdGlscy5leHRlbmQoe30sIGNvbnRleHQsIG9wdGlvbnMuaGFzaCk7XG4gICAgfVxuXG4gICAgcGFydGlhbCA9IGVudi5WTS5yZXNvbHZlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIHZhciByZXN1bHQgPSBlbnYuVk0uaW52b2tlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuXG4gICAgaWYgKHJlc3VsdCA9PSBudWxsICYmIGVudi5jb21waWxlKSB7XG4gICAgICBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV0gPSBlbnYuY29tcGlsZShwYXJ0aWFsLCB0ZW1wbGF0ZVNwZWMuY29tcGlsZXJPcHRpb25zLCBlbnYpO1xuICAgICAgcmVzdWx0ID0gb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcbiAgICAgIGlmIChvcHRpb25zLmluZGVudCkge1xuICAgICAgICB2YXIgbGluZXMgPSByZXN1bHQuc3BsaXQoJ1xcbicpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpbmVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmICghbGluZXNbaV0gJiYgaSArIDEgPT09IGwpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpbmVzW2ldID0gb3B0aW9ucy5pbmRlbnQgKyBsaW5lc1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUaGUgcGFydGlhbCAnICsgb3B0aW9ucy5uYW1lICsgJyBjb3VsZCBub3QgYmUgY29tcGlsZWQgd2hlbiBydW5uaW5nIGluIHJ1bnRpbWUtb25seSBtb2RlJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICBzdHJpY3Q6IGZ1bmN0aW9uIHN0cmljdChvYmosIG5hbWUpIHtcbiAgICAgIGlmICghKG5hbWUgaW4gb2JqKSkge1xuICAgICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnXCInICsgbmFtZSArICdcIiBub3QgZGVmaW5lZCBpbiAnICsgb2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmpbbmFtZV07XG4gICAgfSxcbiAgICBsb29rdXA6IGZ1bmN0aW9uIGxvb2t1cChkZXB0aHMsIG5hbWUpIHtcbiAgICAgIHZhciBsZW4gPSBkZXB0aHMubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoZGVwdGhzW2ldICYmIGRlcHRoc1tpXVtuYW1lXSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGRlcHRoc1tpXVtuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbGFtYmRhOiBmdW5jdGlvbiBsYW1iZGEoY3VycmVudCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBjdXJyZW50ID09PSAnZnVuY3Rpb24nID8gY3VycmVudC5jYWxsKGNvbnRleHQpIDogY3VycmVudDtcbiAgICB9LFxuXG4gICAgZXNjYXBlRXhwcmVzc2lvbjogVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICBpbnZva2VQYXJ0aWFsOiBpbnZva2VQYXJ0aWFsV3JhcHBlcixcblxuICAgIGZuOiBmdW5jdGlvbiBmbihpKSB7XG4gICAgICByZXR1cm4gdGVtcGxhdGVTcGVjW2ldO1xuICAgIH0sXG5cbiAgICBwcm9ncmFtczogW10sXG4gICAgcHJvZ3JhbTogZnVuY3Rpb24gcHJvZ3JhbShpLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgICB2YXIgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldLFxuICAgICAgICAgIGZuID0gdGhpcy5mbihpKTtcbiAgICAgIGlmIChkYXRhIHx8IGRlcHRocyB8fCBibG9ja1BhcmFtcyB8fCBkZWNsYXJlZEJsb2NrUGFyYW1zKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4sIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb2dyYW1XcmFwcGVyO1xuICAgIH0sXG5cbiAgICBkYXRhOiBmdW5jdGlvbiBkYXRhKHZhbHVlLCBkZXB0aCkge1xuICAgICAgd2hpbGUgKHZhbHVlICYmIGRlcHRoLS0pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5fcGFyZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG4gICAgbWVyZ2U6IGZ1bmN0aW9uIG1lcmdlKHBhcmFtLCBjb21tb24pIHtcbiAgICAgIHZhciBvYmogPSBwYXJhbSB8fCBjb21tb247XG5cbiAgICAgIGlmIChwYXJhbSAmJiBjb21tb24gJiYgcGFyYW0gIT09IGNvbW1vbikge1xuICAgICAgICBvYmogPSBVdGlscy5leHRlbmQoe30sIGNvbW1vbiwgcGFyYW0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG5cbiAgICBub29wOiBlbnYuVk0ubm9vcCxcbiAgICBjb21waWxlckluZm86IHRlbXBsYXRlU3BlYy5jb21waWxlclxuICB9O1xuXG4gIGZ1bmN0aW9uIHJldChjb250ZXh0KSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgdmFyIGRhdGEgPSBvcHRpb25zLmRhdGE7XG5cbiAgICByZXQuX3NldHVwKG9wdGlvbnMpO1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsICYmIHRlbXBsYXRlU3BlYy51c2VEYXRhKSB7XG4gICAgICBkYXRhID0gaW5pdERhdGEoY29udGV4dCwgZGF0YSk7XG4gICAgfVxuICAgIHZhciBkZXB0aHMgPSB1bmRlZmluZWQsXG4gICAgICAgIGJsb2NrUGFyYW1zID0gdGVtcGxhdGVTcGVjLnVzZUJsb2NrUGFyYW1zID8gW10gOiB1bmRlZmluZWQ7XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VEZXB0aHMpIHtcbiAgICAgIGRlcHRocyA9IG9wdGlvbnMuZGVwdGhzID8gW2NvbnRleHRdLmNvbmNhdChvcHRpb25zLmRlcHRocykgOiBbY29udGV4dF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRlbXBsYXRlU3BlYy5tYWluLmNhbGwoY29udGFpbmVyLCBjb250ZXh0LCBjb250YWluZXIuaGVscGVycywgY29udGFpbmVyLnBhcnRpYWxzLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgfVxuICByZXQuaXNUb3AgPSB0cnVlO1xuXG4gIHJldC5fc2V0dXAgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsKSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLmhlbHBlcnMsIGVudi5oZWxwZXJzKTtcblxuICAgICAgaWYgKHRlbXBsYXRlU3BlYy51c2VQYXJ0aWFsKSB7XG4gICAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLnBhcnRpYWxzLCBlbnYucGFydGlhbHMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IG9wdGlvbnMuaGVscGVycztcbiAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IG9wdGlvbnMucGFydGlhbHM7XG4gICAgfVxuICB9O1xuXG4gIHJldC5fY2hpbGQgPSBmdW5jdGlvbiAoaSwgZGF0YSwgYmxvY2tQYXJhbXMsIGRlcHRocykge1xuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlQmxvY2tQYXJhbXMgJiYgIWJsb2NrUGFyYW1zKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnbXVzdCBwYXNzIGJsb2NrIHBhcmFtcycpO1xuICAgIH1cbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocyAmJiAhZGVwdGhzKSB7XG4gICAgICB0aHJvdyBuZXcgX0V4Y2VwdGlvbjJbJ2RlZmF1bHQnXSgnbXVzdCBwYXNzIHBhcmVudCBkZXB0aHMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gd3JhcFByb2dyYW0oY29udGFpbmVyLCBpLCB0ZW1wbGF0ZVNwZWNbaV0sIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIGZuLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gIGZ1bmN0aW9uIHByb2coY29udGV4dCkge1xuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIHJldHVybiBmbi5jYWxsKGNvbnRhaW5lciwgY29udGV4dCwgY29udGFpbmVyLmhlbHBlcnMsIGNvbnRhaW5lci5wYXJ0aWFscywgb3B0aW9ucy5kYXRhIHx8IGRhdGEsIGJsb2NrUGFyYW1zICYmIFtvcHRpb25zLmJsb2NrUGFyYW1zXS5jb25jYXQoYmxvY2tQYXJhbXMpLCBkZXB0aHMgJiYgW2NvbnRleHRdLmNvbmNhdChkZXB0aHMpKTtcbiAgfVxuICBwcm9nLnByb2dyYW0gPSBpO1xuICBwcm9nLmRlcHRoID0gZGVwdGhzID8gZGVwdGhzLmxlbmd0aCA6IDA7XG4gIHByb2cuYmxvY2tQYXJhbXMgPSBkZWNsYXJlZEJsb2NrUGFyYW1zIHx8IDA7XG4gIHJldHVybiBwcm9nO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIGlmICghcGFydGlhbCkge1xuICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV07XG4gIH0gZWxzZSBpZiAoIXBhcnRpYWwuY2FsbCAmJiAhb3B0aW9ucy5uYW1lKSB7XG4gICAgLy8gVGhpcyBpcyBhIGR5bmFtaWMgcGFydGlhbCB0aGF0IHJldHVybmVkIGEgc3RyaW5nXG4gICAgb3B0aW9ucy5uYW1lID0gcGFydGlhbDtcbiAgICBwYXJ0aWFsID0gb3B0aW9ucy5wYXJ0aWFsc1twYXJ0aWFsXTtcbiAgfVxuICByZXR1cm4gcGFydGlhbDtcbn1cblxuZnVuY3Rpb24gaW52b2tlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMucGFydGlhbCA9IHRydWU7XG5cbiAgaWYgKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBfRXhjZXB0aW9uMlsnZGVmYXVsdCddKCdUaGUgcGFydGlhbCAnICsgb3B0aW9ucy5uYW1lICsgJyBjb3VsZCBub3QgYmUgZm91bmQnKTtcbiAgfSBlbHNlIGlmIChwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBub29wKCkge1xuICByZXR1cm4gJyc7XG59XG5cbmZ1bmN0aW9uIGluaXREYXRhKGNvbnRleHQsIGRhdGEpIHtcbiAgaWYgKCFkYXRhIHx8ICEoJ3Jvb3QnIGluIGRhdGEpKSB7XG4gICAgZGF0YSA9IGRhdGEgPyBfQ09NUElMRVJfUkVWSVNJT04kUkVWSVNJT05fQ0hBTkdFUyRjcmVhdGVGcmFtZS5jcmVhdGVGcmFtZShkYXRhKSA6IHt9O1xuICAgIGRhdGEucm9vdCA9IGNvbnRleHQ7XG4gIH1cbiAgcmV0dXJuIGRhdGE7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuLy8gQnVpbGQgb3V0IG91ciBiYXNpYyBTYWZlU3RyaW5nIHR5cGVcbmZ1bmN0aW9uIFNhZmVTdHJpbmcoc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufVxuXG5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IFNhZmVTdHJpbmcucHJvdG90eXBlLnRvSFRNTCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICcnICsgdGhpcy5zdHJpbmc7XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTYWZlU3RyaW5nO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5leHRlbmQgPSBleHRlbmQ7XG5cbi8vIE9sZGVyIElFIHZlcnNpb25zIGRvIG5vdCBkaXJlY3RseSBzdXBwb3J0IGluZGV4T2Ygc28gd2UgbXVzdCBpbXBsZW1lbnQgb3VyIG93biwgc2FkbHkuXG5leHBvcnRzLmluZGV4T2YgPSBpbmRleE9mO1xuZXhwb3J0cy5lc2NhcGVFeHByZXNzaW9uID0gZXNjYXBlRXhwcmVzc2lvbjtcbmV4cG9ydHMuaXNFbXB0eSA9IGlzRW1wdHk7XG5leHBvcnRzLmJsb2NrUGFyYW1zID0gYmxvY2tQYXJhbXM7XG5leHBvcnRzLmFwcGVuZENvbnRleHRQYXRoID0gYXBwZW5kQ29udGV4dFBhdGg7XG52YXIgZXNjYXBlID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gICdcXCcnOiAnJiN4Mjc7JyxcbiAgJ2AnOiAnJiN4NjA7J1xufTtcblxudmFyIGJhZENoYXJzID0gL1smPD5cIidgXS9nLFxuICAgIHBvc3NpYmxlID0gL1smPD5cIidgXS87XG5cbmZ1bmN0aW9uIGVzY2FwZUNoYXIoY2hyKSB7XG4gIHJldHVybiBlc2NhcGVbY2hyXTtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kKG9iaiAvKiAsIC4uLnNvdXJjZSAqLykge1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGtleSBpbiBhcmd1bWVudHNbaV0pIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXJndW1lbnRzW2ldLCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuZXhwb3J0cy50b1N0cmluZyA9IHRvU3RyaW5nO1xuLy8gU291cmNlZCBmcm9tIGxvZGFzaFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Jlc3RpZWpzL2xvZGFzaC9ibG9iL21hc3Rlci9MSUNFTlNFLnR4dFxuLyplc2xpbnQtZGlzYWJsZSBmdW5jLXN0eWxlLCBuby12YXIgKi9cbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufTtcbi8vIGZhbGxiYWNrIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBDaHJvbWUgYW5kIFNhZmFyaVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmIChpc0Z1bmN0aW9uKC94LykpIHtcbiAgZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG4gIH07XG59XG52YXIgaXNGdW5jdGlvbjtcbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG4vKmVzbGludC1lbmFibGUgZnVuYy1zdHlsZSwgbm8tdmFyICovXG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnID8gdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScgOiBmYWxzZTtcbn07ZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgdmFsdWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGFycmF5W2ldID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlRXhwcmVzc2lvbihzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgJiYgc3RyaW5nLnRvSFRNTCkge1xuICAgICAgcmV0dXJuIHN0cmluZy50b0hUTUwoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nICsgJyc7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmc7XG4gIH1cblxuICBpZiAoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkge1xuICAgIHJldHVybiBzdHJpbmc7XG4gIH1cbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbn1cblxuZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGJsb2NrUGFyYW1zKHBhcmFtcywgaWRzKSB7XG4gIHBhcmFtcy5wYXRoID0gaWRzO1xuICByZXR1cm4gcGFyYW1zO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRDb250ZXh0UGF0aChjb250ZXh0UGF0aCwgaWQpIHtcbiAgcmV0dXJuIChjb250ZXh0UGF0aCA/IGNvbnRleHRQYXRoICsgJy4nIDogJycpICsgaWQ7XG59IiwiLy8gQ3JlYXRlIGEgc2ltcGxlIHBhdGggYWxpYXMgdG8gYWxsb3cgYnJvd3NlcmlmeSB0byByZXNvbHZlXG4vLyB0aGUgcnVudGltZSBvbiBhIHN1cHBvcnRlZCBwYXRoLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Rpc3QvY2pzL2hhbmRsZWJhcnMucnVudGltZScpWydkZWZhdWx0J107XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJoYW5kbGViYXJzL3J1bnRpbWVcIilbXCJkZWZhdWx0XCJdO1xuIiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZ3VyYXRpb24uanMnKTtcclxuXHJcbnZhciBBY3Rpb25zTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG5cdHVybFJvb3Q6IGNvbmZpZy51cmwgKyAnQWN0aW9uLydcclxufSk7XHJcbm1vZHVsZS5leHBvcnRzID0gQWN0aW9uc01vZGVsOyIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcbnZhciBBY3Rpb25zTW9kZWwgPSByZXF1aXJlKCcuL0FjdGlvbicpO1xyXG5cclxudmFyIEFjdGlvbnNDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xyXG5cdG1vZGVsOiBBY3Rpb25zTW9kZWwsXHJcblx0dXJsOiBjb25maWcudXJsICsgJ0FjdGlvbi8nXHJcbn0pO1xyXG5cclxuIG1vZHVsZS5leHBvcnRzID0gQWN0aW9uc0NvbGxlY3Rpb247IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZ3VyYXRpb24uanMnKTtcclxuXHJcbnZhciBBcHByZW5hbnRzTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG5cdHVybFJvb3Q6IGNvbmZpZy51cmwgKyAnQXBwcmVuYW50LydcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFwcHJlbmFudHNNb2RlbDsiLCJ2YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vLi4vY29uZmlndXJhdGlvbi5qcycpO1xyXG52YXIgQXBwcmVuYW50c01vZGVsID0gcmVxdWlyZSgnLi9BcHByZW5hbnQnKTtcclxuXHJcbnZhciBBcHByZW5hbnRzQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcclxuXHRtb2RlbDogQXBwcmVuYW50c01vZGVsLFxyXG5cdHVybDogY29uZmlnLnVybCArICdBcHByZW5hbnQvJ1xyXG59KTtcclxuXHJcbiBtb2R1bGUuZXhwb3J0cyA9IEFwcHJlbmFudHNDb2xsZWN0aW9uOyIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcblxyXG52YXIgRXN0X2Fzc29jaWVNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblx0dXJsUm9vdDogY29uZmlnLnVybCArICdFc3RBc3NvY2llLydcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVzdF9hc3NvY2llTW9kZWw7IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZ3VyYXRpb24uanMnKTtcclxuXHJcbnZhciBFdmFsdWF0aW9uTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRXZhbHVhdGlvbk1vZGVsOyIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcblxyXG52YXIgRml4ZU1vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuXHR1cmxSb290OiBjb25maWcudXJsICsgJ01pc3Npb24vJ1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRml4ZU1vZGVsOyIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcblxyXG52YXIgRml4ZU1vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuXHR1cmxSb290OiBjb25maWcudXJsICsgJ0ZpeGUvJ1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRml4ZU1vZGVsOyIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcblxyXG52YXIgSW5kaWNhdGV1cnNNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblx0dXJsUm9vdDogY29uZmlnLnVybCArICdJbmRpY2F0ZXVyLydcclxufSk7XHJcbm1vZHVsZS5leHBvcnRzID0gSW5kaWNhdGV1cnNNb2RlbDsiLCJ2YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vLi4vY29uZmlndXJhdGlvbi5qcycpO1xyXG52YXIgSW5kaWNhdGV1cnNNb2RlbCA9IHJlcXVpcmUoJy4vSW5kaWNhdGV1cicpO1xyXG5cclxudmFyIEluZGljYXRldXJzQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcclxuXHRtb2RlbDogSW5kaWNhdGV1cnNNb2RlbCxcclxuXHR1cmw6IGNvbmZpZy51cmwgKyAnSW5kaWNhdGV1ci8nXHJcbn0pO1xyXG5cclxuIG1vZHVsZS5leHBvcnRzID0gSW5kaWNhdGV1cnNDb2xsZWN0aW9uOyIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcblxyXG52YXIgSmV1eE1vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuXHR1cmxSb290OiBjb25maWcudXJsICsgJ0pldS8nXHJcbn0pO1xyXG5tb2R1bGUuZXhwb3J0cyA9IEpldXhNb2RlbDsiLCJ2YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vLi4vY29uZmlndXJhdGlvbi5qcycpO1xyXG52YXIgSmV1eE1vZGVsID0gcmVxdWlyZSgnLi9KZXUnKTtcclxuXHJcbnZhciBKZXV4Q29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcclxuXHRtb2RlbDogSmV1eE1vZGVsLFxyXG5cdHVybDogY29uZmlnLnVybCArICdKZXUvJ1xyXG59KTtcclxuXHJcbiBtb2R1bGUuZXhwb3J0cyA9IEpldXhDb2xsZWN0aW9uOyIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcblxyXG52YXIgTWlzc2lvbnNNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblx0dXJsUm9vdDogY29uZmlnLnVybCsgJ01pc3Npb24vJ1xyXG59KTtcclxubW9kdWxlLmV4cG9ydHMgPSBNaXNzaW9uc01vZGVsOyIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcblxyXG52YXIgT2JqZWN0aWZzTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG5cdHVybFJvb3Q6IGNvbmZpZy51cmwgKyAnT2JqZWN0aWYvJ1xyXG59KTtcclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3RpZnNNb2RlbDsiLCJ2YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vLi4vY29uZmlndXJhdGlvbi5qcycpO1xyXG52YXIgT2JqZWN0aWZzTW9kZWwgPSByZXF1aXJlKCcuL09iamVjdGlmJyk7XHJcblxyXG52YXIgT2JqZWN0aWZNaXNzaW9uQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcclxuXHRtb2RlbDogT2JqZWN0aWZzTW9kZWwsXHJcblx0dXJsOiBjb25maWcudXJsXHJcbn0pO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdGlmTWlzc2lvbkNvbGxlY3Rpb247IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZ3VyYXRpb24uanMnKTtcclxudmFyIE9iamVjdGlmc01vZGVsID0gcmVxdWlyZSgnLi9PYmplY3RpZicpO1xyXG5cclxudmFyIE9iamVjdGlmc0NvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XHJcblx0bW9kZWw6IE9iamVjdGlmc01vZGVsLFxyXG5cdHVybDogY29uZmlnLnVybCArICdPYmplY3RpZi8nXHJcbn0pO1xyXG5cclxuIG1vZHVsZS5leHBvcnRzID0gT2JqZWN0aWZzQ29sbGVjdGlvbjsiLCJ2YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vLi4vY29uZmlndXJhdGlvbi5qcycpO1xyXG5cclxudmFyIFBvc3NlZGVNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblx0dXJsUm9vdDogY29uZmlnLnVybCArICdQb3NzZWRlLydcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBvc3NlZGVNb2RlbDsiLCJ2YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vLi4vY29uZmlndXJhdGlvbi5qcycpO1xyXG5cclxudmFyIFJlZ2xlc01vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuXHR1cmxSb290OiBjb25maWcudXJsICsgJ1JlZ2xlLycvKixcclxuXHR1cmw6IGNvbmZpZy51cmwgKyAnUmVnbGUvJyovXHJcbn0pO1xyXG5tb2R1bGUuZXhwb3J0cyA9IFJlZ2xlc01vZGVsOyIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi8uLi9jb25maWd1cmF0aW9uLmpzJyk7XHJcbnZhciBSZWdsZXNNb2RlbCA9IHJlcXVpcmUoJy4vUmVnbGUnKTtcclxuXHJcbnZhciBSZWdsZXNDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xyXG5cdG1vZGVsOiBSZWdsZXNNb2RlbCxcclxuXHR1cmw6IGNvbmZpZy51cmwgKyAnUmVnbGUvJ1xyXG59KTtcclxuXHJcbiBtb2R1bGUuZXhwb3J0cyA9IFJlZ2xlc0NvbGxlY3Rpb247IiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcImp1bWJvdHJvblxcXCI+XFxyXFxuXHQ8cD5CaWVudmVudWUgc3VyIGwnYXBwbGljYXRpb24gZCfDqXZhbHVhdGlvbiBkZXMgYXBwcmVudGlzIHBpbG90ZS48L3A+XFxyXFxuXHQ8cD48YSBocmVmPVxcXCIjQXBwcmVuYW50c1xcXCI+Q29tbWVuY2V6IMOgIMOpdmFsdWVyIHVuIGFwcHJlbmFudC48L2E+PC9wPlxcclxcblx0PHA+Vm91cyBwb3V2ZXogw6lnYWxlbWVudCBtb2RpZmllciBsZXMgamV1eCBkJ8OpdmFsdWF0aW9uIGV0IGxldXJzIHNvdXMgw6lsw6ltZW50cy48L3A+XFxyXFxuXHQ8cD48aT5cXFwiRmx5IHNhZmUgIVxcXCI8L2k+IFNjb3R0IE1hbmxleTwvcD5cXHJcXG48L2Rpdj5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIHRlbXBsYXRlID0gcmVxdWlyZShcIi4vQWNjdWVpbC5oYnNcIik7XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cdHRpdGxlIDogJCgnI3RpdGxlJyksXHJcblxyXG5cdC8vQXBwZWzDqSBhdSBtb21lbnQgZGUgbCdpbnN0YW5jaWF0aW9uXHRcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdC8vRm9uY3Rpb24gY2hhcmfDqWUgZHUgcmVuZHVcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJQcm9qZXQgcGVybWlzIHBpc3RlXCIpO1xyXG5cdFx0JCh0aGlzLmNvbnRlbnQpLmh0bWwodGVtcGxhdGUoKSk7XHJcblx0fVxyXG59KTsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIlx0XHRcdFx0XHRcdDx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiIGlkPVxcXCJ0YWJSZWdsZVxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0XHQ8dGhlYWQ+XFxyXFxuXHRcdFx0XHRcdFx0XHRcdDx0cj5cXHJcXG5cdFx0XHRcdFx0XHRcdFx0XHQ8dGg+SWRlbnRpZmlhbnQ8L3RoPlxcclxcblx0XHRcdFx0XHRcdFx0XHRcdDx0aD5MaWJlbGzDqTwvdGg+XFxyXFxuXHRcdFx0XHRcdFx0XHRcdFx0PHRoPjwvdGg+XFxyXFxuXHRcdFx0XHRcdFx0XHRcdDwvdHI+XFxyXFxuXHRcdFx0XHRcdFx0XHQ8L3RoZWFkPlxcclxcblx0XHRcdFx0XHRcdFx0PHRib2R5PlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucmVnbGVzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgyLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXHRcdFx0XHRcdFx0XHQ8L3Rib2R5Plxcclxcblx0XHRcdFx0XHRcdDwvdGFibGU+XFxyXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXHRcdFx0XHRcdFx0XHRcdFx0PHRyIG9uQ2xpY2s9XFxcImRvY3VtZW50LmxvY2F0aW9uPScjUmVnbGVzL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bXJlZ2xlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiJ1xcXCI+XFxyXFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtcmVnbGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPjx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJyZWdsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHRcdFx0XHRcdFx0PC90cj5cXHJcXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPHRhYmxlIGNsYXNzPVxcXCJ0YWJsZVxcXCI+XFxyXFxuXHQ8dGhlYWQ+XFxyXFxuXHRcdDx0cj5cXHJcXG5cdFx0XHQ8dGg+SWRlbnRpZmlhbnQ8L3RoPlxcclxcblx0XHRcdDx0aD5JRCBBY3Rpb24gUmVxdWlzZTwvdGg+XFxyXFxuXHRcdFx0PHRoPkxpYmVsbMOpIEFjdGlvbjwvdGg+XFxyXFxuXHRcdFx0PHRoPlNjb3JlIG1pbjwvdGg+XFxyXFxuXHRcdFx0PHRoPlJlZ2xlczwvdGg+XFxyXFxuXHRcdFx0PHRoPjwvdGg+XFxyXFxuXHRcdDwvdHI+XFxyXFxuXHQ8L3RoZWFkPlxcclxcblx0PHRib2R5Plxcclxcblx0XHRcdDx0cj5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hY3Rpb24gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYWN0aW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hY3ROdW1hY3Rpb24gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFjdGlvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGliYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hY3Rpb24gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNjb3JlbWluIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5yZWdsZXMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImlmXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXHRcdFx0XHQ8L3RkPlxcclxcblx0XHRcdFx0PHRkPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjQWN0aW9ucy9Nb2RpZmllci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hY3Rpb24gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPlxcclxcblx0XHRcdFx0XHQ8L2E+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNBY3Rpb25zL1N1cHByaW1lci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hY3Rpb24gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdDwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cdDwvdGJvZHk+XFxyXFxuPC90YWJsZT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIGFjdGlvbk1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvQWN0aW9ucy9BY3Rpb24nKTtcclxudmFyIHJlZ2xlTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9SZWdsZXMvUmVnbGUnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9BY3Rpb24uaGJzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0dGl0bGUgOiAkKCcjdGl0bGUnKSxcclxuXHRjb250ZW50IDogJCgnI2NvbnRlbnQnKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IHJlZ2xlTW9kZWwoKTtcclxuXHRcdG1vZGVsLnVybCA9IG1vZGVsLnVybFJvb3QrJy9BY3Rpb24vJytpZDtcclxuXHJcblx0XHQkLndoZW4oIG5ldyBhY3Rpb25Nb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goKSxtb2RlbC5mZXRjaCgpKVxyXG5cdFx0LmRvbmUoXy5iaW5kKGZ1bmN0aW9uKG9iamVjdGlmLGFjdGlvbnMpe1xyXG5cdFx0XHR0aGlzLnJlbmRlclJlc3VsdGF0KG9iamVjdGlmLGFjdGlvbnMpO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0XHQkKHRoaXMucGFnZU5hbWUpLmh0bWwoXCJEw6l0YWlsIEFjdGlvblwiKTtcclxuXHRcdCQodGhpcy50aXRsZSkuaHRtbChcIkluZm9ybWF0aW9ucyBBY3Rpb25cIik7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlc3BvbnNlLCByZXNwb25zZVJlZ2xlcyl7XHJcblxyXG5cdFx0Ly8gUmVmYWN0b3JpbmcgbGlzdCBkZXMgcsOoZ2xlIHBvdXIgcXVlIMOnYSBzb2l0IHBsdXMgbGlzaWJsZVxyXG5cdFx0dmFyIFJlZ2xlID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuXHQgIFx0fSk7XHJcblx0XHR2YXIgQ29sbGVjdGlvblJlZ2xlID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xyXG5cdFx0ICBtb2RlbDogUmVnbGVcclxuXHRcdH0pO1xyXG5cdFx0dmFyIGNvdW50ID0gMDtcclxuXHRcdHZhciBsaXN0UmVnbGUgPSBuZXcgQ29sbGVjdGlvblJlZ2xlKCk7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8ICByZXNwb25zZVJlZ2xlc1swXS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHR2YXIgcmVnbGUgPSBuZXcgUmVnbGUocmVzcG9uc2VSZWdsZXNbMF1baV1bMF0pO1xyXG5cdFx0XHRsaXN0UmVnbGUuYWRkKFtyZWdsZV0pO1xyXG5cdFx0XHRjb3VudCsrO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFBhc3NlIGxlcyDDqWzDqW1lbnQgw6AgbGEgdnVlXHJcblx0XHRpZihjb3VudCAhPT0wICl7XHJcblx0XHRcdCQodGhpcy5jb250ZW50KS5odG1sKHRlbXBsYXRlKHthY3Rpb246IHJlc3BvbnNlWzBdLCByZWdsZXM6bGlzdFJlZ2xlLm1vZGVsc30pKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZSh7YWN0aW9uOiByZXNwb25zZVswXX0pKTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT10aGlzLmxhbWJkYSwgYWxpYXMyPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdFx0XHQ8dHIgb25DbGljaz1cXFwiZG9jdW1lbnQubG9jYXRpb249JyNBY3Rpb25zL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIidcXFwiPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuYWN0TnVtYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJhY3Rpb24gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNjb3JlbWluIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cXHJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI0FjdGlvbnMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWxcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI0FjdGlvbnMvU3VwcHJpbWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdDwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIjxhIGhyZWY9XFxcIiNBY3Rpb25zL0Fqb3V0XFxcIj5cXHJcXG5cdDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1zdWNjZXNzXFxcIj5cXHJcXG5cdCAgPHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tcGx1c1xcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj4gQWpvdXRlciBBY3Rpb25cXHJcXG5cdDwvYnV0dG9uPlxcclxcbjwvYT5cXHJcXG5cXHJcXG48dGFibGUgY2xhc3M9XFxcInRhYmxlXFxcIj5cXHJcXG5cdDx0aGVhZD5cXHJcXG5cdFx0PHRyPlxcclxcblx0XHRcdDx0aD5JZGVudGlmaWFudDwvdGg+XFxyXFxuXHRcdFx0PHRoPklEIGFjdGlvbiByZXF1aXNlPC90aD5cXHJcXG5cdFx0XHQ8dGg+TGliZWxsw6k8L3RoPlxcclxcblx0XHRcdDx0aD5TY29yZSBtaW5pbWFsPC90aD5cXHJcXG5cdFx0XHQ8dGg+PC90aD5cXHJcXG5cdFx0PC90cj5cXHJcXG5cdDwvdGhlYWQ+XFxyXFxuXHQ8dGJvZHk+XFxyXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hY3Rpb25zIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXHQ8L3Rib2R5PlxcclxcbjwvdGFibGU+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBhY3Rpb25zTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9BY3Rpb25zL0FjdGlvbnNMaXN0Jyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vQWN0aW9ucy5oYnMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHBhZ2VOYW1lIDogJCgndGl0bGUnKSxcclxuXHR0aXRsZSA6ICQoJyN0aXRsZScpLFxyXG5cdGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHQvL0FwcGVsw6kgYXUgbW9tZW50IGRlIGwnaW5zdGFuY2lhdGlvblx0XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHR9LFxyXG5cclxuXHQvL0ZvbmN0aW9uIGNoYXJnw6llIGR1IHJlbmR1XHJcblx0cmVuZGVyOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IGFjdGlvbnNNb2RlbCgpLmZldGNoKHtcclxuXHRcdFx0c3VjY2VzczogXy5iaW5kKHRoaXMucmVuZGVyUmVzdWx0YXQsIHRoaXMpXHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5wYWdlTmFtZSkuaHRtbChcIkxpc3RlIGRlcyBBY3Rpb25zXCIpO1xyXG5cdFx0JCh0aGlzLnRpdGxlKS5odG1sKFwiTGlzdGUgZGVzIEFjdGlvbnNcIik7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdCQodGhpcy5jb250ZW50KS5odG1sKHRlbXBsYXRlKHthY3Rpb25zOiByZXNwb25zZS50b0FycmF5KCl9KSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCJ2YXIgYWN0aW9uTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9BY3Rpb25zL0FjdGlvbicpO1xyXG52YXIgcG9zc2VkZU1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvUG9zc2VkZS9Qb3NzZWRlJyk7XHJcbnZhciBtb2RhbCA9IHJlcXVpcmUoJy4uL0dsb2JhbC9tb2RhbC5qcycpO1xyXG5cclxudmFyIHZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcblx0cmVuZGVyOiBmdW5jdGlvbihpZCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgYWN0aW9uTW9kZWwoe1wiaWRcIjppZH0pLmZldGNoKHtcclxuXHRcdFx0c3VjY2VzczogXy5iaW5kKHRoaXMuY29uZmlybSx0aGlzKVxyXG5cdFx0fSk7XHJcblxyXG5cdH0sXHJcblxyXG5cdHJlbmRlclBvc3NlZGU6IGZ1bmN0aW9uKGlkLGlSZWdsZSl7XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJTdXBwcmVzc2lvblwiLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIkNvbmZpcm1lciBsYSBzdXBwcmVzc2lvblwiLFxyXG5cdFx0IFx0bW9kYWxGb290ZXI6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIGRhdGEtZGlzbWlzcz1cIm1vZGFsXCIgaWQ9XCJhbm51bERlbGV0ZVwiPkFubnVsZXI8L2J1dHRvbj48YSBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIGJ0bi1va1wiIGlkPVwiY29uZmlybURlbGV0ZVwiIGRhdGEtZGlzbWlzcz1cIm1vZGFsXCI+U3VwcHJpbWVyPC9hPidcclxuXHRcdH0pO1xyXG5cdFx0JCgnI2NvbmZpcm1EZWxldGUnKS5vbignY2xpY2snLF8uYmluZChmdW5jdGlvbihlKXtcclxuXHRcdFx0dmFyIG1vZGVsID0gbmV3IHBvc3NlZGVNb2RlbCh7XCJudW1hY3Rpb25cIjppZCwgXCJudW1yZWdsZVwiOmlSZWdsZX0pLmRlc3Ryb3koe1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLnZhbGlkLHRoaXMpLFxyXG5cdFx0XHRcdGVycm9yOiB0aGlzLnNob3dFcnJvck1vZGFsXHJcblx0XHRcdH0pO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0XHQkKCcjYW5udWxEZWxldGUnKS5vbignY2xpY2snLF8uYmluZChmdW5jdGlvbihlKXtcclxuXHRcdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI0FjdGlvbnMvTW9kaWZpZXIvJytpZCwge3RyaWdnZXI6dHJ1ZX0pO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0fSxcclxuXHJcblx0Y29uZmlybTpmdW5jdGlvbihhY3Rpb24pe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJDb25maXJtZXIgbGEgc3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsRm9vdGVyOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBkYXRhLWRpc21pc3M9XCJtb2RhbFwiIGlkPVwiYW5udWxEZWxldGVcIj5Bbm51bGVyPC9idXR0b24+PGEgY2xhc3M9XCJidG4gYnRuLWRhbmdlciBidG4tb2tcIiBpZD1cImNvbmZpcm1EZWxldGVcIiBkYXRhLWRpc21pc3M9XCJtb2RhbFwiPlN1cHByaW1lcjwvYT4nXHJcblx0XHR9KTtcclxuXHRcdCQoJyNjb25maXJtRGVsZXRlJykub24oJ2NsaWNrJyxfLmJpbmQoZnVuY3Rpb24oZSl7XHJcblx0XHRcdHZhciBtb2RlbCA9IG5ldyBhY3Rpb25Nb2RlbCh7XCJpZFwiOmFjdGlvbi5pZH0pLmRlc3Ryb3koe1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLnZhbGlkLHRoaXMpLFxyXG5cdFx0XHRcdGVycm9yOiB0aGlzLnNob3dFcnJvck1vZGFsXHJcblx0XHRcdH0pO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0XHQkKCcjYW5udWxEZWxldGUnKS5vbignY2xpY2snLF8uYmluZChmdW5jdGlvbihlKXtcclxuXHRcdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI0FjdGlvbnMnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0XHR9LHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHR2YWxpZDpmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJTdXBwcmVzc2lvbiBlZmZlY3XDqWVcIlxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdCQoJy5tb2RhbC1iYWNrZHJvcCcpLnJlbW92ZSgpO1xyXG5cdFx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcjQWN0aW9ucycsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHR9LFxyXG5cclxuXHRzaG93RXJyb3JNb2RhbDogZnVuY3Rpb24oZXJyb3Ipe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJFcnJldXIgbG9ycyBkZSBsYSBzdXBwcmVzc2lvbiA6IFwiICsgZXJyb3IsXHJcblx0XHQgXHRtb2RhbEVycm9yOiB0cnVlXHJcblx0XHR9KTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXIsIGFsaWFzMT1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMj1cImZ1bmN0aW9uXCIsIGFsaWFzMz10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5udW1hY3Rpb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm51bWFjdGlvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtYWN0aW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIj5cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubnVtYWN0aW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5udW1hY3Rpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm51bWFjdGlvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIgXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxpYmFjdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGliYWN0aW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJsaWJhY3Rpb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9vcHRpb24+XFxyXFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIiAgICAgIDx0cj5cXHJcXG4gICAgICAgIDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1yZWdsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYnJlZ2xlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD48dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuc2NvcmVtaW4gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcbiAgICAgICAgPHRkPjxhIGhyZWY9XFxcIiNSZWdsZXMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtcmVnbGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcclxcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG4gICAgICAgICAgPC9hPlxcclxcbiAgICAgIDwvdGQ+XFxyXFxuICAgICAgICA8dGQ+PGEgaHJlZj1cXFwiI0FjdGlvbnMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGhzWzFdICE9IG51bGwgPyBkZXB0aHNbMV0uYWN0aW9uIDogZGVwdGhzWzFdKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1hY3Rpb24gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCIvUmVnbGUvU3VwcHJpbWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bXJlZ2xlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXHJcXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXRyYXNoXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPlxcclxcbiAgICAgICAgICAgIDwvYT5cXHJcXG4gICAgICAgIDwvdGQ+XFxyXFxuICAgICAgPC90cj5cXHJcXG5cIjtcbn0sXCI1XCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBoZWxwZXIsIGFsaWFzMT1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMj1cImZ1bmN0aW9uXCIsIGFsaWFzMz10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bXJlZ2xlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5udW1yZWdsZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtcmVnbGVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5udW1yZWdsZSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtcmVnbGUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm51bXJlZ2xlXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiBcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGlicmVnbGUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmxpYnJlZ2xlIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJsaWJyZWdsZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L29wdGlvbj5cXHJcXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIiAgPGZvcm0gaWQ9XFxcImZvcm1QdXRBY3Rpb25cXFwiIG1ldGhvZD1cXFwicG9zdFxcXCI+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXHJcXG4gICA8bGFiZWwgZm9yPVxcXCJhY3ROdW1hY3Rpb25cXFwiPkFjdGlvbiByZXF1aXNlPC9sYWJlbD5cXHJcXG4gICAgPHNlbGVjdCAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgaWQ9XFxcImFjdE51bWFjdGlvblxcXCI+XFxyXFxuICAgICAgPG9wdGlvbiB2YWx1ZT1udWxsPiBBdWN1biA8L29wdGlvbj5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFjdGlvbnMgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDEsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgICAgPC9zZWxlY3Q+XFxyXFxuICA8L2Rpdj5cXHJcXG4gIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcclxcbiAgICA8bGFiZWwgZm9yPVxcXCJsaWJhY3Rpb25cXFwiPmxpYmFjdGlvbjwvbGFiZWw+XFxyXFxuICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIiBpZD1cXFwibGliYWN0aW9uXFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50cmV6IHVuIGxpYmVsbMOpXFxcIiB2YWx1ZT1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYWN0aW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJhY3Rpb24gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIHJlcXVpcmVkPlxcclxcbiAgPC9kaXY+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXHJcXG4gICAgPGxhYmVsIGZvcj1cXFwic2NvcmVtaW5cXFwiPnNjb3JlbWluPC9sYWJlbD5cXHJcXG4gICAgPGlucHV0IHR5cGU9XFxcIm51bWJlclxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgaWQ9XFxcInNjb3JlbWluXFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50cmV6IHVuIHNjb3JlIG1pbmltdW1cXFwiIHZhbHVlPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hY3Rpb24gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnNjb3JlbWluIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiByZXF1aXJlZD5cXHJcXG4gIDwvZGl2PiBcXHJcXG4gIDxidXR0b24gY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdFxcXCI+VmFsaWRlcjwvYnV0dG9uPlxcclxcbiAgPC9mb3JtPlxcclxcblxcclxcbiAgPGhyPlxcclxcblxcclxcbiAgPGxhYmVsIGZvcj1cXFwibnVtcmVnbGVcXFwiPkxpc3RlIGRlcyByw6hnbGVzIGRlIGwnYWN0aW9uPC9sYWJlbD5cXHJcXG4gIDx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiIGlkPVxcXCJ0YWJSZWdsZVxcXCI+XFxyXFxuICAgIDx0aGVhZD5cXHJcXG4gICAgICA8dHI+XFxyXFxuICAgICAgICA8dGg+SWRlbnRpZmlhbnQ8L3RoPlxcclxcbiAgICAgICAgPHRoPkxpYmVsbMOpPC90aD5cXHJcXG4gICAgICAgIDx0aD5TY29yZSBtaW5pbXVtPC90aD5cXHJcXG4gICAgICAgIDx0aD48L3RoPlxcclxcbiAgICAgIDwvdHI+XFxyXFxuICAgIDwvdGhlYWQ+XFxyXFxuICAgIDx0Ym9keT5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnJlZ2xlcyA6IGRlcHRoMCkse1wibmFtZVwiOlwiZWFjaFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMywgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAgICA8L3Rib2R5PlxcclxcbiAgPC90YWJsZT5cXHJcXG4gIDxmb3JtIGlkPVxcXCJmb3JtUHV0UmVnbGVcXFwiIG1ldGhvZD1cXFwicG9zdFxcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcclxcbiAgICAgPGxhYmVsIGZvcj1cXFwibnVtcmVnbGVcXFwiPkFqb3V0ZXIgdW5lIFLDqGdsZTwvbGFiZWw+XFxyXFxuICAgICAgPHNlbGVjdCAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgaWQ9XFxcIm51bXJlZ2xlXFxcIj5cXHJcXG4gICAgICAgIDxvcHRpb24gdmFsdWU9bnVsbD4gQXVjdW4gPC9vcHRpb24+XFxyXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5yZWdsZXNUb3QgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDUsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgICAgICA8L3NlbGVjdD5cXHJcXG4gICAgPC9kaXY+XFxyXFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdFxcXCI+QWpvdXRlcjwvYnV0dG9uPlxcclxcbiAgPC9mb3JtPlwiO1xufSxcInVzZURhdGFcIjp0cnVlLFwidXNlRGVwdGhzXCI6dHJ1ZX0pO1xuIiwidmFyIGFjdGlvbk1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvQWN0aW9ucy9BY3Rpb24nKTtcclxudmFyIGFjdGlvbnNNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0FjdGlvbnMvQWN0aW9uc0xpc3QnKTtcclxudmFyIHJlZ2xlc01vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvUmVnbGVzL1JlZ2xlc0xpc3QnKTtcclxudmFyIHJlZ2xlTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9SZWdsZXMvUmVnbGUnKTtcclxudmFyIHBvc3NlZGVNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL1Bvc3NlZGUvUG9zc2VkZScpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL1B1dEFjdGlvbi5oYnMnKTtcclxudmFyIG1vZGFsID0gcmVxdWlyZSgnLi4vR2xvYmFsL21vZGFsLmpzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHQkcGFnZU5hbWUgOiAkKCd0aXRsZScpLFxyXG5cdCR0aXRsZSA6ICQoJyN0aXRsZScpLFx0XHJcblx0JGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHRlbDogJCgnI2Zvcm1QdXRBY3Rpb24nKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdCQud2hlbihuZXcgYWN0aW9uc01vZGVsKCkuZmV0Y2goKSlcclxuXHRcdC5kb25lKF8uYmluZChmdW5jdGlvbihhY3Rpb25zKXtcclxuXHRcdFx0dGhpcy5yZW5kZXJSZXN1bHRhdChhY3Rpb25zKTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdFx0dGhpcy4kcGFnZU5hbWUuaHRtbChcIkFqb3V0IEFjdGlvblwiKTtcclxuXHRcdHRoaXMuJHRpdGxlLmh0bWwoXCJBam91dGVyIHVuZSBBY3Rpb25cIik7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyTW9kaWY6IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHZhciBtb2RlbFJlZ2xlcyA9IG5ldyByZWdsZXNNb2RlbCgpO1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IHJlZ2xlTW9kZWwoKTtcclxuXHRcdG1vZGVsLnVybCA9IG1vZGVsLnVybFJvb3QrJy9BY3Rpb24vJytpZDtcclxuXHRcdFxyXG5cdFx0JC53aGVuKG5ldyBhY3Rpb25zTW9kZWwoKS5mZXRjaCgpLG1vZGVsUmVnbGVzLmZldGNoKCksbW9kZWwuZmV0Y2goKSxuZXcgYWN0aW9uTW9kZWwoe1wiaWRcIjppZH0pLmZldGNoKCkpXHJcblx0XHQuZG9uZShfLmJpbmQoZnVuY3Rpb24oYWN0aW9ucyxyZWdsZXNUb3QscmVnbGVzLGFjdGlvbil7XHJcblx0XHRcdHRoaXMucmVuZGVyUmVzdWx0YXQoYWN0aW9ucyxyZWdsZXNUb3QscmVnbGVzLGFjdGlvbik7XHJcblx0XHR9LHRoaXMpKTtcclxuXHRcdHRoaXMuJHBhZ2VOYW1lLmh0bWwoXCJNb2RpZmllciBBY3Rpb25cIik7XHJcblx0XHR0aGlzLiR0aXRsZS5odG1sKFwiTW9kaWZpZXIgdW5lIEFjdGlvblwiKTtcclxuXHRcdHRoaXMuaWRBY3Rpb249aWQ7XHJcblx0fSxcclxuXHJcblx0dmFsaWQ6IGZ1bmN0aW9uKGUpe1xyXG5cdFx0dmFyIGFjdE51bWFjdGlvbiA9ICQoJyNhY3ROdW1hY3Rpb24nKS52YWwoKTtcclxuXHRcdHZhciBsaWJhY3Rpb24gPSAkKCcjbGliYWN0aW9uJykudmFsKCk7XHJcblx0XHR2YXIgc2NvcmVtaW4gPSAkKCcjc2NvcmVtaW4nKS52YWwoKTtcclxuXHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgYWN0aW9uTW9kZWwoKTtcclxuXHRcdGlmICh0aGlzLmlkQWN0aW9uPT09dW5kZWZpbmVkKXtcclxuXHRcdFx0bW9kZWwuc2F2ZSh7XCJhY3ROdW1hY3Rpb25cIjphY3ROdW1hY3Rpb24sIFwibGliYWN0aW9uXCI6bGliYWN0aW9uLCBcInNjb3JlbWluXCI6c2NvcmVtaW59LCB7XHJcblx0XHRcdFx0c3VjY2VzczogdGhpcy5zaG93TW9kYWwoXCJBam91dFwiKSxcclxuXHRcdFx0XHRlcnJvcjogdGhpcy5zaG93RXJyb3JNb2RhbFxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdG1vZGVsLnNhdmUoe1wibnVtYWN0aW9uXCI6dGhpcy5pZEFjdGlvbiwgXCJhY3ROdW1hY3Rpb25cIjphY3ROdW1hY3Rpb24sIFwibGliYWN0aW9uXCI6bGliYWN0aW9uLCBcInNjb3JlbWluXCI6c2NvcmVtaW59LCB7XHJcblx0XHRcdFx0c3VjY2VzczogdGhpcy5zaG93TW9kYWwoXCJNb2RpZmllclwiKSxcclxuXHRcdFx0XHRlcnJvcjogdGhpcy5zaG93RXJyb3JNb2RhbFxyXG5cdFx0XHR9KTtcclxuXHRcdH0gXHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9LFxyXG5cclxuXHR2YWxpZFJlZ2xlOiBmdW5jdGlvbihlKXtcclxuXHRcdHZhciBudW1yZWdsZSA9ICQoJyNudW1yZWdsZScpLnZhbCgpO1xyXG5cdFx0dmFyIG1vZGVsID0gIG5ldyBwb3NzZWRlTW9kZWwoKTtcclxuXHRcdG1vZGVsLnNhdmUoe1wibnVtYWN0aW9uXCI6dGhpcy5pZEFjdGlvbiwgXCJudW1yZWdsZVwiOm51bXJlZ2xlfSwge1xyXG5cdFx0XHRzdWNjZXNzOiB0aGlzLnNob3dNb2RhbCxcclxuXHRcdFx0ZXJyb3I6IHRoaXMuc2hvd0Vycm9yTW9kYWxcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlc3BvbnNlTGlzdCwgcmVzcG9uc2VMaXN0UmVnbGVUb3QsIHJlc3BvbnNlTGlzdFJlZ2xlLCByZXNwb25zZSl7XHJcblx0XHRpZihyZXNwb25zZT09PXVuZGVmaW5lZCl7XHJcblx0XHRcdHRoaXMuJGNvbnRlbnQuaHRtbCh0ZW1wbGF0ZSh7YWN0aW9uczpyZXNwb25zZUxpc3R9KSk7XHJcblx0XHR9ZWxzZXtcclxuXHJcblx0XHRcdC8vIEVubGV2ZSBsJ2lkIGNvdXJyYW50IGRlIGxhIGxpc3RlXHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPHJlc3BvbnNlTGlzdFswXS5sZW5ndGg7IGkrKykge1xyXG5cdCAgICAgIFx0XHRpZihyZXNwb25zZUxpc3RbMF1baV0ubnVtYWN0aW9uID09PSByZXNwb25zZVswXS5udW1hY3Rpb24pIHtcclxuXHRcdFx0ICAgICAgICAgcmVzcG9uc2VMaXN0WzBdLnNwbGljZShpLCAxKTtcclxuXHRcdFx0ICAgIH1cclxuXHRcdCAgXHR9XHJcblxyXG5cdFx0ICBcdC8vIFJlZmFjdG9yaW5nIGxpc3QgZGVzIHLDqGdsZSBwb3VyIHF1ZSDDp2Egc29pdCBwbHVzIGxpc2libGVcclxuXHRcdFx0dmFyIFJlZ2xlID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuXHRcdCAgXHR9KTtcclxuXHRcdFx0dmFyIENvbGxlY3Rpb25SZWdsZSA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcclxuXHRcdFx0ICBtb2RlbDogUmVnbGVcclxuXHRcdFx0fSk7XHJcblx0XHRcdHZhciBjb3VudCA9IDA7XHJcblx0XHRcdHZhciBsaXN0UmVnbGUgPSBuZXcgQ29sbGVjdGlvblJlZ2xlKCk7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgIHJlc3BvbnNlTGlzdFJlZ2xlWzBdLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dmFyIHJlZ2xlID0gbmV3IFJlZ2xlKHJlc3BvbnNlTGlzdFJlZ2xlWzBdW2ldWzBdKTtcclxuXHRcdFx0XHRsaXN0UmVnbGUuYWRkKFtyZWdsZV0pO1xyXG5cdFx0XHRcdGNvdW50Kys7XHJcblx0XHRcdH1cclxuXHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2VMaXN0UmVnbGVUb3RbMF0pO1xyXG5cdFx0XHR0aGlzLiRjb250ZW50Lmh0bWwodGVtcGxhdGUoe2FjdGlvbjogcmVzcG9uc2VbMF0sIGFjdGlvbnM6IHJlc3BvbnNlTGlzdFswXSxyZWdsZXM6IGxpc3RSZWdsZS5tb2RlbHMscmVnbGVzVG90OiByZXNwb25zZUxpc3RSZWdsZVRvdFswXX0pKTtcclxuXHRcdFx0JChcIiNhY3ROdW1hY3Rpb24gb3B0aW9uW3ZhbHVlPSdcIityZXNwb25zZVswXS5hY3ROdW1hY3Rpb24rXCInXVwiKS5hdHRyKFwic2VsZWN0ZWRcIiwgXCJzZWxlY3RlZFwiKTtcclxuXHRcdH1cclxuXHRcdCQoJyNmb3JtUHV0QWN0aW9uJykuc3VibWl0KF8uYmluZChmdW5jdGlvbihldmVudCl7XHJcblx0XHQgICAgdGhpcy52YWxpZCgpO1xyXG5cdFx0fSwgdGhpcykpO1xyXG5cclxuXHRcdCQoJyNmb3JtUHV0UmVnbGUnKS5zdWJtaXQoXy5iaW5kKGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdCAgICB0aGlzLnZhbGlkUmVnbGUoKTtcclxuXHRcdH0sIHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHRzaG93TW9kYWw6IGZ1bmN0aW9uKGFjdGlvblR5cGUpe1xyXG5cdFx0dmFyIEFydGljbGVNb2RhbEJvZHkgPSBcIkxhXCI7XHJcblx0XHRpZihhY3Rpb25UeXBlID09PSBcIkFqb3V0XCIpe1xyXG5cdFx0XHRBcnRpY2xlTW9kYWxCb2R5ID0gXCJMJ1wiO1xyXG5cdFx0fVxyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IGFjdGlvblR5cGUsXHJcblx0XHQgXHRtb2RhbEJvZHk6IEFydGljbGVNb2RhbEJvZHkrXCIgXCIrYWN0aW9uVHlwZStcIiBhIMOpdMOpIGVmZmVjdHXDqSBhdmVjIHN1Y2PDqHNcIlxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoJyNBY3Rpb25zJywge3RyaWdnZXI6dHJ1ZX0pO1xyXG5cdH0sXHJcblxyXG5cdHNob3dFcnJvck1vZGFsOiBmdW5jdGlvbihlcnJvcil7XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJBam91dC9Nb2RpZmllclwiLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIkVycmV1ciBsb3JzIGRlIGwnYWpvdXQvbW9kaWZpY2F0aW9uIDogXCIgKyBlcnJvcixcclxuXHRcdCBcdG1vZGFsRXJyb3I6IHRydWVcclxuXHRcdH0pO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwidmFyIEFjdGlvbnMgPSByZXF1aXJlKCcuL0FjdGlvbnMnKTtcclxudmFyIEFjdGlvbiA9IHJlcXVpcmUoJy4vQWN0aW9uJyk7XHJcbnZhciBQdXRBY3Rpb24gPSByZXF1aXJlKCcuL1B1dEFjdGlvbicpO1xyXG52YXIgRGVsZXRlQWN0aW9uID0gcmVxdWlyZSgnLi9EZWxldGVBY3Rpb24nKTtcclxuXHJcbnZhciBSb3V0ZXIgPSBCYWNrYm9uZS5Sb3V0ZXIuZXh0ZW5kKHtcclxuXHRyb3V0ZXM6IHtcclxuXHRcdFwiQWN0aW9uc1wiOiBcIkFjdGlvbnNcIixcclxuXHRcdFwiQWN0aW9ucy9Bam91dFwiOiBcIkFqb3V0QWN0aW9uXCIsXHJcblx0XHRcIkFjdGlvbnMvTW9kaWZpZXIvOmlkXCI6IFwiTW9kaWZBY3Rpb25cIixcclxuXHRcdFwiQWN0aW9ucy9TdXBwcmltZXIvOmlkXCI6IFwiU3VwcHJBY3Rpb25cIixcclxuXHRcdFwiQWN0aW9ucy86aWRcIjogXCJBY3Rpb25cIixcclxuXHRcdFwiQWN0aW9ucy9Nb2RpZmllci86aWQvUmVnbGUvU3VwcHJpbWVyLzppZFJlZ2xlXCI6IFwiU3VwcHJBY3Rpb25SZWdsZVwiLFxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblxyXG5cdH0sXHJcblxyXG5cdEFjdGlvbnM6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLmFjdGlvbnMgPSBuZXcgQWN0aW9ucygpO1xyXG5cdFx0dGhpcy5hY3Rpb25zLnJlbmRlcigpO1xyXG5cdH0sXHJcblxyXG5cdEFjdGlvbjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5hY3Rpb25zID0gbmV3IEFjdGlvbigpO1xyXG5cdFx0dGhpcy5hY3Rpb25zLnJlbmRlcihpZCk7XHJcblx0fSxcclxuXHJcblx0QWpvdXRBY3Rpb246IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLl9hY3Rpb24gPSBuZXcgUHV0QWN0aW9uKCk7XHJcblx0XHR0aGlzLl9hY3Rpb24ucmVuZGVyKCk7XHJcblx0fSxcclxuXHJcblx0TW9kaWZBY3Rpb246IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHRoaXMuX2FjdGlvbiA9IG5ldyBQdXRBY3Rpb24oKTtcclxuXHRcdHRoaXMuX2FjdGlvbi5yZW5kZXJNb2RpZihpZCk7XHJcblx0fSxcclxuXHJcblx0U3VwcHJBY3Rpb246IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHRoaXMuX2FjdGlvbiA9IG5ldyBEZWxldGVBY3Rpb24oKTtcclxuXHRcdHRoaXMuX2FjdGlvbi5yZW5kZXIoaWQpO1xyXG5cdH0sXHJcblxyXG5cdFN1cHByQWN0aW9uUmVnbGU6IGZ1bmN0aW9uKGlkLCBpZFJlZ2xlKXtcclxuXHRcdHRoaXMuX2FjdGlvbiA9IG5ldyBEZWxldGVBY3Rpb24oKTtcclxuXHRcdHRoaXMuX2FjdGlvbi5yZW5kZXJQb3NzZWRlKGlkLGlkUmVnbGUpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlcjsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcblx0PHRoZWFkPlxcclxcblx0XHQ8dHI+XFxyXFxuXHRcdFx0PHRoPklkZW50aWZpYW50PC90aD5cXHJcXG5cdFx0XHQ8dGg+Tm9tPC90aD5cXHJcXG5cdFx0XHQ8dGg+UHJlbm9tPC90aD5cXHJcXG5cdFx0PC90cj5cXHJcXG5cdDwvdGhlYWQ+XFxyXFxuXHQ8dGJvZHk+XFxyXFxuXHRcdFx0PHRyPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXBwcmVuYW50IDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hdHRyaWJ1dGVzIDogc3RhY2sxKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1hcHByZW5hbnQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXBwcmVuYW50IDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hdHRyaWJ1dGVzIDogc3RhY2sxKSkgIT0gbnVsbCA/IHN0YWNrMS5ub21hcHByZW5hbnQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXBwcmVuYW50IDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hdHRyaWJ1dGVzIDogc3RhY2sxKSkgIT0gbnVsbCA/IHN0YWNrMS5wcmVub21hcHByZW5hbnQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdDwvdHI+XFxyXFxuXHQ8L3Rib2R5PlxcclxcbjwvdGFibGU+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBhcHByZW5hbnRNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0FwcHJlbmFudHMvQXBwcmVuYW50Jyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vQXBwcmVuYW50LmhicycpO1xyXG5cclxudmFyIHZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcblx0cGFnZU5hbWUgOiAkKCd0aXRsZScpLFxyXG5cdHRpdGxlIDogJCgnI3RpdGxlJyksXHJcblx0Y29udGVudCA6ICQoJyNjb250ZW50JyksXHJcblxyXG5cdC8vQXBwZWzDqSBhdSBtb21lbnQgZGUgbCdpbnN0YW5jaWF0aW9uXHRcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdC8vRm9uY3Rpb24gY2hhcmfDqWUgZHUgcmVuZHVcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHZhciBtb2RlbCA9IG5ldyBhcHByZW5hbnRNb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5yZW5kZXJSZXN1bHRhdCwgdGhpcylcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLnBhZ2VOYW1lKS5odG1sKFwiRMOpdGFpbCBBcHByZW5hbnRcIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJJbmZvcm1hdGlvbnMgQXBwcmVuYW50XCIpO1xyXG5cdH0sXHJcblxyXG5cdHJlbmRlclJlc3VsdGF0OiBmdW5jdGlvbihhcHByZW5hbnQpe1xyXG5cdFx0JCh0aGlzLmNvbnRlbnQpLmh0bWwodGVtcGxhdGUoe2FwcHJlbmFudH0pKTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT10aGlzLmxhbWJkYSwgYWxpYXMyPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdFx0XHQ8dHIgb25DbGljaz1cXFwiZG9jdW1lbnQubG9jYXRpb249JyNBcHByZW5hbnRzL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFwcHJlbmFudCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIidcXFwiPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFwcHJlbmFudCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubm9tYXBwcmVuYW50IDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5wcmVub21hcHByZW5hbnQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjQXBwcmVuYW50cy9Nb2RpZmllci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1hcHByZW5hbnQgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcclxcblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjQXBwcmVuYW50cy9TdXBwcmltZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtYXBwcmVuYW50IDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi10cmFzaFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0PC90ZD5cXHJcXG5cdFx0XHQ8L3RyPlxcclxcblwiO1xufSxcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiPGEgaHJlZj1cXFwiI0FwcHJlbmFudHMvQWpvdXRcXFwiPlxcclxcblx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLXN1Y2Nlc3NcXFwiPlxcclxcblx0ICA8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPiBBam91dGVyIEFwcHJlbmFudFxcclxcblx0PC9idXR0b24+XFxyXFxuPC9hPlxcclxcblxcclxcbjx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcblx0PHRoZWFkPlxcclxcblx0XHQ8dHI+XFxyXFxuXHRcdFx0PHRoPklkZW50aWZpYW50PC90aD5cXHJcXG5cdFx0XHQ8dGg+Tm9tPC90aD5cXHJcXG5cdFx0XHQ8dGg+UHJlbm9tPC90aD5cXHJcXG5cdFx0XHQ8dGg+PC90aD5cXHJcXG5cdFx0PC90cj5cXHJcXG5cdDwvdGhlYWQ+XFxyXFxuXHQ8dGJvZHk+XFxyXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hcHByZW5hbnRzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXHQ8L3Rib2R5PlxcclxcbjwvdGFibGU+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBhcHByZW5hbnRzTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9BcHByZW5hbnRzL0FwcHJlbmFudHNMaXN0Jyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vQXBwcmVuYW50cy5oYnMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHBhZ2VOYW1lIDogJCgndGl0bGUnKSxcclxuXHR0aXRsZSA6ICQoJyN0aXRsZScpLFxyXG5cdGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHQvL0FwcGVsw6kgYXUgbW9tZW50IGRlIGwnaW5zdGFuY2lhdGlvblx0XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHR9LFxyXG5cclxuXHQvL0ZvbmN0aW9uIGNoYXJnw6llIGR1IHJlbmR1XHJcblx0cmVuZGVyOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IGFwcHJlbmFudHNNb2RlbCgpLmZldGNoKHtcclxuXHRcdFx0c3VjY2VzczogXy5iaW5kKHRoaXMucmVuZGVyUmVzdWx0YXQsIHRoaXMpXHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5wYWdlTmFtZSkuaHRtbChcIkxpc3RlIGRlcyBBcHByZW5hbnRzXCIpO1xyXG5cdFx0JCh0aGlzLnRpdGxlKS5odG1sKFwiTGlzdGUgZGVzIEFwcHJlbmFudHNcIik7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdCQodGhpcy5jb250ZW50KS5odG1sKHRlbXBsYXRlKHthcHByZW5hbnRzOiByZXNwb25zZS50b0FycmF5KCl9KSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCJ2YXIgQXBwcmVuYW50TW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9BcHByZW5hbnRzL0FwcHJlbmFudCcpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHJlbmRlcjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IEFwcHJlbmFudE1vZGVsKHtcImlkXCI6aWR9KS5mZXRjaCh7XHJcblx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLmNvbmZpcm0sdGhpcylcclxuXHRcdH0pO1xyXG5cclxuXHR9LFxyXG5cclxuXHRjb25maXJtOmZ1bmN0aW9uKGFwcHJlbmFudCl7XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJTdXBwcmVzc2lvblwiLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIkNvbmZpcm1lciBsYSBzdXBwcmVzc2lvblwiLFxyXG5cdFx0IFx0bW9kYWxGb290ZXI6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIGRhdGEtZGlzbWlzcz1cIm1vZGFsXCIgaWQ9XCJhbm51bERlbGV0ZVwiPkFubnVsZXI8L2J1dHRvbj48YSBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIGJ0bi1va1wiIGlkPVwiY29uZmlybURlbGV0ZVwiIGRhdGEtZGlzbWlzcz1cIm1vZGFsXCI+U3VwcHJpbWVyPC9hPidcclxuXHRcdH0pO1xyXG5cdFx0JCgnI2NvbmZpcm1EZWxldGUnKS5vbignY2xpY2snLF8uYmluZChmdW5jdGlvbihlKXtcclxuXHRcdFx0dmFyIG1vZGVsID0gbmV3IEFwcHJlbmFudE1vZGVsKHtcImlkXCI6YXBwcmVuYW50LmlkfSkuZGVzdHJveSh7XHJcblx0XHRcdFx0c3VjY2VzczogXy5iaW5kKHRoaXMudmFsaWQsdGhpcylcclxuXHRcdFx0fSk7XHJcblx0XHRcdC8vJCgnLm1vZGFsLWJhY2tkcm9wJykucmVtb3ZlKCk7XHJcblx0XHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoJyNBcHByZW5hbnRzJywge3RyaWdnZXI6dHJ1ZX0pO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0XHQkKCcjYW5udWxEZWxldGUnKS5vbignY2xpY2snLF8uYmluZChmdW5jdGlvbihlKXtcclxuXHRcdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI0FwcHJlbmFudHMnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0XHR9LHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHR2YWxpZDpmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJTdXBwcmVzc2lvbiBlZmZlY3XDqWVcIlxyXG5cdFx0fSk7XHJcblx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcjQXBwcmVuYW50cycsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHR9LFxyXG5cclxuXHRzaG93RXJyb3JNb2RhbDogZnVuY3Rpb24oZXJyb3Ipe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJFcnJldXIgbG9ycyBkZSBsYSBzdXBwcmVzc2lvbiA6IFwiICsgZXJyb3IsXHJcblx0XHQgXHRtb2RhbEVycm9yOiB0cnVlXHJcblx0XHR9KTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiIDxmb3JtIGlkPVxcXCJmb3JtUHV0QXBwcmVuYW50XFxcIiBtZXRob2Q9XFxcInBvc3RcXFwiPlxcclxcbiAgPGRpdiBjbGFzcz1cXFwiZm9ybS1ncm91cFxcXCI+XFxyXFxuICAgIDxsYWJlbCBmb3I9XFxcIm5vbWFwcHJlbmFudFxcXCI+Tm9tPC9sYWJlbD5cXHJcXG4gICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiIGlkPVxcXCJub21hcHByZW5hbnRcXFwiIHBsYWNlaG9sZGVyPVxcXCJFbnRyZXogdW4gbm9tXFxcIiB2YWx1ZT1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXBwcmVudGkgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm5vbWFwcHJlbmFudCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCIgcmVxdWlyZWQ+XFxyXFxuICA8L2Rpdj5cXHJcXG4gIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcclxcbiAgICA8bGFiZWwgZm9yPVxcXCJwcmVub21hcHByZW5hbnRcXFwiPlByw6lub208L2xhYmVsPlxcclxcbiAgICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgaWQ9XFxcInByZW5vbWFwcHJlbmFudFxcXCIgcGxhY2Vob2xkZXI9XFxcIkVudHJleiB1biBwcsOpbm9tXFxcIiB2YWx1ZT1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXBwcmVudGkgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnByZW5vbWFwcHJlbmFudCA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCIgcmVxdWlyZWQ+XFxyXFxuICA8L2Rpdj5cXHJcXG4gIDxidXR0b24gY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdFxcXCI+VmFsaWRlcjwvYnV0dG9uPlxcclxcbjwvZm9ybT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIGFwcHJlbmFudE1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvQXBwcmVuYW50cy9BcHByZW5hbnQnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9QdXRBcHByZW5hbnQuaGJzJyk7XHJcbnZhciBtb2RhbCA9IHJlcXVpcmUoJy4uL0dsb2JhbC9tb2RhbC5qcycpO1xyXG5cclxudmFyIHZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcblx0JHBhZ2VOYW1lIDogJCgndGl0bGUnKSxcclxuXHQkdGl0bGUgOiAkKCcjdGl0bGUnKSxcdFxyXG5cdCRjb250ZW50IDogJCgnI2NvbnRlbnQnKSxcclxuXHJcblx0ZWw6ICQoJyNmb3JtUHV0QXBwcmVuYW50JyksXHJcblxyXG5cdC8vQXBwZWzDqSBhdSBtb21lbnQgZGUgbCdpbnN0YW5jaWF0aW9uXHRcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdC8vRm9uY3Rpb24gY2hhcmfDqWUgZHUgcmVuZHVcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLnJlbmRlclJlc3VsdGF0KHVuZGVmaW5lZCk7XHJcblx0XHR0aGlzLiRwYWdlTmFtZS5odG1sKFwiQWpvdXQgQXBwcmVuYW50XCIpO1xyXG5cdFx0dGhpcy4kdGl0bGUuaHRtbChcIkFqb3V0ZXIgdW4gQXBwcmVuYW50XCIpO1xyXG5cdH0sXHJcblxyXG5cdHJlbmRlck1vZGlmOiBmdW5jdGlvbihpZCl7XHJcblx0XHQkLndoZW4obmV3IGFwcHJlbmFudE1vZGVsKHtcImlkXCI6aWR9KS5mZXRjaCgpKVxyXG5cdFx0LmRvbmUoXy5iaW5kKGZ1bmN0aW9uKGFwcHJlbmFudCl7XHJcblx0XHRcdHRoaXMucmVuZGVyUmVzdWx0YXQoYXBwcmVuYW50KTtcclxuXHRcdH0sdGhpcykpO1x0XHRcclxuXHRcdHRoaXMuJHBhZ2VOYW1lLmh0bWwoXCJNb2RpZmllciBBcHByZW5hbnRcIik7XHJcblx0XHR0aGlzLiR0aXRsZS5odG1sKFwiTW9kaWZpZXIgdW4gQXBwcmVuYW50XCIpO1xyXG5cdFx0dGhpcy5pZEFwcHJlbmFudD1pZDtcclxuXHR9LFxyXG5cclxuXHR2YWxpZDogZnVuY3Rpb24oZSl7XHJcblx0XHR2YXIgbm9tYXBwcmVuYW50ID0gJCgnI25vbWFwcHJlbmFudCcpLnZhbCgpO1xyXG5cdFx0dmFyIHByZW5vbWFwcHJlbmFudCA9ICQoJyNwcmVub21hcHByZW5hbnQnKS52YWwoKTtcclxuXHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgYXBwcmVuYW50TW9kZWwoKTtcclxuXHRcdGlmICh0aGlzLmlkQXBwcmVuYW50PT09dW5kZWZpbmVkKXtcclxuXHRcdFx0bW9kZWwuc2F2ZSh7XCJub21hcHByZW5hbnRcIjpub21hcHByZW5hbnQsIFwicHJlbm9tYXBwcmVuYW50XCI6cHJlbm9tYXBwcmVuYW50fSwge1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IHRoaXMuc2hvd0Vycm9yTW9kYWwsXHJcblx0XHRcdFx0ZXJyb3I6IHRoaXMuc2hvd01vZGFsXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0bW9kZWwuc2F2ZSh7XCJudW1hcHByZW5hbnRcIjp0aGlzLmlkQXBwcmVuYW50LCBcIm5vbWFwcHJlbmFudFwiOm5vbWFwcHJlbmFudCwgXCJwcmVub21hcHByZW5hbnRcIjpwcmVub21hcHByZW5hbnR9LCB7XHJcblx0XHRcdFx0c3VjY2VzczogdGhpcy5zaG93RXJyb3JNb2RhbCxcclxuXHRcdFx0XHRlcnJvcjogdGhpcy5zaG93TW9kYWxcclxuXHRcdFx0fSk7XHJcblx0XHR9IFxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdGlmKHJlc3BvbnNlPT09dW5kZWZpbmVkKXtcclxuXHRcdFx0dGhpcy4kY29udGVudC5odG1sKHRlbXBsYXRlKCkpO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHRoaXMuJGNvbnRlbnQuaHRtbCh0ZW1wbGF0ZSh7YXBwcmVudGk6IHJlc3BvbnNlfSkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdCQoJyNmb3JtUHV0QXBwcmVuYW50Jykuc3VibWl0KF8uYmluZChmdW5jdGlvbihldmVudCl7XHJcblx0XHQgICAgdGhpcy52YWxpZCgpO1xyXG5cdFx0fSwgdGhpcykpO1xyXG5cdH0sXHJcblxyXG5cdHNob3dNb2RhbDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIkFqb3V0XCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiTCdham91dCBhIMOpdMOpIGVmZmVjdHXDqSBhdmVjIHN1Y2PDqHNcIlxyXG5cdFx0fSk7XHJcblx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcjQXBwcmVuYW50cycsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHR9LFxyXG5cclxuXHRzaG93RXJyb3JNb2RhbDogZnVuY3Rpb24oZXJyb3Ipe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiQWpvdXRcIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJFcnJldXIgbG9ycyBkZSBsJ2Fqb3V0IDogXCIgKyBlcnJvcixcclxuXHRcdCBcdG1vZGFsRXJyb3I6IHRydWVcclxuXHRcdH0pO1xyXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI0FwcHJlbmFudHMnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsgIiwidmFyIEFwcHJlbmFudHMgPSByZXF1aXJlKCcuL0FwcHJlbmFudHMnKTtcclxudmFyIEFwcHJlbmFudCA9IHJlcXVpcmUoJy4vQXBwcmVuYW50Jyk7XHJcbnZhciBQdXRBcHByZW5hbnQgPSByZXF1aXJlKCcuL1B1dEFwcHJlbmFudCcpO1xyXG52YXIgRGVsZXRlQXBwcmVuYW50ID0gcmVxdWlyZSgnLi9EZWxldGVBcHByZW5hbnQnKTtcclxuXHJcbnZhciBSb3V0ZXIgPSBCYWNrYm9uZS5Sb3V0ZXIuZXh0ZW5kKHtcclxuXHRyb3V0ZXM6IHtcclxuXHRcdFwiQXBwcmVuYW50c1wiOiBcIkFwcHJlbmFudHNcIixcclxuXHRcdFwiQXBwcmVuYW50cy9Bam91dFwiOiBcIkFqb3V0QXBwcmVuYW50XCIsXHJcblx0XHRcIkFwcHJlbmFudHMvTW9kaWZpZXIvOmlkXCI6IFwiTW9kaWZBcHByZW5hbnRcIixcclxuXHRcdFwiQXBwcmVuYW50cy9TdXBwcmltZXIvOmlkXCI6IFwiU3VwcHJBcHByZW5hbnRcIixcclxuXHRcdFwiQXBwcmVuYW50cy86aWRcIjogXCJBcHByZW5hbnRcIixcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cclxuXHR9LFxyXG5cclxuXHRBcHByZW5hbnRzOiBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5BcHByZW5hbnRzID0gbmV3IEFwcHJlbmFudHMoKTtcclxuXHRcdHRoaXMuQXBwcmVuYW50cy5yZW5kZXIoKTtcclxuXHR9LFxyXG5cclxuXHRBcHByZW5hbnQ6IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHRoaXMuQXBwcmVuYW50ID0gbmV3IEFwcHJlbmFudCgpO1xyXG5cdFx0dGhpcy5BcHByZW5hbnQucmVuZGVyKGlkKTtcclxuXHR9LFxyXG5cclxuXHRBam91dEFwcHJlbmFudDogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuQXBwcmVuYW50ID0gbmV3IFB1dEFwcHJlbmFudCgpO1xyXG5cdFx0dGhpcy5BcHByZW5hbnQucmVuZGVyKCk7XHJcblx0fSxcclxuXHJcblx0TW9kaWZBcHByZW5hbnQ6IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHRoaXMuQXBwcmVuYW50ID0gbmV3IFB1dEFwcHJlbmFudCgpO1xyXG5cdFx0dGhpcy5BcHByZW5hbnQucmVuZGVyTW9kaWYoaWQpO1xyXG5cdH0sXHJcblxyXG5cdFN1cHByQXBwcmVuYW50OiBmdW5jdGlvbihpZCl7XHJcblx0XHR0aGlzLkFwcHJlbmFudCA9IG5ldyBEZWxldGVBcHByZW5hbnQoKTtcclxuXHRcdHRoaXMuQXBwcmVuYW50LnJlbmRlcihpZCk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUm91dGVyOyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgIDxoMz5CaWxhbiBmaW5hbDwvaDM+XFxyXFxuXFxyXFxuICA8dGFibGUgY2xhc3M9XFxcInRhYmxlXFxcIj5cXHJcXG4gIDx0aGVhZD5cXHJcXG4gICAgPHRyPlxcclxcbiAgICAgIDx0aD5OdW08L3RoPlxcclxcbiAgICAgIDx0aD5NaXNzaW9uPC90aD5cXHJcXG4gICAgICA8dGg+U2NvcmU8L3RoPlxcclxcbiAgICA8L3RyPlxcclxcbiAgPC90aGVhZD5cXHJcXG4gIDx0Ym9keT5cXHJcXG4gIDx0cj5cXHJcXG4gICAgPHRkPjwvdGQ+XFxyXFxuICAgIDx0ZD48L3RkPlxcclxcbiAgICA8dGQ+PC90ZD5cXHJcXG4gIDwvdHI+XFxyXFxuICA8dHI+XFxyXFxuICAgIDx0ZD48L3RkPlxcclxcbiAgICA8dGQ+PC90ZD5cXHJcXG4gICAgPHRkPjwvdGQ+XFxyXFxuICA8L3RyPlxcclxcbjwvdGFibGU+XFxyXFxuXFxyXFxuPGg0PlNjb3JlIHRvdGFsOiA8L2g0PlxcclxcblxcclxcbjxhIGhyZWY9XFxcIlxcXCI+XFxyXFxuICA8YnV0dG9uIGlkPVxcXCJhY2N1ZWlsXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0XFxcIj5SZXRvdXIgw6AgbCdhY2N1ZWlsPC9idXR0b24+XFxyXFxuPC9hPlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICA8aDM+QmlsYW4gZGUgbGEgbWlzc2lvbjwvaDM+XFxyXFxuXFxyXFxuICA8dGFibGUgY2xhc3M9XFxcInRhYmxlXFxcIj5cXHJcXG4gIDx0aGVhZD5cXHJcXG4gICAgPHRyPlxcclxcbiAgICAgIDx0aD5OdW08L3RoPlxcclxcbiAgICAgIDx0aD5PYmplY3RpZjwvdGg+XFxyXFxuICAgICAgPHRoPkFjdGlvbnM8L3RoPlxcclxcbiAgICA8L3RyPlxcclxcbiAgPC90aGVhZD5cXHJcXG4gIDx0Ym9keT5cXHJcXG4gIDx0cj5cXHJcXG4gICAgPHRkPjwvdGQ+XFxyXFxuICAgIDx0ZD48L3RkPlxcclxcbiAgICA8dGQ+PC90ZD5cXHJcXG4gIDwvdHI+XFxyXFxuICA8dHI+XFxyXFxuICAgIDx0ZD48L3RkPlxcclxcbiAgICA8dGQ+PC90ZD5cXHJcXG4gICAgPHRkPjwvdGQ+XFxyXFxuICA8L3RyPlxcclxcbjwvdGFibGU+XFxyXFxuXFxyXFxuPGg0PlRvdGFsIGRlIGxhIG1pc3Npb246IDwvaDQ+XFxyXFxuXFxyXFxuPGJ1dHRvbiBpZD1cXFwibWlzc2lvblN1aXZhbnRlXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0XFxcIj5NaXNzaW9uIHN1aXZhbnRlPC9idXR0b24+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiICAgIDxkaXYgY2xhc3M9XFxcInJvd1xcXCI+XFxyXFxuICAgICAgPGRpdiBjbGFzcz1cXFwiY29sLW1kLTNcXFwiPlxcclxcbiAgICAgICAgXCJcbiAgICArIHRoaXMuZXNjYXBlRXhwcmVzc2lvbih0aGlzLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJvYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcclxcbiAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29sLW1kLTlcXFwiPlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saXN0QWN0aW9uIDogc3RhY2sxKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgyLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiICAgICAgPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCIgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiPlxcclxcbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29sLW1kLTRcXFwiPlxcclxcbiAgICAgICAgICAgICAgICBcIlxuICAgICsgdGhpcy5lc2NhcGVFeHByZXNzaW9uKHRoaXMubGFtYmRhKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYmFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcclxcbiAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb2wtbWQtOFxcXCI+XFxyXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpc3RSZWdsZSA6IHN0YWNrMSkse1wibmFtZVwiOlwiZWFjaFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMywgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgPC9kaXY+XFxyXFxuXCI7XG59LFwiM1wiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInJvd1xcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29sLW1kLTZcXFwiPlxcclxcbiAgICAgICAgICAgICAgICAgICAgXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGlicmVnbGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXHJcXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cXHJcXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb2wtbWQtNlxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cXFwiY2hlY2tib3hcXFwiIGlkPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJyZWdsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuICAgICAgICAgICAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICAgICAgICAgIDwvZGl2PiAgXFxyXFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCI8aDM+RXZhbHVhdGlvbiBkZSBsYSBtaXNzaW9uPC9oMz5cXHJcXG48aDI+XCJcbiAgICArIHRoaXMuZXNjYXBlRXhwcmVzc2lvbih0aGlzLmxhbWJkYSgoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1pc3Npb24gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmF0dHJpYnV0ZXMgOiBzdGFjazEpKSAhPSBudWxsID8gc3RhY2sxLmxpYm1pc3Npb24gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L2gyPlxcclxcbiAgPGZvcm0gaWQ9XFxcImZvcm1DaG9peFJlZ2xlXFxcIiBtZXRob2Q9XFxcInBvc3RcXFwiPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiPlxcclxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNvbC1tZC0zXFxcIj5cXHJcXG4gICAgICAgIE9iamVjdGlmc1xcclxcbiAgICAgIDwvZGl2PlxcclxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNvbC1tZC0zXFxcIj5cXHJcXG4gICAgICAgIEFjdGlvbnNcXHJcXG4gICAgICA8L2Rpdj5cXHJcXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJjb2wtbWQtM1xcXCI+XFxyXFxuICAgICAgICBSw6hnbGVzXFxyXFxuICAgICAgPC9kaXY+XFxyXFxuICAgICAgPGRpdiBjbGFzcz1cXFwiY29sLW1kLTNcXFwiPlxcclxcbiAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKChzdGFjazEgPSAoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1pc3Npb24gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmF0dHJpYnV0ZXMgOiBzdGFjazEpKSAhPSBudWxsID8gc3RhY2sxLmxpc3RPYmplY3RpZiA6IHN0YWNrMSkpICE9IG51bGwgPyBzdGFjazEubW9kZWxzIDogc3RhY2sxKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxyXFxuXFxyXFxuICA8YnV0dG9uIGlkPVxcXCJzdWJtaXRCdXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHRcXFwiPlZhbGlkZXI8L2J1dHRvbj5cXHJcXG4gIDwvZm9ybT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtamV1IDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJlbGxlamV1IDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC9vcHRpb24+XFxyXFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCI8aDM+Q2hvaXggZHUgamV1PC9oMz5cXHJcXG4gIDxmb3JtIGlkPVxcXCJmb3JtQ2hvaXhKZXVcXFwiIG1ldGhvZD1cXFwicG9zdFxcXCI+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXHJcXG4gICAgPGxhYmVsIGZvcj1cXFwiY2hvaXhKZXVcXFwiPkNob2lzaXIgbGUgamV1PC9sYWJlbD5cXHJcXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIiBpZD1cXFwiY2hvaXhKZXVcXFwiPlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuamV1eCA6IGRlcHRoMCkse1wibmFtZVwiOlwiZWFjaFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAgICA8L3NlbGVjdD5cXHJcXG4gIDwvZGl2PiAgXFxyXFxuICA8YnV0dG9uIGlkPVxcXCJzdWJtaXRCdXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHRcXFwiPlZhbGlkZXI8L2J1dHRvbj5cXHJcXG4gIDwvZm9ybT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIGNob2l4TW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9FdmFsdWF0aW9uL0V2YWx1YXRpb24nKTtcclxudmFyIGpldXhNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0pldXgvSmV1eExpc3QnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9FdmFsdWF0aW9uLmhicycpO1xyXG52YXIgdGVtcGxhdGVFdmFsTWlzc2lvbiA9IHJlcXVpcmUoJy4vRXZhbE1pc3Npb24uaGJzJyk7XHJcbnZhciB0ZW1wbGF0ZUJpbGFuTWlzc2lvbiA9IHJlcXVpcmUoJy4vQmlsYW5NaXNzaW9uLmhicycpO1xyXG52YXIgdGVtcGxhdGVCaWxhbkZpbmFsID0gcmVxdWlyZSgnLi9CaWxhbkZpbmFsLmhicycpO1xyXG5cclxudmFyIG1pc3Npb24gPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9NaXNzaW9ucy9NaXNzaW9uJyk7XHJcbnZhciBtaXNzaW9uT2JqZWN0aWZDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvT2JqZWN0aWZzL09iamVjdGlmTWlzc2lvbicpO1xyXG52YXIgb2JqZWN0aWZNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL09iamVjdGlmcy9PYmplY3RpZicpO1xyXG52YXIgb2JqZWN0aWZMaXN0ID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvT2JqZWN0aWZzL09iamVjdGlmc0xpc3QnKTtcclxuXHJcbnZhciBhY3Rpb25Nb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0FjdGlvbnMvQWN0aW9uJyk7XHJcbnZhciBhY3Rpb25MaXN0ID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvQWN0aW9ucy9BY3Rpb25zTGlzdCcpO1xyXG5cclxudmFyIHJlZ2xlTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9SZWdsZXMvUmVnbGUnKTtcclxudmFyIHJlZ2xlTGlzdCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL1JlZ2xlcy9SZWdsZXNMaXN0Jyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0dGl0bGUgOiAkKCcjdGl0bGUnKSxcclxuXHRjb250ZW50IDogJCgnI2NvbnRlbnQnKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5tb2RlbCA9IG5ldyBjaG9peE1vZGVsKCk7XHJcblx0XHQkKHRoaXMucGFnZU5hbWUpLmh0bWwoXCJFdmFsdWF0aW9uXCIpO1xyXG5cdFx0JCh0aGlzLnRpdGxlKS5odG1sKFwiRXZhbHVhdGlvblwiKTtcclxuXHJcblx0XHR0aGlzLmpldXggPSBuZXcgamV1eE1vZGVsKCkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5yZW5kZXJSZXN1bHRhdCwgdGhpcylcclxuXHRcdH0pO1xyXG5cdH0sXHJcblxyXG5cdC8qIFJlbmRlciBkZSBsYSBzw6lsZWN0aW9uIGQndW4gamV1ICovIFxyXG5cdHJlbmRlclJlc3VsdGF0OiBmdW5jdGlvbihyZXNwb25zZSl7XHJcblx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZSh7amV1eDogcmVzcG9uc2UudG9BcnJheSgpfSkpO1xyXG5cdFx0dGhpcy5qZXVSZXNwb25zZSA9IHJlc3BvbnNlLnRvQXJyYXkoKTtcclxuXHJcblx0XHR2YXIgJGZvcm1DaG9peEpldSA9ICQoJyNmb3JtQ2hvaXhKZXUnKTtcclxuXHRcdCRmb3JtQ2hvaXhKZXUuc3VibWl0KF8uYmluZChmdW5jdGlvbihldmVudCl7XHJcblx0XHQgICAgdGhpcy52YWxpZCgpO1xyXG5cdFx0fSwgdGhpcykpO1xyXG5cdH0sXHJcblxyXG5cdC8qIENsaWMgc3VyIGxlIHByZW1pZXIgYm91dG9uIHZhbGlkZXIgKi9cclxuXHR2YWxpZDogZnVuY3Rpb24oZSl7XHJcblx0XHR2YXIgY2hvaXhKZXUgPSAkKCcjY2hvaXhKZXUnKS52YWwoKTtcclxuXHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5qZXVSZXNwb25zZS5sZW5ndGg7IGkrKyl7XHJcblx0XHRcdGlmKHRoaXMuamV1UmVzcG9uc2VbaV0uYXR0cmlidXRlcy5udW1qZXUgPT0gY2hvaXhKZXUpe1x0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5zZWxlY3RlZEpldSA9IHRoaXMuamV1UmVzcG9uc2VbaV0uYXR0cmlidXRlcztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dGhpcy5jdXJyZW50TWlzc2lvbiA9IDA7XHJcblx0XHR0aGlzLm51bWJlck9mTWlzc2lvbiA9IHRoaXMuc2VsZWN0ZWRKZXUubWlzc2lvbkpldS5sZW5ndGg7XHJcblxyXG5cdFx0dGhpcy5yZW5kZXJPbmVNaXNzaW9uKCk7XHJcblx0fSxcclxuXHJcblx0LyogRmFpcyBsZSByZW5kdSBkZSBsYSBwYWdlIHBvdXIgdW5lIG1pc3Npb24gKi8gXHJcblx0cmVuZGVyT25lTWlzc2lvbjogZnVuY3Rpb24oKXtcclxuXHRcdC8qXHJcblx0XHRcdFRyb2lzIHJlcXXDqnRlcyDDoCBmYWlyZTpcclxuXHRcdFx0XyBlbnRyZSBvYmplY3RpZiBldCBtaXNzaW9uXHJcblx0XHRcdF8gZW50cmUgY2hhcXVlIG1pc3Npb24gZXQgYWN0aW9uc1xyXG5cdFx0XHRfIGVudHJlIGNoYXF1ZSBhY3Rpb24gZXQgcsOoZ2xlcyBcclxuXHRcdCAqL1xyXG5cclxuXHRcdHZhciBtaXNzaW9uT2JqZWN0aWYgPSBuZXcgbWlzc2lvbk9iamVjdGlmQ29sbGVjdGlvbigpO1xyXG5cdFx0dmFyIHVybE9iamVjdGlmTWlzc2lvbiA9IG1pc3Npb25PYmplY3RpZi51cmwgKyBcIi9NaXNzaW9uL1wiICsgKHRoaXMuY3VycmVudE1pc3Npb24gKyAxKSArIFwiL09iamVjdGlmXCI7XHJcblx0XHRtaXNzaW9uT2JqZWN0aWYudXJsID0gdXJsT2JqZWN0aWZNaXNzaW9uO1xyXG5cclxuXHRcdCQud2hlbihtaXNzaW9uT2JqZWN0aWYuZmV0Y2goKSlcclxuXHRcdFx0LmRvbmUoXy5iaW5kKHRoaXMucmVxdWVzdEFjdGlvbnMsIHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHRyZXF1ZXN0QWN0aW9uczogZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0dGhpcy5saXN0T2JqZWN0aWYgPSByZXNwb25zZTtcclxuXHRcdHZhciB0ZW1wTGlzdCA9IG5ldyBvYmplY3RpZkxpc3QoKTtcclxuXHRcdGZvcih2YXIgaT0wO2k8cmVzcG9uc2UubGVuZ3RoO2krKyl7XHJcblx0XHRcdHZhciB0ZW1wT2JqZWN0aWZNb2RlbCA9IG5ldyBvYmplY3RpZk1vZGVsKHtcclxuXHRcdFx0XHRcdGxpYm9iamVjdGlmOiByZXNwb25zZVtpXVsyXS5saWJvYmplY3RpZixcclxuXHRcdFx0XHRcdG51bW9iamVjdGlmOiByZXNwb25zZVtpXVsyXS5udW1vYmplY3RpZlxyXG5cdFx0XHR9KTtcclxuXHRcdFx0dGVtcExpc3QuYWRkKHRlbXBPYmplY3RpZk1vZGVsKTtcclxuXHRcdH1cclxuXHRcdHRoaXMubGlzdE9iamVjdGlmID0gdGVtcExpc3Q7XHJcblxyXG5cdFx0dmFyIHByb21pc2VUYWIgPSBbXTtcclxuXHRcdHRoaXMuYWN0aW9uUmVxdWVzdExpc3QgPSBuZXcgYWN0aW9uTGlzdCgpO1xyXG5cdFx0Zm9yKHZhciBpPTA7aTx0aGlzLmxpc3RPYmplY3RpZi5sZW5ndGg7IGkrKyl7XHJcblx0XHRcdHZhciB0ZW1wQWN0aW9uID0gbmV3IGFjdGlvbk1vZGVsKCk7XHJcblx0XHRcdHRlbXBBY3Rpb24udXJsID0gdGVtcExpc3QudXJsICsgdGhpcy5saXN0T2JqZWN0aWYuYXQoaSkuZ2V0KFwibnVtb2JqZWN0aWZcIikgKyBcIi9BY3Rpb25cIjtcclxuXHRcdFx0cHJvbWlzZVRhYltwcm9taXNlVGFiLmxlbmd0aF0gPSB0ZW1wQWN0aW9uLmZldGNoKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0JC53aGVuYWxsID0gZnVuY3Rpb24oYXJyKSB7IHJldHVybiAkLndoZW4uYXBwbHkoJCwgYXJyKTsgfTtcclxuXHJcblx0XHQkLndoZW5hbGwocHJvbWlzZVRhYikudGhlbihfLmJpbmQoZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgcmVzcG9uc2UubGVuZ3RoOyBqKyspe1xyXG5cdFx0XHRcdC8qIE9uIHLDqWN1cMOocmUgdG91dGVzIGxlcyByw6hnbGVzIGRlIGwnYWN0aW9uIGVuIGNvdXJzICovXHJcblx0XHRcdFx0dmFyIHRlbXBBY3Rpb24gPSBuZXcgYWN0aW9uTW9kZWwoe1xyXG5cdFx0XHRcdFx0XHRcdG51bWFjdGlvbjogcmVzcG9uc2VbMF1bal1bMV0ubnVtYWN0aW9uLFxyXG5cdFx0XHRcdFx0XHRcdHNjb3JlbWluOiAgcmVzcG9uc2VbMF1bal1bMV0uc2NvcmVtaW4sXHJcblx0XHRcdFx0XHRcdFx0bGliYWN0aW9uOiByZXNwb25zZVswXVtqXVsxXS5saWJhY3Rpb24sXHJcblx0XHRcdFx0XHRcdFx0bnVtb2JqZWN0aWY6IHJlc3BvbnNlWzBdW2pdWzBdLm51bW9iamVjdGlmXHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdC8qQWpvdXQgZGUgbCdhY3Rpb24gw6AgbGEgbGlzdGUgZCdhY3Rpb24qL1xyXG5cdFx0XHRcdHRoaXMuYWN0aW9uUmVxdWVzdExpc3QuYWRkKHRlbXBBY3Rpb24pO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSwgdGhpcykpXHJcblx0XHQuZG9uZShfLmJpbmQoZnVuY3Rpb24oKXtcclxuXHRcdFx0dGhpcy5yZXF1ZXN0UmVnbGVzKCk7XHJcblx0XHR9LCB0aGlzKSk7XHJcblx0fSxcclxuXHJcblx0cmVxdWVzdFJlZ2xlczogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMucmVnbGVSZXF1ZXN0TGlzdCA9IG5ldyByZWdsZUxpc3QoKTtcclxuXHRcdHZhciBwcm9taXNlQXJyYXkgPSBbXTtcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmFjdGlvblJlcXVlc3RMaXN0Lmxlbmd0aDsgaSsrKXtcclxuXHRcdFx0dmFyIHRlbXBSZWdsZU1vZGVsID0gbmV3IHJlZ2xlTW9kZWwoKTtcclxuXHRcdFx0dGVtcFJlZ2xlTW9kZWwudXJsUm9vdCA9IHRlbXBSZWdsZU1vZGVsLnVybFJvb3QgKyBcIkFjdGlvbi9cIiArIHRoaXMuYWN0aW9uUmVxdWVzdExpc3QuYXQoaSkuZ2V0KFwibnVtYWN0aW9uXCIpO1xyXG5cdFx0XHRwcm9taXNlQXJyYXlbcHJvbWlzZUFycmF5Lmxlbmd0aF0gPSB0ZW1wUmVnbGVNb2RlbC5mZXRjaCgpO1xyXG5cdFx0fVxyXG5cdFx0JC53aGVuYWxsKHByb21pc2VBcnJheSkudGhlbihfLmJpbmQoZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0XHR2YXIgcmVzcG9uc2VBcnJheSA9IHJlc3BvbnNlWzBdO1xyXG5cdFx0XHRmb3IodmFyIGogPSAwOyBqIDwgcmVzcG9uc2VBcnJheS5sZW5ndGg7IGorKyl7XHJcblx0XHRcdFx0dmFyIHRlbXBSZWdsZU1vZGVsID0gbmV3IHJlZ2xlTW9kZWwoe1xyXG5cdFx0XHRcdFx0bGlicmVnbGU6IHJlc3BvbnNlQXJyYXlbal1bMF0ubGlicmVnbGUsXHJcblx0XHRcdFx0XHRudW1yZWdsZTogcmVzcG9uc2VBcnJheVtqXVswXS5udW1yZWdsZSxcclxuXHRcdFx0XHRcdHNjb3JlbWluOiByZXNwb25zZUFycmF5W2pdWzBdLnNjb3JlbWluLFxyXG5cdFx0XHRcdFx0bnVtYWN0aW9uOiByZXNwb25zZUFycmF5W2pdWzFdLm51bWFjdGlvblxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHRoaXMucmVnbGVSZXF1ZXN0TGlzdC5hZGQodGVtcFJlZ2xlTW9kZWwpO1xyXG5cdFx0XHR9XHJcblx0XHR9LCB0aGlzKSlcclxuXHRcdC5kb25lKF8uYmluZChmdW5jdGlvbigpe1xyXG5cdFx0XHR0aGlzLmpvaW5EYXRhcygpO1xyXG5cdFx0fSwgdGhpcykpO1xyXG5cdH0sXHJcblxyXG5cdGpvaW5EYXRhcyA6IGZ1bmN0aW9uKCl7XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5hY3Rpb25SZXF1ZXN0TGlzdC5sZW5ndGg7IGkrKyl7XHJcblx0XHRcdHZhciBsaXN0UmVnbGUgPSBbXTtcclxuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGo8dGhpcy5yZWdsZVJlcXVlc3RMaXN0Lmxlbmd0aDtqKyspIHtcclxuXHRcdFx0XHRpZih0aGlzLmFjdGlvblJlcXVlc3RMaXN0LmF0KGkpLmdldChcIm51bWFjdGlvblwiKT09dGhpcy5yZWdsZVJlcXVlc3RMaXN0LmF0KGopLmdldChcIm51bWFjdGlvblwiKSl7XHJcblx0XHRcdFx0XHRsaXN0UmVnbGUucHVzaCh0aGlzLnJlZ2xlUmVxdWVzdExpc3QuYXQoaikpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLmFjdGlvblJlcXVlc3RMaXN0LmF0KGkpLnNldChcImxpc3RSZWdsZVwiLGxpc3RSZWdsZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMubGlzdE9iamVjdGlmLmxlbmd0aDsgaSsrKXtcclxuXHRcdFx0dmFyIGxpc3RBY3Rpb24gPSBbXTtcclxuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGo8dGhpcy5hY3Rpb25SZXF1ZXN0TGlzdC5sZW5ndGg7aisrKSB7XHJcblx0XHRcdFx0aWYodGhpcy5saXN0T2JqZWN0aWYuYXQoaSkuZ2V0KFwibnVtb2JqZWN0aWZcIik9PXRoaXMuYWN0aW9uUmVxdWVzdExpc3QuYXQoaikuZ2V0KFwibnVtb2JqZWN0aWZcIikpe1xyXG5cdFx0XHRcdFx0bGlzdEFjdGlvbi5wdXNoKHRoaXMuYWN0aW9uUmVxdWVzdExpc3QuYXQoaikpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLmxpc3RPYmplY3RpZi5hdChpKS5zZXQoXCJsaXN0QWN0aW9uXCIsbGlzdEFjdGlvbik7XHJcblx0XHR9XHJcblx0XHR2YXIgdGVtcCA9IHRoaXMuc2VsZWN0ZWRKZXUubWlzc2lvbkpldVt0aGlzLmN1cnJlbnRNaXNzaW9uXTtcclxuXHRcdHZhciBhY3R1YWxNaXNzaW9uID0gbmV3IG1pc3Npb24oe1xyXG5cdFx0XHRudW1taXNzaW9uOiB0ZW1wLm51bW1pc3Npb24sXHJcblx0XHRcdG51bWpldTogdGVtcC5udW1qZXUsXHJcblx0XHRcdGxpYm1pc3Npb246IHRlbXAubGlibWlzc2lvblxyXG5cdFx0fSk7IFxyXG5cdFx0YWN0dWFsTWlzc2lvbi5zZXQoXCJsaXN0T2JqZWN0aWZcIiwgdGhpcy5saXN0T2JqZWN0aWYpO1xyXG5cclxuXHRcdCQodGhpcy5jb250ZW50KS5odG1sKHRlbXBsYXRlRXZhbE1pc3Npb24oe21pc3Npb246YWN0dWFsTWlzc2lvbn0pKTtcclxuXHR9LFxyXG5cclxuXHQvKiBDbGljIHN1ciBsZSBzZWNvbmQgYm91dG9uIHZhbGlkZXIgKi8gXHJcblx0dmFsaWRNaXNzaW9uOiBmdW5jdGlvbihlKXtcclxuXHRcdCQodGhpcy5jb250ZW50KS5odG1sKHRlbXBsYXRlQmlsYW5NaXNzaW9uKCkpO1xyXG5cclxuXHRcdHZhciAkbWlzc2lvblN1aXZhbnRlID0gJCgnI21pc3Npb25TdWl2YW50ZScpO1xyXG5cdFx0JG1pc3Npb25TdWl2YW50ZS5jbGljayhfLmJpbmQoZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0XHRpZih0aGlzLmN1cnJlbnRNaXNzaW9uID49IHRoaXMubnVtYmVyT2ZNaXNzaW9uKXtcclxuXHRcdCAgICBcdHRoaXMudmFsaWRCaWxhbigpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2V7XHJcblx0XHRcdFx0dGhpcy5jdXJyZW50TWlzc2lvbj10aGlzLmN1cnJlbnRNaXNzaW9uKzE7XHJcblx0XHRcdFx0dGhpcy5yZW5kZXJPbmVNaXNzaW9uKCk7XHJcblx0XHRcdH1cclxuXHRcdH0sIHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHJcblx0LyogTG9yc3F1ZSB0b3V0ZXMgbGVzIG1pc3Npb25zIG9udCDDqXTDqSB2YWxpZMOpZXMgKi8gXHJcblx0dmFsaWRCaWxhbjogZnVuY3Rpb24oZSl7XHJcblx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZUJpbGFuRmluYWwoKSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCJ2YXIgRXZhbHVhdGlvbiA9IHJlcXVpcmUoJy4vRXZhbHVhdGlvbicpO1xyXG5cclxudmFyIFJvdXRlciA9IEJhY2tib25lLlJvdXRlci5leHRlbmQoe1xyXG5cdHJvdXRlczoge1xyXG5cdFx0XCJFdmFsdWF0aW9uXCI6IFwiRXZhbHVhdGlvblwiXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHJcblx0fSxcclxuXHJcblx0RXZhbHVhdGlvbjogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuZXZhbHVhdGlvbiA9IG5ldyBFdmFsdWF0aW9uKCk7XHJcblx0XHR0aGlzLmV2YWx1YXRpb24ucmVuZGVyKCk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUm91dGVyOyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1oZWxwZXJzLmhlbHBlck1pc3NpbmcsIGFsaWFzMj1cImZ1bmN0aW9uXCIsIGFsaWFzMz10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPCEtLSBNb2RhbCAtLT5cXHJcXG4gIDxkaXYgY2xhc3M9XFxcIm1vZGFsIGZhZGVcXFwiIGlkPVxcXCJtb2RhbFZpZXdcXFwiIHJvbGU9XFxcImRpYWxvZ1xcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcIm1vZGFsLWRpYWxvZ1xcXCI+XFxyXFxuICAgICAgPGRpdiBjbGFzcz1cXFwibW9kYWwtY29udGVudFxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtb2RhbC1oZWFkZXJcXFwiPlxcclxcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJjbG9zZVxcXCIgZGF0YS1kaXNtaXNzPVxcXCJtb2RhbFxcXCIgYXJpYS1sYWJlbD1cXFwiQ2xvc2VcXFwiPlxcclxcbiAgICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+JnRpbWVzOzwvc3Bhbj5cXHJcXG4gICAgICAgIDwvYnV0dG9uPlxcclxcbiAgICAgICAgICA8aDQ+XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRpdGxlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50aXRsZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwidGl0bGVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9oND5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwibW9kYWwtYm9keVxcXCI+XFxyXFxuICAgICAgICAgIFwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ib2R5IHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ib2R5IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJib2R5XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtb2RhbC1mb290ZXJcXFwiPlxcclxcbiAgICAgICAgICBcIlxuICAgICsgKChzdGFjazEgPSAoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmZvb3RlciB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuZm9vdGVyIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJmb290ZXJcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgPC9kaXY+XFxyXFxuICAgIDwvZGl2PlxcclxcbiAgPC9kaXY+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vbW9kYWwuaGJzJyk7XHJcbnZhciB0ZW1wbGF0ZUVycm9yID0gcmVxdWlyZSgnLi9tb2RhbEVycm9yLmhicycpO1xyXG5cclxudmFyIG1vZGFsID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG4gICAgJG1vZGFsUm9vdDogJCgnI21vZGFsLXJvb3QnKSxcclxuXHJcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKXtcclxuICAgICAgICB0aGlzLm1vZGFsVGl0bGUgPSBvcHRpb25zLm1vZGFsVGl0bGUgfHwgJyc7XHJcbiAgICAgICAgdGhpcy5tb2RhbEJvZHkgPSBvcHRpb25zLm1vZGFsQm9keSB8fCAnJztcclxuICAgICAgICB0aGlzLm1vZGFsRm9vdGVyID0gb3B0aW9ucy5tb2RhbEZvb3RlciB8fCAnJztcclxuICAgICAgICB0aGlzLm1vZGFsRXJyb3IgPSBvcHRpb25zLm1vZGFsRXJyb3IgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMubW9kYWxFcnJvcil7XHJcbiAgICAgICAgICAgICQoJyNtb2RhbEVycm9yVmlldycpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICQoJyNtb2RhbFZpZXcnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIGlmKHRoaXMubW9kYWxFcnJvcil7XHJcbiAgICAgICAgICAgIHRoaXMuJG1vZGFsUm9vdC5odG1sKHRlbXBsYXRlRXJyb3Ioe3RpdGxlOiB0aGlzLm1vZGFsVGl0bGUsXHJcbiAgICAgICAgICAgIGJvZHk6IHRoaXMubW9kYWxCb2R5LCBmb290ZXI6IHRoaXMubW9kYWxGb290ZXJ9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMuJG1vZGFsUm9vdC5odG1sKHRlbXBsYXRlKHt0aXRsZTogdGhpcy5tb2RhbFRpdGxlLFxyXG4gICAgICAgICAgICBib2R5OiB0aGlzLm1vZGFsQm9keSwgZm9vdGVyOiB0aGlzLm1vZGFsRm9vdGVyfSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1vZGFsOyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczI9XCJmdW5jdGlvblwiLCBhbGlhczM9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjwhLS0gTW9kYWwgLS0+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJtb2RhbCBmYWRlXFxcIiBpZD1cXFwibW9kYWxFcnJvclZpZXdcXFwiIHJvbGU9XFxcImRpYWxvZ1xcXCI+XFxyXFxuICAgIDxkaXYgY2xhc3M9XFxcIm1vZGFsLWRpYWxvZ1xcXCI+XFxyXFxuICAgICAgPGRpdiBjbGFzcz1cXFwibW9kYWwtY29udGVudFxcXCI+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtb2RhbC1oZWFkZXJcXFwiPlxcclxcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJjbG9zZVxcXCIgZGF0YS1kaXNtaXNzPVxcXCJtb2RhbFxcXCIgYXJpYS1sYWJlbD1cXFwiQ2xvc2VcXFwiPlxcclxcbiAgICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+JnRpbWVzOzwvc3Bhbj5cXHJcXG4gICAgICAgIDwvYnV0dG9uPlxcclxcbiAgICAgICAgICA8aDQ+XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLnRpdGxlIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC50aXRsZSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwidGl0bGVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9oND5cXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwibW9kYWwtYm9keVxcXCI+XFxyXFxuICAgICAgICAgIFwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5ib2R5IHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5ib2R5IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJib2R5XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcclxcbiAgICAgICAgPC9kaXY+XFxyXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJtb2RhbC1mb290ZXJcXFwiPlxcclxcbiAgICAgICAgICBcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMuZm9vdGVyIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5mb290ZXIgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImZvb3RlclwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXHJcXG4gICAgICAgIDwvZGl2PlxcclxcbiAgICAgIDwvZGl2PlxcclxcbiAgICA8L2Rpdj5cXHJcXG4gIDwvZGl2PlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczI9XCJmdW5jdGlvblwiLCBhbGlhczM9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlxcclxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bWFjdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtYWN0aW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJudW1hY3Rpb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubnVtYWN0aW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5udW1hY3Rpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm51bWFjdGlvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIgXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLmxpYmFjdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGliYWN0aW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJsaWJhY3Rpb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC9vcHRpb24+XFxyXFxuXFxyXFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIiAgPGZvcm0gaWQ9XFxcImZvcm1Bam91dEluZGljYXRldXJcXFwiIG1ldGhvZD1cXFwicG9zdFxcXCI+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXHJcXG4gICAgPGxhYmVsIGZvcj1cXFwiYWN0aW9uSW5kaWNhdGV1clxcXCI+QWN0aW9uIGFzc29jacOpPC9sYWJlbD5cXHJcXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIiBpZD1cXFwiYWN0aW9uSW5kaWNhdGV1clxcXCI+XFxyXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hY3Rpb25zIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxyXFxuICAgIDwvc2VsZWN0PlxcclxcbiAgPC9kaXY+ICBcXHJcXG4gIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcclxcbiAgICA8bGFiZWwgZm9yPVxcXCJsaWJJbmRpY2F0ZXVyXFxcIj5MaWJlbGzDqTwvbGFiZWw+XFxyXFxuICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIiBpZD1cXFwibGliSW5kaWNhdGV1clxcXCIgcGxhY2Vob2xkZXI9XFxcIkVudHJleiB1biBsaWJlbGzDqVxcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZGljYXRldXIgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYmluZGljIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiByZXF1aXJlZD5cXHJcXG4gIDwvZGl2PlxcclxcbiAgPGRpdiBjbGFzcz1cXFwiZm9ybS1ncm91cFxcXCI+XFxyXFxuICAgIDxsYWJlbCBmb3I9XFxcInBvaWRzSW5kaWNhdGV1clxcXCI+UG9pZHM8L2xhYmVsPlxcclxcbiAgICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgaWQ9XFxcInBvaWRzSW5kaWNhdGV1clxcXCIgcGxhY2Vob2xkZXI9XFxcIkVudHJleiB1biBwb2lkc1xcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZGljYXRldXIgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnBvaWRzIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiByZXF1aXJlZD5cXHJcXG4gIDwvZGl2PlxcclxcbiAgPGJ1dHRvbiBpZD1cXFwic3VibWl0QnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0XFxcIj5WYWxpZGVyPC9idXR0b24+XFxyXFxuICA8L2Zvcm0+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBpbmRpY2F0ZXVyTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9JbmRpY2F0ZXVycy9JbmRpY2F0ZXVyJyk7XHJcbnZhciBhY3Rpb25Nb2RlbD0gcmVxdWlyZSAoJy4uLy4uL01vZGVsL0FjdGlvbnMvQWN0aW9uc0xpc3QnKVxyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL0Fqb3V0SW5kaWNhdGV1ci5oYnMnKTtcclxudmFyIG1vZGFsID0gcmVxdWlyZSgnLi4vR2xvYmFsL21vZGFsLmpzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHQkcGFnZU5hbWUgOiAkKCd0aXRsZScpLFxyXG5cdCR0aXRsZSA6ICQoJyN0aXRsZScpLFx0XHJcblx0JGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHRlbDogJCgnI2Zvcm1Bam91dEluZGljYXRldXInKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuJHBhZ2VOYW1lLmh0bWwoXCJBam91dCBJbmRpY2F0ZXVyXCIpO1xyXG5cdFx0dGhpcy4kdGl0bGUuaHRtbChcIkFqb3V0ZXIgdW4gSW5kaWNhdGV1clwiKTtcclxuXHRcdCQud2hlbihudWxsLG5ldyBhY3Rpb25Nb2RlbCgpLmZldGNoKCkpXHJcblx0XHQuZG9uZShfLmJpbmQoZnVuY3Rpb24oaW5kaWNhdGV1ciwgcmVzcG9uc2Upe1xyXG5cdFx0dGhpcy5yZW5kZXJSZXN1bHRhdChudWxsLHJlc3BvbnNlKTtcclxuICAgICAgICB9LHRoaXMpKTtcclxuXHR9LFxyXG5cdHJlbmRlck1vZGlmOiBmdW5jdGlvbihpZCl7XHJcblx0XHQkLndoZW4obmV3IGluZGljYXRldXJNb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goKSxuZXcgYWN0aW9uTW9kZWwoKS5mZXRjaCgpKVxyXG5cdFx0LmRvbmUoXy5iaW5kKGZ1bmN0aW9uKGluZGljYXRldXIsIHJlc3BvbnNlKXtcclxuXHRcdHRoaXMucmVuZGVyUmVzdWx0YXQoaW5kaWNhdGV1cixyZXNwb25zZSk7XHJcbiAgICAgICAgfSx0aGlzKSk7XHJcblx0XHR0aGlzLiRwYWdlTmFtZS5odG1sKFwiTW9kaWZpZXIgSW5kaWNhdGV1clwiKTtcclxuXHRcdHRoaXMuJHRpdGxlLmh0bWwoXCJNb2RpZmllciB1biBJbmRpY2F0ZXVyXCIpO1xyXG5cdFx0dGhpcy5pZEluZGljYXRldXI9aWQ7XHJcblx0fSxcclxuXHR2YWxpZDogZnVuY3Rpb24oZSl7XHJcblx0XHR2YXIgbGliSW5kaWNhdGV1ciA9ICQoJyNsaWJJbmRpY2F0ZXVyJykudmFsKCk7XHJcblx0XHR2YXIgc2NvcmVBY3Rpb24gPSAkKCcjYWN0aW9uSW5kaWNhdGV1cicpLnZhbCgpO1xyXG5cdFx0dmFyIGxpYlBvaWRzPSQoJyNwb2lkc0luZGljYXRldXInKS52YWwoKTtcclxuXHRcdGNvbnNvbGUubG9nKGxpYkluZGljYXRldXIrXCIgXCIrc2NvcmVBY3Rpb24rXCIgXCIrbGliUG9pZHMpO1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IGluZGljYXRldXJNb2RlbCgpO1xyXG5cdFx0aWYodGhpcy5pZEluZGljYXRldXI9PT11bmRlZmluZWQpXHJcblx0XHR7XHJcblx0XHRcdGNvbnNvbGUubG9nKG1vZGVsKTtcclxuXHRcdFx0bW9kZWwuc2F2ZSh7XCJsaWJpbmRpY1wiOmxpYkluZGljYXRldXIsIFwibnVtYWN0aW9uXCI6c2NvcmVBY3Rpb24gLFwicG9pZHNcIjpsaWJQb2lkc30sIHtcclxuXHRcdFx0XHRzdWNjZXNzOiB0aGlzLnNob3dNb2RhbCxcclxuXHRcdFx0XHRlcnJvcjogdGhpcy5zaG93RXJyb3JNb2RhbFxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0bW9kZWwuc2F2ZSh7XCJpZFwiOnRoaXMuaWRJbmRpY2F0ZXVyLFwibGliaW5kaWNcIjpsaWJJbmRpY2F0ZXVyLCBcIm51bWFjdGlvblwiOnNjb3JlQWN0aW9uICxcInBvaWRzXCI6bGliUG9pZHN9LCB7XHJcblx0XHRcdFx0c3VjY2VzczogdGhpcy5zaG93TW9kYWwsXHJcblx0XHRcdFx0ZXJyb3I6IHRoaXMuc2hvd0Vycm9yTW9kYWxcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHRyZW5kZXJSZXN1bHRhdDogZnVuY3Rpb24oaW5kaWNhdGV1cixyZXNwb25zZSl7XHJcblx0XHRpZihpbmRpY2F0ZXVyPT09bnVsbClcclxuXHRcdHtcclxuXHRcdFx0JCh0aGlzLiRjb250ZW50KS5odG1sKHRlbXBsYXRlKHthY3Rpb25zOiByZXNwb25zZVswXX0pKTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0dGhpcy4kY29udGVudC5odG1sKHRlbXBsYXRlKHtpbmRpY2F0ZXVyOmluZGljYXRldXJbMF0sYWN0aW9uczogcmVzcG9uc2VbMF19KSk7XHJcblx0XHRcdCQoXCIjYWN0aW9uSW5kaWNhdGV1ciBvcHRpb25bdmFsdWU9J1wiK2luZGljYXRldXJbMF0ubnVtYWN0aW9uK1wiJ11cIikuYXR0cihcInNlbGVjdGVkXCIsIFwic2VsZWN0ZWRcIik7XHJcblx0XHR9XHJcblx0XHR2YXIgJGZvcm1Bam91dEluZGljYXRldXIgPSAkKCcjZm9ybUFqb3V0SW5kaWNhdGV1cicpO1xyXG5cclxuXHRcdCRmb3JtQWpvdXRJbmRpY2F0ZXVyLnN1Ym1pdChfLmJpbmQoZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0ICAgIHRoaXMudmFsaWQoKTtcclxuXHRcdH0sIHRoaXMpKTtcclxuXHR9LFxyXG5cdHNob3dNb2RhbDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIkFqb3V0XCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiTCdham91dCBhIMOpdMOpIGVmZmVjdHXDqSBhdmVjIHN1Y2PDqHNcIlxyXG5cdFx0fSk7XHJcblx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcjSW5kaWNhdGV1cnMnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0fSxcclxuXHJcblx0c2hvd0Vycm9yTW9kYWw6IGZ1bmN0aW9uKGVycm9yKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIkFqb3V0XCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiRXJyZXVyIGxvcnMgZGUgbCdham91dCA6IFwiICsgZXJyb3IsXHJcblx0XHQgXHRtb2RhbEVycm9yOiB0cnVlXHJcblx0XHR9KTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsInZhciBpbmRpY2F0ZXVyTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9JbmRpY2F0ZXVycy9JbmRpY2F0ZXVyJyk7XHJcbnZhciBtb2RhbCA9IHJlcXVpcmUoJy4uL0dsb2JhbC9tb2RhbC5qcycpO1xyXG5cclxudmFyIHZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcblx0cmVuZGVyOiBmdW5jdGlvbihpZCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgaW5kaWNhdGV1ck1vZGVsKHtcImlkXCI6aWR9KS5mZXRjaCh7XHJcblx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLmNvbmZpcm0sdGhpcylcclxuXHRcdH0pO1xyXG5cclxuXHR9LFxyXG5cclxuXHRjb25maXJtOmZ1bmN0aW9uKGluZGljYXRldXIpe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJDb25maXJtZXIgbGEgc3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsRm9vdGVyOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBkYXRhLWRpc21pc3M9XCJtb2RhbFwiIGlkPVwiYW5udWxEZWxldGVcIj5Bbm51bGVyPC9idXR0b24+PGEgY2xhc3M9XCJidG4gYnRuLWRhbmdlciBidG4tb2tcIiBpZD1cImNvbmZpcm1EZWxldGVcIiBkYXRhLWRpc21pc3M9XCJtb2RhbFwiPlN1cHByaW1lcjwvYT4nXHJcblx0XHR9KTtcclxuXHRcdCQoJyNjb25maXJtRGVsZXRlJykub24oJ2NsaWNrJyxfLmJpbmQoZnVuY3Rpb24oZSl7XHJcblx0XHRcdHZhciBtb2RlbCA9IG5ldyBpbmRpY2F0ZXVyTW9kZWwoe1wiaWRcIjppbmRpY2F0ZXVyLmlkfSkuZGVzdHJveSh7XHJcblx0XHRcdFx0c3VjY2VzczogXy5iaW5kKHRoaXMudmFsaWQsdGhpcyksXHJcblx0XHRcdFx0ZXJyb3I6IHRoaXMuc2hvd0Vycm9yTW9kYWxcclxuXHRcdFx0fSk7XHJcblx0XHR9LHRoaXMpKTtcclxuXHRcdCQoJyNhbm51bERlbGV0ZScpLm9uKCdjbGljaycsXy5iaW5kKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcjSW5kaWNhdGV1cnMnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0XHR9LHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHR2YWxpZDpmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJTdXBwcmVzc2lvbiBlZmZlY3XDqWVcIlxyXG5cdFx0fSk7XHJcblx0XHQkKCcubW9kYWwtYmFja2Ryb3AnKS5yZW1vdmUoKTtcclxuXHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoJyNJbmRpY2F0ZXVycycsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHR9LFxyXG5cclxuXHRzaG93RXJyb3JNb2RhbDogZnVuY3Rpb24oZXJyb3Ipe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJFcnJldXIgbG9ycyBkZSBsYSBzdXBwcmVzc2lvbiA6IFwiICsgZXJyb3IsXHJcblx0XHQgXHRtb2RhbEVycm9yOiB0cnVlXHJcblx0XHR9KTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiPHRhYmxlIGNsYXNzPVxcXCJ0YWJsZVxcXCI+XFxyXFxuXHQ8dGhlYWQ+XFxyXFxuXHRcdDx0cj5cXHJcXG5cdFx0XHQ8dGg+SWRlbnRpZmlhbnQ8L3RoPlxcclxcblx0XHRcdDx0aD5BY3Rpb24gYXNzb2Npw6llPC90aD5cXHJcXG5cdFx0XHQ8dGg+TGliZWxsw6k8L3RoPlxcclxcblx0XHRcdDx0aD5Qb2lkczwvdGg+XFxyXFxuXHRcdDwvdHI+XFxyXFxuXHQ8L3RoZWFkPlxcclxcblx0PHRib2R5Plxcclxcblx0XHRcdDx0cj5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZGljYXRldXIgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmF0dHJpYnV0ZXMgOiBzdGFjazEpKSAhPSBudWxsID8gc3RhY2sxLm51bWluZGljIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmluZGljYXRldXIgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmF0dHJpYnV0ZXMgOiBzdGFjazEpKSAhPSBudWxsID8gc3RhY2sxLm51bWFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmRpY2F0ZXVyIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hdHRyaWJ1dGVzIDogc3RhY2sxKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJpbmRpYyA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmRpY2F0ZXVyIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hdHRyaWJ1dGVzIDogc3RhY2sxKSkgIT0gbnVsbCA/IHN0YWNrMS5wb2lkcyA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cdDwvdGJvZHk+XFxyXFxuPC90YWJsZT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIGluZGljYXRldXJNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0luZGljYXRldXJzL0luZGljYXRldXInKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9JbmRpY2F0ZXVyLmhicycpO1xyXG5cclxudmFyIHZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcblx0cGFnZU5hbWUgOiAkKCd0aXRsZScpLFxyXG5cdHRpdGxlIDogJCgnI3RpdGxlJyksXHJcblx0Y29udGVudCA6ICQoJyNjb250ZW50JyksXHJcblxyXG5cdC8vQXBwZWzDqSBhdSBtb21lbnQgZGUgbCdpbnN0YW5jaWF0aW9uXHRcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdC8vRm9uY3Rpb24gY2hhcmfDqWUgZHUgcmVuZHVcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHZhciBtb2RlbCA9IG5ldyBpbmRpY2F0ZXVyTW9kZWwoe1wiaWRcIjppZH0pLmZldGNoKHtcclxuXHRcdFx0c3VjY2VzczogXy5iaW5kKHRoaXMucmVuZGVyUmVzdWx0YXQsIHRoaXMpXHJcblx0XHR9KTtcclxuXHRcdCQodGhpcy5wYWdlTmFtZSkuaHRtbChcIkTDqXRhaWwgSW5kaWNhdGV1clwiKTtcclxuXHRcdCQodGhpcy50aXRsZSkuaHRtbChcIkluZm9ybWF0aW9ucyBJbmRpY2F0ZXVyXCIpO1xyXG5cdH0sXHJcblxyXG5cdHJlbmRlclJlc3VsdGF0OiBmdW5jdGlvbihpbmRpY2F0ZXVyKXtcclxuXHRcdCQodGhpcy5jb250ZW50KS5odG1sKHRlbXBsYXRlKHtpbmRpY2F0ZXVyfSkpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0XHRcdDx0ciBvbkNsaWNrPVxcXCJkb2N1bWVudC5sb2NhdGlvbj0nI0luZGljYXRldXJzL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWluZGljIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiJ1xcXCI+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtaW5kaWMgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGliaW5kaWMgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLnBvaWRzIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cXHJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI0luZGljYXRldXJzL01vZGlmaWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWluZGljIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWxcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI0luZGljYXRldXJzL1N1cHByaW1lci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1pbmRpYyA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdDwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIjxhIGhyZWY9XFxcIiNJbmRpY2F0ZXVycy9Bam91dFxcXCI+XFxyXFxuPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLXN1Y2Nlc3NcXFwiPlxcclxcblx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPiBBam91dGVyIEluZGljYXRldXJcXHJcXG5cdFxcclxcbjwvYnV0dG9uPlxcclxcbjwvYT5cXHJcXG48dGFibGUgY2xhc3M9XFxcInRhYmxlXFxcIj5cXHJcXG5cdDx0aGVhZD5cXHJcXG5cdFx0PHRyPlxcclxcblx0XHRcdDx0aD5JZGVudGlmaWFudDwvdGg+XFxyXFxuXHRcdFx0PHRoPkFjdGlvbiBhc3NvY2nDqWU8L3RoPlxcclxcblx0XHRcdDx0aD5MaWJlbGzDqTwvdGg+XFxyXFxuXHRcdFx0PHRoPlBvaWRzPC90aD5cXHJcXG5cdFx0XHQ8dGg+PC90aD5cXHJcXG5cdFx0PC90cj5cXHJcXG5cdDwvdGhlYWQ+XFxyXFxuXHQ8dGJvZHk+XFxyXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5pbmRpY2F0ZXVycyA6IGRlcHRoMCkse1wibmFtZVwiOlwiZWFjaFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlx0PC90Ym9keT5cXHJcXG48L3RhYmxlPlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCJ2YXIgaW5kaWNhdGV1ck1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvSW5kaWNhdGV1cnMvSW5kaWNhdGV1cnNMaXN0Jyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vSW5kaWNhdGV1cnMuaGJzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0dGl0bGUgOiAkKCcjdGl0bGUnKSxcclxuXHRjb250ZW50IDogJCgnI2NvbnRlbnQnKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtb2RlbCA9IG5ldyBpbmRpY2F0ZXVyTW9kZWwoKS5mZXRjaCh7XHJcblx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLnJlbmRlclJlc3VsdGF0LCB0aGlzKVxyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMucGFnZU5hbWUpLmh0bWwoXCJMaXN0ZSBkZXMgSW5kaWNhdGV1cnNcIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJMaXN0ZSBkZXMgSW5kaWNhdGV1cnNcIik7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdCQodGhpcy5jb250ZW50KS5odG1sKHRlbXBsYXRlKHtpbmRpY2F0ZXVyczogcmVzcG9uc2UudG9BcnJheSgpfSkpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwidmFyIEluZGljYXRldXJzID0gcmVxdWlyZSgnLi9JbmRpY2F0ZXVycycpO1xyXG52YXIgSW5kaWNhdGV1ciA9IHJlcXVpcmUoJy4vSW5kaWNhdGV1cicpO1xyXG52YXIgQWpvdXRJbmRpY2F0ZXVyID0gcmVxdWlyZSgnLi9Bam91dEluZGljYXRldXInKTtcclxudmFyIERlbGV0ZUluZGljYXRldXIgPSByZXF1aXJlKCcuL0RlbGV0ZUluZGljYXRldXInKTtcclxuXHJcbnZhciBSb3V0ZXIgPSBCYWNrYm9uZS5Sb3V0ZXIuZXh0ZW5kKHtcclxuXHRyb3V0ZXM6IHtcclxuXHRcdFwiSW5kaWNhdGV1cnNcIjogXCJJbmRpY2F0ZXVyc1wiLFxyXG5cdFx0XCJJbmRpY2F0ZXVycy9Bam91dFwiOiBcIkFqb3V0SW5kaWNhdGV1clwiLFxyXG5cdFx0XCJJbmRpY2F0ZXVycy9Nb2RpZmllci86aWRcIjogXCJNb2RpZkluZGljYXRldXJcIixcclxuXHRcdFwiSW5kaWNhdGV1cnMvU3VwcHJpbWVyLzppZFwiOiBcIlN1cHBySW5kaWNhdGV1clwiLFxyXG5cdFx0XCJJbmRpY2F0ZXVycy86aWRcIjogXCJJbmRpY2F0ZXVyXCJcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cclxuXHR9LFxyXG5cclxuXHRJbmRpY2F0ZXVyczogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuSW5kaWNhdGV1cnMgPSBuZXcgSW5kaWNhdGV1cnMoKTtcclxuXHRcdHRoaXMuSW5kaWNhdGV1cnMucmVuZGVyKCk7XHJcblx0fSxcclxuXHJcblx0SW5kaWNhdGV1cjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5JbmRpY2F0ZXVyID0gbmV3IEluZGljYXRldXIoKTtcclxuXHRcdHRoaXMuSW5kaWNhdGV1ci5yZW5kZXIoaWQpO1xyXG5cdH0sXHJcblxyXG5cdEFqb3V0SW5kaWNhdGV1cjogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuSW5kaWNhdGV1ciA9IG5ldyBBam91dEluZGljYXRldXIoKTtcclxuXHRcdHRoaXMuSW5kaWNhdGV1ci5yZW5kZXIoKTtcclxuXHR9LFxyXG5cdE1vZGlmSW5kaWNhdGV1cjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5JbmRpY2F0ZXVyID0gbmV3IEFqb3V0SW5kaWNhdGV1cigpO1xyXG5cdFx0dGhpcy5JbmRpY2F0ZXVyLnJlbmRlck1vZGlmKGlkKTtcclxuXHR9LFxyXG5cdFN1cHBySW5kaWNhdGV1cjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5pbmRpY2F0ZXVyID0gbmV3IERlbGV0ZUluZGljYXRldXIoKTtcclxuXHRcdHRoaXMuaW5kaWNhdGV1ci5yZW5kZXIoaWQpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlcjsiLCJ2YXIgamV1TW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9KZXV4L0pldScpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHJlbmRlcjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IGpldU1vZGVsKHtcImlkXCI6aWR9KS5mZXRjaCh7XHJcblx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLmNvbmZpcm0sdGhpcylcclxuXHRcdH0pO1xyXG5cclxuXHR9LFxyXG5cclxuXHRjb25maXJtOmZ1bmN0aW9uKGpldSl7XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJTdXBwcmVzc2lvblwiLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIkNvbmZpcm1lciBsYSBzdXBwcmVzc2lvblwiLFxyXG5cdFx0IFx0bW9kYWxGb290ZXI6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIGRhdGEtZGlzbWlzcz1cIm1vZGFsXCIgaWQ9XCJhbm51bERlbGV0ZVwiPkFubnVsZXI8L2J1dHRvbj48YSBjbGFzcz1cImJ0biBidG4tZGFuZ2VyIGJ0bi1va1wiIGlkPVwiY29uZmlybURlbGV0ZVwiIGRhdGEtZGlzbWlzcz1cIm1vZGFsXCI+U3VwcHJpbWVyPC9hPidcclxuXHRcdH0pO1xyXG5cdFx0JCgnI2NvbmZpcm1EZWxldGUnKS5vbignY2xpY2snLF8uYmluZChmdW5jdGlvbihlKXtcclxuXHRcdFx0dmFyIG1vZGVsID0gbmV3IGpldU1vZGVsKHtcImlkXCI6amV1LmlkfSkuZGVzdHJveSh7XHJcblx0XHRcdFx0c3VjY2VzczogXy5iaW5kKHRoaXMudmFsaWQsdGhpcyksXHJcblx0XHRcdFx0ZXJyb3I6IHRoaXMuc2hvd0Vycm9yTW9kYWxcclxuXHRcdFx0fSk7XHJcblx0XHR9LHRoaXMpKTtcclxuXHRcdCQoJyNhbm51bERlbGV0ZScpLm9uKCdjbGljaycsXy5iaW5kKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcjSmV1eCcsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdH0sXHJcblxyXG5cdHZhbGlkOmZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJTdXBwcmVzc2lvblwiLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIlN1cHByZXNzaW9uIGVmZmVjdcOpZVwiXHJcblx0XHR9KTtcclxuXHRcdCQoJy5tb2RhbC1iYWNrZHJvcCcpLnJlbW92ZSgpO1xyXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI0pldXgnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0fSxcclxuXHJcblx0c2hvd0Vycm9yTW9kYWw6IGZ1bmN0aW9uKGVycm9yKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIlN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiRXJyZXVyIGxvcnMgZGUgbGEgc3VwcHJlc3Npb24gOiBcIiArIGVycm9yLFxyXG5cdFx0IFx0bW9kYWxFcnJvcjogdHJ1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcblx0PHRoZWFkPlxcclxcblx0XHQ8dHI+XFxyXFxuXHRcdFx0PHRoPk51bcOpcm8gZHUgamV1PC90aD5cXHJcXG5cdFx0XHQ8dGg+Tm9tIGR1IGpldTwvdGg+XFxyXFxuXHRcdDwvdHI+XFxyXFxuXHQ8L3RoZWFkPlxcclxcblx0PHRib2R5Plxcclxcblx0XHRcdDx0cj5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmpldSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuYXR0cmlidXRlcyA6IHN0YWNrMSkpICE9IG51bGwgPyBzdGFjazEubnVtamV1IDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmpldSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuYXR0cmlidXRlcyA6IHN0YWNrMSkpICE9IG51bGwgPyBzdGFjazEubGliZWxsZWpldSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cdDwvdGJvZHk+XFxyXFxuPC90YWJsZT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIGpldU1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvSmV1eC9KZXUnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9KZXUuaGJzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0dGl0bGUgOiAkKCcjdGl0bGUnKSxcclxuXHRjb250ZW50IDogJCgnI2NvbnRlbnQnKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IGpldU1vZGVsKHtcImlkXCI6aWR9KS5mZXRjaCh7XHJcblx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLnJlbmRlclJlc3VsdGF0LCB0aGlzKVxyXG5cdFx0fSk7XHJcblx0XHQkKHRoaXMucGFnZU5hbWUpLmh0bWwoXCJEw6l0YWlsIEpldVwiKTtcclxuXHRcdCQodGhpcy50aXRsZSkuaHRtbChcIkluZm9ybWF0aW9ucyBKZXVcIik7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKGpldSl7XHJcblx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZSh7amV1fSkpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgaGVscGVyLCBhbGlhczE9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczI9XCJmdW5jdGlvblwiLCBhbGlhczM9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0XHRcdDx0ciBvbkNsaWNrPVxcXCJkb2N1bWVudC5sb2NhdGlvbj0nI0pldXgvXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bWpldSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtamV1IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJudW1qZXVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiJ1xcXCI+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bWpldSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtamV1IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJudW1qZXVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGliZWxsZWpldSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGliZWxsZWpldSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibGliZWxsZWpldVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPm51bcOpcm88L3RkPlxcclxcblx0XHRcdFx0PHRkPmxpYmVsbMOpPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cXHJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI0pldXgvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bWpldSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtamV1IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJudW1qZXVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWxcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI0pldXgvU3VwcHJpbWVyL1wiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5udW1qZXUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm51bWpldSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtamV1XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdDwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1pc3Npb25KZXUgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcdFx0XHQ8dHI+XFxyXFxuXHRcdFx0XHQ8dGQ+PC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD48L3RkPlxcclxcblx0XHRcdFx0PHRkPlxcclxcblx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjSmV1eC9cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubnVtamV1IHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5udW1qZXUgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm51bWpldVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCIvTWlzc2lvbnMvQWpvdXRcXFwiPlxcclxcblx0XHRcdFx0XHRcdDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1zdWNjZXNzXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPkFqb3V0ZXIgTWlzc2lvbjwvYnV0dG9uPlxcclxcblx0XHRcdFx0XHQ8L2E+XFxyXFxuXHRcdFx0XHQ8L3RkPlxcclxcblx0XHRcdDwvdHI+XFxyXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyLCBhbGlhczE9aGVscGVycy5oZWxwZXJNaXNzaW5nLCBhbGlhczI9XCJmdW5jdGlvblwiLCBhbGlhczM9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0XHRcdDx0ciBvbkNsaWNrPVxcXCJkb2N1bWVudC5sb2NhdGlvbj0nI0pldXgvXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bWpldSB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtamV1IDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJudW1qZXVcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiL01pc3Npb25zL1wiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5udW1taXNzaW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5udW1taXNzaW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJudW1taXNzaW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIidcXFwiPlxcclxcblx0XHRcdFx0PHRkPjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+PC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubnVtbWlzc2lvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtbWlzc2lvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtbWlzc2lvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5saWJtaXNzaW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5saWJtaXNzaW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJsaWJtaXNzaW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNKZXV4L1wiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5udW1qZXUgfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm51bWpldSA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtamV1XCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIi9NaXNzaW9ucy9Nb2RpZmllci9cIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubnVtbWlzc2lvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtbWlzc2lvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtbWlzc2lvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCJcXFwiPlxcclxcblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjSmV1eC9NaXNzaW9ucy9TdXBwcmltZXIvXCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bW1pc3Npb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm51bW1pc3Npb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm51bW1pc3Npb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi10cmFzaFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0PC90ZD5cXHJcXG5cdFx0XHQ8L3RyPlxcclxcblwiO1xufSxcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiPGEgaHJlZj1cXFwiI0pldXgvQWpvdXRcXFwiPlxcclxcbjxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1zdWNjZXNzXFxcIj5cXHJcXG4gIDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBsdXNcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+IEFqb3V0ZXIgSmV1XFxyXFxuPC9idXR0b24+XFxyXFxuPC9hPlxcclxcbjx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcblx0PHRoZWFkPlxcclxcblx0XHQ8dHI+XFxyXFxuXHRcdFx0PHRoPk51bcOpcm8gZHUgamV1PC90aD5cXHJcXG5cdFx0XHQ8dGg+Tm9tIGR1IGpldTwvdGg+XFxyXFxuXHRcdFx0PHRoPk1pc3Npb248dGg+XFxyXFxuXHRcdFx0PHRoPjwvdGg+XFxyXFxuXHRcdDwvdHI+XFxyXFxuXHQ8L3RoZWFkPlxcclxcblx0PHRib2R5PlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuamV1eCA6IGRlcHRoMCkse1wibmFtZVwiOlwiZWFjaFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlx0PC90Ym9keT5cXHJcXG48L3RhYmxlPlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCJ2YXIgamV1eE1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvSmV1eC9KZXV4TGlzdCcpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL0pldXguaGJzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0dGl0bGUgOiAkKCcjdGl0bGUnKSxcclxuXHRjb250ZW50IDogJCgnI2NvbnRlbnQnKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdCQud2hlbihuZXcgamV1eE1vZGVsKCkuZmV0Y2goKSlcclxuXHRcdC5kb25lKF8uYmluZChmdW5jdGlvbihqZXV4KXtcclxuXHRcdFx0dGhpcy5yZW5kZXJSZXN1bHRhdChqZXV4KTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdFx0JCh0aGlzLnBhZ2VOYW1lKS5odG1sKFwiTGlzdGUgZGVzIEpldXhcIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJMaXN0ZSBkZXMgSmV1eFwiKTtcclxuXHR9LFxyXG5cclxuXHRyZW5kZXJSZXN1bHRhdDogZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0Y29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG5cdFx0JCh0aGlzLmNvbnRlbnQpLmh0bWwodGVtcGxhdGUoe2pldXg6cmVzcG9uc2V9KSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCIgIDxmb3JtIGlkPVxcXCJmb3JtUHV0SmV1XFxcIiBtZXRob2Q9XFxcInBvc3RcXFwiPlxcclxcbiAgPGRpdiBjbGFzcz1cXFwiZm9ybS1ncm91cFxcXCI+XFxyXFxuICAgIDxsYWJlbCBmb3I9XFxcImxpYmVsbGVqZXVcXFwiPkxpYmVsbMOpPC9sYWJlbD5cXHJcXG4gICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJmb3JtLWNvbnRyb2xcXFwiIGlkPVxcXCJsaWJlbGxlamV1XFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50cmV6IHVuIG5vbVxcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyB0aGlzLmVzY2FwZUV4cHJlc3Npb24odGhpcy5sYW1iZGEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuamV1IDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJlbGxlamV1IDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiByZXF1aXJlZD5cXHJcXG4gIDwvZGl2PlxcclxcbiAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0XFxcIj5WYWxpZGVyPC9idXR0b24+XFxyXFxuICA8L2Zvcm0+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBqZXVNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0pldXgvSmV1Jyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vUHV0SmV1LmhicycpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdCRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0JHRpdGxlIDogJCgnI3RpdGxlJyksXHRcclxuXHQkY29udGVudCA6ICQoJyNjb250ZW50JyksXHJcblxyXG5cdGVsOiAkKCcjZm9ybVB1dEpldScpLFxyXG5cclxuXHQvL0FwcGVsw6kgYXUgbW9tZW50IGRlIGwnaW5zdGFuY2lhdGlvblx0XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHR9LFxyXG5cclxuXHQvL0ZvbmN0aW9uIGNoYXJnw6llIGR1IHJlbmR1XHJcblx0cmVuZGVyOiBmdW5jdGlvbigpe1xyXG5cdFx0JC53aGVuKG5ldyBqZXVNb2RlbCgpLmZldGNoKCkpXHJcblx0XHQuZG9uZShfLmJpbmQoZnVuY3Rpb24oamV1KXtcclxuXHRcdFx0dGhpcy5yZW5kZXJSZXN1bHRhdChqZXUpO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0XHR0aGlzLiRwYWdlTmFtZS5odG1sKFwiQWpvdXQgSmV1XCIpO1xyXG5cdFx0dGhpcy4kdGl0bGUuaHRtbChcIkFqb3V0ZXIgdW4gSmV1XCIpO1xyXG5cdH0sXHJcblxyXG5cdHJlbmRlck1vZGlmOiBmdW5jdGlvbihpZCl7XHJcblx0XHQkLndoZW4obmV3IGpldU1vZGVsKHtcImlkXCI6aWR9KS5mZXRjaCgpKVxyXG5cdFx0LmRvbmUoXy5iaW5kKGZ1bmN0aW9uKGpldSl7XHJcblx0XHRcdHRoaXMucmVuZGVyUmVzdWx0YXQoamV1KTtcclxuXHRcdH0sdGhpcykpO1x0XHRcclxuXHRcdHRoaXMuJHBhZ2VOYW1lLmh0bWwoXCJNb2RpZmllciBKZXVcIik7XHJcblx0XHR0aGlzLiR0aXRsZS5odG1sKFwiTW9kaWZpZXIgdW4gSmV1XCIpO1xyXG5cdFx0dGhpcy5pZEpldT1pZDtcclxuXHR9LFxyXG5cdHZhbGlkOiBmdW5jdGlvbihlKXtcclxuXHRcdHZhciBsaWJlbGxlamV1ID0gJCgnI2xpYmVsbGVqZXUnKS52YWwoKTtcclxuXHRcdHZhciBtb2RlbCA9IG5ldyBqZXVNb2RlbCgpO1xyXG5cdFx0aWYgKHRoaXMuaWRKZXU9PT11bmRlZmluZWQpe1xyXG5cdFx0XHRtb2RlbC5zYXZlKHtcImxpYmVsbGVqZXVcIjpsaWJlbGxlamV1fSwge1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IHRoaXMuc2hvd01vZGFsKFwiQWpvdXRcIiksXHJcblx0XHRcdFx0ZXJyb3I6IHRoaXMuc2hvd0Vycm9yTW9kYWxcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHRtb2RlbC5zYXZlKHtcImlkXCI6dGhpcy5pZEpldSwgXCJsaWJlbGxlamV1XCI6bGliZWxsZWpldX0sIHtcclxuXHRcdFx0XHRzdWNjZXNzOiB0aGlzLnNob3dNb2RhbChcIk1vZGlmaWVyXCIpLFxyXG5cdFx0XHRcdGVycm9yOiB0aGlzLnNob3dFcnJvck1vZGFsXHJcblx0XHRcdH0pO1xyXG5cdFx0fSBcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0sXHJcblxyXG5cdHJlbmRlclJlc3VsdGF0OiBmdW5jdGlvbihyZXNwb25zZSl7XHJcblx0XHRpZihyZXNwb25zZT09PXVuZGVmaW5lZCl7XHJcblx0XHRcdHRoaXMuJGNvbnRlbnQuaHRtbCh0ZW1wbGF0ZSgpKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR0aGlzLiRjb250ZW50Lmh0bWwodGVtcGxhdGUoe2pldTpyZXNwb25zZX0pKTtcclxuXHRcdH1cclxuXHRcdCQoJyNmb3JtUHV0SmV1Jykuc3VibWl0KF8uYmluZChmdW5jdGlvbihldmVudCl7XHJcblx0XHQgICAgdGhpcy52YWxpZCgpO1xyXG5cdFx0fSwgdGhpcykpO1xyXG5cdH0sXHJcblxyXG5cdHNob3dNb2RhbDogZnVuY3Rpb24oamV1VHlwZSl7XHJcblx0XHR2YXIgQXJ0aWNsZU1vZGFsQm9keSA9IFwiTGFcIjtcclxuXHRcdGlmKGpldVR5cGUgPT09IFwiQWpvdXRcIil7XHJcblx0XHRcdEFydGljbGVNb2RhbEJvZHkgPSBcIkwnXCI7XHJcblx0XHR9XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogamV1VHlwZSxcclxuXHRcdCBcdG1vZGFsQm9keTogQXJ0aWNsZU1vZGFsQm9keStcIiBcIitqZXVUeXBlK1wiIGEgw6l0w6kgZWZmZWN0dcOpIGF2ZWMgc3VjY8Ooc1wiXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI0pldXgnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0fSxcclxuXHJcblx0c2hvd0Vycm9yTW9kYWw6IGZ1bmN0aW9uKGVycm9yKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIkFqb3V0L01vZGlmaWVyXCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiRXJyZXVyIGxvcnMgZGUgbCdham91dC9tb2RpZmljYXRpb24gOiBcIiArIGVycm9yLFxyXG5cdFx0IFx0bW9kYWxFcnJvcjogdHJ1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCJ2YXIgSmV1eCA9IHJlcXVpcmUoJy4vSmV1eCcpO1xyXG52YXIgSmV1ID0gcmVxdWlyZSgnLi9KZXUnKTtcclxudmFyIFB1dEpldSA9IHJlcXVpcmUoJy4vUHV0SmV1Jyk7XHJcbnZhciBEZWxldGVKZXUgPSByZXF1aXJlKCcuL0RlbGV0ZUpldScpO1xyXG5cclxudmFyIFJvdXRlciA9IEJhY2tib25lLlJvdXRlci5leHRlbmQoe1xyXG5cdHJvdXRlczoge1xyXG5cdFx0XCJKZXV4XCI6IFwiSmV1eFwiLFxyXG5cdFx0XCJKZXV4L0Fqb3V0XCI6IFwiQWpvdXRKZXVcIixcclxuXHRcdFwiSmV1eC9Nb2RpZmllci86aWRcIjogXCJNb2RpZkpldVwiLFxyXG5cdFx0XCJKZXV4L1N1cHByaW1lci86aWRcIjogXCJTdXBwckpldVwiLFxyXG5cdFx0XCJKZXV4LzppZFwiOiBcIkpldVwiXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHJcblx0fSxcclxuXHJcblx0SmV1eDogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuSmV1eCA9IG5ldyBKZXV4KCk7XHJcblx0XHR0aGlzLkpldXgucmVuZGVyKCk7XHJcblx0fSxcclxuXHJcblx0SmV1OiBmdW5jdGlvbihpZCl7XHJcblx0XHR0aGlzLkpldSA9IG5ldyBKZXUoKTtcclxuXHRcdHRoaXMuSmV1LnJlbmRlcihpZCk7XHJcblx0fSxcclxuXHJcblx0QWpvdXRKZXU6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLkpldSA9IG5ldyBQdXRKZXUoKTtcclxuXHRcdHRoaXMuSmV1LnJlbmRlcigpO1xyXG5cdH0sXHJcblxyXG5cdE1vZGlmSmV1OiBmdW5jdGlvbihpZCl7XHJcblx0XHR0aGlzLkpldSA9IG5ldyBQdXRKZXUoKTtcclxuXHRcdHRoaXMuSmV1LnJlbmRlck1vZGlmKGlkKTtcclxuXHR9LFxyXG5cclxuXHRTdXBwckpldTogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5KZXUgPSBuZXcgRGVsZXRlSmV1KCk7XHJcblx0XHR0aGlzLkpldS5yZW5kZXIoaWQpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlcjsiLCJ2YXIgbWlzc2lvbk1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvTWlzc2lvbnMvTWlzc2lvbicpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHJlbmRlcjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IG1pc3Npb25Nb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5jb25maXJtLHRoaXMpXHJcblx0XHR9KTtcclxuXHJcblx0fSxcclxuXHJcblx0Y29uZmlybTpmdW5jdGlvbihtaXNzaW9uKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIlN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiQ29uZmlybWVyIGxhIHN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEZvb3RlcjogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIiBpZD1cImFubnVsRGVsZXRlXCI+QW5udWxlcjwvYnV0dG9uPjxhIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgYnRuLW9rXCIgaWQ9XCJjb25maXJtRGVsZXRlXCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIj5TdXBwcmltZXI8L2E+J1xyXG5cdFx0fSk7XHJcblx0XHQkKCcjY29uZmlybURlbGV0ZScpLm9uKCdjbGljaycsXy5iaW5kKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHR2YXIgbW9kZWwgPSBuZXcgbWlzc2lvbk1vZGVsKHtcImlkXCI6bWlzc2lvbi5pZH0pLmRlc3Ryb3koe1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLnZhbGlkLHRoaXMpLFxyXG5cdFx0XHRcdGVycm9yOiB0aGlzLnNob3dFcnJvck1vZGFsXHJcblx0XHRcdH0pO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0XHQkKCcjYW5udWxEZWxldGUnKS5vbignY2xpY2snLF8uYmluZChmdW5jdGlvbihlKXtcclxuXHRcdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI01pc3Npb25zJywge3RyaWdnZXI6dHJ1ZX0pO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0fSxcclxuXHJcblx0dmFsaWQ6ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIlN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiU3VwcHJlc3Npb24gZWZmZWN1w6llXCJcclxuXHRcdH0pO1xyXG5cdFx0JCgnLm1vZGFsLWJhY2tkcm9wJykucmVtb3ZlKCk7XHJcblx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcjSmV1eCcsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHRcdEJhY2tib25lLmhpc3Rvcnkuc3RvcCgpOyBcclxuXHRcdEJhY2tib25lLmhpc3Rvcnkuc3RhcnQoKTtcclxuXHR9LFxyXG5cclxuXHRzaG93RXJyb3JNb2RhbDogZnVuY3Rpb24oZXJyb3Ipe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJFcnJldXIgbG9ycyBkZSBsYSBzdXBwcmVzc2lvbiA6IFwiICsgZXJyb3IsXHJcblx0XHQgXHRtb2RhbEVycm9yOiB0cnVlXHJcblx0XHR9KTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT10aGlzLmxhbWJkYSwgYWxpYXMyPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCJcdFx0XHQ8dHIgb25DbGljaz1cXFwiZG9jdW1lbnQubG9jYXRpb249JyNPYmplY3RpZnMvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJzInXSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtb2JqZWN0aWYgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCInXFxcIj5cXHJcXG5cdFx0XHRcdDx0ZD48L3RkPlxcclxcblx0XHRcdFx0PHRkPjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDBbJzInXSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtb2JqZWN0aWYgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWycyJ10gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYm9iamVjdGlmIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cXHJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI09iamVjdGlmcy9Nb2RpZmllci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMFsnMiddIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1vYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPlxcclxcblx0XHRcdFx0XHQ8L2E+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNPYmplY3RpZnMvU3VwcHJpbWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwWycyJ10gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bW9iamVjdGlmIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi10cmFzaFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0PC90ZD5cXHJcXG5cdFx0XHQ8L3RyPlxcclxcblwiO1xufSxcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT10aGlzLmxhbWJkYSwgYWxpYXMyPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCI8dGFibGUgY2xhc3M9XFxcInRhYmxlXFxcIj5cXHJcXG5cdDx0aGVhZD5cXHJcXG5cdFx0PHRyPlxcclxcblx0XHRcdDx0aD5JZGVudGlmaWFudDwvdGg+XFxyXFxuXHRcdFx0PHRoPkxpYmVsbMOpIE1pc3Npb248L3RoPlxcclxcblx0XHRcdDx0aD5PYmplY3RpZnMgbGnDqTwvdGg+XFxyXFxuXHRcdFx0PHRoPjwvdGg+XFxyXFxuXHRcdDwvdHI+XFxyXFxuXHQ8L3RoZWFkPlxcclxcblx0PHRib2R5Plxcclxcblx0XHRcdDx0cj5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5taXNzaW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1taXNzaW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5taXNzaW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJtaXNzaW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5JZGVudGlmaWFudDwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+TGliZWxsw6kgT2JqZWN0aWY8L3RkPlxcclxcblx0XHRcdFx0PHRkPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjSmV1eC9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5taXNzaW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1qZXUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCIvTWlzc2lvbnMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWlzc2lvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtbWlzc2lvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPlxcclxcblx0XHRcdFx0XHQ8L2E+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNKZXV4L01pc3Npb25zL1N1cHByaW1lci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5taXNzaW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1taXNzaW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi10cmFzaFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0PC90ZD5cXHJcXG5cdFx0XHQ8L3RyPlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub2JqZWN0aWZzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXHRcdFx0PHRyPlxcclxcblx0XHRcdFx0PHRkPjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+PC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cXHJcXG5cdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI0pldXgvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubWlzc2lvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtamV1IDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiL01pc3Npb25zL01vZGlmaWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm1pc3Npb24gOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bW1pc3Npb24gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCIvT2JqZWN0aWZzL0Fqb3V0XFxcIj5cXHJcXG5cdFx0XHRcdFx0XHQ8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0biBidG4tc3VjY2Vzc1xcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tcGx1c1xcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5GaXhlciBPYmplY3RpZjwvYnV0dG9uPlxcclxcblx0XHRcdFx0XHQ8L2E+XFxyXFxuXHRcdFx0XHQ8L3RkPlxcclxcblx0XHRcdDwvdHI+XFxyXFxuXHQ8L3Rib2R5PlxcclxcbjwvdGFibGU+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBtaXNzaW9uTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9NaXNzaW9ucy9NaXNzaW9uJyk7XHJcbnZhciBvYmplY3RpZkxpc3Q9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0ZpeGUvRml4ZScpXHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vTWlzc2lvbi5oYnMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHBhZ2VOYW1lIDogJCgndGl0bGUnKSxcclxuXHR0aXRsZSA6ICQoJyN0aXRsZScpLFxyXG5cdGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHQvL0FwcGVsw6kgYXUgbW9tZW50IGRlIGwnaW5zdGFuY2lhdGlvblx0XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHR9LFxyXG5cclxuXHQvL0ZvbmN0aW9uIGNoYXJnw6llIGR1IHJlbmR1XHJcblx0cmVuZGVyOiBmdW5jdGlvbihpZCl7XHJcblx0XHR2YXIgb2JqZWN0aWZzPW5ldyBvYmplY3RpZkxpc3QoKTtcclxuXHRcdGNvbnNvbGUubG9nKGlkKTtcclxuXHRcdG9iamVjdGlmcy51cmxSb290PW9iamVjdGlmcy51cmxSb290KycnK2lkK1wiL09iamVjdGlmXCI7XHJcblx0XHQkLndoZW4obmV3IG1pc3Npb25Nb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goKSxvYmplY3RpZnMuZmV0Y2goKSlcclxuXHRcdC5kb25lKF8uYmluZChmdW5jdGlvbihtaXNzaW9uLG9iamVjdGlmcyl7XHJcblx0XHRcdHRoaXMucmVuZGVyUmVzdWx0YXQobWlzc2lvbixvYmplY3RpZnMpO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0XHQkKHRoaXMucGFnZU5hbWUpLmh0bWwoXCJEw6l0YWlsIE1pc3Npb25cIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJJbmZvcm1hdGlvbnMgTWlzc2lvblwiKTtcclxuXHR9LFxyXG5cclxuXHRyZW5kZXJSZXN1bHRhdDogZnVuY3Rpb24obWlzc2lvbixvYmplY3RpZnMpe1xyXG5cdFx0Y29uc29sZS5sb2cobWlzc2lvbik7XHJcblx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZSh7bWlzc2lvbjptaXNzaW9uWzBdLG9iamVjdGlmczpvYmplY3RpZnNbMF19KSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCIgIDxmb3JtIGlkPVxcXCJmb3JtUHV0TWlzc2lvblxcXCIgbWV0aG9kPVxcXCJwb3N0XFxcIj5cXHJcXG4gIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcclxcbiAgPGxhYmVsIGZvcj1cXFwibGlibWlzc2lvblxcXCI+TGliZWxsw6k8L2xhYmVsPlxcclxcbiAgICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgaWQ9XFxcImxpYm1pc3Npb25cXFwiIHBsYWNlaG9sZGVyPVxcXCJFbnRyZXogdW4gbm9tXFxcIiB2YWx1ZT1cXFwiXCJcbiAgICArIHRoaXMuZXNjYXBlRXhwcmVzc2lvbih0aGlzLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5taXNzaW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJtaXNzaW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIiByZXF1aXJlZD5cXHJcXG4gIDwvZGl2PlxcclxcbiAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0XFxcIj5WYWxpZGVyPC9idXR0b24+XFxyXFxuICA8L2Zvcm0+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBtaXNzaW9uTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9NaXNzaW9ucy9NaXNzaW9uJyk7XHJcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vUHV0TWlzc2lvbi5oYnMnKTtcclxudmFyIG1vZGFsID0gcmVxdWlyZSgnLi4vR2xvYmFsL21vZGFsLmpzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHQkcGFnZU5hbWUgOiAkKCd0aXRsZScpLFxyXG5cdCR0aXRsZSA6ICQoJyN0aXRsZScpLFx0XHJcblx0JGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHRlbDogJCgnI2Zvcm1QdXRNaXNzaW9uJyksXHJcblxyXG5cdC8vQXBwZWzDqSBhdSBtb21lbnQgZGUgbCdpbnN0YW5jaWF0aW9uXHRcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdC8vRm9uY3Rpb24gY2hhcmfDqWUgZHUgcmVuZHVcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKGlkSmV1KXtcclxuXHRcdHRoaXMucmVuZGVyUmVzdWx0YXQodW5kZWZpbmVkKTtcclxuXHRcdHRoaXMuJHBhZ2VOYW1lLmh0bWwoXCJBam91dCBtaXNzaW9uXCIpO1xyXG5cdFx0dGhpcy4kdGl0bGUuaHRtbChcIkFqb3V0ZXIgdW4gbWlzc2lvblwiKTtcclxuXHRcdHRoaXMuaWRKZXU9aWRKZXU7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyTW9kaWY6IGZ1bmN0aW9uKGlkLGlkSmV1KXtcclxuXHRcdCQud2hlbihuZXcgbWlzc2lvbk1vZGVsKHtcImlkXCI6aWRKZXV9KS5mZXRjaCgpKVxyXG5cdFx0LmRvbmUoXy5iaW5kKGZ1bmN0aW9uKG1pc3Npb24pe1xyXG5cdFx0XHR0aGlzLnJlbmRlclJlc3VsdGF0KG1pc3Npb24pO1xyXG5cdFx0fSx0aGlzKSk7XHRcdFxyXG5cdFx0dGhpcy4kcGFnZU5hbWUuaHRtbChcIk1vZGlmaWVyIG1pc3Npb25cIik7XHJcblx0XHR0aGlzLiR0aXRsZS5odG1sKFwiTW9kaWZpZXIgdW4gbWlzc2lvblwiKTtcclxuXHRcdHRoaXMuaWRNaXNzaW9uPWlkO1xyXG5cdFx0dGhpcy5pZEpldT1pZEpldTtcclxuXHR9LFxyXG5cdHZhbGlkOiBmdW5jdGlvbihlKXtcclxuXHRcdHZhciBsaWJtaXNzaW9uID0gJCgnI2xpYm1pc3Npb24nKS52YWwoKTtcclxuXHRcdHZhciBtb2RlbCA9IG5ldyBtaXNzaW9uTW9kZWwoKTtcclxuXHRcdGlmICh0aGlzLmlkTWlzc2lvbj09PXVuZGVmaW5lZCl7XHJcblx0XHRcdG1vZGVsLnNhdmUoe1wibnVtamV1XCI6dGhpcy5pZEpldSxcImxpYm1pc3Npb25cIjpsaWJtaXNzaW9ufSwge1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IHRoaXMuc2hvd01vZGFsKFwiQWpvdXRcIiksXHJcblx0XHRcdFx0ZXJyb3I6IHRoaXMuc2hvd0Vycm9yTW9kYWxcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHRtb2RlbC5zYXZlKHtcImlkXCI6dGhpcy5pZE1pc3Npb24sXCJudW1qZXVcIjp0aGlzLmlkSmV1LCBcImxpYm1pc3Npb25cIjpsaWJtaXNzaW9ufSwge1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IHRoaXMuc2hvd01vZGFsKFwiTW9kaWZpZXJcIiksXHJcblx0XHRcdFx0ZXJyb3I6IHRoaXMuc2hvd0Vycm9yTW9kYWxcclxuXHRcdFx0fSk7XHJcblx0XHR9IFxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdGlmKHJlc3BvbnNlPT09dW5kZWZpbmVkKXtcclxuXHRcdFx0dGhpcy4kY29udGVudC5odG1sKHRlbXBsYXRlKCkpO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHRoaXMuJGNvbnRlbnQuaHRtbCh0ZW1wbGF0ZSh7bWlzc2lvbjpyZXNwb25zZX0pKTtcclxuXHRcdH1cclxuXHRcdCQoJyNmb3JtUHV0TWlzc2lvbicpLnN1Ym1pdChfLmJpbmQoZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0ICAgIHRoaXMudmFsaWQoKTtcclxuXHRcdH0sIHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHRzaG93TW9kYWw6IGZ1bmN0aW9uKG1pc3Npb25UeXBlKXtcclxuXHRcdHZhciBBcnRpY2xlTW9kYWxCb2R5ID0gXCJMYVwiO1xyXG5cdFx0aWYobWlzc2lvblR5cGUgPT09IFwiQWpvdXRcIil7XHJcblx0XHRcdEFydGljbGVNb2RhbEJvZHkgPSBcIkwnXCI7XHJcblx0XHR9XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogbWlzc2lvblR5cGUsXHJcblx0XHQgXHRtb2RhbEJvZHk6IEFydGljbGVNb2RhbEJvZHkrXCIgXCIrbWlzc2lvblR5cGUrXCIgYSDDqXTDqSBlZmZlY3R1w6kgYXZlYyBzdWNjw6hzXCJcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcjSmV1eCcpO1xyXG5cdFx0d2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG5cdH0sXHJcblxyXG5cdHNob3dFcnJvck1vZGFsOiBmdW5jdGlvbihlcnJvcil7XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJBam91dC9Nb2RpZmllclwiLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIkVycmV1ciBsb3JzIGRlIGwnYWpvdXQvbW9kaWZpY2F0aW9uIDogXCIgKyBlcnJvcixcclxuXHRcdCBcdG1vZGFsRXJyb3I6IHRydWVcclxuXHRcdH0pO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwidmFyIFB1dE1pc3Npb24gPSByZXF1aXJlKCcuL1B1dE1pc3Npb24nKTtcclxudmFyIERlbGV0ZU1pc3Npb24gPSByZXF1aXJlKCcuL0RlbGV0ZU1pc3Npb24nKTtcclxudmFyIE1pc3Npb249IHJlcXVpcmUoJy4vTWlzc2lvbicpXHJcbnZhciBSb3V0ZXIgPSBCYWNrYm9uZS5Sb3V0ZXIuZXh0ZW5kKHtcclxuXHRyb3V0ZXM6IHtcclxuXHRcdFwiSmV1eC86aWRKZXUvTWlzc2lvbnMvQWpvdXRcIjogXCJBam91dE1pc3Npb25cIixcclxuXHRcdFwiSmV1eC86aWRKZXUvTWlzc2lvbnMvTW9kaWZpZXIvOmlkXCI6IFwiTW9kaWZNaXNzaW9uXCIsXHJcblx0XHRcIkpldXgvTWlzc2lvbnMvU3VwcHJpbWVyLzppZFwiOiBcIlN1cHByTWlzc2lvblwiLFxyXG5cdFx0XCJKZXV4LzppZEpldS9NaXNzaW9ucy86aWRcIjogXCJNaXNzaW9uXCIsXHJcblx0fSxcclxuXHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHJcblx0fSxcclxuXHRNaXNzaW9uOiBmdW5jdGlvbihpZEpldSxpZCl7XHJcblx0XHR0aGlzLk1pc3Npb24gPSBuZXcgTWlzc2lvbigpO1xyXG5cdFx0dGhpcy5NaXNzaW9uLnJlbmRlcihpZCk7XHJcblx0fSxcclxuXHRBam91dE1pc3Npb246IGZ1bmN0aW9uKGlkSmV1KXtcclxuXHRcdHRoaXMuTWlzc2lvbiA9IG5ldyBQdXRNaXNzaW9uKCk7XHJcblx0XHR0aGlzLk1pc3Npb24ucmVuZGVyKGlkSmV1KTtcclxuXHR9LFxyXG5cclxuXHRNb2RpZk1pc3Npb246IGZ1bmN0aW9uKGlkLGlkSmV1KXtcclxuXHRcdHRoaXMuTWlzc2lvbiA9IG5ldyBQdXRNaXNzaW9uKCk7XHJcblx0XHR0aGlzLk1pc3Npb24ucmVuZGVyTW9kaWYoaWQsaWRKZXUpO1xyXG5cdH0sXHJcblxyXG5cdFN1cHByTWlzc2lvbjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5NaXNzaW9uID0gbmV3IERlbGV0ZU1pc3Npb24oKTtcclxuXHRcdHRoaXMuTWlzc2lvbi5yZW5kZXIoaWQpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlcjsiLCJ2YXIgb2JqZWN0aWZNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL09iamVjdGlmcy9PYmplY3RpZicpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxudmFyIEVzdF9hc3NvY2llTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9Fc3RfYXNzb2NpZS9Fc3RfYXNzb2NpZScpO1xyXG5cclxudmFyIHZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcblx0cmVuZGVyOiBmdW5jdGlvbihpZCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgb2JqZWN0aWZNb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5jb25maXJtLHRoaXMpXHJcblx0XHR9KTtcclxuXHJcblx0fSxcclxuXHJcblx0cmVuZGVyRXN0QXNzbzogZnVuY3Rpb24oaWQsaWRBY3Rpb24pe1xyXG5cdFx0Y29uc29sZS5sb2coXCJ0ZXN0IFwiK2lkK1wiIFwiK2lkQWN0aW9uKTtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIlN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiQ29uZmlybWVyIGxhIHN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEZvb3RlcjogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIiBpZD1cImFubnVsRGVsZXRlXCI+QW5udWxlcjwvYnV0dG9uPjxhIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgYnRuLW9rXCIgaWQ9XCJjb25maXJtRGVsZXRlXCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIj5TdXBwcmltZXI8L2E+J1xyXG5cdFx0fSk7XHJcblx0XHQkKCcjY29uZmlybURlbGV0ZScpLm9uKCdjbGljaycsXy5iaW5kKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHR2YXIgbW9kZWwgPSBuZXcgRXN0X2Fzc29jaWVNb2RlbCh7XCJudW1vYmplY3RpZlwiOmlkLCBcIm51bWFjdGlvblwiOmlkQWN0aW9uIH0pLmRlc3Ryb3koe1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IF8uYmluZCh0aGlzLnZhbGlkLHRoaXMpLFxyXG5cdFx0XHRcdGVycm9yOiB0aGlzLnNob3dFcnJvck1vZGFsXHJcblx0XHRcdH0pO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0XHQkKCcjYW5udWxEZWxldGUnKS5vbignY2xpY2snLF8uYmluZChmdW5jdGlvbihlKXtcclxuXHRcdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI09iamVjdGlmcy9Nb2RpZmllci8nK2lkLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0XHR9LHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHRjb25maXJtOmZ1bmN0aW9uKG9iamVjdGlmKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIlN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiQ29uZmlybWVyIGxhIHN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEZvb3RlcjogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIiBpZD1cImFubnVsRGVsZXRlXCI+QW5udWxlcjwvYnV0dG9uPjxhIGNsYXNzPVwiYnRuIGJ0bi1kYW5nZXIgYnRuLW9rXCIgaWQ9XCJjb25maXJtRGVsZXRlXCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIj5TdXBwcmltZXI8L2E+J1xyXG5cdFx0fSk7XHJcblx0XHQkKCcjY29uZmlybURlbGV0ZScpLm9uKCdjbGljaycsXy5iaW5kKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHR2YXIgbW9kZWwgPSBuZXcgb2JqZWN0aWZNb2RlbCh7XCJpZFwiOm9iamVjdGlmLmlkfSkuZGVzdHJveSh7XHJcblx0XHRcdFx0c3VjY2VzczogXy5iaW5kKHRoaXMudmFsaWQsdGhpcyksXHJcblx0XHRcdFx0ZXJyb3I6IHRoaXMuc2hvd0Vycm9yTW9kYWxcclxuXHRcdFx0fSk7XHJcblx0XHR9LHRoaXMpKTtcclxuXHRcdCQoJyNhbm51bERlbGV0ZScpLm9uKCdjbGljaycsXy5iaW5kKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcjT2JqZWN0aWZzJywge3RyaWdnZXI6dHJ1ZX0pO1xyXG5cdFx0fSx0aGlzKSk7XHJcblx0fSxcclxuXHJcblx0dmFsaWQ6ZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIlN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiU3VwcHJlc3Npb24gZWZmZWN1w6llXCJcclxuXHRcdH0pO1xyXG5cdFx0JCgnLm1vZGFsLWJhY2tkcm9wJykucmVtb3ZlKCk7XHJcblx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKCcjT2JqZWN0aWZzJywge3RyaWdnZXI6dHJ1ZX0pO1xyXG5cdH0sXHJcblxyXG5cdHNob3dFcnJvck1vZGFsOiBmdW5jdGlvbihlcnJvcil7XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJTdXBwcmVzc2lvblwiLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIkVycmV1ciBsb3JzIGRlIGxhIHN1cHByZXNzaW9uIDogXCIgKyBlcnJvcixcclxuXHRcdCBcdG1vZGFsRXJyb3I6IHRydWVcclxuXHRcdH0pO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlciwgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIiwgYWxpYXMzPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCIgICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5udW1vYmplY3RpZiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtb2JqZWN0aWYgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcIm51bW9iamVjdGlmXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcXCI+XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bW9iamVjdGlmIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5udW1vYmplY3RpZiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtb2JqZWN0aWZcIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiIFwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5saWJvYmplY3RpZiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubGlib2JqZWN0aWYgOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImxpYm9iamVjdGlmXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIjwvb3B0aW9uPlxcclxcblxcclxcblwiO1xufSxcImNvbXBpbGVyXCI6WzYsXCI+PSAyLjAuMC1iZXRhLjFcIl0sXCJtYWluXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiIDxmb3JtIGlkPVxcXCJmb3JtTGllT2JqZWN0aWZcXFwiIG1ldGhvZD1cXFwicG9zdFxcXCI+XFxyXFxuICA8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXHJcXG4gICAgPGxhYmVsIGZvcj1cXFwib2JqZWN0aWZcXFwiPk9iamVjdGlmIGFzc29jacOpPC9sYWJlbD5cXHJcXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIiBpZD1cXFwib2JqZWN0aWZcXFwiPlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuT2JqZWN0aWZzdG90IDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxyXFxuICAgIDwvc2VsZWN0PlxcclxcbiAgPGJ1dHRvbiBpZD1cXFwic3VibWl0QnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0XFxcIj5MacOpPC9idXR0b24+XFxyXFxuICA8L2Zvcm0+XFxyXFxuXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBvYmplY3RpZk1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvT2JqZWN0aWZzL09iamVjdGlmJyk7XHJcbnZhciBvYmplY3RpZnNNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL09iamVjdGlmcy9PYmplY3RpZnNMaXN0Jyk7XHJcbnZhciBvYmplY3RpZkxpc3Q9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0ZpeGUvRml4ZScpO1xyXG52YXIgRml4ZU1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvRml4ZS9GaXhlMicpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL0xpZU9iamVjdGlmLmhicycpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdCRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0JHRpdGxlIDogJCgnI3RpdGxlJyksXHRcclxuXHQkY29udGVudCA6ICQoJyNjb250ZW50JyksXHJcblxyXG5cdGVsOiAkKCcjZm9ybUxpZU9iamVjdGlmJyksXHJcblxyXG5cdC8vQXBwZWzDqSBhdSBtb21lbnQgZGUgbCdpbnN0YW5jaWF0aW9uXHRcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdC8vRm9uY3Rpb24gY2hhcmfDqWUgZHUgcmVuZHVcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKGlkSmV1LGlkTWlzc2lvbil7XHJcblx0XHR2YXIgb2JqZWN0aWZzUGFyc2VyPW5ldyBvYmplY3RpZkxpc3QoKTtcclxuXHRcdG9iamVjdGlmc1BhcnNlci51cmxSb290PW9iamVjdGlmc1BhcnNlci51cmxSb290KycnK2lkTWlzc2lvbitcIi9PYmplY3RpZlwiO1xyXG5cdFx0JC53aGVuKG5ldyBvYmplY3RpZk1vZGVsKCkuZmV0Y2goKSxuZXcgb2JqZWN0aWZzTW9kZWwoKS5mZXRjaCgpLG9iamVjdGlmc1BhcnNlci5mZXRjaCgpKVxyXG5cdFx0LmRvbmUoXy5iaW5kKGZ1bmN0aW9uKGZpeGUsb2JqZWN0aWZzLG9iamVjdGlmc1BhcnNlcil7XHJcblx0XHRcdHRoaXMucmVuZGVyUmVzdWx0YXQoZml4ZSxvYmplY3RpZnMsb2JqZWN0aWZzUGFyc2VyKTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdFx0dGhpcy4kcGFnZU5hbWUuaHRtbChcIkxpZSBPYmplY3RpZlwiKTtcclxuXHRcdHRoaXMuJHRpdGxlLmh0bWwoXCJMaWVyIHVuIE9iamVjdGlmXCIpO1xyXG5cdFx0dGhpcy5pZE1pc3Npb249aWRNaXNzaW9uO1xyXG5cdFx0dGhpcy5pZEpldT1pZEpldTtcclxuXHR9LFxyXG5cdHZhbGlkOiBmdW5jdGlvbihlKXtcclxuXHRcdHZhciBudW1vYmplY3RpZiA9ICQoJyNvYmplY3RpZicpLnZhbCgpO1xyXG5cdFx0Y29uc29sZS5sb2cobnVtb2JqZWN0aWYpO1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IEZpeGVNb2RlbCgpO1xyXG5cdFx0aWYgKHRoaXMuaWRPYmplY3RpZj09PXVuZGVmaW5lZCl7XHJcblx0XHRcdG1vZGVsLnNhdmUoe1wibnVtbWlzc2lvblwiOnRoaXMuaWRNaXNzaW9uLCBcIm51bW9iamVjdGlmXCI6bnVtb2JqZWN0aWZ9LCB7XHJcblx0XHRcdFx0c3VjY2VzczogdGhpcy5zaG93TW9kYWwsXHJcblx0XHRcdFx0ZXJyb3I6IHRoaXMuc2hvd0Vycm9yTW9kYWxcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9LFxyXG5cclxuXHRyZW5kZXJSZXN1bHRhdDogZnVuY3Rpb24oZml4ZSxvYmplY3RpZnMsb2JqZWN0aWZzUGFyc2VyKXtcclxuXHRcdGlmKG9iamVjdGlmc1BhcnNlcj09PW51bGwpe1xyXG5cdFx0XHR0aGlzLiRjb250ZW50Lmh0bWwodGVtcGxhdGUoe29iamVjdGlmczpvYmplY3RpZnN9KSk7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0dmFyIE9iamVjdGlmID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcclxuXHRcdFx0XHRudW1vYmplY3RpZjowLFxyXG5cdFx0XHRcdGxpYm9iamVjdGlmOlwiXCJcclxuXHQgIFx0XHR9KTtcclxuXHRcdFx0dmFyIENvbGxlY3Rpb25PYmplY3RpZiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcclxuXHRcdFx0ICBtb2RlbDogT2JqZWN0aWZcclxuXHRcdFx0fSk7XHJcblx0XHRcdHZhciBsaXN0T2JqZWN0aWYgPSBuZXcgQ29sbGVjdGlvbk9iamVjdGlmKCk7XHJcblx0XHRcdC8vIEVubGV2ZSBsJ2lkIGxlcyBpZHMgZGVqYSBzZWxlY3Rpb25uZXMgZGUgbGEgbGlzdGVcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8b2JqZWN0aWZzWzBdLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0b2JqZWN0aWY9bmV3IE9iamVjdGlmKCk7XHJcblx0XHRcdFx0b2JqZWN0aWYubnVtb2JqZWN0aWY9b2JqZWN0aWZzWzBdW2ldLm51bW9iamVjdGlmO1xyXG5cdFx0XHRcdG9iamVjdGlmLmxpYm9iamVjdGlmPW9iamVjdGlmc1swXVtpXS5saWJvYmplY3RpZjtcclxuXHRcdFx0XHRsaXN0T2JqZWN0aWYuYWRkKFtvYmplY3RpZl0pO1xyXG5cdFx0XHRcdGZvcih2YXIgaiA9IDA7IGogPG9iamVjdGlmc1BhcnNlclswXS5sZW5ndGg7IGorKykge1xyXG5cdFx0ICAgICAgXHRcdGlmKHRoaXMuaWRNaXNzaW9uID09IG9iamVjdGlmc1BhcnNlclswXVtqXVswXS5udW1taXNzaW9uKSB7XHJcblx0XHQgICAgICBcdFx0XHRpZihvYmplY3RpZnNbMF1baV0ubnVtb2JqZWN0aWYgPT0gb2JqZWN0aWZzUGFyc2VyWzBdW2pdWzBdLm51bW9iamVjdGlmKVxyXG5cdFx0ICAgICAgXHRcdFx0e1xyXG5cdFx0ICAgICAgXHRcdFx0XHRsaXN0T2JqZWN0aWYucmVtb3ZlKFtvYmplY3RpZl0pO1xyXG5cdFx0ICAgICAgXHRcdFx0fVxyXG5cdFx0XHRcdCAgICB9XHJcblx0XHRcdFx0fVxyXG5cdFx0ICBcdH1cclxuXHRcdFx0Ly8gUGFzc2UgbGVzIGVsbWVudHMgYXUgaGJzXHJcblx0XHRcdFx0dGhpcy4kY29udGVudC5odG1sKHRlbXBsYXRlKHtPYmplY3RpZnN0b3Q6bGlzdE9iamVjdGlmLm1vZGVsc30pKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdCQoJyNmb3JtTGllT2JqZWN0aWYnKS5zdWJtaXQoXy5iaW5kKGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdCAgICB0aGlzLnZhbGlkKCk7XHJcblx0XHR9LCB0aGlzKSk7XHJcblx0fSxcclxuXHJcblx0c2hvd01vZGFsOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiQWpvdXRcIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJMJ2Fqb3V0IGEgw6l0w6kgZWZmZWN0dcOpIGF2ZWMgc3VjY8Ooc1wiXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI0pldXgvJyt0aGlzLmlkSmV1KycvTWlzc2lvbnMvJyt0aGlzLmlkTWlzc2lvbiwge3RyaWdnZXI6dHJ1ZX0pO1xyXG5cdH0sXHJcblxyXG5cdHNob3dFcnJvck1vZGFsOiBmdW5jdGlvbihlcnJvcil7XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogXCJBam91dFwiLFxyXG5cdFx0IFx0bW9kYWxCb2R5OiBcIkVycmV1ciBsb3JzIGRlIGwnYWpvdXQgOiBcIiArIGVycm9yLFxyXG5cdFx0IFx0bW9kYWxFcnJvcjogdHJ1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsgIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCJcdFx0XHRcdFx0XHQ8dGFibGUgY2xhc3M9XFxcInRhYmxlXFxcIiBpZD1cXFwidGFiQWN0aW9uXFxcIj5cXHJcXG5cdFx0XHRcdFx0XHRcdDx0aGVhZD5cXHJcXG5cdFx0XHRcdFx0XHRcdFx0PHRyPlxcclxcblx0XHRcdFx0XHRcdFx0XHRcdDx0aD5JZGVudGlmaWFudDwvdGg+XFxyXFxuXHRcdFx0XHRcdFx0XHRcdFx0PHRoPkxpYmVsbMOpPC90aD5cXHJcXG5cdFx0XHRcdFx0XHRcdFx0XHQ8dGg+PC90aD5cXHJcXG5cdFx0XHRcdFx0XHRcdFx0PC90cj5cXHJcXG5cdFx0XHRcdFx0XHRcdDwvdGhlYWQ+XFxyXFxuXHRcdFx0XHRcdFx0XHQ8dGJvZHk+XFxyXFxuXCJcbiAgICArICgoc3RhY2sxID0gaGVscGVycy5lYWNoLmNhbGwoZGVwdGgwLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hY3Rpb25zIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgyLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXHRcdFx0XHRcdFx0XHQ8L3Rib2R5Plxcclxcblx0XHRcdFx0XHRcdDwvdGFibGU+XFxyXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXHRcdFx0XHRcdFx0XHRcdDx0ciBvbkNsaWNrPVxcXCJkb2N1bWVudC5sb2NhdGlvbj0nI0FjdGlvbnMvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiJ1xcXCI+XFxyXFxuXHRcdFx0XHRcdFx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYmFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHRcdFx0XHRcdDwvdHI+XFxyXFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcblx0PHRoZWFkPlxcclxcblx0XHQ8dHI+XFxyXFxuXHRcdFx0PHRoPklkZW50aWZpYW50PC90aD5cXHJcXG5cdFx0XHQ8dGg+TGliZWxsw6k8L3RoPlxcclxcblx0XHRcdDx0aD5BY3Rpb25zPC90aD5cXHJcXG5cdFx0XHQ8dGg+PC90aD5cXHJcXG5cdFx0PC90cj5cXHJcXG5cdDwvdGhlYWQ+XFxyXFxuXHQ8dGJvZHk+XFxyXFxuXHRcdFx0PHRyPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9iamVjdGlmIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1vYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub2JqZWN0aWYgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYm9iamVjdGlmIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hY3Rpb25zIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJpZlwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlx0XHRcdFx0PHRkPlxcclxcblx0XHRcdFx0PHRkPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjT2JqZWN0aWZzL01vZGlmaWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9iamVjdGlmIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1vYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPlxcclxcblx0XHRcdFx0XHQ8L2E+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNPYmplY3RpZnMvU3VwcHJpbWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm9iamVjdGlmIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1vYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdDwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cdDwvdGJvZHk+XFxyXFxuPC90YWJsZT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIG9iamVjdGlmTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9PYmplY3RpZnMvT2JqZWN0aWYnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9PYmplY3RpZi5oYnMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHBhZ2VOYW1lIDogJCgndGl0bGUnKSxcclxuXHR0aXRsZSA6ICQoJyN0aXRsZScpLFxyXG5cdGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHQvL0FwcGVsw6kgYXUgbW9tZW50IGRlIGwnaW5zdGFuY2lhdGlvblx0XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHR9LFxyXG5cclxuXHQvL0ZvbmN0aW9uIGNoYXJnw6llIGR1IHJlbmR1XHJcblx0cmVuZGVyOiBmdW5jdGlvbihpZCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgb2JqZWN0aWZNb2RlbCgpO1xyXG5cdFx0bW9kZWwudXJsID0gbW9kZWwudXJsUm9vdCsnJytpZCtcIi9BY3Rpb25cIjtcclxuXHJcblx0XHQkLndoZW4obmV3IG9iamVjdGlmTW9kZWwoe1wiaWRcIjppZH0pLmZldGNoKCksbW9kZWwuZmV0Y2goKSlcclxuXHRcdC5kb25lKF8uYmluZChmdW5jdGlvbihvYmplY3RpZixhY3Rpb25zKXtcclxuXHRcdFx0dGhpcy5yZW5kZXJSZXN1bHRhdChvYmplY3RpZixhY3Rpb25zKTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmlkT2JqZWN0aWYgPSBpZDtcclxuXHRcdCQodGhpcy5wYWdlTmFtZSkuaHRtbChcIkTDqXRhaWwgT2JqZWN0aWZcIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJJbmZvcm1hdGlvbnMgT2JqZWN0aWZcIik7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlc3BvbnNlLCByZXNwb25zZUFjdGlvbnMpe1xyXG5cdFx0dmFyIEFjdGlvbiA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblx0ICBcdH0pO1xyXG5cclxuXHRcdHZhciBDb2xsZWN0aW9uQWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xyXG5cdFx0ICBtb2RlbDogQWN0aW9uXHJcblx0XHR9KTtcclxuXHRcdHZhciBjb3VudCA9IDA7XHJcblx0XHR2YXIgbGlzdEFjdGlvbiA9IG5ldyBDb2xsZWN0aW9uQWN0aW9uKCk7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8ICByZXNwb25zZUFjdGlvbnNbMF0ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0dmFyIGFjdGlvbiA9IG5ldyBBY3Rpb24ocmVzcG9uc2VBY3Rpb25zWzBdW2ldWzFdKTtcclxuXHRcdFx0bGlzdEFjdGlvbi5hZGQoW2FjdGlvbl0pO1xyXG5cdFx0XHRjb3VudCsrO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGNvdW50ICE9PTAgKXtcclxuXHRcdFx0JCh0aGlzLmNvbnRlbnQpLmh0bWwodGVtcGxhdGUoe29iamVjdGlmOiByZXNwb25zZVswXSwgYWN0aW9uczpsaXN0QWN0aW9uLm1vZGVsc30pKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZSh7b2JqZWN0aWY6IHJlc3BvbnNlWzBdfSkpO1xyXG5cdFx0fVxyXG5cdFxyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIlx0XHRcdDx0ciBvbkNsaWNrPVxcXCJkb2N1bWVudC5sb2NhdGlvbj0nI09iamVjdGlmcy9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1vYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIidcXFwiPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bW9iamVjdGlmIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJvYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNPYmplY3RpZnMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtb2JqZWN0aWYgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcclxcblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjT2JqZWN0aWZzL1N1cHByaW1lci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1vYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdDwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIjxhIGhyZWY9XFxcIiNPYmplY3RpZnMvQWpvdXRcXFwiPlxcclxcblx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLXN1Y2Nlc3NcXFwiPlxcclxcblx0ICA8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPiBBam91dGVyIE9iamVjdGlmXFxyXFxuXHQ8L2J1dHRvbj5cXHJcXG48L2E+XFxyXFxuPHRhYmxlIGNsYXNzPVxcXCJ0YWJsZVxcXCI+XFxyXFxuXHQ8dGhlYWQ+XFxyXFxuXHRcdDx0cj5cXHJcXG5cdFx0XHQ8dGg+SWRlbnRpZmlhbnQ8L3RoPlxcclxcblx0XHRcdDx0aD5MaWJlbGzDqTwvdGg+XFxyXFxuXHRcdFx0PHRoPjwvdGg+XFxyXFxuXHRcdDwvdHI+XFxyXFxuXHQ8L3RoZWFkPlxcclxcblx0PHRib2R5PlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAub2JqZWN0aWZzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXHQ8L3Rib2R5PlxcclxcbjwvdGFibGU+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciBvYmplY3RpZk1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvT2JqZWN0aWZzL09iamVjdGlmc0xpc3QnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9PYmplY3RpZnMuaGJzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0dGl0bGUgOiAkKCcjdGl0bGUnKSxcclxuXHRjb250ZW50IDogJCgnI2NvbnRlbnQnKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtb2RlbCA9IG5ldyBvYmplY3RpZk1vZGVsKCkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5yZW5kZXJSZXN1bHRhdCwgdGhpcylcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLnBhZ2VOYW1lKS5odG1sKFwiTGlzdGUgZGVzIE9iamVjdGlmc1wiKTtcclxuXHRcdCQodGhpcy50aXRsZSkuaHRtbChcIkxpc3RlIGRlcyBPYmplY3RpZnNcIik7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdCQodGhpcy5jb250ZW50KS5odG1sKHRlbXBsYXRlKHtvYmplY3RpZnM6IHJlc3BvbnNlLnRvQXJyYXkoKX0pKTtcclxuXHR9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3OyIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzQ29tcGlsZXIgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnNDb21waWxlci50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSxibG9ja1BhcmFtcyxkZXB0aHMpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiICAgIDx0cj5cXHJcXG4gICAgICA8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD48dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGliYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG4gICAgICA8dGQ+PGEgaHJlZj1cXFwiI0FjdGlvbnMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtYWN0aW9uIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiXFxcIj5cXHJcXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWxcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuICAgICAgICAgIDwvYT5cXHJcXG4gICAgICA8L3RkPlxcclxcbiAgICAgIDx0ZD48YSBocmVmPVxcXCIjT2JqZWN0aWZzL01vZGlmaWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoc1sxXSAhPSBudWxsID8gZGVwdGhzWzFdLm9iamVjdGlmIDogZGVwdGhzWzFdKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1vYmplY3RpZiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIi9BY3Rpb24vU3VwcHJpbWVyL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bWFjdGlvbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuICAgICAgICAgIDwvYT5cXHJcXG4gICAgICA8L3RkPlxcclxcbiAgICA8L3RyPlxcclxcblwiO1xufSxcIjNcIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIGhlbHBlciwgYWxpYXMxPWhlbHBlcnMuaGVscGVyTWlzc2luZywgYWxpYXMyPVwiZnVuY3Rpb25cIiwgYWxpYXMzPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICByZXR1cm4gXCIgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcbiAgICArIGFsaWFzMygoKGhlbHBlciA9IChoZWxwZXIgPSBoZWxwZXJzLm51bWFjdGlvbiB8fCAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAubnVtYWN0aW9uIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMSksKHR5cGVvZiBoZWxwZXIgPT09IGFsaWFzMiA/IGhlbHBlci5jYWxsKGRlcHRoMCx7XCJuYW1lXCI6XCJudW1hY3Rpb25cIixcImhhc2hcIjp7fSxcImRhdGFcIjpkYXRhfSkgOiBoZWxwZXIpKSlcbiAgICArIFwiPlwiXG4gICAgKyBhbGlhczMoKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5udW1hY3Rpb24gfHwgKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLm51bWFjdGlvbiA6IGRlcHRoMCkpICE9IG51bGwgPyBoZWxwZXIgOiBhbGlhczEpLCh0eXBlb2YgaGVscGVyID09PSBhbGlhczIgPyBoZWxwZXIuY2FsbChkZXB0aDAse1wibmFtZVwiOlwibnVtYWN0aW9uXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIiBcIlxuICAgICsgYWxpYXMzKCgoaGVscGVyID0gKGhlbHBlciA9IGhlbHBlcnMubGliYWN0aW9uIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5saWJhY3Rpb24gOiBkZXB0aDApKSAhPSBudWxsID8gaGVscGVyIDogYWxpYXMxKSwodHlwZW9mIGhlbHBlciA9PT0gYWxpYXMyID8gaGVscGVyLmNhbGwoZGVwdGgwLHtcIm5hbWVcIjpcImxpYmFjdGlvblwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L29wdGlvbj5cXHJcXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEsYmxvY2tQYXJhbXMsZGVwdGhzKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gXCIgPGZvcm0gaWQ9XFxcImZvcm1QdXRPYmplY3RpZlxcXCIgbWV0aG9kPVxcXCJwb3N0XFxcIj5cXHJcXG4gIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcclxcbiAgICA8bGFiZWwgZm9yPVxcXCJsaWJvYmplY3RpZlxcXCI+bGlib2JqZWN0aWY8L2xhYmVsPlxcclxcbiAgICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgaWQ9XFxcImxpYm9iamVjdGlmXFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50cmV6IHVuIGxpYmVsbMOpXFxcIiB2YWx1ZT1cXFwiXCJcbiAgICArIHRoaXMuZXNjYXBlRXhwcmVzc2lvbih0aGlzLmxhbWJkYSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5vYmplY3RpZiA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubGlib2JqZWN0aWYgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIHJlcXVpcmVkPlxcclxcbiAgPC9kaXY+XFxyXFxuICA8YnV0dG9uIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHRcXFwiPlZhbGlkZXI8L2J1dHRvbj5cXHJcXG48L2Zvcm0+XFxyXFxuXFxyXFxuPGhyPlxcclxcblxcclxcbjxsYWJlbCBmb3I9XFxcIm51bWFjdGlvblxcXCI+TGlzdGUgZGVzIGFjdGlvbnMgZGUgbCdvYmplY3RpZjwvbGFiZWw+XFxyXFxuPHRhYmxlIGNsYXNzPVxcXCJ0YWJsZVxcXCIgaWQ9XFxcInRhYkFjdGlvblxcXCI+XFxyXFxuICA8dGhlYWQ+XFxyXFxuICAgIDx0cj5cXHJcXG4gICAgICA8dGg+SWRlbnRpZmlhbnQ8L3RoPlxcclxcbiAgICAgIDx0aD5MaWJlbGzDqTwvdGg+XFxyXFxuICAgIDwvdHI+XFxyXFxuICA8L3RoZWFkPlxcclxcbiAgPHRib2R5PlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYWN0aW9ucyA6IGRlcHRoMCkse1wibmFtZVwiOlwiZWFjaFwiLFwiaGFzaFwiOnt9LFwiZm5cIjp0aGlzLnByb2dyYW0oMSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyksXCJpbnZlcnNlXCI6dGhpcy5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAgPC90Ym9keT5cXHJcXG48L3RhYmxlPlxcclxcbiA8Zm9ybSBpZD1cXFwiZm9ybVB1dEFjdGlvblxcXCIgbWV0aG9kPVxcXCJwb3N0XFxcIj5cXHJcXG4gIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcclxcbiAgIDxsYWJlbCBmb3I9XFxcIm51bWFjdGlvblxcXCI+QWpvdXRlciB1bmUgQWN0aW9uPC9sYWJlbD5cXHJcXG4gICAgPHNlbGVjdCAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgaWQ9XFxcIm51bWFjdGlvblxcXCI+XFxyXFxuICAgICAgPG9wdGlvbiB2YWx1ZT1udWxsPiBBdWN1biA8L29wdGlvbj5cXHJcXG5cIlxuICAgICsgKChzdGFjazEgPSBoZWxwZXJzLmVhY2guY2FsbChkZXB0aDAsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmFjdGlvbnNUb3QgOiBkZXB0aDApLHtcIm5hbWVcIjpcImVhY2hcIixcImhhc2hcIjp7fSxcImZuXCI6dGhpcy5wcm9ncmFtKDMsIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpLFwiaW52ZXJzZVwiOnRoaXMubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgICAgPC9zZWxlY3Q+XFxyXFxuICA8L2Rpdj5cXHJcXG4gIDxidXR0b24gY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdFxcXCI+QWpvdXRlcjwvYnV0dG9uPlxcclxcbjwvZm9ybT5cXHJcXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZSxcInVzZURlcHRoc1wiOnRydWV9KTtcbiIsInZhciBvYmplY3RpZk1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvT2JqZWN0aWZzL09iamVjdGlmJyk7XHJcbnZhciBvYmplY3RpZnNNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL09iamVjdGlmcy9PYmplY3RpZnNMaXN0Jyk7XHJcbnZhciBhY3Rpb25Nb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL0FjdGlvbnMvQWN0aW9uc0xpc3QnKTtcclxudmFyIEVzdF9hc3NvY2llTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9Fc3RfYXNzb2NpZS9Fc3RfYXNzb2NpZScpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL1B1dE9iamVjdGlmLmhicycpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdCRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0JHRpdGxlIDogJCgnI3RpdGxlJyksXHRcclxuXHQkY29udGVudCA6ICQoJyNjb250ZW50JyksXHJcblxyXG5cdGVsOiAkKCcjZm9ybVB1dE9iamVjdGlmJyksXHJcblxyXG5cdC8vQXBwZWzDqSBhdSBtb21lbnQgZGUgbCdpbnN0YW5jaWF0aW9uXHRcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdC8vRm9uY3Rpb24gY2hhcmfDqWUgZHUgcmVuZHVcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XHJcblx0XHQkLndoZW4obmV3IGFjdGlvbk1vZGVsKCkuZmV0Y2goKSxudWxsLG51bGwpXHJcblx0XHQuZG9uZShfLmJpbmQoZnVuY3Rpb24oYWN0aW9ucyxvYmplY3RpZixhY2lvbk9iamVjdGlmKXtcclxuXHRcdFx0dGhpcy5yZW5kZXJSZXN1bHRhdChhY3Rpb25zLG51bGwsbnVsbCk7XHJcblx0XHR9LHRoaXMpKTtcclxuXHRcdHRoaXMuJHBhZ2VOYW1lLmh0bWwoXCJBam91dCBPYmplY3RpZlwiKTtcclxuXHRcdHRoaXMuJHRpdGxlLmh0bWwoXCJBam91dGVyIHVuIE9iamVjdGlmXCIpO1xyXG5cdH0sXHJcblxyXG5cdHJlbmRlck1vZGlmOiBmdW5jdGlvbihpZCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgb2JqZWN0aWZNb2RlbCgpO1xyXG5cdFx0bW9kZWwudXJsID0gbW9kZWwudXJsUm9vdCsnJytpZCtcIi9BY3Rpb25cIjtcclxuXHJcblx0XHQkLndoZW4obmV3IGFjdGlvbk1vZGVsKCkuZmV0Y2goKSxuZXcgb2JqZWN0aWZNb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goKSxtb2RlbC5mZXRjaCgpKVxyXG5cdFx0LmRvbmUoXy5iaW5kKGZ1bmN0aW9uKGFjdGlvbnMsb2JqZWN0aWYsYWNpb25PYmplY3RpZil7XHJcblx0XHRcdHRoaXMucmVuZGVyUmVzdWx0YXQoYWN0aW9ucyxvYmplY3RpZixhY2lvbk9iamVjdGlmKTtcclxuXHRcdH0sdGhpcykpO1x0XHRcclxuXHRcdHRoaXMuJHBhZ2VOYW1lLmh0bWwoXCJNb2RpZmllciBPYmplY3RpZlwiKTtcclxuXHRcdHRoaXMuJHRpdGxlLmh0bWwoXCJNb2RpZmllciB1biBPYmplY3RpZlwiKTtcclxuXHRcdHRoaXMuaWRPYmplY3RpZj1pZDtcclxuXHR9LFxyXG5cclxuXHR2YWxpZDogZnVuY3Rpb24oZSl7XHJcblx0XHR2YXIgbGlib2JqZWN0aWYgPSAkKCcjbGlib2JqZWN0aWYnKS52YWwoKTtcclxuXHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgb2JqZWN0aWZNb2RlbCgpO1xyXG5cdFx0aWYgKHRoaXMuaWRPYmplY3RpZj09PXVuZGVmaW5lZCl7XHJcblx0XHRcdG1vZGVsLnNhdmUoe1wibGlib2JqZWN0aWZcIjpsaWJvYmplY3RpZn0sIHtcclxuXHRcdFx0XHRzdWNjZXNzOiB0aGlzLnNob3dNb2RhbCxcclxuXHRcdFx0XHRlcnJvcjogdGhpcy5zaG93RXJyb3JNb2RhbFxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdG1vZGVsLnNhdmUoe1wibnVtb2JqZWN0aWZcIjp0aGlzLmlkT2JqZWN0aWYsIFwibGlib2JqZWN0aWZcIjpsaWJvYmplY3RpZn0sIHtcclxuXHRcdFx0XHRzdWNjZXNzOiB0aGlzLnNob3dNb2RhbCxcclxuXHRcdFx0XHRlcnJvcjogdGhpcy5zaG93RXJyb3JNb2RhbFxyXG5cdFx0XHR9KTtcclxuXHRcdH0gXHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9LFxyXG5cclxuXHR2YWxpZEFjdGlvbjogZnVuY3Rpb24oZSl7XHJcblx0XHR2YXIgbnVtYWN0aW9uID0gJCgnI251bWFjdGlvbicpLnZhbCgpO1xyXG5cclxuXHRcdHZhciBtb2RlbCA9ICBuZXcgRXN0X2Fzc29jaWVNb2RlbCgpO1xyXG5cdFx0bW9kZWwuc2F2ZSh7XCJudW1vYmplY3RpZlwiOnRoaXMuaWRPYmplY3RpZiwgXCJudW1hY3Rpb25cIjpudW1hY3Rpb259LCB7XHJcblx0XHRcdHN1Y2Nlc3M6IHRoaXMuc2hvd01vZGFsLFxyXG5cdFx0XHRlcnJvcjogdGhpcy5zaG93RXJyb3JNb2RhbFxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9LFxyXG5cclxuXHRyZW5kZXJSZXN1bHRhdDogZnVuY3Rpb24ocmVzcG9uc2VBY3Rpb25MaXN0VG90LHJlc3BvbnNlLHJlc3BvbnNlQWN0aW9uTGlzdCl7XHJcblx0XHRpZih0aGlzLmlkT2JqZWN0aWY9PT11bmRlZmluZWQpe1xyXG5cdFx0XHR0aGlzLiRjb250ZW50Lmh0bWwodGVtcGxhdGUoKSk7XHJcblx0XHR9ZWxzZXtcclxuXHJcblx0XHRcdC8vIEVubGV2ZSBsJ2lkIGxlcyBpZHMgZGVqYSBzZWxlY3Rpb25uZXMgZGUgbGEgbGlzdGVcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8cmVzcG9uc2VBY3Rpb25MaXN0VG90WzBdLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8cmVzcG9uc2VBY3Rpb25MaXN0WzBdLmxlbmd0aDsgaisrKSB7XHJcblx0XHQgICAgICBcdFx0aWYocmVzcG9uc2VBY3Rpb25MaXN0VG90WzBdW2ldLm51bWFjdGlvbiA9PT0gcmVzcG9uc2VBY3Rpb25MaXN0WzBdLm51bWFjdGlvbikge1xyXG5cdFx0XHRcdCAgICAgICAgIHJlc3BvbnNlQWN0aW9uTGlzdFRvdFswXS5zcGxpY2UoaSwgMSk7XHJcblx0XHRcdFx0ICAgIH1cclxuXHRcdFx0XHR9XHJcblx0XHQgIFx0fVxyXG5cclxuXHRcdCAgXHQvLyBSZWN1cGVyZXIgdW5lIGxpc3RlIGQnYWN0aW9uIGRlIGwnb2JqZWN0aWYgcGx1cyBsaXNpYmxlXHJcblx0XHQgIFx0dmFyIEFjdGlvbiA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblx0ICBcdFx0fSk7XHJcblx0XHRcdHZhciBDb2xsZWN0aW9uQWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xyXG5cdFx0XHQgIG1vZGVsOiBBY3Rpb25cclxuXHRcdFx0fSk7XHJcblx0XHRcdHZhciBjb3VudCA9IDA7XHJcblx0XHRcdHZhciBsaXN0QWN0aW9uID0gbmV3IENvbGxlY3Rpb25BY3Rpb24oKTtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAgcmVzcG9uc2VBY3Rpb25MaXN0WzBdLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dmFyIGFjdGlvbiA9IG5ldyBBY3Rpb24ocmVzcG9uc2VBY3Rpb25MaXN0WzBdW2ldWzFdKTtcclxuXHRcdFx0XHRsaXN0QWN0aW9uLmFkZChbYWN0aW9uXSk7XHJcblx0XHRcdFx0Y291bnQrKztcclxuXHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0Ly8gUGFzc2UgbGVzIGVsbWVudHMgYXUgaGJzXHJcblx0XHRcdGlmKGNvdW50ICE9PTAgKXtcclxuXHRcdFx0XHR0aGlzLiRjb250ZW50Lmh0bWwodGVtcGxhdGUoe29iamVjdGlmOiByZXNwb25zZVswXSxhY3Rpb25zVG90OnJlc3BvbnNlQWN0aW9uTGlzdFRvdFswXSxhY3Rpb25zOmxpc3RBY3Rpb24ubW9kZWxzfSkpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLiRjb250ZW50Lmh0bWwodGVtcGxhdGUoe29iamVjdGlmOiByZXNwb25zZVswXSxhY3Rpb25zVG90OnJlc3BvbnNlQWN0aW9uTGlzdFRvdFswXX0pKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdCQoJyNmb3JtUHV0T2JqZWN0aWYnKS5zdWJtaXQoXy5iaW5kKGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdCAgICB0aGlzLnZhbGlkKCk7XHJcblx0XHR9LCB0aGlzKSk7XHJcblxyXG5cdFx0JCgnI2Zvcm1QdXRBY3Rpb24nKS5zdWJtaXQoXy5iaW5kKGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdCAgICB0aGlzLnZhbGlkQWN0aW9uKCk7XHJcblx0XHR9LCB0aGlzKSk7XHJcblx0fSxcclxuXHJcblx0c2hvd01vZGFsOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiQWpvdXRcIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJMJ2Fqb3V0IGEgw6l0w6kgZWZmZWN0dcOpIGF2ZWMgc3VjY8Ooc1wiXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI09iamVjdGlmcycsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHR9LFxyXG5cclxuXHRzaG93RXJyb3JNb2RhbDogZnVuY3Rpb24oZXJyb3Ipe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiQWpvdXRcIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJFcnJldXIgbG9ycyBkZSBsJ2Fqb3V0IDogXCIgKyBlcnJvcixcclxuXHRcdCBcdG1vZGFsRXJyb3I6IHRydWVcclxuXHRcdH0pO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7ICIsInZhciBPYmplY3RpZnMgPSByZXF1aXJlKCcuL09iamVjdGlmcycpO1xyXG52YXIgT2JqZWN0aWYgPSByZXF1aXJlKCcuL09iamVjdGlmJyk7XHJcbnZhciBMaWVPYmplY3RpZj1yZXF1aXJlKCcuL0xpZU9iamVjdGlmJylcclxudmFyIFB1dE9iamVjdGlmID0gcmVxdWlyZSgnLi9QdXRPYmplY3RpZicpO1xyXG52YXIgRGVsZXRlT2JqZWN0aWYgPSByZXF1aXJlKCcuL0RlbGV0ZU9iamVjdGlmJyk7XHJcblxyXG52YXIgUm91dGVyID0gQmFja2JvbmUuUm91dGVyLmV4dGVuZCh7XHJcblx0cm91dGVzOiB7XHJcblx0XHRcIk9iamVjdGlmc1wiOiBcIk9iamVjdGlmc1wiLFxyXG5cdFx0XCJPYmplY3RpZnMvQWpvdXRcIjogXCJBam91dE9iamVjdGlmXCIsXHJcblx0XHRcIk9iamVjdGlmcy9Nb2RpZmllci86aWRcIjogXCJNb2RpZk9iamVjdGlmXCIsXHJcblx0XHRcIk9iamVjdGlmcy9TdXBwcmltZXIvOmlkXCI6IFwiU3VwcHJPYmplY3RpZlwiLFxyXG5cdFx0XCJPYmplY3RpZnMvOmlkXCI6IFwiT2JqZWN0aWZcIixcclxuXHRcdFwiT2JqZWN0aWZzL01vZGlmaWVyLzppZC9BY3Rpb24vU3VwcHJpbWVyLzppZEFjdGlvblwiOiBcIlN1cHByT2JqZWN0aWZBY3Rpb25cIixcclxuXHRcdFwiSmV1eC86aWRKZXUvTWlzc2lvbnMvTW9kaWZpZXIvOmlkTWlzc2lvbi9PYmplY3RpZnMvQWpvdXRcIjogXCJMaWVPYmplY3RpZk1pc3Npb25cIixcclxuXHR9LFxyXG5cclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cclxuXHR9LFxyXG5cclxuXHRPYmplY3RpZnM6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLk9iamVjdGlmcyA9IG5ldyBPYmplY3RpZnMoKTtcclxuXHRcdHRoaXMuT2JqZWN0aWZzLnJlbmRlcigpO1xyXG5cdH0sXHJcblxyXG5cdE9iamVjdGlmOiBmdW5jdGlvbihpZCl7XHJcblx0XHR0aGlzLm9iamVjdGlmcyA9IG5ldyBPYmplY3RpZigpO1xyXG5cdFx0dGhpcy5vYmplY3RpZnMucmVuZGVyKGlkKTtcclxuXHR9LFxyXG5cclxuXHRBam91dE9iamVjdGlmOiBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5vYmplY3RpZiA9IG5ldyBQdXRPYmplY3RpZigpO1xyXG5cdFx0dGhpcy5vYmplY3RpZi5yZW5kZXIoKTtcclxuXHR9LFxyXG5cdExpZU9iamVjdGlmTWlzc2lvbjogZnVuY3Rpb24oaWRKZXUsaWRNaXNzaW9uKXtcclxuXHRcdHRoaXMubGllT2JqZWN0aWYgPSBuZXcgTGllT2JqZWN0aWYoKTtcclxuXHRcdHRoaXMubGllT2JqZWN0aWYucmVuZGVyKGlkSmV1LGlkTWlzc2lvbik7XHJcblx0fSxcclxuXHJcblx0TW9kaWZPYmplY3RpZjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5vYmplY3RpZiA9IG5ldyBQdXRPYmplY3RpZigpO1xyXG5cdFx0dGhpcy5vYmplY3RpZi5yZW5kZXJNb2RpZihpZCk7XHJcblx0fSxcclxuXHJcblx0U3VwcHJPYmplY3RpZjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5vYmplY3RpZiA9IG5ldyBEZWxldGVPYmplY3RpZigpO1xyXG5cdFx0dGhpcy5vYmplY3RpZi5yZW5kZXIoaWQpO1xyXG5cdH0sXHJcblxyXG5cdFN1cHByT2JqZWN0aWZBY3Rpb246IGZ1bmN0aW9uKGlkLCBpZEFjdGlvbil7XHJcblx0XHR0aGlzLm9iamVjdGlmID0gbmV3IERlbGV0ZU9iamVjdGlmKCk7XHJcblx0XHR0aGlzLm9iamVjdGlmLnJlbmRlckVzdEFzc28oaWQsaWRBY3Rpb24pO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlcjsiLCJ2YXIgcmVnbGVNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL1JlZ2xlcy9SZWdsZScpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHJlbmRlcjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dmFyIG1vZGVsID0gbmV3IHJlZ2xlTW9kZWwoe1wiaWRcIjppZH0pLmZldGNoKHtcclxuXHRcdFx0c3VjY2VzczogXy5iaW5kKHRoaXMuY29uZmlybSx0aGlzKVxyXG5cdFx0fSk7XHJcblxyXG5cdH0sXHJcblxyXG5cdGNvbmZpcm06ZnVuY3Rpb24ocmVnbGUpe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJDb25maXJtZXIgbGEgc3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsRm9vdGVyOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBkYXRhLWRpc21pc3M9XCJtb2RhbFwiIGlkPVwiYW5udWxEZWxldGVcIj5Bbm51bGVyPC9idXR0b24+PGEgY2xhc3M9XCJidG4gYnRuLWRhbmdlciBidG4tb2tcIiBpZD1cImNvbmZpcm1EZWxldGVcIiBkYXRhLWRpc21pc3M9XCJtb2RhbFwiPlN1cHByaW1lcjwvYT4nXHJcblx0XHR9KTtcclxuXHRcdCQoJyNjb25maXJtRGVsZXRlJykub24oJ2NsaWNrJyxfLmJpbmQoZnVuY3Rpb24oZSl7XHJcblx0XHRcdHZhciBtb2RlbCA9IG5ldyByZWdsZU1vZGVsKHtcImlkXCI6cmVnbGUuaWR9KS5kZXN0cm95KHtcclxuXHRcdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy52YWxpZCx0aGlzKSxcclxuXHRcdFx0XHRlcnJvcjogdGhpcy5zaG93RXJyb3JNb2RhbFxyXG5cdFx0XHR9KTtcclxuXHRcdH0sdGhpcykpO1xyXG5cdFx0JCgnI2FubnVsRGVsZXRlJykub24oJ2NsaWNrJyxfLmJpbmQoZnVuY3Rpb24oZSl7XHJcblx0XHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoJyNSZWdsZXMnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0XHR9LHRoaXMpKTtcclxuXHR9LFxyXG5cclxuXHR2YWxpZDpmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiU3VwcHJlc3Npb25cIixcclxuXHRcdCBcdG1vZGFsQm9keTogXCJTdXBwcmVzc2lvbiBlZmZlY3XDqWVcIlxyXG5cdFx0fSk7XHJcblx0XHQkKCcubW9kYWwtYmFja2Ryb3AnKS5yZW1vdmUoKTtcclxuXHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoJyNSZWdsZXMnLCB7dHJpZ2dlcjp0cnVlfSk7XHJcblx0fSxcclxuXHJcblx0c2hvd0Vycm9yTW9kYWw6IGZ1bmN0aW9uKGVycm9yKXtcclxuXHRcdHZhciBtb2RhbFZpZXcgPSBuZXcgbW9kYWwoe1xyXG5cdFx0XHRtb2RhbFRpdGxlOiBcIlN1cHByZXNzaW9uXCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiRXJyZXVyIGxvcnMgZGUgbGEgc3VwcHJlc3Npb24gOiBcIiArIGVycm9yLFxyXG5cdFx0IFx0bW9kYWxFcnJvcjogdHJ1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIiAgPGZvcm0gaWQ9XFxcImZvcm1QdXRSZWdsZVxcXCIgbWV0aG9kPVxcXCJwb3N0XFxcIj5cXHJcXG4gIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcclxcbiAgICA8bGFiZWwgZm9yPVxcXCJsaWJSZWdsZVxcXCI+TGliZWxsw6k8L2xhYmVsPlxcclxcbiAgICA8aW5wdXQgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgaWQ9XFxcImxpYlJlZ2xlXFxcIiBwbGFjZWhvbGRlcj1cXFwiRW50cmV6IHVuIG5vbVxcXCIgdmFsdWU9XFxcIlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnJlZ2xlIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5saWJyZWdsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCIgcmVxdWlyZWQ+XFxyXFxuICA8L2Rpdj5cXHJcXG4gIDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcclxcbiAgICA8bGFiZWwgZm9yPVxcXCJzY29yZUFjdGlvblxcXCI+U2NvcmU8L2xhYmVsPlxcclxcbiAgICA8aW5wdXQgdHlwZT1cXFwibnVtYmVyXFxcIiBjbGFzcz1cXFwiZm9ybS1jb250cm9sXFxcIiBpZD1cXFwic2NvcmVBY3Rpb25cXFwiIHBsYWNlaG9sZGVyPVxcXCJFbnRyZXogdW4gc2NvcmVcXFwiIHZhbHVlPVxcXCJcIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5yZWdsZSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuc2NvcmVtaW4gOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiIHJlcXVpcmVkPlxcclxcbiAgPC9kaXY+ICBcXHJcXG4gIDxidXR0b24gY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdFxcXCI+VmFsaWRlcjwvYnV0dG9uPlxcclxcbiAgPC9mb3JtPlwiO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG4iLCJ2YXIgcmVnbGVNb2RlbCA9IHJlcXVpcmUoJy4uLy4uL01vZGVsL1JlZ2xlcy9SZWdsZScpO1xyXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKCcuL1B1dFJlZ2xlLmhicycpO1xyXG52YXIgbW9kYWwgPSByZXF1aXJlKCcuLi9HbG9iYWwvbW9kYWwuanMnKTtcclxudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZ3VyYXRpb24uanMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdCRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0JHRpdGxlIDogJCgnI3RpdGxlJyksXHRcclxuXHQkY29udGVudCA6ICQoJyNjb250ZW50JyksXHJcblxyXG5cdGVsOiAkKCcjZm9ybVB1dFJlZ2xlJyksXHJcblxyXG5cdC8vQXBwZWzDqSBhdSBtb21lbnQgZGUgbCdpbnN0YW5jaWF0aW9uXHRcclxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpe1xyXG5cdH0sXHJcblxyXG5cdC8vRm9uY3Rpb24gY2hhcmfDqWUgZHUgcmVuZHVcclxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XHJcblx0XHRcdHRoaXMucmVuZGVyUmVzdWx0YXQodW5kZWZpbmVkKTtcclxuXHRcdHRoaXMuJHBhZ2VOYW1lLmh0bWwoXCJBam91dCBSZWdsZVwiKTtcclxuXHRcdHRoaXMuJHRpdGxlLmh0bWwoXCJBam91dGVyIHVuZSBSZWdsZVwiKTtcclxuXHR9LFxyXG5cclxuXHRyZW5kZXJNb2RpZjogZnVuY3Rpb24oaWQpe1xyXG5cdFx0dGhpcy5pZFJlZ2xlPWlkO1xyXG5cdFx0JC53aGVuKG5ldyByZWdsZU1vZGVsKHtcImlkXCI6aWR9KS5mZXRjaCgpKVxyXG5cdFx0LmRvbmUoXy5iaW5kKGZ1bmN0aW9uKHJlZ2xlKXtcclxuXHRcdFx0dGhpcy5yZW5kZXJSZXN1bHRhdChyZWdsZSk7XHJcblx0XHR9LHRoaXMpKTtcdFx0XHJcblx0XHR0aGlzLiRwYWdlTmFtZS5odG1sKFwiTW9kaWZpZXIgUmVnbGVcIik7XHJcblx0XHR0aGlzLiR0aXRsZS5odG1sKFwiTW9kaWZpZXIgdW5lIFJlZ2xlXCIpO1xyXG5cdH0sXHJcblxyXG5cdHZhbGlkOiBmdW5jdGlvbihlKXtcclxuXHRcdHZhciBsaWJSZWdsZSA9ICQoJyNsaWJSZWdsZScpLnZhbCgpO1xyXG5cdFx0dmFyIHNjb3JlQWN0aW9uID0gJCgnI3Njb3JlQWN0aW9uJykudmFsKCk7XHJcblxyXG5cdFx0dmFyIG1vZGVsID0gbmV3IHJlZ2xlTW9kZWwoKTtcclxuXHRcdGlmICh0aGlzLmlkUmVnbGU9PT11bmRlZmluZWQpe1xyXG5cdFx0XHRtb2RlbC5zYXZlKHtcImxpYnJlZ2xlXCI6bGliUmVnbGUsIFwic2NvcmVtaW5cIjpzY29yZUFjdGlvbn0sIHtcclxuXHRcdFx0XHRzdWNjZXNzOiB0aGlzLnNob3dNb2RhbChcIkFqb3V0XCIpLFxyXG5cdFx0XHRcdGVycm9yOiB0aGlzLnNob3dFcnJvck1vZGFsXHJcblx0XHRcdH0pOyBcclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdG1vZGVsLnNhdmUoe1wiaWRcIjp0aGlzLmlkUmVnbGUsIFwibGlicmVnbGVcIjpsaWJSZWdsZSwgXCJzY29yZW1pblwiOnNjb3JlQWN0aW9ufSwge1xyXG5cdFx0XHRcdHN1Y2Nlc3M6IHRoaXMuc2hvd01vZGFsKFwiTW9kaWZpZXJcIiksXHJcblx0XHRcdFx0ZXJyb3I6IHRoaXMuc2hvd0Vycm9yTW9kYWxcclxuXHRcdFx0fSk7XHJcblx0XHR9IFxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHJcblx0cmVuZGVyUmVzdWx0YXQ6IGZ1bmN0aW9uKHJlZ2xlKXtcclxuXHRcdGlmKHJlZ2xlPT09dW5kZWZpbmVkKXtcclxuXHRcdFx0dGhpcy4kY29udGVudC5odG1sKHRlbXBsYXRlKCkpO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHRoaXMuJGNvbnRlbnQuaHRtbCh0ZW1wbGF0ZSh7cmVnbGU6cmVnbGV9KSk7XHJcblx0XHR9XHJcblx0XHQkKCcjZm9ybVB1dFJlZ2xlJykuc3VibWl0KF8uYmluZChmdW5jdGlvbihldmVudCl7XHJcblx0XHQgICAgdGhpcy52YWxpZCgpO1xyXG5cdFx0fSwgdGhpcykpO1xyXG5cdH0sXHJcblxyXG5cdHNob3dNb2RhbDogZnVuY3Rpb24oYWN0aW9uVHlwZSl7XHJcblx0XHR2YXIgQXJ0aWNsZU1vZGFsQm9keSA9IFwiTGFcIjtcclxuXHRcdGlmKGFjdGlvblR5cGUgPT09IFwiQWpvdXRcIil7XHJcblx0XHRcdEFydGljbGVNb2RhbEJvZHkgPSBcIkwnXCI7XHJcblx0XHR9XHJcblx0XHR2YXIgbW9kYWxWaWV3ID0gbmV3IG1vZGFsKHtcclxuXHRcdFx0bW9kYWxUaXRsZTogYWN0aW9uVHlwZSxcclxuXHRcdCBcdG1vZGFsQm9keTogQXJ0aWNsZU1vZGFsQm9keStcIiBcIithY3Rpb25UeXBlK1wiIGEgw6l0w6kgZWZmZWN0dcOpIGF2ZWMgc3VjY8Ooc1wiXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgnI1JlZ2xlcycsIHt0cmlnZ2VyOnRydWV9KTtcclxuXHR9LFxyXG5cclxuXHRzaG93RXJyb3JNb2RhbDogZnVuY3Rpb24oZXJyb3Ipe1xyXG5cdFx0dmFyIG1vZGFsVmlldyA9IG5ldyBtb2RhbCh7XHJcblx0XHRcdG1vZGFsVGl0bGU6IFwiQWpvdXQvTW9kaWZpY2F0aW9uXCIsXHJcblx0XHQgXHRtb2RhbEJvZHk6IFwiRXJyZXVyIGxvcnMgZGUgbCdham91dC9tb2RpZmljYXRpb24gOiBcIiArIGVycm9yLFxyXG5cdFx0IFx0bW9kYWxFcnJvcjogdHJ1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiY29tcGlsZXJcIjpbNixcIj49IDIuMC4wLWJldGEuMVwiXSxcIm1haW5cIjpmdW5jdGlvbihkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPXRoaXMubGFtYmRhLCBhbGlhczI9dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIHJldHVybiBcIjx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcblx0PHRoZWFkPlxcclxcblx0XHQ8dHI+XFxyXFxuXHRcdFx0PHRoPklkZW50aWZpYW50PC90aD5cXHJcXG5cdFx0XHQ8dGg+TGliZWxsw6kgUsOoZ2xlPC90aD5cXHJcXG5cdFx0XHQ8dGg+U2NvcmU8L3RoPlxcclxcblx0XHRcdDx0aD48L3RoPlxcclxcblx0XHQ8L3RyPlxcclxcblx0PC90aGVhZD5cXHJcXG5cdDx0Ym9keT5cXHJcXG5cdFx0XHQ8dHI+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5yZWdsZSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuYXR0cmlidXRlcyA6IHN0YWNrMSkpICE9IG51bGwgPyBzdGFjazEubnVtcmVnbGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucmVnbGUgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmF0dHJpYnV0ZXMgOiBzdGFjazEpKSAhPSBudWxsID8gc3RhY2sxLmxpYnJlZ2xlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnJlZ2xlIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hdHRyaWJ1dGVzIDogc3RhY2sxKSkgIT0gbnVsbCA/IHN0YWNrMS5zY29yZW1pbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNSZWdsZXMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5yZWdsZSA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEuYXR0cmlidXRlcyA6IHN0YWNrMSkpICE9IG51bGwgPyBzdGFjazEubnVtcmVnbGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcclxcblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjUmVnbGVzL1N1cHByaW1lci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLnJlZ2xlIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5hdHRyaWJ1dGVzIDogc3RhY2sxKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1yZWdsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdDwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cdDwvdGJvZHk+XFxyXFxuPC90YWJsZT5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuIiwidmFyIHJlZ2xlTW9kZWwgPSByZXF1aXJlKCcuLi8uLi9Nb2RlbC9SZWdsZXMvUmVnbGUnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9SZWdsZS5oYnMnKTtcclxuXHJcbnZhciB2aWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cdHBhZ2VOYW1lIDogJCgndGl0bGUnKSxcclxuXHR0aXRsZSA6ICQoJyN0aXRsZScpLFxyXG5cdGNvbnRlbnQgOiAkKCcjY29udGVudCcpLFxyXG5cclxuXHQvL0FwcGVsw6kgYXUgbW9tZW50IGRlIGwnaW5zdGFuY2lhdGlvblx0XHJcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcclxuXHR9LFxyXG5cclxuXHQvL0ZvbmN0aW9uIGNoYXJnw6llIGR1IHJlbmR1XHJcblx0cmVuZGVyOiBmdW5jdGlvbihpZCl7XHJcblx0XHR2YXIgbW9kZWwgPSBuZXcgcmVnbGVNb2RlbCh7XCJpZFwiOmlkfSkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5yZW5kZXJSZXN1bHRhdCwgdGhpcylcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLnBhZ2VOYW1lKS5odG1sKFwiRMOpdGFpbCBSw6hnbGVcIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJJbmZvcm1hdGlvbnMgUsOoZ2xlXCIpO1xyXG5cdH0sXHJcblxyXG5cdHJlbmRlclJlc3VsdGF0OiBmdW5jdGlvbihyZWdsZSl7XHJcblx0XHQkKHRoaXMuY29udGVudCkuaHRtbCh0ZW1wbGF0ZSh7cmVnbGV9KSk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdmlldzsiLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9dGhpcy5sYW1iZGEsIGFsaWFzMj10aGlzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgcmV0dXJuIFwiXHRcdFx0PHRyIG9uQ2xpY2s9XFxcImRvY3VtZW50LmxvY2F0aW9uPScjUmVnbGVzL1wiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLm51bXJlZ2xlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiJ1xcXCI+XFxyXFxuXHRcdFx0XHQ8dGQ+XCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtcmVnbGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCI8L3RkPlxcclxcblx0XHRcdFx0PHRkPlwiXG4gICAgKyBhbGlhczIoYWxpYXMxKCgoc3RhY2sxID0gKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwLmF0dHJpYnV0ZXMgOiBkZXB0aDApKSAhPSBudWxsID8gc3RhY2sxLmxpYnJlZ2xlIDogc3RhY2sxKSwgZGVwdGgwKSlcbiAgICArIFwiPC90ZD5cXHJcXG5cdFx0XHRcdDx0ZD5cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5zY29yZW1pbiA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIjwvdGQ+XFxyXFxuXHRcdFx0XHQ8dGQ+XFxyXFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNSZWdsZXMvTW9kaWZpZXIvXCJcbiAgICArIGFsaWFzMihhbGlhczEoKChzdGFjazEgPSAoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAuYXR0cmlidXRlcyA6IGRlcHRoMCkpICE9IG51bGwgPyBzdGFjazEubnVtcmVnbGUgOiBzdGFjazEpLCBkZXB0aDApKVxuICAgICsgXCJcXFwiPlxcclxcblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvc3Bhbj5cXHJcXG5cdFx0XHRcdFx0PC9hPlxcclxcblx0XHRcdFx0XHQ8YSBocmVmPVxcXCIjUmVnbGVzL1N1cHByaW1lci9cIlxuICAgICsgYWxpYXMyKGFsaWFzMSgoKHN0YWNrMSA9IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5hdHRyaWJ1dGVzIDogZGVwdGgwKSkgIT0gbnVsbCA/IHN0YWNrMS5udW1yZWdsZSA6IHN0YWNrMSksIGRlcHRoMCkpXG4gICAgKyBcIlxcXCI+XFxyXFxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tdHJhc2hcXFwiIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj48L3NwYW4+XFxyXFxuXHRcdFx0XHRcdDwvYT5cXHJcXG5cdFx0XHRcdDwvdGQ+XFxyXFxuXHRcdFx0PC90cj5cXHJcXG5cIjtcbn0sXCJjb21waWxlclwiOls2LFwiPj0gMi4wLjAtYmV0YS4xXCJdLFwibWFpblwiOmZ1bmN0aW9uKGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiBcIjxhIGhyZWY9XFxcIiNSZWdsZXMvQWpvdXRcXFwiPlxcclxcblx0PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLXN1Y2Nlc3NcXFwiPlxcclxcblx0ICA8c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzXFxcIiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCI+PC9zcGFuPiBBam91dGVyIFLDqGdsZVxcclxcblx0PC9idXR0b24+XFxyXFxuPC9hPlxcclxcblxcclxcbjx0YWJsZSBjbGFzcz1cXFwidGFibGVcXFwiPlxcclxcblx0PHRoZWFkPlxcclxcblx0XHQ8dHI+XFxyXFxuXHRcdFx0PHRoPklkZW50aWZpYW50PC90aD5cXHJcXG5cdFx0XHQ8dGg+TGliZWxsw6k8L3RoPlxcclxcblx0XHRcdDx0aD5TY29yZTwvdGg+XFxyXFxuXHRcdFx0PHRoPjwvdGg+XFxyXFxuXHRcdDwvdHI+XFxyXFxuXHQ8L3RoZWFkPlxcclxcblx0PHRib2R5PlxcclxcblwiXG4gICAgKyAoKHN0YWNrMSA9IGhlbHBlcnMuZWFjaC5jYWxsKGRlcHRoMCwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAucmVnbGVzIDogZGVwdGgwKSx7XCJuYW1lXCI6XCJlYWNoXCIsXCJoYXNoXCI6e30sXCJmblwiOnRoaXMucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjp0aGlzLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXHQ8L3Rib2R5PlxcclxcbjwvdGFibGU+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbiIsInZhciByZWdsZU1vZGVsID0gcmVxdWlyZSgnLi4vLi4vTW9kZWwvUmVnbGVzL1JlZ2xlc0xpc3QnKTtcclxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi9SZWdsZXMuaGJzJyk7XHJcblxyXG52YXIgdmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHRwYWdlTmFtZSA6ICQoJ3RpdGxlJyksXHJcblx0dGl0bGUgOiAkKCcjdGl0bGUnKSxcclxuXHRjb250ZW50IDogJCgnI2NvbnRlbnQnKSxcclxuXHJcblx0Ly9BcHBlbMOpIGF1IG1vbWVudCBkZSBsJ2luc3RhbmNpYXRpb25cdFxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblx0fSxcclxuXHJcblx0Ly9Gb25jdGlvbiBjaGFyZ8OpZSBkdSByZW5kdVxyXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBtb2RlbCA9IG5ldyByZWdsZU1vZGVsKCkuZmV0Y2goe1xyXG5cdFx0XHRzdWNjZXNzOiBfLmJpbmQodGhpcy5yZW5kZXJSZXN1bHRhdCwgdGhpcylcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLnBhZ2VOYW1lKS5odG1sKFwiTGlzdGUgZGVzIFLDqGdsZXNcIik7XHJcblx0XHQkKHRoaXMudGl0bGUpLmh0bWwoXCJMaXN0ZSBkZXMgUsOoZ2xlc1wiKTtcclxuXHR9LFxyXG5cclxuXHRyZW5kZXJSZXN1bHRhdDogZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0JCh0aGlzLmNvbnRlbnQpLmh0bWwodGVtcGxhdGUoe3JlZ2xlczogcmVzcG9uc2UudG9BcnJheSgpfSkpO1xyXG5cdH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7IiwidmFyIFJlZ2xlcyA9IHJlcXVpcmUoJy4vUmVnbGVzJyk7XHJcbnZhciBSZWdsZSA9IHJlcXVpcmUoJy4vUmVnbGUnKTtcclxudmFyIFB1dFJlZ2xlID0gcmVxdWlyZSgnLi9QdXRSZWdsZScpO1xyXG52YXIgRGVsZXRlUmVnbGUgPSByZXF1aXJlKCcuL0RlbGV0ZVJlZ2xlJyk7XHJcblxyXG52YXIgUm91dGVyID0gQmFja2JvbmUuUm91dGVyLmV4dGVuZCh7XHJcblx0cm91dGVzOiB7XHJcblx0XHRcIlJlZ2xlc1wiOiBcIlJlZ2xlc1wiLFxyXG5cdFx0XCJSZWdsZXMvQWpvdXRcIjogXCJBam91dFJlZ2xlXCIsXHJcblx0XHRcIlJlZ2xlcy9Nb2RpZmllci86aWRcIjogXCJNb2RpZlJlZ2xlXCIsXHJcblx0XHRcIlJlZ2xlcy9TdXBwcmltZXIvOmlkXCI6IFwiU3VwcHJSZWdsZVwiLFxyXG5cdFx0XCJSZWdsZXMvOmlkXCI6IFwiUmVnbGVcIlxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblxyXG5cdH0sXHJcblxyXG5cdFJlZ2xlczogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMucmVnbGVzID0gbmV3IFJlZ2xlcygpO1xyXG5cdFx0dGhpcy5yZWdsZXMucmVuZGVyKCk7XHJcblx0fSxcclxuXHJcblx0UmVnbGU6IGZ1bmN0aW9uKGlkKXtcclxuXHRcdHRoaXMucmVnbGUgPSBuZXcgUmVnbGUoKTtcclxuXHRcdHRoaXMucmVnbGUucmVuZGVyKGlkKTtcclxuXHR9LFxyXG5cclxuXHRBam91dFJlZ2xlOiBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5yZWdsZSA9IG5ldyBQdXRSZWdsZSgpO1xyXG5cdFx0dGhpcy5yZWdsZS5yZW5kZXIoKTtcclxuXHR9LFxyXG5cclxuXHRNb2RpZlJlZ2xlOiBmdW5jdGlvbihpZCl7XHJcblx0XHR0aGlzLnJlZ2xlID0gbmV3IFB1dFJlZ2xlKCk7XHJcblx0XHR0aGlzLnJlZ2xlLnJlbmRlck1vZGlmKGlkKTtcclxuXHR9LFxyXG5cclxuXHRTdXBwclJlZ2xlOiBmdW5jdGlvbihpZCl7XHJcblx0XHR0aGlzLnJlZ2xlID0gbmV3IERlbGV0ZVJlZ2xlKCk7XHJcblx0XHR0aGlzLnJlZ2xlLnJlbmRlcihpZCk7XHJcblx0fVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUm91dGVyOyIsInZhciBjb25maWd1cmF0aW9uID0ge1xyXG5cdHVybDogXCJodHRwOi8vbG9jYWxob3N0OjgwODAvXCJcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY29uZmlndXJhdGlvbjsiLCJ2YXIgQWNjdWVpbCA9IHJlcXVpcmUoJy4vVmlldy9BY2N1ZWlsL0FjY3VlaWwnKTtcclxudmFyIEFwcHJlbmFudHMgPSByZXF1aXJlKCcuL1ZpZXcvQXBwcmVuYW50cy9Sb3V0ZXJBcHByZW5hbnRzJyk7XHJcbnZhciBBY3Rpb25zID0gcmVxdWlyZSgnLi9WaWV3L0FjdGlvbnMvUm91dGVyQWN0aW9ucycpO1xyXG52YXIgUmVnbGVzID0gcmVxdWlyZSgnLi9WaWV3L1JlZ2xlcy9Sb3V0ZXJSZWdsZXMnKTtcclxudmFyIEluZGljYXRldXJzID0gcmVxdWlyZSgnLi9WaWV3L0luZGljYXRldXJzL1JvdXRlckluZGljYXRldXJzJyk7XHJcbnZhciBPYmplY3RpZnMgPSByZXF1aXJlKCcuL1ZpZXcvT2JqZWN0aWZzL1JvdXRlck9iamVjdGlmcycpO1xyXG52YXIgSmV1eD1yZXF1aXJlKCcuL1ZpZXcvSmV1eC9Sb3V0ZXJKZXV4Jyk7XHJcbnZhciBFdmFsdWF0aW9uID0gcmVxdWlyZSgnLi9WaWV3L0V2YWx1YXRpb24vUm91dGVyRXZhbHVhdGlvbicpO1xyXG52YXIgTWlzc2lvbnM9IHJlcXVpcmUoJy4vVmlldy9NaXNzaW9ucy9Sb3V0ZXJNaXNzaW9ucycpXHJcblxyXG52YXIgUm91dGVyID0gQmFja2JvbmUuUm91dGVyLmV4dGVuZCh7XHJcblx0cm91dGVzOiB7XHJcblx0XHRcIlwiOiBcIkFjY3VlaWxcIlxyXG5cdH0sXHJcblxyXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7XHJcblxyXG5cdH0sXHJcblxyXG5cdEFjY3VlaWw6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLmFjY3VlaWwgPSBuZXcgQWNjdWVpbCgpO1xyXG5cdFx0dGhpcy5hY2N1ZWlsLnJlbmRlcigpO1xyXG5cdH1cclxufSk7XHJcblxyXG52YXIgcm91dGVyID0gbmV3IFJvdXRlcigpO1xyXG52YXIgYXBwcmVuYW50c1JvdXRlciA9IG5ldyBBcHByZW5hbnRzKCk7XHJcbnZhciBhY3Rpb25zUm91dGVyID0gbmV3IEFjdGlvbnMoKTtcclxudmFyIHJlZ2xlc1JvdXRlciA9IG5ldyBSZWdsZXMoKTtcclxudmFyIGluZGljYXRldXJzUm91dGV1ciA9IG5ldyBJbmRpY2F0ZXVycygpO1xyXG52YXIgb2JqZWN0aWZzUm91dGV1ciA9IG5ldyBPYmplY3RpZnMoKTtcclxudmFyIGV2YWx1YXRpb25Sb3V0ZXVyID0gbmV3IEV2YWx1YXRpb24oKTtcclxudmFyIEpldXhSb3V0ZXVyPW5ldyBKZXV4KCk7XHJcbnZhciBNaXNzaW9uc1JvdXRldXI9bmV3IE1pc3Npb25zKCk7XHJcblxyXG5CYWNrYm9uZS5oaXN0b3J5LnN0YXJ0KCk7Il19
