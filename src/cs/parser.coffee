###
source: https://curiosity-driven.org/prolog-interpreter
###
{ 
  Term
  Rule
  Variable
  Conjunction
  Database
} = require './interpreter'


lexer = ( text ) ->
  tokenRegexp = /[A-Za-z_]+|:\-|[()\.,]/g
  # match
  while ( (match = tokenRegexp.exec text ) isnt null)
    yield match[0]


parser = ( tokens ) ->
  done = no; current = no; scope = no
  
  next = -> { value: current, done } = tokens.next()


  parseAtom = ->
    name = current
    unless /^[A-Za-z_]+$/.test name
      msg = 'Bad atom name: ' + name
      throw new SyntaxError msg
    next()
    name


  parseTerm = ->
    
    if current is '('
      next() # eat (
      
      args = []
      until current is ')'
        args.push parseTerm()
        unless current in [ ',', ')' ]
          msg = 'Expected , or ) in term but got ' + current
          throw new SyntaxError msg
  
        next() if current is ',' # eat ,
      next() # eat )
      return new Conjunction args
      
    functor = parseAtom()
    
    if /^[A-Z_][A-Za-z_]*$/.test functor
      
      return new Variable('_') if functor is '_'
      # variable X in the same scope should point
      # to the same object
      variable = scope[functor]
      unless variable
        variable = scope[functor] = new Variable functor

      return variable
      
    if current isnt '(' then return new Term functor
        
    next() # eat (
    
    args = []
    until current is ')'
    
      args.push parseTerm()
      
      unless current in [ ',', ')' ]
        msg = 'Expected , or ) in term but got ' + current
        throw new SyntaxError msg
        
      next() if current is ',' # eat ,
    next() #  eat )
    
    return new Term functor, args


  parseRule = ->
    head = parseTerm()
    
    if current is '.'
      next() # eat .
      return new Rule head, Term.TRUE
    
    unless current is ':-'
      msg = 'Expected :- in rule but got ' + current
      throw new SyntaxError msg
    
    next() # eat :-
    
    args = []
    until current is '.'
      args.push parseTerm()
      
      unless current in [ ',', '.' ]
        msg = 'Expected , or . in term but got ' + current
        throw new SyntaxError msg
        
      next() if current is ',' # eat ,
    next() # eat .
    
    body = if args.length == 1 then args[0] else new Conjunction args
    
    return new Rule head, body

  next() # start the tokens iterator

  return
    parseRules: ( rules=[] ) ->
      until done
        # each rule gets its own scope for variables
        scope = {}
        rules.push parseRule()
      rules
    parseTerm: ( scope={} ) -> parseTerm()


example = ->
  
  puzzle = """
    exists(A, list(A, _, _, _, _)).
    exists(A, list(_, A, _, _, _)).
    exists(A, list(_, _, A, _, _)).
    exists(A, list(_, _, _, A, _)).
    exists(A, list(_, _, _, _, A)).

    rightOf(R, L, list(L, R, _, _, _)).
    rightOf(R, L, list(_, L, R, _, _)).
    rightOf(R, L, list(_, _, L, R, _)).
    rightOf(R, L, list(_, _, _, L, R)).

    middle(A, list(_, _, A, _, _)).

    first(A, list(A, _, _, _, _)).

    nextTo(A, B, list(B, A, _, _, _)).
    nextTo(A, B, list(_, B, A, _, _)).
    nextTo(A, B, list(_, _, B, A, _)).
    nextTo(A, B, list(_, _, _, B, A)).
    nextTo(A, B, list(A, B, _, _, _)).
    nextTo(A, B, list(_, A, B, _, _)).
    nextTo(A, B, list(_, _, A, B, _)).
    nextTo(A, B, list(_, _, _, A, B)).

    puzzle(Houses) :-
      exists(house(red, english, _, _, _), Houses),
      exists(house(_, spaniard, _, _, dog), Houses),
      exists(house(green, _, coffee, _, _), Houses),
      exists(house(_, ukrainian, tea, _, _), Houses),
      rightOf(house(green, _, _, _, _), house(ivory, _, _, _, _), Houses),
      exists(house(_, _, _, oldgold, snails), Houses),
      exists(house(yellow, _, _, kools, _), Houses),
      middle(house(_, _, milk, _, _), Houses),
      first(house(_, norwegian, _, _, _), Houses),
      nextTo(house(_, _, _, chesterfield, _), house(_, _, _, _, fox), Houses),
      nextTo(house(_, _, _, kools, _),house(_, _, _, _, horse), Houses),
      exists(house(_, _, orangejuice, luckystike, _), Houses),
      exists(house(_, japanese, _, parliament, _), Houses),
      nextTo(house(_, norwegian, _, _, _), house(blue, _, _, _, _), Houses),
      exists(house(_, _, water, _, _), Houses),
      exists(house(_, _, _, _, zebra), Houses).

    solution(WaterDrinker, ZebraOwner) :-
      puzzle(Houses),
      exists(house(_, WaterDrinker, water, _, _), Houses),
      exists(house(_, ZebraOwner, _, _, zebra), Houses).
  """
  
  rules = parser( lexer puzzle ).parseRules()
  console.log "\ninsert #{rules.length}-rules into DB."
  db    = new Database rules
  goal  = parser( 
    lexer 'solution( WaterDrinker, ZebraOwner )'
  ).parseTerm()
  
  for item from db.query goal
    console.log "\n#{item}"



module.exports =
  parser : parser
  lexer  : lexer
  solve  : example
