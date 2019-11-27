// Generated by CoffeeScript 2.4.1
/*
source: https://curiosity-driven.org/prolog-interpreter
*/
var Conjunction, Database, Rule, Term, Variable, example, lexer, parser;

({Term, Rule, Variable, Conjunction, Database} = require('./interpreter'));

lexer = function*(text) {
  var match, results, tokenRegexp;
  tokenRegexp = /[A-Za-z_]+|:\-|[()\.,]/g;
  results = [];
  // match
  while ((match = tokenRegexp.exec(text)) !== null) {
    results.push((yield match[0]));
  }
  return results;
};

parser = function(tokens) {
  var current, done, next, parseAtom, parseRule, parseTerm, scope;
  done = false;
  current = false;
  scope = false;
  next = function() {
    return ({
      value: current,
      done
    } = tokens.next());
  };
  parseAtom = function() {
    var msg, name;
    name = current;
    if (!/^[A-Za-z_]+$/.test(name)) {
      msg = 'Bad atom name: ' + name;
      throw new SyntaxError(msg);
    }
    next();
    return name;
  };
  parseTerm = function() {
    var args, functor, msg, variable;
    if (current === '(') {
      next(); // eat (
      args = [];
      while (current !== ')') {
        args.push(parseTerm());
        if (current !== ',' && current !== ')') {
          msg = 'Expected , or ) in term but got ' + current;
          throw new SyntaxError(msg);
        }
        if (current === ',') { // eat ,
          next();
        }
      }
      next(); // eat )
      return new Conjunction(args);
    }
    functor = parseAtom();
    if (/^[A-Z_][A-Za-z_]*$/.test(functor)) {
      if (functor === '_') {
        return new Variable('_');
      }
      // variable X in the same scope should point
      // to the same object
      variable = scope[functor];
      if (!variable) {
        variable = scope[functor] = new Variable(functor);
      }
      return variable;
    }
    if (current !== '(') {
      return new Term(functor);
    }
    next(); // eat (
    args = [];
    while (current !== ')') {
      args.push(parseTerm());
      if (current !== ',' && current !== ')') {
        msg = 'Expected , or ) in term but got ' + current;
        throw new SyntaxError(msg);
      }
      if (current === ',') { // eat ,
        next();
      }
    }
    next(); //  eat )
    return new Term(functor, args);
  };
  parseRule = function() {
    var args, body, head, msg;
    head = parseTerm();
    if (current === '.') {
      next(); // eat .
      return new Rule(head, Term.TRUE);
    }
    if (current !== ':-') {
      msg = 'Expected :- in rule but got ' + current;
      throw new SyntaxError(msg);
    }
    next(); // eat :-
    args = [];
    while (current !== '.') {
      args.push(parseTerm());
      if (current !== ',' && current !== '.') {
        msg = 'Expected , or . in term but got ' + current;
        throw new SyntaxError(msg);
      }
      if (current === ',') { // eat ,
        next();
      }
    }
    next(); // eat .
    body = args.length === 1 ? args[0] : new Conjunction(args);
    return new Rule(head, body);
  };
  next(); // start the tokens iterator
  return {
    parseRules: function(rules = []) {
      while (!done) {
        // each rule gets its own scope for variables
        scope = {};
        rules.push(parseRule());
      }
      return rules;
    },
    parseTerm: function(scope = {}) {
      return parseTerm();
    }
  };
};

example = function() {
  var db, goal, goalText, item, p, ref, results, rules;
  p = "exists(A, list(A, _, _, _, _)).\nexists(A, list(_, A, _, _, _)).\nexists(A, list(_, _, A, _, _)).\nexists(A, list(_, _, _, A, _)).\nexists(A, list(_, _, _, _, A)).\n\nrightOf(R, L, list(L, R, _, _, _)).\nrightOf(R, L, list(_, L, R, _, _)).\nrightOf(R, L, list(_, _, L, R, _)).\nrightOf(R, L, list(_, _, _, L, R)).\n\nmiddle(A, list(_, _, A, _, _)).\n\nfirst(A, list(A, _, _, _, _)).\n\nnextTo(A, B, list(B, A, _, _, _)).\nnextTo(A, B, list(_, B, A, _, _)).\nnextTo(A, B, list(_, _, B, A, _)).\nnextTo(A, B, list(_, _, _, B, A)).\nnextTo(A, B, list(A, B, _, _, _)).\nnextTo(A, B, list(_, A, B, _, _)).\nnextTo(A, B, list(_, _, A, B, _)).\nnextTo(A, B, list(_, _, _, A, B)).\n\npuzzle(Houses) :-\n  exists(house(red, english, _, _, _), Houses),\n  exists(house(_, spaniard, _, _, dog), Houses),\n  exists(house(green, _, coffee, _, _), Houses),\n  exists(house(_, ukrainian, tea, _, _), Houses),\n  rightOf(house(green, _, _, _, _), house(ivory, _, _, _, _), Houses),\n  exists(house(_, _, _, oldgold, snails), Houses),\n  exists(house(yellow, _, _, kools, _), Houses),\n  middle(house(_, _, milk, _, _), Houses),\n  first(house(_, norwegian, _, _, _), Houses),\n  nextTo(house(_, _, _, chesterfield, _), house(_, _, _, _, fox), Houses),\n  nextTo(house(_, _, _, kools, _),house(_, _, _, _, horse), Houses),\n  exists(house(_, _, orangejuice, luckystike, _), Houses),\n  exists(house(_, japanese, _, parliament, _), Houses),\n  nextTo(house(_, norwegian, _, _, _), house(blue, _, _, _, _), Houses),\n  exists(house(_, _, water, _, _), Houses),\n  exists(house(_, _, _, _, zebra), Houses).\n\nsolution(WaterDrinker, ZebraOwner) :-\n  puzzle(Houses),\n  exists(house(_, WaterDrinker, water, _, _), Houses),\n  exists(house(_, ZebraOwner, _, _, zebra), Houses).";
  rules = parser(lexer(p)).parseRules();
  console.log(`\ninsert ${rules.length}-rules into DB.`);
  db = new Database(rules);
  goalText = 'solution( WaterDrinker, ZebraOwner )';
  goal = parser(lexer(goalText)).parseTerm();
  ref = db.query(goal);
  results = [];
  for (item of ref) {
    results.push(console.log(`\n${item}`));
  }
  return results;
};

module.exports = {
  parser: parser,
  lexer: lexer,
  solve: example
};

//# sourceMappingURL=parser.js.map
