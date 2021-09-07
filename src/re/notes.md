Todo:

- history
- logbox
- quantifier display
- center graph vertically
- unique keys for lists
- could put back quantifier nodes and just not display

  // const parser = new Parser('a?bc?|a?bc?|a?bc?');
  // const parser = new Parser('a*bc*|a*bc*|a*bc*');
  // const parser = new Parser('a+bc+|a+bc+|a+bc+');
  // const parser = new Parser('(a)?|b?|(c)?|d?');
  // const parser = new Parser('(a)_|b_|(c)_|d_');
  // const parser = new Parser('\\?.?(a)?|\\_\\w_(\\d)*|\\+[a-z]+([0-9])+');
  // const parser = new Parser('(aaaaa|a*b|ab|a?aaa)c');
  // a(bffff|ca(a|a|a|a)a)d

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
