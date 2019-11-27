###
source: https://curiosity-driven.org/prolog-interpreter
###

mergeBindings = ( bindings1, bindings2 ) ->
  return if ( not bindings1 ) or ( not bindings2 )

  conflict = no
  bindings = new Map()
  
  bindings1.forEach (value, variable) ->
    bindings.set variable, value

  bindings2.forEach (value, variable) ->
    other = bindings.get variable
    if other
      sub = other.match value
      unless sub
        conflict = yes
      else
        sub.forEach (value, variable) ->
          bindings.set variable, value
    else
      bindings.set variable, value

  return if conflict
  bindings

zip = ( arrays ) ->
  arrays[0].map ( el, idx ) ->
    arrays.map ( arr ) ->
      arr[ idx ]



class Variable
  constructor : ( @name ) ->
  toString    : -> "Var(#{@name})"
  
  match       : ( other, bindings=new Map() ) ->
    bindings.set( @, other ) if @ isnt other
    bindings
    
  substitute  : ( bindings ) ->
    return @ unless bindings.has @
    #
    # if value is a compound term then substitute
    # variables inside it too
    #
    bindings.get @
      .substitute bindings



class Term
  constructor : ( @functor, @args=[] ) ->
  toString    : ->
    return @functor if @args.length == 0
    @functor + " ( #{@args.join ', '} )\n"
  
  query       : ( db ) -> yield from db.query @
  
  match       : ( other ) ->
    return other.match( @ ) unless other instanceof Term

    return if ( @functor isnt other.functor ) or ( @args.length isnt other.args.length )

    zip( [ @args, other.args] ).map( (args) ->
      args[0].match args[1]
    ).reduce mergeBindings, new Map()


  substitute  : ( bindings ) ->
    new Term @functor, @args.map ( arg ) ->
      arg.substitute bindings

Term.TRUE = new Term 'true'
Term.TRUE.substitute = -> @
Term.TRUE.query      = -> yield @


class Conjunction extends Term
  constructor : ( @args ) -> super()
  toString    : -> @args.join ', '
  
  query       : ( db ) ->
    
    self = @
    solutions = ( index, bindings ) ->
      arg = self.args[ index ]
      unless arg
        yield self.substitute( bindings )
      else
        for item from db.query arg.substitute( bindings )
          unified = mergeBindings arg.match( item ), bindings
          if unified
            yield from solutions index + 1, unified
            
    yield from solutions 0, new Map()

    
  substitute  : ( bindings ) ->
    new Conjunction @args.map ( arg ) ->
      arg.substitute bindings



class Rule
  constructor : ( @head, @body ) ->
  toString    : -> "#{@head} :- #{@body}"



class Database
  constructor : ( @rules ) ->
  toString    : -> @rules.join('.\n') + '.'
  size        : -> @rules.length
  
  query       : ( goal ) ->
    
    for rule in @rules
      
      match = rule.head.match goal
      continue unless match

      head = rule.head.substitute match
      body = rule.body.substitute match
      
      for item from body.query @
        yield head.substitute body.match( item )



module.exports =
  Term        : Term
  Rule        : Rule
  Variable    : Variable
  Conjunction : Conjunction
  Database    : Database
