###  A little Prolog-Parser
  
  
This is a rewrite of the excellent generator-driven Prolog-Parser [blog & discussion](https://curiosity-driven.org/prolog-interpreter ) by github-user __curiosity-driven__ [1].
The Parser and the Interpreter are rewritten in CoffeeScript.
A second parser was done using Michal Srb's _Meta-Coffee_ [2]. Meta-Coffee is a implementation of Alexandro Warth & Ian Piumarta OMeta-Project [3]. It uses CoffeeScript as a host-language. So that one can write _Semantic Actions_ [4] in CS.
The hand-written Prolog-Parser is included in `src/js/parser.js`. As straight-forward as it is, i believe using the grammar-approach one might find it to be easier to extend the parser in the future.
  
This grammar drives the final-version of the Prolog-Parser :
  
```coffee
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
```  
  
  
##### install 
```
git clone 
```
  
##### build & run
  
```
# to build source & grammar
cake all
# to rebuild the grammar
cake grammar
  
# then 
node ./index.js
# or 
npm run demo
```
  
This will run the [zebra-puzzle](https://en.wikipedia.org/wiki/Zebra_Puzzle ). It is included in all three parser-implementations.
  
--
[1] [Prolog-Interpreter on github](https://github.com/curiosity-driven/prolog-interpreter )
[2] [Meta-Coffee on github](https://github.com/xixixao/meta-coffee )
[3] [OMeta on Wikipedia](https://en.wikipedia.org/wiki/OMeta )
[4] _OMeta: an Object-Oriented Language for Pattern Matching ∗_ [paper/PDF, via Wikipedia](http://tinlizzie.org/~awarth/papers/dls07.pdf )
  
  
-- related
1. A successor to OMeta/JS [Ohm-Project on github](https://github.com/harc/ohm )
  
