## Todo

- play mode
- hover events
- center graph vertically

## For Later

- unique keys for lists
- could put back quantifier nodes and just not display

'a?bc?|a?bc?|a?bc?'
'a*bc*|a*bc*|a*bc*'
'a+bc+|a+bc+|a+bc+'
'(a)?|b?|(c)?|d?'
'(a)_|b_|(c)_|d_'
'\\?.?(a)?|\\_\\w_(\\d)*|\\+[a-z]+([0-9])+'
'(aaaaa|a*b|ab|a?aaa)c'
'(bffff|ca(a|a|a|a)a)d'

Colors:

- red
- green
- blue
- yellow
- orange
- purple

Matchers:

- wildcard: red
- charClass: purple
- charLiteral: green
- escapedChar: blue

Brackets:

- literal: green
- negate: yellow
- range: blue

Operators:

- alternate: yellow
- repeat: orange
- parentheses: purple

Token properties:

- pos: <number> index in the input string
- range: <[number, number]> pair of indexes for brackets and parentheses
- positions: <[number...]> list of indexes for alternation
- operands: <[number...]> one or two pairs of indexes

BracketClass:

- label = [...]
- type = bracketClass
- range
- negate
- matches
- match

Alternation:

- label: '|'
- type: '|'
- pos: 2
- positions: [...]
- arity: 2...
- operands
