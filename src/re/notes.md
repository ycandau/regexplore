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
