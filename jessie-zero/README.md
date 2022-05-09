# Jessie-Zero

Sugar-free Jessie(with types!)

## Sugar-free

## Types

### Syntax

- Literal: `string`, `boolean`, `number`, `bigint`, `null`, `undefined`
- Object: `{fieldname: typename}`
- Array: `typename[]`
- Tuple: `[typename, typename]`
- Optional: `typename?`, equivalent to `typename|undefined`
- Union: 
- Function: `(typename) => typename`
- Generic: `typename<typename>`

### Declaration

- type: type synonym
- interface: shorthand for Object type literal

### Semantics

// TODO: look typescript typing/inference rule

if/then/else => union
numeric field access => array
string/var field access => object
function call => 