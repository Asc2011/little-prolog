(function() {
  var Conjunction, OMeta, Rule, Stack, Term, Variable, flatten, mk, scope, subclass, _ref, _ref1;

  _ref = require('./interpreter'), Conjunction = _ref.Conjunction, Rule = _ref.Rule, Term = _ref.Term, Variable = _ref.Variable;

  _ref1 = require('metacoffee').runtime, subclass = _ref1.subclass, Stack = _ref1.Stack, OMeta = _ref1.OMeta;

  flatten = function(arr, n) {
    if (n == null) {
      n = [];
    }
    arr.map(function(el) {
      if (Array.isArray(el)) {
        return el.map(function(sa) {
          return n.push(sa);
        });
      } else {
        return n.push(el);
      }
    });
    return n;
  };

  mk = {
    Variable: function(name) {
      var variable;
      if (name === '_') {
        return new Variable('_');
      }
      variable = scope[name];
      if (!variable) {
        variable = scope[name] = new Variable(name);
      }
      return variable;
    },
    Term: function(functor, args) {
      if (args == null) {
        args = [];
      }
      args = flatten(args);
      args = args.map(function(el) {
        if ('string' === typeof el) {
          return new Term(el);
        } else {
          return el;
        }
      });
      return new Term(functor, args);
    },
    Rule: function(head, args) {
      var body;
      if (args == null) {
        args = [];
      }
      args = flatten(args);
      body = args.length === 1 ? args[0] : new Conjunction(args);
      return new Rule(head, body);
    }
  };

  scope = {};

  LittleProlog = subclass(OMeta, {
    "expression": function() {
      var expr;
      return (function() {
        at = this._idxConsumedBy((function() {
          return (function() {
            expr = this._or((function() {
              return this._apply("rule")
            }), (function() {
              return this._apply("term")
            }));
            return this._applyWithArgs("exactly", ".")
          }).call(this)
        }));
        return expr
      }).call(this)
    },
    "rule": function() {
      var head, body;
      return this._or((function() {
        return (function() {
          at = this._idxConsumedBy((function() {
            return (function() {
              head = this._apply("term");
              this._applyWithArgs("token", ':-');
              return body = this._apply("conjunction")
            }).call(this)
          }));
          return mk.Rule(head, body)
        }).call(this)
      }), (function() {
        return (function() {
          at = this._idxConsumedBy((function() {
            return head = this._apply("term")
          }));
          return new Rule(head, Term.TRUE)
        }).call(this)
      }))
    },
    "term": function() {
      var func, params;
      return (function() {
        at = this._idxConsumedBy((function() {
          return (function() {
            func = this._apply("functor");
            this._applyWithArgs("exactly", "(");
            params = this._many1((function() {
              return this._apply("argument")
            }));
            return this._applyWithArgs("exactly", ")")
          }).call(this)
        }));
        return mk.Term(func, params)
      }).call(this)
    },
    "conjunction": function() {
      var head, terms;
      return (function() {
        at = this._idxConsumedBy((function() {
          return (function() {
            head = this._apply("term");
            return terms = this._many((function() {
              return (function() {
                this._applyWithArgs("exactly", ",");
                return this._apply("term")
              }).call(this)
            }))
          }).call(this)
        }));
        return [head].concat(terms)
      }).call(this)
    },
    "argument": function() {
      var param;
      return (function() {
        at = this._idxConsumedBy((function() {
          return (function() {
            param = this._or((function() {
              return this._apply("variable")
            }), (function() {
              return this._apply("term")
            }), (function() {
              return this._apply("fact")
            }));
            return this._opt((function() {
              return this._applyWithArgs("exactly", ",")
            }))
          }).call(this)
        }));
        return param
      }).call(this)
    },
    "variable": function() {
      var name;
      return (function() {
        at = this._idxConsumedBy((function() {
          return name = this._or((function() {
            return this._apply("VarName")
          }), (function() {
            return (function() {
              switch (this._apply('anything')) {
                case "_":
                  return "_";
                default:
                  throw this.fail
              }
            }).call(this)
          }), (function() {
            return this._apply("upper")
          }))
        }));
        return mk.Variable(name)
      }).call(this)
    },
    "fact": function() {
      return this._apply("functor")
    },
    "VarName": function() {
      var first, body;
      return (function() {
        at = this._idxConsumedBy((function() {
          return (function() {
            first = this._apply("upper");
            return body = this._apply("bodyChars")
          }).call(this)
        }));
        return first + body
      }).call(this)
    },
    "functor": function() {
      var first, body;
      return (function() {
        at = this._idxConsumedBy((function() {
          return (function() {
            first = this._apply("lower");
            return body = this._apply("bodyChars")
          }).call(this)
        }));
        return first + body
      }).call(this)
    },
    "bodyChars": function() {
      var arr;
      return (function() {
        at = this._idxConsumedBy((function() {
          return arr = this._many1((function() {
            return this._or((function() {
              return this._apply("letter")
            }), (function() {
              return (function() {
                switch (this._apply('anything')) {
                  case "_":
                    return "_";
                  default:
                    throw this.fail
                }
              }).call(this)
            }))
          }))
        }));
        return arr.join('')
      }).call(this)
    }
  });;

}).call(this);