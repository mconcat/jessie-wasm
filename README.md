# Jessie-Wasm

Compiler from Jessie, a secure subset of Javascript, to Wasm, a fast and secure virtual machine.

## Goal

- Use Jessie as a frontend language for wasm contracting
- If a Jessie code successfully runs on wasm, it should return the same result on the ts-node too, without modification.

## Codeflow

### Parser

Jessie code goes to parser.

- `tessie_*.ts`: parses type annotations and declarations
- `jessie_*.ts`: parses top level declarations, assignments, statements, destructuring patters
- `justin_*.ts`: parses arithmetic, property access, function call operations
- `json_*.ts`: parses literals, records and arrays

Takes `string`, returns `tessie.Expr[]`

### Jessie-zero

Sugars are removed in this process using expression type removal and reduction. Also, types are inferred. 

- `ast.ts`: jessie-zero ast
- `typing.ts`: jessie-zero type ast
- `inference.ts`: type inference 
- `runtype.ts`: runtime type information generation

Takes `tessie.Expr[]`, returns `ast.TypedExpr[]`

### IR

IR that is almost 1-to-1 corresponding to Binaryen IR. Meant to be support other frontend langs too.

Takes `ast.TypedExpr[]`, returns `JessieIR[]`

### Compiler

Takes `JessieIR[]`, returns 

### Runtime

Runtime support for global objects like Array, Map, ByteBuffer, etc.