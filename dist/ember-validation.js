// Ember Validation
// © 2013 Daniel Kuczewski
// Licensed under MIT license
// build date: 15-09-2014
(function(window) {
if(typeof Ember === 'undefined') {
  throw new Error("Ember not found");
}

Ember.Validation = Ember.Namespace.create();

if ('undefined' === typeof EV) {
  EV = Ember.Validation;

  if ('undefined' !== typeof window && 'undefined' !== typeof window.EV) {
    window.EV = Ember.Validation;
  }
}

Ember.Validation.toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
};

Ember.Validation.humanize = function (str) {
  return str.replace(/_id$/, '').
    replace(/_/g, ' ').
    replace(/^\w/g, function (s) {
      return s.toUpperCase();
    });
};
})(this);
(function(window) {
Ember.Validation.defaultMessages = {
  invalid: "%@1 is invalid",
  mail: "%@1 is invalid mail address",
  required: "%@1 is required",
  equals: "%@1 must be equal to %@2",
  number: "%@1 must be a number",
  integer: "%@1 must be an integer",
  min: "%@1 must be greater than or equal to %@2",
  max: "%@1 must be less than or equal to %@2",
  range: "%@1 must be in the range of %@2 and %@3",
  string: "%@1 must be a string",
  minLength: "%@1 must be at least %@2 characters",
  maxLength: "%@1 must be at most %@2 characters",
  textLength: "%@1 must be between %@2 and %@3 characters"
};
})(this);
(function(window) {
var get = Ember.get, fmt = Ember.String.fmt, toType = Ember.Validation.toType, msgs = Ember.Validation.defaultMessages;
/**
Base class for rules.
@class Ember.Validation.BaseRule
*/
Ember.Validation.BaseRule = Ember.Object.extend({

  propertyName: null,
  message: msgs.invalid,
  parameters:null,

  _validate: function(value, context) {

    var result = {
      isValid:true,
      error:"",
      override:false
    };

    var parameters = this.getParameters(context);
    result.isValid = this.validate.apply(this, [value].concat(parameters, [context]));
    if(!result.isValid) {
      result.error = this.getError(parameters);
    }
    result.override = this.override.apply(this, [value, result.isValid].concat(parameters, [context]));

    return result;
  },

  validate: function(value, args) {
    throw new Error("BaseRule validate() must be overwritten");
  },

  override: function(value, isValid, args) {
    return false;
  },

  getError: function(parameters) {
    return fmt(get(this, 'message'), [get(this, 'propertyName')].concat(parameters));
  },

  getParameters: function(context) {
    var retVal = [];
    var pars = get(this, 'parameters');
    if(!pars && toType(pars) !== 'array') {
      return [];
    }
    for(var i=0;i<pars.length; i++) {
      retVal.push(this._processParameter(pars[i], context));
    }
    return retVal;
  },

  _processParameter: function(par, context) {
    if(toType(par)=== "function") {
      return par.call(context);
    } else {
      return par;
    }
  }

});

})(this);
(function(window) {
toType = Ember.Validation.toType, msgs = Ember.Validation.defaultMessages;

Ember.Validation.MatchRule = Ember.Validation.BaseRule.extend({

  validate: function(value, regex) {
    if(toType(value)!=='string') {
      return false;
    }
    return regex.test(value);
  }
});

Ember.Validation.NoMatchRule = Ember.Validation.MatchRule.extend({

  validate: function(value, regex) {
    return !this._super(value, regex);
  }

});

Ember.Validation.MailRule = Ember.Validation.MatchRule.extend({

  parameters: [/^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/],
  message: msgs.mail

});
})(this);
(function(window) {
toType = Ember.Validation.toType, msgs = Ember.Validation.defaultMessages;

Ember.Validation.NumberRule = Ember.Validation.BaseRule.extend({

  message: msgs.number,

  validate: function(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
  }

});

Ember.Validation.IntegerRule = Ember.Validation.NumberRule.extend({

  message: msgs.integer,

  validate: function(value) {

    if(!this._super(value)) {
      return false;
    }

    var v = parseFloat(value);
    return toType(v)==='number' && v % 1 === 0;
  }
});

Ember.Validation.NumberMinRule = Ember.Validation.NumberRule.extend({

  message: msgs.min,

  validate: function(value, min) {

    if(!this._super(value)) {
      return false;
    }

    return (parseFloat(value) >= min);
  }

});

Ember.Validation.NumberMaxRule = Ember.Validation.NumberRule.extend({

  message: msgs.max,

  validate: function(value, max) {

    if(!this._super(value)) {
      return false;
    }

    return (parseFloat(value) <= max);
  }
});

Ember.Validation.NumberRangeRule = Ember.Validation.NumberRule.extend({

  message: msgs.range,

  validate: function(value, min, max) {

    if(!this._super(value)) {
      return false;
    }

    return parseFloat(value) >= min && parseFloat(value) <= max;
  }
});
})(this);
(function(window) {
var get = Ember.get, toType = Ember.Validation.toType, msgs = Ember.Validation.defaultMessages;

Ember.Validation.StringRule = Ember.Validation.BaseRule.extend({

  message: msgs.string,

  validate: function(value) {
    return toType(value)!=='string';
  }
});

Ember.Validation.TextMinLengthRule = Ember.Validation.BaseRule.extend({

  message: msgs.minLength,

  validate: function(value, min) {

    if(toType(value)!=='string') {
      return false;
    }

    var length = get(value, 'length') || 0;

    return length >= min;
  }

});

Ember.Validation.TextMaxLengthRule = Ember.Validation.BaseRule.extend({

  message: msgs.maxLength,

  validate: function(value, max) {

    if(toType(value)!=='string') {
      return false;
    }

    var length = get(value, 'length') || 0;

    return length <= max;
  }
});

Ember.Validation.TextLengthRule = Ember.Validation.BaseRule.extend({

  message: msgs.textLength,

  validate: function(value, min, max) {

    if(toType(value)!=='string') {
      return false;
    }

    var length = get(value, 'length') || 0;

    return length >= min && length <= max;
  }
});
})(this);
(function(window) {
var get = Ember.get, toType = Ember.Validation.toType, msgs = Ember.Validation.defaultMessages;

Ember.Validation.RequiredRule = Ember.Validation.BaseRule.extend({

  message: msgs.required,

  validate: function(value, required) {
    return Ember.isEmpty(value) ? !required : true;
  },

  override: function(value, isValid, required) {
    return Ember.isEmpty(value) && !required;
  }
});

Ember.Validation.EqualsRule = Ember.Validation.BaseRule.extend({

  message: msgs.equals,

  validate: function(value, value2) {
    return value === value2;
  }
});

Ember.Validation.CustomRule = Ember.Validation.BaseRule.extend({

  _validate: function(value, context) {

    var result = {
      isValid:true,
      error:"",
      override:false
    };

    var parameters = get(this, 'parameters');
    var callback = parameters.length>0 ? parameters[0] : null;

    if(toType(callback)!=="function") {
      throw new Error("CustomRule parameter must be function");
    }

    result.isValid = callback.call(context, value);
    if(!result.isValid) {
      result.error = this.getError([]);
    }

    return result;
  }
});


})(this);
(function(window) {
var get = Ember.get, set = Ember.set, toType = Ember.Validation.toType;

/**
 Validation result of a property

 @class Ember.Validation.Result
 */
Ember.Validation.Result = Ember.Object.extend({

  error:null,

  setError: function(message) {
    set(this, 'error', message);
  },

  /**
   property {boolean}
   */
  hasError: Ember.computed(function() {
    return toType(get(this, 'error'))==='string';
  }).property('error'),

  /**
   property {boolean}
   */
  isValid: Ember.computed.not('hasError')

});

/**
 Validation result of an object
 *
 @class Ember.Validation.ValidationResult
 */
Ember.Validation.ValidationResult = Ember.Object.extend({

  results:null,

  init: function() {
    this._super();
    set(this, 'results', Ember.Map.create());
  },

  clear: function() {
    var results = get(this, 'results');
    results.forEach(function(property, result ) {
      if(Ember.Validation.ValidationResult.detectInstance(result)){
        result.clear();
      } else if(Ember.Validation.Result.detectInstance(result)){
        result.set('error', null);
      }
    });
    this.notifyPropertyChange('results');
  },

  getPropertyResult: function(property) {
    return get(this, 'results').get(property) || Ember.Validation.Result.create();
  },

  setPropertyResult: function(property, presult) {
    var results = get(this, 'results');
    results.set(property, presult);
    this.notifyPropertyChange('results');
  },

  /**
   @property {boolean}
   */
  hasError: Ember.computed(function() {
    return !!get(this, 'errorLength');
  }).property('results'),

  /**
   @property {boolean}
   */
  isValid: Ember.computed.not('hasError'),

  /**
   @property {array}
   */
  properties: Ember.computed(function() {
    var retVal = Ember.A();
    get(this, 'results').forEach(function(property, result ) {
      retVal.pushObject(property);
    });
    return retVal;
  }).property('results'),

  /**
   @property {array}
   */
  errorProperties: Ember.computed(function() {
    var retVal = Ember.A();
    get(this, 'results').forEach(function(property, result ) {
      if(get(result, 'hasError')) {
        retVal.pushObject(property);
      }
    });
    return retVal;
  }).property('results'),

  /**
   @property {string}
   */
  error: Ember.computed(function() {
    if(get(this, 'hasError')) {
      return get(this, 'errors')[0];
    } else {
      return null;
    }
  }).property('results'),

  /**
   @property {array}
   */
  errors: Ember.computed(function() {
    var retVal = Ember.A();
    get(this, 'results').forEach(function(property, result) {
      if(get(result, 'hasError')) {

        if(Ember.Validation.ValidationResult.detectInstance(result)){
          // merge arrays
          retVal.pushObjects(get(result, 'errors'));
        } else if(Ember.Validation.Result.detectInstance(result)){
          retVal.pushObject(get(result, 'error'));
        }
      }
    });
    return retVal;
  }).property('results'),

  /**
   @property {number}
   */
  length: Ember.computed(function() {
    var length=0;
    get(this, 'results').forEach(function(property, result) {
      length++;
    });
    return length;
  }).property('results'),

  /**
   @property {number}
   */
  errorLength: Ember.computed(function() {
    var length=0;
    get(this, 'results').forEach(function(property, result) {
      if(get(result, 'hasError')) {
        length++;
      }
    });
    return length;
  }).property('results'),

  merge: function(oresult) {
    var that = this;
    get(oresult, 'results').forEach(function(property, result){
      that.setPropertyResult(property, result);
    });
  },

  /**
   @private
   */
  unknownProperty: function(property) {
    return this.getPropertyResult(property);
  }
});
})(this);
(function(window) {
var get = Ember.get, set = Ember.set;

/**
 The ValueValidator stores a bunch of validators.
 the first validation error aborts the validation process and return the result
 @class Ember.Validation.ValueValidator
 */
Ember.Validation.ValueValidator = Ember.Object.extend({

  rules: null,

  init: function() {
    this._super();
    set(this, 'rules', []);
  },

  /**
   adds a validator
   @method addValidator
   @param rule {SubClass of BaseRule} ruke to add
   */
  addRule: function(rule) {
    get(this, 'rules').push(rule);
  },

  /**
   validates the value with the validators
   the first validation error aborts the validation process and return the result
   @method validate
   @param value {Object} the value to validate
   @param obj {String} context of the validators
   @return {Ember.Validation.Result}
   */
  validate: function(value, obj) {

    var vresult = Ember.Validation.Result.create();
    var rules = get(this, 'rules');

    for (var i=0; i<rules.length; i++) {
      var result = rules[i]._validate(value, obj);
      if(!result.isValid  || result.override) {
        if(!result.isValid) {
          vresult.setError(result.error);
        }
        break;
      }
    }
    return vresult;
  }
});
})(this);
(function(window) {
var get = Ember.get, set = Ember.set, toType = Ember.Validation.toType;

/**
 The ObjectValidator stores a ValueValidator for each mapped attribute
 @class Ember.Validation.ObjectValidator
 */
Ember.Validation.ObjectValidator = Ember.Object.extend({

  validators: null,

  init: function() {
    this._super();
    set(this, 'validators', Ember.Map.create());
  },

  setPropertyValidator: function(property, validator) {
    get(this, 'validators').set(property, validator);
    return validator;
  },

  getPropertyValidator: function(property) {
    return get(this, 'validators').get(property);
  },

  hasPropertyValidator: function(property) {
    return get(this, 'validators').has(property);
  },

  createResult: function() {
    var retVal = Ember.Validation.ValidationResult.create();

    var properties = [];
    get(this, 'validators').forEach(function(property){
      properties.push(property);
    });

    for (var i=0;i<get(properties, 'length');i++) {
      retVal.setPropertyResult(properties[i], Ember.Validation.Result.create());
    }

    return retVal;
  },

  /**
   validates the object with the validators
   option can be
   - nothing : validates all properties
   - false : validates until first error
   - true : same as nothing
   - property : validates specific property
   - array of properties : validates specific properties
   @method validate
   @param obj {Object} the object to validate
   @param option {bool/String/Object} see class description
   @return {Ember.Validation.ValidationResult}
   */
  validate: function(obj, option) {

    var result;
    var retVal = this.createResult();

    var validateAll = true;

    if(toType(option)==='boolean'  ) {
      validateAll = option;
    }

    if(toType(option)==='string') {
      result = this.validateProperty(obj, option, retVal);
      retVal.setPropertyResult(option, result);
      return retVal;
    } else {
      var properties = [];
      if(toType(option)==='array') {
        properties = option;
      } else {
        var validators = get(this, 'validators');

        validators.forEach(function(property){
          properties.push(property);
        });
      }

      for (var i = 0; i < get(properties, 'length'); i++) {
        result = this.validateProperty(obj, properties[i]);
        retVal.setPropertyResult(properties[i], result);

        if(!get(result, 'isValid') && !validateAll) {
          break;
        }
      }

      return retVal;
    }
  },

  /**
   validates a single property of the passed object
   @method validateProperty
   @param obj {Object} the object to validate
   @param property {String} the property to validate
   @return {Ember.Validation.Result} Returns the validation result
   */
  validateProperty: function(obj, property) {

    if(this.hasPropertyValidator(property)) {
      var pValidator = this.getPropertyValidator(property);
      if(Ember.Validation.ValueValidator.detectInstance(pValidator)) {
        return pValidator.validate(get(obj, property), obj);
      } else if(Ember.Validation.ObjectValidator.detectInstance(pValidator)) {
        return pValidator.validate(get(obj, property));
      }
    }
    //todo warn?
    return null;
  }
});
})(this);
(function(window) {
var get = Ember.get, set = Ember.set, toType = Ember.Validation.toType, humanize = Ember.Validation.humanize;

/**
 The Chaining object helps to create a ValueValidator in a single statement

 @class Ember.Validation.Chaining
 */
Ember.Validation.Chaining = Ember.Object.extend({

  propertyName: null,
  isRequired:false,
  requiredErrorMessage:null,
  errorMessage:null,

  chain:null,

  init: function() {
    this._super();
    set(this, 'chain', []);
  },

  /**
   * sets the property as required
   *
   * @method required
   * @param {boolean} isRequired Whether or not this field is required. If a function is passed in then it 
   * will be run every time the field is validated (which allows it to be dependant on other properties of
   * the object)
   */
  required: function(isRequired) {
    if (Ember.isNone(isRequired)) {
      isRequired = true;
    }
    set(this, 'isRequired', isRequired);
    return this;
  },

  /**
   * sets the error message of the last validator in the chain
   *
   * @method message
   * @param {String} msg the message. Use %@1 for the property name and %@2, %@3, ... for the parameters
   */
  message: function(msg) {
    var v = get(this, 'chain').slice(-1)[0];
    // add message to last validator
    if(v) {
      v.message = msg;
    } else {
      // if there is no validator, check if required has been set
      var isRequired = get(this, 'isRequired');
      if (Ember.Validation.toType(isRequired) === 'function') {
        isRequired = isRequired();
      }
      if(isRequired){
        // required is the last validator
        set(this, 'requiredErrorMessage', msg);
      } else {
        // no last validator => set globally
        set(this, 'errorMessage', msg);
      }
    }
    return this;
  },

  /**
   * creates a ValueValidator out of the chain
   *
   * @method createValueValidator
   * @returns {String} msg the message. Use %@1 for the property name and %@2, %@3, ... for the parameters
   */
  createValueValidator: function() {

    var validator = Ember.Validation.ValueValidator.create();

    var propertyName = get(this, 'propertyName');
    var message = get(this, 'errorMessage');
    var requiredMessage = get(this, 'requiredErrorMessage');
    var isRequired = get(this, 'isRequired');
    if (Ember.Validation.toType(isRequired) === 'function') {
      isRequired = isRequired;
    } else {
      isRequired = !!isRequired;
    }

    var req = Ember.Validation.RequiredRule.create({
      propertyName:propertyName,
      parameters:[isRequired]
    });

    if(toType(requiredMessage) === 'string') {
      set(req, 'message', requiredMessage);
    } else if(toType(message) === 'string') {
      set(req, 'message', message);
    }

    validator.addRule(req);

    var chain = get(this, 'chain');
    for(var i=0;i<chain.length;i++) {

      var chainlink = chain[i];

      var rule = chainlink.ruleClass.create({
        propertyName:propertyName
      });

      if(chainlink.parameters && chainlink.parameters.length>0) {
        set(rule, 'parameters', chainlink.parameters);
      }

      if(toType(chainlink.message)==='string') {
        set(rule, 'message', chainlink.message);
      } else if(toType(message)==='string') {
        set(rule, 'message', message);
      }

      validator.addRule(rule);
    }

    return validator;
  },

  /**
   * alias to createValueValidator
   *
   * @method done
   */
  done: function() {
    return this.createValueValidator();
  }

});

/**
 @class Ember.Validation.ChainingContext
 */
Ember.Validation.ChainingContext = Ember.Object.extend({

  items:null,

  init: function() {
    this._super();
    set(this, 'items', {});
  },

  /**
   begins the chaining of a property validator
   @method property
   @return {Ember.Validation.Chain}
   */
  property: function(property, propertyName) {
    var chain = Ember.Validation.Chaining.create({
      propertyName: propertyName || humanize(property)
    });
    get(this, 'items')[property] = chain;
    return chain;
  },

  nested: function(property, validator) {
    if(!Ember.Validation.ObjectValidator.detect(validator)) {
      validator = validator.proto().validator;
    }
    if(Ember.Validation.ObjectValidator.detect(validator)) {
      get(this, 'items')[property] = validator;
    } else {
      //todo: warn
    }
  },

  /**
   create a ObjectValidator out of the ChainingContext
   @method createModelValidator
   @return {Object} ModelValidator
   */
  createObjectValidator: function() {

    var oValidator = Ember.Validation.ObjectValidator.create();

    var items = get(this, 'items');
    for(var property in items) {
      if(items.hasOwnProperty(property)) {
        var item = items[property];
        // when its still a chain, create the ValueValidator
        if(Ember.Validation.Chaining.detectInstance(item)) {
          item = item.createValueValidator();
        }

        if(Ember.Validation.ValueValidator.detectInstance(item) ||
          Ember.Validation.ObjectValidator.detectInstance(item)){
          oValidator.setPropertyValidator(property, item);
        }
      }
    }

    return oValidator;
  }
});

/*
 function Ember.Validation.createValidator
 param {String} propertyName optional
 return {Object} Validator chain object
 */
Ember.Validation.createValueValidator = function(propertyName){
  return Ember.Validation.Chain.create({
    propertyName: propertyName
  });
};

/*
 function createObjectValidator
 param {Function}
 return {Object} ObjectValidator
 */
Ember.Validation.createObjectValidator = function(cb){
  var chain = Ember.Validation.ChainingContext.create();
  cb.call(chain);
  return chain.createObjectValidator();
};

/*
 function Ember.Validation.map
 param {Function}
 return {Object} ObjectValidator
 */
Ember.Validation.map = Ember.Validation.createObjectValidator;
})(this);
(function(window) {
var get = Ember.get;

Ember.Validation.registerRule = function(method, ruleClass) {

  if(!ruleClass) {
    var ruleName = method.charAt(0).toUpperCase() + method.slice(1) + 'Rule';

    ruleClass = Ember.Validation[ruleName];
    if(!ruleClass) {
      throw new Error("Rule for method " + method + " not found");
    }
  }

  if(!Ember.Validation.BaseRule.detect(ruleClass)) {
    throw new Error("Rule for method " + method + " must extend from Ember.Validation.BaseRule");
  }

  // add a method to the chaining class
  var extChain= {};
  extChain[method] = function() {
    get(this, 'chain').push( {
      ruleClass:ruleClass,
      parameters: Array.prototype.slice.call(arguments, 0),
      message:null
    });
    return this;
  };
  Ember.Validation.Chaining.reopen(extChain);
};

// method mapping for included rules
var includedRules = {
  number:Ember.Validation.NumberRule,
  integer:Ember.Validation.IntegerRule,
  min:Ember.Validation.NumberMinRule,
  max:Ember.Validation.NumberMaxRule,
  range:Ember.Validation.NumberRangeRule,
  custom:Ember.Validation.CustomRule,
  noMatch:Ember.Validation.NoMatchRule,
  match:Ember.Validation.MatchRule,
  string:Ember.Validation.StringRule,
  mail:Ember.Validation.MailRule,
  length:Ember.Validation.TextLengthRule,
  minLength:Ember.Validation.TextMinLengthRule,
  maxLength:Ember.Validation.TextMaxLengthRule,
  equals:Ember.Validation.EqualsRule
};

// register included rules
for(var methodName in includedRules) {
  if(includedRules.hasOwnProperty(methodName)) {
    Ember.Validation.registerRule(methodName, includedRules[methodName]);
  }
}




})(this);
(function(window) {
var get = Ember.get, set = Ember.set, toType = Ember.Validation.toType;

/**
This mixin adds validation support to ember objects.
The validation property must be an ObjectValidator. It is shared within all instances of this class.

 Example:

    App.User = Ember.Object.extend(Ember.Validation.ValidatorSupport, {

      validation: Ember.Validation.map(function() {
        this.property("name", "Username").required().minLength(4);
        this.property("age").required().integer().min(18).message("You have to be %@2 to join");
      }),

      name:null,
      age:null
    });

@class Ember.Validation.ValidatorSupport
@extends Ember.Mixin
*/
Ember.Validation.ValidatorSupport = Ember.Mixin.create(Ember.Evented, {

  isValidated:false,
  validator: null,
  didValidate:Ember.K,

  init: function() {
    this._super();

    // gets the objectvalidator for this class
    var validator = get(this, 'validator');
    if(!validator) {
      Ember.Logger.warn("Add validator property when using the ValidatorSupport mixin");
    } else {
      if(!Ember.Validation.ObjectValidator.detect(validator.constructor)){
        Ember.Logger.warn("The validator property must be a subclass of ObjectValidator");
      }
    }

    if (validator) {
      this.set('validationResult', validator.createResult());
    }
  },

  /**
  @method hasPropertyValidator
  @param option {String} property
  @return {Boolean}
  */
  hasPropertyValidator: function(property) {
    return get(this, 'validator').hasPropertyValidator(property);
  },

  /**
   Returns the validation result as a boolean
   @property isValid
   @type Boolean
  */
  isValid: function() {
    return get(this, 'validationResult.isValid');
  }.property().volatile(),

  hasError: Ember.computed.not('isValid'),

  /**
   validates the object by passing it to the ModelValidator
   Events are triggered

   option can be
   - nothing : validates all properties
   - false : validates until first error
   - true : same as nothing
   - property : validates specific property
   - array of properties : validates specific properties
  @method validate
  @param option {Object} see class description
  @return {Ember.Validation.ValidationResult} Returns the validation result
  */
  validate: function(option) {
    var vresult = get(this, 'validator').validate(this, option);
    var validationResult = get(this, 'validationResult');
    validationResult.merge(vresult);

    this.notifyPropertyChange('validationResult');
    this.triggerValidation(vresult);
    this.set('isValidated', true);

    return vresult;
  },

  /**
   validates the object by passing it to the ModelValidator
   Events are not triggered

   option can be
   - nothing : validates all properties
   - false : validates until first error
   - true : same as nothing
   - property : validates specific property
   - array of properties : validates specific properties
   @method validate
   @param option {Object} see class description
   @return {Ember.Validation.ValidationResult} Returns the validation result
   */
  prevalidate: function(option) {
    return get(this, 'validator').validate(this, option);
  },

  /**
   validates a single property of the object by passing it to the ModelValidator
   @method validateProperty
   @param property {String} the property to validate
   @return {Ember.Validation.Result} Returns the validation result
   */
  validateProperty: function(property) {
    return get(this, 'validator').validateProperty(this, property);
  },

  /**
   clears the object of any occurred validation
   @method clearValidation
   */
  clearValidation: function() {
    var validationResult = get(this, 'validationResult');
    validationResult.clear();

    this.notifyPropertyChange('validationResult');
    this.triggerValidation(validationResult);
    this.set('isValidated', false);
  },

  triggerValidation: function(vResult) {
    var thiz = this;

    get(vResult, 'results').forEach(function(property, result){
      thiz.trigger('v_event' + property, result, thiz);
    });

    thiz.trigger('v_event', vResult, thiz);
  },

  /**
   Subscribes a function to the validation event which is triggered  after an object or property has been validated.

   @method subscribeValidation
   @param property {String} optional*
   @param context {Object} the context of the callback
   @param func {Function} callback function
   */
  subscribeValidation: function(property, context, func) {
    if(toType(property)==='object') {
      func = context;
      context = property;
      property = '';
    } else if(toType(property)==='function') {
      func = property;
      context = null;
      property = '';
    }

    this.on('v_event' + property, context, func);
  },

  /**
   Unsubscribes a function to the validation event

   @method unsubscribeValidation
   @param property {String} optional*
   @param context {Object} the context of the callback
   @param func {Function} callback function
   */
  unsubscribeValidation: function(property, context, func) {
    if(toType(property)==='object') {
      func = context;
      context = property;
      property = '';
    } else if(toType(property)==='function') {
      func = property;
      context = null;
      property = '';
    }

    this.off('v_event' + property, context, func);
  }
});

})(this);
(function(window) {
var get = Ember.get, set = Ember.set, toType = Ember.Validation.toType;

/**
 This mixin tries to obtain the validation object via the value binding and provides validation methods

 @class Ember.Validation.ValidatorViewSupport
 @extends Ember.Mixin
 */
Ember.Validation.ValidatorViewSupport = Ember.Mixin.create({

  validationObject:null,
  validationProperty:null,

  willValidate:Ember.K,
  didValidate:Ember.K,

  init: function() {
    this._super();

    var validationObject = get(this, 'validationObject');
    var validationProperty = get(this, 'validationProperty');

    if(toType(validationObject) !== 'object' && toType(validationProperty) === 'string') {
      validationObject = null;
    }

    if(toType(validationProperty) !== 'string') {
      validationProperty = null;
    }

    // when there is no validation target set, try it with valueBinding
    if(!validationObject) {
      var binding = get(this, 'valueBinding');
      if(binding) {
        var target = binding._from;
        // if there is a binding, determine the object and property
        if(target) {

          var idx = target.lastIndexOf('.');

          if (idx !== -1) {
            validationProperty = target.substr(idx + 1);
            validationObject = get(this, target.substr(0, idx));
          } else {
            validationProperty = target;
            validationObject = get(this, 'context');
          }
        }
      }
    }

    // check if validationobject has validatorsupport mixin
    if(validationObject && toType(validationObject.validate)==='function' && validationProperty) {
      set(this, 'validationProperty', validationProperty);
      set(this, 'validationObject', validationObject);
    } else if(Ember.ObjectController.detectInstance(validationObject) && toType(validationObject.get('model.validate'))==='function' && validationProperty) {
      set(this, 'validationProperty', validationProperty);
      set(this, 'validationObject', validationObject.get('model'));
    } else {
      set(this, 'validationProperty', null);
      set(this, 'validationObject', null);
      Ember.warn('ValidatorViewSupport needs either a validationObject/validationProperty or a valueBinding which binds toward a ValidatorSupport mixin');
    }

  },

  /**
   validates related property on the validation object
   This does not trigger any events on the validation object
   @method validate
   @return {Ember.Validation.Result} Returns the validation result
   */
  validate: function() {
    var validationObject = get(this, 'validationObject');
    var validationProperty = get(this, 'validationProperty');
    if(validationObject) {
      // pass it to the ValidatorSupport object
      var result = validationObject.validateProperty(validationProperty);
      this.doValidate(result);
      return result;
    }
    return null;
  },

  didInsertElement: function() {
    this._super();

    var validationObject = get(this, 'validationObject');
    var validationProperty = get(this, 'validationProperty');

    // when the view is inserted, subscribe to validation events
    if(validationObject) {
      validationObject.subscribeValidation(validationProperty, this, get(this, 'doValidate'));
    }
  },

  willDestroyElement: function() {
    this._super();

    var validationObject = get(this, 'validationObject');
    var validationProperty = get(this, 'validationProperty');

    // when the view will be destroyed, unsubscribe to validation events
    if(validationObject) {
      validationObject.unsubscribeValidation(validationProperty, this, get(this, 'doValidate'));
    }
  },

  doValidate: function(result) {
    var willRes = this.willValidate();
    if(toType(willRes)==='boolean' && !willRes) {
      return;
    }
    set(this, 'validationResult', result);
    this.didValidate(result);
  }
});
})(this);