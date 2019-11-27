{
  Conjunction, Rule,
  Term, Variable
} = require './interpreter'
{ runtime: { subclass, Stack, OMeta }
} = require 'metacoffee'

flatten = ( arr, n=[] ) ->
  arr.map (el) ->
    if Array.isArray el
      el.map (sa) -> n.push sa 
    else
      n.push el
  n

mk =
  Variable : ( name ) ->
    return new Variable('_') if name is '_'
    
    variable = scope[name]
    unless variable
      variable = scope[name] = new Variable name
      
    variable


  Term     : ( functor, args=[] ) ->
    args = flatten args
    
    args = args.map (el) ->
      if 'string' is typeof el then new Term el
      else el

    new Term functor, args


  Rule     : ( head, args=[] ) ->
    args = flatten args
    body = if args.length == 1 then args[0] else new Conjunction args
    
    new Rule head, body

scope = {}
clearScope = -> root.scope = {}


ometa LittleProlog

  expression  = ( rule | term ):expr '.'                 -> expr
  rule        = term:head token(':-') conjunction:body   -> mk.Rule  head, body
              | term:head                                -> new Rule head, Term.TRUE
  term        = functor:func '(' argument+:params ')'    -> mk.Term  func, params
  conjunction = term:head ( ',' term )*:terms            -> [ head ].concat terms
  argument    = ( variable | term | fact  ):param ','?   -> param
  variable    = ( VarName  | '_'  | upper ):name         -> mk.Variable name
  fact        = functor
  VarName     = upper:first bodyChars:body               -> first + body
  functor     = lower:first bodyChars:body               -> first + body
  bodyChars   = ( letter | '_' )+:arr                    -> arr.join ''
